(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-service', 'ngRoute' ]);

  module.config(['$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('account');

    $routeProvider.when("/change-password", {
      templateUrl : '/partials/account/password.html',
      controller : 'ChangePasswordController',
      resolve : {
        user : function($user) {
          return $user;
        }
      }
    });
  }]);

  module.controller('ChangePasswordController', [
      '$scope',
      '$window',
      '$pageContext',
      '$actions',
      '$alertService',
      '$accountService',
      'user',
      function($scope, $window, $pageContext, $actions, $alertService,
          $accountService, user) {
        $scope.user = user;
        $pageContext.clearPageActions();
        var action = $actions.newAction({
          label : 'actions.changePassword',
          primary : true,
          enabled : function() {
            if ($scope.editForm.$invalid) {
              return false;
            }
            return $scope.newUserPassword == $scope.newUserPassword2
                && $scope.existingUserPassword != $scope.newUserPassword;
          },
          performAction : function() {
            return $accountService.changePassword($scope.existingUserPassword,
                $scope.newUserPassword).then(function(saved) {
              $alertService.raiseAlert({
                type : "success",
                messageId : "user.passwordchange.success",
                autoAcknowledge : true
              });
              $window.location.href = "/";
              return saved;
            });
          }
        });
        $pageContext.addPageAction(action);

        $scope.existingUserPassword = null;
        $scope.newUserPassword = null;
        $scope.newUserPassword2 = null;
      } ]);

})(window, window.angular, window.qn);
