import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './accident.routes';


export class AccidentController {
  $http;
  socket;
  accident = {};
  user = {};
  idAccident;
  isLoggedIn: Function;
  isRescuer:Function;
  isAdmin:Function;
  getCurrentUser: Function;
  currentPath;
  pathPdf;
  isPath=false;

  /*@ngInject*/
  constructor($http, $scope, socket, $stateParams, Auth, $location) {
    this.$http = $http;
    this.socket = socket;
    this.idAccident = $stateParams.accidentId;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.currentPath = $location.path();
    this.isRescuer = Auth.isRescuerSync;
    this.isAdmin = Auth.isAdminSync();
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('accident');
    });
  }

  $onInit() {
    console.log('ok');
    this.$http.get('/api/accidents/'+this.idAccident)
      .then(response => {
        this.accident = response.data;
        console.log(this.accident);
        this.socket.syncUpdates('accident', this.accident);
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

  getPDF(){
    this.$http.get('/api/accidents/'+this.idAccident+'/pdf')
      .then(
        response => {
          this.pathPdf = response.data.path;
          this.isPath=true;
        }
      );
  }
}

export default angular.module('safetyWayApp.accident', [uiRouter, 'safetyWayApp.auth'])
  .config(routing)
  .component('accident', {
    template: require('./accident.html'),
    controller: AccidentController
  })
  .name;
