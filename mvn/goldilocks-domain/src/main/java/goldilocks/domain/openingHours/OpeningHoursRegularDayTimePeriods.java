package goldilocks.domain.openingHours;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.persistence.CollectionTable;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
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
public class OpeningHoursRegularDayTimePeriods extends DomainObjectBase<OpeningHoursRegularDayTimePeriods, DayOfWeek>
        implements Serializable, Comparable<OpeningHoursRegularDayTimePeriods> {

    private static final long serialVersionUID = 1L;

    @Id
    @Enumerated(EnumType.STRING)
    private DayOfWeek id;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "OPENING_HOURS_PERIODS")
    @ForeignKey(name = "FK_OPENING_HOURS_PERIODS")
    private List<LocalTimePeriod> periods = new ArrayList<>();

    @Version
    private Long version;

    public OpeningHoursRegularDayTimePeriods() {
    }

    public OpeningHoursRegularDayTimePeriods(DayOfWeek dayOfWeek) {
        this.id = dayOfWeek;
    }

    private List<LocalTimePeriod> _getPeriods() {
        if (periods == null) {
            periods = new ArrayList<>();
        }
        return periods;
    }

    @Override
    public int compareTo(OpeningHoursRegularDayTimePeriods o) {
        int c = CompareUtil.compare(id, o.id);
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
        OpeningHoursRegularDayTimePeriods other = (OpeningHoursRegularDayTimePeriods) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
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
    public DayOfWeek getId() {
        return id;
    }

    public List<LocalTimePeriod> getPeriods() {
        Collections.sort(_getPeriods());
        return Collections.unmodifiableList(_getPeriods());
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

    @Override
    public void setId(DayOfWeek id) {
        this.id = id;
    }

    public void setPeriods(List<LocalTimePeriod> periods) {
        this.periods.clear();
        if (periods != null) {
            this.periods.addAll(periods);
        }
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return String.format("%s[id=%s periods='%s']", getClass().getSimpleName(), getId(), getPeriods());
    }

}