import angular from 'angular';

export class FooterComponent {
  date : date ;
  constructor() {
    this.date = new Date();
  }
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;
