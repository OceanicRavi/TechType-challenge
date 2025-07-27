import express from 'express';
import nodeRoutes from './routes/nodeRoute';
import { seedData } from './db/seed';

const app = express();

app.use(express.json());
app.use('/api/nodes', nodeRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'PC Node Service API' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
    try {
        console.log('Seeding database...');
        await seedData();
        console.log('Database seeded successfully!');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api/nodes`);
            console.log(`Health check at http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();