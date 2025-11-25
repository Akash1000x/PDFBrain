import { convertToModelMessages, generateObject, streamText } from "ai";
import { extractTextFromContent } from "../../utils/index.js";
import type { Request, Response } from "express";
import { getVectorStore } from "../../utils/vectorstore.js";
import { google } from "@ai-sdk/google";
import { getSystemPrompt } from "../../utils/prompts.js";
import z from "zod";


async function queryRewriting(query: string): Promise<string> {
  const rewrittenQuery = await generateObject({
    model: google("gemini-2.5-flash"),
    messages: [{ role: "user", content: query }],
    system: `You are an AI assistant tasked with reformulating user queries to improve retrieval in a RAG system. 
             Given the original query, rewrite it to be more specific, detailed, and likely to retrieve relevant information.
    `,
    schema: z.object({
      rewrittenQuery: z.string(),
    }),
  });
  return rewrittenQuery.object.rewrittenQuery;
}


// Query Rewriting RAG
export async function queryRewritingRagChatController(req: Request, res: Response) {
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

    const rewrittenQuery = await queryRewriting(prompt);

    const vectorStore = await getVectorStore(fileName);
    const results = await vectorStore.similaritySearch(rewrittenQuery);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(results.map((result) => result.pageContent).join("\n\n")),
      messages: convertToModelMessages(messages),
    })
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Error in simpleRagChatController", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}