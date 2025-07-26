
import { db } from '../db/connection';
import { Node } from '../models/techNodes';

export class NodeRepository {

    async createNode(name: string): Promise<Node> {
        let parentId: number | null = null;
        let path: string = `/${name}`;

        const result = await db.run(
            'INSERT INTO nodes (name, parent_id, path) VALUES (?, ?, ?)',
            [name, parentId, path]
        );

        return this.findById(result.lastID);
    }

    private async findById(id: number): Promise<Node> {
        const nodes = await db.query('SELECT * FROM nodes WHERE id = ?', [id]);
        return nodes[0];
    }
}