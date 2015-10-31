package goldilocks.domain.openingHours.weekview;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.fasterxml.jackson.annotation.JsonIgnore;

import goldilocks.domain.openingHours.OpeningHoursRegularDayTimePeriods;
import goldilocks.util.domain.DomainTypeBase;

public class OpeningHoursWeek extends DomainTypeBase implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<OpeningHoursRegularDayTimePeriods> dayTimePeriods;

    public OpeningHoursWeek() {
    }

    public OpeningHoursWeek(List<OpeningHoursRegularDayTimePeriods> dayTimePeriods) {
        super();
        this.dayTimePeriods = dayTimePeriods;
    }

    public void addDayTimePeriod(OpeningHoursRegularDayTimePeriods regularPeriods) {
        if (getDayTimePeriods().contains(regularPeriods)) {
            return;
        }
        getDayTimePeriods().add(regularPeriods);
    }

    @JsonIgnore
    public List<OpeningHoursRegularDayTimePeriods> getDayTimePeriods() {
        if (dayTimePeriods == null) {
            dayTimePeriods = new ArrayList<>();
        }
        return dayTimePeriods;
    }

    @JsonIgnore
    public Duration getDuration() {
        Duration d = Duration.ZERO;
        for (OpeningHoursRegularDayTimePeriods p : getDayTimePeriods()) {
            d = d.plus(p.getDuration());
        }
        return d;
    }

    public Map<DayOfWeek, OpeningHoursRegularDayTimePeriods> getWeek() {
        Map<DayOfWeek, OpeningHoursRegularDayTimePeriods> result = new TreeMap<>();
        if (getDayTimePeriods() != null) {
            for (OpeningHoursRegularDayTimePeriods periods : getDayTimePeriods()) {
                result.put(periods.getId(), periods);
            }
        }
        for (DayOfWeek dow : DayOfWeek.values()) {
            if (!result.containsKey(dow)) {
                result.put(dow, new OpeningHoursRegularDayTimePeriods(dow));
            }
        }
        return result;
    }

    public void setWeek(Map<DayOfWeek, OpeningHoursRegularDayTimePeriods> week) {
        if (week == null) {
            dayTimePeriods = null;
            return;
        }
        dayTimePeriods = new ArrayList<>(week.values());
    }

}
