'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Tag = require('../models/tag');

const { tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tag API resource', () => {
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
    return Tag.insertMany(tags);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    // console.log('disconnect');
    return mongoose.disconnect();
  });

  describe('GET api/tags', function() {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    it('should return all tags', function() {
      return (
        Promise.all([Tag.find(), chai.request(app).get('/api/tags')])
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

  describe('GET /api/tags/:id', function() {
    it('should return correct Tag', function() {
      let data;
      // 1) First, call the database
      return Tag.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/tags/${data.id}`);
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

  describe('POST /api/tags', function() {
    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        name: 'Hanga Banga'
      };

      let res;
      // 1) First, call the API
      return (
        chai
          .request(app)
          .post('/api/tags')
          .send(newItem)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(201);
            // console.log(res.header);
            expect(res).to.have.header('location');
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys(
              'id',
              'name',
              'createdAt',
              'updatedAt'
            );
            // 2) then call the database
            return Tag.findById(res.body.id);
          })
          // 3) then compare the API response to the database results
          .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(data.name);
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
        name: 'fofofofofofofof'
        
      };

      return Tag.findOne()
        .then(function(Tag) {
          updateData.id = Tag.id;
          //   console.log('updateData', updateData);
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai
            .request(app)
            .put(`api/notes/${Tag.id}`)
            .send(updateData);
        })
        .then(function(res) {
          //   console.log(res);
          expect(res).to.have.status(204);
          console.log('updateData', updateData.id);
          return Tag.findById(updateData.id);
        })
        .then(function(Tag) {
          //   console.log('note', note);
          expect(Tag.name).to.equal(updateData.name);
        })
        .catch(err => err);
    });
  });
  // *********DELETE

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a Tag
    //  2. make a DELETE request for that Tag's id
    //  3. assert that response has right status code
    //  4. prove that tags with the id doesn't exist in db anymore
    it('delete a Tag by id', function() {
      let data;
      return Tag.findOne()
        .then(function(_data) {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Tag.findById(data.id);
        })
        .then(function(_data) {
          expect(_data).to.be.null;
        });
    });
  });
});
