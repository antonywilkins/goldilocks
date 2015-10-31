(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-service', 'ngRoute' ]);

  module.config(['$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('service');

    $routeProvider.when("/", {
      templateUrl : '/partials/service/list.html',
      controller : 'ListController'
    }).when("/new", {
      templateUrl : '/partials/service/edit.html',
      controller : 'EditController',
      resolve : {
        service : function($serviceService) {
          return $serviceService.newModel();
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/edit/:id", {
      templateUrl : '/partials/service/edit.html',
      controller : 'EditController',
      resolve : {
        service : function($route, $serviceService) {
          var id = $route.current.params.id;
          return $serviceService.findById(id);
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/view/:id", {
      templateUrl : '/partials/service/edit.html',
      controller : 'EditController',
      resolve : {
        service : function($route, $serviceService) {
          var id = $route.current.params.id;
          return $serviceService.findById(id);
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
      '$serviceService',
      function($scope, $location, $pagination, $actions, $pageContext,
          $dialogs, $alertService, $serviceService) {
        $scope.filterText = null;
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $serviceService.findByText(
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

        $scope.remove = function(service) {
          $dialogs.confirmDelete("types.Service._typeName",
              service.name).then(
              function() {
                return $serviceService.remove(service.id).then(
                    function(result) {
                      $alertService.success("messages.delete.success");
                      $scope.pageChanged();
                    })
              });
        };
        $scope.edit = function(service) {
          $location.path("/edit/" + service.id);
        };
        $scope.view = function(service) {
          $location.path("/view/" + service.id);
        };

        $pageContext.clearPageActions();
        $pageContext.addPageAction($actions.newAction({
          label : 'actions.newService',
          performAction : function() {
            $location.path("/new");
          }
        }));

      } ]);

  module
      .controller(
          'EditController',
          [
              '$scope',
              '$pageContext',
              '$editController',
              '$serviceService',
              'service',
              'editMode',
              function($scope, $pageContext, $editController, $serviceService,
                  service, editMode) {
                $scope.editMode = editMode;

                $scope.editModel = service;

                $pageContext.clearPageActions();
                if (!editMode) {
                  $editController.createCancelAction();
                  return;
                }
                var editActions = $editController.createPageActions(
                    $scope.editModel, function() {
                      return $scope.editForm;
                    }, $serviceService);

              } ]);

})(window, window.angular, window.qn);
