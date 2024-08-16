
import express, { Request, Response } from "express";

import cors from "cors";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaEmbeddingFunction } from "../src/Utils/embedding";

// Initialize the Express app
const app = express();
const port = 5000;

// Middleware setup
app.use(express.json());
app.use(cors());


const embeddingFunction = new ChromaEmbeddingFunction(
  { apiKey: "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" }
);

const vectorStore = new Chroma(embeddingFunction, {
  collectionName: "test-collection", // This will create or use the collection with this name
  url: "http://localhost:8000",
});



app.post('/add-documents', async (req, res) => {
  const { documents } = req.body; // Assuming documents is an array of text strings

  try {
    await vectorStore.addDocuments(documents);
    res.status(200).send('Documents added to vector store successfully.');
  } catch (error) {
    res.status(500).send(`Error adding documents: ${(error as Error).message}`);
  }
});

// Example endpoint for querying the vector store
app.post('/query', async (req, res) => {
  console.log('Query endpoint hit!'); // This should log whenever the endpoint is triggered
  
  const { query, nResults } = req.body;
  console.log("Query received:",query)

  try {
    
    

    const results = await vectorStore.similaritySearchWithScore(query, nResults);
    console.log('Query results:', results);
    res.status(200).json({ documents: results });
  } catch (error) {
    console.error('Error querying vector store:', (error as Error).message);
    res.status(500).send(`Error querying vector store: ${(error as Error).message}`);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
