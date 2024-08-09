// backend/server.ts
import express from 'express';
import { ChromaClient } from 'chromadb';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const client = new ChromaClient();

app.get('/api/collection/:name', async (req: express.Request, res: express.Response) => {
    try {
        const { name } = req.params;
        const collection = await client.getOrCreateCollection({ name });
        res.json(collection);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/collection/:name/documents', async (req: express.Request, res: express.Response) => {
    try {
        const { name } = req.params;
        const { documents, ids } = req.body;
        const collection = await client.getOrCreateCollection({ name });
        await collection.upsert({ documents, ids });
        res.status(201).send('Documents added');
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/collection/:name/query', async (req: express.Request, res: express.Response) => {
    try {
        const { name } = req.params;
        const { queryTexts, nResults } = req.body;
        const collection = await client.getOrCreateCollection({ name });
        const results = await collection.query({ queryTexts, nResults });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
