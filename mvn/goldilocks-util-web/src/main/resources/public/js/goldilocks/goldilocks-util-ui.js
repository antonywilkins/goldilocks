"use strict";

(function(window, angular, qn) {

  var module =
      angular.module("goldilocks-util-ui", [ 'ngAnimate', 'ngSanitize', 'ngLocale', 'ui.bootstrap', 'cgNotify', 'ng-context-menu', 'goldilocks-util' ]);

  // run
  module.run([
      '$http',
      '$templateCache',
      '$alertNotifier',
      'notify',
      function($http, $templateCache, $alertNotifier, notify) {
        qn.each([ '/templates/common/alert-notification.html', '/templates/common/confirm-delete.html', '/templates/common/filter.html',
            '/templates/common/paginate.html' ], function(templateId) {
          $http.get(templateId, {
            cache : $templateCache,
            headers : {
              'Cache-Control' : 'max-age=3600'
            }
          });
        });

        $alertNotifier.notifyOnAlertBroadcast();
        notify.config({
          templateUrl : "/templates/common/alert-notification.html",
          maximumOpen : 5
        });
      } ]);

  // alert handling
  module.factory('$alertNotifier', [ '$rootScope', 'notify', function($rootScope, notify) {

    var deregisterAlertNotifications;

    function notifyOnAlertBroadcast() {
      deregisterAlertNotifications = $rootScope.$on('event:qn-alert', function(evt, alert) {
        notifyAlert(alert);
      });
    }

    function stopAlertNotifications() {
      if (deregisterAlertNotifications) {
        deregisterAlertNotifications();
      }
    }

    function notifyAlert(alert) {
      if (!alert) {
        return;
      }

      var message = alert.message || alert.messageId;

      alert.duration = alert.duration || (alert.autoAcknowledge ? 2000 : 0);

      var typeClass = alert.type || "info";
      var position = "right";
      if (alert.type == "error") {
        typeClass = "danger";
        position = "top";
      }
      typeClass = "alert-" + typeClass;

      var scope = $rootScope.$new();
      scope.alert = alert;

      var notification = notify({
        message : message,
        duration : alert.duration,
        classes : typeClass,
        onClose : alert.acknowledge,
        scope : scope,
        position : position,
        clickAnyWhereToClose : true
      });

      if (notification && alert.addAcknowledgedListener) {
        alert.addAcknowledgedListener(function(a) {
          notification.close();
        });
      }

      return notification;
    }

    var services = {
      notifyOnAlertBroadcast : notifyOnAlertBroadcast,
      stopAlertNotifications : stopAlertNotifications,
      notify : notifyAlert
    };
    return services;
  } ]);

  // *** Directives ***

  // Pagination
  module.factory('$pagination', [ '$applicationConfig', '$rootScope', function($applicationConfig, $rootScope) {
    $rootScope.pageInfo = $rootScope.pageInfo || {};
    var services = {
      createPageInfo : function(pageInfoId) {
        var storedPageInfo = (pageInfoId ? $rootScope.pageInfo[pageInfoId] : {}) || {};
        var pageModel = qn.extendDeep({
          items : [],
          currentPage : 1,
          totalElements : 0,
          totalPages : 0,
          sort : null
        }, $applicationConfig.pagination, storedPageInfo);
        if (pageInfoId) {
          $rootScope.pageInfo[pageInfoId] = pageModel;
        }
        return pageModel;
      }
    };
    return services;
  } ]);

  module.factory('$pageContext', [ '$rootScope', function($rootScope) {
    $rootScope.pageContext = {
      actions : {
        page : []
      }
    };
    var services = {
      clearPageActions : function() {
        $rootScope.pageContext.actions.page = [];
      },
      addPageAction : function(action) {
        $rootScope.pageContext.actions.page.push(action);
      }
    };
    return services;
  } ]);

  module.factory('$editController', [ '$location', '$actions', '$pageContext', '$alertService',
      function($location, $actions, $pageContext, $alertService) {

        var createCancelAction = function() {
          var action = $actions.newAction({
            label : "actions.common.cancel",
            iconClasses : "glyphicon glyphicon-remove",
            performAction : function() {
              return $location.path("/");
            }
          });
          $pageContext.addPageAction(action);
          return action;
        };
        var createResetAction = function(editModel, editFormFn) {
          var action = $actions.newAction({
            label : "actions.common.reset",
            iconClasses : "glyphicon glyphicon-step-backward",
            enabled : function() {
              return editModel.changed;
            },
            performAction : function() {
              return editModel.reset();
            }
          });
          $pageContext.addPageAction(action);
          return action;
        };
        var createSaveAction = function(editModel, editFormFn, saveService, preSaveFn, path) {
          var action = $actions.newAction({
            label : "actions.common.save",
            iconClasses : "glyphicon glyphicon-ok text-success",
            primary : true,
            enabled : function() {
              if (!editModel.changed) {
                return false;
              }
              var editForm = editFormFn() || {
                $invalid : false
              };
              return !editForm.$invalid;
            }
          });

          if (saveService) {
            var saveEditModel = function() {
              var svc = editModel.existing ? "update" : "create";
              return saveService[svc](editModel).then(function(saved) {
                editModel.refresh(saved);
                $alertService.raiseAlert({
                  type : "success",
                  messageId : "messages.save.success",
                  autoAcknowledge : true
                });
                if (path !== false) {
                  $location.path(path || "/");
                }
                return saved;
              });
            };
            action.performAction = function() {
              if (preSaveFn) {
                var preSaveResult = preSaveFn(editModel);
                if (qn.isDefined(preSaveResult) && qn.isFunction(preSaveResult.then)) {
                  return preSaveResult.then(saveEditModel);
                }
              }
              return saveEditModel();
            };
          }

          $pageContext.addPageAction(action);
          return action;
        };
        var services = {
          createCancelAction : createCancelAction,
          createResetAction : createResetAction,
          createSaveAction : createSaveAction,
          createPageActions : function(editModel, editFormFn, saveService, preSaveFn, savePath) {
            var actions = {
              cancel : createCancelAction(),
              reset : createResetAction(editModel, editFormFn),
              save : createSaveAction(editModel, editFormFn, saveService, preSaveFn, savePath)
            };
            return actions;
          }
        };
        return services;
      } ]);

  module.factory('$options', [ '$translate', function($translate) {
    function translate() {
      qn.each(arguments, function(options) {
        if (qn.isArray(options)) {
          translate.apply(null, options);
        } else {
          $translate(options.label).then(function(text) {
            options.label = text;
          });
        }
      });
    }
    return {
      translate : translate
    };
  } ]);

  module.factory('$actions', [ '$translate', function($translate) {
    var services = {
      newAction : function(config) {

        if (!qn.isFunction(config.available)) {
          if (!qn.isBoolean(config.available)) {
            config.available = true;
          }
          var available = config.available;
          config.available = function() {
            return available;
          }
        }

        if (!qn.isFunction(config.enabled)) {
          if (!qn.isBoolean(config.enabled)) {
            config.enabled = true;
          }
          var enabled = config.enabled;
          config.enabled = function() {
            return enabled;
          }
        }

        if (!qn.isFunction(config.label)) {
          if (!qn.isString(config.label)) {
            config.label = "";
          }
          var label = config.label;
          $translate(label).then(function(l) {
            label = l;
          });
          config.label = function() {
            return label;
          }
        }

        if (!qn.isFunction(config.classes)) {
          if (!qn.isString(config.classes)) {
            config.classes = "";
          }
          var classes = config.classes;
          config.classes = function() {
            return classes;
          }
        }

        if (!qn.isFunction(config.iconClasses)) {
          if (!qn.isString(config.iconClasses)) {
            config.iconClasses = null;
          }
          var iconClasses = config.iconClasses;
          config.iconClasses = function() {
            return iconClasses;
          }
        }

        if (!qn.isFunction(config.labelHtml)) {
          config.labelHtml = function(target) {
            var iconClasses = config.iconClasses(target);
            return (iconClasses ? '<i class="' + iconClasses + '"></i> ' : '') + config.label(target);
          }
        }

        return config;
      }
    };
    return services;
  } ]);

  module.factory('$dialogs', [ '$modal', '$translate', function($modal, $translate) {
    var services = {
      confirmDelete : function(config, description) {
        config = qn.extend({}, qn.normaliseOptions(config, "type"));
        $translate(config.type).then(function(typename) {
          config.type = typename;
        });
        config.description = config.description || description || config.type;
        return $modal.open({
          animation : true,
          templateUrl : '/templates/common/confirm-delete.html',
          controller : 'ConfirmDialogCtrl',
          size : null,
          resolve : {
            config : function() {
              return config;
            }
          }
        }).result;
      }
    };
    return services;
  } ]);

  module.controller('ConfirmDialogCtrl', [ '$scope', '$modalInstance', 'config', function($scope, $modalInstance, config) {
    $scope.config = config;
    $scope.confirm = function() {
      $modalInstance.close(true);
    };
    $scope.cancel = function() {
      $modalInstance.dismiss(false);
    };
  } ]);

  module.directive('qnEnumOptions', [ '$compile', '$translateEnum', function directive($compile, $translateEnum) {
    return {
      restrict : 'A',
      scope : true,
      require : 'ngModel',
      template : '<option ng-repeat="opt in enumOptions" value="{{opt.id}}" ng-selected="model == opt.id">{{opt.name}}</option>',
      link : function link(scope, element, attrs, ngModel) {
        if (qn.isDefined(attrs.qnEnumOptions)) {
          var enumName = attrs.qnEnumOptions;
          var enumLiterals = qn.domain.enums[enumName];

          scope.model = scope.$eval(attrs.ngModel);
          ngModel.$viewChangeListeners.push(function() {
            scope.model = scope.$eval(attrs.ngModel);
          });
          scope.enumLiterals = enumLiterals;
          scope.enumName = enumName;
          var enumTranslationKey = function(opt) {
            return "types." + enumName + "." + opt;
          };
          scope.enumOptions = [];
          qn.each(enumLiterals, function(enumLiteral) {
            var enumLiteralName = enumLiteral;
            if (qn.isObject(enumLiteral)) {
              enumLiteralName = enumLiteral.id;
            }
            var opt = {
              id : enumLiteralName,
              name : enumTranslationKey(enumLiteral)
            };
            scope.enumOptions[scope.enumOptions.length] = opt;
            $translateEnum(enumName, enumLiteral).then(function(text) {
              opt.name = text;
            });
          });
        }
      }
    };
  } ]);

  module.directive('qnAction', [ '$compile', function directive($compile) {
    return {
      restrict : 'A',
      replace : true,
      link : function link(scope, element, attrs) {
        if (qn.isDefined(attrs.qnAction)) {
          element.removeAttr("qn-action");

          var qnActionTarget = attrs.qnActionTarget || '';

          var showIfDisabled = true;
          if (qn.isDefined(attrs.showIfDisabled)) {
            showIfDisabled = attrs.showIfDisabled !== "false";
          }
          var ngShowMethod = "available";
          if (!showIfDisabled) {
            ngShowMethod = "enabled";
          }

          element.attr("ng-show", attrs.qnAction + "." + ngShowMethod + "("+qnActionTarget+")");
          element.attr("ng-disabled", "!" + attrs.qnAction + ".enabled("+qnActionTarget+")");
          element.attr("ng-click", attrs.qnAction + ".performAction("+qnActionTarget+")");
          element.attr("ng-bind-html", "" + attrs.qnAction + ".labelHtml("+qnActionTarget+")");
          element.attr("ng-class", "" + attrs.qnAction + ".classes("+qnActionTarget+")");
          $compile(element)(scope);
        }
      }
    };
  } ]);

  module.directive('qnChange', [ '$compile', '$parse', '$q', '$timeout', function($compile, $parse, $q, $timeout) {
    return {
      require : 'ngModel',
      scope : {
        qnChange : '&'
      },
      link : function(scope, element, attrs, modelCtrl) {
        // SUPPORTED ATTRIBUTES (OPTIONS)

        // minimal wait time after last character typed before qnChange
        // kicks-in
        var waitTime = scope.$eval(attrs.qnChangeWaitMs) || 0;

        // binding to a variable that indicates if matches are being
        // retrieved asynchronously
        var isLoadingSetter = $parse(attrs.qnChangeLoading).assign || angular.noop;

        // INTERNAL VARIABLES

        var hasFocus;

        var getMatchesAsync = function(inputValue) {

          var locals = {
            $viewValue : inputValue
          };
          isLoadingSetter(scope, true);
          scope.qnChange(inputValue).then(function(matches) {

            // it might happen that several async queries were in progress
            // if a user were typing fast
            // but we are interested only in responses that correspond to
            // the current view value
            var onCurrentRequest = (inputValue === modelCtrl.$viewValue);
            if (onCurrentRequest && hasFocus) {
              // good job this is one for us - too late to stop results now!
            }
            if (onCurrentRequest) {
              isLoadingSetter(scope, false);
            }
            return matches;
          }, function() {
            isLoadingSetter(scope, false);
          });
        };

        // Declare the timeout promise var outside the function scope so
        // that stacked calls can be cancelled later
        var timeoutPromise;

        var scheduleSearchWithTimeout = function(inputValue) {
          timeoutPromise = $timeout(function() {
            getMatchesAsync(inputValue);
          }, waitTime);
        };

        var cancelPreviousTimeout = function() {
          if (timeoutPromise) {
            $timeout.cancel(timeoutPromise);
          }
        };

        // plug into $parsers pipeline to open a qnChange on view changes
        // initiated from DOM
        // $parsers kick-in on all the changes coming from the view as well
        // as manually triggered by $setViewValue
        modelCtrl.$parsers.unshift(function(inputValue) {

          hasFocus = true;

          if (waitTime > 0) {
            cancelPreviousTimeout();
            scheduleSearchWithTimeout(inputValue);
          } else {
            getMatchesAsync(inputValue);
          }

          return inputValue;
        });
      }
    };
  } ]);

  module.directive('qnPaginate', [ '$compile', function directive($compile) {
    return {
      restrict : 'EC',
      replace : false,
      templateUrl : '/templates/common/paginate.html',
      scope : {
        pageModel : '=',
        showSizer : '=',
        pageChanged : '&'
      }
    };
  } ]);

  module.directive('qnFilter', [ '$compile', function directive($compile) {
    return {
      restrict : 'EC',
      replace : false,
      templateUrl : '/templates/common/filter.html',
      scope : {
        filterModel : '=',
        filterChanged : '&',
        filterWaitMs : '=',
        filterPlaceholder : '='
      }
    };
  } ]);

  module.directive('pwCheck', [ function() {
    return {
      require : 'ngModel',
      link : function(scope, elem, attrs, ctrl) {
        var validate = function() {
          var compareValue = scope[attrs.pwCheck];
          var thisValue = scope[attrs.pwCheckThis];
          var v = compareValue == thisValue;
          ctrl.$setValidity("pwCheck", v);
        };

        scope.$watch(function() {
          return scope[attrs.pwCheck];
        }, validate);
        scope.$watch(function() {
          return scope[attrs.pwCheckThis];
        }, validate);
      }
    }
  } ]);

  module.directive('pwCheckOld', [ function() {
    return {
      require : 'ngModel',
      link : function(scope, elem, attrs, ctrl) {
        var validate = function() {
          var compareValue = scope[attrs.pwCheckOld];
          var thisValue = scope[attrs.pwCheckOldThis];
          var v = compareValue != thisValue;
          ctrl.$setValidity("pwCheckOld", v);
        };

        scope.$watch(function() {
          return scope[attrs.pwCheckOld];
        }, validate);
        scope.$watch(function() {
          return scope[attrs.pwCheckOldThis];
        }, validate);
      }
    }
  } ]);

  /**
   * Duration filter
   */

  module.filter('duration', [ '$locale', 'numberFilter', 'translateFilter', function($locale, numberFilter, translateFilter) {
    var units = [ 'years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds' ];

    function translate(key, interpolateParams, interpolation) {
      var result = translateFilter(key, interpolateParams, interpolation);
      if (result == key) {
        return undefined;
      }
      return result;
    }

    function formatUnit(unit, unitValue, format, isFirst) {
      format = format || 'delimited';
      var result = '';
      if (!isFirst) {
        var sep = translate('duration.' + unit + '.' + format + '.separator') || ' ';
        result = result + sep;
      }
      var pluralityKey;
      if (unitValue == 0) {
        pluralityKey = 'zero';
      } else {
        if (unitValue == 1) {
          pluralityKey = 'one';
        } else {
          pluralityKey = 'many';
        }
      }
      var pre = translate('duration.' + unit + '.' + format + '.prefix.' + pluralityKey) || '';
      var post = translate('duration.' + unit + '.' + format + '.postfix.' + pluralityKey) || '';

      if (format != 'delimited') {
        unitValue = numberFilter(unitValue);
      } else {
        if (unit == 'seconds' || unit == 'minutes') {
          unitValue = padToSize(unitValue, 2);
        }
        if (unit == 'milliseconds') {
          unitValue = padToSize(unitValue, 3);
        }
      }

      result = result + pre + unitValue + post;
      return result;
    }

    return function(duration, maxUnit, minUnit, format) {
      if (qn.isUndefined(duration)) {
        return duration;
      }

      maxUnit = maxUnit || 'hours';
      minUnit = minUnit || 'minutes';
      format = format || 'delimited';
      var d = moment.duration(duration);

      var start = false;
      var end = false;
      var result = "";
      for (var u = 0; u < units.length && !end; u++) {
        var unit = units[u];
        if (unit == maxUnit) {
          start = true;
        }
        if (unit == minUnit) {
          end = true;
        }
        if (start) {
          var unitValue;
          var isFirst = unit == maxUnit;
          if (isFirst) {
            unitValue = Math.floor(d.as(unit));
          } else {
            unitValue = d.get(unit);
          }
          var printUnit = unitValue != 0 || format == 'delimited' || (end && result.length == 0);
          if (printUnit) {
            result = result + formatUnit(unit, unitValue, format, isFirst);
          }
        }
      }
      return result;
    };
  } ]);

  /**
   * Money filters for integer currency
   */

  module.filter('money', [ 'currencyFilter', '$locale', function(currencyFilter, $locale) {
    return function(amount, currencySymbol, fractionSize) {
      amount = amount || 0;
      if (qn.isUndefined(fractionSize)) {
        fractionSize = $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac;
      }
      var scaleFactor = Math.pow(10, fractionSize);
      var amountInt = amount / scaleFactor;
      var out = currencyFilter(amountInt, currencySymbol, fractionSize);
      return out;
    };
  } ]);

  /**
   * money directive
   */

  module.directive('money', [ '$locale', function($locale) {
    var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
    function parseFloat2(str) {
      str = (str + '').replace(/[^\d,.-]/g, '')
      var sign = str.charAt(0) === '-' ? '-' : '+'
      var minor = str.match(/[.,](\d+)$/)
      str = str.replace(/[.,]\d*$/, '').replace(/\D/g, '')
      return Number(sign + str + (minor ? '.' + minor[1] : ''))
    }
    function link(scope, el, attrs, ngModel) {

      var allowEmpty;
      if (attrs.allowEmpty) {
        allowEmpty = true;
      }

      var fractionSize;
      if (attrs.precision) {
        try {
          fractionSize = parseInt(attrs.precision);
        } catch (e) {
        }
      }
      if (qn.isUndefined(fractionSize)) {
        fractionSize = $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac;
      }
      var scaleFactor = Math.pow(10, fractionSize);

      var min;
      var validateMin = false;
      if (attrs.min) {
        try {
          min = parseInt(attrs.min);
          validateMin = true;
        } catch (e) {
        }
      }

      var max;
      var validateMax = false;
      if (attrs.max) {
        try {
          max = parseInt(attrs.max);
          validateMax = true;
        } catch (e) {
        }
      }

      function formatViewValue(value) {
        if (typeof value == 'undefined') {
          if (allowEmpty) {
            return "";
          }
          value = 0;
        }
        var viewValue = value / scaleFactor;
        viewValue = viewValue.toFixed(fractionSize);
        return viewValue;
      }

      // used when populating the text box from the model initially and when it
      // changes. Does not reformat user input after $parser runs.
      ngModel.$formatters.push(formatViewValue);

      var viewValue = null;
      ngModel.$parsers.push(function(value) {
        try {
          if (typeof value == 'undefined') {
            if (allowEmpty) {
              return null;
            }
            value = "0";
          }
          var modelValue = Math.floor(parseFloat2(value) * scaleFactor);
          ngModel.$setValidity('is_valid', true);
          return modelValue;
        } catch (e) {
          ngModel.$setViewValue(viewValue);
          ngModel.$render();
          ngModel.$setValidity('is_valid', false);
          return viewValue;
        }
      });

      // ensures the view reflects any adjustments (e.g. the Math.floor
      // above will ensure an int, even when the view value had extra
      // decimal places. this ensures the view reflects the restriction.)
      el.bind('blur', function() {
        var value = ngModel.$modelValue;
        ngModel.$viewValue = formatViewValue(value);
        ngModel.$render();
      });

      if (validateMin) {
        ngModel.$validators.min = function(modelValue, viewValue) {
          if (allowEmpty && ngModel.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (modelValue >= min) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }

      if (validateMax) {
        ngModel.$validators.max = function(modelValue, viewValue) {
          if (allowEmpty && ngModel.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (modelValue <= max) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }

    }

    return {
      restrict : 'A',
      require : 'ngModel',
      link : link
    };
  } ]);

  module.filter('translateEnum', [ 'translateFilter', '$locale', '$translateEnumKey',
      function(translateFilter, $locale, $translateEnumKey) {
        return function(id, type, style, interpolateParams, interpolation) {
          style = style || 'default';
          var key = $translateEnumKey(type, id, style);
          var result = translateFilter(key, interpolateParams, interpolation);
          if (result == key && style != 'default') {
            key = $translateEnumKey(type, id, 'default');
            result = translateFilter(key, interpolateParams, interpolation);
          }
          if (result == key) {
            key = $translateEnumKey(type, id);
            result = translateFilter(key, interpolateParams, interpolation);
          }
          return result;
        };
      } ]);


  module.directive('qnAppendToBody',
      ['$document', '$compile', '$parse',
      function($document, $compile, $parse) {

      return {
        restrict: 'AC',
        replace: false,
        //transclude: false,
        scope: true,
        link: function(scope, element) {
            element.removeAttr('qn-append-to-body');
            //$compile(element)(scope);
            $document.find('body').append(element);
        }
      };
    }]);



})(window, window.angular, window.qn);
