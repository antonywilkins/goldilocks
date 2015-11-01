"use strict";

(function(window, moment, angular, _) {

  // Standard extensions

  var isArray = angular.isArray;
  var isBoolean = function(val) {
    return "boolean" === typeof value;
  };
  var isObject = angular.isObject;
  var isDefined = angular.isDefined;
  var isUndefined = angular.isUndefined;
  var isFunction = angular.isFunction;
  var isNumber = angular.isNumber;
  var isString = angular.isString;
  var isDate = angular.isDate;
  var each = _.each;
  var extend = angular.extend;
  var indexOf = _.indexOf;
  var isArguments = _.isArguments;
  var lowercase = angular.lowercase;
  var wrap = _.wrap;
  var noop = function noop() {
  };

  function isArrayOrArguments(value) {
    if (isArray(value)) {
      return true;
    }
    return isArguments(value);
  }

  function isEmpty(value) {
    return isUndefined(value) || value === '' || value === null || value !== value;
  }

  function isError(arg) {
    return arg instanceof Error;
  }

  function isNullOrUndefined(value) {
    return isUndefined(value) || value === null || value !== value;
  }

  function parseBoolean(value) {
    if (value === true || value === false) {
      return value;
    }
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return undefined;
  }

  function toArray(value) {
    if (isEmpty(value)) {
      return [];
    }
    if (isArray(value)) {
      return value;
    }
    if (isArguments(value)) {
      return Array.prototype.slice.call(value);
    }
    return [ value ];
  }

  function parseQuerystring(search) {
    var srch = search || window.location.search;
    var nvpair = {};
    var qs = srch.replace('?', '');
    var pairs = qs.split('&');
    each(pairs, function parsePair(v, i) {
      var pair = v.split('=');
      nvpair[pair[0]] = pair[1];
    });
    return nvpair;
  }

  function getPropertyByPath() {
    var argumentsToUse = flatten(arguments);
    if (argumentsToUse.length === 0) {
      return undefined;
    }
    var src = argumentsToUse.shift();
    if (argumentsToUse.length > 0) {
      var property = argumentsToUse.shift();
      if (isEmpty(property)) {
        return null;
      }

      // convert to array for dot delimited paths, and use only the
      // first part as the property (shifting remainder to front of
      // arguments of next iteration)
      var propertiesPath = property.split(".");
      property = propertiesPath.shift();
      if (propertiesPath.length > 0) {
        argumentsToUse = propertiesPath.concat(argumentsToUse);
      }

      // now we have a single property name, resolve it, and chain
      // next argument
      var resolvedValue = src[property];
      if (isEmpty(resolvedValue) || argumentsToUse.length === 0) {
        return resolvedValue;
      }
      return getPropertyByPath(resolvedValue, argumentsToUse);
    }
    return src;
  }

  // Date formatting for Spring MVC
  if (!Date.prototype.toJavaISOString) {
    Date.prototype.toJavaISOString =
        function() {
          return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours())
              + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.'
              + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
        };
  }

  if (!Date.prototype.toJavaISODateString) {
    Date.prototype.toJavaISODateString = function() {
      return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate());
    };
  }

  if (!Date.prototype.toJavaLocalDateString) {
    Date.prototype.toJavaLocalDateString = function() {
      return this.getFullYear() + '-' + pad(this.getMonth() + 1) + '-' + pad(this.getDate());
    };
  }

  if (!Date.prototype.toJavaLocalTimeString) {
    Date.prototype.toJavaLocalTimeString =
        function() {
          return pad(this.getHours()) + ':' + pad(this.getMinutes()) + ':' + pad(this.getSeconds()) + '.'
              + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
        };
  }

  function toDate(data, timeOnly) {
    if (!data) {
      return;
    }
    if (data.isLocalTime && data.asDate && isDate(data.asDate)) {
      data = data.asDate;
    }
    if (moment.isMoment(data)) {
      data = data.toDate();
    }
    if (isString(data)) {
      if (timeOnly) {
        data = moment(data, "HH:mm:ss.SSS").toDate();
      } else {
        data = moment(data).toDate();
      }
    }
    if (!isDate(data)) {
      return undefined;
    }
    return data;
  }

  function toLocalTime(data) {
    if (!data) {
      return;
    }
    if (isDate(data) || moment.isMoment(data) || isString(data)) {
      data = new LocalTime(data);
    }
    if (!data.isLocalTime) {
      return undefined;
    }
    return data;
  }

  function toMoment(data, timeOnly) {
    if (!data) {
      return;
    }
    if (data.isLocalTime && data.asDate && isDate(data.asDate)) {
      data = data.asDate;
    }
    if (isString(data) || isDate(data)) {
      if (timeOnly) {
        data = moment(data, "HH:mm:ss.SSS");
      } else {
        data = moment(data);
      }
    }
    if (!moment.isMoment(data)) {
      return undefined;
    }
    return data;
  }

  function toMilliseconds(data) {
    if (!data) {
      return;
    }
    if (data.isLocalTime && data.asDate && isDate(data.asDate)) {
      data = data.asDate;
    }
    if (isDate(data)) {
      return data.getTime();
    }
    if (isString(data)) {
      data = moment(data);
    }
    if (moment.isMoment(data)) {
      data = data.valueOf();
    }
    if (!isNumber(data)) {
      return undefined;
    }
    return data;
  }

  /** LocalTime class * */
  function LocalTime(data) {
    this.set.apply(this, arguments);
  }
  LocalTime.valueOf = function(input) {
    return input ? new LocalTime(input) : input;
  };
  LocalTime.prototype = {
    asDate : null,
    set : function(data) {
      if (!isNumber(data)) {
        this.asDate = toDate(data, true);
      }
      if (this.asDate) {
        this.asDate = new Date(this.asDate.getTime());
      } else {
        this.asDate = new Date();
        this.asDate.setHours(0);
        this.asDate.setMinutes(0);
        this.asDate.setSeconds(0);
        this.asDate.setMilliseconds(0);
      }

      if (isNumber(data)) {
        var unit = Array.prototype.shift.apply(arguments);
        this.asDate.setHours(unit || 0);
        unit = Array.prototype.shift.apply(arguments);
        this.asDate.setMinutes(unit || 0);
        unit = Array.prototype.shift.apply(arguments);
        this.asDate.setSeconds(unit || 0);
        unit = Array.prototype.shift.apply(arguments);
        this.asDate.setMilliseconds(unit || 0);
      }
    },
    onDate : function(date) {
      date = toDate(date) || new Date();
      var onDate = new LocalTime(date);
      onDate.hours = this.hours;
      onDate.minutes = this.minutes;
      onDate.seconds = this.seconds;
      onDate.milliseconds = this.milliseconds;
      return onDate;
    },
    toString : function() {
      return this.asDate ? this.asTimeString : 'uninitialised LocalTime';
    }
  };
  Object.defineProperty(LocalTime.prototype, "isLocalTime", {
    enumerable : false,
    writable : false,
    value : true
  });
  Object.defineProperty(LocalTime.prototype, "asTimeString", {
    get : function() {
      return this.asDate.toJavaLocalTimeString();
    }
  });
  Object.defineProperty(LocalTime.prototype, "asMilliseconds", {
    get : function() {
      return this.asDate.getTime();
    }
  });
  Object.defineProperty(LocalTime.prototype, "asMoment", {
    get : function() {
      return moment(this.asDate);
    }
  });
  Object.defineProperty(LocalTime.prototype, "hours", {
    get : function() {
      return this.asDate.getHours();
    },
    set : function(val) {
      return this.asDate.setHours(val);
    }
  });
  Object.defineProperty(LocalTime.prototype, "minutes", {
    get : function() {
      return this.asDate.getMinutes();
    },
    set : function(val) {
      return this.asDate.setMinutes(val);
    }
  });
  Object.defineProperty(LocalTime.prototype, "seconds", {
    get : function() {
      return this.asDate.getSeconds();
    },
    set : function(val) {
      return this.asDate.setSeconds(val);
    }
  });
  Object.defineProperty(LocalTime.prototype, "milliseconds", {
    get : function() {
      return this.asDate.getMilliseconds();
    },
    set : function(val) {
      return this.asDate.setMilliseconds(val);
    }
  });

  // return a LocalTime date-normalised with respect to the start. The
  // LocalTime will have a date portion on the same day as the start, or one day
  // later if required to make the end later than the start, If possible, the
  // original LocalTime wil be manipulated and returned
  function normaliseLocalTimeEnd(start, end) {
    var startMoment = toMoment(start);
    var originalEndMoment = toMoment(end);
    var endMoment = toMoment(end);

    var latestEnd = moment(startMoment).add(1, 'days');
    if (endMoment.isBefore(startMoment) || endMoment.isAfter(latestEnd)) {
      endMoment.set({
        year : start.year(),
        month : start.month(),
        date : start.date()
      });
    }
    if (endMoment.isBefore(startMoment)) {
      endMoment.add(1, 'days');
    }
    if (endMoment.isSame(originalEndMoment) || end.isLocalTime) {
      return end;
    }
    if (end.isLocalTime) {
      end.asDate.setTime(endMoment.valueOf());
    }
    return new LocalTime(endMoment);
  }

  function Period() {
  }
  var periodContains = function(momentOrPeriod, period) {
    if (momentOrPeriod.start) {
      return periodContains(momentOrPeriod.start) && periodContains(momentOrPeriod.end);
    }

    var contained = qn.toMoment(momentOrPeriod);
    var start = qn.toMoment(period.start);
    var end = qn.toMoment(period.end);
    return contains.isBetween(start, end);
  }
  var periodOverlaps =
      function(period, another) {
        return periodContains(another.start, period) || periodContains(another.end, period) || periodContains(period.start, another)
            || periodContains(period.end, another);
      };

  var DateTimeRange_prototype = {
    start : null,
    end : null,
    contains : function contains(momentOrPeriod) {
      return periodContains(momentOrPeriod, this);
    },
    overlaps : function overlaps(another) {
      return periodOverlaps(this, another);
    },
    set : function(start, end) {
      if (start && start.start) {
        end = start.end || end;
        start = start.start;
      }
      this.end = end;
      this.start = start;
      this.normaliseLocalTime();
    },
    normaliseLocalTime : function() {
      if (this.start && this.end && this.end.isLocalTime) {
        this.end = normaliseLocalTimeEnd(this.start, this.end);
      }
    },
    toString : function() {
      return this.start && this.end ? (this.start + " - " + this.end) : 'uninitialised DateTimeRange';
    }
  };
  function mixin_DateTimeRange(prototypeObject) {
    mixin(prototypeObject, DateTimeRange_prototype);
    mixinProperty("isDateTimeRange", prototypeObject, function() {
      return true;
    });
    mixinProperty("asDurationMilliseconds", prototypeObject, function() {
      if (this.start && this.end) {
        this.normaliseLocalTime();
        var start = toMilliseconds(this.start);
        var end = toMilliseconds(this.end);
        return end - start;
      }
    });
    mixinProperty("asDuration", prototypeObject, function() {
      var ms = this.asDurationMilliseconds;
      if (isNumber(ms)) {
        return moment.duration(ms);
      }
    });
  }

  /** DateTimeRange class * */
  function DateTimeRange(data) {
    this.set(data);
  }
  mixin_DateTimeRange(DateTimeRange.prototype);

  // Serialiser/Deserialiser for LocalDate
  function serialiseLocalDate(date) {
    if (isUndefined(date) || date == null) {
      return date;
    }
    return date.toJavaLocalDateString();
  }
  function deserialiseLocalDate(date) {
    if (isUndefined(date) || date == null) {
      return date;
    }
    return new Date(date);
  }

  // Serialiser/Deserialiser for LocalTime
  function serialiseLocalTime(time) {
    return time ? time.asTimeString : time;
  }
  function deserialiseLocalTime(timeString) {
    return LocalTime.valueOf(timeString);
  }

  // Serialiser/Deserialiser for Instant
  function serialiseInstant(date) {
    if (isUndefined(date) || date == null) {
      return date;
    }
    return date.toJavaISOString();
  }
  function deserialiseInstant(date) {
    if (isUndefined(date) || date == null) {
      return date;
    }
    return moment(date).toDate();
  }

  // Serialiser/Deserialiser for JSON
  function serialiseJson(json) {
    return json ? JSON.stringify(json) : undefined
  }
  function deserialiseJson(text) {
    return text ? JSON.parse(text) : undefined
  }

  function mixin(dst) {
    for (var i = 1, ii = arguments.length; i < ii; i++) {
      var obj = arguments[i];
      if (obj) {
        var keys = Object.getOwnPropertyNames(obj);
        for (var j = 0, jj = keys.length; j < jj; j++) {
          var key = keys[j];
          if (isNullOrUndefined(dst[key])) {
            dst[key] = obj[key];
          }
        }
      }
    }
    return dst;
  }

  function mixinProperty(name, prototypeObject, getter, setter) {
    if (prototypeObject.hasOwnProperty(name)) {
      return;
    }
    if (getter && setter) {
      Object.defineProperty(prototypeObject, name, {
        get : getter,
        set : setter
      });
    } else {
      if (getter) {
        Object.defineProperty(prototypeObject, name, {
          get : getter
        });
      }
      if (setter) {
        Object.defineProperty(prototypeObject, name, {
          set : setter
        });
      }
    }
  }

  // parser helpers
  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;

  function isUrl(value) {
    return URL_REGEXP.test(value);
  }

  function isTextNumber(value) {
    return FLOAT_REGEXP.test(value);
  }

  function isEmail(value) {
    return EMAIL_REGEXP.test(value);
  }

  function isPromise(value) {
    if (isEmpty(value)) {
      return false;
    }
    return isFunction(value.then);
  }

  // UUID generation
  var uid = [ '0', '0', '0' ];
  /**
   * A consistent way of creating unique IDs - copied from angular
   *
   * @returns an unique alpha-numeric string
   */
  var nextUid = function nextUid() {
    var index = uid.length;
    var digit;

    while (index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57 /* '9' */) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90 /* 'Z' */) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  };

  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  function padToSize(num, size) {
    var s = num + "";
    while (s.length < size)
      s = "0" + s;
    return s;
  }

  // array helpers
  function removeElement(arr, element) {
    var idx = arr.indexOf(element);
    if (idx >= 0) {
      return arr.splice(idx, 1)[0];
    }
  }
  ;

  function removeElementOrIndex(arr, element) {
    if (isNumber(element)) {
      return arr.splice(element, 1)[0];
    }
    return removeElement(arr, element);
  }
  ;

  function addIfNotContained(array, value) {
    if (isEmpty(value)) {
      return;
    }
    if (indexOf(array, value) >= 0) {
      return;
    }
    array.push(value);
    return array;
  }

  // Internal implementation of a recursive 'flatten' function.
  var flattenInto = function flattenInto(input, shallow, output) {
    each(input, function flattenValue(value) {
      if (isArrayOrArguments(value)) {
        if (shallow) {
          push.apply(output, value);
        } else {
          flattenInto(value, shallow, output);
        }
      } else {
        output.push(value);
      }
    });
    return output;
  };

  var flatten = function flatten(input, shallow) {
    return flattenInto(input, shallow, []);
  };

  var normaliseOptions = function normaliseOptions(arg, property) {
    var opts = arg;
    if (isString(opts) && !isEmpty(property)) {
      opts = {};
      opts[property] = arg;
    }
    return opts || {};
  };

  function containingPeriod(periods) {
    if (!periods || periods.length == 0) {
      return;
    }
    var containingPeriod = {
      start : undefined,
      end : undefined
    };

    for (var p = 0; p < periods.length; p++) {
      var period = periods[p];
      if (period && !period.start) {
        period = null;
      }
      if (period) {
        if (containingPeriod.start) {
          if (toMoment(containingPeriod.start).isAfter(toMoment(period.start))) {
            containingPeriod.start = period.start;
          }
        } else {
          containingPeriod.start = period.start;
        }
        if (containingPeriod.end) {
          if (toMoment(containingPeriod.end).isBefore(toMoment(period.end))) {
            containingPeriod.end = period.end;
          }
        } else {
          containingPeriod.end = period.end;
        }
      }
    }

    return containingPeriod;
  }

  function longestHours(periods) {
    if (!periods || periods.length == 0) {
      return;
    }
    var containingPeriod = {
      start : undefined,
      end : undefined
    };

    for (var p = 0; p < periods.length; p++) {
      var period = periods[p];
      if (period && !period.start) {
        period = null;
      }
      if (period) {
        var periodStartLocal = toLocalTime(period.start);
        if (containingPeriod.start) {
          var containingPeriodStartLocal = toLocalTime(containingPeriod.start).onDate(periodStartLocal.asDate);
          if (toMoment(containingPeriodStartLocal).isAfter(toMoment(periodStartLocal))) {
            containingPeriod.start = periodStartLocal;
          }
        } else {
          containingPeriod.start = periodStartLocal;
        }
        var periodEndLocal = toLocalTime(period.end);
        if (containingPeriod.end) {
          var containingPeriodEndLocal = toLocalTime(containingPeriod.end).onDate(periodEndLocal.asDate);
          if (toMoment(containingPeriodEndLocal).isBefore(toMoment(periodEndLocal))) {
            containingPeriod.end = periodEndLocal;
          }
        } else {
          containingPeriod.end = periodEndLocal;
        }
      }
    }

    return containingPeriod;
  }

  function isWindow(obj) {
    return obj && obj.window === obj;
  }

  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }

  function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
  }

  function caller(self, func) {
    return function() {
      return func.apply(self, arguments);
    }
  }

  function equals(o1, o2, filter) {
    filter = filter || function() {
      return true;
    };
    if (typeof filter === 'string') {
      var test = filter;
      filter = function(val) {
        return val == test;
      };
    }

    if (o1 === o2)
      return true;
    if (o1 === null || o2 === null)
      return false;
    if (o1 !== o1 && o2 !== o2)
      return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2))
            return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!equals(o1[key], o2[key], filter))
                return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          if (!isDate(o2))
            return false;
          return equals(o1.getTime(), o2.getTime());
        } else if (isRegExp(o1)) {
          return isRegExp(o2) ? o1.toString() == o2.toString() : false;
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2) || isDate(o2) || isRegExp(o2))
            return false;
          keySet = {};
          for (key in o1) {
            if (filter(key, o1, o2)) {
              if (key.charAt(0) === '$' || isFunction(o1[key]))
                continue;
              if (!equals(o1[key], o2[key], filter))
                return false;
              keySet[key] = true;
            }
          }
          for (key in o2) {
            if (filter(key, o2, o1)) {
              if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !isFunction(o2[key]))
                return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  function setHashKey(obj, h) {
    if (h) {
      obj.$$hashKey = h;
    } else {
      delete obj.$$hashKey;
    }
  }

  function copy(source, destination, filter) {
    return copyInternal(source, destination, null, null, filter);
  }

  function copyInternal(source, destination, stackSource, stackDest, filter) {
    var $forEach = angular.forEach;
    filter = filter || function() {
      return true;
    };
    if (typeof filter === 'string') {
      var test = filter;
      filter = function(val) {
        return val == test;
      };
    }

    if (isWindow(source) || isScope(source)) {
      throw ngMinErr('cpws', "Can't copy! Making copies of Window or Scope instances is not supported.");
    }

    if (!destination) {
      destination = source;
      if (source) {
        if (isArray(source)) {
          destination = copyInternal(source, [], stackSource, stackDest, filter);
        } else if (isDate(source)) {
          destination = new Date(source.getTime());
        } else if (isRegExp(source)) {
          destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
          destination.lastIndex = source.lastIndex;
        } else if (isObject(source)) {
          var emptyObject = Object.create(Object.getPrototypeOf(source));
          destination = copyInternal(source, emptyObject, stackSource, stackDest, filter);
        }
      }
    } else {
      if (source === destination)
        throw ngMinErr('cpi', "Can't copy! Source and destination are identical.");

      stackSource = stackSource || [];
      stackDest = stackDest || [];

      if (isObject(source)) {
        var index = stackSource.indexOf(source);
        if (index !== -1)
          return stackDest[index];

        stackSource.push(source);
        stackDest.push(destination);
      }

      var result;
      if (isArray(source)) {
        destination.length = 0;
        for (var i = 0; i < source.length; i++) {
          result = copyInternal(source[i], null, stackSource, stackDest, filter);
          if (isObject(source[i])) {
            stackSource.push(source[i]);
            stackDest.push(result);
          }
          destination.push(result);
        }
      } else {
        var h = destination.$$hashKey;
        if (isArray(destination)) {
          destination.length = 0;
        } else {
          $forEach(destination, function(value, key) {
            if (filter(key, source, destination)) {
              delete destination[key];
            }
          });
        }
        for ( var key in source) {
          if (source.hasOwnProperty(key) && filter(key, source, destination)) {
            result = copyInternal(source[key], null, stackSource, stackDest, filter);
            if (isObject(source[key])) {
              stackSource.push(source[key]);
              stackDest.push(result);
            }
            destination[key] = result;
          }
        }
        setHashKey(destination, h);
      }

    }
    return destination;
  }

  function extendDeep(dst, src_args) {
    if (arguments.length < 2) {
      return;
    }
    var lastArg = arguments[arguments.length - 1];
    var filter;
    if (arguments.length > 2 && isFunction(lastArg)) {
      filter = lastArg;
      Array.prototype.pop.call(arguments);
    }

    each(arguments, function(obj) {
      if (obj !== dst) {
        each(obj, function(value, key) {
          if (filter && !filter(key, obj, dst)) {
            return;
          }

          if (isObject(dst[key])) {
            if (isObject(value)) {
              dst[key] = extendDeep(dst[key], value, filter);
            } else {
              dst[key] = value;
            }
          } else {
            if (isObject(value)) {
              dst[key] = copy(value, isArray(value) ? [] : {}, filter);
            } else {
              dst[key] = value;
            }
          }
        });
      }
    });
    return dst;
  }

  function defaultsDeep(dst, src_args) {
    each(arguments, function(obj) {
      if (obj !== dst) {
        each(obj, function(value, key) {
          if (isObject(dst[key])) {
            if (isObject(value)) {
              defaultsDeep(dst[key], value);
            } else {
              if (isUndefined(dst[key])) {
                dst[key] = value;
              }
            }
          } else {
            if (isUndefined(dst[key])) {
              if (isObject(value)) {
                dst[key] = copy(value, isArray(value) ? [] : {});
              } else {
                dst[key] = value;
              }
            }
          }
        });
      }
    });
    return dst;
  }

  function removeDefaultsDeep(dst, defaults) {
    each(defaults, function(value, key) {
      if (isObject(dst[key])) {
        if (isObject(value)) {
          removeDefaultsDeep(dst[key], value);
        }
        if (Object.keys(dst[key]).length == 0) {
          delete dst[key];
        }
      } else {
        if (dst[key] == value) {
          delete dst[key];
        }
      }
    });
    return dst;
  }

  function fileExtension(name) {
    if (isEmpty(name)) {
      return undefined;
    }
    var lastDot = name.lastIndexOf(".");
    if (lastDot < 0) {
      return undefined;
    }
    var ext = name.substring(lastDot + 1, name.length);
    return lowercase(ext);
  }

  /**
   * @constructor
   */
  function ErrorInfo(optArg, args) {
    this.isErrorInfo = true;
    var self = this;
    extend(self, normaliseOptions(optArg, "messageId"));
    if (optArg instanceof Error) {
      for ( var a in [ "columnNumber", "fileName", "lineNumber", "stack" ]) {
        this[a] = optArg[a];
      }
      this.message = optArg.name + ":" + optArg.message;
    }

    if (isDefined(optArg.url) && isDefined(optArg.status)) {
      extend(self, optArg);
      this.message = this.message || this.statusText;
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isServerDown()) {
        this.message = "Server not responding";
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isBadRequest()) {
        this.message = "Bad request";
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isAuthenticationError()) {
        this.message = "Unauthenticated";
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isForbidden()) {
        this.message = "Forbidden";
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isNotFound()) {
        this.message = "Not found";
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isHttpUserError()) {
        this.message = "Bad request : HTTP " + this.status;
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isInternalServerError()) {
        this.message = "Internal server error: HTTP " + this.status;
      }
      if (isEmpty(this.messageId) && isEmpty(this.message) && this.isHttpError()) {
        this.message = "Unknown error on request to server: HTTP " + this.status;
      }
      if (isEmpty(this.messageId)) {
        this.messageId = "http." + this.status;
      }
    }
    if (isEmpty(this.type)) {
      this.type = "error";
    }
    this.args = args;
  }
  ErrorInfo.prototype.isSecurityError = function isSecurityError() {
    return this.isAuthenticationError() || this.isForbidden();
  };
  ErrorInfo.prototype.isHttpError = function isHttpError() {
    return this.status >= 400;
  };
  ErrorInfo.prototype.isInternalServerError = function isInternalServerError() {
    return this.status >= 500;
  };
  ErrorInfo.prototype.isServerUnresponsiveError = function isServerUnresponsiveError() {
    return this.status == 0;
  };
  ErrorInfo.prototype.isHttpUserError = function isHttpUserError() {
    return this.status >= 400 && this.status < 500;
  };
  ErrorInfo.prototype.isHttpSuccess = function isHttpSuccess() {
    return this.status >= 200 && this.status < 300;
  };
  ErrorInfo.prototype.isBadRequest = function isBadRequest() {
    return this.status === 400;
  };
  ErrorInfo.prototype.isAuthenticationError = function isAuthenticationError() {
    return this.status === 401;
  };
  ErrorInfo.prototype.isForbidden = function isForbidden() {
    return this.status === 403;
  };
  ErrorInfo.prototype.isNotFound = function isNotFound() {
    return this.status === 404;
  };
  ErrorInfo.prototype.isServerDown = function isServerDown() {
    return this.status === 0;
  };

  /**
   * TrackedValue
   */

  function TrackedValue(getter, setter, multiplicityType) {
    multiplicityType = multiplicityType || Model.MultiplicityType.SINGULAR;
    var isArray = multiplicityType == Model.MultiplicityType.ARRAY;
    var isMap = multiplicityType == Model.MultiplicityType.MAP;
    var _master;
    this.get = getter;
    this.originalValue = function originalValue() {
      return _master;
    };
    this.commit = function commit() {
      _master = getter();
      if (isArray && _master) {
        _master = _master.slice();
      }
      if (isMap && _master) {
        _master = extend({}, _master);
      }
    };
    this.reset = function reset() {
      setter(_master);
      this.commit();
    };
    this.changed = function changed() {
      var value = getter();
      if (value === _master) {
        return false;
      }
      if (!value && !_master) {
        return false;
      }
      if (!value || !_master) {
        return true;
      }
      if (!isArray && !isMap) {
        return true;
      }

      if (isMap) {
        if (!equals(Object.keys(value), Object.keys(_master))) {
          return true;
        }
        for ( var key in value) {
          if (value.hasOwnProperty(key)) {
            if (value[key] !== _master[key]) {
              return true;
            }
          }
        }
        return false;
      }

      // isArray
      if (value.length !== _master.length) {
        return true;
      }
      for (var i = 0; i < value.length; i++) {
        var v = value[i];
        var m = _master[i];
        if (m !== v) {
          return true;
        }
      }

      return false;
    };

    this.commit();
  }

  /**
   * Model
   */

  var Model = {
    MultiplicityType : {
      SINGULAR : "singular",
      ARRAY : "array",
      MAP : "map"
    },
    AttributeType : {
      LocalTime : {
        name : "LocalTime",
        serialiser : serialiseLocalTime,
        deserialiser : deserialiseLocalTime
      },
      LocalDate : {
        name : "LocalDate",
        serialiser : serialiseLocalDate,
        deserialiser : deserialiseLocalDate
      },
      Instant : {
        name : "Instant",
        serialiser : serialiseInstant,
        deserialiser : deserialiseInstant
      },
      Json : {
        name : "Json",
        serialiser : serialiseJson,
        deserialiser : deserialiseJson
      }
    }
  };

  /**
   * Model.Schema
   */
  Model.Schema = function Schema(typeName) {
    this.typeName = typeName;
    this.relationships = {};
    this.attributes = {};
  }
  Model.Schema.prototype = {
    idAttribute : "id",
    addAttribute : function(name, attributeType, multiplicity) {
      if (!name) {
        return;
      }
      var r = name.name ? name : {
        name : name
      };
      r.multiplicity = r.multiplicity || multiplicity || Model.MultiplicityType.SINGULAR;
      r.attributeType = r.attributeType || attributeType;

      if (!r.name) {
        throw new ErrorInfo("un-named attribute");
      }
      this.attributes[name] = new Model.Schema.AttributeDefinition(r);
      return this;
    },
    addArrayAttribute : function(name, attributeType) {
      return this.addAttribute(name.attributeType, Model.MultiplicityType.ARRAY);
    },
    addMapAttribute : function(name, attributeType) {
      return this.addAttribute(name, attributeType, Model.MultiplicityType.MAP);
    },
    addRelationship : function(name, ctor, multiplicity, composite) {
      if (!name) {
        return;
      }
      var r = name.name ? name : {
        name : name
      };
      r.typeConstructor = r.typeConstructor || ctor;
      r.multiplicity = r.multiplicity || multiplicity || Model.MultiplicityType.SINGULAR;
      r.composite = r.composite || composite || false;

      if (!r.name) {
        throw new ErrorInfo("un-named relationship");
      }
      if (!r.typeConstructor) {
        throw new ErrorInfo("un-typed relationship");
      }
      this.relationships[name] = r;
      return this;
    },
    addArrayRelationship : function(name, ctor, composite) {
      return this.addRelationship(name, ctor, Model.MultiplicityType.ARRAY, composite);
    },
    addMapRelationship : function(name, ctor, composite) {
      return this.addRelationship(name, ctor, Model.MultiplicityType.MAP, composite);
    }
  };

  Model.Schema.AttributeDefinition = function AttributeDefinition(data) {
    extend(this, data);
  }
  Model.Schema.AttributeDefinition.prototype = {
    isArray : function isArray() {
      return this.multiplicity == Model.MultiplicityType.ARRAY;
    },
    isMap : function isArray() {
      return this.multiplicity == Model.MultiplicityType.MAP;
    },
    isSingular : function isArray() {
      return this.multiplicity == Model.MultiplicityType.SINGULAR;
    },
    serialise : function serialise(data) {
      if (data && this.attributeType && (this.attributeType.serialiser || this.attributeType.keySerialiser)) {
        if (this.isArray()) {
          if (this.attributeType.serialiser) {
            var out = [];
            for (var i = 0; i < data.length; i++) {
              var v = data[i];
              out[i] = this.attributeType.serialiser(data[i]);
            }
            data = out;
          }
        } else {
          if (this.isMap()) {
            var out = {};
            for ( var k in data) {
              if (data.hasOwnProperty(k)) {
                var key = k;
                if (this.attributeType.keySerialiser) {
                  key = this.attributeType.keySerialiser(key);
                }
                var value = data[k];
                if (this.attributeType.serialiser) {
                  value = this.attributeType.serialiser(value);
                }
                out[key] = value;
              }
            }
            data = out;
          } else {
            if (this.attributeType.serialiser) {
              data = this.attributeType.serialiser(data);
            }
          }
        }
      }
      return data;
    },
    deserialise : function deserialise(data) {
      if (this.isArray()) {
        if (data) {
          if (this.attributeType && this.attributeType.deserialiser) {
            for (var i = 0; i < data.length; i++) {
              var v = data[i];
              data[i] = this.attributeType.deserialiser(data[i]);
            }
          }
        } else {
          data = [];
        }
      } else {
        if (this.isMap()) {
          if (data) {
            for ( var k in data) {
              if (data.hasOwnProperty(k)) {
                var key = k;
                if (this.attributeKeyType && this.attributeKeyType.deserialiser) {
                  key = this.attributeKeyType.deserialiser(key);
                }
                var value = data[k];
                if (this.attributeType && this.attributeType.deserialiser) {
                  value = this.attributeType.deserialiser(value);
                }
                data[key] = value;
              }
            }
          } else {
            data = {};
          }
        } else {
          if (!isNullOrUndefined(data)) {
            if (this.attributeType && this.attributeType.deserialiser) {
              data = this.attributeType.deserialiser(data);
            }
          }
          if (this.defaultDeep && this.defaultValue) {
            if (!data) {
              data = {};
            }
            defaultsDeep(data, this.defaultValue);
          }
        }
      }
      return data;
    }
  }

  /**
   * Model.Relationship
   */
  Model.Relationship = function Relationship(relationship, editModel) {
    this.relationship = relationship;
    this.value = new TrackedValue(function getter() {
      return editModel[relationship.name];
    }, function setter(value) {
      editModel[relationship.name] = value;
    }, this.relationship.multiplicity);
  };
  Model.Relationship.prototype = {
    constructRelationshipInstance : function constructRelationshipInstance(entityData, parent) {
      if (entityData && this.relationship.typeConstructor) {
        if (this.relationship.composite) {
          return new this.relationship.typeConstructor(entityData, parent);
        }
        return new this.relationship.typeConstructor(entityData);
      }
      return entityData;
    },
    constructRelationship : function constructRelationship(data, parent) {
      if (!data) {
        if (this.isArray()) {
          data = [];
        } else {
          if (this.isMap()) {
            data = {};
          }
        }
        return data;
      }
      if (this.isArray()) {
        for ( var i in data) {
          data[i] = this.constructRelationshipInstance(data[i], parent);
        }
      } else {
        if (this.isMap()) {
          for ( var k in data) {
            if (data.hasOwnProperty(k)) {

              // TODO deserialise key using same mechanism as
              // AttributeDefinition
              data[k] = this.constructRelationshipInstance(data[k], parent);
            }
          }
        } else {
          data = this.constructRelationshipInstance(data, parent);
        }
      }
      return data;
    },
    serialiseRelationshipInstance : function serialiseRelationshipInstance(entity) {
      if (entity && entity.serialise) {
        return entity.serialise();
      }
      return entity;
    },
    serialiseRelationship : function serialiseRelationship() {
      var value = this.value.get();
      if (!value) {
        return value;
      }

      var data;
      if (this.isArray()) {
        data = [];
        for ( var i in value) {
          data[i] = this.serialiseRelationshipInstance(value[i]);
        }
      } else {
        if (this.isMap()) {
          data = {};
          for ( var k in value) {
            if (value.hasOwnProperty(k)) {
              data[k] = this.serialiseRelationshipInstance(value[k]);
            }
          }
        } else {
          data = this.serialiseRelationshipInstance(value);
        }
      }
      return data;
    },
    isArray : function isArray() {
      return this.relationship.multiplicity == Model.MultiplicityType.ARRAY;
    },
    isMap : function isArray() {
      return this.relationship.multiplicity == Model.MultiplicityType.MAP;
    },
    isSingular : function isArray() {
      return this.relationship.multiplicity == Model.MultiplicityType.SINGULAR;
    },
    relatedReferenceChanged : function relatedReferenceChanged() {
      return this.value.changed();
    },
    relatedContentChanged : function relatedContentChanged() {
      var value = this.value.originalValue();
      function valueChanged(o) {
        return o ? o.changed : false;
      }
      if (this.isArray()) {
        if (value) {
          for (var v = 0; v < value.length; v++) {
            var valueElement = value[v];
            if (valueChanged(valueElement)) {
              return true;
            }
          }
        }
        return false;
      } else {
        if (this.isMap()) {
          if (value) {
            for ( var k in value) {
              if (value.hasOwnProperty(k)) {
                var valueElement = value[k];
                if (valueChanged(valueElement)) {
                  return true;
                }
              }
            }
          }
          return false;
        }
        return valueChanged(value);
      }
    },
    relationshipChanged : function relationshipChanged() {
      return this.relatedReferenceChanged() || this.relatedContentChanged();
    },
    commit : function commit() {
      var value = this.value.get();
      if (value) {
        if (this.isArray()) {
          for (var v = 0; v < value.length; v++) {
            var valueElement = value[v];
            if (valueElement) {
              valueElement.commit();
            }
          }
        } else {
          if (this.isMap()) {
            for ( var k in value) {
              if (value.hasOwnProperty(k)) {
                var valueElement = value[k];
                if (valueElement) {
                  valueElement.commit();
                }
              }
            }
          } else {
            value.commit();
          }
        }
      }
      this.value.commit();
    },
    reset : function reset() {
      var value = this.value.originalValue();
      if (value) {
        if (this.isArray()) {
          for (var v = 0; v < value.length; v++) {
            var valueElement = value[v];
            if (valueElement) {
              valueElement.reset();
            }
          }
        } else {
          if (this.isMap()) {
            for ( var k in value) {
              if (value.hasOwnProperty(k)) {
                var valueElement = value[k];
                if (valueElement) {
                  valueElement.reset();
                }
              }
            }
          } else {
            value.reset();
          }
        }
      }
      this.value.reset();
    },
    values : function values() {
      var value = this.value.get();
      var cpy = value;
      if (value) {
        if (this.isArray()) {
          cpy = [];
          for (var v = 0; v < value.length; v++) {
            var valueElement = value[v];
            if (valueElement) {
              valueElement = valueElement.values();
            }
            cpy[v] = valueElement;
          }
        } else {
          if (this.isMap()) {
            cpy = {};
            for ( var k in value) {
              if (value.hasOwnProperty(k)) {
                var valueElement = value[k];
                if (valueElement) {
                  cpy[k] = valueElement.values();
                }
              }
            }
          } else {
            cpy = value.values();
          }
        }
      }
      return cpy;
    }
  };
  Object.defineProperty(Model.Relationship.prototype, "name", {
    get : function() {
      return this.relationship.name;
    }
  });
  Model.Relationship.buildRelationshipsFor = function buildRelationshipsFor(editModel) {
    var relationships = {};
    if (editModel._schema) {
      each(editModel._schema.relationships, function(relationship, name) {
        name = relationship.name || name;
        relationships[name] = new Model.Relationship(relationship, editModel);
      });
    }
    return relationships;
  }

  /**
   * EditModel
   */

  function EditModel(data, parent, schema) {
    this._schema = schema || this._schema;
    if (this._schema) {
      this._type = this._schema.typeName;
    }

    if (parent) {
      this.parent = function editModelParent() {
        return parent;
      };
    }

    this._attributes = {};
    this._relationships = {};
    this._attributeFilter = caller(this, function(key, src, dst) {
      if (src !== this && dst !== this) {
        return true;
      }

      if (this._relationships && !!this._relationships[key]) {
        return false;
      }

      return this._propertyFilter(key, src, dst);
    });
    this._propertyFilter = caller(this, function(key, src, dst) {
      if (src !== this && dst !== this) {
        return true;
      }
      var keys = Object.getOwnPropertyNames(EditModel.prototype);
      return keys.indexOf(key) < 0;
    });

    this.refresh(data || {});
  }

  EditModel._internalKeys =
      [ '_schema', '_attributes', '_relationships', '_transient', '_listeners', '_attributeFilter', '_propertyFilter',
          '_relationshipFilter' ];
  EditModel.prototype = {
    parent : function() {
      // no-op function to ensure it can be called without error
    },
    addListener : function(evt, listener) {
      this._listeners = this._listeners || {};
      this._listeners[evt] = this._listeners[evt] || [];
      this._listeners[evt].push(listener);
    },
    removeListener : function(evt, listener) {
      if (!this._listeners || !this._listeners[evt]) {
        return;
      }
      removeElement(this._listeners[evt], listener);
    },
    fireEvent : function() {
      var evtName = arguments[0];
      if (!this._listeners || !this._listeners[evtName]) {
        return;
      }
      var args = [ this ].concat(Array.prototype.slice.call(arguments));
      each(this._listeners[evtName], function(listener) {
        listener.apply(listener, args);
      });
    },
    commit : function commit(silent) {
      copy(this, this._attributes, this._attributeFilter);
      // commit all relationships
      each(this._relationships, function(relationship, name) {
        relationship.commit();
      });
      if (!silent) {
        this.fireEvent('commit');
      }
      return this;
    },
    reset : function reset(silent) {
      copy(this._attributes, this, this._attributeFilter);
      // reset all relationships
      each(this._relationships, function(relationship, name) {
        relationship.reset();
      });
      this.fireEvent('reset');
      return this;
    },
    refresh : function refresh(newData) {
      var self = this;
      var isAlreadyDeserialised = !!newData.isEditModel;
      // reset relationships
      this._relationships = Model.Relationship.buildRelationshipsFor(this);
      // copy all new data, excluding relationships
      copy(newData, this, this._attributeFilter);
      // deserialise attributes
      if (this._schema) {
        each(this._schema.attributes, function(attribute, name) {
          var attValue = newData[attribute.name];
          if (!isAlreadyDeserialised) {
            attValue = attribute.deserialise(attValue);
          }
          self[attribute.name] = attValue;
        });
        var idAttribute = this._schema.idAttribute || "id";
        if (this._schema.generateTransientId && isNullOrUndefined(this[idAttribute])) {
          this[idAttribute] = nextUid();
        }
      }
      // populate relationships
      each(this._relationships, function(relationship, name) {
        var relValue = newData[relationship.name];
        if (!isAlreadyDeserialised) {
          relValue = relationship.constructRelationship(relValue, self);
        }
        self[relationship.name] = relValue;
      });
      this.commit(true);
      this.fireEvent('refresh');
      return this;
    },
    values : function values() {
      var cpy = {};
      copy(this, cpy, this._attributeFilter);
      each(this._relationships, function(relationship, name) {
        cpy[relationship.name] = relationship.values();
      });
      return cpy;
    },
    getType : function getType() {
      return this._type || (this._schema ? this._schema.typeName : undefined);
    },
    getId : function getId() {
      return (this._schema && this._schema.idAttribute) ? this[this._schema.idAttribute] : this.id;
    },
    equalsId : function equalsId(data) {
      var eq = equals(this.getId(), (data.getId ? data.getId() : this.getId.call(data)));
      return eq;
    },
    serialise : function() {
      var self = this;
      var s = {};
      // copy all non-schema attributes/relationships
      copy(this, s, this._attributeFilter);

      // serialise attributes from schema
      if (this._schema) {
        each(this._schema.attributes, function(attribute, name) {
          s[attribute.name] = attribute.serialise(self[attribute.name]);
        });
      }

      // serialise relationships from schema
      each(this._relationships, function(relationship, name) {
        var relValue = relationship.serialiseRelationship();
        s[relationship.name] = relValue;
      });

      return s;
    }
  };

  // prevent many copy operations from discovering these internal properties
  each(EditModel._internalKeys, function(key) {
    Object.defineProperty(EditModel.prototype, key, {
      enumerable : false,
      writable : true
    });
  });

  Object.defineProperty(EditModel.prototype, "isEditModel", {
    enumerable : false,
    writable : false,
    value : true
  });
  Object.defineProperty(EditModel.prototype, "changed", {
    get : function() {
      var eq = equals(this, this._attributes, this._attributeFilter);
      if (eq) {
        var relationshipNames = Object.keys(this._relationships);
        for (var r = 0; eq && r < relationshipNames.length; r++) {
          var relationshipName = relationshipNames[r];
          var relationship = this._relationships[relationshipName];
          eq = !relationship.relationshipChanged();
        }
      }
      return !eq;
    }
  });
  Object.defineProperty(EditModel.prototype, "existing", {
    get : function() {
      if (isUndefined(this._attributes)) {
        return false;
      }
      var id = this.getId.call(this._attributes);
      return isDefined(id) && !isEmpty(id);
    }
  });
  Object.defineProperty(EditModel.prototype, "transientData", {
    get : function() {
      this._transient = this._transient || {};
      return this._transient;
    }
  });

  // build the qn namespaced library
  var lib = {
    DateTimeRange : DateTimeRange,
    EditModel : EditModel,
    ErrorInfo : ErrorInfo,
    LocalTime : LocalTime,
    Model : Model,
    TrackedValue : TrackedValue,
    addIfNotContained : addIfNotContained,
    caller : caller,
    containingPeriod : containingPeriod,
    copy : copy,
    defaultsDeep : defaultsDeep,
    each : each,
    equals : equals,
    deserialiseInstant : deserialiseInstant,
    deserialiseJson : deserialiseJson,
    deserialiseLocalDate : deserialiseLocalDate,
    extend : extend,
    extendDeep : extendDeep,
    fileExtension : fileExtension,
    flatten : flatten,
    flattenInto : flattenInto,
    forEach : function forEach() {
      throw new Error("Use qn.each");
    },
    getPropertyByPath : getPropertyByPath,
    indexOf : indexOf,
    isArguments : isArguments,
    isArray : isArray,
    isArrayOrArguments : isArrayOrArguments,
    isBoolean : isBoolean,
    isDate : isDate,
    isDefined : isDefined,
    isEmail : isEmail,
    isEmpty : isEmpty,
    isError : isError,
    isFunction : isFunction,
    isNullOrUndefined : isNullOrUndefined,
    isNumber : isNumber,
    isObject : isObject,
    isPromise : isPromise,
    isString : isString,
    isTextNumber : isTextNumber,
    isUndefined : isUndefined,
    isUrl : isUrl,
    longestHours : longestHours,
    lowercase : lowercase,
    mixin : mixin,
    mixinProperty : mixinProperty,
    mixin_DateTimeRange : mixin_DateTimeRange,
    nextUid : nextUid,
    noop : noop,
    normaliseOptions : normaliseOptions,
    parseBoolean : parseBoolean,
    parseQuerystring : parseQuerystring,
    periodContains : periodContains,
    periodOverlaps : periodOverlaps,
    removeDefaultsDeep : removeDefaultsDeep,
    removeElement : removeElement,
    removeElementOrIndex : removeElementOrIndex,
    serialiseInstant : serialiseInstant,
    serialiseJson : serialiseJson,
    serialiseLocalDate : serialiseLocalDate,
    toArray : toArray,
    toDate : toDate,
    toLocalTime : toLocalTime,
    toMilliseconds : toMilliseconds,
    toMoment : toMoment,
    wrap : wrap
  };

  window.qn = extendDeep(window.qn || {}, lib);

})(window, window.moment, window.angular, window._);
