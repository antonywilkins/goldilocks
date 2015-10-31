package goldilocks.util.domain;

import java.io.Serializable;
import java.time.Duration;
import java.time.LocalTime;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Embeddable
public class LocalTimePeriod extends DomainTypeBase implements Serializable, Comparable<LocalTimePeriod> {

	private static final long serialVersionUID = 1L;

	@Column(nullable = false)
	private LocalTime start;

	@Column(nullable = false)
	private LocalTime end;

	public LocalTimePeriod() {
		super();
	}

	public LocalTimePeriod(LocalTime start, LocalTime end) {
		super();
		this.start = start;
		this.end = end;
	}

	@Override
	public int compareTo(LocalTimePeriod o) {
		int c = CompareUtil.compare(start, o.start);
		if (c != 0) {
			return c;
		}
		c = CompareUtil.compare(end, o.end);
		return c;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		LocalTimePeriod other = (LocalTimePeriod) obj;
		if (end == null) {
			if (other.end != null) {
				return false;
			}
		} else if (!end.equals(other.end)) {
			return false;
		}
		if (start == null) {
			if (other.start != null) {
				return false;
			}
		} else if (!start.equals(other.start)) {
			return false;
		}
		return true;
	}

	@JsonIgnore
	public Duration getDuration() {
		if (start == null || end == null) {
			return Duration.ofDays(Long.MAX_VALUE);
		}
		return Duration.between(start, end);
	}

	public LocalTime getEnd() {
		return end;
	}

	public LocalTime getStart() {
		return start;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((end == null) ? 0 : end.hashCode());
		result = prime * result + ((start == null) ? 0 : start.hashCode());
		return result;
	}

	public void setEnd(LocalTime end) {
		this.end = end;
	}

	public void setStart(LocalTime start) {
		this.start = start;
	}

	@Override
	public String toString() {
		return String.format("LocalTimePeriod [start=%s, end=%s]", start, end);
	}

}
