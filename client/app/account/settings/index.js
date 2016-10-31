'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';

export default angular.module('safetyWayApp.settings', [])
  .controller('SettingsController', SettingsController)
  .name;
