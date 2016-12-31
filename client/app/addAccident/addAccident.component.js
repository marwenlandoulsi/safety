import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './addAccident.routes';
import NgMap from 'ngmap';


export class AddAccidentController {
  $http;
  socket;

  accident = {};
  user = {};
  idAccident;
  isLoggedIn: Function;
  isRescuer: Function;
  isAdmin: Function;
  getCurrentUser: Function;
  currentPath;
  pathPdf;
  isPath = false;
  ngmap;
 map;
  name;

  /*@ngInject*/
  constructor($http, $scope, socket, $stateParams, Auth, $location, NgMap) {
    this.$http = $http;
    this.socket = socket;
    this.idAccident = $stateParams.accidentId;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.currentPath = $location.path();
    this.isRescuer = Auth.isRescuerSync;
    this.isAdmin = Auth.isAdminSync();
    this.ngmap = NgMap;

  }
  placeChanged() {
    this.ngmap.getMap("map").then(function (map) {
      this.map = map;
      console.log(map);
    });
    this.map.setCenter(this.getPlace().geometry.location);
  }
  $onInit() {

    this.ngmap.getMap("map").then(function (map) {
      this.map = map;
      console.log(map);
    });
  }

  addAccident() {

    console.log('add ', this.accident);

    //this.$http.post('/api/accidents/', this.accident);
  }




}

export default angular.module('safetyWayApp.addAccident', [uiRouter, 'safetyWayApp.auth', NgMap])
  .config(routing)
  .component('addAccident', {
    template: require('./addAccident.html'),
    controller: AddAccidentController
  })
  .name;
