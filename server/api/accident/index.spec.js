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

  describe('GET /api/accident', function() {
    it('should route to accident.controller.index', function() {
      routerStub.get
        .withArgs('/', 'accidentCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/accident/:id', function() {
    it('should route to accident.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'accidentCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/accident', function() {
    it('should route to accident.controller.create', function() {
      routerStub.post
        .withArgs('/', 'accidentCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/accident/:id', function() {
    it('should route to accident.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'accidentCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/accident/:id', function() {
    it('should route to accident.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'accidentCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/accident/:id', function() {
    it('should route to accident.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'accidentCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
