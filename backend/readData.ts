import * as fs from 'fs';

// Define the interface for the expected structure of the JSON objects
interface JsonObject {
    left: number;
    top: number;
    width: number;
    height: number;
    page_number: number;
    page_width: number;
    page_height: number;
    text: string;
    type: string;
}

// Function to read JSON from a .txt file and extract text of type 'Text'
export function extractTextFromJsonFile(filePath: string): string[] {
    // Read the file content as a string
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse the string content into a JSON array
    const jsonArray: JsonObject[] = JSON.parse(fileContent);

    // Filter the array to only include items where the type is 'Text'
    const textArray = jsonArray
        .filter(item => item.type === 'Text')
        .map(item => item.text);

    return textArray;
}

// Example usage
/*const filePath = 'C:/Users/ceyhun.erdonmez/Desktop/pdfs/Akkök Holding Sosyal Medya Politikası1.txt';
const extractedTexts = extractTextFromJsonFile(filePath);*/

// Output the extracted text array
//console.log(extractedTexts);
