(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui', 'goldilocks-service', 'ngRoute' ]);

  module.config([ '$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('user');

    $routeProvider.when("/", {
      templateUrl : '/partials/user/list.html',
      controller : 'ListController'
    }).when("/new", {
      templateUrl : '/partials/user/edit.html',
      controller : 'EditController',
      resolve : {
        user : function($userService) {
          return $userService.newModel();
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/edit/:id", {
      templateUrl : '/partials/user/edit.html',
      controller : 'EditController',
      resolve : {
        user : function($route, $userService) {
          var id = $route.current.params.id;
          return $userService.findById(id);
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/view/:id", {
      templateUrl : '/partials/user/edit.html',
      controller : 'EditController',
      resolve : {
        user : function($route, $userService) {
          var id = $route.current.params.id;
          return $userService.findById(id);
        },
        editMode : function() {
          return false;
        }
      }
    }).otherwise({
      redirectTo : '/'
    });
  } ]);

  module.run([ '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
      $location.path('/');
    });
  } ]);

  // page level controllers
  module.controller('ListController', [ '$scope', '$location', '$pagination', '$actions', '$pageContext', '$dialogs', '$alertService',
      '$userService', '$user',
      function($scope, $location, $pagination, $actions, $pageContext, $dialogs, $alertService, $userService, $user) {
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $userService.findByIdOrName($scope.pageInfo.filter, $scope.pageInfo.currentPage, $scope.pageInfo);
        };
        $scope.sortBy = function(fieldName) {
          if ($scope.pageInfo.sortBy == fieldName) {
            return;
          }
          $scope.pageInfo.sortBy = fieldName;
          $scope.pageInfo.currentPage = 1;
          $scope.pageChanged();
        };
        $scope.pageChanged();

        $scope.removeEnabled = function(user) {
          return !user.superuser && !$user.equalsId(user);
        };

        $scope.remove = function(user) {
          $dialogs.confirmDelete("types.User._typeName", user.name).then(function() {
            return $userService.remove(user.id).then(function(result) {
              $alertService.success("messages.delete.success");
              $scope.pageChanged();
            })
          });
        };
        $scope.edit = function(user) {
          $location.path("/edit/" + user.id);
        };
        $scope.view = function(client) {
          $location.path("/view/" + client.id);
        };

        $pageContext.clearPageActions();
        $pageContext.addPageAction($actions.newAction({
          label : 'actions.newUser',
          performAction : function() {
            $location.path("/new");
          }
        }));

      } ]);

  module.controller('EditController', [ '$scope', '$pageContext', '$editController', '$userService', '$roleService', '$user', 'user',
      'editMode', function($scope, $pageContext, $editController, $userService, $roleService, $user, user, editMode) {

        $scope.editModel = user;

        $scope.editMode = editMode;
        $scope.editRoles = !$scope.editModel.equalsId($user);

        $pageContext.clearPageActions();
        var editActions = $editController.createPageActions($scope.editModel, function() {
          return $scope.editForm;
        }, $userService, function(editModel) {
          if (editModel.existing) {
            editModel.password = $scope.newUserPassword;
          } else {
            delete editModel.password;
          }
        });
        var saveEnabled = editActions.save.enable;
        editActions.save.enable = function() {
          if (!saveEnabled()) {
            return false;
          }
          if ($scope.editModel.existing) {
            return true;
          }
          return $scope.newUserPassword == $scope.newUserPassword2;
        };

        $scope.newUserPassword = null;
        $scope.newUserPassword2 = null;

        $scope.allRoles = [];
        $roleService.findAll().then(function(roles) {
          $scope.allRoles = roles;
        });

        $scope.roles = function() {
          return _.filter($scope.allRoles, function(role) {
            return !$scope.editModel.hasRole(role);
          });
        };

        $scope.newRole = null;
        $scope.addNewRoleAvailable = function() {
          return $scope.editRoles && $scope.editMode && $scope.roles().length > 0;
        };
        $scope.addNewRoleEnabled = function() {
          return !qn.isEmpty($scope.newRole) && !qn.isEmpty($scope.newRole.id) && !$scope.editModel.hasRole($scope.newRole);
        };
        $scope.addNewRole = function() {
          if ($scope.newRole) {
            $scope.editModel.addRole($scope.newRole);
          }
          $scope.newRole = null;
        };

        $scope.removeRoleEnabled = function(role) {
          return $scope.editRoles && $scope.editMode && !$scope.editModel.superuser;
        }
        $scope.removeRole = function(role) {
          $scope.editModel.removeRole(role);
        };

      } ]);

})(window, window.angular, window.qn);
