'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Folder = require('../models/folder');

router.get('/', (req, res, next) => {
  Folder.find()
    .then(results => res.json(results))
    .then(results => {
      results.sort(name);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

router.get('/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('id invalid');
    err.status = 404;
  }
  Folder.findById(req.params.id)
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
// if(!mongoose.Types.ObjectId.isValid(id)){ const err = new Error('id invalid'); err.status = 400; return next(err); }

router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create({
    name
  })
    .then(folder => {
      res.location(`${req.originalUrl}/${folder.id}`), res.status(201).json(folder);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const updatedFolder = {
    name: req.body.name
  };
  Folder.findByIdAndUpdate(req.params.id, updatedFolder, {
    new: true
  })
    .then(Folder => res.json(Folder))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  Folder.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;
