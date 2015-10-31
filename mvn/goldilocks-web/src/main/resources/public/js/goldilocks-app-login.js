(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-service', 'ngRoute' ]);

  module.config([ '$translatePartialLoaderProvider',
      function($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('login');
      } ]);


})(window, window.angular, window.qn);
