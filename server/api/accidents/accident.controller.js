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
import User from '../users/user.model';

var FCM = require('fcm-push');
var serverkey = 'AAAABSIc1-A:APA91bEOOFscXqyLcHMW_ZoEs5dM6N9aEr-oAc9_Yn3MGl0stT10xb7Aay3I4S4z0mT1XyxTck5llYBvwBlzyW7mzJdqj8wxQoouxm2j65cF-ySnI4NbjAt56OSmNerUAZHr1uIsAwWp';

var pdf = require('pdfkit');
var fs = require('fs');
var GoogleMapsAPI = require('googlemaps');
var util = require('util');
var gcm = require('node-gcm');
var PdfPrinter = require('pdfmake/src/printer');
import multer from 'multer';
var storage = multer.diskStorage({
  /*destination: function (req, file, cb) {
   cb(null, './dist/client/assets/uploads/')
   },
   filename: function (req, file, cb) {
   crypto.pseudoRandomBytes(16, function (err, raw) {
   cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
   });

   }*/
  limits: {fileSize: 100000000}
});
var uploader = multer({storage: storage});
var fonts = {
  Roboto: {
    normal: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    bold: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    italics: './client/assets/fonts/pdf/Palatino_Bold.ttf',
    bolditalics: './client/assets/fonts/pdf/Palatino_Bold.ttf'
  }
};
var printer = new PdfPrinter(fonts);

//var gm = require('google-static-map').set('AIzaSyDDc9smPTJ3qyEGYBiaWXjMPW1iSbfE8xk');
function respondWithResult(res, statusCode) {

  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  console.log("ok");
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
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
  /*if(req.users.role == 'admin' || req.users.role == 'police' || req.body.odb == 1){
   newAccident.active = true;
   }else{
   newAccident.active = false;
   }*/
  newAccident.active = true;
  if (!newAccident.name) {
    newAccident.name = 'Make attention ! There is an accidents in ' + newAccident.address;
  }

  var medias = [];
  var newReviews = {};
  if (!req.body.saverity && !req.body.reviewText && !req.files) {
    /*sendJSONresponse(res, 200, {
     error: 'no observation (review)'
     });*/
    console.log('no observation (review)')
  } else {
    newReviews = {
      saverity: req.body.saverity,
      author: req.user.id,
      reviewText: req.body.reviewText,
      medias: medias
    }
  }

  if (req.files) {
    var path1 = '/assets/uploads/';
    for (var i = 0; i < req.files.length; i++) {
      console.log('uploading files ... ');
      if (req.files[i].mimetype !== 'image/jpg' && req.files[i].mimetype !== 'image/jpeg'
        && req.files[i].mimetype !== 'image/png' && req.files[i].mimetype !== 'image/gif'
        && req.files[i].mimetype !== 'video/mpeg' && req.files[i].mimetype !== 'video/mp4'
        && req.files[i].mimetype !== 'video/quicktime' && req.files[i].mimetype !== 'video/x-ms-wmv'
        && req.files[i].mimetype !== 'video/x-msvideo' && req.files[i].mimetype !== 'video/x-flv') {
        sendJSONresponse(res, 400, 'error mimetype');
        return;
      }
      else if (req.files[i].mimetype == 'image/jpg' || req.files[i].mimetype == 'image/jpeg'
        || req.files[i].mimetype == 'image/png' || req.files[i].mimetype == 'image/gif') {
        var newMedias = {};
        newMedias.name = req.files[i].filename;
        newMedias.type = 'picture';
        newMedias.path = path1 + req.files[i].filename;
        newReviews.medias.push(newMedias);
      }
      else if (req.files[i].mimetype == 'video/mpeg' || req.files[i].mimetype == 'video/mp4'
        || req.files[i].mimetype == 'video/quicktime' || req.files[i].mimetype == 'video/x-ms-wmv'
        || req.files[i].mimetype == 'video/x-msvideo' || req.files[i].mimetype == 'video/x-flv') {
        var newMedias = {};
        newMedias.name = req.files[i].filename;
        newMedias.type = 'video';
        newMedias.path = path1 + req.files[i].filename;
        newReviews.medias.push(newMedias);
      }
    }
  }
  if (!isEmpty(newReviews)) {
    newAccident.reviews.push(newReviews);
  }
  var regTokens = [];
  getAllUser(res, function (users) {
    // Statement bodies
    users.forEach(user => {
      regTokens.push(user.deviceToken);
    });
    if (regTokens.length > 0) {
      sendNotification(res, newAccident, regTokens);
    } else {
      sendJSONresponse(res, 304, {
        "error": "no tokens found"
      });
      return;
    }
  });
  return Accident.create(newAccident)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


// Upserts the given Accident in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Accident.findOneAndUpdate({_id: req.params.id}, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Accident in the DB
export function patch(req, res) {
  if (req.body._id) {
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
  return Accident.find({active: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

module.exports.createPDF = function (req, res) {
  Accident
    .findById(req.params.id)
    .exec(
      function (err, accident) {
        if (!accident) {
          sendJSONresponse(res, 404, {
            "message": "accidents id not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        var myDoc = new pdf;
        var publicConfig = {
          key: 'AIzaSyDDc9smPTJ3qyEGYBiaWXjMPW1iSbfE8xk',
          stagger_time: 1000, // for elevationPath
          encode_polylines: false

        };
        var gmAPI = new GoogleMapsAPI(publicConfig);

        var params = {
          center: [
            accident.coords[0] + ',' + accident.coords[1]
          ],
          zoom: 15,
          size: '500x400',
          maptype: 'roadmap',
          markers: [
            {
              location: [
                accident.coords[0] + ',' + accident.coords[1]
              ],
              label: 'A',
              color: 'red',
              shadow: true
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

        gmAPI.staticMap(params, function (err, data) {
          var img = new Buffer(data, 'binary').toString('base64');
          getUser(res, accident.createdBy, function (user, data) {
            console.log('generating the file ....');
            var pictures = [];
            console.log(user);
            var tabpic = [
              ['Author', 'URL']
            ];
            var tabvid = [
              ['Author', 'URL']
            ];

            for (var i = 0; i < accident.reviews.length; i++) {

              for (var j = 0; j < accident.reviews[i].medias.length; j++) {
                if (accident.reviews[i].medias[j].type === 'picture') {
                  pictures.push(accident.reviews[i].medias[j]);

                  var objMedia = [
                    accident.reviews[i].author,
                    {text: "link", link: accident.reviews[i].medias[j].path, decoration: "underline"}
                  ];

                  tabpic.push(objMedia);
                } else {
                  var objMedia = [
                    accident.reviews[i].author,
                    {text: "link", link: accident.reviews[i].medias[j].path, decoration: "underline"}
                  ];
                  tabvid.push(objMedia);
                }
              }
            }
            var pathUploded = './dist/client';
            var pic = {};
            if (pictures.length >= 3) {

              pic = {
                alignment: 'justify',
                columns: [
                  {
                    image: pathUploded + pictures[0].path,
                    fit: [150, 150],
                  },
                  {

                    image: pathUploded + pictures[Math.floor((pictures.length - 1) / 2)].path,
                    fit: [150, 150]
                  },
                  {
                    image: pathUploded + pictures[pictures.length - 1].path,
                    fit: [150, 150],
                    pageBreak: 'after'
                  }
                ]
              };
            } else if (pictures.length == 2) {

              pic = {
                alignment: 'justify',
                columns: [
                  {
                    image: pathUploded + pictures[0].path,
                    fit: [200, 200],
                  },
                  {
                    image: pathUploded + pictures[1].path,
                    fit: [200, 200],
                    pageBreak: 'after'
                  }
                ]
              };
            } else if (pictures.length == 1) {

              pic = {
                image: pathUploded + pictures[0].path,
                width: 150,
                height: 150,
              };
            }
            var picDet = {
              text: '\nPicture details:',
              style: 'header'
            };
            var morePic = {
              text: '\nMore Pictures :',
              style: 'header'
            };
            var tabPicDet = {
              style: 'tableExample',
              table: {
                body: tabpic
              }
            };
            if (pictures.length == 0) {
              morePic = {};
              picDet = {};
              tabPicDet = {};
            }

            var vidDet = {
              text: '\nVideos :',
              style: 'header'
            }
            var tabVidDet = {
              table: {
                body: tabvid
              }
            }
            if (tabvid.length == 1) {
              vidDet = {};
              tabVidDet = {};
            }

            var accidentDet = {
              columns: [
                {
                  ul: [
                    'Title: ' + accident.name + '\n',
                    'Date and Time: ' + accident.createdOn.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n',
                    'Victim: ' + user.firstName + ' ' + user.lastName
                  ]
                },
                {
                  ul: [
                    'First contact: ' + user.firstContact + '\n',
                    'Second contact: ' + user.secondContact + '\n',
                    'Third contact: ' + user.thirdContact
                  ]
                }
              ]
            };

            var titleHealthRecord =
              {
                text: '\nPersonal health record:',
                style: 'header'
              };
            var healthRecord = {
              ul: [
                'Age: ' + user.age + '\n',
                'Gender: ' + user.gender + '\n',
                'Blood type: ' + user.blood
              ]
            };


            if (user.role != 'user') {
              accidentDet = {
                columns: [
                  {
                    ul: [
                      'Title: ' + accident.name + '\n',
                      'Date and Time: ' + accident.createdOn.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n',
                      'Victim: undefined Victim'
                    ]
                  }
                ]
              };
              titleHealthRecord = {};
              healthRecord = {};
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
                  image: 'data:image/jpeg;base64,' + img,
                  width: 300,
                  height: 250,
                  alignment: 'center'
                },
                '\n',
                {
                  text: 'Location: ' + accident.address,
                  style: 'legend',
                  alignment: 'center'
                },
                {
                  text: '\n\nGeneral information:',
                  style: 'header'
                },
                '\n\n',
                accidentDet,
                titleHealthRecord,
                healthRecord,
                picDet,
                pic,
                morePic,
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
            pdfDoc.pipe(fs.createWriteStream('./dist/client/assets/report/' + accident.id + '.pdf')).on('finish', function () {
              sendJSONresponse(res, 200, {
                path: '/assets/report/' + accident.id + '.pdf'
              });
            });
            pdfDoc.end();

          });
        });
        return;
      }
    );
}

var sendJSONresponse = function (res, status, content) {
  return res.status(status).json(content).end();
};

var getUser = function (res, id, callback) {
  User
    .findById(id)
    .exec(function (err, user) {
      if (!user) {
        console.log("users not found");
        sendJSONresponse(res, 404, "users not found");
        // res.status(404).json("users not found").end();
      } else if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        callback(user);
        return;
      }

    });
};
var getAllUser = function (res, callback) {
  User
    .find({}, '-salt -password')
    .exec(function (err, users) {
      if (!users) {
        sendJSONresponse(res, 404, "users not found");
        // res.status(404).json("users not found").end();
      } else if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        callback(users);
        return;
      }

    });
};

var sendNotification = function (res, accident, regTokens) {

  var message = new gcm.Message({
    data: {
      id: accident._id,
      lng: accident.coords[0],
      lat:accident.coords[1]
    },
    notification: {
      title: "New Accident added",
      icon: "ic_launcher",
      body: "Attention there is new accident."
    }
  });

  var sender = new gcm.Sender('AIzaSyD_agkFeIf6LIxdWvy67Itkc57LGPk3xdQ');
  sender.send(message, {registrationTokens: regTokens}, function (err, response) {
    if (err) {
      console.error(err);
      return res.status(400).end();
    }
    else {
      console.log(response);
    }

  });
  /* var message = {
   to: token, // required fill with device token or topics
   notification: {
   title: 'Title of your push notification',
   body: 'Body of your push notification'
   }
   };

   fcm.send(message, function(err, response){
   if (err) {
   console.log("Something has gone wrong!");
   } else {
   console.log("Successfully sent with response: ", response);
   }
   });*/

  /*var message = new gcm.Message({
   data: {
   id: idAccident
   },
   notification: {
   title: "New Accident",
   icon: "ic_launcher",
   body: "Attention there is new accident."
   }
   });*/
  /*message.addNotification({
   title: 'Alert!!!',
   body: 'Abnormal data access',
   icon: 'ic_launcher'
   });*/
//  var sender = new gcm.Sender('AIzaSyD_agkFeIf6LIxdWvy67Itkc57LGPk3xdQ');
  //var regTokens = ['APA91bGnstcW1q_V9DLi291a8PKVRQde130blR3rmFQdFPFHPInE-7b307xcr3UbZNseAoyew56uYgkoWyHR40uhkU2TrNezzXLvqJkOGvoz6u8_y2H8Et9uTVjSBGGAMItx-VftoNCl'];
  // var regTokens = tokens;

  /*sender.send(message, { registrationTokens: tokens }, function (err, response) {
   if(err) console.error(err);
   else 	console.log(response);
   });*/


};

export function send(res) {
  /* var keyServer ='AAAAFRFeCzY:APA91bFl6fZOfua9gwqJsucnyXIoAlTkUIqE4gXP_lLz0joscFph2Ls_c4IkfAyWLDF0WTpz6U1MIiyYZcJNB66CxBDGUjtBg7TlZi41xVmwlW9yjGiN0N_4d5QtetNaBRZmbxzdQeOdQAh7ivPocuyMjkrh8NxACw';
   var fcm = new FCM(keyServer);

   if(sendNotification(fcm, 'd5JfjOGZR4A:APA91bG_Ywe2LlIsGhzogw1By-c28za8lxZoMkC0d0OH3FWG6J6f-dOS3WG5P5MqvepVO0zpdpXLuBbHoherXGJPLPeCUHc4em6jtHrAFO-qNL2qwyHumdkhM4S-CDpxTeipRaLv3LCW')
   ){
   return res.status(200).end();
   }else{
   return res.status(400).end();
   }*/
  //var message = new gcm.Message();
  ;
  /*message.addNotification({
   title: 'Alert!!!',
   body: 'Abnormal data access',
   icon: 'ic_launcher'
   });*/
  var message = new gcm.Message({
    data: {
      id: idAccident
    },
    notification: {
      title: "New Accident added",
      icon: "ic_launcher",
      body: "Attention there is new accident."
    }
  });

  var regTokens = ['APA91bGnstcW1q_V9DLi291a8PKVRQde130blR3rmFQdFPFHPInE-7b307xcr3UbZNseAoyew56uYgkoWyHR40uhkU2TrNezzXLvqJkOGvoz6u8_y2H8Et9uTVjSBGGAMItx-VftoNCl'];
  sender.send(message, {registrationTokens: regTokens}, function (err, response) {
    if (err) {
      console.error(err);
      return res.status(400).end();
    }
    else {
      console.log(response);
    }

  });

}
