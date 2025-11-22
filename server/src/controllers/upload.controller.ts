import { getPdfContent } from "../utils/pdfloader.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "../utils/vectorstore.js";
import type { Request, Response } from "express";
import type { Document } from "@langchain/core/documents";


async function textSplitter(content: Document[]) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  })

  const chunks = await textSplitter.splitDocuments(content);

  return chunks;
}


export async function uploadPdfController(req: Request, res: Response) {
  const filePath = req.file?.path;
  const fileName = req.file?.filename
  if (!filePath || !fileName) {
    return res.status(400).json({ message: "No file provided" });
  }

  const docs = await getPdfContent(filePath);
  const chunks = await textSplitter(docs);

  const vectorStore = await getVectorStore(fileName);

  await vectorStore.addDocuments(
    chunks.map(({ pageContent, metadata }) => ({
      pageContent,
      metadata,
    }))
  );

  res.json({ message: "File uploaded successfully", fileName });
}