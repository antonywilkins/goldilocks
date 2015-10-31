package goldilocks.util.domain;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class LocalDateTimePeriod extends DomainTypeBase implements Serializable, Comparable<LocalDateTimePeriod> {

    private static final long serialVersionUID = 1L;

    private static LocalDateTime endAfter(LocalTime end, LocalDate day, LocalDateTime start) {
        if (start == null) {
            return day.atTime(end);
        }
        day = LocalDate.from(start);
        LocalDateTime endDT = day.atTime(end);
        if (start.isAfter(endDT)) {
            endDT = endDT.plusDays(1);
        }
        return endDT;
    }

    @Column(nullable = false)
    private LocalDateTime start;

    @Column(nullable = false)
    private LocalDateTime end;

    public LocalDateTimePeriod() {
        super();
    }

    public LocalDateTimePeriod(LocalDate day, LocalTime start, LocalTime end) {
        this.start = start == null ? null : day.atTime(start);
        this.end = end == null ? null : endAfter(end, day, this.start);
    }

    public LocalDateTimePeriod(LocalDate day, LocalTimePeriod period) {
        this(day, period == null ? null : period.getStart(), period == null ? null : period.getEnd());
    }

    public LocalDateTimePeriod(LocalDateTime start, LocalDateTime end) {
        super();
        this.start = start;
        this.end = end;
    }

    @Override
    public int compareTo(LocalDateTimePeriod o) {
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
        LocalDateTimePeriod other = (LocalDateTimePeriod) obj;
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

    public LocalDateTime getEnd() {
        return end;
    }

    public LocalDateTime getStart() {
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

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }

    public InstantPeriod toInstantPeriod() {
        return new InstantPeriod(DateUtil.toInstant(start), DateUtil.toInstant(end));
    }

    @Override
    public String toString() {
        return String.format("LocalDateTimePeriod [start=%s, end=%s]", start, end);
    }

}
