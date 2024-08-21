import fs from 'fs';
import path from 'path';
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaEmbeddingFunction } from "../src/Utils/embedding";
import type { Document } from "@langchain/core/documents";

// Initialize the embedding function and vector store
const embeddingFunction = new ChromaEmbeddingFunction({ apiKey: "" });
const vectorStore = new Chroma(embeddingFunction, { collectionName: "test-collection", url: "http://localhost:8000" });

// Path to the filteredPdfs folder
const filteredPdfsFolderPath = path.join(__dirname, '../filteredPdfs');

// Read and process each JSON file in the folder
async function processAndAddDocuments() {
    try {
        const files = fs.readdirSync(filteredPdfsFolderPath);
        
        for (const file of files) {
            const jsonFilePath = path.join(filteredPdfsFolderPath, file);
            const rawData = fs.readFileSync(jsonFilePath, 'utf8');
            const jsonData: { text: string, metadata: any, id: string }[] = JSON.parse(rawData);

            const documents: Document[] = jsonData.map((doc: any) => ({
                pageContent: doc.text,
                metadata: doc.metadata,
                ids: doc.id
            }));

            // Add the documents to the vector store
            await vectorStore.addDocuments(documents);
            console.log(`Documents from ${file} added successfully.`);
        }

    } catch (error) {
        console.error("Error processing and adding documents:", (error as Error).message);
    }
}

processAndAddDocuments();
