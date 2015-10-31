package goldilocks.util.domain;

import java.io.Serializable;
import java.time.Instant;

import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class InstantPeriod extends DomainTypeBase implements Serializable, Comparable<InstantPeriod>, DateTimePeriod {

	private static final long serialVersionUID = 1L;

	@Column(nullable = false)
	private Instant start;

	@Column(nullable = false)
	private Instant end;

	public InstantPeriod() {
		super();
	}

	public InstantPeriod(Instant start, Instant end) {
		super();
		this.start = start;
		this.end = end;
	}

	@Override
	public int compareTo(InstantPeriod o) {
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
		InstantPeriod other = (InstantPeriod) obj;
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

	@Override
	public Instant getEnd() {
		return end;
	}

	@Override
	public Instant getStart() {
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

	public void setEnd(Instant end) {
		this.end = end;
	}

	public void setStart(Instant start) {
		this.start = start;
	}

	@Override
	public String toString() {
		return String.format("InstantPeriod [start=%s, end=%s]", start, end);
	}

}
