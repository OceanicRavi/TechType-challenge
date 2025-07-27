import { describe, it, beforeEach } from 'mocha';
import { strict as assert } from 'assert';
import request from 'supertest';
import express from 'express';
import nodeRoutes from '../../src/routes/nodeRoute';

describe('Node API Integration Tests', () => {
  let app: express.Application;
  let testCounter = 0;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nodes', nodeRoutes);
    testCounter++;
  });

  // Helper function to generate unique names
  const uniqueName = (baseName: string) => `${baseName}_${testCounter}_${Date.now()}`;

  describe('POST /api/nodes - Create Node', () => {
    it('should create a root node successfully', async () => {
      const nodeName = uniqueName('TestPC');
      const response = await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      assert.equal(response.body.name, nodeName);
      assert.equal(response.body.path, `/${nodeName}`);
      assert.equal(response.body.parent_id, null);
      assert(typeof response.body.id === 'number');
    });

    it('should create a child node successfully', async () => {
      const parentName = uniqueName('ParentNode');
      const childName = uniqueName('ChildNode');

      // First create parent
      const parentResponse = await request(app)
        .post('/api/nodes')
        .send({ name: parentName })
        .expect(201);

      // Then create child
      const childResponse = await request(app)
        .post('/api/nodes')
        .send({ 
          name: childName, 
          parent_path: `/${parentName}` 
        })
        .expect(201);

      assert.equal(childResponse.body.name, childName);
      assert.equal(childResponse.body.path, `/${parentName}/${childName}`);
      assert.equal(childResponse.body.parent_id, parentResponse.body.id);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/nodes')
        .send({})
        .expect(400);

      assert.equal(response.body.error, 'Name is required');
    });

    it('should return 400 when parent does not exist', async () => {
      const response = await request(app)
        .post('/api/nodes')
        .send({ 
          name: uniqueName('OrphanNode'), 
          parent_path: '/NonExistentParent' 
        })
        .expect(400);

      assert.equal(response.body.error, 'Parent not found');
    });

    it('should handle multiple levels of nesting', async () => {
      const level1Name = uniqueName('Level1');
      const level2Name = uniqueName('Level2');
      const level3Name = uniqueName('Level3');

      // Create root
      await request(app)
        .post('/api/nodes')
        .send({ name: level1Name })
        .expect(201);

      // Create level 2
      await request(app)
        .post('/api/nodes')
        .send({ name: level2Name, parent_path: `/${level1Name}` })
        .expect(201);

      // Create level 3
      const response = await request(app)
        .post('/api/nodes')
        .send({ name: level3Name, parent_path: `/${level1Name}/${level2Name}` })
        .expect(201);

      assert.equal(response.body.name, level3Name);
      assert.equal(response.body.path, `/${level1Name}/${level2Name}/${level3Name}`);
    });
  });

  describe('POST /api/nodes/:path/properties - Add Property', () => {
    it('should add property to root node', async () => {
      const nodeName = uniqueName('PropertyTestPC');
      
      // Create node first
      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      const response = await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'Height', value: 450.5 })
        .expect(201);

      assert.equal(response.body.key, 'Height');
      assert.equal(response.body.value, 450.5);
      assert(typeof response.body.id === 'number');
      assert(typeof response.body.node_id === 'number');
    });

    it('should add property to nested node', async () => {
      const pcName = uniqueName('PropertyTestPC');
      const componentName = uniqueName('Component');

      // Setup test nodes
      await request(app)
        .post('/api/nodes')
        .send({ name: pcName })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: componentName, parent_path: `/${pcName}` })
        .expect(201);

      const response = await request(app)
        .post(`/api/nodes/${pcName}/${componentName}/properties`)
        .send({ key: 'Power', value: 2.41 })
        .expect(201);

      assert.equal(response.body.key, 'Power');
      assert.equal(response.body.value, 2.41);
    });

    it('should add multiple properties to same node', async () => {
      const nodeName = uniqueName('MultiPropNode');

      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'Width', value: 180.0 })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'Depth', value: 200.0 })
        .expect(201);
    });

    it('should update existing property', async () => {
      const nodeName = uniqueName('UpdatePropNode');

      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      // Add initial property
      await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'Weight', value: 5.5 })
        .expect(201);

      // Update the same property
      const response = await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'Weight', value: 6.0 })
        .expect(201);

      assert.equal(response.body.key, 'Weight');
      assert.equal(response.body.value, 6.0);
    });

    it('should return 400 when key is missing', async () => {
      const nodeName = uniqueName('MissingKeyNode');

      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      const response = await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ value: 100 })
        .expect(400);

      assert.equal(response.body.error, 'Key and value are required');
    });

    it('should return 400 when value is missing', async () => {
      const nodeName = uniqueName('MissingValueNode');

      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      const response = await request(app)
        .post(`/api/nodes/${nodeName}/properties`)
        .send({ key: 'TestKey' })
        .expect(400);

      assert.equal(response.body.error, 'Key and value are required');
    });

    it('should return 400 when node does not exist', async () => {
      const response = await request(app)
        .post('/api/nodes/NonExistentNode/properties')
        .send({ key: 'TestKey', value: 100 })
        .expect(400);

      assert.equal(response.body.error, 'Node not found');
    });
  });

  describe('GET /api/nodes/:path/subtree - Get Subtree', () => {
    it('should get complete subtree for root node', async () => {
      const pcName = uniqueName('SubtreeTestPC');
      const processingName = uniqueName('Processing');
      const cpuName = uniqueName('CPU');
      const gpuName = uniqueName('GPU');

      // Setup comprehensive test structure
      await request(app)
        .post('/api/nodes')
        .send({ name: pcName })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/properties`)
        .send({ key: 'Height', value: 450.0 })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/properties`)
        .send({ key: 'Width', value: 180.0 })
        .expect(201);

      // Create nested structure
      await request(app)
        .post('/api/nodes')
        .send({ name: processingName, parent_path: `/${pcName}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/properties`)
        .send({ key: 'RAM', value: 32000.0 })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: cpuName, parent_path: `/${pcName}/${processingName}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/${cpuName}/properties`)
        .send({ key: 'Cores', value: 4 })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/${cpuName}/properties`)
        .send({ key: 'Speed', value: 3.2 })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: gpuName, parent_path: `/${pcName}/${processingName}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/${gpuName}/properties`)
        .send({ key: 'VRAM', value: 8000.0 })
        .expect(201);

      const response = await request(app)
        .get(`/api/nodes/${pcName}/subtree`)
        .expect(200);

      const subtree = response.body;

      // Verify root node
      assert.equal(subtree.name, pcName);
      assert.equal(subtree.path, `/${pcName}`);
      assert.equal(subtree.properties.Height, 450.0);
      assert.equal(subtree.properties.Width, 180.0);
      assert.equal(subtree.children.length, 1);

      // Verify Processing node
      const processing = subtree.children[0];
      assert.equal(processing.name, processingName);
      assert.equal(processing.path, `/${pcName}/${processingName}`);
      assert.equal(processing.properties.RAM, 32000.0);
      assert.equal(processing.children.length, 2);

      // Verify CPU node
      const cpu = processing.children.find((c: any) => c.name === cpuName);
      assert(cpu);
      assert.equal(cpu.path, `/${pcName}/${processingName}/${cpuName}`);
      assert.equal(cpu.properties.Cores, 4);
      assert.equal(cpu.properties.Speed, 3.2);
      assert.equal(cpu.children.length, 0);

      // Verify GPU node
      const gpu = processing.children.find((c: any) => c.name === gpuName);
      assert(gpu);
      assert.equal(gpu.path, `/${pcName}/${processingName}/${gpuName}`);
      assert.equal(gpu.properties.VRAM, 8000.0);
      assert.equal(gpu.children.length, 0);
    });

    it('should get subtree for nested node', async () => {
      const pcName = uniqueName('NestedTestPC');
      const processingName = uniqueName('Processing');

      await request(app)
        .post('/api/nodes')
        .send({ name: pcName })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: processingName, parent_path: `/${pcName}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/properties`)
        .send({ key: 'RAM', value: 32000.0 })
        .expect(201);

      const response = await request(app)
        .get(`/api/nodes/${pcName}/${processingName}/subtree`)
        .expect(200);

      const subtree = response.body;

      assert.equal(subtree.name, processingName);
      assert.equal(subtree.path, `/${pcName}/${processingName}`);
      assert.equal(subtree.properties.RAM, 32000.0);
      assert.equal(subtree.children.length, 0);
    });

    it('should get subtree for leaf node', async () => {
      const pcName = uniqueName('LeafTestPC');
      const processingName = uniqueName('Processing');
      const cpuName = uniqueName('CPU');

      await request(app)
        .post('/api/nodes')
        .send({ name: pcName })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: processingName, parent_path: `/${pcName}` })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: cpuName, parent_path: `/${pcName}/${processingName}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/${cpuName}/properties`)
        .send({ key: 'Cores', value: 4 })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${pcName}/${processingName}/${cpuName}/properties`)
        .send({ key: 'Speed', value: 3.2 })
        .expect(201);

      const response = await request(app)
        .get(`/api/nodes/${pcName}/${processingName}/${cpuName}/subtree`)
        .expect(200);

      const subtree = response.body;

      assert.equal(subtree.name, cpuName);
      assert.equal(subtree.path, `/${pcName}/${processingName}/${cpuName}`);
      assert.equal(subtree.properties.Cores, 4);
      assert.equal(subtree.properties.Speed, 3.2);
      assert.equal(subtree.children.length, 0);
    });

    it('should return node with no properties', async () => {
      const nodeName = uniqueName('EmptyNode');

      // Create node without properties
      await request(app)
        .post('/api/nodes')
        .send({ name: nodeName })
        .expect(201);

      const response = await request(app)
        .get(`/api/nodes/${nodeName}/subtree`)
        .expect(200);

      const subtree = response.body;
      assert.equal(subtree.name, nodeName);
      assert.deepEqual(subtree.properties, {});
      assert.equal(subtree.children.length, 0);
    });

    it('should return 404 when node does not exist', async () => {
      const response = await request(app)
        .get('/api/nodes/NonExistentNode/subtree')
        .expect(404);

      assert.equal(response.body.error, 'Node not found');
    });

    it('should handle deep nesting correctly', async () => {
      const level1Name = uniqueName('Level1');
      const level2Name = uniqueName('Level2');
      const level3Name = uniqueName('Level3');

      // Create deeply nested structure
      await request(app)
        .post('/api/nodes')
        .send({ name: level1Name })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: level2Name, parent_path: `/${level1Name}` })
        .expect(201);

      await request(app)
        .post('/api/nodes')
        .send({ name: level3Name, parent_path: `/${level1Name}/${level2Name}` })
        .expect(201);

      await request(app)
        .post(`/api/nodes/${level1Name}/${level2Name}/${level3Name}/properties`)
        .send({ key: 'DeepValue', value: 999 })
        .expect(201);

      const response = await request(app)
        .get(`/api/nodes/${level1Name}/subtree`)
        .expect(200);

      const level3 = response.body.children[0].children[0];
      assert.equal(level3.name, level3Name);
      assert.equal(level3.properties.DeepValue, 999);
    });
  });

});