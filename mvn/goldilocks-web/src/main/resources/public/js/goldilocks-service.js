"use strict";

(function(window, angular, qn, moment) {

  /**
   * "qn.domain" namespace for Domain Classes and Domain Enums. (Classes
   * registered according to this convention will be automatically registered
   * with entitySerialisation/entityDeserialisation/entityResolver services)
   */
  qn.domain = qn.domain || {};
  qn.domain.enums = qn.domain.enums || {};

  qn.domain.enums.CancelReason = [ 'NO_SHOW', 'NOTIFIED' ];
  qn.domain.enums.ExpertiseLevel = [ 'JUNIOR', 'SENIOR', 'MANAGER' ];
  qn.domain.enums.Gender = [ 'MALE', 'FEMALE' ];
  qn.domain.enums.PhoneNumberType = [ 'HOME', 'MOBILE', 'WORK' ];
  qn.domain.enums.DayOfWeek = [ 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY' ];

  /** Role */
  function Role(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.Role = Role;
  Role.prototype = Object.create(qn.EditModel.prototype);
  Role.prototype.constructor = Role;

  Role.prototype._schema = new qn.Model.Schema("Role");

  /** User */
  function User(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.User = User;
  User.prototype = Object.create(qn.EditModel.prototype);
  User.prototype.constructor = User;

  User.prototype._schema = new qn.Model.Schema("User");
  User.prototype._schema.addArrayRelationship("roles", Role);

  User.prototype.addRole = function(role) {
    if (this.hasRole(role)) {
      return;
    }
    this.roles.push(role);
  }
  User.prototype.removeRole = function(idx) {
    if (!qn.isNumber(idx)) {
      idx = this.indexOfRole(idx);
    }
    this.roles.splice(idx, 1);
  }
  User.prototype.hasRole = function(rolename) {
    if (!qn.isUndefined(rolename.id)) {
      rolename = rolename.id;
    }
    for (var i = 0; i < this.roles.length; i++) {
      var r = this.roles[i];
      if (r.id == rolename || r == rolename) {
        return true;
      }
    }
    return this.indexOfRole(rolename) >= 0;
  }
  User.prototype.indexOfRole = function(rolename) {
    if (!qn.isUndefined(rolename.id)) {
      rolename = rolename.id;
    }
    for (var i = 0; i < this.roles.length; i++) {
      var r = this.roles[i];
      if (r.id == rolename || r == rolename) {
        return i;
      }
    }
    return -1;
  }

  qn.Model.AttributeType.JsonWithApplicationConfigDefaults = {
    name : "JsonWithApplicationConfigDefaults",
    serialiser : function(data) {
      qn.removeDefaultsDeep(data, qn.applicationConfigDefaults);
      return qn.serialiseJson(data);
    },
    deserialiser : function(data) {
      data = qn.deserialiseJson(data)
      qn.defaultsDeep(data, qn.applicationConfigDefaults);
      return data;
    }
  }

  /** ApplicationConfig */
  function ApplicationConfig(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.ApplicationConfig = ApplicationConfig;
  ApplicationConfig.prototype = Object.create(qn.EditModel.prototype);
  ApplicationConfig.prototype.constructor = ApplicationConfig;

  ApplicationConfig.prototype._schema = new qn.Model.Schema("ApplicationConfig");
  ApplicationConfig.prototype._schema.addRelationship("user", User);
  ApplicationConfig.prototype._schema.addAttribute({
    name : "propertyText",
    attributeType : qn.Model.AttributeType.JsonWithApplicationConfigDefaults
  });

  /** Period type functions */
  function overlaps(another) {

  }

  function Period() {
  }
  qn.domain.Period = Period;

  Period.adjacentPeriods =
      function(tested, periods) {
        var result = [];
        qn.each(periods, function(period) {
          if (period == tested) {
            return;
          }
          if (qn.toMilliseconds(period.end) == qn.toMilliseconds(tested.start)
              || qn.toMilliseconds(period.start) == qn.toMilliseconds(tested.end)) {
            result.push(period);
          }
        });
        return result;
      };

  Period.mergeAdjacentPeriods = function(tested, periods) {
    var result = Period.adjacentPeriods(tested, periods);
    if (result.length > 0) {
      var containingPeriod = qn.containingPeriod([ tested ].concat(result));
      tested.start = containingPeriod.start;
      tested.end = containingPeriod.end;
      qn.each(result, function(p) {
        qn.removeElement(periods, p);
      });
    }
    return result;
  };

  /** InstantPeriod */
  function InstantPeriod(data, parent) {
    qn.EditModel.call(this, data, parent);
    var self = this;
  }
  qn.domain.InstantPeriod = InstantPeriod;
  InstantPeriod.prototype = Object.create(qn.EditModel.prototype);
  qn.mixin_DateTimeRange(InstantPeriod.prototype);
  InstantPeriod.prototype.constructor = InstantPeriod;

  InstantPeriod.prototype._schema = new qn.Model.Schema("InstantPeriod");
  InstantPeriod.prototype._schema.generateTransientId = true;
  InstantPeriod.prototype._schema.addAttribute("start", qn.Model.AttributeType.Instant);
  InstantPeriod.prototype._schema.addAttribute("end", qn.Model.AttributeType.Instant);

  Object.defineProperty(InstantPeriod.prototype, "usesLocalTime", {
    enumerable : false,
    writable : false,
    value : false
  });

  /** LocalTimePeriod */
  function LocalTimePeriod(data, parent) {
    qn.EditModel.call(this, data, parent);
    var self = this;
    this.addListener('refresh', function() {
      self.normaliseLocalTime();
    });
  }
  qn.domain.LocalTimePeriod = LocalTimePeriod;
  LocalTimePeriod.prototype = Object.create(qn.EditModel.prototype);
  qn.mixin_DateTimeRange(LocalTimePeriod.prototype);
  LocalTimePeriod.prototype.constructor = LocalTimePeriod;

  LocalTimePeriod.prototype._schema = new qn.Model.Schema("LocalTimePeriod");
  LocalTimePeriod.prototype._schema.generateTransientId = true;
  LocalTimePeriod.prototype._schema.addAttribute("start", qn.Model.AttributeType.LocalTime);
  LocalTimePeriod.prototype._schema.addAttribute("end", qn.Model.AttributeType.LocalTime);

  Object.defineProperty(LocalTimePeriod.prototype, "usesLocalTime", {
    enumerable : false,
    writable : false,
    value : true
  });

  LocalTimePeriod.prototype.setTimes = function(start, end) {
    if (start && start.start) {
      end = start.end || end;
      start = start.start;
    }
    start = start ? qn.toLocalTime(start) : undefined;
    end = end ? qn.toLocalTime(end) : undefined;
    this.set(start, end);
  }

  LocalTimePeriod.inverseDayPeriods = function(owner, periods) {
    var startOfDay = new qn.LocalTime(0);
    var endOfDay = new qn.LocalTime(startOfDay.asMoment.add(1, 'day'));
    var allDayPeriod = new InstantPeriod({
      start : startOfDay,
      end : endOfDay
    }, owner);
    return LocalTimePeriod.gaps(owner, periods, allDayPeriod);
  };

  LocalTimePeriod.inverseDayPeriodsBetween = function(owner, periods, start, end) {
    if (start && start.start) {
      end = start.end || end;
      start = start.start;
    }
    var allDayPeriod = new InstantPeriod({
      start : start,
      end : end
    }, owner);
    var periods = timePeriodsBetween(start, end, periods, owner);
    return InstantPeriod.gaps(owner, periods, allDayPeriod);
  };

  LocalTimePeriod.gaps = function(owner, periods, bounds) {
    bounds = bounds || qn.containingPeriod(periods);

    var result = [];
    if (qn.toMilliseconds(bounds.end) - qn.toMilliseconds(bounds.start) < 0) {
      return result;
    }

    var initialPeriod = new LocalTimePeriod({
      start : bounds.start,
      end : bounds.end
    }, owner);
    result[0] = initialPeriod;

    periods = _.sortBy(periods, 'asDate');
    qn.each(periods, function(period) {
      var currentPeriod = result[result.length - 1];
      var gapDuration = qn.toMilliseconds(currentPeriod.end) - qn.toMilliseconds(period.start);
      var isGap = gapDuration > 0;
      if (isGap) {
        currentPeriod.end = period.start;
        currentPeriod = new LocalTimePeriod({
          start : period.end,
          end : bounds.end
        }, owner);
        result.push(currentPeriod);
      }
    });

    return result;
  };

  InstantPeriod.gaps = function(owner, periods, bounds) {
    bounds = bounds || qn.containingPeriod(periods);

    var result = [];
    if (qn.toMilliseconds(bounds.end) - qn.toMilliseconds(bounds.start) < 0) {
      return result;
    }

    var initialPeriod = new InstantPeriod({
      start : bounds.start,
      end : bounds.end
    }, owner);
    result[0] = initialPeriod;

    periods = _.sortBy(periods, qn.toMilliseconds);
    qn.each(periods, function(period) {
      var currentPeriod = result[result.length - 1];
      var gapDuration = qn.toMilliseconds(currentPeriod.end) - qn.toMilliseconds(period.start);
      var isGap = gapDuration > 0;
      if (isGap) {
        currentPeriod.end = period.start;
        currentPeriod = new InstantPeriod({
          start : period.end,
          end : bounds.end
        }, owner);
        result.push(currentPeriod);
      }
    });

    return result;
  };

  function timePeriodsBetween(start, end, periods, owner) {
    if (start.end) {
      end = start.end;
      start = start.start;
    }
    start = qn.toMoment(start);
    end = qn.toMoment(end);
    var resultPeriod = {
      start : start,
      end : end
    };

    var result = [];
    var self = this || owner;
    qn.each(periods, function(period) {

      if (period.usesLocalTime) {
        // expand to instant period for each day in start-end
        var day = moment(start).startOf('day');
        while (day.isBefore(end)) {
          if (self.occursOnDay(day, period)) {
            var newPeriodStart = period.start.onDate(day);
            var newPeriodEnd = period.end.onDate(day);
            var instantPeriod = new InstantPeriod({
              start : qn.toDate(newPeriodStart),
              end : qn.toDate(newPeriodEnd)
            }, period.parent());
            result.push(instantPeriod);
          }
          day = day.add(1, 'day');
        }
      } else {
        // test period overlaps start-end
        if (period.overlaps(resultPeriod)) {
          result.push(period);
        }
      }

    })
    return qn.flatten(result, false);
  }

  /** TimePeriodHolder mixin */
  var TimePeriodHolder_prototype = {
    occursOnDay : function(day, period) {
      return true;
    },
    timePeriodsBetween : function(start, end) {
      return timePeriodsBetween(start, end, this.timePeriods, this);
    }
  };

  function mixin_TimePeriodHolder(prototypeObject, periodsProperty, useLocalTime) {
    periodsProperty = periodsProperty || "periods";
    if (!qn.isFunction(periodsProperty)) {
      var propName = periodsProperty;
      periodsProperty = function() {
        return this[propName];
      };
    }
    prototypeObject._periods = periodsProperty;
    qn.mixin(prototypeObject, TimePeriodHolder_prototype);
    qn.mixinProperty("timePeriods", prototypeObject, function() {
      var periods = this._periods();
      var result = [];
      qn.each(periods, function(period) {
        if (period.isTimePeriodHolder) {
          result.push(period.timePeriods);
        } else {
          result.push(period);
        }
      })
      return qn.flatten(result, false);
    });
    qn.mixinProperty("isTimePeriodHolder", prototypeObject, function() {
      return true;
    });
    qn.mixinProperty("asDurationMilliseconds", prototypeObject, function() {
      var duration = 0;
      qn.each(this.timePeriods, function(period) {
        var d = period.asDurationMilliseconds;
        duration = duration + d;
      });
      return duration;
    });
    qn.mixinProperty("asDuration", prototypeObject, function() {
      var ms = this.asDurationMilliseconds;
      if (qn.isNumber(ms)) {
        return moment.duration(ms);
      }
      return moment.duration(0);
    });
  }

  function mixin_inverseDayPeriods(prototypeObject) {
    qn.mixinProperty("inverseDayPeriods", prototypeObject, function() {
      return LocalTimePeriod.inverseDayPeriods(this, this.timePeriods);
    });
    prototypeObject.inverseDayPeriodsBetween = function(start, end) {
      return LocalTimePeriod.inverseDayPeriodsBetween(this, this.timePeriods, start, end);
    };
  }

  /** OpeningHoursRegularDayTimePeriods */
  function OpeningHoursRegularDayTimePeriods(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.OpeningHoursRegularDayTimePeriods = OpeningHoursRegularDayTimePeriods;
  OpeningHoursRegularDayTimePeriods.prototype = Object.create(qn.EditModel.prototype);
  mixin_TimePeriodHolder(OpeningHoursRegularDayTimePeriods.prototype, "periods", true);
  mixin_inverseDayPeriods(OpeningHoursRegularDayTimePeriods.prototype);
  OpeningHoursRegularDayTimePeriods.prototype.constructor = OpeningHoursRegularDayTimePeriods;

  OpeningHoursRegularDayTimePeriods.prototype._schema = new qn.Model.Schema("OpeningHoursRegularDayTimePeriods");
  OpeningHoursRegularDayTimePeriods.prototype._schema.addArrayRelationship("periods", LocalTimePeriod, true);

  /** OpeningHoursWeek */
  function OpeningHoursWeek(data) {
    qn.EditModel.call(this, data);
    qn.each(this.week, function(regularPeriods, dayOfWeek) {
      qn.each(regularPeriods.periods, function(period, idx) {
        period.dayOfWeek = dayOfWeek;
        period.dayOfWeekIndex = qn.domain.enums.DayOfWeek.indexOf(dayOfWeek);
      });
    });
  }
  qn.domain.OpeningHoursWeek = OpeningHoursWeek;
  OpeningHoursWeek.prototype = Object.create(qn.EditModel.prototype);
  mixin_TimePeriodHolder(OpeningHoursWeek.prototype, "week", true);
  mixin_inverseDayPeriods(OpeningHoursWeek.prototype);
  OpeningHoursWeek.prototype.constructor = OpeningHoursWeek;

  OpeningHoursWeek.prototype._schema = new qn.Model.Schema("OpeningHoursWeek");
  OpeningHoursWeek.prototype._schema.generateTransientId = true;
  OpeningHoursWeek.prototype._schema.addMapRelationship("week", OpeningHoursRegularDayTimePeriods);

  OpeningHoursWeek.prototype.occursOnDay = function(day, period) {
    return period.dayOfWeekIndex == day.day();
  };

  /** Staff */
  function Staff(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.Staff = Staff;
  Staff.prototype = Object.create(qn.EditModel.prototype);
  Staff.prototype.constructor = Staff;

  Staff.prototype._schema = new qn.Model.Schema("Staff");

  /** StaffRegularDayTimePeriods */
  function StaffRegularDayTimePeriods(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.StaffRegularDayTimePeriods = StaffRegularDayTimePeriods;
  StaffRegularDayTimePeriods.prototype = Object.create(qn.EditModel.prototype);
  mixin_TimePeriodHolder(StaffRegularDayTimePeriods.prototype, "periods", true);
  mixin_inverseDayPeriods(StaffRegularDayTimePeriods.prototype);
  StaffRegularDayTimePeriods.prototype.constructor = StaffRegularDayTimePeriods;

  StaffRegularDayTimePeriods.prototype._schema = new qn.Model.Schema("StaffRegularDayTimePeriods");
  StaffRegularDayTimePeriods.prototype._schema.addArrayRelationship("periods", LocalTimePeriod, true);
  StaffRegularDayTimePeriods.prototype._schema.addRelationship("staff", Staff);

  /** StaffRosterWeek */
  function StaffRosterWeek(data) {
    qn.EditModel.call(this, data);
    qn.each(this.week, function(regularPeriods, dayOfWeek) {
      qn.each(regularPeriods.periods, function(period, idx) {
        period.dayOfWeek = dayOfWeek;
        period.dayOfWeekIndex = qn.domain.enums.DayOfWeek.indexOf(dayOfWeek);
      });
    });
  }
  qn.domain.StaffRosterWeek = StaffRosterWeek;
  StaffRosterWeek.prototype = Object.create(qn.EditModel.prototype);
  mixin_TimePeriodHolder(StaffRosterWeek.prototype, "week", true);
  mixin_inverseDayPeriods(StaffRosterWeek.prototype);
  StaffRosterWeek.prototype.constructor = StaffRosterWeek;

  StaffRosterWeek.prototype._schema = new qn.Model.Schema("StaffRosterWeek");
  StaffRosterWeek.prototype._schema.generateTransientId = true;
  StaffRosterWeek.prototype._schema.addRelationship("openingHours", OpeningHoursWeek);
  StaffRosterWeek.prototype._schema.addMapRelationship("week", StaffRegularDayTimePeriods);
  StaffRosterWeek.prototype._schema.addRelationship("staff", Staff);

  StaffRosterWeek.prototype.occursOnDay = function(day, period) {
    return period.dayOfWeekIndex == day.day();
  };

  /** RosterPeriodView */
  function RosterPeriodView(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.RosterPeriodView = RosterPeriodView;
  RosterPeriodView.prototype = Object.create(qn.EditModel.prototype);
  mixin_TimePeriodHolder(RosterPeriodView.prototype, "overrideWorkingHours", false);
  RosterPeriodView.prototype.constructor = RosterPeriodView;

  RosterPeriodView.prototype._schema = new qn.Model.Schema("RosterPeriodView");
  RosterPeriodView.prototype._schema.generateTransientId = true;
  RosterPeriodView.prototype._schema.addRelationship("staff", Staff);
  RosterPeriodView.prototype._schema.addAttribute("start", qn.Model.AttributeType.LocalDate);
  RosterPeriodView.prototype._schema.addAttribute("end", qn.Model.AttributeType.LocalDate);
  RosterPeriodView.prototype._schema.addArrayAttribute("holidays", qn.Model.AttributeType.LocalDate);
  RosterPeriodView.prototype._schema.addArrayRelationship("overrideWorkingHours", InstantPeriod, true);

  /** StaffRosterSummary */
  function StaffRosterSummary(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.StaffRosterSummary = StaffRosterSummary;
  StaffRosterSummary.prototype = Object.create(qn.EditModel.prototype);
  StaffRosterSummary.prototype.constructor = StaffRosterSummary;

  StaffRosterSummary.prototype._schema = new qn.Model.Schema("StaffRosterSummary");
  StaffRosterSummary.prototype._schema.generateTransientId = true;
  StaffRosterSummary.prototype._schema.addRelationship("staff", Staff);

  /** PhoneNumber */
  function PhoneNumber(data, parent) {
    qn.EditModel.call(this, data, parent);
  }
  qn.domain.PhoneNumber = PhoneNumber;
  PhoneNumber.prototype = Object.create(qn.EditModel.prototype);
  PhoneNumber.prototype.constructor = PhoneNumber;

  PhoneNumber.prototype._schema = new qn.Model.Schema("PhoneNumber");
  PhoneNumber.prototype._schema.generateTransientId = true;

  /** Client */
  function Client(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.Client = Client;
  Client.prototype = Object.create(qn.EditModel.prototype);
  Client.prototype.constructor = Client;

  Client.prototype._schema = new qn.Model.Schema("Client");
  Client.prototype._schema.addArrayRelationship("phoneNumbers", PhoneNumber, true);
  Client.prototype._schema.addAttribute("dateOfBirth", qn.Model.AttributeType.LocalDate);

  Object.defineProperty(Client.prototype, "age", {
    get : function() {
      if (!this.dateOfBirth) {
        return undefined;
      }
      var born = moment(this.dateOfBirth);
      var now = moment();
      var ms = now.diff(born);

      return moment.duration(ms);
    }
  });

  Object.defineProperty(Client.prototype, "ageRoughly", {
    get : function() {
      var age = this.age;
      if (!age) {
        return undefined;
      }

      var years = Math.floor(age.as('years'));
      var months = age.get('months');
      if (years < 0 || months < 0) {
        return moment.duration(0);
      }

      var newAge = moment.duration(years, 'years');
      if (years <= 1) {
        newAge = newAge.add(months, 'months');
      }

      return newAge;
    }
  });

  Client.prototype.addPhoneNumber = function() {
    this.phoneNumbers.push(new PhoneNumber());
  };
  Client.prototype.removePhoneNumber = function(idx) {
    return qn.removeElementOrIndex(this.phoneNumbers, idx);
  };
  Client.prototype.phoneNumbersValid =
      function() {
        for (var i = 0; i < this.phoneNumbers.length; ++i) {
          if (qn.isUndefined(this.phoneNumbers[i])
              || qn.isUndefined(this.phoneNumbers[i].type || qn.isEmpty(this.phoneNumbers[i].phoneNumber))) {
            return false;
          }
        }
        return true;
      };

  /** Product */
  function Product(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.Product = Product;
  Product.prototype = Object.create(qn.EditModel.prototype);
  Product.prototype.constructor = Product;

  Product.prototype._schema = new qn.Model.Schema("Product");

  /** Service */
  function Service(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.Service = Service;
  Service.prototype = Object.create(qn.EditModel.prototype);
  Service.prototype.constructor = Service;

  Service.prototype._schema = new qn.Model.Schema("Service");
  Service.prototype._schema.addMapAttribute("prices");

  /** ServiceBooking */
  function ServiceBooking(data, parent) {
    qn.EditModel.call(this, data, parent);
  }
  qn.domain.ServiceBooking = ServiceBooking;
  ServiceBooking.prototype = Object.create(qn.EditModel.prototype);
  ServiceBooking.prototype.constructor = ServiceBooking;

  ServiceBooking.prototype._schema = new qn.Model.Schema("ServiceBooking");
  ServiceBooking.prototype._schema.addRelationship("service", Service);
  ServiceBooking.prototype._schema.addRelationship("staff", Staff);

  Object.defineProperty(ServiceBooking.prototype, "start", {
    get : function() {
      var start = moment(this.parent().start);
      // find all servicebookings before this one, accumulate time
      var bookingsUntilNow = this.parent().serviceBookingsUntil(this.serviceBooking);
      for (var s = 0; s < bookingsUntilNow.length; s++) {
        var serviceBooking = bookingsUntilNow[s];
        var duration = serviceBooking.asDuration;
        start.add(duration, 'milliseconds');
      }
      return start.toDate();
    }
  });
  Object.defineProperty(ServiceBooking.prototype, "end", {
    get : function() {
      var end = moment(this.start);
      end.add(this.asDuration);
      return end.toDate();
    }
  });

  /** ServiceBooking "Event" View */
  function ServiceBookingEvent(serviceBooking) {
    this.serviceBooking = serviceBooking;
  }
  Object.defineProperty(ServiceBookingEvent.prototype, "start", {
    get : function() {
      return this.serviceBooking.start;
    }
  });
  Object.defineProperty(ServiceBookingEvent.prototype, "end", {
    get : function() {
      return this.serviceBooking.end;
    }
  });

  /** ClientAppointment */
  function ClientAppointment(data) {
    // deserialisation
    data.start = data.start ? qn.deserialiseInstant(data.start) : undefined;

    qn.EditModel.call(this, data);
  }
  qn.domain.ClientAppointment = ClientAppointment;
  ClientAppointment.prototype = Object.create(qn.EditModel.prototype);
  ClientAppointment.prototype.constructor = ClientAppointment;

  ClientAppointment.prototype._schema = new qn.Model.Schema("ClientAppointment");
  ClientAppointment.prototype._schema.addArrayRelationship("products", Product);
  ClientAppointment.prototype._schema.addArrayRelationship("services", ServiceBooking, true);
  ClientAppointment.prototype._schema.addRelationship("client", Client);
  ClientAppointment.prototype._schema.addAttribute("start", qn.Model.AttributeType.Instant);

  ClientAppointment.prototype.super_serialise = ClientAppointment.prototype.serialise;
  ClientAppointment.prototype.serialise = function serialiseClientAppointment() {
    var json = ClientAppointment.prototype.super_serialise.apply(this);
    json.start = qn.serialiseInstant(json.start);
    return json;
  }

  ClientAppointment.prototype.serviceBookingsUntil = function(serviceBooking) {
    var i = this.services.indexOf(serviceBooking);
    if (i < 0) {
      return [];
    }
    return this.services.slice(0, i);
  };

  /** StaffAppointments */
  function StaffAppointments(data) {
    qn.EditModel.call(this, data);
  }
  qn.domain.StaffAppointments = StaffAppointments;
  StaffAppointments.prototype = Object.create(qn.EditModel.prototype);
  StaffAppointments.prototype.constructor = StaffAppointments;

  StaffAppointments.prototype._schema = new qn.Model.Schema("StaffAppointments");
  StaffAppointments.prototype._schema.addArrayRelationship("clients", Client);
  StaffAppointments.prototype._schema.addArrayRelationship("services", Service);
  StaffAppointments.prototype._schema.addArrayRelationship("staff", Staff);
  StaffAppointments.prototype._schema.addArrayRelationship("clientAppointments", ClientAppointment);
  StaffAppointments.prototype._schema.generateTransientId = true;

  StaffAppointments.prototype.getServiceBooking = function(id) {
    for (var r = 0; r < this.clientAppointments.length; r++) {
      var clientAppointment = this.clientAppointments[r];

      for (var s = 0; s < clientAppointment.services.length; s++) {
        var serviceBooking = clientAppointment.services[s];
        if (serviceBooking.id == id) {
          return serviceBooking;
        }
      }
    }
    return undefined;
  };

  Object.defineProperty(StaffAppointments.prototype, "staffAppointmentKeys", {
    get : function() {
      return Object.keys(this.appointmentsByStaff);
    }
  });

  Object.defineProperty(StaffAppointments.prototype, "numberOfStaff", {
    get : function() {
      return this.staff.length;
    }
  });

  Object.defineProperty(StaffAppointments.prototype, "appointmentsByStaff", {
    get : function() {
      var appointmentsByStaff = this.transientData.appointmentsByStaff || {};

      // clean up any incorrect data
      var staffKeys = Object.keys(appointmentsByStaff)
      for (var s = 0; s < staffKeys.length; s++) {
        var staffId = staffKeys[s];
        var staffExists = false;
        for (var s = 0; s < this.staff.length && !staffExists; s++) {
          var staff = this.staff[s];
          staffExists = staff.id == staffId;
        }
        if (staffExists) {
          var bookingsForStaff = appointmentsByStaff[staffId];
          var staff = bookingsForStaff.staff;
          var events = bookingsForStaff.events;
          for (var e = 0; e < events.length; e++) {
            var event = events[e];
            var serviceBooking = event.serviceBooking;
            if (serviceBooking.staff.id != staffId || !this.getServiceBooking(serviceBooking.id)) {
              qn.removeElement(bookingsForStaff.events, event);
            }
          }
        } else {
          delete appointmentsByStaff[staffId];
        }
      }

      // add and update from appointments
      for (var r = 0; r < this.clientAppointments.length; r++) {
        var clientAppointment = this.clientAppointments[r];

        for (var s = 0; s < clientAppointment.services.length; s++) {
          var serviceBooking = clientAppointment.services[s];
          if (serviceBooking.staff) {
            var bookingsForStaff = appointmentsByStaff[serviceBooking.staff.id] || {};

            bookingsForStaff.events = bookingsForStaff.events || [];

            var contained = _.filter(bookingsForStaff.events, function(evt) {
              return evt.serviceBooking.id == serviceBooking.id;
            });
            if (contained.length < 1) {
              bookingsForStaff.events.push(new ServiceBookingEvent(serviceBooking));
            }

            bookingsForStaff.staff = bookingsForStaff.staff || serviceBooking.staff;

            appointmentsByStaff[serviceBooking.staff.id] = bookingsForStaff;
          }
        }
      }

      /** TODO roster -> businessHours */

      // ensure any mentioned staff have an entry, even if there are no
      // appointments for them
      for (var s = 0; s < this.staff.length; s++) {
        var staff = this.staff[s];
        if (!appointmentsByStaff[staff.id]) {
          appointmentsByStaff[staff.id] = {
            staff : staff,
            events : []
          };
        }
      }

      this.transientData.appointmentsByStaff = appointmentsByStaff;
      return appointmentsByStaff;
    }
  });

  qn.applicationConfigDefaults = qn.extendDeep(qn.applicationConfigDefaults, {
    businessHours : {
      weekStartDay : "SUNDAY",
      use24HourClock : true,
      timeSlotDuration : '00:15'
    },
    ui : {
      roster : {
        calendarBackgroundColour : '#fcf8e3',
        nonBusinessHoursColour : '#3f3f3f',
        rosteredTimeSegmentColour : '#337a37',
        regularHoursPlaceholderTimeSegmentColour : '#448b48',
        regularHoursTimeSegmentColour : '#6C946E',
        selectedTimeSegmentColour : '#b77a33'
      },
      openingHours : {
        calendarBackgroundColour : '#fcf8e3',
        businessHoursTimeSegmentColour : '#3a5f8b',
        selectedTimeSegmentColour : '#b77a33'
      }
    }
  });

  qn.defaultsDeep(qn.applicationConfig, qn.applicationConfigDefaults);

  // current user
  qn.currentUser = new User(qn.currentUser);

  // Angular module starts
  var module = angular.module("goldilocks-service", [ 'goldilocks-util' ]);

  module.constant('$user', qn.currentUser);

  module.run([ '$rootScope', '$user', '$entitySerialiserBuilder', '$entityDeserialiserBuilder', '$daysOfWeek',
      function($rootScope, $user, $entitySerialiserBuilder, $entityDeserialiserBuilder, $daysOfWeek) {
        $rootScope.$user = $user;
        $rootScope.$daysOfWeek = $daysOfWeek;

        qn.each(qn.domain, function(domainType, domainTypeName) {
          if (domainType.prototype && domainType.prototype.serialise) {
            $entitySerialiserBuilder.registerSerialiser(domainTypeName, domainType.prototype.serialise);
          }

          if (qn.isFunction(domainType)) {
            $entityDeserialiserBuilder.registerConstructor(domainTypeName, function(data) {
              return new domainType(data);
            });
          }
        });

        // TODO needs to be called on every page load and every time the
        // $applicationConfig item is changed.
        moment.locale(moment.locale(), {
          week : {
            dow : $daysOfWeek.indexOfFirstDay(),
            doy : moment.localeData().week.doy
          }
        });

      } ]);
  module.factory('$daysOfWeek', [ '$applicationConfig', function($applicationConfig) {

    function indexOfDay(day) {
      return qn.domain.enums.DayOfWeek.indexOf(day);
    }

    function firstDayLiteral() {
      if ($applicationConfig.businessHours && $applicationConfig.businessHours.weekStartDay) {
        return $applicationConfig.businessHours.weekStartDay;
      }
      return qn.domain.enums.DayOfWeek[0];
    }

    function indexOfFirstDay() {
      if ($applicationConfig.businessHours && $applicationConfig.businessHours.weekStartDay) {
        return indexOfDay(firstDayLiteral())
      }
      return 0;
    }

    function literalsWithFirstDay(firstDay) {
      if (!firstDay) {
        firstDay = firstDayLiteral();
      }

      var literals = qn.domain.enums.DayOfWeek.slice();
      var start = indexOfDay(firstDay);
      if (start > 0) {
        var first = literals.slice(start);
        literals = first.concat(literals.slice(0, start));
      }

      return literals;
    }

    var literalsSortedInitially = literalsWithFirstDay();

    var services = {
      indexOfFirstDay : indexOfFirstDay,
      indexOfDay : indexOfDay,
      firstDayLiteral : firstDayLiteral,
      literals : literalsWithFirstDay,
      sort : function(dayOfWeek) {
        return literalsSortedInitially.indexOf(dayOfWeek);
      }
    };
    return services;
  } ]);

  module.factory('$staffAppointmentsService', [ '$serverService', '$entityResolver', function($serverService, $entityResolver) {
    var serviceFactory = $serverService('/service/staffappointments/');
    var services = {};
    services.findByDay = serviceFactory.serviceMethod('get', 'search/findByDay', function(day, config) {
      config = config || {};
      config.params = config.params || {};
      config.params.day = (day ? qn.toMoment(day) : moment()).toDate().toJavaISODateString();
      return config;
    }, null, serviceFactory.transforms.result.entity);
    return services;
  } ]);

  module.factory('$userService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/user/');
    var services = serviceFactory.crudServices(false);
    services.newModel = function() {
      return new qn.domain.User();
    };
    services.findByIdOrName = serviceFactory.serviceMethod('get', 'search/findByIdOrName', function(name, page, pageInfo, config) {
      config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
      config.params.name = name;
      return config;
    }, null, serviceFactory.transforms.result.pagination);
    return services;
  } ]);

  module.factory('$staffService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/staff/');
    var services = serviceFactory.crudServices(false);
    services.newModel = function() {
      return new qn.domain.Staff();
    };
    services.findByName = serviceFactory.serviceMethod('get', 'search/findByName', function(name, page, pageInfo, config) {
      config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
      config.params.name = name;
      return config;
    }, null, serviceFactory.transforms.result.pagination);
    return services;
  } ]);

  module.factory('$rosterSummaryService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/roster/summary/');
    var services = {
      newModel : function() {
        return new qn.domain.StaffRosterSummary();
      },
      findByName : serviceFactory.serviceMethod('get', 'search/findByName', function(name, page, pageInfo, config) {
        config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
        config.params.name = name;
        return config;
      }, null, serviceFactory.transforms.result.pagination)
    }
    return services;
  } ]);

  module.factory('$applicationConfigService',
      [
          '$serverService',
          '$applicationConfig',
          '$applicationConfigDefaults',
          function($serverService, $applicationConfig, $applicationConfigDefaults) {
            var serviceFactory = $serverService('/service/appconfig/');
            var services = serviceFactory.crudServices(true);
            delete services.create;
            delete services.remove;
            delete services.findAll;
            delete services.findById;
            services.newModel = function() {
              return new qn.domain.ApplicationConfig();
            };
            services.findGlobal =
                serviceFactory.serviceMethod('get', 'search/findGlobal', null, null, serviceFactory.transforms.result.entity);
            services.findCurrent =
                serviceFactory.serviceMethod('get', 'search/findCurrent', null, null, serviceFactory.transforms.result.entity);

            services.reloadUserConfig = function() {
              services.findCurrent().then(function(userConfig) {
                qn.copy(userConfig.propertyText, $applicationConfig);
                qn.defaultsDeep($applicationConfig, $applicationConfigDefaults);
              });
            };

            return services;
          } ]);

  module.factory('$rosterPeriodService', [
      '$serverService',
      function($serverService) {
        var serviceFactory = $serverService('/service/roster/period/');
        var services = serviceFactory.crudServices(false);
        delete services.create;
        delete services.remove;
        delete services.findAll;
        services.findByStaffAndDayBetween =
            serviceFactory.serviceMethod('get', 'search/findByStaffAndDayBetween', function(id, start, end, config) {
              config = config || {};
              config.params = config.params || {};
              config.params.id = id;
              config.params.start = (start ? qn.toMoment(start) : moment()).toDate().toJavaLocalDateString();
              config.params.end = (end ? qn.toMoment(end) : moment().add(1, 'day')).toDate().toJavaLocalDateString();
              return config;
            }, null, serviceFactory.transforms.result.entity);
        services.newModel = function() {
          return new qn.domain.RosterPeriodView();
        };
        return services;
      } ]);

  module.factory('$rosterRegularWeekService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/roster/regularWeek/');
    var services = serviceFactory.crudServices(false);
    delete services.create;
    delete services.remove;
    delete services.findAll;
    services.newModel = function() {
      return new qn.domain.StaffRosterWeek();
    };
    return services;
  } ]);

  module.factory('$rosterPeriodService', [
      '$serverService',
      function($serverService) {
        var serviceFactory = $serverService('/service/roster/period/');
        var services = serviceFactory.crudServices(false);
        delete services.create;
        delete services.remove;
        delete services.findAll;
        delete services.findById;

        services.findByStaffAndDayBetween =
            serviceFactory.serviceMethod('get', 'search/findByStaffAndDayBetween', function(id, start, end, config) {
              config = config || {};
              config.params = config.params || {};
              config.params.id = id;
              config.params.start = (start ? qn.toMoment(start) : moment()).toDate().toJavaLocalDateString();
              config.params.end = (end ? qn.toMoment(end) : moment().add(1, 'day')).toDate().toJavaLocalDateString();
              return config;
            }, null, serviceFactory.transforms.result.entity);

        services.newModel = function() {
          return new qn.domain.StaffRosterWeek();
        };
        return services;
      } ]);

  module.factory('$openingHoursRegularWeekService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/openingHours/regularWeek/');
    var services = serviceFactory.crudServices(false);
    delete services.create;
    delete services.remove;
    delete services.findAll;
    delete services.findById;

    services.find = serviceFactory.serviceMethod('get', 'search/find', null, null, serviceFactory.transforms.result.entity);

    services.newModel = function() {
      return new qn.domain.OpeningHoursWeek();
    };
    return services;
  } ]);

  module.factory('$accountService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/account/');
    var services = {
      changePassword : serviceFactory.serviceMethod('post', 'changePassword', function(existingPassword, newPassword, config) {
        return config;
      }, function(existingPassword, newPassword, config) {
        var data = {
          existingPassword : existingPassword,
          newPassword : newPassword
        }
        return data;
      })
    };
    return services;
  } ]);

  module.factory('$roleService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/role/');
    var services = serviceFactory.crudServices(true);
    return services;
  } ]);

  module.factory('$productService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/product/');
    var services = serviceFactory.crudServices(false);
    services.newModel = function() {
      return new qn.domain.Product();
    };
    services.findByText = serviceFactory.serviceMethod('get', 'search/findByText', function(text, page, pageInfo, config) {
      config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
      config.params.text = text;
      return config;
    }, null, serviceFactory.transforms.result.pagination);
    return services;
  } ]);

  module.factory('$serviceService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/service/');
    var services = serviceFactory.crudServices(false);
    services.newModel = function() {
      return new qn.domain.Service();
    };
    services.findByText = serviceFactory.serviceMethod('get', 'search/findByText', function(text, page, pageInfo, config) {
      config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
      config.params.text = text;
      return config;
    }, null, serviceFactory.transforms.result.pagination);
    return services;
  } ]);

  module.factory('$clientService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/client/');
    var services = serviceFactory.crudServices(false);
    services.newModel = function() {
      return new qn.domain.Client();
    };
    services.findByText = serviceFactory.serviceMethod('get', 'search/findByText', function(text, page, pageInfo, config) {
      config = serviceFactory.transforms.config.pagination(page, pageInfo, config);
      config.params.text = text;
      return config;
    }, null, serviceFactory.transforms.result.pagination);
    return services;
  } ]);

  module.factory('$keepAliveService', [ '$serverService', function($serverService) {
    var serviceFactory = $serverService('/service/keepAlive/');
    var services = {
      keepAlive : serviceFactory.serviceMethod('get', '')
    }
    return services;
  } ]);

})(window, window.angular, window.qn, window.moment);
