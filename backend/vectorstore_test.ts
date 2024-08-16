import fs from 'fs';
import path from 'path';
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaEmbeddingFunction } from "../src/Utils/embedding";
import type { Document } from "@langchain/core/documents";

// Initialize the embedding function and vector store
const embeddingFunction = new ChromaEmbeddingFunction({ apiKey: "" });
const vectorStore = new Chroma(embeddingFunction, { collectionName: "test-collection", url: "http://localhost:8000" });

// Path to the JSON file
const jsonFilePath = path.join(__dirname, '../data/cleaned_AKTEK İZİN PROSEDÜRÜ.json');

// Read and parse the JSON file
const rawData = fs.readFileSync(jsonFilePath, 'utf8');
const jsonData = JSON.parse(rawData);

// Filter out items with type "picture"
const filteredDocuments = jsonData.filter((doc: any) => doc.metadata.type !== "picture");

// Convert filtered data to the format expected by vector store
const documents: Document[] = filteredDocuments.map((doc: any) => ({
    pageContent: doc.text,
    metadata: doc.metadata
}));

// Add the documents to the vector store
async function addDocumentsToVectorStore() {
    try {
        await vectorStore.addDocuments(documents);
        console.log("Documents added successfully.");
    } catch (error) {
        console.error("Error adding documents:", (error as Error).message);
    }
}

addDocumentsToVectorStore();
