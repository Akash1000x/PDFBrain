import type { Request, Response } from "express";
import { convertToModelMessages, streamText } from "ai"
import { google } from "@ai-sdk/google"
import { getVectorStore } from "../utils/vectorstore.js";

function getSystemPrompt(context: string) {
  return `
  You are a helpful assistant that can answer user questions. You are given a context of a pdf file and you are to answer the user's question based on the context. You are to answer the question in the same language as the question.
  Context: ${context}
  `
}

export async function chatController(req: Request, res: Response) {
  const { messages, fileName } = await req.body;
  if (!fileName) {
    return res.status(400).json({ message: "No file name provided" });
  }

  const data = convertToModelMessages(messages);
  const prompt = data[data.length - 1]?.content[0]?.text;
  console.log(prompt);

  const vectorStore = await getVectorStore(fileName);
  const results = await vectorStore.similaritySearch(prompt);
  console.log(results);

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: getSystemPrompt(results.map((result) => result.pageContent).join("\n\n")),
    messages: convertToModelMessages(messages),
  })
  // const result = streamText({
  //   model: google("gemini-2.5-flash"),
  //   system: "You are a helpful assistant that can answer user questions.",
  //   messages: convertToModelMessages(messages),
  // })
  result.pipeTextStreamToResponse(res);
}