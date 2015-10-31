(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-service', 'ngRoute' ]);

  module.config(['$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('product');

    $routeProvider.when("/", {
      templateUrl : '/partials/product/list.html',
      controller : 'ListController'
    }).when("/new", {
      templateUrl : '/partials/product/edit.html',
      controller : 'EditController',
      resolve : {
        product : function($productService) {
          return $productService.newModel();
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/edit/:id", {
      templateUrl : '/partials/product/edit.html',
      controller : 'EditController',
      resolve : {
        product : function($route, $productService) {
          var id = $route.current.params.id;
          return $productService.findById(id);
        },
        editMode : function() {
          return true;
        }
      }
    }).when("/view/:id", {
      templateUrl : '/partials/product/edit.html',
      controller : 'EditController',
      resolve : {
        product : function($route, $productService) {
          var id = $route.current.params.id;
          return $productService.findById(id);
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
      '$productService',
      function($scope, $location, $pagination, $actions, $pageContext,
          $dialogs, $alertService, $productService) {
        $scope.filterText = null;
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $productService.findByText(
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

        $scope.remove = function(product) {
          $dialogs.confirmDelete("types.Product._typeName",
              product.name).then(
              function() {
                return $productService.remove(product.id).then(
                    function(result) {
                      $alertService.success("messages.delete.success");
                      $scope.pageChanged();
                    })
              });
        };
        $scope.edit = function(product) {
          $location.path("/edit/" + product.id);
        };
        $scope.view = function(product) {
          $location.path("/view/" + product.id);
        };

        $pageContext.clearPageActions();
        $pageContext.addPageAction($actions.newAction({
          label : 'actions.newProduct',
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
              '$productService',
              'product',
              'editMode',
              function($scope, $pageContext, $editController, $productService,
                  product, editMode) {
                $scope.editMode = editMode;

                $scope.editModel = product;

                $pageContext.clearPageActions();
                if (!editMode) {
                  $editController.createCancelAction();
                  return;
                }
                var editActions = $editController.createPageActions(
                    $scope.editModel, function() {
                      return $scope.editForm;
                    }, $productService);

              } ]);

})(window, window.angular, window.qn);
