import express from 'express';
import nodeRoutes from './routes/nodeRoute';

const app = express();

app.use(express.json());
app.use('/api/nodes', nodeRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'PC Node Service API' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});