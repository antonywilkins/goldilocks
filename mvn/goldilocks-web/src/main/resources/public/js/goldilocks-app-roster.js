(function(window, angular, qn) {
  "use strict";

  // define the page application
  var module = angular.module('goldilocks-app', [ 'goldilocks-ui', 'goldilocks-ui-calendar', 'goldilocks-service', 'ngRoute' ]);

  module.config([ '$routeProvider', '$translatePartialLoaderProvider', function($routeProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('roster');

    $routeProvider.when("/", {
      templateUrl : '/partials/roster/list.html',
      controller : 'ListController'
    }).when("/regularDays/:id", {
      templateUrl : '/partials/roster/regularDays.html',
      controller : 'RegularDaysController',
      resolve : {
        regularWeek : function($route, $rosterRegularWeekService) {
          var id = $route.current.params.id;
          return $rosterRegularWeekService.findById(id);
        },
        openingHours : function($route, $openingHoursRegularWeekService) {
          return $openingHoursRegularWeekService.find();
        }
      }
    }).when("/period/:id/:date/:periodType", {
      templateUrl : '/partials/roster/rosterPeriod.html',
      controller : 'RosterPeriodController',
      resolve : {
        rosterPeriod : function($route, $rosterPeriodService) {
          var id = $route.current.params.id;
          var start = $route.current.params.date;
          if (start == "today") {
            start = new Date();
          }
          var end = null;
          return $rosterPeriodService.findByStaffAndDayBetween(id, start, end);
        },
        regularWeek : function($route, $rosterRegularWeekService) {
          var id = $route.current.params.id;
          return $rosterRegularWeekService.findById(id);
        },
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
        $calendarService.setBackgroundColour($applicationConfig.ui.roster.calendarBackgroundColour);
        $calendarService.setNonBusinessHoursColour($applicationConfig.ui.roster.nonBusinessHoursColour);
        $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
          $location.path('/');
        });
      } ]);

  // page level controllers
  module.controller('ListController', [ '$scope', '$location', '$pagination', '$actions', '$pageContext', '$dialogs', '$alertService',
      '$rosterSummaryService',
      function($scope, $location, $pagination, $actions, $pageContext, $dialogs, $alertService, $rosterSummaryService) {
        $scope.pageInfo = $pagination.createPageInfo("ListController");
        $scope.pageChanged = function() {
          return $rosterSummaryService.findByName($scope.pageInfo.filter, $scope.pageInfo.currentPage, $scope.pageInfo);
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

        $pageContext.clearPageActions();

        $scope.editRegularDays = function(roster) {
          $location.path("/regularDays/" + roster.staff.id);
        };
        $scope.editPeriod = function(roster) {
          $location.path("/period/" + roster.staff.id + "/today/week");
        };

      } ]);

  module.controller('RegularDaysController', [
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
      '$calendarContextActions',
      '$rosterRegularWeekService',
      'regularWeek',
      'openingHours',
      function($scope, $pageContext, $editController, $dialogs, $actions, $applicationConfig, $calendarService, uiCalendarConfig,
          $calendarSelectionModel, $calendarSelectionActions, $calendarContextActions, $rosterRegularWeekService, regularWeek, openingHours) {

        /** controller scope model */
        $scope.editModel = regularWeek;
        $scope.openingHours = openingHours;
        $scope.calendarModel = $calendarService.createMultiCalendarModel();
        $scope.selectionModel = $calendarSelectionModel({
          calendarModel : $scope.calendarModel,
          allowedSelectionItemFilter : function allowedSelectionItemFilter(period) {
            if (!period) {
              return false;
            }
            return period.parent().getType() == "StaffRegularDayTimePeriods";
          }
        });

        /** page actions */
        $pageContext.clearPageActions();
        $editController.createPageActions($scope.editModel, function() {
          return $scope.editForm;
        }, $rosterRegularWeekService);

        function withSiblings(period) {
          if (!period) {
            return [];
          }
          return period.parent().periods;
        }
        $calendarSelectionActions.createClearSelectionAction($scope.selectionModel);
        $calendarSelectionActions.createMergeSelectionAction($scope.selectionModel, withSiblings);
        $calendarSelectionActions.createDeleteSelectionAction($scope.selectionModel, withSiblings);

        $scope.contextActions = {
          select : $calendarContextActions.createSelectAction($scope.selectionModel),
          unselect : $calendarContextActions.createUnselectAction($scope.selectionModel),
          merge : $calendarContextActions.createMergeAction($scope.calendarModel, withSiblings),
          'delete' : $calendarContextActions.createDeleteAction($scope.selectionModel, withSiblings)
        };

        // set display properties from current state
        function displayVisitor(period, calendarEvent) {
          if (!period) {
            return;
          }
          calendarEvent.color = undefined;

          if (period.parent().getType() == "OpeningHoursRegularDayTimePeriods") {
            calendarEvent.color = $applicationConfig.ui.roster.nonBusinessHoursColour;
            calendarEvent.rendering = 'background';
            calendarEvent.editable = false;
          }

          if (period.parent().getType() == "StaffRegularDayTimePeriods") {
            calendarEvent.editable = true;
            if ($scope.selectionModel.isSelected(period)) {
              calendarEvent.color = $applicationConfig.ui.roster.selectedTimeSegmentColour;
            } else {
              calendarEvent.color = $applicationConfig.ui.roster.rosteredTimeSegmentColour;
            }
          }
        }

        /** initialise the calendars */
        $scope.calendarModel.clearCalendarModels();

        // add individual day calendars
        qn.each($scope.editModel.week, function(regularPeriods, dayOfWeek) {
          var eventSource = {
            events : function(start, end, timezone, callback) {
              var rosterPeriods = $scope.editModel.week[dayOfWeek].periods;
              var nonOpeningHoursPeriods = $scope.openingHours.week[dayOfWeek].inverseDayPeriods;
              callback(rosterPeriods.concat(nonOpeningHoursPeriods));
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
            displayVisitor : displayVisitor,
            templateUrl : "/partials/roster/roster-calendar-event.html",
            scope : $scope
          };

          var calendarModel = $scope.calendarModel.addCalendarModel(dayOfWeek, eventSource, {});
        });

        // initialise multi-calendar extremes (done after adding calendars so
        // value propagates to all.
        var hoursExtremes = qn.containingPeriod($scope.openingHours.timePeriods.concat($scope.editModel.timePeriods));
        $scope.calendarModel.setTimeBounds(hoursExtremes);

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

  module.controller('RosterPeriodController', [
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
      '$rosterPeriodService',
      'rosterPeriod',
      'regularWeek',
      'openingHours',
      function($scope, $pageContext, $editController, $dialogs, $actions, $applicationConfig, $calendarService, uiCalendarConfig,
          $calendarSelectionModel, $calendarSelectionActions, $rosterPeriodService, rosterPeriod, regularWeek, openingHours) {

        /** controller scope model */
        $scope.editModel = rosterPeriod;
        $scope.regularWeek = regularWeek;
        $scope.openingHours = openingHours;



        // set display properties from current state
        function displayVisitor(period, calendarEvent) {
          if (!period) {
            return;
          }
          calendarEvent.color = undefined;

          if (period.parent().getType() == "OpeningHoursRegularDayTimePeriods") {
            calendarEvent.color = $applicationConfig.ui.roster.nonBusinessHoursColour;
            calendarEvent.rendering = 'background';
            calendarEvent.editable = false;
          }

          if (period.parent().getType() == "RosterPeriodView") {
            calendarEvent.editable = true;
            if ($scope.selectionModel.isSelected(period)) {
              calendarEvent.color = $applicationConfig.ui.roster.selectedTimeSegmentColour;
            } else {
              calendarEvent.color = $applicationConfig.ui.roster.rosteredTimeSegmentColour;
            }
          }
        }

        $scope.toggleSelected = function(sourceEvent) {
          return $scope.selectionModel.toggleSelected(sourceEvent);
        }

        // add a single calendars for the period
        var eventSource = {
          events : function(start, end, timezone, callback) {
            callback($scope.editModel.timePeriods);
          },
          timeslotSelected : function timeslotSelected(start, end, selfCalendar, jsEvent, view) {
            var period = new qn.domain.InstantPeriod({}, $scope.editModel);
            period.start = qn.toDate(start);
            period.end = qn.toDate(end);
            $scope.editModel.overrideWorkingHours.push(period);
            $scope.selectionModel.selected = period;
            return period;
          },
          sourceEventObjectClicked : $scope.toggleSelected,
          displayVisitor : displayVisitor
        };

        $scope.calendarModel = $calendarService.createCalendarModel("rosterPeriod", eventSource, {}, "appointments.week");

        // initialise multi-calendar extremes (done after adding calendars so
        // value propagates to all.
        var hoursExtremes =
            qn
                .containingPeriod($scope.openingHours.timePeriods.concat($scope.regularWeek.timePeriods).concat(
                    $scope.editModel.timePeriods));
        $scope.calendarModel.setTimeBounds(hoursExtremes);

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

        $scope.selectionModel = $calendarSelectionModel({
          calendarModel : $scope.calendarModel,
          allowedSelectionItemFilter : function allowedSelectionItemFilter(period) {
            if (!period) {
              return false;
            }
            return period.parent().getType() == "StaffRegularDayTimePeriods";
          }
        });

        /** page actions */
        $pageContext.clearPageActions();
        $editController.createPageActions($scope.editModel, function() {
          return $scope.editForm;
        }, $rosterPeriodService);

        function withSiblings(period) {
          if (!period) {
            return [];
          }
          return period.parent().periods;
        }
        $calendarSelectionActions.createClearSelectionAction($scope.selectionModel);
        $calendarSelectionActions.createMergeSelectionAction($scope.selectionModel, withSiblings);
        $calendarSelectionActions.createDeleteSelectionAction($scope.selectionModel, withSiblings);


      } ]);

})(window, window.angular, window.qn);
