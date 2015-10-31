(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui', 'goldilocks-service', 'ngRoute' ]);

  module.config([ '$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('client');

    $routeProvider.when("/", {
      templateUrl : '/partials/client/list.html',
      controller : 'ListController'
    }).when("/new", {
      templateUrl : '/partials/client/edit.html',
      controller : 'EditController',
      resolve : {
        client : function($clientService) {
          return $clientService.newModel();
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/edit/:id", {
      templateUrl : '/partials/client/edit.html',
      controller : 'EditController',
      resolve : {
        client : function($route, $clientService) {
          var id = $route.current.params.id;
          return $clientService.findById(id);
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/view/:id", {
      templateUrl : '/partials/client/edit.html',
      controller : 'EditController',
      resolve : {
        client : function($route, $clientService) {
          var id = $route.current.params.id;
          return $clientService.findById(id);
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
      '$clientService', function($scope, $location, $pagination, $actions, $pageContext, $dialogs, $alertService, $clientService) {
        $scope.filterText = null;
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $clientService.findByText($scope.pageInfo.filter, $scope.pageInfo.currentPage, $scope.pageInfo);
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

        $scope.remove = function(client) {
          $dialogs.confirmDelete("types.Client._typeName", client.firstName + " " + client.lastName).then(function() {
            return $clientService.remove(client.id).then(function(result) {
              $alertService.success("messages.delete.success");
              $scope.pageChanged();
            })
          });
        };
        $scope.edit = function(client) {
          $location.path("/edit/" + client.id);
        };
        $scope.view = function(client) {
          $location.path("/view/" + client.id);
        };

        $pageContext.clearPageActions();
        $pageContext.addPageAction($actions.newAction({
          label : 'actions.newClient',
          performAction : function() {
            $location.path("/new");
          }
        }));

      } ]);

  module.controller('EditController', [ '$scope', '$pageContext', '$editController', '$clientService', 'client', 'editMode',
      function($scope, $pageContext, $editController, $clientService, client, editMode) {
        $scope.editMode = editMode;

        $scope.editModel = client;

        $pageContext.clearPageActions();
        if (!editMode) {
          $editController.createCancelAction();
          return;
        }
        var editActions = $editController.createPageActions($scope.editModel, function() {
          return $scope.editForm;
        }, $clientService);

      } ]);

})(window, window.angular, window.qn);
