package goldilocks.app.web.service.staff;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffOverrideTimePeriods;
import goldilocks.domain.staff.StaffRegularDayTimePeriods;
import goldilocks.domain.staff.rosterperiodview.RosterPeriodView;
import goldilocks.domain.staff.rostersummaryview.StaffRosterSummary;
import goldilocks.domain.staff.rosterweekview.StaffRosterWeek;
import goldilocks.repository.staff.StaffOverrideTimePeriodsRepository;
import goldilocks.repository.staff.StaffRegularDayTimePeriodsRepository;
import goldilocks.repository.staff.StaffRepository;
import goldilocks.util.domain.InstantPeriod;
import goldilocks.util.domain.LocalTimePeriod;

@RestController
public class RosterService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffOverrideTimePeriodsRepository overrideTimePeriodsRepository;

    @Autowired
    private StaffRegularDayTimePeriodsRepository regularDayTimePeriodsRepository;

    public Map<Staff, List<LocalTimePeriod>> findByDay(LocalDate day) {
        List<StaffRegularDayTimePeriods> regularPeriods = regularDayTimePeriodsRepository.findByDayOfWeek(day.getDayOfWeek());
        List<StaffOverrideTimePeriods> overridePeriods = overrideTimePeriodsRepository.findByDay(day);

        return getSingleDayRosterByStaff(regularPeriods, overridePeriods);
    }

    public RosterPeriodView findByStaffAndDayBetween(Long staffId, LocalDate start, LocalDate end) {
        List<StaffOverrideTimePeriods> overridePeriods = overrideTimePeriodsRepository.findByStaffIdAndDayBetween(staffId, start, end);

        RosterPeriodView periodView = new RosterPeriodView(start, end, overridePeriods);
        if (periodView.getStaff() == null) {
            Staff staff = staffRepository.findOne(staffId);
            periodView.setStaff(staff);
        }
        return periodView;
    }

    public StaffRosterWeek findRegularWeek(Long staffId) {
        List<StaffRegularDayTimePeriods> dayTimePeriods = regularDayTimePeriodsRepository.findByStaffId(staffId);
        StaffRosterWeek rosterWeek = new StaffRosterWeek(dayTimePeriods);
        if (rosterWeek.getStaff() == null) {
            Staff staff = staffRepository.findOne(staffId);
            rosterWeek.setStaff(staff);
        }
        return rosterWeek;
    }

    public List<StaffRosterSummary> findSummaries(List<Staff> staffList) {
        List<StaffRosterSummary> result = new ArrayList<>();
        if (staffList != null) {
            List<StaffRegularDayTimePeriods> dayTimePeriods = regularDayTimePeriodsRepository.findByStaffIn(staffList);
            Map<Staff, StaffRosterWeek> staffWeeks = new HashMap<>();
            for (StaffRegularDayTimePeriods regularPeriods : dayTimePeriods) {
                Staff staff = regularPeriods.getStaff();
                StaffRosterWeek roster = staffWeeks.get(staff);
                if (roster == null) {
                    roster = new StaffRosterWeek(staff);
                    staffWeeks.put(staff, roster);
                }
                roster.addDayTimePeriod(regularPeriods);
            }
            for (Staff staff : staffList) {
                StaffRosterWeek roster = staffWeeks.get(staff);
                if (roster == null) {
                    roster = new StaffRosterWeek(staff);
                }
                result.add(new StaffRosterSummary(roster));
            }
        }
        return result;
    }

    protected Map<Staff, List<LocalTimePeriod>> getSingleDayRosterByStaff(List<StaffRegularDayTimePeriods> regularPeriods,
            List<StaffOverrideTimePeriods> overridePeriods) {
        Map<Staff, List<LocalTimePeriod>> result = new TreeMap<>();
        for (StaffRegularDayTimePeriods periods : regularPeriods) {
            result.put(periods.getStaff(), periods.getPeriods());
        }

        for (StaffOverrideTimePeriods periods : overridePeriods) {
            result.put(periods.getStaff(), periods.getPeriods());
        }

        return result;
    }

    public RosterPeriodView save(RosterPeriodView periodView) {
        if (periodView == null) {
            return null;
        }

        Staff staff = periodView.getStaff();
        staff = staffRepository.findOne(staff.getId());

        List<StaffOverrideTimePeriods> existingPeriods = overrideTimePeriodsRepository.findByStaffIdAndDayBetween(staff.getId(),
                periodView.getStart(), periodView.getEnd());

        Map<LocalDate, StaffOverrideTimePeriods> byDate = new HashMap<>();
        for (LocalDate day : periodView.getHolidays()) {
            StaffOverrideTimePeriods periods = byDate.get(day);
            if (periods == null) {
                periods = new StaffOverrideTimePeriods();
                periods.setStaff(staff);
                periods.setDay(day);
                byDate.put(day, periods);
            }
        }
        for (InstantPeriod p : periodView.getOverrideWorkingHours()) {
            LocalDate day = LocalDate.from(p.getStart());
            StaffOverrideTimePeriods periods = byDate.get(day);
            if (periods == null) {
                periods = new StaffOverrideTimePeriods();
                periods.setStaff(staff);
                periods.setDay(day);
                byDate.put(day, periods);
            }
            periods.addPeriod(new LocalTimePeriod(LocalTime.from(p.getStart()), LocalTime.from(p.getEnd())));
        }

        for (StaffOverrideTimePeriods existing : new ArrayList<>(existingPeriods)) {
            StaffOverrideTimePeriods newCopy = byDate.get(existing.getDay());
            if (newCopy != null) {
                existingPeriods.remove(existing);
                existing.setPeriods(newCopy.getPeriods());
                byDate.put(existing.getDay(), existing);
            }
        }

        overrideTimePeriodsRepository.delete(existingPeriods);

        existingPeriods = new ArrayList<>(byDate.values());
        existingPeriods = overrideTimePeriodsRepository.save(existingPeriods);

        periodView = new RosterPeriodView(periodView.getStart(), periodView.getEnd(), existingPeriods);
        if (periodView.getStaff() == null) {
            periodView.setStaff(staff);
        }
        return periodView;
    }

    public StaffRosterWeek save(StaffRosterWeek staffRosterWeek) {
        if (staffRosterWeek == null) {
            return null;
        }

        Staff staff = staffRosterWeek.getStaff();

        List<StaffRegularDayTimePeriods> dayTimePeriods = staffRosterWeek.getDayTimePeriods();
        for (StaffRegularDayTimePeriods p : dayTimePeriods) {
            p.setStaff(staff);
        }
        dayTimePeriods = regularDayTimePeriodsRepository.save(dayTimePeriods);

        return new StaffRosterWeek(staff, dayTimePeriods);
    }

}
