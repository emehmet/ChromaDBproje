// backend/server.js
import express from 'express';
import { ChromaClient } from 'chromadb';
import cors from 'cors';
import 'dotenv/config';
import { ChromaEmbeddingFunction } from '../src/Utils/embedding.mjs';
const app = express();
const port = 5001;

app.use(express.json());
app.use(cors());

const client = new ChromaClient({
  path: process.env.CHROMADB || 'http://localhost:8000',
});
const embeddingFunction = new ChromaEmbeddingFunction({
  apiKey: process.env.HUGGINGFACE_API_KEY,
});
// app.get("/api/collection/:name", async (req, res) => {
//   try {
//     const { name } = req.params;
//     const collection = await client.getOrCreateCollection({
//       name,
//       embeddingFunction: embeddingFunction,
//     });
//     res.json(collection);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/api/collection/:name/documents", async (req, res) => {
//   try {
//     const { name } = req.params;
//     const { documents, ids } = req.body;
//     const collection = await client.getOrCreateCollection({ name });
//     await collection.upsert({ documents, ids });
//     res.status(201).send("Documents added");
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.post('/api/collection/:name/query', async (req, res) => {
  try {
    const { name } = req.params;
    const { queryTexts, nResults } = req.body;
    const collection = await client.getOrCreateCollection({
      name,
      embeddingFunction: embeddingFunction,
    });
    const results = await collection.query({ queryTexts, nResults });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
