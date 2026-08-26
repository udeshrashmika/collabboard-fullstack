import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true }
}, { timestamps: true });

export default mongoose.model('Column', columnSchema);