'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new users
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function (user) {
      var token = jwt.sign({_id: user._id}, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({token});
    })
    .catch(validationError(res));
}

/**
 * Get a single users
 */
export function show(req, res, next) {
  var userId = req.params.id;
  var showUser = {};
  return User.findById(userId).exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      showUser = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
      res.json(showUser);
      //res.json(users.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a users
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({_id: userId}, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
// change role users
export function ChangeRole(req, res) {
  var userId = req.body.id;
  var newRole = String(req.body.newRole);
  return User.findById(userId).exec()
    .then(user => {
      if (user) {
        user.role = newRole;

        return user.save()
          .then(() => {
            res.json(user);
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}


// add an deviceToken
export function createDeviceToken(req, res) {
  var userId = req.body.id;
  var deviceToken = String(req.body.deviceToken);

  return User.findById(userId).exec()
    .then(user => {
      if (user) {
        user.deviceToken = deviceToken;

        return user.save()
          .then(() => {
            res.json(user);
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

// Upserts the given Accident in the DB at the specified ID
/*export function upsert(req, res) {
  if ((req.user._id != req.params.id) && (req.user.role != 'admin')) {
    return validationError(res);
  } else {
    if (req.body._id || req.body.role || req.body.email) {
      delete req.body._id;
      delete req.body.role;
      delete req.body.email;
    }
    return User.findOneAndUpdate({_id: req.params.id}, req.body, {
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }).exec()
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}*/

export function upsert(req, res) {
  var userId = req.params.id;
  if ((req.user._id != req.params.id) && (req.user.role != 'admin')) {
    return res.status(403).json({
      error : "unauthorized"
    });
  }else{
    /*if (req.body._id || req.body.role || req.body.email) {
      delete req.body._id;
      delete req.body.role;
      delete req.body.email;
    }*/
    return User.findById(userId).exec()
      .then(user => {
        if (user) {
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;
          user.age = req.body.age;
          user.gender = req.body.gender;
          user.firstContact = req.body.firstContact;
          user.secondContact = req.body.secondContact;
          user.thirdContact = req.body.thirdContact;
          user.blood = req.body.blood;

          return user.save()
            .then(() => {
              user =JSON.parse(JSON.stringify(user ));
              delete user.role;
              delete user.provider;
              delete user.salt;
              delete user.__v;
              delete user.password
              res.json(user);
            })
            .catch(validationError(res));
        } else {
          return res.status(403).end();
        }
      });
  }
}
