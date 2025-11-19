import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "qwen3-embedding:4b";
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";

export function createEmbedding(): OllamaEmbeddings {
  return new OllamaEmbeddings({ model: EMBEDDING_MODEL });
}

export async function getVectorStore(fileName: string): Promise<QdrantVectorStore> {
  const embedding = createEmbedding();
  return await QdrantVectorStore.fromExistingCollection(embedding, {
    url: QDRANT_URL,
    collectionName: fileName,
  });
}

