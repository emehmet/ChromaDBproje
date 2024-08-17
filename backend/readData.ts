import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';


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


async function uploadFile(filePath: string) {
    const form = new FormData();

    form.append('file', fs.createReadStream(filePath));
    
    form.append('types', 'all');

    try {
        const response = await axios.post(/*'http://10.50.17.5:5080'*/'http://localhost:5080', form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        //console.log('File uploaded successfully:', response.data);
        //console.log(typeof response.data);
        return response.data;

    } catch (error) {
        console.error('Error uploading file:');
    }
}

// Function to read JSON from a .txt file and extract text of type 'Text'
export async function filterDataOld(filePath: string): Promise<[string[], string[]]> {

    const data = await uploadFile(filePath);
    //console.log(data);

    // Read the file content as a string
    /*const fileContent = fs.readFileSync('C:/Users/ceyhun.erdonmez/Desktop/pdfs/Akkök Holding Sosyal Medya Politikası1.txt', 'utf-8');

    // Parse the string content into a JSON array
    const jsonArray: JsonObject[] = JSON.parse(fileContent);*/

    // Filter the array to only include items where the type is 'Text'
    const textArray = data
        .filter((item: { type: string; top: any; page_height: any; }) => item.type === 'Text' || 
            item.type === 'List item' || 
            item.type === 'Section header' || 
            item.type === 'Formula'
            ||
            (item.type === 'Table' && 
            (Number(item.top) <= Number(item.page_height)*0.85 && 
            Number(item.top) >= Number(item.page_height)*0.10))
        )
        .map((item: { text: any; type: any; }) => item.text + "=>" + item.type);

    const metaArray = data
        .filter((item: { type: string; top: any; page_height: any; }) => (item.type === 'Table' && 
            (Number(item.top) > Number(item.page_height)*0.85 || 
            Number(item.top) < Number(item.page_height)*0.10))
            ||
            item.type === 'Page footer' ||
            item.type === 'Page header' ||
            item.type === 'Footnote' ||
            item.type === 'Caption')
        .map((item: { text: any; type: any; }) => item.text + "=>" + item.type);
    
    console.log('DOCUMENTS')
    console.log(textArray);
    console.log('METADATA')
    console.log(metaArray);
    return [textArray, metaArray];
}

export async function filterData(filePath: string): Promise<Object[]> {
    const data = await uploadFile(filePath);

    const array = [];
    let currentTextSection: string = ``;
    let currentHeaderSection: string = '';
    let currentFooterSection: string = '';
    let previousType: string = '';
    let seeHeader = false;

    for (const item of data) {
        if (item.type === 'Table' && 
            (Number(item.top) <= Number(item.page_height)*0.85 && 
            Number(item.top) >= Number(item.page_height)*0.10)) {
                array.push(
                    [item.text,
                    {
                        pageNumber: item.page_number,
                        header: currentHeaderSection,
                        footer: currentFooterSection
                    }]
                );
        }
        else if ((item.type === 'Table' && Number(item.top) > Number(item.page_height)*0.85)) {
                currentFooterSection = item.text;
                if(item.type === 'Page footer')
                    currentFooterSection = currentFooterSection + item.text + ' ';

        }
        else if ((item.type === 'Table' && Number(item.top) < Number(item.page_height)*0.10)) {
                currentHeaderSection = item.text;
                if(item.type === 'Page header')
                    currentHeaderSection = currentHeaderSection + item.text + ' ';

        }
        else if ((item.type === 'Section header' && previousType != 'Section header') ||
                    (seeHeader === false && currentTextSection !== '')){
            array.push(
                [currentTextSection,
                {
                    pageNumber: item.page_number,
                    header: currentHeaderSection,
                    footer: currentFooterSection
                }]
            );
            currentTextSection = '';
        }


        if (item.type === 'Section header' || item.type === 'Text' || item.type === 'List item' || item.type === 'Formula' || item.type === 'Caption') {
            if(previousType === 'Text' && item.type === 'List item')
                currentTextSection = currentTextSection + `\n`;

            currentTextSection = currentTextSection + item.text + ` `;

            if(item.type === 'Section header')
                seeHeader = true;
            if(item.type === 'Section header' || item.type === 'List item')
                currentTextSection = currentTextSection + `\n`;
        }
        previousType = item.type;
        console.log(item.text + ' => ' +item.type);
    }

    console.log(array);
    return array;
}

// Example usage
const filePath = 'C:/Users/ceyhun.erdonmez/Desktop/pdfs/AKTEK İZİN PROSEDÜRÜ.pdf';
const extractedTexts = filterData(filePath);

// Output the extracted text array
//console.log(extractedTexts);
