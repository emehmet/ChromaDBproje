import { ChromaClient } from "chromadb";
import fs from "fs";
import path from "path";
import { ChromaEmbeddingFunction } from "../src/Utils/embedding.mjs";

// Read the JSON data from the file
const jsonFilePath = "./data/cleaned_AKTEK İZİN PROSEDÜRÜ.json";
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Initialize the ChromaDB client
const client = new ChromaClient();

// Define the collection name
const collectionName = "test-collection-2";
const embeddingFunction = new ChromaEmbeddingFunction({
  apiKey: "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",
});
// Function to upsert documents into ChromaDB
async function upsertDocuments() {
  try {
    // await client.reset();
    // Create or get the collection
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: embeddingFunction,
    });

    // Process the JSON data
    const documents = jsonData.map((item) => item.text);

    const metadata = jsonData.map((item) => item.metadata);
    const ids = jsonData.map((item) => item.id);
    // console.log("docs", {
    //   documents: documents,
    //   metadata: metadata,
    //   ids: ids,
    // });
    // Upsert documents into the collection
    await collection.add({
      documents: documents,
      // embeddings: None,
      metadata: metadata,
      ids: ids,
    });

    console.log("Documents have been upserted successfully.");
  } catch (error) {
    console.error("Error upserting documents:", error);
  }
}

// Run the upsert function
upsertDocuments();
