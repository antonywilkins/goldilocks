(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui', 'goldilocks-ui-calendar', 'goldilocks-service', 'ngRoute' ]);

  module.config([ '$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('config');

    $routeProvider.when("/", {
      templateUrl : '/partials/config/main.html',
      controller : 'ConfigController'
    }).when("/openingHours", {
      templateUrl : '/partials/config/openingHours.html',
      controller : 'OpeningHoursController',
      resolve : {
        openingHours : function($route, $openingHoursRegularWeekService) {
          return $openingHoursRegularWeekService.find();
        }
      }
    }).otherwise({
      redirectTo : '/'
    });
  } ]);

  module.run([ '$applicationConfig', '$calendarService', '$rootScope', '$location',
      function($applicationConfig, $calendarService, $rootScope, $location) {
        $calendarService.setBackgroundColour($applicationConfig.ui.openingHours.calendarBackgroundColour);
        $calendarService.setNonBusinessHoursColour($applicationConfig.ui.openingHours.calendarBackgroundColour);
        $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
          $location.path('/');
        });
      } ]);

  // page level controllers

  module.controller('ConfigController', [ '$scope', '$pageContext', '$editController', '$options', '$applicationConfigService',
      '$translate', function($scope, $pageContext, $editController, $options, $applicationConfigService, $translate) {

        $applicationConfigService.findGlobal().then(function(result) {
          $scope.editModel = result;

          function getForm() {
            return $scope.editForm;
          }
          $pageContext.clearPageActions();

          var saveAction = $editController.createSaveAction($scope.editModel, getForm, $applicationConfigService);

          var save = saveAction.performAction;
          saveAction.performAction = function() {
            return save().then($applicationConfigService.reloadUserConfig);
          };

          $editController.createResetAction($scope.editModel, getForm);
        });

        $scope.use24HourClockOptions = [ {
          use24Hour : true,
          label : 'labels.businessHours.use24HourClock'
        }, {
          use24Hour : false,
          label : 'labels.businessHours.use12HourClock'
        } ];
        $scope.timeSlotDurationOptions = [ {
          duration : "00:05",
          label : 'labels.businessHours.timeSlotDuration.fiveMinutes'
        }, {
          duration : "00:10",
          label : 'labels.businessHours.timeSlotDuration.tenMinutes'
        }, {
          duration : "00:15",
          label : 'labels.businessHours.timeSlotDuration.fifteenMinutes'
        }, {
          duration : "00:20",
          label : 'labels.businessHours.timeSlotDuration.twentyMinutes'
        }, {
          duration : "00:30",
          label : 'labels.businessHours.timeSlotDuration.thirtyMinutes'
        }, {
          duration : "01:00",
          label : 'labels.businessHours.timeSlotDuration.oneHour'
        } ];

        $options.translate($scope.use24HourClockOptions, $scope.timeSlotDurationOptions);

      } ]);

  module.controller('OpeningHoursController', [
      '$scope',
      '$pageContext',
      '$editController',
      '$dialogs',
      '$actions',
      '$applicationConfig',
      '$calendarService',
      'uiCalendarConfig',
      '$calendarSelectionModel',
      '$calendarSelectionActions',
      '$openingHoursRegularWeekService',
      'openingHours',
      function($scope, $pageContext, $editController, $dialogs, $actions, $applicationConfig, $calendarService, uiCalendarConfig,
          $calendarSelectionModel, $calendarSelectionActions, $openingHoursRegularWeekService, openingHours) {

        /** controller scope model */
        $scope.editModel = openingHours;
        $scope.calendarModel = $calendarService.createMultiCalendarModel();
        $scope.selectionModel = $calendarSelectionModel({
          calendarModel : $scope.calendarModel
        });

        /** page actions */
        function getForm() {
          return $scope.editForm;
        }
        $pageContext.clearPageActions();
        $editController.createSaveAction($scope.editModel, getForm, $openingHoursRegularWeekService, null, false);
        $editController.createResetAction($scope.editModel, getForm);

        function withSiblings(period) {
          if (!period) {
            return [];
          }
          return period.parent().periods;
        }
        $calendarSelectionActions.createClearSelectionAction($scope.selectionModel);
        $calendarSelectionActions.createMergeSelectionAction($scope.selectionModel, withSiblings);
        $calendarSelectionActions.createDeleteSelectionAction($scope.selectionModel, withSiblings);

        // set display properties from current state
        function displayVisitor(period, calendarEvent) {
          if (!period) {
            return;
          }

          calendarEvent.color = $applicationConfig.ui.openingHours.businessHoursTimeSegmentColour;
          if ($scope.selectionModel.isSelected(period)) {
            calendarEvent.color = $applicationConfig.ui.openingHours.selectedTimeSegmentColour;
          }
          calendarEvent.editable = true;
        }

        /** initialise the calendars */
        $scope.calendarModel.clearCalendarModels();

        // add individual day calendars
        qn.each($scope.editModel.week, function(regularPeriods, dayOfWeek) {
          var eventSource = {
            events : function(start, end, timezone, callback) {
              var openingHoursPeriods = $scope.editModel.week[dayOfWeek].periods;
              callback(openingHoursPeriods);
            },
            timeslotSelected : function timeslotSelected(start, end, selfCalendar, jsEvent, view) {
              var dayPeriods = $scope.editModel.week[dayOfWeek];
              var period = new qn.domain.LocalTimePeriod({}, dayPeriods);
              period.setTimes(start, end);
              dayPeriods.periods.push(period);
              $scope.selectionModel.selected = period;
              return period;
            },
            sourceEventObjectClicked : $scope.selectionModel.toggleSelected,
            displayVisitor : displayVisitor
          };

          var calendarModel = $scope.calendarModel.addCalendarModel(dayOfWeek, eventSource, {});
        });

        // initialise multi-calendar extremes (done after adding calendars so
        // value propagates to all.
        var hoursExtremes = qn.containingPeriod($scope.editModel.timePeriods);
        if (hoursExtremes) {
          $scope.calendarModel.setTimeBounds(hoursExtremes);
        }

        // update calendars from models
        var refetchEvents = function refetchEvents() {
          $scope.calendarModel.refetchEvents();
        }
        var refetchEventsAndClearSelection = function refetchEventsAndClearSelection() {
          $scope.selectionModel.clearSelection();
          refetchEvents();
        }
        $scope.editModel.addListener('reset', refetchEventsAndClearSelection);
        $scope.editModel.addListener('refresh', refetchEventsAndClearSelection);

      } ]);

})(window, window.angular, window.qn);
