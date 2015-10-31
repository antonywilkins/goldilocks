package goldilocks.app.web.service.staff;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.rostersummaryview.StaffRosterSummary;

@RestController
public class RosterSummaryService {

	@Autowired
	private RosterService rosterService;

	@Autowired
	private StaffService staffService;

	@RequestMapping("/service/roster/summary/search/findByName")
	public Page<StaffRosterSummary> findByName(@RequestParam(value = "name", required = false) String name,
			@RequestParam(value = "page", defaultValue = "1") int pageNumber,
			@RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
			@RequestParam(value = "sort", required = false) String sortField) {
		Page<Staff> staffPage = staffService.findByName(name, pageNumber, pageSize, sortField);
		List<StaffRosterSummary> summaries = rosterService.findSummaries(staffPage.getContent());
		return new PageImpl<StaffRosterSummary>(summaries,
				new PageRequest(pageNumber, pageSize, staffService.createSort(sortField)),
				staffPage.getTotalElements());
	}

}
