'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('accident', {
      url: '/accidents/:accidentId',
      template: '<accidents></accidents>',
    });
}
