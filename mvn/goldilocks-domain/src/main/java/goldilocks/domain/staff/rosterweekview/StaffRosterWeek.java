package goldilocks.domain.staff.rosterweekview;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.fasterxml.jackson.annotation.JsonIgnore;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffRegularDayTimePeriods;
import goldilocks.util.domain.DomainTypeBase;

public class StaffRosterWeek extends DomainTypeBase implements Serializable {

    private static final long serialVersionUID = 1L;

    private static Staff findStaff(List<StaffRegularDayTimePeriods> dayTimePeriods) {
        if (dayTimePeriods != null) {
            for (StaffRegularDayTimePeriods p : dayTimePeriods) {
                if (p.getStaff() != null) {
                    return p.getStaff();
                }
            }
        }
        return null;
    }

    private Staff staff;

    private List<StaffRegularDayTimePeriods> dayTimePeriods;

    public StaffRosterWeek() {
    }

    public StaffRosterWeek(List<StaffRegularDayTimePeriods> dayTimePeriods) {
        this(findStaff(dayTimePeriods), dayTimePeriods);
    }

    public StaffRosterWeek(Staff staff) {
        super();
        this.staff = staff;
    }

    public StaffRosterWeek(Staff staff, List<StaffRegularDayTimePeriods> dayTimePeriods) {
        super();
        this.staff = staff;
        this.dayTimePeriods = dayTimePeriods;
    }

    public void addDayTimePeriod(StaffRegularDayTimePeriods regularPeriods) {
        if (getDayTimePeriods().contains(regularPeriods)) {
            return;
        }
        getDayTimePeriods().add(regularPeriods);
    }

    @JsonIgnore
    public List<StaffRegularDayTimePeriods> getDayTimePeriods() {
        if (dayTimePeriods == null) {
            dayTimePeriods = new ArrayList<>();
        }
        return dayTimePeriods;
    }

    @JsonIgnore
    public Duration getDuration() {
        Duration d = Duration.ZERO;
        for (StaffRegularDayTimePeriods p : getDayTimePeriods()) {
            d = d.plus(p.getDuration());
        }
        return d;
    }

    public Staff getStaff() {
        return staff;
    }

    public Map<DayOfWeek, StaffRegularDayTimePeriodsView> getWeek() {
        Map<DayOfWeek, StaffRegularDayTimePeriodsView> result = new TreeMap<>();
        if (getDayTimePeriods() != null) {
            for (StaffRegularDayTimePeriods periods : getDayTimePeriods()) {
                result.put(periods.getDayOfWeek(), new StaffRegularDayTimePeriodsView(periods));
            }
        }
        for (DayOfWeek dow : DayOfWeek.values()) {
            if (!result.containsKey(dow)) {
                result.put(dow, new StaffRegularDayTimePeriodsView(this.staff, dow));
            }
        }
        return result;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public void setWeek(Map<DayOfWeek, StaffRegularDayTimePeriods> week) {
        if (week == null) {
            dayTimePeriods = null;
            return;
        }
        dayTimePeriods = new ArrayList<>(week.values());
    }

}
