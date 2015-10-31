package goldilocks.app.web.service.staff;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.staff.rosterperiodview.RosterPeriodView;

@RestController
public class PeriodRosterService {

    @Autowired
    private RosterService rosterService;

    @RequestMapping("/service/roster/period/search/findByStaffAndDayBetween")
    public RosterPeriodView findByStaffAndDayBetween(@RequestParam(value = "id", required = true) Long id,
            @RequestParam(value = "start", required = true) @DateTimeFormat(iso = ISO.DATE) LocalDate start,
            @RequestParam(value = "end", required = true) @DateTimeFormat(iso = ISO.DATE) LocalDate end) {
        return rosterService.findByStaffAndDayBetween(id, start, end);
    }

    @Transactional
    @RequestMapping(value = "/service/roster/period/update", method = RequestMethod.POST)
    public RosterPeriodView update(@RequestBody RosterPeriodView staffRosterWeek) {
        return rosterService.save(staffRosterWeek);
    }
}
