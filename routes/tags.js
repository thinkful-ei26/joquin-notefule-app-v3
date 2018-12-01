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
    return next(err);
  }
  return (
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
      })
  );
});

// POST /tags to create a new tag
//     Add validation that protects against missing name field
//     A successful insert returns a location header and a 201 status
//     Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.post('/', (req, res, next) => {
  const { name } = req.body;
  Tag.create({
    name
  })
    .then(tag => {
      // console.log(note);
      res.location(`/api/tags/${tag._id}`), res.json(tag).end();
    })
    .catch(err => {
      next(err);
    });
});

// PUT /tags by id to update a tag
//     Add validation which protects against missing name field
//     Add validation which protects against an invalid ObjectId
//     Add condition that checks the result and returns a 200 response with the result or a 404 Not Found
//         Ensure you are returning the updated/modified document, not the document prior to the update
//     Add condition that checks for a duplicate key error with code 11000 and responds with a helpful error message

router.put('/:id', (req, res, next) => {
  const updatedTag = {
    name: req.body.name
  };
  //   console.log('ObjectId', ObjectId);
  if (!req.body.name || req.body.name === '') {
    // console.log(req.body.name);
    return res.status(400).json({ message: 'Missing Name' });
  }
  Tag.findByIdAndUpdate(req.params.id, updatedTag, {
    new: true
  })
    .then(Tag => res.json(Tag))
    .catch(error => next(error));
});

// DELETE /tags by id deletes the tag AND removes it from the notes collection
//     Remove the tag
//     Using $pull, remove the tag from the tags array in the notes collection.
//     Add condition that checks the result and returns a 200 response with the result or a 204 status
// Returning an error on $pull line 113, still trying to fix. Mongo version problem?
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
      return res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
