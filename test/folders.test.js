'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
console.log(TEST_MONGODB_URI);
const Folder = require('../models/folder');

const { folders } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folder API resource', () => {
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
    return Folder.insertMany(folders);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    console.log('disconnect');
    return mongoose.disconnect();
  });

  describe('GET api/folders', function() {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    it('should return all folders', function() {
      return (
        Promise.all([Folder.find(), chai.request(app).get('/api/folders')])
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

  describe('GET /api/folders/:id', function() {
    it('should return correct folder', function() {
      let data;
      // 1) First, call the database
      return Folder.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('POST /api/folders', function() {
    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        name: 'Hanga Banga'
      };
      let body; // used to pass 'res.body'along then chain.
      return chai
        .request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function(res) {
          body = res.body; //capture res.body in lexical.
          expect(res).to.have.status(201);
          expect(res).to.have.header('location'); // the location response header is used to redirect.
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(new Date(body.createdAt)).to.eql(data.createdAt);
          expect(new Date(body.updatedAt)).to.eql(data.updatedAt);
        });
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
        name: 'fofofofofofofof'
      };

      return Folder.findOne()
        .then(function(folder) {
          updateData.id = folder.id;
          //   console.log('updateData', updateData);
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai
            .request(app)
            .put(`api/notes/${folder.id}`)
            .send(updateData);
        })
        .then(function(res) {
          //   console.log(res);
          expect(res).to.have.status(204);
          console.log('updateData', updateData.id);
          return Folder.findById(updateData.id);
        })
        .then(function(folder) {
          //   console.log('note', note);
          expect(folder.name).to.equal(updateData.name);
        })
        .catch(err => err);
    });
  });
  // *********DELETE

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a folder
    //  2. make a DELETE request for that folder's id
    //  3. assert that response has right status code
    //  4. prove that folders with the id doesn't exist in db anymore
    it('delete a folder by id', function() {
      let data;
      return Folder.findOne()
        .then(function(_data) {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Folder.findById(data.id);
        })
        .then(function(_data) {
          expect(_data).to.be.null;
        });
    });
  });
});
