'use strict';
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const { notes, folders } = require('../db/seed/data');

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]);
  })
  .then(results => {
    //this is now an array b/c of the definition in the then above.
    console.info(`Inserted ${results[0].length} Notes`);
    console.info(`Inserted ${results[1].length} Folders`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });
