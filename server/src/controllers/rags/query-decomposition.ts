import type { Request, Response } from "express";
import { convertToModelMessages, generateObject, streamText } from "ai"
import { google } from "@ai-sdk/google"
import { getVectorStore } from "../../utils/vectorstore.js";
import { z } from 'zod'
import { extractTextFromContent } from "../../utils/index.js";
import { getSystemPrompt } from "../../utils/prompts.js";
import { Document } from "@langchain/core/documents";

async function queryDecomposition(query: string): Promise<string[]> {
  const queries = await generateObject({
    model: google("gemini-2.5-flash"),
    messages: [{ role: "user", content: query }],
    system:
      `You are an assistant that performs query decomposition for a Retrieval-Augmented Generation (RAG) system. Your job is to transform a single complex user question into a small set of focused sub-questions that can each be answered independently using a vector store.

**Follow these rules:**
- If the user question is simple and only asks about one thing, return it unchanged as a single sub-question.
- If the question is complex, multi-step, or has multiple constraints (time ranges, entities, conditions, comparisons, filters), decompose it into 2–5 sub-questions.

**Each sub-question must:**
- Be self-contained and understandable without extra context.
- Focus on a single aspect (entity, time range, condition, or comparison step).
- Be phrased as something that can be answered from documents (not instructions to the system).
- Preserve all important constraints and details (dates, locations, product names, versions, metrics, etc.) from the original question.
- Do not add new assumptions or external facts that the user did not mention.
- If the user query is ambiguous, create sub-questions that clarify the ambiguity rather than guessing.

    `,
    schema: z.object({
      subQuestions: z.array(z.string()),
    }),
  });
  return queries.object.subQuestions;
}

export async function queryDecompositionRagChatController(req: Request, res: Response) {
  try {
    const { messages, fileName } = await req.body;
    if (!fileName) {
      return res.status(400).json({ message: "No file name provided" });
    }

    const data = convertToModelMessages(messages);
    const prompt = extractTextFromContent(data[data.length - 1]?.content);

    if (!prompt) {
      return res.status(400).json({ message: "No prompt found in messages" });
    }

    const queries = await queryDecomposition(prompt);
    const vectorStore = await getVectorStore(fileName);
    const results: Document[] = [];

    for (const query of queries) {
      const result = await vectorStore.similaritySearch(query);
      results.push(...result);
    }

    const uniqueResults = results.filter(
      (doc, index, self) => index === self.findIndex((d) => d.pageContent === doc.pageContent)
    );

    const responseStream = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(uniqueResults.map(({ pageContent }) => pageContent).join("\n\n")),
      messages: convertToModelMessages(messages),
    })
    responseStream.pipeTextStreamToResponse(res);

  } catch (error) {
    console.error("Error in queryDecompositionRagChatController", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}