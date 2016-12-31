import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  accidents = [];
  newAccident = '';

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('accidents');
    });
  }

  $onInit() {
    this.$http.get('/api/accidents/active')
      .then(response => {
        this.accidents = response.data;
        this.socket.syncUpdates('accident', this.accidents);
      });
  }

  addAccident() {
    if(this.newAccident) {
      this.$http.post('/api/accidents/', {
        name: this.newAccident
      });
      this.newAccident = '';
    }
  }

  deleteAccident(accident) {
    this.$http.delete(`/api/accidents/${accident._id}`);
  }


}

export default angular.module('safetyWayApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
