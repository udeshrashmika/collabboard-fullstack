import Column from '../../models/Column.js';

export const getColumns = async (req, res) => {
  try {
    const columns = await Column.find();
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createColumn = async (req, res) => {
  try {
    const newColumn = new Column(req.body);
    const savedColumn = await newColumn.save();
    res.status(201).json(savedColumn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};