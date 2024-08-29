import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';


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

    form.append('fast', 'true');
    
    form.append('types', 'all');

    try {
        const response = await axios.post(/*'http://10.50.17.5:5060'*/'http://localhost:5080', form, {
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
// export async function filterDataOld(filePath: string): Promise<[string[], string[]]> {

//     const data = await uploadFile(filePath);
//     //console.log(data);

//     // Read the file content as a string
//     /*const fileContent = fs.readFileSync('C:/Users/ceyhun.erdonmez/Desktop/pdfs/Akkök Holding Sosyal Medya Politikası1.txt', 'utf-8');

//     // Parse the string content into a JSON array
//     const jsonArray: JsonObject[] = JSON.parse(fileContent);*/

//     // Filter the array to only include items where the type is 'Text'
//     const textArray = data
//         .filter((item: { type: string; top: any; page_height: any; }) => item.type === 'Text' || 
//             item.type === 'List item' || 
//             item.type === 'Section header' || 
//             item.type === 'Formula'
//             ||
//             (item.type === 'Table' && 
//             (Number(item.top) <= Number(item.page_height)*0.83 && 
//             Number(item.top) >= Number(item.page_height)*0.10))
//         )
//         .map((item: { text: any; type: any; }) => item.text + "=>" + item.type);

//     const metaArray = data
//         .filter((item: { type: string; top: any; page_height: any; }) => (item.type === 'Table' && 
//             (Number(item.top) > Number(item.page_height)*0.83 || 
//             Number(item.top) < Number(item.page_height)*0.10))
//             ||
//             item.type === 'Page footer' ||
//             item.type === 'Page header' ||
//             item.type === 'Footnote' ||
//             item.type === 'Caption')
//         .map((item: { text: any; type: any; }) => item.text + "=>" + item.type);
    
//     console.log('DOCUMENTS')
//     console.log(textArray);
//     console.log('METADATA')
//     console.log(metaArray);
//     return [textArray, metaArray];
// }

export async function filterData(filePath: string): Promise<Object[]> {
    console.log('filterData fonksiyonu çağrıldı.')

    const data = await uploadFile(filePath);
    console.log(data);
    const array = [];
    const metaArray = []; metaArray.push(null);
    let currentTextSection: string = ``;
    let currentHeaderSection: string = '';
    let currentFooterSection: string = '';
    let currentTableSection: string = '';
    let previousType: string = 'Section header';
    let seeHeader = false;
    let headerPageNumber = 1;

    let metaPageNumber = 1;
    for (const item of data){
        if(item.page_number > metaPageNumber){
            metaArray.push(
                {
                    pageNumber: metaPageNumber,
                    header: currentHeaderSection,
                    footer: currentFooterSection,
                    tables: currentTableSection,
                    source: path.basename(filePath)
                }
            );
            metaPageNumber = item.page_number;
            currentFooterSection = '';
            currentHeaderSection = '';
            currentTableSection = '';
        }

        if ((item.type === 'Table' && Number(item.top) > Number(item.page_height)*0.83) ||
            item.type === 'Page footer') {
                currentFooterSection = currentFooterSection + item.text + ' ';
        }
        else if ((item.type === 'Table' && Number(item.top) < Number(item.page_height)*0.10) ||
            item.type === 'Page header') {
                currentHeaderSection = currentHeaderSection + item.text + ' ';
        }
        else if (item.type === 'Table' && 
            (Number(item.top) <= Number(item.page_height)*0.83 && 
            Number(item.top) >= Number(item.page_height)*0.10)){
                currentTableSection = currentTableSection + item.text.replace(/\s{3,}/g, ' ') + ' - ';
        }

    }

    metaArray.push(
        {
            pageNumber: metaPageNumber,
            header: currentHeaderSection,
            footer: currentFooterSection,
            tables: currentTableSection,
            source: path.basename(filePath)
        }
    );


    for (const item of data) {
        //currentTextSection = currentTextSection.replace(/\t+/g, ' ');
        currentTextSection = currentTextSection.replace(/\s{3,}/g, ' ');
        const wordInString = (s: string, word: string) => new RegExp('\\b' + word + '\\b', 'i').test(s);

        // if (item.type === 'Table' && 
        //     (Number(item.top) <= Number(item.page_height)*0.83 && 
        //     Number(item.top) >= Number(item.page_height)*0.10)) {
        //         /*array.push(
        //             {text: item.text.replace(/\s{3,}/g, ' '),
        //              metadata: metaArray[item.page_number]
        //             }
        //         );*/
        //         let skip = false;
        //         [
        //             'form',            
        //             'formu',           
        //             'formlar',         
        //             'formları'
        //         ].forEach(q => wordInString(item.text, q) == true ? skip = true : null)

        //         if(!skip)
        //             currentTextSection = currentTextSection + `\n` + item.text;
        // }

        if ((item.type === 'Section header' && previousType != 'Section header') && currentTextSection !== '' && !(Number(item.top) >= Number(item.page_height)*0.88) ||
                    (seeHeader === false && currentTextSection !== '' && item.type !== 'List item')){
            if(currentTextSection.trim().split(/\s+/).length > 15){
                array.push(
                    {text: currentTextSection,
                    metadata: metaArray[headerPageNumber]
                    }
                );
                currentTextSection = '';
                headerPageNumber = item.page_number;
            }
                
            
        }

        if ((item.type === 'Section header' || item.type === 'Text' || item.type === 'List item' || item.type === 'Formula' || item.type === 'Caption') &&
            !(Number(item.top) >= Number(item.page_height)*0.88)) {
            if(previousType === 'Text' && item.type === 'List item')
                currentTextSection = currentTextSection + `\n`;

            currentTextSection = currentTextSection + item.text + ` `;

            if(item.type === 'Section header')
                seeHeader = true;
            if(item.type === 'Section header' || item.type === 'List item')
                currentTextSection = currentTextSection + `\n`;

            previousType = item.type;
        }
        

        //console.log(item.text + ' => ' +item.type);
        console.log(item);
    }

    
    //console.log(metaArray);
    
    if((currentTextSection.localeCompare('') !== 0) && currentTextSection.trim().split(/\s+/).length > 15)
        array.push(
            {text: currentTextSection,
             metadata: metaArray[headerPageNumber]
            }
        );

    //console.log(array);


    const fileName = path.basename(filePath);
    fs.writeFileSync(`./filteredPdfs/${fileName}.json`, JSON.stringify(array, null, 2), 'utf-8');

    fs.writeFileSync(`./filteredPdfs/1${fileName}.json`, JSON.stringify(data, null, 2), 'utf-8');

    return array;
}

export function writeToFile(fileName: string, array: Promise<Object[]>) {

    //fs.writeFileSync(`${fileName}.json`, JSON.stringify(array, null, 2).replace(/\\n/g, '\n'), 'utf-8');
    fs.writeFileSync(`${fileName}.json`, JSON.stringify(array, null, 2), 'utf-8');
}

// Example usage
// const filePath = 'C:/Users/ceyhun.erdonmez/Desktop/pdfs/Performans ve Performansa Bağlı Prim Sistemi.pdf';
// const extractedTexts = filterData(filePath);
//writeToFile('ÇALIŞMA MODELİ PROSEDÜRÜ-', extractedTexts);


var files = fs.readdirSync('C:/Users/ceyhun.erdonmez/Desktop/pdfs/');

for (const item of files) {
    
    const extractedTexts = filterData(`C:/Users/ceyhun.erdonmez/Desktop/pdfs/${item}`);
    //writeToFile(item.substring(0, item.length - 4), extractedTexts);
}


// Output the extracted text array
//console.log(extractedTexts);
