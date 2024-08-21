import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Define the structure of the JSON data
interface Segment {
    text: string;
    metadata: {
        pageNumber: number;
        header: string;
        footer: string;
    };
    id?: string; // Optional id field to be added
}

// Load the JSON data from a file
const jsonData: Segment[] = JSON.parse(fs.readFileSync('../filteredPdfs/İŞ ETİĞİ İLKELERİ.json', 'utf-8'));

// Generate IDs for each segment
jsonData.forEach(segment => {
    segment.id = uuidv4(); // Add a unique id to each segment
});

// Save the updated JSON data back to a file
fs.writeFileSync('../filteredPdfs/İŞ ETİĞİ İLKELERİ.json', JSON.stringify(jsonData, null, 2));

console.log('IDs generated and JSON file saved successfully.');
