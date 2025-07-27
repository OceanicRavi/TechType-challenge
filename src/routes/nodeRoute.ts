import { Router } from 'express';
import { createNode, addProperty, getSubtree } from '../handlers/nodeHandler';

const router = Router();

// Create a node with a specified parent
router.post('/', createNode);

// Match any path ending with /properties
router.post(/^\/(.*)\/properties$/, addProperty);

// Match any path ending with /subtree
router.get(/^\/(.*)\/subtree$/, getSubtree);

export default router;