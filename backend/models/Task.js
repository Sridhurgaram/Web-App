const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignee: { type: String, default: "" },        // new field
  estimatedHours: { type: Number, default: 0 },   // new field
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" }, // new field
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
