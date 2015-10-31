package goldilocks.app.web.service.openingHours;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.openingHours.weekview.OpeningHoursWeek;

@RestController
public class OpeningHoursRegularWeekService {

    @Autowired
    private OpeningHoursService openingHoursService;

    @RequestMapping("/service/openingHours/regularWeek/search/find")
    public OpeningHoursWeek findById() {
        return openingHoursService.getOpeningHours();
    }

    @Transactional
    @RequestMapping(value = "/service/openingHours/regularWeek/update", method = RequestMethod.POST)
    public OpeningHoursWeek update(@RequestBody OpeningHoursWeek openingHoursWeek) {
        return openingHoursService.save(openingHoursWeek);
    }
}
