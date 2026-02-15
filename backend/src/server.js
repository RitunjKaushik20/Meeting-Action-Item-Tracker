import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transcriptRoutes from './routes/transcript.routes.js';
import itemsRoutes from './routes/items.routes.js';

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '2mb' }));

app.use('/api', transcriptRoutes);
app.use('/api/items', itemsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
