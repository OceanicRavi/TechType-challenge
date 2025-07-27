import { NodeRepository } from '../repositories/nodeRepository';

const seedData = async () => {
    const repo = new NodeRepository();

    try {
        // Create AlphaPC root
        await repo.createNode('AlphaPC');
        await repo.addProperty('/AlphaPC', 'Height', 450.00);
        await repo.addProperty('/AlphaPC', 'Width', 180.00);

        // Create Processing
        await repo.createNode('Processing', '/AlphaPC');
        await repo.addProperty('/AlphaPC/Processing', 'RAM', 32000.00);

        // Create CPU
        await repo.createNode('CPU', '/AlphaPC/Processing');
        await repo.addProperty('/AlphaPC/Processing/CPU', 'Cores', 4);
        await repo.addProperty('/AlphaPC/Processing/CPU', 'Power', 2.41);

        // Create Graphics
        await repo.createNode('Graphics', '/AlphaPC/Processing');
        await repo.addProperty('/AlphaPC/Processing/Graphics', 'RAM', 4000.00);
        await repo.addProperty('/AlphaPC/Processing/Graphics', 'Ports', 8.00);

        // Create Storage
        await repo.createNode('Storage', '/AlphaPC');

        // Create SSD
        await repo.createNode('SSD', '/AlphaPC/Storage');
        await repo.addProperty('/AlphaPC/Storage/SSD', 'Capacity', 1024.00);
        await repo.addProperty('/AlphaPC/Storage/SSD', 'WriteSpeed', 250.00);

        // Create HDD
        await repo.createNode('HDD', '/AlphaPC/Storage');
        await repo.addProperty('/AlphaPC/Storage/HDD', 'Capacity', 5120.00);
        await repo.addProperty('/AlphaPC/Storage/HDD', 'WriteSpeed', 1.724752);

        const subtree = await repo.getSubtree('/AlphaPC');
        console.log(JSON.stringify(subtree, null, 2));

    } catch (error) {
        console.error('Data seed failed:', error);
    }
};

if (require.main === module) {
    seedData();
}

export { seedData };