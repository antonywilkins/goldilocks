package goldilocks.domain.staff.rostersummaryview;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.rosterweekview.StaffRegularDayTimePeriodsView;
import goldilocks.domain.staff.rosterweekview.StaffRosterWeek;
import goldilocks.util.domain.DomainTypeBase;
import goldilocks.util.domain.DurationSerializer;

public class StaffRosterSummary extends DomainTypeBase implements Serializable {

    private static final long serialVersionUID = 1L;

    private StaffRosterWeek staffRosterWeek;

    public StaffRosterSummary() {
    }

    public StaffRosterSummary(Staff staff) {
        this(new StaffRosterWeek(staff));
    }

    public StaffRosterSummary(StaffRosterWeek roster) {
        this.setStaffRosterWeek(roster);
    }

    public Set<DayOfWeek> getRegularDays() {
        Set<DayOfWeek> regularDays = new TreeSet<>();
        for (Map.Entry<DayOfWeek, StaffRegularDayTimePeriodsView> dayEntry : getStaffRosterWeek().getWeek().entrySet()) {
            if (!dayEntry.getValue().getDuration().isZero()) {
                regularDays.add(dayEntry.getKey());
            }
        }
        return regularDays;
    }

    @JsonSerialize(using = DurationSerializer.class)
    public Duration getRegularHours() {
        return getStaffRosterWeek().getDuration();
    }

    public Staff getStaff() {
        return getStaffRosterWeek().getStaff();
    }

    @JsonIgnore
    public StaffRosterWeek getStaffRosterWeek() {
        if (staffRosterWeek == null) {
            staffRosterWeek = new StaffRosterWeek();
        }
        return staffRosterWeek;
    }

    public void setStaff(Staff staff) {
        getStaffRosterWeek().setStaff(staff);
    }

    public void setStaffRosterWeek(StaffRosterWeek staffRosterWeek) {
        this.staffRosterWeek = staffRosterWeek;
    }

}
