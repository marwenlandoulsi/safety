'use strict';


export default class AdminController {
  users: [];
  $http;
  Modal;
  socket;
  user;
  /*@ngInject*/
  constructor(User, $http, Modal, $scope,socket) {
    // Use the User $resource to fetch all users
    this.user = User;
    //this.users = User.query();
    this.socket=socket;
    this.$http = $http;
    this.Modal = Modal;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('users');
    });

  }

  $onInit() {
    this.users = this.user.query();
    this.socket.syncUpdates('user', this.users);
  }
  delete(user) {
    console.log(user);
    var deleteConfirmationModal = this.Modal.confirm.delete((user) => {
      user.$remove();
      this.users.splice(this.users.indexOf(user), 1);
    });
    deleteConfirmationModal( 'the '+user.role+' : '+user.firstName+' '+user.lastName, user);
  }

  changeRole(user, value) {

    var changeRoleConfirmationModal = this.Modal.confirm.change((user) => {
        this.$http.put('/api/users/' + user._id + '/newRole', {
          id:user._id,
          newRole: value
        });
        if (value == 'admin') {
          this.users.splice(this.users.indexOf(user), 1);
        } else {
          this.users[this.users.indexOf(user)].role = value;
        }
    });

    changeRoleConfirmationModal(value, user);

  }
}
