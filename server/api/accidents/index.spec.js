'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var accidentCtrlStub = {
  index: 'accidentCtrl.index',
  show: 'accidentCtrl.show',
  create: 'accidentCtrl.create',
  upsert: 'accidentCtrl.upsert',
  patch: 'accidentCtrl.patch',
  destroy: 'accidentCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var accidentIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './accident.controller': accidentCtrlStub
});

describe('Accident API Router:', function() {
  it('should return an express router instance', function() {
    accidentIndex.should.equal(routerStub);
  });

  describe('GET /api/accidents', function() {
    it('should route to accidents.controller.index', function() {
      routerStub.get
        .withArgs('/', 'accidentCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/accidents/:id', function() {
    it('should route to accidents.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'accidentCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/accidents', function() {
    it('should route to accidents.controller.create', function() {
      routerStub.post
        .withArgs('/', 'accidentCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/accidents/:id', function() {
    it('should route to accidents.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'accidentCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/accidents/:id', function() {
    it('should route to accidents.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'accidentCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/accidents/:id', function() {
    it('should route to accidents.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'accidentCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
