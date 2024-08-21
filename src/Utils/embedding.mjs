import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export class ChromaEmbeddingFunction {
  constructor({ apiKey }) {
    if (!apiKey) throw new Error("No api key provided");
    console.log("apiKey", apiKey);
    this.embed_model = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
      apiKey,
    });
  }
  async generate(texts) {
    return await this.embed_model.embedDocuments(texts);
  }
}
