'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Tag = require('../models/tag');
const Note = require('../models/tag');

// GET all /tags
//     Sort the response by name
router.get('/', (req, res, next) => {
  Tag.find()
    .sort({ updatedAt: 'desc' })
    .then(results => res.json(results))

    // .then(results => {
    //   results.sort();
    // })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/***********GET 2******************** */

// GET /tags by id
//     Add validation that protects against invalid Mongo ObjectIds and prevents unnecessary database queries.
//     Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
router.get('/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('id invalid');
    err.status = 404;
  }
  Tag.findById(req.params.id)

    //   result? res.status(200).json(result): res.status(404).json({ "error" : "Id not found"});
    .then(result => {
      if (result === false) {
        res.json(result).status(204);
      }
      res.json(result).status(200);
    })
    .catch(err => {
      console.err('Status 404');
      next(err);
    });
});

// *********POST
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const newTag = { name };
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`), res.status(201).json(result);
    })
    .catch(err => {
      if ((err.code === 11000)) {
        err = new Error('Tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// *******PUT
router.put('/:id', (req, res, next) => {
  const updatedTag = {
    name: req.body.name
  };
  if (req.body.name) {
    Tag.findByIdAndUpdate(req.params.id, updatedTag, {
      new: true
    })
      .then(Tag => res.json(Tag))
      .catch(error => next(error));
  }
});
// *********DELETE
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const deleteTagId = Tag.findByIdAndRemove(id);
  const deleteTagFromNotes = Note.updateMany(
    { tags: id },
    { $pull: { tags: id } }
  );

  Promise.all([deleteTagId, deleteTagFromNotes])
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
