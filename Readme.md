# PDFBrain

A powerful Retrieval-Augmented Generation (RAG) system for querying PDF documents using multiple advanced RAG approaches. PDFBrain enables intelligent document Q&A by combining vector search with large language models, powered by Vercel AI SDK.


https://github.com/user-attachments/assets/daf86271-07a7-4b7a-bd5a-3ebf30d4ff6d


## 🚀 Features

- **PDF Document Upload**: Upload and process PDF files for intelligent querying
- **Three RAG Approaches**: Choose from different retrieval strategies optimized for various query types
  - **Simple RAG with Query Rewriting**: Reformulates queries for better retrieval accuracy
  - **Multi-Query RAG**: Generates multiple query variations and uses Reciprocal Rank Fusion for improved results
  - **Query Decomposition**: Breaks down complex queries into focused sub-questions
- **Streaming Responses**: Real-time streaming chat interface using Vercel AI SDK
- **Vector Search**: Powered by Qdrant vector database for efficient similarity search
- **Modern UI**: Beautiful, responsive Next.js interface with markdown rendering

## 🏗️ Architecture

PDFBrain consists of two main components:

- **Client**: Next.js 16 application with React 19, using Vercel AI SDK (`@ai-sdk/react`) for streaming chat
- **Server**: Express.js backend with TypeScript, integrating LangChain for document processing and vector operations

### RAG Approaches

#### 1. Simple RAG with Query Rewriting

- **How it works**: The user query is first rewritten by an LLM to be more specific and detailed, improving retrieval accuracy
- **Best for**: Simple queries that need refinement, ambiguous questions
- **Process**:
  1. User query → LLM rewrites query
  2. Rewritten query → Vector search
  3. Retrieved documents → LLM generates answer

#### 2. Multi-Query RAG

- **How it works**: Generates 5 different variations of the user query, performs vector search for each, then uses Reciprocal Rank Fusion (RRF) to combine and rank results
- **Best for**: Overcoming limitations of distance-based similarity search, improving recall
- **Process**:
  1. User query + PDF context → Generate 5 query variations
  2. Each variation → Vector search
  3. Results → Reciprocal Rank Fusion
  4. Top-ranked documents → LLM generates answer

#### 3. Query Decomposition

- **How it works**: Breaks complex queries into 2-5 focused sub-questions, searches for each independently, then combines unique results
- **Best for**: Complex, multi-step questions with multiple constraints or comparisons
- **Process**:
  1. Complex query → Decompose into sub-questions
  2. Each sub-question → Vector search
  3. Combine and deduplicate results
  4. Unique documents → LLM generates answer

## 🛠️ Tech Stack

### Client

- **Framework**: Next.js 16
- **React**: 19.2.0
- **AI SDK**: Vercel AI SDK (`ai`, `@ai-sdk/react`)
- **UI**: Shadcn UI, Tailwind CSS
- **State Management**: Zustand
- **Markdown**: react-markdown with syntax highlighting

### Server

- **Runtime**: Node.js with Express.js 5
- **Language**: TypeScript
- **AI SDK**: Vercel AI SDK (`ai`, `@ai-sdk/google`)
- **LLM**: Google Gemini 2.5 Flash
- **Vector Database**: Qdrant
- **Embeddings**: Ollama (default: qwen3-embedding:4b)
- **Document Processing**: LangChain, pdf-parse
- **File Upload**: Multer

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (or npm/yarn)
- **Qdrant** vector database (running locally or remotely)
- **Ollama** (for embeddings, with `qwen3-embedding:4b` model)
- **Google Gemini API Key** (for LLM inference)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Akash1000x/PDFBrain
   cd PDFBrain
   ```

2. **Install server dependencies**

   ```bash
   cd server
   pnpm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   pnpm install
   ```

## ⚙️ Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=8000

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333

# Embedding Model (Ollama)
EMBEDDING_MODEL=qwen3-embedding:4b
```

### Client Environment Variables

Create a `.env.local` file in the `client` directory:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚀 Running the Application

### 1. Start Qdrant (if running locally)

Using Docker:

```bash
cd server
docker-compose up -d
```

Or

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 2. Start Ollama and pull the embedding model

```bash
# Start Ollama service
ollama serve

# Pull the embedding model (in another terminal)
ollama pull qwen3-embedding:4b
```

### 3. Start the Server

```bash
cd server
pnpm dev
```

The server will run on `http://localhost:8000`

### 4. Start the Client

```bash
cd client
pnpm dev
```

The client will run on `http://localhost:3000`

## 📁 Project Structure

```
pdf-rag/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   │   ├── chat.tsx      # Main chat interface
│   │   ├── prompt-input.tsx
│   │   └── markdown.tsx
│   ├── lib/              # Utility functions
│   ├── store/            # Zustand state management
│   └── hooks/            # Custom React hooks
│
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   │   ├── rags/
│   │   │   │   ├── basic.ts              # Query rewriting RAG
│   │   │   │   ├── multi-query.ts         # Multi-query RAG
│   │   │   │   └── query-decomposition.ts # Query decomposition RAG
│   │   │   └── upload.controller.ts
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   │   ├── vectorstore.ts
│   │   │   ├── pdfloader.ts
│   │   │   └── prompts.ts
│   │   └── index.ts      # Server entry point
│   ├── uploads/          # Uploaded PDF files
│   └── pdf/              # Processed PDF data
│
└── Readme.md             # This file
```

## 💡 Usage

1. **Upload a PDF**: Use the upload interface to add a PDF document
2. **Select RAG Approach**: Choose from Simple, Multi-Query, or Query Decomposition
3. **Ask Questions**: Start chatting with your document using natural language
4. **Get Answers**: Receive streaming responses based on the selected RAG approach

## 🔍 How It Works

1. **Document Processing**: When a PDF is uploaded, it's parsed, split into chunks, and embedded using Ollama
2. **Vector Storage**: Embeddings are stored in Qdrant with the filename as the collection name
3. **Query Processing**: Based on the selected RAG approach, the query is processed (rewritten, decomposed, or varied)
4. **Retrieval**: Relevant document chunks are retrieved using vector similarity search
5. **Generation**: The LLM generates a response using the retrieved context and user query
6. **Streaming**: Responses are streamed to the client in real-time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️
