'use strict';

var express = require('express');
var controller = require('./accident.controller');
import * as auth from '../../auth/auth.service';
import crypto from  'crypto';
var router = express.Router();
import multer from 'multer';
import mime from 'mime';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
var uploader = multer({ storage: storage});

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(),  uploader.array('upload', 10), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);


module.exports = router;
