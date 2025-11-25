import type { Request, Response } from "express";
import { convertToModelMessages, generateObject, streamText } from "ai"
import { google } from "@ai-sdk/google"
import { getVectorStore } from "../../utils/vectorstore.js";
import { z } from 'zod'
import { getPdfContent } from "../../utils/pdfloader.js";
import { getRootDirname } from "../../utils/paths.js";
import { extractTextFromContent } from "../../utils/index.js";
import { getSystemPrompt } from "../../utils/prompts.js";
import { Document } from "@langchain/core/documents";

async function queryTranslation(query: string, context: string): Promise<string[]> {
  const queries = await generateObject({
    model: google("gemini-2.5-flash"),
    messages: [{ role: "user", content: query }],
    system: `You are an helpful AI assistant.Your task is to generate five
    different versions of the given user question to retrieve relevant documents from a vector
    database. By generating multiple perspectives on the user question, your goal is to help
    the user overcome some of the limitations of the distance-based similarity search.
    The first query should be the user's original query with any grammar mistakes corrected.
    
    Context (first page of the PDF file): ${context}
    `,
    schema: z.object({
      queries: z.array(z.string()),
    }),
  });
  return queries.object.queries;
}

function reciprocalRankFusion(ranks: Document[][], k = 60) {
  const scores = new Map<string, { score: number, content: string }>();

  ranks.forEach(list => {
    list.forEach((doc, idx) => {
      const rank = idx + 1;
      const score = 1 / (k + rank);
      scores.set(doc.id ?? "", { score: (scores.get(doc.id ?? "")?.score ?? 0) + score, content: doc.pageContent ?? "" });
    });
  });

  return Array.from(scores.entries())
    .map(([id, { score, content }]) => ({ id, score, content }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}


export async function multiQueryRagChatController(req: Request, res: Response) {
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

    const docs = await getPdfContent(`${getRootDirname()}/uploads/${fileName}`);

    const queries = await queryTranslation(prompt, docs[0]?.pageContent || "");
    const vectorStore = await getVectorStore(fileName);
    const results: Document[][] = [];

    for (const query of queries) {
      const result = await vectorStore.similaritySearch(query);
      results.push(result);
    }

    const fusedRanks = reciprocalRankFusion(results);

    const responseStream = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(fusedRanks.map(({ content }) => content).join("\n\n"), docs[0]?.pageContent || ""),
      messages: convertToModelMessages(messages),
    })
    responseStream.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Error in multiQueryRagChatController", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}