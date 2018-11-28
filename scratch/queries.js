'use strict';
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// **********note.find()
mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    // // const searchTerm = 'lady gaga';
    // let filter = {};

    // if (searchTerm) {
    //   filter.title = { $regex: searchTerm, $options: 'i' };
    // }
    const searchTerm = 'CATS';  
    const re = new RegExp(searchTerm,'i');
    return Note.find({ $or: [{ title: re }, { content: re }] });
    // return Note.find(filter).sort({ updatedAt: 'desc' });
    // return Note.find();
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//   **********note.findById()
Note.findById('000000000000000000000003')
  .then(result => console.log(result))
  .catch(err => console.log(err));

//**********note.create() */

Note.create({
  title: 'Some title A',
  content: 'Some content A'
})
  .then(Note => {
    console.log('this is the note', Note);
  })
  .catch(err => {
    console.log('something went wrong!');
  });

//   **Note.findByIdAndUpdate()
const updatedNote = {
  title: 'This is a title CHANGE'
};

Note.findByIdAndUpdate('000000000000000000000003', updatedNote, {
  new: true
}).then(Notes =>
  console.log('This is the Note', Note)
  .catch(error => console.error(error))
);

//  ******Note.delete()
Note.findByIdAndRemove('000000000000000000000003')
  .then(Notes => console.log('This is the Delete', Note))
  .catch(error => console.error(error));
