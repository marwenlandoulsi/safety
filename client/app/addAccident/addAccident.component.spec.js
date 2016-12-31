/*'use strict';

describe('Component: AddAccidentComponent', function() {
  // load the controller's module
  beforeEach(module('safetyWayApp.addAccident'));

  var AddAccidentComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    AddAccidentComponent = $componentController('addAccident', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
*/


'use strict';

import accident from './accident.component';
import {
  AccidentController
} from './accident.component';

describe('Component: addAccident', function() {
  beforeEach(angular.mock.module(addAccident));
  beforeEach(module('safetyWayApp.addAccident'));
  beforeEach(angular.mock.module('stateMock'));
  beforeEach(angular.mock.module('socketMock'));

  var scope;
  var accidentComponent;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $http, $stateParams, $componentController, $rootScope, $state,
                             socket) {
  /*  $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/accidents/'+$stateParams.accidentId)
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
*/
    scope = $rootScope.$new();
    state = $state;
    AddAccidentComponent = $componentController('addAccident', {
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
