
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

interface ChromaEmbeddingFunctionOptions {
  apiKey: string;
}

export class ChromaEmbeddingFunction  {
  private embed_model: HuggingFaceInferenceEmbeddings;

  constructor({ apiKey }: ChromaEmbeddingFunctionOptions) {
    if (!apiKey) throw new Error("No API key provided");

    this.embed_model = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
      apiKey: apiKey,
    });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.embed_model.embedDocuments(texts);
      return embeddings;
    } catch (error) {
      throw new Error(
        `Failed to generate embeddings: ${(error as Error).message}`
      );
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const embedding = await this.embed_model.embedQuery(text);
      return embedding;
    } catch (error) {
      throw new Error(
        `Failed to generate query embedding: ${(error as Error).message}`
      );
    }
  }
}
