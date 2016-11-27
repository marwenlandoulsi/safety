'use strict';

var express = require('express');
var controller = require('./accident.controller');
import * as auth from '../../auth/auth.service';
import crypto from 'crypto';
var router = express.Router();
import multer from 'multer';
import mime from 'mime';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './client/assets/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
var uploader = multer({ storage: storage});
//get all accidents
router.get('/', auth.hasRole('police'), controller.index);
//get all active accidents
router.get('/active', controller.getActive);
//get specific accident
router.get('/:id', controller.show);
//add an accident
router.post('/', auth.isAuthenticated(), uploader.array('upload', 10), controller.create);
//update accident
router.put('/:id', auth.hasRole('police'), controller.upsert);
//add medias to accident
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.hasRole('police'), controller.destroy);


module.exports = router;
