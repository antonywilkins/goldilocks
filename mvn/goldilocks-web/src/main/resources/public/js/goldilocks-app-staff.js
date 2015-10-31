(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-service', 'ngRoute' ]);

  module.config(['$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('staff');

    $routeProvider.when("/", {
      templateUrl : '/partials/staff/list.html',
      controller : 'ListController'
    }).when("/new", {
      templateUrl : '/partials/staff/edit.html',
      controller : 'EditController',
      resolve : {
        staff : function($staffService) {
          return $staffService.newModel();
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/edit/:id", {
      templateUrl : '/partials/staff/edit.html',
      controller : 'EditController',
      resolve : {
        staff : function($route, $staffService) {
          var id = $route.current.params.id;
          return $staffService.findById(id);
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/view/:id", {
      templateUrl : '/partials/staff/edit.html',
      controller : 'EditController',
      resolve : {
        staff : function($route, $staffService) {
          var id = $route.current.params.id;
          return $staffService.findById(id);
        },
        editMode : function() {
          return false;
        }
      }
    }).otherwise({
      redirectTo : '/'
    });
  }]);

  module.run([ '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
      $location.path('/');
    });
  } ]);

  // page level controllers
  module.controller('ListController', [
      '$scope',
      '$location',
      '$pagination',
      '$actions',
      '$pageContext',
      '$dialogs',
      '$alertService',
      '$staffService',
      function($scope, $location, $pagination, $actions, $pageContext,
          $dialogs, $alertService, $staffService) {
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $staffService.findByName(
              $scope.pageInfo.filter, $scope.pageInfo.currentPage, $scope.pageInfo);
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

        $scope.remove = function(staff) {
          $dialogs.confirmDelete("types.Staff._typeName", staff.name)
              .then(
                  function() {
                    return $staffService.remove(staff.id).then(
                        function(result) {
                          $alertService.success("messages.delete.success");
                          $scope.pageChanged();
                        })
                  });
        };
        $scope.edit = function(staff) {
          $location.path("/edit/" + staff.id);
        };
        $scope.view = function(client) {
          $location.path("/view/" + client.id);
        };

        $pageContext.clearPageActions();
        $pageContext.addPageAction($actions.newAction({
          label : 'actions.newStaff',
          performAction : function() {
            $location.path("/new");
          }
        }));

      } ]);

  module.controller('EditController', [
      '$scope',
      '$pageContext',
      '$editController',
      '$staffService',
      '$roleService',
      'staff',
      'editMode',
      function($scope, $pageContext, $editController, $staffService,
          $roleService, staff, editMode) {
        $scope.editMode = editMode;

        $scope.editModel = staff;

        $pageContext.clearPageActions();
        if (!editMode) {
          $editController.createCancelAction();
          return;
        }
        var editActions = $editController.createPageActions($scope.editModel,
            function() {
              return $scope.editForm;
            }, $staffService);

      } ]);

})(window, window.angular, window.qn);
