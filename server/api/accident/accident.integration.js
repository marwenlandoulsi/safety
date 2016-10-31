'use strict';

var app = require('../..');
import request from 'supertest';

var newAccident;

describe('Accident API:', function() {
  describe('GET /api/accidents', function() {
    var accidents;

    beforeEach(function(done) {
      request(app)
        .get('/api/accidents')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          accidents = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      accidents.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/accidents', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/accidents')
        .send({
          name: 'New Accident',
          info: 'This is the brand new accident!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newAccident = res.body;
          done();
        });
    });

    it('should respond with the newly created accident', function() {
      newAccident.name.should.equal('New Accident');
      newAccident.info.should.equal('This is the brand new accident!!!');
    });
  });

  describe('GET /api/accidents/:id', function() {
    var accident;

    beforeEach(function(done) {
      request(app)
        .get(`/api/accidents/${newAccident._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          accident = res.body;
          done();
        });
    });

    afterEach(function() {
      accident = {};
    });

    it('should respond with the requested accident', function() {
      accident.name.should.equal('New Accident');
      accident.info.should.equal('This is the brand new accident!!!');
    });
  });

  describe('PUT /api/accidents/:id', function() {
    var updatedAccident;

    beforeEach(function(done) {
      request(app)
        .put(`/api/accidents/${newAccident._id}`)
        .send({
          name: 'Updated Accident',
          info: 'This is the updated accident!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedAccident = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedAccident = {};
    });

    it('should respond with the original accident', function() {
      updatedAccident.name.should.equal('New Accident');
      updatedAccident.info.should.equal('This is the brand new accident!!!');
    });

    it('should respond with the updated accident on a subsequent GET', function(done) {
      request(app)
        .get(`/api/accidents/${newAccident._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let accident = res.body;

          accident.name.should.equal('Updated Accident');
          accident.info.should.equal('This is the updated accident!!!');

          done();
        });
    });
  });

  describe('PATCH /api/accidents/:id', function() {
    var patchedAccident;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/accidents/${newAccident._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Accident' },
          { op: 'replace', path: '/info', value: 'This is the patched accident!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedAccident = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedAccident = {};
    });

    it('should respond with the patched accident', function() {
      patchedAccident.name.should.equal('Patched Accident');
      patchedAccident.info.should.equal('This is the patched accident!!!');
    });
  });

  describe('DELETE /api/accidents/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/accidents/${newAccident._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when accident does not exist', function(done) {
      request(app)
        .delete(`/api/accidents/${newAccident._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
