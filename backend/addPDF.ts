import fs from "fs";
import { getDocument } from "pdfjs-dist";
import { ChromaClient } from "chromadb";
import { TokenTextSplitter } from "@langchain/textsplitters";

const extractTextFromPDF = async (filePath: string) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdfDoc = await getDocument({ data }).promise;
  let text = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ");
  }

  return text;
};

const splitTextIntoChunks = async (text: string, chunkSize: number) => {
  const textSplitter = new TokenTextSplitter({
    chunkSize: 250,
    chunkOverlap: 50,
  });

  const chunks = await textSplitter.splitText(text);
  return chunks;
};

const addPDFToChromaDB = async (pdfPath: string) => {
  const client = new ChromaClient({ path: "http://localhost:8000" });
  const pdfText = await extractTextFromPDF(pdfPath);

  const chunkSize = 250; // Adjust chunk size as needed
  const textChunks = await splitTextIntoChunks(pdfText, chunkSize);

  const collection = await client.getOrCreateCollection({
    name: "pdf_collection",
  });

  // Use unique IDs for each chunk
  const chunkIds = textChunks.map((_, index) => `pdf_chunk_${index}`);

  await collection.upsert({
    documents: textChunks,
    ids: chunkIds,
  });

  console.log("PDF text chunks added to ChromaDB");
};

// Example usage
const pdfPath = "../data/692384_imhotep_manual.pdf";
addPDFToChromaDB(pdfPath);

