import mongoose from 'mongoose';

const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  boardId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Board', 
    required: true 
  },
  order: { type: Number, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Column', columnSchema);
export default mongoose.model('User', userSchema);