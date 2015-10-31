(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui',
      'goldilocks-ui-calendar', 'goldilocks-service', 'ngRoute' ]);

  module.config(['$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('planner');

    $routeProvider.when("/", {
      templateUrl : '/partials/planner/main.html',
      controller : 'MainController'
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
  module.controller('MainController',
      [
          '$scope',
          '$location',
          '$pagination',
          '$actions',
          '$pageContext',
          '$dialogs',
          '$alertService',
          '$calendarService',
          '$staffAppointmentsService',
          function($scope, $location, $pagination, $actions, $pageContext,
              $dialogs, $alertService, $calendarService,
              $staffAppointmentsService) {

            $scope.appointmentModel = {
              appointmentsByStaff : {},
              calendarModel : $calendarService.createMultiCalendarModel()
            };

            // change to findByDate, and find all, plus roster
            $staffAppointmentsService.findByDay(null).then(
                function(staffAppointments) {
                  $scope.appointmentModel = qn.extend($scope.appointmentModel,
                      staffAppointments);
                  $scope.appointmentModel.calendarModel.clearCalendarModels();
                  qn.each(staffAppointments.appointmentsByStaff, function(
                      appointments, staffId) {


                    // TODO Service needs to return staff roster so that we can set
                    // bounds of the calendar configs.
                    $scope.appointmentModel.calendarModel.addCalendarModel(
                        staffId, appointments);
                  });

                  // TODO roster
                  // $scope.appointmentModel.axisConfig.minTime = roster.start;
                  // $scope.appointmentModel.axisConfig.maxTime = roster.end;
                  // $scope.appointmentModel.calendarConfig.minTime =
                  // roster.start;
                  // $scope.appointmentModel.calendarConfig.maxTime =
                  // roster.end;

                });

          } ]);
})(window, window.angular, window.qn);
