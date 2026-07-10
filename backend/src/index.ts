import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import importRouter from './routes/import.route';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/import', importRouter);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
