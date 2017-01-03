'use strict';

var express = require('express');
var controller = require('./accident.controller');
var reviewController = require('./review.controller');
import * as auth from '../../auth/auth.service';
import crypto from 'crypto';
var router = express.Router();
import multer from 'multer';
import mime from 'mime';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './dist/client/assets/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now());
    });
  }
});

var uploader = multer({
  storage: storage
});



//get all accidents
router.get('/', auth.hasRole('police'), controller.index);
//get all active accidents
router.get('/active', controller.getActive);
//get specific accidents
router.get('/:id', controller.show);
//add an accidents
router.post('/', auth.isAuthenticated(), uploader.array('upload', 10), controller.create);
//update accidents
router.put('/:id', auth.hasRole('police'), controller.upsert);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.hasRole('police'), controller.destroy);

//show pdf
router.get('/:id/pdf', controller.createPDF);


//add review
router.post('/:accidentid/reviews', auth.isAuthenticated(), uploader.array('upload', 10), reviewController.create);
//get one review
router.get('/:accidentid/reviews/:reviewid', reviewController.readOne);
//update one review
router.put('/:accidentid/reviews/:reviewid', auth.isAuthenticated(), reviewController.updateOne);
//delete one review
router.delete('/:accidentid/reviews/:reviewid', auth.isAuthenticated(), reviewController.deleteOne);

module.exports = router;
