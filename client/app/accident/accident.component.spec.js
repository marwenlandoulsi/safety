'use strict';

import accident from './accident.component';
import {
  AccidentController
} from './accident.component';

describe('Component: AccidentComponent', function() {
  beforeEach(angular.mock.module(accident));
  beforeEach(angular.mock.module('stateMock'));
  beforeEach(angular.mock.module('socketMock'));

  var scope;
  var accidentComponent;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $http, $stateParams, $componentController, $rootScope, $state,
                             socket) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/accident/'+$stateParams.accidentId)
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    state = $state;
    accidentComponent = $componentController('accident', {
      $http,
      $scope: scope,
      socket
    });
  }));

  it('should attach a list of accidents to the controller', function() {
    accidentComponent.$onInit();
    $httpBackend.flush();
    expect(mainComponent.awesomeThings.length)
      .toBe(4);
  });
});
