import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import sellersRouter from './routes/sellers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('Backend Server is running...'));

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sellers', sellersRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
