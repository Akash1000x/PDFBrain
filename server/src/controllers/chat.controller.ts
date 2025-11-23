import type { Request, Response } from "express";
import { convertToModelMessages, generateObject, generateText, streamText } from "ai"
import { google } from "@ai-sdk/google"
import { getVectorStore } from "../utils/vectorstore.js";
import { z } from 'zod'
import { getPdfContent } from "../utils/pdfloader.js";
import { getRootDirname } from "../utils/paths.js";

function getSystemPrompt(context: string, firstPageContent: string) {
  return `
  You are a helpful assistant named "PDFBrain" that answers user questions based on the provided PDF file context. 
  Always end with a friendly and a follow-up question to encourage the user to ask more questions. use emojis to make the conversation more engaging.
  if the user's question is not related to the PDF file, say "I'm sorry, I can only answer questions related to the PDF file.
  Please answer the question in the same language as the user's question.

  First page content of the PDF file: ${firstPageContent}

  Context related to the user query : ${context}
  
  `
}

function extractTextFromContent(content: any): string | undefined {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content) && content.length > 0) {
    const firstPart = content[0];
    if (typeof firstPart === 'string') {
      return firstPart;
    }
    if (firstPart && typeof firstPart === 'object' && 'text' in firstPart) {
      return firstPart.text;
    }
  }
  return undefined;
}


export async function simpleRagChatController(req: Request, res: Response) {
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

    const vectorStore = await getVectorStore(fileName);
    const results = await vectorStore.similaritySearch(prompt);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(results.map((result) => result.pageContent).join("\n\n"), docs[0]?.pageContent || ""),
      messages: convertToModelMessages(messages),
    })
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Error in simpleRagChatController", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



async function queryTranslation(query: string, context: string): Promise<string[]> {
  const queries = await generateObject({
    model: google("gemini-2.5-flash"),
    messages: [{ role: "user", content: query }],
    system: `You are a helpful assistant that generates 5 different queries similar to the user's query for searching the vector store.
    The first query should be the user's original query with any grammar mistakes corrected.
    Provide all queries in the same language as the user's query.
    
    Context (first page of the PDF file): ${context}
    `,
    schema: z.object({
      queries: z.array(z.string()),
    }),
  });
  return queries.object.queries;
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
    const results = [];

    for (const query of queries) {
      const result = await vectorStore.similaritySearch(query);
      results.push(...result);
    }


    const locCounts: { [key: string]: { count: number, content: string } } = {};

    for (const result of results) {
      const loc = result.metadata.loc;
      if (loc && loc.pageNumber && loc.lines) {
        const locKey = `${loc.pageNumber}-${loc.lines.from}-${loc.lines.to}`;
        locCounts[locKey] = { count: (locCounts[locKey]?.count || 0) + 1, content: result.pageContent };
      }
    }

    const top5Locations = Object.entries(locCounts)
      .map(([key, value]) => {
        const [pageNumber, from, to] = key.split('-');
        return {
          pageNumber: parseInt(pageNumber as string),
          lines: { from: parseInt(from as string), to: parseInt(to as string) },
          count: value.count,
          content: value.content || ''
        };
      })
      .sort((a, b) => b.count - a.count as number)
      .slice(0, 5);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(top5Locations.map((result) => result.content).join("\n\n"), docs[0]?.pageContent || ""),
      messages: convertToModelMessages(messages),
    })
    // const result = streamText({
    //   model: google("gemini-2.5-flash"),
    //   system: "You are a helpful assistant that can answer user questions. give answer in very short",
    //   messages: convertToModelMessages(messages),
    // })
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("Error in multiQueryRagChatController", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}