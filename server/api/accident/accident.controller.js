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
import User from '../user/user.model';

var FCM = require('fcm-push');
var serverkey = 'AAAABSIc1-A:APA91bEOOFscXqyLcHMW_ZoEs5dM6N9aEr-oAc9_Yn3MGl0stT10xb7Aay3I4S4z0mT1XyxTck5llYBvwBlzyW7mzJdqj8wxQoouxm2j65cF-ySnI4NbjAt56OSmNerUAZHr1uIsAwWp';
var fcm = FCM(serverkey);
var pdf = require('pdfkit');
var fs = require('fs');
var GoogleMapsAPI = require('googlemaps');
var util = require('util');

var PdfPrinter = require('pdfmake/src/printer');

var fonts = {
  Roboto: {
    normal: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    bold: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    italics: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    bolditalics: './client/assets/fonts/pdf/Palatino_Bold.ttf'
  }
};
var printer = new PdfPrinter(fonts);

var pathPicture = 'D:/SafetyWay/client';
//var gm = require('google-static-map').set('AIzaSyDDc9smPTJ3qyEGYBiaWXjMPW1iSbfE8xk');
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
  /*if(req.user.role == 'admin' || req.user.role == 'police' || req.body.odb == 1){
    newAccident.active = true;
  }else{
    newAccident.active = false;
  }*/

  if (!newAccident.name){
    newAccident.name = 'accident created automatically';
  }
 /* if(!req.body.name) {
    newAccident.name = 'accident created automatically';
  }*/
  var medias = [];
  var newReviews = {};
  if(!req.body.saverity && !req.body.reviewText) {
    console.log('pas de saverity');
  }else{
    newReviews ={
      saverity: req.body.saverity,
      author: req.user.firstName+" "+req.user.lastName,
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
  if (newAccident.active==true){
    var message = {
      to: '<insert-device-token>',
      data: {
        name: 'test',
        lastname: 'test1',
      },
      notification: {
        title: 'Title of the notification',
        body: 'Body of the notification'
      }
    };
    fcm.send(message, function(err,response){
      if(err) {
        console.log("Something has gone wrong !");
      } else {
        console.log("Successfully sent with resposne :",response);
      }
    });
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

module.exports.createPDF= function(req, res) {
  Accident
    .findById(req.params.id)
    .exec(
      function(err, accident) {
        if (!accident) {
          sendJSONresponse(res, 404, {
            "message": "accident id not found"
          });
          return;
        }else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
          var myDoc = new pdf;
          var publicConfig = {
          key: 'AIzaSyDDc9smPTJ3qyEGYBiaWXjMPW1iSbfE8xk',
          stagger_time:       1000, // for elevationPath
          encode_polylines:   false

        };
        var gmAPI = new GoogleMapsAPI(publicConfig);

        var params = {
          center: [
            accident.coords[0]+','+accident.coords[1]
          ],
          zoom: 15,
          size: '500x400',
          maptype: 'roadmap',
          markers: [
            {
              location: [
                accident.coords[0]+','+accident.coords[1]
              ],
              label   : 'A',
              color   : 'red',
              shadow  : true
            }
          ],
          style: [
            {
              feature: 'road',
              element: 'all',
              rules: {
                hue: '0x00ff00'
              }
            }
          ]
        };

        gmAPI.staticMap(params, function(err, data) {
          var img  = new Buffer(data, 'binary').toString('base64');
          getUser(accident.createdBy, function (user, data) {
            console.log('generating the file ....');
           var pictures =[];

           var tabpic =[
           ['Author', 'URL']
           ];
           var tabvid =[
           ['Author', 'URL']
           ];

           for(var i= 0; i < accident.reviews.length; i++) {

             for(var j= 0; j < accident.reviews[i].medias.length; j++) {
               if ( accident.reviews[i].medias[j].type === 'picture'){
                 pictures.push(accident.reviews[i].medias[j]);

                 var objMedia = [
                 accident.reviews[i].author,
                 { text:"link", link:accident.reviews[i].medias[j].path, decoration:"underline"}
                 ];

                 tabpic.push(objMedia);
               }else{
                 var objMedia = [
                 accident.reviews[i].author,
                   { text:"link", link:accident.reviews[i].medias[j].path, decoration:"underline"}
                 ];
                 tabvid.push(objMedia);
               }
             }
           }

           var pic = { };
           if (pictures.length>=3){
               pic = {
               alignment: 'justify',
               columns: [
                 {
                   image: pathPicture+pictures[0].path,
                   fit: [150, 150],
                 },
                 {

                   image: pathPicture+pictures[Math.floor((pictures.length - 1) / 2)].path,
                   fit: [150, 150]
                 },
                 {
                   image: pathPicture+pictures[pictures.length-1].path,
                   fit: [150, 150],
                   pageBreak: 'after'
                 }
               ]
           };
           }else if (pictures.length==2){
           pic = {
           alignment: 'justify',
           columns: [
           {
           image: pathPicture+pictures[0].path,
           fit: [200, 200],
           },
           {
           image: pathPicture+pictures[1].path,
           fit: [200, 200],
           pageBreak: 'after'
           }
           ]
           };
           }else if(pictures.length==1){
           pic = {
           image: pathPicture+pictures[0].path,
           width: 150,
           height: 150,
           };
           }
           var picDet= {
             text: '\nPicture details:',
             style: 'header'
           };
           var tabPicDet ={
             style: 'tableExample',
             table: {
               body: tabpic
             }
           };
           if (pictures.length==0){
             picDet={

             };
             tabPicDet ={};
           }

           var vidDet ={
             text: '\nVideos :',
             style: 'header'
           }
            var tabVidDet={
              table: {
                body: tabvid
              }
            }
           if (tabvid.length == 1){
             vidDet = {};
             tabVidDet = {};
           }


           var dd = {
           content: [
           {
           text: 'Accident report!',
           style: 'header',
           alignment: 'center'
           },
           '\n\n',
           {
           image: 'data:image/jpeg;base64,'+img,
           width: 300,
           height: 250,
           alignment: 'center'
           },
           '\n',
           {
           text:'Location: '+accident.address,
           style: 'legend',
           alignment: 'center'
           },
           {
           text: '\n\nGeneral information:',
           style: 'header'
           },
           '\n\n',
           {
           columns: [
           {
           ul: [
           'Title: '+accident.name+'\n',
           'Date and Time: '+accident.createdOn.toISOString().replace(/T/, ' ').replace(/\..+/, '')+'\n',
           'Victim: '+user.firstName+' '+user.lastName,
           ]
           },
           {
           ul: [
           'First contact: '+user.firstContact+'\n',
           'Second contact: '+user.secondContact+'\n',
           'Third contact: '+user.thirdContact,
           ]
           }
           ]
           },
           {
           text: '\nPersonal health record:',
           style: 'header'
           },
           {
           ul: [
           'Age: '+user.age+'\n',
           'Blood type: '+user.blood,
           ]
           },
            picDet,
           pic,
           tabPicDet,
           vidDet,
           tabVidDet,
           ],
           styles: {
             header: {
               fontSize: 25,
               bold: true,
               alignment: 'justify'
             },
             legend: {
               fontSize: 12,
               bold: true,
               alignment: 'justify'
             },
             texte: {
               fontSize: 15,
               bold: false,
               alignment: 'justify'
              }
             /*tableExample: {
              margin: [0, 5, 0, 15]
             }*/
           }
           }
           var pdfDoc = printer.createPdfKitDocument(dd);
           pdfDoc.pipe(fs.createWriteStream('./client/assets/report/'+accident.id+'.pdf')).on('finish',function(){
           sendJSONresponse(res, 200, {
             path: '/assets/report/'+accident.id+'.pdf'
           });
           });
           pdfDoc.end();

           });
        });
          return;
      }
    );
}

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var getUser = function(id, callback) {
    User
      .findById(id)
      .exec(function(err, user) {
        if (!user) {
          console.log("user not found");
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        callback(user);
        return;
      });
}
