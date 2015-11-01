package goldilocks.domain.staff;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonIgnore;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.domain.LocalTimePeriod;

@SuppressWarnings("deprecation")
@Entity
@Validated
@Table(indexes = { @Index(name = "IDX_STAFF_WORKING_WEEK_STAFF_DAY_OF_WEEK", columnList = "STAFF_ID,DAY_OF_WEEK") },
        uniqueConstraints = { @UniqueConstraint(name = "UK_STAFF_WORKING_WEEK_STAFF_DAY", columnNames = { "STAFF_ID", "DAY_OF_WEEK" }) })
public class StaffRegularDayTimePeriods extends DomainObjectBase<StaffRegularDayTimePeriods, Long>
        implements Serializable, Comparable<StaffRegularDayTimePeriods> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    @ForeignKey(name = "FK_STAFF_REGULAR_DAY_TIME_PERIODS_STAFF")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "STAFF_ID", nullable = false)
    private Staff staff;

    @Column(name = "DAY_OF_WEEK", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "STAFF_REGULAR_DAY_TIME_PERIODS_PERIODS")
    @ForeignKey(name = "FK_STAFF_REGULAR_DAY_TIME_PERIODS_PERIODS")
    private List<LocalTimePeriod> periods = new ArrayList<>();

    @Version
    private Long version;

    public StaffRegularDayTimePeriods() {
    }

    public StaffRegularDayTimePeriods(Staff staff, DayOfWeek dayOfWeek) {
        this.staff = staff;
        this.dayOfWeek = dayOfWeek;
    }

    private List<LocalTimePeriod> _getPeriods() {
        if (periods == null) {
            periods = new ArrayList<>();
        }
        return periods;
    }

    @Override
    public int compareTo(StaffRegularDayTimePeriods o) {
        int c = CompareUtil.compare(staff, o.staff);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(dayOfWeek, o.dayOfWeek);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(id, o.id);

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
        StaffRegularDayTimePeriods other = (StaffRegularDayTimePeriods) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    @JsonIgnore
    public Duration getDuration() {
        Duration d = Duration.ZERO;
        for (LocalTimePeriod p : _getPeriods()) {
            d = d.plus(p.getDuration());
        }
        return d;
    }

    @Override
    public Long getId() {
        return id;
    }

    public List<LocalTimePeriod> getPeriods() {
        Collections.sort(_getPeriods());
        return Collections.unmodifiableList(_getPeriods());
    }

    public Staff getStaff() {
        return staff;
    }

    @Override
    public Long getVersion() {
        return version;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setPeriods(List<LocalTimePeriod> periods) {
        this.periods.clear();
        if (periods != null) {
            this.periods.addAll(periods);
        }
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return String.format("%s[periods='%s']", getClass().getSimpleName(), getPeriods());
    }

}