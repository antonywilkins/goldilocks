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
        rosterPeriod : function($route, $rosterPeriodService, $daysOfWeek) {
          var id = $route.current.params.id;
          var start = $route.current.params.date;

          var today = moment();
          if (start == "today") {
            start = today;
          } else {
            start = qn.toMoment($route.current.params.date);
          }

          var periodType = $route.current.params.periodType || 'week';
          periodType = periodType.toLowerCase();
          if ([ 'week', 'month', 'year' ].indexOf(periodType) < 0) {
            periodType = 'week';
          }

          start.startOf(periodType);
          var end = moment(start).add(1, periodType);
          return $rosterPeriodService.findByStaffAndDayBetween(id, start, end).then(function(periods) {
            return {
              start : start,
              end : end,
              periodType : periodType,
              periods : periods
            };
          });

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

  module.controller('RegularDaysController',
      [
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
              $calendarSelectionModel, $calendarSelectionActions, $calendarContextActions, $rosterRegularWeekService, regularWeek,
              openingHours) {

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
            function displayVisitor(period, calendarEvent, eventSource, calendar) {
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

            // initialise multi-calendar extremes (done after adding calendars
            // so
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

  module.controller('RosterPeriodController',
      [
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
          '$rosterPeriodService',
          'rosterPeriod',
          'regularWeek',
          'openingHours',
          function($scope, $pageContext, $editController, $dialogs, $actions, $applicationConfig, $calendarService, uiCalendarConfig,
              $calendarSelectionModel, $calendarSelectionActions, $calendarContextActions, $rosterPeriodService, rosterPeriod, regularWeek,
              openingHours) {

            /** controller scope model */
            $scope.editModel = rosterPeriod.periods;
            $scope.viewInfo = rosterPeriod;
            $scope.regularWeek = regularWeek;
            $scope.openingHours = openingHours;

            // set display properties from current state
            function displayVisitor(period, calendarEvent, eventSource, calendar) {
              if (!period) {
                return;
              }
              calendarEvent.color = undefined;

              if (period.parent().getType() == "StaffRegularDayTimePeriods") {
                calendarEvent.color = $applicationConfig.ui.roster.regularHoursPlaceholderTimeSegmentColour;
                calendarEvent.rendering = 'background';
                calendarEvent.editable = false;
              }
              if (period.parent().getType() == "OpeningHoursWeek") {
                calendarEvent.color = $applicationConfig.ui.roster.nonBusinessHoursColour;
                calendarEvent.rendering = 'background';
                calendarEvent.editable = false;
              }

              if (period.parent().getType() == "RosterPeriodView") {
                calendarEvent.editable = true;
                if ($scope.selectionModel.isSelected(period)) {
                  calendarEvent.color = $applicationConfig.ui.roster.selectedTimeSegmentColour;
                } else {
                  if (period.isStandInPeriod) {
                    calendarEvent.color = $applicationConfig.ui.roster.regularHoursTimeSegmentColour;
                  } else {
                    calendarEvent.color = $applicationConfig.ui.roster.rosteredTimeSegmentColour;
                  }
                }
              }
            }

            // constraints
            var eventOverlap = function(stillEvent, movingEvent, eventSource) {
              var stillEventType = stillEvent.parent().getType();
              var movingEventType = movingEvent.parent().getType();
              var allow = (stillEventType != "OpeningHoursWeek" && stillEventType != "RosterPeriodView");
              return allow;
            }

            var selectOverlap = function(overlappedEvent, eventSource, calendarEvent) {
              var eventType = overlappedEvent.parent().getType();
              var allow = eventType != "OpeningHoursWeek" && eventType != "RosterPeriodView";
              return allow;
            }

            $scope.toggleSelected = function(sourceEvent) {
              return $scope.selectionModel.toggleSelected(sourceEvent);
            }

            var openingHourPeriods = $scope.openingHours.timePeriodsBetween($scope.viewInfo);
            var nonOpeningHourPeriods = $scope.openingHours.inverseDayPeriodsBetween($scope.viewInfo);
            var regularWeekPeriods = $scope.regularWeek.timePeriodsBetween($scope.viewInfo);
            var boundingPeriods = openingHourPeriods.concat(regularWeekPeriods).concat($scope.editModel.timePeriods);

            function mapPeriodsByDate(periods) {
              var periodsByDate = {};
              qn.each(periods, function(period, idx) {
                var day = getPeriodDayKey(period);
                periodsByDate[day] = periodsByDate[day] || [];
                periodsByDate[day].push(period);
              });
              return periodsByDate;
            }
            var regularPeriodsByDate = mapPeriodsByDate(regularWeekPeriods);

            function getPeriodDayKey(period) {
              var date = period.start || period;
              var day = qn.isString(date) ? date : qn.toDate(date).toJavaISODateString();
              return day;
            }
            function getRegularWeekPeriods(periodOrDate) {
              return getPeriods(periodOrDate, regularPeriodsByDate);
            }
            function getPeriods(periodOrDate, periodsByDate) {
              var day = getPeriodDayKey(periodOrDate);
              periodsByDate[day] = periodsByDate[day] || [];
              periodsByDate[day] = _.sortBy(periodsByDate[day], 'start');
              return periodsByDate[day];
            }

            function periodsMatch(periodA, periodB) {
              if (qn.toMilliseconds(periodA.start) != qn.toMilliseconds(periodB.start)) {
                return false;
              }
              if (qn.toMilliseconds(periodA.end) != qn.toMilliseconds(periodB.end)) {
                return false;
              }
              if (periodA.allDay != periodB.allDay) {
                return false;
              }
              if (qn.toMilliseconds(periodA.date) != qn.toMilliseconds(periodB.date)) {
                return false;
              }
              return true;
            }

            function periodArraysMatch(periodsA, periodsB) {
              if (periodsA.length != periodsB.length) {
                return false;
              }

              for (var p = 0; p < periodsA.length; p++) {
                var pA = periodsA[p];
                var pB = periodsB[p];
                if (!periodsMatch(pA, pB)) {
                  return false;
                }
              }

              return true;
            }

            function getRosterPeriods(overridePeriodsByDate, owner) {
              var rosterPeriods = [];

              var start = moment($scope.viewInfo.start).startOf('day');
              var end = moment($scope.viewInfo.end).startOf('day').add(1, 'day');
              var day = moment(start);
              while (day.isBefore(end)) {
                var dayKey = getPeriodDayKey(day);
                var regularPeriods = getRegularWeekPeriods(dayKey);
                var overridePeriods = getPeriods(dayKey, overridePeriodsByDate);

                if (overridePeriods.length === 0 || periodArraysMatch(overridePeriods, regularPeriods)) {
                  qn.each(regularPeriods, function(period, idx) {
                    var matchingOverridePeriod = overridePeriods[idx];
                    var standInPeriod = new qn.domain.InstantPeriod({
                      start : period.start,
                      end : period.end,
                      isStandInPeriod : true
                    }, owner);
                    if (matchingOverridePeriod) {
                      qn.removeElement(owner.overrideWorkingHours, matchingOverridePeriod);
                    }
                    rosterPeriods.push(standInPeriod);
                  });
                } else {
                  qn.each(overridePeriods, function(period, idx) {
                    rosterPeriods.push(period);
                  });
                }

                day = day.add(1, 'day');
              }
              return rosterPeriods;
            }

            function dataUpdateVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar, delta, revertFunc, jsEvent, ui, view) {
              eventSource.defaultDataUpdateVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar, delta, revertFunc, jsEvent, ui,
                  view);
              return promoteOrDemoteStandInPeriods(sourceEvent);
            }

            function promoteOrDemoteStandInPeriods(sourceEvent) {
              var regularPeriods = getRegularWeekPeriods(sourceEvent);
              var periods = getPeriods(sourceEvent, $scope.rosteredPeriodsByDate.overrideWorkingHours);
              var periodsMatch = periodArraysMatch(regularPeriods, periods);

              if (periodsMatch) {
                // make them all stand-ins
                qn.each(periods, function(p, idx) {
                  if (!p.isStandInPeriod) {
                    qn.removeElement($scope.editModel.overrideWorkingHours, p);
                    p.isStandInPeriod = true;
                  }
                });
                return 'refetch';
              }
              if (!periodsMatch) {
                // make them all real overrides
                qn.each(periods, function(p, idx) {
                  if (p.isStandInPeriod) {
                    qn.addIfNotContained($scope.editModel.overrideWorkingHours, p);
                    delete p.isStandInPeriod;
                  }
                });
                return 'refetch';
              }
              return sourceEvent;
            }

            // add the calendar
            $scope.rosteredPeriodsByDate = new qn.domain.RosterPeriodView();
            var eventSource = {
              events : function(start, end, timezone, callback) {
                var overridePeriodsByDate = mapPeriodsByDate($scope.editModel.timePeriods);
                var rosterPeriods = getRosterPeriods(overridePeriodsByDate, $scope.editModel);
                $scope.rosteredPeriodsByDate.overrideWorkingHours = mapPeriodsByDate(rosterPeriods);
                callback(nonOpeningHourPeriods.concat(regularWeekPeriods).concat(rosterPeriods));
              },
              eventOverlap : eventOverlap,
              selectOverlap : selectOverlap,
              timeslotSelected : function timeslotSelected(start, end, selfCalendar, jsEvent, view) {
                var period = new qn.domain.InstantPeriod({}, $scope.editModel);
                period.start = qn.toDate(start);
                period.end = qn.toDate(end);
                $scope.editModel.overrideWorkingHours.push(period);
                $scope.selectionModel.selected = period;
                // update the byDate index so that this one is spotted when
                // promoting
                var periods = getPeriods(period, $scope.rosteredPeriodsByDate.overrideWorkingHours);
                qn.addIfNotContained(periods, period);
                promoteOrDemoteStandInPeriods(period);
                return period;
              },
              onEventRemove : function(sourceEvent, calendarEvent, eventSource) {
                promoteOrDemoteStandInPeriods(sourceEvent);
              },
              refetchOnEventRemove : true,
              sourceEventObjectClicked : $scope.toggleSelected,
              dataUpdateVisitor : dataUpdateVisitor,
              displayVisitor : displayVisitor,
              templateUrl : "/partials/roster/roster-calendar-event.html",
              scope : $scope
            };

            $scope.calendarModel = $calendarService.createCalendarModel("rosterPeriod", eventSource, {}, "appointments.week");

            // initialise calendar extremes
            var hoursExtremes = qn.longestHours(boundingPeriods);
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

            // selection model
            $scope.selectionModel = $calendarSelectionModel({
              calendarModel : $scope.calendarModel,
              allowedSelectionItemFilter : function allowedSelectionItemFilter(period) {
                if (!period) {
                  return false;
                }
                return period.parent().getType() == "RosterPeriodView";
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
              if (period.isStandInPeriod) {
                return getPeriods(period, $scope.rosteredPeriodsByDate.overrideWorkingHours);
              }

              return period.parent().overrideWorkingHours;
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

          } ]);

})(window, window.angular, window.qn);
