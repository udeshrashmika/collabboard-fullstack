import mongoose from 'mongoose';

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  columnId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Column', 
    required: true 
  },
  assignee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true,
  optimisticConcurrency: true 
});

module.exports = mongoose.model('Task', taskSchema);

export default mongoose.model('User', userSchema);