import { Router } from 'express';
import { listItems, updateItem, toggleDone, deleteItem } from '../controllers/items.controller.js';

const router = Router();

router.get('/', listItems);
router.put('/:id', updateItem);
router.patch('/:id/done', toggleDone);
router.delete('/:id', deleteItem);

export default router;
