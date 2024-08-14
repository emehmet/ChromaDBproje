import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

import { extractTextFromJsonFile } from './readData'
 
 
export class ChromaEmbeddingFunction {
  embed_model: HuggingFaceInferenceEmbeddings;
  constructor(api_key: string | undefined) {
    if (!api_key) throw new Error('No api key provided');
 
    this.embed_model = new HuggingFaceInferenceEmbeddings({
      model: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
      apiKey: api_key
    });
  }
  public async generate(texts: string[]): Promise<number[][]> {
    return await this.embed_model.embedDocuments(texts);
  }
}
 
const embed_model = new ChromaEmbeddingFunction(
  //process.env.HUGGINGFACE_API_KEY
  "api_key",
);

const filePath = 'C:/Users/ceyhun.erdonmez/Desktop/pdfs/Akkök Holding Sosyal Medya Politikası1.txt';
const extractedTexts = extractTextFromJsonFile(filePath);

console.log(extractedTexts)

async function test12345(){
  const test123 = await embed_model.generate(extractedTexts);
  console.log(test123)
  //return test123;
} 

test12345()