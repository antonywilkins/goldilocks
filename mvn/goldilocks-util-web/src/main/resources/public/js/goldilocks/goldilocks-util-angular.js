"use strict";

(function(window, moment) {

  var module = angular.module("goldilocks-util", [ 'pascalprecht.translate' ]);

  qn.applicationConfigDefaults = {
    systemInfo : {
      name : "Goldilocks"
    },
    defaultLanguage : "en",
    pagination : {
      pageSize : 10,
      numPageLinks : 5,
      availablePageSizes : [ 10, 20, 25, 50, 100 ]
    }
  };

  // application config defaults
  qn.applicationConfig = qn.extendDeep({}, qn.applicationConfigDefaults, qn.applicationConfig || {});
  module.constant('$applicationConfig', qn.applicationConfig);
  module.constant('$applicationConfigDefaults', qn.applicationConfigDefaults);

  // module config
  module.config([ '$applicationConfig', '$translateProvider', '$translatePartialLoaderProvider',
      function($applicationConfig, $translateProvider, $translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('common');
        $translateProvider.useLoader('$translatePartialLoader', {
          urlTemplate : '/partials/{part}/i18n/locale-{lang}.json',
          loadFailureHandler : 'translatePartialLoaderErrorHandler'
        });
        // load 'en' table on startup
        $translateProvider.preferredLanguage($applicationConfig.defaultLanguage);
        $translateProvider.use($applicationConfig.defaultLanguage);
        $translateProvider.forceAsyncReload(true);
        $translateProvider.useSanitizeValueStrategy('sanitize');
      } ]);

  module.factory('translatePartialLoaderErrorHandler', function($q, $log) {
    return function(part, lang) {
      $log.error('The "' + part + '/' + lang + '" part was not loaded.');
      return $q.when({});
    };
  });

  // run
  module.run([ '$rootScope', '$applicationConfig', '$translate', function($rootScope, $applicationConfig, $translate) {
    $rootScope.$endOfToday = moment().endOf('day').toDate();
    $rootScope.$startOfTomorrow = moment().add(1, 'day').startOf('day').toDate();
    $rootScope.$applicationConfig = $applicationConfig;

    $rootScope.$on('$translatePartialLoaderStructureChanged', function() {
      $translate.refresh();
    });
  } ]);

  module.factory('$translateEnum', [ '$translate', '$translateEnumKey', function($translate, $translateEnumKey) {
    return function(type, id, style) {
      style = style || 'default';
      var key = $translateEnumKey(type, id, style);

      function noStyle() {
        var noStyleKey = $translateEnumKey(type, id);
        return $translate(noStyleKey);
      }

      return $translate(key).then(function(result) {
        return result;
      }, function() {
        if (style != 'default') {
          key = $translateEnumKey(type, id, 'default');
          return $translate(key).then(function(result) {
            return result;
          }, function(result) {
            if (result == key) {
              return noStyle();
            }
            return result;
          });
        }
        return noStyle();
      });
    };
  } ]);

  module.factory('$translateEnumKey', [ function() {
    return function(type, id, style) {
      var key = 'types.' + type + '.' + id;
      if (style) {
        key = key + '.' + style;
      }
      return key;
    };
  } ]);

  module.factory('$entitySerialiserBuilder', [ '$log', function entitySerialiser($log) {
    var serialisers = {};

    var buildFunction = function build() {
      return function serialiseEntity(object) {
        if (object._type && serialisers[object._type]) {
          // support functions that take the object as an argument, and
          // those that don't, but are member functions
          return serialisers[object._type].apply(object, [ object ]);
        }
        if (object.serialise) {
          return object.serialise();
        }

        // no change
        return undefined;
      };
    };

    buildFunction.registerSerialiser = function registerSerialiser(type, serialiserFunction) {
      serialisers[type] = serialiserFunction;
    };

    return buildFunction;
  } ]);

  module.factory('$entityDeserialiserBuilder', [ '$entityResolver', '$log', function entityDeserialiser($entityResolver, $log) {
    var constructors = {};

    var buildFunction = function build() {
      var resolve = $entityResolver();

      return function deserialiseEntity(object) {
        if (object._type) {
          var constructorFunction = constructors[object._type];
          if (constructorFunction) {
            object = constructorFunction(object, resolve);
            object = resolve(object);
            return object;
          }
        }

        // no change
        return undefined;
      };
    };

    buildFunction.registerConstructor = function registerConstructor(type, constructorFunction) {
      constructors[type] = constructorFunction;
    };

    return buildFunction;
  } ]);

  module.factory('$entityResolver', [ '$log', function entityResolver($log) {
    var buildFunction = function build() {
      var resolvedEntities = {};

      function isEntity(entity) {
        if (!entity) {
          return false;
        }
        return !!entity.isEditModel;
      }

      function isMapOfEntities(entity) {
        if (!entity) {
          return false;
        }
        if (isEntity(entity)) {
          return false;
        }
        if (!qn.isObject(entity)) {
          return false;
        }

        if (Object.keys(entity).length == 0) {
          return false;
        }

        var isAnEntity = false;
        for ( var k in entity) {
          if (entity.hasOwnProperty(k)) {
            var mappedValue = entity[k];
            if (qn.isDefined(mappedValue)) {
              if (!isEntity(mappedValue)) {
                return false;
              }
              isAnEntity = true;
            }
          }
        }
        return isAnEntity;
      }

      function resolvedEntity(type, id, value) {
        if (!resolvedEntities[type]) {
          resolvedEntities[type] = {};
        }
        if (!qn.isUndefined(value)) {
          resolvedEntities[type][id] = value;
        }
        return resolvedEntities[type][id];
      }

      function resolve(entity) {
        if (isEntity(entity)) {
          var id = entity.getId();
          var resolved = resolvedEntity(entity.getType(), id);
          if (resolved) {
            qn.extendDeep(resolved, entity, resolved._propertyFilter);
          } else {
            resolved = resolvedEntity(entity.getType(), id, entity);
          }
          resolveRelationships(resolved);
          if (resolved.commit) {
            resolved.commit();
          }
        } else {
          resolved = entity;
        }
        return resolved;
      }

      function resolveRelationships(entity) {
        if (!entity || !entity._relationships) {
          return;
        }
        qn.each(entity._relationships, function(relationship) {
          if (!relationship.composite) {
            entity[relationship.name] = resolveEntityOrArrayOrMap(entity[relationship.name], true);
          }
        });
      }

      function resolveEntityOrArrayOrMap(input, allowMap) {
        if (qn.isArray(input)) {
          for (var a = 0; a < input.length; a++) {
            var element = input[a];
            var transformed = resolveEntityOrArrayOrMap(element);
            if (!qn.isUndefined(transformed)) {
              input[a] = transformed;
            }
          }
          return input;
        } else {
          if (qn.isUndefined(input)) {
            return undefined;
          }

          if (allowMap && isMapOfEntities(input)) {
            for ( var key in input) {
              if (input.hasOwnProperty(key)) {
                var element = input[key];
                var transformed = resolveEntityOrArrayOrMap(element);
                if (!qn.isUndefined(transformed)) {
                  input[key] = transformed;
                }
              }
            }
          }

          var transformed = resolve(input);
          return transformed || input;
        }
      }
      ;

      return resolveEntityOrArrayOrMap;
    };

    return buildFunction;
  } ]);

  module.factory('$entitySerialisation', [ '$entitySerialiserBuilder', '$entityDeserialiserBuilder', '$q', '$log',
      function entitySerialisation($entitySerialiserBuilder, $entityDeserialiserBuilder, $q, $log) {
        function serialiser() {
          return function serialise(object) {
            var delegateFunction = $entitySerialiserBuilder();
            if (qn.isArray(object)) {
              for (var a = 0; a < object.length; a++) {
                var element = object[a];
                var transformed = serialise(element);
                if (!qn.isUndefined(transformed)) {
                  object[a] = transformed;
                }
              }
            } else {
              if (qn.isUndefined(object)) {
                return undefined;
              }
              var transformed = delegateFunction(object);
              return transformed;
            }
          };
        }
        function deserialiser() {
          var delegateFunction = $entityDeserialiserBuilder();
          return function deserialise(json) {
            if (qn.isArray(json)) {
              for (var a = 0; a < json.length; a++) {
                var element = json[a];
                var transformed = deserialise(element);
                if (!qn.isUndefined(transformed)) {
                  json[a] = transformed;
                }
              }
            } else {
              if (qn.isUndefined(json)) {
                return undefined;
              }
              var transformed = delegateFunction(json);
              return transformed;
            }
          };
        }
        return {
          serialiser : serialiser,
          deserialiser : deserialiser,
        };
      } ]);

  module.factory('$longRunningOperations', [ '$rootScope', function($rootScope) {
    var operations = {};
    return {
      start : function startLongRunningOperation(id) {
        id = id || qn.nextUid();
        operations[id] = new Date();
        $rootScope.$busy = true;
        return id;
      },
      stop : function stopLongRunningOperation(id) {
        if (!id) {
          return;
        }
        delete operations[id];
        if (Object.keys(operations).length == 0) {
          $rootScope.$busy = false;
        }
      }
    }
  } ])

  module.factory('$serverService', [
      '$http',
      '$q',
      '$alertService',
      '$entitySerialisation',
      '$longRunningOperations',
      '$log',
      function serverService($http, $q, $alertService, $entitySerialisation, $longRunningOperations, $log) {

        var httpMethod = function httpMethod(method, url, configTransform, dataTransform, resultsTransform) {
          return function() {

            // transform arguments or default to $http arguments (as if
            // shifted by one argument, due to url being already
            // specified)
            var hasPayload = method == "post" || method == "put";
            var data = dataTransform ? dataTransform.apply(null, arguments) : (hasPayload ? arguments[0] : null);
            var config = (configTransform ? configTransform.apply(null, arguments) : arguments[hasPayload ? 1 : 0]) || {};

            // set up the $http args
            var httpArgs = [ url ];
            if (hasPayload) {
              httpArgs.push(data);
            }
            httpArgs.push(config);

            var longRunningOperationId = $longRunningOperations.start();
            // make the $http call
            var promise = $http[method].apply($http, httpArgs).then(function(results) {
              if (resultsTransform) {
                results = resultsTransform(results);
              }
              $longRunningOperations.stop(longRunningOperationId);
              return results;
            }, function(httpReason) {
              $longRunningOperations.stop(longRunningOperationId);
              var reason = {
                method : httpReason.config ? (httpReason.config.method || null) : null,
                url : httpReason.config ? (httpReason.config.url || null) : null,
                status : httpReason.status,
                statusText : httpReason.statusText,
              };
              reason = qn.extend(reason, httpReason.data || {});

              var e = new qn.ErrorInfo(reason, httpReason);
              $log.error("Error:", e, "\nCause:", httpReason);
              $alertService.raiseAlert(e);

              return $q.reject(e);
            });

            return promise;
          };
        };

        return function(serviceBaseUrl) {

          var idConfigTransform = function(id, config) {
            config = config || {};
            config.params = config.params || {};
            config.params.id = id;
            return config;
          };

          var paginationConfigTransform = function(page, pageInfo, config) {
            config = config || {};
            config.params = config.params || {};
            config.params.page = page - 1;
            config.params.pageSize = pageInfo.pageSize;
            config.params.sort = pageInfo.sortBy;
            config.pageInfo = pageInfo || {};
            return config;
          };

          var finderConfigTransform = function(sortBy, config) {
            config = config || {};
            config.params = config.params || {};
            config.params.sort = sortBy;
            return config;
          };

          var paginationResultsTransform = function(result) {
            var pageInfo = qn.extend(result.config.pageInfo, result.data);
            var newPage = pageInfo.number + 1;
            pageInfo.currentPage = newPage;
            pageInfo.items = pageInfo.content;
            delete pageInfo.content;

            var deserialiser = $entitySerialisation.deserialiser();
            var deserialised = deserialiser(pageInfo.items);
            if (!qn.isUndefined(deserialised)) {
              pageInfo.items = deserialised;
            }

            return pageInfo;
          };

          var entityDataResultsTransform = function(result) {
            var deserialiser = $entitySerialisation.deserialiser();
            var deserialised = deserialiser(result.data);
            if (!qn.isUndefined(deserialised)) {
              result.data = deserialised;
            }
            return result.data;
          };

          var entityDataTransform = function(data) {
            var serialiser = $entitySerialisation.serialiser();
            var serialised = serialiser(data);
            if (!qn.isUndefined(serialised)) {
              data = serialised;
            }
            return data;
          };

          var serviceMethod = function(method, serviceName, configTransform, dataTransform, resultsTransform) {
            var url = serviceBaseUrl + serviceName;
            return httpMethod(method, url, configTransform, dataTransform, resultsTransform);
          };

          var serverService =
              {
                crudServices : function(unpagedFindAll) {
                  return {
                    create : serviceMethod('post', 'create', null, entityDataTransform, entityDataResultsTransform),
                    update : serviceMethod('post', 'update', null, entityDataTransform, entityDataResultsTransform),
                    remove : serviceMethod('get', 'remove', idConfigTransform, null, entityDataResultsTransform),
                    findById : serviceMethod('get', 'search/findById', idConfigTransform, null, entityDataResultsTransform),
                    findAll : unpagedFindAll ? serviceMethod('get', 'search/findAll', finderConfigTransform, null,
                        entityDataResultsTransform) : serviceMethod('get', 'search/findAll', paginationConfigTransform, null,
                        paginationResultsTransform)
                  };
                },
                serviceMethod : serviceMethod,
                transforms : {
                  config : {
                    id : idConfigTransform,
                    pagination : paginationConfigTransform
                  },
                  data : {
                    entity : entityDataTransform
                  },
                  result : {
                    entity : entityDataResultsTransform,
                    pagination : paginationResultsTransform,
                  }
                }
              };
          return serverService;
        };

      } ]);

  module.provider("$exceptionHandler", function exceptionHandlerProvider() {
    this.$get = [ "$alertService", "$log", function($alertService, $log) {
      var handler = function(e, cause) {
        e = new qn.ErrorInfo(e);
        $log.error("Error:", e, "\nCause:", cause);
        $alertService.raiseAlert(e);
      };
      return handler;
    } ];
  });

  module.factory('$alertService', [ '$injector', '$log', function qnAlertServiceFactory($injector, $log) {
    var $rootScope = null; // initialized later because of circular
    // dependency
    var $translate = null; // ditto
    var addAlert = function addAlert(alertInfo) {
      var alert = qn.normaliseOptions(alertInfo, "messageId");
      alert.type = alert.type || "info";
      alert.message = alert.message;
      if (alert.type == "error" && !alert.message && !alert.messageId) {
        alert.message = "Unexpected Error";
      }
      if (alert.messageId) {
        $translate(alert.messageId).then(function(msg) {
          alert.message = msg || alert.message;
        });
      }
      alert.when = alert.when || new Date();
      alert.acknowledged = alert.acknowledged || false;
      alert.acknowledge = alert.acknowledge || function() {
        if (alert.acknowledged) {
          return;
        }
        alert.acknowledged = true;
        // broadcastAlertOver(alert);
        alert.fireAlertAcknowledged();
      };
      alert.addAcknowledgedListener = function(listener) {
        alert._listeners = alert._listeners || [];
        alert._listeners.push(listener);
      };
      alert.removeAcknowledgedListener = function(listener) {
        if (!alert._listeners) {
          return;
        }
        removeElement(this._listeners, listener);
      };
      alert.fireAlertAcknowledged = function() {
        if (!alert._listeners) {
          return;
        }
        var args = [ alert ].concat(Array.prototype.slice.call(arguments));
        qn.each(alert._listeners, function(listener) {
          listener.apply(listener, args);
        });
      };

      return alert;
    };
    var eventName = "event:qn-alert";
    var broadcast = function broadcastAlert(alertInfo) {
      configure();
      try {
        $rootScope.$broadcast(eventName, addAlert(alertInfo));
      } catch (ex) {
        $log.error(ex);
      }
    };
    var eventOverName = "event:qn-alert-ended";
    var broadcastAlertOver = function broadcastAlertOver(alert) {
      configure();
      try {
        $rootScope.$broadcast(eventOverName, alert);
      } catch (ex) {
        $log.error(ex);
      }
    };
    var configured = false;

    var configure = function configure() {
      if (!configured) {
        configured = true;
        $rootScope = $rootScope || $injector.get('$rootScope');
        $translate = $translate || $injector.get('$translate');
      }
    };

    var createTypeFn = function(level, autoAcknowledge) {
      return function(messageId, message) {
        var alert = qn.extend({}, qn.normaliseOptions(messageId, "messageId"));
        alert.message = alert.message || message || alert.messageId;
        alert.autoAcknowledge = autoAcknowledge || false;
        alert.type = alert.type || level;
        broadcast(alert);
      }
    };

    var qnAlertService = {
      raiseAlert : broadcast,
      success : createTypeFn("success", true),
      info : createTypeFn("info", true),
      warning : createTypeFn("warning", false),
      error : createTypeFn("error", false)
    };
    return qnAlertService;
  } ]);
})(window, window.moment);
