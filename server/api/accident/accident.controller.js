/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/accidents              ->  index
 * POST    /api/accidents              ->  create
 * GET     /api/accidents/:id          ->  show
 * PUT     /api/accidents/:id          ->  upsert
 * PATCH   /api/accidents/:id          ->  patch
 * DELETE  /api/accidents/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Accident from './accident.model';


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Accidents
export function index(req, res) {
  return Accident.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Accident from the DB
export function show(req, res) {
  return Accident.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Creates a new Accident in the DB
export function create(req, res) {
  var newAccident = new Accident(req.body);
  newAccident.createdBy = req.user.id;
  if(req.user.role == 'admin' || req.user.role == 'police' || req.body.odb == 1){
    newAccident.active = true;
  }else{
    newAccident.active = false;
  }
  if(!req.body.name) {
    newAccident.name = 'accident create automatically';
  }
  var medias = [];
  var newReviews = {};
  if(!req.body.saverity && !req.body.reviewText) {
    console.log('pas de saverity');
  }else{
    newReviews ={
      saverity: req.body.saverity,
      author: req.user.id,
      reviewText: req.body.reviewText,
      medias: medias
    }
  }

  if(req.files) {
    var path1 = '/assets/uploads/';
    for(var i= 0; i < req.files.length; i++)
    {
      console.log('uploading files ... ');
      if(req.files[i].mimetype !== 'image/jpg' && req.files[i].mimetype !== 'image/jpeg'
        && req.files[i].mimetype !== 'image/png' && req.files[i].mimetype !== 'image/gif'
        && req.files[i].mimetype !== 'video/mpeg' && req.files[i].mimetype !== 'video/mp4'
        && req.files[i].mimetype !== 'video/quicktime' && req.files[i].mimetype !== 'video/x-ms-wmv'
        && req.files[i].mimetype !== 'video/x-msvideo' && req.files[i].mimetype !== 'video/x-flv' )
      {
        sendJSONresponse(res, 400, 'error mimetype');
        return;
      }
      else if (req.files[i].mimetype == 'image/jpg' ||  req.files[i].mimetype == 'image/jpeg'
        ||  req.files[i].mimetype == 'image/png' || req.files[i].mimetype == 'image/gif' )
      {
        var newMedias={};
        newMedias.name =  req.files[i].filename;
        newMedias.type= 'picture';
        newMedias.path = path1  + req.files[i].filename;
        newReviews.medias.push(newMedias);
      }
      else if (req.files[i].mimetype == 'video/mpeg' ||  req.files[i].mimetype == 'video/mp4'
        ||  req.files[i].mimetype == 'video/quicktime' ||  req.files[i].mimetype == 'video/x-ms-wmv'
        ||  req.files[i].mimetype == 'video/x-msvideo' ||  req.files[i].mimetype == 'video/x-flv' )
      {
        var newMedias={};
        newMedias.name =  req.files[i].filename;
        newMedias.type= 'video';
        newMedias.path = path1 + req.files[i].filename;
        newReviews.medias.push(newMedias);
      }
    }
  }
  if (!isEmpty(newReviews)){
    newAccident.reviews.push(newReviews);
  }
  return Accident.create(newAccident)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Accident in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Accident.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Accident in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Accident.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Accident from the DB
export function destroy(req, res) {
  return Accident.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Gets a list all active Accidents
export function getActive(req, res) {
  return Accident.find({ active: true }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
