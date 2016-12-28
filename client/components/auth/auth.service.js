'use strict';
// @flow

class _User {
  _id: string = '';
  firstName: string = '';
  email: string = '';
  role: string = '';
  $promise = undefined;
}

export function AuthService($location, $http, $cookies, $q, appConfig, Util, User) {
  'ngInject';

  var safeCb = Util.safeCb;
  var currentUser: _User = new _User();
  var userRoles = appConfig.userRoles || [];
  /**
   * Check if userRole is >= role
   * @param {String} userRole - role of current users
   * @param {String} role - role to check against
   */
  var hasRole = function(userRole, role) {
    return userRoles.indexOf(userRole) >= userRoles.indexOf(role);
  };

  if($cookies.get('token') && $location.path() !== '/logout') {
    currentUser = User.get();
  }

  var Auth = {
    /**
     * Authenticate users and save token
     *
     * @param  {Object}   users     - login info
     * @param  {Function} callback - function(error, users)
     * @return {Promise}
     */
    login({
      email,
      password
    }, callback ? : Function) {
      return $http.post('/auth/local', {
        email,
        password
      })
        .then(res => {
          $cookies.put('token', res.data.token);
          currentUser = User.get();
          return currentUser.$promise;
        })
        .then(user => {
          safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          Auth.logout();
          safeCb(callback)(err.data);
          return $q.reject(err.data);
        });
    },

    /**
     * Delete access token and users info
     */
    logout() {
      $cookies.remove('token');
      currentUser = new _User();
    },

    /**
     * Create a new users
     *
     * @param  {Object}   user     - users info
     * @param  {Function} callback - function(error, users)
     * @return {Promise}
     */
    createUser(user, callback ? : Function) {
      return User.save(user, function(data) {
        $cookies.put('token', data.token);
        currentUser = User.get();
        return safeCb(callback)(null, user);
      }, function(err) {
        Auth.logout();
        return safeCb(callback)(err);
      })
        .$promise;
    },

    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - function(error, users)
     * @return {Promise}
     */
    changePassword(oldPassword, newPassword, callback ? : Function) {
      return User.changePassword({
        id: currentUser._id
      }, {
        oldPassword,
        newPassword
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      })
        .$promise;
    },

    /**
     * Gets all available info on a users
     *
     * @param  {Function} [callback] - function(users)
     * @return {Promise}
     */
    getCurrentUser(callback ? : Function) {
      var value = _.get(currentUser, '$promise') ? currentUser.$promise : currentUser;

      return $q.when(value)
        .then(user => {
          safeCb(callback)(user);
          return user;
        }, () => {
          safeCb(callback)({});
          return {};
        });
    },

    /**
     * Gets all available info on a users
     *
     * @return {Object}
     */
    getCurrentUserSync() {
      return currentUser;
    },

    /**
     * Check if a users is logged in
     *
     * @param  {Function} [callback] - function(is)
     * @return {Promise}
     */
    isLoggedIn(callback ? : Function) {
      return Auth.getCurrentUser(undefined)
        .then(user => {
          let is = _.get(user, 'role');

          safeCb(callback)(is);
          return is;
        });
    },

    /**
     * Check if a users is logged in
     *
     * @return {Bool}
     */
    isLoggedInSync() {
      return !!_.get(currentUser, 'role');
    },

    /**
     * Check if a users has a specified role or higher
     *
     * @param  {String}     role     - the role to check against
     * @param  {Function} [callback] - function(has)
     * @return {Promise}
     */
    hasRole(role, callback ? : Function) {
      return Auth.getCurrentUser(undefined)
        .then(user => {
          let has = hasRole(_.get(user, 'role'), role);

          safeCb(callback)(has);
          return has;
        });
    },

    /**
     * Check if a users has a specified role or higher
     *
     * @param  {String} role - the role to check against
     * @return {Bool}
     */
    hasRoleSync(role) {
      return hasRole(_.get(currentUser, 'role'), role);
    },

    /**
     * Check if a users is an admin
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */
    isAdmin() {
      return Auth.hasRole(...[].concat.apply(['admin'], arguments));
    },

    /**
     * Check if a users is an admin
     *
     * @return {Bool}
     */
    isAdminSync() {
      return Auth.hasRoleSync('admin');
    },

    isRescuerSync() {
      return Auth.hasRoleSync('rescuer');
    },
    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
    getToken() {
      return $cookies.get('token');
    }
  };

  return Auth;
}
