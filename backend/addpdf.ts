import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { ChromaClient } from "chromadb";
import { ChromaEmbeddingFunction } from "../src/Utils/embedding";
import { v4 as uuidv4 } from "uuid";

// File paths
const pdfFilePath = "./data/AKTEK İZİN PROSEDÜRÜ.pdf";
const jsonFilePath = "./data/AKTEK İZİN PROSEDÜRÜ.json";
const cleanedFilePath = "./data/cleaned_AKTEK İZİN PROSEDÜRÜ.json";

// Initialize ChromaDB client and embedding function
const client = new ChromaClient({ path: "http://localhost:8000" });
const embeddingFunction = new ChromaEmbeddingFunction(
  {apiKey: "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"} // Replace with your actual API key
);

interface JsonItem {
  page_number: number;
  type: string;
  text: string;
}

interface Metadata {
  [key: string]: string | number | boolean ;
}

interface ProcessedData {
  id: string;
  text: string;
  metadata: Metadata;
}

async function postFileAndProcess() {
  try {
    // Create a new FormData instance
    const form = new FormData();
    form.append("file", fs.createReadStream(pdfFilePath));

    // Send the POST request with the file
    const response = await axios.post("http://localhost:5080", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Save the response to a JSON file
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(response.data, null, 4),
      "utf-8"
    );
    console.log(`Response saved to ${jsonFilePath}`);

    // Process the JSON data
    const jsonData: JsonItem[] = JSON.parse(
      fs.readFileSync(jsonFilePath, "utf-8")
    );

    // Initialize common metadata variables
    let commonMetadata: Metadata = {
      "Revizyon No": "",
      "Revizyon Tarihi": "",
      "Yayın Tarihi": "",
      "Hazırlayan": "",
    };

    // Process JSON data
    const processedData: ProcessedData[] = jsonData.map((item) => {
      const metadata: Metadata = {
        page_number: item.page_number.toString(),
        type: item.type,
        ...commonMetadata, // Include common metadata for consistency
      };

      // Extract metadata from the text
      if (item.type === "Table") {
        const docNoMatch = item.text.match(/Döküman No\s*:\s*([^\s]+)/);
        const revNoMatch = item.text.match(/Revizyon No\s*:\s*([^\s]+)/);
        const revDateMatch = item.text.match(/Revizyon Tarihi\s*:\s*([^\s]+)/);
        const pubDateMatch = item.text.match(/Yayın Tarihi\s*:\s*([^\s]+)/);
        const hazirlayanMatch = item.text.match(/Hazırlayan\s*:\s*([^K]+)/);

        if (docNoMatch) metadata["Döküman No"] = docNoMatch[1];
        if (revNoMatch) {
          metadata["Revizyon No"] = revNoMatch[1];
          commonMetadata["Revizyon No"] = revNoMatch[1]; // Update common metadata
        }
        if (revDateMatch) {
          metadata["Revizyon Tarihi"] = revDateMatch[1];
          commonMetadata["Revizyon Tarihi"] = revDateMatch[1]; // Update common metadata
        }
        if (pubDateMatch) {
          metadata["Yayın Tarihi"] = pubDateMatch[1];
          commonMetadata["Yayın Tarihi"] = pubDateMatch[1]; // Update common metadata
        }
        if (hazirlayanMatch) {
          metadata["Hazırlayan"] = hazirlayanMatch[1].trim();
          commonMetadata["Hazırlayan"] = hazirlayanMatch[1].trim(); // Update common metadata
        }
      }

      // For other types, include the common metadata
      if (item.type !== "Table") {
        metadata["Revizyon No"] = commonMetadata["Revizyon No"];
        metadata["Revizyon Tarihi"] = commonMetadata["Revizyon Tarihi"];
        metadata["Yayın Tarihi"] = commonMetadata["Yayın Tarihi"];
        metadata["Hazırlayan"] = commonMetadata["Hazırlayan"];
      }

      // Return the processed object with text and metadata
      return {
        id: uuidv4(), // Generate a unique ID for each document
        text: item.text.trim(),
        metadata,
      };
    });

    // Save the processed JSON data to a new file
    fs.writeFileSync(
      cleanedFilePath,
      JSON.stringify(processedData, null, 4),
      "utf-8"
    );
    console.log(`Processed output saved to ${cleanedFilePath}`);

    // Extract documents and metadata from processed data
    const document = processedData.map((item) => item.text);
    const metadata = processedData.map((item) => item.metadata);
    const id = processedData.map((item) => item.id);

    // Create or get a collection with the embedding function
    const collectionName = "AKTEK_IZIN_PROSEDURU"; // Replace with your desired collection name
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: embeddingFunction,
    });

    console.log(`Collection "${collectionName}" retrieved or created.`);

    // Store the documents and metadata in the collection
    await collection.upsert({
      ids: id,
      documents: document,
      metadatas: metadata,
    });
    console.log("Documents and metadata stored in ChromaDB collection.");
  } catch (error) {
    console.error("Failed to post file, process JSON, and store data:", error);
  }
}

postFileAndProcess();
