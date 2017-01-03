import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './addAccident.routes';
import NgMap from 'ngmap';


export class AddAccidentController {
  $http;
  socket;
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
  $state;
  errors = {};
  submitted = false;

  /*@ngInject*/
  constructor($http, $scope, socket, $stateParams, Auth, $location, NgMap, $state) {
    this.$http = $http;
    this.socket = socket;
    this.idAccident = $stateParams.accidentId;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.currentPath = $location.path();
    this.isRescuer = Auth.isRescuerSync;
    this.isAdmin = Auth.isAdminSync();
    this.$state=$state;
    /*this.ngmap = NgMap;
    this.ngmap.getMap("map").then((map) => {
      this.map = map;

    });*/
    this.ngmap=NgMap;
    $scope.placeChanged = function() {
      $scope.place = this.getPlace();
      $scope.map.setCenter($scope.place.geometry.location);

    };
    $scope.$on('mapInitialized', function(event, evtMap) {
      var map = evtMap;
        var latLng = new google.maps.LatLng(0, 0);
        var marker = new google.maps.Marker({position: latLng});
        google.maps.event.addListener(marker, 'click', function() {

          alert("this is marker " + i);
        });
     // $scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {});
    });
/*
    google.maps.event.addListener(marker, 'dragend', function (event) {
      document.getElementById("latbox").value = this.getPosition().lat();
      document.getElementById("lngbox").value = this.getPosition().lng();
    });*/
    /*
    var marker = new NgMap.maps.Marker({position:$scope.place.geometry.location});

    NgMap.event.addListener(marker, 'dragend', function (event) {
      console.log(this.getPosition().lat()) ;
     // document.getElementById("lngbox").value = this.getPosition().lng();
    });*/

    NgMap.getMap().then(function(map) {
      $scope.map = map;
    });/*
    var marker = new google.maps.Marker({position: 'current'});
    google.maps.event.addListener(marker, 'click', function() {

      alert("this is marker " + i);
    });
*/
  }
/*
  placeChanged() {
    this.ngmap.getMap("map").then((map) => {
      this.map = map;
    })
    this.map.setCenter(this.getPlace().geometry.location);
  }*/


  addAccident(name, address, lat, lng) {

    if (name && address && lat && lng)
    {
      var accident = {
        address : address,
        name: name,
        coords : [lat, lng],
        active: true
      };
      this.$http.post('/api/accidents', accident).then(
        console.log('accident ', accident)
      );



    }

    //this.$http.post('/api/accidents/', this.accident);
  }

  ondrag(){
    console.log("ooooooooooooooool");
  }

}

export default angular.module('safetyWayApp.addAccident', [uiRouter, 'safetyWayApp.auth', NgMap])
  .config(routing)
  .component('addAccident', {
    template: require('./addAccident.html'),
    controller: AddAccidentController
  })
  .name;
