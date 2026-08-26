import express from 'express';
import { getBoards, createBoard } from '../controllers/boardController.js';

const router = express.Router();

router.route('/').get(getBoards).post(createBoard);

export default router;