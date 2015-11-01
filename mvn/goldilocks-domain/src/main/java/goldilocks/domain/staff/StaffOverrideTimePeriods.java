package goldilocks.domain.staff;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.domain.LocalTimePeriod;

@SuppressWarnings("deprecation")
@Entity
@Validated
@Table(indexes = { @Index(name = "IDX_STAFF_OVERRIDE_TIME_STAFF_PERIODS_DAY", columnList = "STAFF_ID,DAY") },
        uniqueConstraints = { @UniqueConstraint(name = "UK_STAFF_OVERRIDE_TIME_PERIODS", columnNames = { "STAFF_ID", "DAY" }) })
public class StaffOverrideTimePeriods extends DomainObjectBase<StaffOverrideTimePeriods, Long>
        implements Serializable, Comparable<StaffOverrideTimePeriods> {

    private static final long serialVersionUID = 1L;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "STAFF_OVERRIDE_TIME_PERIODS_PERIOD")
    @ForeignKey(name = "FK_STAFF_OVERRIDE_TIME_PERIODS_PERIOD")
    private List<LocalTimePeriod> periods = new ArrayList<>();

    @Id
    @GeneratedValue
    private Long id;

    @ForeignKey(name = "FK_STAFF_OVERRIDE_TIME_PERIODS_STAFF")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "STAFF_ID", nullable = false)
    private Staff staff;

    @Column(name = "DAY", nullable = false)
    @NotNull
    private LocalDate day;

    @Version
    private Long version;

    public StaffOverrideTimePeriods() {
    }

    private List<LocalTimePeriod> _getPeriods() {
        if (periods == null) {
            periods = new ArrayList<>();
        }
        return periods;
    }

    public void addPeriod(LocalTimePeriod p) {
        if (_getPeriods().contains(p)) {
            return;
        }
        _getPeriods().add(p);
    }

    @Override
    public int compareTo(StaffOverrideTimePeriods o) {
        int c = CompareUtil.compare(getStaff(), o.getStaff());
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(day, o.day);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(id, o.id);
        if (c != 0) {
            return c;
        }
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
        StaffOverrideTimePeriods other = (StaffOverrideTimePeriods) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    @JsonSerialize(using = LocalDateSerializer.class)
    public LocalDate getDay() {
        return day;
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

    @JsonSerialize(using = LocalDateSerializer.class)
    public void setDay(LocalDate date) {
        this.day = date;
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
        return String.format("TimePeriods[periods='%s']", getPeriods());
    }

}