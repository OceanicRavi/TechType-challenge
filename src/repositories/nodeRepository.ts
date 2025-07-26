import { db } from '../db/connection';
import { Node, Property, NodeTree } from '../models/techNodes';

export class NodeRepository {
  
  async createNode(name: string, parentPath?: string): Promise<Node> {
    let parentId: number | null = null;
    let path: string;

    if (parentPath) {
      const parent = await this.findByPath(parentPath);
      if (!parent) throw new Error('Parent not found');
      parentId = parent.id;
      path = `${parentPath}/${name}`;
    } else {
      path = `/${name}`;
    }

    const result = await db.run(
      'INSERT INTO nodes (name, parent_id, path) VALUES (?, ?, ?)',
      [name, parentId, path]
    );

    return this.findById(result.lastID);
  }

  async addProperty(nodePath: string, key: string, value: number): Promise<Property> {
    const node = await this.findByPath(nodePath);
    if (!node) throw new Error('Node not found');

    const result = await db.run(
      'INSERT OR REPLACE INTO properties (node_id, key, value) VALUES (?, ?, ?)',
      [node.id, key, value]
    );

    const properties = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [result.lastID]
    );
    return properties[0];
  }

  async getSubtree(nodePath: string): Promise<NodeTree | null> {
    const node = await this.findByPath(nodePath);
    if (!node) return null;

    return this.buildTree(node);
  }

  private async findById(id: number): Promise<Node> {
    const nodes = await db.query('SELECT * FROM nodes WHERE id = ?', [id]);
    return nodes[0];
  }

  private async findByPath(path: string): Promise<Node | null> {
    const nodes = await db.query('SELECT * FROM nodes WHERE path = ?', [path]);
    return nodes[0] || null;
  }

  private async buildTree(node: Node): Promise<NodeTree> {
    // Get properties
    const properties = await db.query(
      'SELECT * FROM properties WHERE node_id = ?',
      [node.id]
    );

    const propsObj: { [key: string]: number } = {};
    properties.forEach((prop: Property) => {
      propsObj[prop.key] = prop.value;
    });

    // Get children
    const children = await db.query(
      'SELECT * FROM nodes WHERE parent_id = ? ORDER BY name',
      [node.id]
    );

    const childTrees: NodeTree[] = [];
    for (const child of children) {
      childTrees.push(await this.buildTree(child));
    }

    return {
      id: node.id,
      name: node.name,
      path: node.path,
      properties: propsObj,
      children: childTrees
    };
  }
}