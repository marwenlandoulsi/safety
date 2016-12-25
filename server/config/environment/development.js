'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://127.0.0.1/safetyway-dev'
  },

  // Seed database on startup
  seedDB: true

};
