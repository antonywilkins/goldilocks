package goldilocks.util.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Date;

public class DateUtil {

	public static Instant getEnd(Collection<? extends DateTimePeriod> events) {
		DateTimePeriod d = getEndPeriod(events);
		return d == null ? null : d.getEnd();
	}

	public static DateTimePeriod getEndPeriod(Collection<? extends DateTimePeriod> events) {
		DateTimePeriod d = null;
		for (DateTimePeriod app : events) {
			if (d == null || d.getEnd().isBefore(app.getEnd())) {
				d = app;
			}
		}
		return d;
	}

	public static Instant getStart(Collection<? extends DateTimePeriod> events) {
		DateTimePeriod d = getStartPeriod(events);
		return d == null ? null : d.getStart();
	}

	public static DateTimePeriod getStartPeriod(Collection<? extends DateTimePeriod> events) {
		DateTimePeriod d = null;
		for (DateTimePeriod app : events) {
			if (d == null || d.getStart().isAfter(app.getStart())) {
				d = app;
			}
		}
		return d;
	}

	public static Date toDate(Instant moment) {
		if (moment == null) {
			return null;
		}
		Date date = Date.from(moment);
		return date;
	}

	public static Date toDate(LocalDateTime localDateTime) {
		if (localDateTime == null) {
			return null;
		}
		Instant moment = toInstant(localDateTime);
		Date date = toDate(moment);
		return date;
	}

	public static Instant toInstant(Date date) {
		if (date == null) {
			return null;
		}
		Instant moment = Instant.ofEpochMilli(date.getTime());
		return moment;
	}

	public static Instant toInstant(LocalDateTime localDateTime) {
		if (localDateTime == null) {
			return null;
		}
		Instant moment = localDateTime.atZone(ZoneId.systemDefault()).toInstant();
		return moment;
	}

	public static LocalDateTime toLocalDateTime(Date date) {
		if (date == null) {
			return null;
		}
		Instant moment = toInstant(date);
		return toLocalDateTime(moment);
	}

	public static LocalDateTime toLocalDateTime(Instant moment) {
		if (moment == null) {
			return null;
		}
		LocalDateTime local = LocalDateTime.ofInstant(moment, ZoneId.systemDefault());
		return local;
	}

	public static Instant withTime(LocalDate day, int hours, int minutes) {
		if (day == null) {
			day = LocalDate.now();
		}
		LocalDateTime dateTime = LocalDateTime.of(day, LocalTime.of(hours, minutes));
		return toInstant(dateTime);
	}

}
