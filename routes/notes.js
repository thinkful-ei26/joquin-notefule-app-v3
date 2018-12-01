'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  const filter = {};
  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tags = tagId;
  }
  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ title: re }, { content: re }];
  }
  Note.find(filter)
    .populate('tags')
    .sort({ updateAt: 'desc' })
    .then(notes => {
      res.json(notes);
    })
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(result => res.json(result))
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;
  if (!title) {
    const err = new Error('Missing `title` in requesnt body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  const newNote = { title, content, folderId };
  if (folderId === '') {
    delete newNote.folderId;
  }

  Note.create(newNote)
    .then(result => {
      res.location(`/api/notes/${newNote._id}`), res.json(newNote).end();
    })
    .catch(err => next(err));
});
/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const updatedNote = {
    title: req.body.title,
    content: req.body.content
  };
  Note.findByIdAndUpdate(req.params.id, updatedNote, {
    new: true
  })
    .then(Note => res.json(Note))
    .catch(error => next(error));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});

module.exports = router;
