'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
console.log(TEST_MONGODB_URI);
const Note = require('../models/note');

const { notes } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API resource', () => {
  // we need each of these hook functions to return a promise
  // we return the value returned by these function calls.
  before(function() {
    return mongoose
      .connect(
        TEST_MONGODB_URI,
        { useNewUrlParser: true }
      )
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Note.insertMany(notes);
  });


  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    console.log('disconnect');
    return mongoose.disconnect();
  });

  describe('GET api/notes', function() {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    it('should return all notes', function() {
      return (
        Promise.all([Note.find(), chai.request(app).get('/api/notes')])
          // 3) then compare database results to API response
          .then(([data, res]) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(data.length);
          })
      );
    });
  });

  describe('GET /api/notes/:id', function() {
    it('should return correct note', function() {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'createdAt',
            'folderId',
            'updatedAt'
          );
          // 3) then compare database results to API response
          console.log('data.id',data.id);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('POST /api/notes', function() {
    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        title: 'The best article about cats ever!',
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return (
        chai
          .request(app)
          .post('/api/notes')
          .send(newItem)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            // console.log(res.header);
            expect(res).to.have.header('location');
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys(
              'id',
              'title',
              'content',
              'createdAt',
              'updatedAt'
            );
            // 2) then call the database
            return Note.findById(res.body.id);
          })
          // 3) then compare the API response to the database results
          .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          })
      );
    });
  });

  //   ************PUT

  describe('PUT endpoint', function() {
    // strategy:
    //  1. Get an existing note from db
    //  2. Make a PUT request to update that note
    //  3. Prove note returned by request contains data we sent
    //  4. Prove note in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        title: 'fofofofofofofof',
        content: 'futuristic fusion'
      };

      return Note.findOne()
        .then(function(note) {
          updateData.id = note.id;
          //   console.log('updateData', updateData);
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai
            .request(app)
            .put(`api/notes/${note.id}`)
            .send(updateData);
        })
        .then(function(res) {
          //   console.log(res);
          expect(res).to.have.status(204);
          console.log('updateData', updateData.id);
          return Note.findById(updateData.id);
        })
        .then(function(note) {
          //   console.log('note', note);
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        })
        .catch(err => (err));
    });
  });
  // *********DELETE

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a note
    //  2. make a DELETE request for that note's id
    //  3. assert that response has right status code
    //  4. prove that notes with the id doesn't exist in db anymore
    it('delete a note by id', function() {
      let data;

      return Note.findOne()
        .then(function(_data) {
          data = _data;
          //   console.log('data', data);
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note.findById(data.id);
        })
        .then(function(_data) {
          expect(_data).to.be.null;
        });
    });
  });
});
