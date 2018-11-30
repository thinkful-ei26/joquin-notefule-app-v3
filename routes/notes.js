'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
// router.get('/', (req, res, next) => {

//   console.log('Get All Notes');
//   res.json([
//     { id: 1, title: 'Temp 1' },
//     { id: 2, title: 'Temp 2' },
//     { id: 3, title: 'Temp 3' }
//   ]);

// });

router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const re = new RegExp(searchTerm, 'i');
  Note.find({ $or: [{ title: re }, { content: re }] })
    .then(results => res.json(results))
    // .then(() => {
    //   return mongoose.disconnect();
    // })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(result => res.json(result))
    .catch(err => next(err));

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  Note.create({
    title,
    content

    // title: req.body.title,
    // content: req.body.content
  })
    .then(note => {
      // console.log(note);
      res.location(`/api/notes/${note._id}`), res.json(note).end();
    })
    .catch(
      err => {
        next(err);
      }

      // console.log('Create a Note');
      // res
      //   .location('path/to/new/document')
      //   .status(201)
      //   .json({ id: 2, title: 'Temp 2' });
    );
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

  // console.log('Update a Note');
  // res.json({ id: 1, title: 'Updated Temp 1' });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;
