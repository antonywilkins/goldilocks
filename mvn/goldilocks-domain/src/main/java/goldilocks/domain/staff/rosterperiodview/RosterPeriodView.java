package goldilocks.domain.staff.rosterperiodview;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffOverrideTimePeriods;
import goldilocks.util.domain.DomainTypeBase;
import goldilocks.util.domain.InstantPeriod;
import goldilocks.util.domain.LocalDateTimePeriod;
import goldilocks.util.domain.LocalTimePeriod;

public class RosterPeriodView extends DomainTypeBase implements Serializable {

    private static final long serialVersionUID = 1L;

    private Set<InstantPeriod> overrideWorkingHours;
    private Set<LocalDate> holidays;
    private Staff staff;
    private LocalDate start;
    private LocalDate end;

    public RosterPeriodView(LocalDate start, LocalDate end) {
        this.start = start;
        this.end = end;
    }

    public RosterPeriodView(LocalDate start, LocalDate end, List<StaffOverrideTimePeriods> overridePeriods) {
        this(start, end);
        this.setOverridePeriods(overridePeriods);
        this.staff = findStaff(overridePeriods);
    }

    private Staff findStaff(List<StaffOverrideTimePeriods> overridePeriods) {
        for (StaffOverrideTimePeriods p : overridePeriods) {
            return p.getStaff();
        }
        return null;
    }

    public LocalDate getEnd() {
        return end;
    }

    public Set<LocalDate> getHolidays() {
        if (holidays == null) {
            holidays = new TreeSet<>();
        }
        return holidays;
    }

    public Set<InstantPeriod> getOverrideWorkingHours() {
        if (overrideWorkingHours == null) {
            overrideWorkingHours = new TreeSet<>();
        }
        return overrideWorkingHours;
    }

    public Staff getStaff() {
        return staff;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public void setHolidays(Set<LocalDate> holidays) {
        this.holidays = holidays;
    }

    public void setOverridePeriods(List<StaffOverrideTimePeriods> overridePeriods) {
        Set<InstantPeriod> overideHours = new TreeSet<>();
        Set<LocalDate> holiday = new TreeSet<>();
        for (StaffOverrideTimePeriods h : overridePeriods) {
            if (h.getPeriods().isEmpty()) {
                holiday.add(h.getDay());
            }
            for (LocalTimePeriod timePeriod : h.getPeriods()) {
                LocalDateTimePeriod dtPeriod = new LocalDateTimePeriod(h.getDay(), timePeriod);
                overideHours.add(dtPeriod.toInstantPeriod());
            }
        }
        this.overrideWorkingHours = overideHours;
        this.holidays = holiday;
    }

    public void setOverrideWorkingHours(Collection<InstantPeriod> hours) {
        if (hours == null) {
            this.overrideWorkingHours = null;
        } else {
            this.overrideWorkingHours = new TreeSet<>(hours);
        }
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

}