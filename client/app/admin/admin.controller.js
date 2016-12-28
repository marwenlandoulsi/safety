'use strict';

export default class AdminController {
  users: Object[];
  $http;
  /*@ngInject*/
  constructor(User, $http) {
    // Use the User $resource to fetch all users
    this.users = User.query();
    this.$http = $http;


  }


  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }

  changeRole(user, value) {
    this.$http.put('/api/users/'+user._id+'/newRole', {
      newRole: value
    });
    if (value == 'admin'){
      this.users.splice(this.users.indexOf(user), 1);
    }else{
      this.users[this.users.indexOf(user)].role = value;
    }

    //;
  }
}
