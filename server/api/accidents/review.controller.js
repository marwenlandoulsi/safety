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

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};
module.exports.create = function(req, res) {
      Accident
        .findById(req.params.accidentid)
        .select('reviews')
        .exec(
          function(err, accident) {
            if (err) {
              sendJSONresponse(res, 400, err);
            } else {
              doAddReview(req, res, accident);
            }
          }
        );
    }


var doAddReview = function(req, res, accident, err) {
  if (!accident) {
    sendJSONresponse(res, 404, "accidentid not found");
  } else {
    var medias = [];
    var newReviews ={
      saverity: req.body.saverity,
      author: req.user.firstName+" "+req.user.lastName,
      reviewText: req.body.reviewText,
      medias: medias
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
      accident.reviews.push(newReviews);
    }
    accident.save(function(err, accident) {
      var thisReview;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        //updateAverageRating(location._id);
        thisReview = accident.reviews[accident.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

module.exports.readOne = function(req, res) {
  Accident
    .findById(req.params.accidentid)
    .select('name reviews')
    .exec(
      function(err, accident) {
        console.log(accident);
        var response, review;
        if (!accident) {
          sendJSONresponse(res, 404, {
            "message": "accidents id not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (accident.reviews && accident.reviews.length > 0) {
          review = accident.reviews.id(req.params.reviewid);
          if (!review) {
            sendJSONresponse(res, 404, {
              "message": "review id not found"
            });
          } else {
            sendJSONresponse(res, 200, review);
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No reviews found"
          });
        }
      }
    );
}

module.exports.updateOne= function(req, res) {
  Accident
    .findById(req.params.accidentid)
    .select('reviews')
    .exec(
      function(err, accident) {
        var thisReview;
        if (!accident) {
          sendJSONresponse(res, 404, {
            "message": "accidents id not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (accident.reviews && accident.reviews.length > 0) {
          thisReview = accident.reviews.id(req.params.reviewid);


          if (!thisReview) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            if (thisReview.author!=req.user.id){
              sendJSONresponse(res, 404, {
                "message": "you are not the author of review"
              });
            }else{
              if(req.body.reviewText)
                thisReview.reviewText = req.body.reviewText;

              if(req.body.saverity)
                thisReview.saverity = req.body.saverity;

                var index;
              for(var i = 0, len = accident.reviews.length; i < len; i++) {
                if (accident.reviews[i].id === req.params.reviewid) {
                  accident.reviews[i] = thisReview;
                  index=i;
                  break;
                }
              }
              accident.save(function(err) {
                if (err) {
                  sendJSONresponse(res, 404, err);
                } else {
                  sendJSONresponse(res, 200, accident.reviews[index]);
                }
              });
            }


          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to update"
          });
        }
      }
    );
}

module.exports.deleteOne = function(req, res) {
  Accident
    .findById(req.params.accidentid)
    .select('reviews')
    .exec(
      function(err, accident) {
        if (!accident) {
          sendJSONresponse(res, 404, {
            "message": "accidents id not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (accident.reviews && accident.reviews.length > 0) {
          if (!accident.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "review id not found"
            });
          } else {
            accident.reviews.id(req.params.reviewid).remove();
            accident.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                sendJSONresponse(res, 204, {
                  "message": "review deleted"
                });
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
    );
}

