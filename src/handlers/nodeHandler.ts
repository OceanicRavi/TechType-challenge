import { Request, Response } from 'express';
import { NodeRepository } from '../repositories/nodeRepository';

const nodeRepo = new NodeRepository();

export const createNode = async (req: Request, res: Response) => {
  try {
    const { name, parent_path } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const node = await nodeRepo.createNode(name, parent_path);
    res.status(201).json(node);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addProperty = async (req: Request, res: Response) => {
  try {
    const nodePath = `/${req.params[0]}`;
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const property = await nodeRepo.addProperty(nodePath, key, value);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubtree = async (req: Request, res: Response) => {
  try {
    const nodePath = `/${req.params[0]}`;
    const subtree = await nodeRepo.getSubtree(nodePath);
    
    if (!subtree) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(subtree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};