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
  const { title, content, folderId, tags = [] } = req.body;
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  tags.forEach(tag => {
    if (!mongoose.Types.ObjectId.isValid(tag)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }
  });

  const newNote = { title, content, folderId, tags };
  if (newNote.folderId === '') {
    delete newNote.folderId;
  }

  Note.create(newNote)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});
/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  
  const { id } = req.params;
  const { title, content, folderId, tags = [] } = req.body;
  /******validate input***** */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (tags) {
    const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The `tags` array contains an invalid `id`');
      err.status = 400;
      return next(err);
    }
  }

  const updatedNote = {
    title, content, folderId
  };
  if (folderId === ''){
    delete updatedNote.folderId;
    updatedNote.$unset = {folderId: ''};
  }
  Note.findByIdAndUpdate(id, updatedNote, {
    new: true
  })
    .then(result => {
      if(result){
        res.json(result);
      }else {
        next();
      }
    })
    // (Note => res.json(Note))
    .catch(error => next(error));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});

module.exports = router;
