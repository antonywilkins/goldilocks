"use strict";

(function(window, angular, qn) {

  var module = angular.module("goldilocks-ui", [ 'goldilocks-util-ui', 'goldilocks-service' ]);

  // *** Directives ***

  module.run([ '$keepAlive', function($keepAlive) {
    $keepAlive(1200);
  } ]);

  module.directive('username', [ '$q', '$userService', function($q, $userService) {
    return {
      require : 'ngModel',
      link : function(scope, elm, attrs, ctrl) {

        ctrl.$asyncValidators.username = function(modelValue, viewValue) {

          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.when();
          }

          var def = $q.defer();
          $userService.findById(viewValue).then(function(result) {
            if (qn.isEmpty(result)) {
              return def.resolve();
            } else {
              return def.reject();
            }
          }, function(reason) {
            return def.reject();
          });

          return def.promise;
        };
      }
    };
  } ]);
})(window, window.angular, window.qn);
