import express from "express";
import "dotenv/config"
import cors from 'cors'
import fs from 'fs'
import { getPdfContent } from "./utils/pdfloader.js";
import path from 'path'
import { fileURLToPath } from "url";
import type { PageTextResult } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

async function textSplitter(content: PageTextResult[]) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  })
  const chunks = await textSplitter.splitText(content.map((page) => page.text).join("\n\n"))
  return [chunks[0], chunks[1]];
}

app.get("/", async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "..", 'pdf', 'attention_is_all_you_need.pdf');
    // const pdfPath = path.join(__dirname, "..", 'pdf', 'somatosensory.pdf');
    const content = await getPdfContent(pdfPath);
    res.json({ message: await textSplitter(content) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading PDF", error: error });
  }
});

app.post("/upload", async (req, res) => {
  const { file } = req.body;
  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }
  const fileBuffer = Buffer.from(file, "base64");
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fileStream = fs.createWriteStream(`uploads/${fileName}`);
  fileStream.write(fileBuffer);
  fileStream.end();
  const content = await getPdfContent(fileStream.path as string)
  console.log("content", content);

  res.json({ message: "File uploaded successfully" });
})

app.listen(8000, () => {
  console.log("Server is running on port 8000")
});