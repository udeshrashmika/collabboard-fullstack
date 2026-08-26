import Board from '../../models/Board.js';


export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find();
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createBoard = async (req, res) => {
  try {
    const newBoard = new Board(req.body);
    const savedBoard = await newBoard.save();
    res.status(201).json(savedBoard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};