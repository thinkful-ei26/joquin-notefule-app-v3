'use strict';
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }
  }
);

// Add `createdAt` and `updatedAt` fields
folderSchema.set('timestamps', true);
folderSchema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', folderSchema);
