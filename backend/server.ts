import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as llmRouter } from './routes/llm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/llm', llmRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
