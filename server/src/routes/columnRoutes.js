import express from 'express';
import { getColumns, createColumn } from '../controllers/columnController.js';

const router = express.Router();

router.route('/').get(getColumns).post(createColumn);

export default router;