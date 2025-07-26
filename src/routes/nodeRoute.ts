import { Router } from 'express';
import { createNode, addProperty, getSubtree } from '../handlers/nodeHandler';

const router = Router();

// 1. Create a node with a specified parent
router.post('/', createNode);

// 2. Add a new property on a specific existing node
router.post('/*path/properties', addProperty);

// 3. Return the subtree of nodes with their properties for a provided node path
router.get('/*path/subtree', getSubtree);

export default router;