'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('addAccident', {
      url: '/addAccident',
      template: '<add-accident></add-accident>',
      authenticate: 'admin'
    });
}
