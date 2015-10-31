package goldilocks.app.web.service.staff;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.staff.rosterweekview.StaffRosterWeek;

@RestController
public class RegularWeekRosterService {

	@Autowired
	private RosterService rosterService;

	@RequestMapping("/service/roster/regularWeek/search/findById")
	public StaffRosterWeek findById(@RequestParam(value = "id", required = true) Long id) {
		return rosterService.findRegularWeek(id);
	}

	@Transactional
	@RequestMapping(value = "/service/roster/regularWeek/update", method = RequestMethod.POST)
	public StaffRosterWeek update(@RequestBody StaffRosterWeek staffRosterWeek) {
		return rosterService.save(staffRosterWeek);
	}
}
