"use strict";

(function(window, angular, qn) {

  var module = angular.module("goldilocks-ui-calendar", [ 'goldilocks-util-ui', 'ui.calendar' ]);

  qn.applicationConfigDefaults = qn.extendDeep(qn.applicationConfigDefaults, {
    calendar : {
      uiConfigs : {
        base : {
          timezone : 'local',
          header : false,
          height : "auto",
          allDaySlot : false,
          slotDuration : '00:15',
          minTime : '09:00',
          maxTime : '18:30',
          editable : false,
          selectable : false,
          selectHelper : false,
          eventOverlap : false,
          selectOverlap : false,
          unselectAuto : true
        },
        appointments : {
          // axis for the appointmentDay view - defines css classes we require
          // for axis only - note this is designed to work with multiple
          // calendars - e.g. those using "day" view.
          axis : {
            defaultView : 'appointmentsAxis',
            views : {
              appointmentsAxis : {
                type : 'agenda',
                duration : {
                  days : 1
                }
              }
            }
          },
          // day for the appointmentDay view - defines css classes we require
          // for day column only
          day : {
            defaultView : 'appointmentsDay',
            views : {
              appointmentsDay : {
                type : 'agenda',
                duration : {
                  days : 1
                }
              }
            }
          },
          // axis for the appointmentWeek view - defines css classes we require
          // for week only - note this does not depend on the "axis" or "day"
          // css or views
          week : {
            defaultView : 'appointmentsWeek',
            views : {
              appointmentsWeek : {
                type : 'agenda',
                duration : {
                  days : 7
                }
              }
            }
          }
        }
      }
    }
  });

  qn.defaultsDeep(qn.applicationConfig, qn.applicationConfigDefaults);

  module.factory('$calendarService', [
      '$applicationConfig',
      '$compile',
      '$timeout',
      '$http',
      '$templateCache',
      '$rootScope',
      '$daysOfWeek',
      'uiCalendarConfig',
      function($applicationConfig, $compile, $timeout, $http, $templateCache, $rootScope, $daysOfWeek, uiCalendarConfig) {

        var eventFieldsWithoutTime =
            [ 'title', 'allDay', 'url', 'className', 'editable', 'startEditable', 'durationEditable', 'rendering', 'overlap', 'constraint',
                'color', 'backgroundColor', 'borderColor', '', 'textColor' ];
        var eventFieldsTime = [ 'date', 'start', 'end' ];
        var eventFields = eventFieldsTime.concat(eventFieldsWithoutTime);

        function withUiConfigDefaults(config) {
          config = config || {};
          qn.defaultsDeep(config, $applicationConfig.calendar.uiConfigs.base);
          return config;
        }

        function createUiConfig() {
          var config = {};
          qn.each(arguments, function(obj) {
            if (qn.isString(obj)) {
              var keys = obj.split(".");
              obj = null;
              if (keys.length > 0) {
                obj = $applicationConfig.calendar.uiConfigs;
                qn.each(keys, function(key) {
                  if (obj) {
                    obj = obj[key];
                  }
                });
              }
            }
            if (obj) {
              qn.extendDeep(config, obj);
            }
          });

          config.timeFormat = $applicationConfig.businessHours.use24HourClock ? 'H:mm' : 'h(:mm)a';
          config.axisFormat = $applicationConfig.businessHours.use24HourClock ? 'H:mm' : 'h(:mm)a';
          config.slotDuration = $applicationConfig.businessHours.timeSlotDuration;
          config.firstDay = $daysOfWeek.indexOfFirstDay();

          return withUiConfigDefaults(config);
        }

        function defaultIdGenerator(event) {
          var type = event.getType ? event.getType() : event._type;
          var id =
              (event.transientData ? event.transientData.calendarEventId : undefined) || (event.getId && event.getId()) || event.id
                  || qn.nextUid();
          if (event.transientData) {
            event.transientData.calendarEventId = id;
          } else {
            event.id = id;
          }
          return (type ? (type + ":") : "") + id;
        }


        function isSpanningMultipleDays(event) {
          var start = qn.toMoment(event.start);
          var end = qn.toMoment(event.end);
          return !start.isSame(end, 'day');
        }

        function defaultDataVisitor(sourceEvent, calendarEvent, eventSource) {
          delete calendarEvent.date;
          calendarEvent.start = qn.toMoment(sourceEvent.start || sourceEvent.date);
          calendarEvent.end = qn.toMoment(sourceEvent.end);
        }

        function defaultDataUpdateVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar, delta, revertFunc, jsEvent, ui, view) {
          if (sourceEvent.usesLocalTime) {
            sourceEvent.start = qn.toLocalTime(calendarEvent.start);
            sourceEvent.end = qn.toLocalTime(calendarEvent.end);
          } else {
            sourceEvent.start = qn.toDate(calendarEvent.start);
            sourceEvent.end = qn.toDate(calendarEvent.end);
          }
        }

        function defaultDisplayVisitor(sourceEvent, eventSource, calendarEvent) {
        }

        function createDefaultEventDataTransform(eventSource) {
          var requiresTransform = false;
          if (eventSource.idGenerator || eventSource.displayVisitor || eventSource.dataVisitor || eventSource.dataUpdateVisitor) {
            requiresTransform = true;
          }

          if (!requiresTransform) {
            return;
          }

          eventSource._eventCache = {};
          function transformEvent(evt) {
            var idGenerator = eventSource.idGenerator || defaultIdGenerator;
            var id = idGenerator(evt);
            var transformedEvent = eventSource._eventCache[id] || (evt.values ? evt.values() : {});
            eventSource._eventCache[id] = transformedEvent;

            var data = evt.values ? evt.values() : evt;
            qn.copy(data, transformedEvent, function filter(key) {
              return eventFieldsWithoutTime.indexOf(key) >= 0;
            });

            // make sure the id is available to any of these calls
            transformedEvent.id = id;
            var dataVisitor = eventSource.dataVisitor || defaultDataVisitor;
            dataVisitor(evt, transformedEvent, eventSource);
            var displayVisitor = eventSource.displayVisitor || defaultDisplayVisitor;
            displayVisitor(evt, transformedEvent, eventSource, undefined);
            // in case one of the above carelessly overwrites with an id
            // from the source object
            transformedEvent.id = id;
            transformedEvent._originalEvent = evt;
            return transformedEvent;
          }

          eventSource.getSourceEvent = function getSourceEvent(evt) {
            return evt._originalEvent;
          }

          eventSource.getCalendarEvent = function getCalendarEvent(evt) {
            var idGenerator = eventSource.idGenerator || defaultIdGenerator;
            var id = qn.isString(evt) ? evt : idGenerator(evt);
            return eventSource._eventCache[id];
          }

          eventSource.cleanupEventsCache = function cleanupEventsCache(calendar) {
            var redundantKeys = Object.keys(eventSource._eventCache);
            var inputEvents = calendar.clientEvents();
            if (!inputEvents) {
              return;
            }
            for (var e = 0; e < inputEvents.length; e++) {
              var event = inputEvents[e];
              if (event) {
                qn.removeElement(redundantKeys, event.id);
              }
            }
            if (redundantKeys.length == 0) {
              return;
            }
            qn.each(redundantKeys, function(key) {
              delete eventSource._eventCache[key];
            });
          }

          eventSource.resetEventsCache = function resetEventsCache() {
            eventSource._eventCache = {};
          }

          return transformEvent;
        }

        function createWrapperEventsFunction(eventSource, calendar) {
          var eventsOrFunction = eventSource.events;
          return function(start, end, timezone, callback) {
            if (qn.isFunction(eventsOrFunction)) {
              eventsOrFunction(start, end, timezone, function(events) {
                eventSource.resetEventsCache();
                callback(events);
              });
            } else {
              eventsOrFunction = eventsOrFunction || [];
              eventSource.resetEventsCache();
              callback(eventsOrFunction);
            }
          };
        }

        function CalendarModel(key, eventSource, uiConfig, baseConfigName) {
          this.key = key || qn.nextUid();
          baseConfigName = baseConfigName || "appointments.day";
          uiConfig = createUiConfig(baseConfigName, uiConfig);
          this.uiConfig = uiConfig;
          eventSource = eventSource || {};
          this.eventSource = eventSource;
          eventSource.events = createWrapperEventsFunction(eventSource, this);

          eventSource.idGenerator = eventSource.idGenerator || defaultIdGenerator;

          eventSource.dataVisitor = eventSource.dataVisitor || defaultDataVisitor;

          eventSource.displayVisitor = eventSource.displayVisitor || defaultDisplayVisitor;

          eventSource.dataUpdateVisitor = eventSource.dataUpdateVisitor || defaultDataUpdateVisitor;

          eventSource.eventDataTransform = eventSource.eventDataTransform || createDefaultEventDataTransform(eventSource);

          var selfCalendar = this;
          function defaultEventChanged(calendarEvent, delta, revertFunc, jsEvent, ui, view) {
            var sourceEvent = eventSource.getSourceEvent(calendarEvent);
            if (sourceEvent) {
              if (!eventSource.allowMultiDayEvents && isSpanningMultipleDays(calendarEvent)) {
                revertFunc();
                return false;
              }

              var updated = eventSource.dataUpdateVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar, delta, revertFunc, jsEvent, ui, view);
              if (updated === false) {
                // up to the dataUpdateVisitor to decide to revert or not
                return;
              }
              if (eventSource.sourceEventObjectChanged) {
                eventSource.sourceEventObjectChanged(sourceEvent, calendarEvent, eventSource, selfCalendar, delta, jsEvent, ui, view);
              }
              eventSource.displayVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar);
              selfCalendar.updateEvent(calendarEvent);
            }
          }
          uiConfig.eventDrop = uiConfig.eventDrop || defaultEventChanged;
          uiConfig.eventResize = uiConfig.eventResize || defaultEventChanged;

          function defaultEventClicked(calendarEvent, jsEvent, view) {
            var sourceEvent = eventSource.getSourceEvent(calendarEvent);
            if (sourceEvent) {
              if (eventSource.sourceEventObjectClicked) {
                eventSource.sourceEventObjectClicked(sourceEvent, calendarEvent, eventSource, selfCalendar, jsEvent, view);
              }
              eventSource.displayVisitor(sourceEvent, calendarEvent, eventSource, selfCalendar);
              selfCalendar.updateEvent(calendarEvent);
            }
          }
          uiConfig.eventClick = uiConfig.eventClick || defaultEventClicked;

          if (eventSource.eventRendered || eventSource.template || eventSource.templateUrl) {
            uiConfig.eventRender = function eventRenderer(calendarEvent, element, view) {
              var sourceEvent = eventSource.getSourceEvent(calendarEvent);
              function compile(element) {
                var scope = eventSource.scope || $rootScope;
                scope = scope.$new();
                scope.sourceEvent = sourceEvent;
                scope.calendarEvent = calendarEvent;
                scope.eventSource = eventSource;
                $compile(element)(scope);
              }
              function buildIntoElement(html, element) {
                var contentArea = element.find('.fc-content');
                if (contentArea.length == 0) {
                  return;
                }
                if (eventSource.templateReplace) {
                  contentArea.empty();
                }
                var inner = $(html);
                var contentChildren = inner.children();
                contentChildren.remove();
                contentArea.append(contentChildren);
                inner.each(function() {
                  $.each(this.attributes, function(idx, attr) {
                    var value = attr.value;
                    if (attr.name == 'class') {
                      value = attr.value + " " + contentArea.attr(attr.name);
                    }
                    contentArea.attr(attr.name, value);
                  });
                });
                return element;
              }

              if (sourceEvent) {
                if (eventSource.template || eventSource.templateUrl) {
                  if (eventSource.template) {
                    element = buildIntoElement(eventSource.template, element);
                    if (element) {
                      compile(element);
                    }
                  } else {
                    $http.get(eventSource.templateUrl, {
                      cache : $templateCache
                    }).then(function(response) {
                      element = buildIntoElement(response.data, element);
                      if (element) {
                        compile(element);
                      }
                    });
                  }
                }
                if (eventSource.eventRendered) {
                  eventSource.eventRendered(sourceEvent, element, calendarEvent, selfCalendar, view);
                  if (element) {
                    compile(element);
                  }
                }
              }
            }
          }

          function defaultTimeslotSelected(start, end, jsEvent, view) {
            var sourceEvent;
            if (eventSource.timeslotSelected) {
              sourceEvent = eventSource.timeslotSelected(start, end, selfCalendar, jsEvent, view);
            }
            if (sourceEvent) {
              selfCalendar.refetchEvents();
            }
            $timeout(function() {
              // simulate the absorbed click so that listeners for document clicks get one.
              angular.element(jsEvent.target).trigger('click');
            }, 100);
          }
          uiConfig.select = uiConfig.select || defaultTimeslotSelected;
          uiConfig.selectable = !!eventSource.timeslotSelected || !!uiConfig.select || uiConfig.selectable;

          eventSource.allowMultiDayEvents = eventSource.allowMultiDayEvents || false;

          function wrappedEventOverlap(delegate) {
            return function(stillEvent, movingEvent) {
              var stillSourceEvent = eventSource.getSourceEvent(stillEvent);
              var movingSourceEvent = eventSource.getSourceEvent(movingEvent);
              if (!eventSource.allowMultiDayEvents && isSpanningMultipleDays(movingSourceEvent)) {
                return false;
              }
              return delegate(stillSourceEvent, movingSourceEvent, stillEvent, movingEvent);
            };
          }

          if (eventSource.eventOverlap) {
            uiConfig.eventOverlap = wrappedEventOverlap(eventSource.eventOverlap);
          }

          function wrappedSelectOverlap(delegate) {
            return function(calendarEvent) {
              var sourceEvent = eventSource.getSourceEvent(calendarEvent);
              if (!eventSource.allowMultiDayEvents && isSpanningMultipleDays(sourceEvent)) {
                return false;
              }
              return delegate(sourceEvent, calendarEvent);
            };
          }

          if (eventSource.selectOverlap) {
            uiConfig.selectOverlap = wrappedSelectOverlap(eventSource.selectOverlap);
          }
        }
        CalendarModel.prototype.setTimeBounds = function(start, end) {
          if (!start) {
            return;
          }
          if (start.start && start.end) {
            end = start.end;
            start = start.start;
          }
          if (!end) {
            return;
          }
          this.minTime = start;
          this.maxTime = end;
        }
        Object.defineProperty(CalendarModel.prototype, "minTime", {
          get : function() {
            return this.uiConfig.minTime;
          },
          set : function(val) {
            this.uiConfig.minTime = val;
          }
        });
        Object.defineProperty(CalendarModel.prototype, "maxTime", {
          get : function() {
            return this.uiConfig.maxTime;
          },
          set : function(val) {
            this.uiConfig.maxTime = val;
          }
        });

        qn.each([ 'refetchEvents', 'rerenderEvents', 'updateEvent', 'removeEvents', 'clientEvents' ], function(calendarMethod) {
          CalendarModel.prototype[calendarMethod] = function() {
            var self = this;
            var args = [ calendarMethod ].concat(Array.prototype.slice.call(arguments));
            var fc = uiCalendarConfig.calendars[self.key];
            if (fc && fc.fullCalendar) {
              var result = fc.fullCalendar.apply(fc, args);
              if (result && result.jquery) {
                return;
              }
              return result;
            }
          };
        });

        CalendarModel.prototype.getClientEvent = function(idOrSourceEvent) {
          if (!idOrSourceEvent) {
            return;
          }

          var calendarEvent = this.eventSource.getCalendarEvent(idOrSourceEvent);
          var id = calendarEvent ? calendarEvent.id : undefined;
          if (!id) {
            return;
          }

          var clientEvent = _.find(this.clientEvents(), function(evt) {
            return evt.id == id;
          });

          return clientEvent;
        };
        CalendarModel.prototype.updateEventDisplayFromSource = function(sourceEvents) {
          if (!sourceEvents) {
            return;
          }
          if (!qn.isArray(sourceEvents)) {
            sourceEvents = [ sourceEvents ];
          }
          for (var e = 0; e < sourceEvents.length; e++) {
            var sourceEvent = sourceEvents[e];

            var calendarEvent = this.eventSource.getCalendarEvent(sourceEvent);
            if (calendarEvent) {
              this.eventSource.displayVisitor(sourceEvent, calendarEvent, this.eventSource, this);

              var clientEvent = this.getClientEvent(calendarEvent.id);
              if (clientEvent) {
                qn.copy(calendarEvent, clientEvent, function filter(key) {
                  return eventFieldsWithoutTime.indexOf(key) >= 0;
                });

                this.updateEvent(clientEvent);
              }
            }
          }
        };
        CalendarModel.prototype.updateEventDisplayFromSources = function() {
          var self = this;
          if (this.eventSource._eventCache) {
            qn.each(this.eventSource._eventCache, function(calendarEvent, id) {
              var sourceEvent = self.getSourceEvent(calendarEvent);
              if (sourceEvent) {
                self.updateEventDisplayFromSource(sourceEvent);
              }
            });
          }
        };

        CalendarModel.prototype.removeSourceEvent = function(sourceEvent) {
          if (!sourceEvent) {
            return;
          }
          var calendarEvent = this.eventSource.getCalendarEvent(sourceEvent);
          if (calendarEvent) {
            if (this.eventSource._eventCache) {
              delete this.eventSource._eventCache[calendarEvent.id];
            }
            this.removeEvents(calendarEvent.id);
          }
        };

        // MultiCalendarModel class
        function MultiCalendarModel(config) {
          this.calendars = {};
          this.axis = new CalendarModel("axis", {}, createUiConfig("appointments.axis"));
        }
        MultiCalendarModel.prototype.setTimeBounds = function(start, end) {
          if (!start) {
            return;
          }
          if (start.start && start.end) {
            end = start.end;
            start = start.start;
          }
          if (!end) {
            return;
          }
          this.minTime = start;
          this.maxTime = end;
        }
        MultiCalendarModel.prototype.addCalendarModel = function(key, eventSource, uiConfig, baseConfigName) {
          this.calendars[key] = new CalendarModel(key, eventSource, uiConfig, baseConfigName);
          return this.calendars[key];
        }
        MultiCalendarModel.prototype.clearCalendarModels = function(key, eventSource, uiConfig) {
          angular.copy({}, this.calendars);
        }
        MultiCalendarModel.prototype.widthPercent = function(outOf) {
          outOf = outOf || 100;
          return (outOf / this.numberOfCalendars) + '%';
        }
        MultiCalendarModel.prototype.style = function(outOf) {
          return {
            'width' : this.widthPercent(outOf)
          };
        }
        Object.defineProperty(MultiCalendarModel.prototype, "minTime", {
          get : function() {
            var start = qn.toMoment(this.axis.minTime);
            var keys = this.calendarKeys;
            for ( var c in keys) {
              var newStart = qn.toMoment(this.calendars[keys[c]].minTime);
              if (start) {
                if (start.isAfter(newStart)) {
                  start = newStart;
                }
              } else {
                start = newStart;
              }
            }
            return start;
          },
          set : function(val) {
            var newStart = qn.toMoment(val);
            this.axis.minTime = val;
            var keys = this.calendarKeys;
            for ( var c in keys) {
              this.calendars[keys[c]].minTime = val;
            }
          }
        });
        Object.defineProperty(MultiCalendarModel.prototype, "maxTime", {
          get : function() {
            var end = qn.toMoment(this.axis.maxTime);
            var keys = this.calendarKeys;
            for ( var c in keys) {
              var newEnd = qn.toMoment(this.calendars[keys[c]].maxTime);
              if (end) {
                if (end.isBefore(newEnd)) {
                  end = newEnd;
                }
              } else {
                end = newEnd;
              }
            }
            return end;
          },
          set : function(val) {
            var newEnd = qn.toMoment(val);
            this.axis.maxTime = val;
            var keys = this.calendarKeys;
            for ( var c in keys) {
              this.calendars[keys[c]].maxTime = val;
            }
          }
        });

        MultiCalendarModel.prototype.refetchEvents = function() {
          var self = this;
          var args = Array.prototype.slice.call(arguments);
          self.axis.refetchEvents.apply(self.axis, args);
          qn.each(self.calendars, function(calendarModel, idx) {
            calendarModel.refetchEvents.apply(calendarModel, args);
          });
        };

        MultiCalendarModel.prototype.rerenderEvents = function() {
          var self = this;
          var args = Array.prototype.slice.call(arguments);
          self.axis.refetchEvents.apply(self.axis, args);
          qn.each(self.calendars, function(calendarModel, idx) {
            calendarModel.rerenderEvents.apply(calendarModel, args);
          });
        };
        MultiCalendarModel.prototype.updateEventDisplayFromSource = function(sourceEvent) {
          var self = this;
          var args = Array.prototype.slice.call(arguments);
          self.axis.updateEventDisplayFromSource.apply(self.axis, args);
          qn.each(self.calendars, function(calendarModel, idx) {
            calendarModel.updateEventDisplayFromSource.apply(calendarModel, args);
          });
        };
        MultiCalendarModel.prototype.updateEventDisplayFromSources = function() {
          var self = this;
          var args = Array.prototype.slice.call(arguments);
          self.axis.updateEventDisplayFromSources.apply(self.axis, args);
          qn.each(self.calendars, function(calendarModel, idx) {
            calendarModel.updateEventDisplayFromSources.apply(calendarModel, args);
          });
        };
        MultiCalendarModel.prototype.removeSourceEvent = function(sourceEvent) {
          var self = this;
          var args = Array.prototype.slice.call(arguments);
          self.axis.removeSourceEvent.apply(self.axis, args);
          qn.each(self.calendars, function(calendarModel, idx) {
            calendarModel.removeSourceEvent.apply(calendarModel, args);
          });
        };

        Object.defineProperty(MultiCalendarModel.prototype, "numberOfCalendars", {
          get : function() {
            return Object.keys(this.calendars).length;
          }
        });

        Object.defineProperty(MultiCalendarModel.prototype, "calendarKeys", {
          get : function() {
            return Object.keys(this.calendars);
          }
        });

        var services = {
          withUiConfigDefaults : withUiConfigDefaults,
          createUiConfig : createUiConfig,
          createMultiCalendarModel : function(config) {
            return new MultiCalendarModel(config);
          },
          createCalendarModel : function(key, eventSource, uiConfig, baseConfigName) {
            return new CalendarModel(key, eventSource, uiConfig, baseConfigName);
          },
          setBackgroundColour : function(c) {
            jss.set('.fc-unthemed .fc-today', {
              'background-color' : c
            });
            // TODO allow config of these separately
            jss.set('.fc-unthemed .fc-past', {
              'background-color' : c
            });
            jss.set('.fc-unthemed .fc-future', {
              'background-color' : c
            });
          },
          setNonBusinessHoursColour : function(c) {
            jss.set('.fc-nonbusiness', {
              'background-color' : c
            });
          }
        };
        return services;
      } ]);

  module.factory('$calendarSelectionModel', [ '$applicationConfig', 'uiCalendarConfig', function($applicationConfig, uiCalendarConfig) {

    function CalendarSelectionModel(config) {

      this.allowedSelectionItemFilter = config.allowedSelectionItemFilter;
      this.sort = config.sort || false;
      this.multiselect = config.multiselect || false;
      this.refetchOnChange = this.refetchOnChange || false;
      this.rerenderAllOnChange = this.rerenderAllOnChange || false;
      this.setSelected = qn.caller(this, function setSelected(val) {
        this.selected = val;
      })
      this.toggleSelected = qn.caller(this, function toggleSelected(val) {
        if (this.multiselect) {
          if (this.isSelected(val)) {
            this.removeSelected(val);
          } else {
            this.addSelected(val);
          }
        } else {
          if (this.isSelected(val)) {
            this.selected = null;
          } else {
            this.selected = val;
          }
        }
      });

      // set the initial value, notify no change listeners or calendars
      this.selectionChanged = qn.noop;
      this.selected = config.selected;

      // these after the setting of the value, so that we don't count initial
      // setting as a change
      this.calendarModel = config.calendarModel;
      this.selectionChanged = config.selectionChanged || qn.noop;

    }
    CalendarSelectionModel.prototype = {
      hasSelection : function hasSelection() {
        return this._selected && this._selected.length > 0;
      },
      clearSelection : function clearSelection() {
        this.selected = [];
      },
      equalsSelection : function(otherSelection) {
        var currentSelection = this._selected || [];
        if (qn.isArray(otherSelection)) {
          return otherSelection.length === currentSelection.length && _.difference(otherSelection, currentSelection).length === 0;
        } else {
          if (qn.isNullOrUndefined(otherSelection)) {
            return currentSelection.length === 0;
          } else {
            return currentSelection[0] === otherSelection;
          }
        }
      },
      isSelected : function(elementOrArray) {
        if (!elementOrArray) {
          return false;
        }
        if (!qn.isArray(elementOrArray)) {
          elementOrArray = [ elementOrArray ];
        }
        var selected = this._selected || [];
        if (selected.length == 0) {
          if (elementOrArray.length == 0) {
            return true;
          }
          return false;
        }

        return _.every(elementOrArray || [], function(s) {
          return _.contains(selected, s);
        });
      },
      addSelected : function(elementOrArray) {
        if (!elementOrArray) {
          return;
        }
        if (!qn.isArray(elementOrArray)) {
          elementOrArray = [ elementOrArray ];
        }
        if (!this.multiselect) {
          this.clearSelection();
        }
        var _selected = (this._selected || []).concat(elementOrArray);
        this.selected = _selected;
      },
      removeSelected : function(elementOrArray) {
        if (!elementOrArray) {
          return;
        }
        if (!qn.isArray(elementOrArray)) {
          elementOrArray = [ elementOrArray ];
        }
        var _selected = _.difference(this._selected || [], elementOrArray);
        this.selected = _selected;
      }
    };

    Object.defineProperty(CalendarSelectionModel.prototype, "selected", {
      get : function() {
        if (!this._selected) {
          this._selected = [];
        }
        if (!qn.isArray(this._selected)) {
          this._selected = [ this._selected ];
        }
        if (this.multiselect) {
          return this._selected;
        }
        if (this._selected.length > 1) {
          this._selected.length = 1;
        }
        return this._selected[0];
      },
      set : function(val) {
        // establish the new values
        var _selected;
        if (qn.isArray(val)) {
          val = qn.flatten(val, false);
          val = _.reject(val, qn.isNullOrUndefined);
          if (!!this.allowedSelectionItemFilter) {
            val = _.filter(val, this.allowedSelectionItemFilter);
          }
          val = _.uniq(val);
          if (!!this.sort) {
            val = _.sortBy(val, this.sort);
          }
          if (this.multiselect) {
            _selected = val;
          } else {
            if (val.length > 0) {
              _selected = [ val[0] ];
            } else {
              _selected = val;
            }
          }
        } else {
          _selected = [];
          if (!qn.isNullOrUndefined(val)) {
            if (!this.allowedSelectionItemFilter || this.allowedSelectionItemFilter(val)) {
              _selected.push(val);
            }
          }
        }

        // abort change if there is no difference
        if (this.equalsSelection(_selected)) {
          return;
        }

        // capture the public and private internal state before doing the change
        var oldSelected = this.selected;
        var old_selected = this._selected || [];

        // update the internal value
        this._selected = _selected;

        // notify listeners, who may change state further
        this.selectionChanged(this.selected, oldSelected, this);

        // notify calendar of changes
        if (!!this.calendarModel) {
          if (!!this.refetchOnChange) {
            this.calendarModel.refetchEvents();
          } else {
            if (!!this.rerenderAllOnChange) {
              this.calendarModel.rerenderEvents();
            } else {
              var changed = _.uniq(old_selected.concat(this._selected));
              this.calendarModel.updateEventDisplayFromSource(changed);
            }
          }
        }
      }
    });

    return function(config) {
      return new CalendarSelectionModel(config);
    };
  } ]);

  module.factory('$calendarSelectionActions', [ '$actions', '$pageContext', function($actions, $pageContext) {
    return {
      createClearSelectionAction : function createClearSelectionAction(calendarSelectionModel) {
        var action = $actions.newAction({
          label : "actions.common.calendar.clearSelection",
          context : true,
          iconClasses : "glyphicon glyphicon-remove",
          enabled : function() {
            return calendarSelectionModel.hasSelection();
          },
          performAction : function() {
            calendarSelectionModel.clearSelection();
          }
        });
        $pageContext.addPageAction(action);
        return action;
      },
      createMergeSelectionAction : function createMergeSelectionAction(calendarSelectionModel, candidateMergeItemsGetter) {
        var action = $actions.newAction({
          label : "actions.common.calendar.mergeSelected",
          context : true,
          iconClasses : "glyphicon glyphicon-transfer",
          enabled : function() {
            if (!calendarSelectionModel.hasSelection()) {
              return false;
            }
            var selected = calendarSelectionModel.selected;
            var periods = candidateMergeItemsGetter(selected);
            return qn.domain.Period.adjacentPeriods(selected, periods).length > 0;
          },
          performAction : function() {
            if (!calendarSelectionModel.hasSelection()) {
              return;
            }
            var selected = calendarSelectionModel.selected;
            var periods = candidateMergeItemsGetter(selected);

            qn.domain.Period.mergeAdjacentPeriods(selected, periods);
            calendarSelectionModel.selected = selected;
            if (calendarSelectionModel && calendarSelectionModel.calendarModel && !calendarSelectionModel.refetchOnChange) {
              calendarSelectionModel.calendarModel.refetchEvents();
            }
          }
        });
        $pageContext.addPageAction(action);
        return action;
      },
      createDeleteSelectionAction : function createDeleteSelectionAction(calendarSelectionModel, collectionGetter) {
        var action = $actions.newAction({
          label : "actions.common.calendar.deleteSelected",
          context : true,
          iconClasses : "glyphicon glyphicon-trash",
          enabled : function() {
            return calendarSelectionModel.hasSelection();
          },
          performAction : function() {
            if (!calendarSelectionModel.hasSelection()) {
              return;
            }
            var selected = calendarSelectionModel.selected;
            var periods = collectionGetter(selected);

            qn.removeElement(periods, selected);
            if (calendarSelectionModel.calendarModel) {
              calendarSelectionModel.calendarModel.removeSourceEvent(selected);
            }
            calendarSelectionModel.clearSelection();
          }
        });
        $pageContext.addPageAction(action);
        return action;
      }
    };
  } ]);

  module.factory('$calendarContextActions', [ '$actions', function($actions, $pageContext) {
    return {
      createUnselectAction : function createUnselectAction(calendarSelectionModel) {
        var action = $actions.newAction({
          label : "actions.common.unselect",
          context : true,
          iconClasses : "glyphicon glyphicon-unchecked",
          available : function(target) {
            return calendarSelectionModel.isSelected(target);
          },
          performAction : function(target) {
            calendarSelectionModel.removeSelected(target);
          }
        });
        return action;
      },
      createSelectAction : function createSelectAction(calendarSelectionModel) {
        var action = $actions.newAction({
          label : "actions.common.select",
          context : true,
          iconClasses : "glyphicon glyphicon-check",
          available : function(target) {
            return !calendarSelectionModel.isSelected(target);
          },
          performAction : function(target) {
            calendarSelectionModel.addSelected(target);
          }
        });
        return action;
      },
      createMergeAction : function createMergeAction(calendarModel, candidateMergeItemsGetter) {
        var action = $actions.newAction({
          label : "actions.common.calendar.merge",
          context : true,
          iconClasses : "glyphicon glyphicon-transfer",
          enabled : function(target) {
            var periods = candidateMergeItemsGetter(target);
            return qn.domain.Period.adjacentPeriods(target, periods).length > 0;
          },
          performAction : function(target) {
            var periods = candidateMergeItemsGetter(target);

            qn.domain.Period.mergeAdjacentPeriods(target, periods);
            if (calendarModel) {
              calendarModel.refetchEvents();
            }
          }
        });
        return action;
      },
      createDeleteAction : function createDeleteAction(calendarSelectionModel, collectionGetter) {
        var action = $actions.newAction({
          label : "actions.common.delete",
          context : true,
          iconClasses : "glyphicon glyphicon-trash",
          enabled : function(target) {
            return true;
          },
          performAction : function(target) {
            var periods = collectionGetter(target);

            qn.removeElement(periods, target);
            if (calendarSelectionModel.calendarModel) {
              calendarSelectionModel.calendarModel.removeSourceEvent(target);
            }
            calendarSelectionModel.clearSelection();
          }
        });
        return action;
      }
    };
  } ]);

})(window, window.angular, window.qn);
