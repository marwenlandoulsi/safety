'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('accident', {
      url: '/accident/:accidentId',
      template: '<accident></accident>',
    });
}
