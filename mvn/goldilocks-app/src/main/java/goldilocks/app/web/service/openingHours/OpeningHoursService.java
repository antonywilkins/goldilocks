package goldilocks.app.web.service.openingHours;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.openingHours.OpeningHoursRegularDayTimePeriods;
import goldilocks.domain.openingHours.weekview.OpeningHoursWeek;
import goldilocks.repository.openingHours.OpeningHoursDayTimePeriodsRepository;

@RestController
public class OpeningHoursService {

    @Autowired
    private OpeningHoursDayTimePeriodsRepository openingHoursPeriodsRepository;

    public OpeningHoursWeek getOpeningHours() {
        List<OpeningHoursRegularDayTimePeriods> openingHours = openingHoursPeriodsRepository.findAll();
        return new OpeningHoursWeek(openingHours);
    }

    public OpeningHoursWeek save(OpeningHoursWeek staffRosterWeek) {
        if (staffRosterWeek == null) {
            return null;
        }

        List<OpeningHoursRegularDayTimePeriods> dayTimePeriods = staffRosterWeek.getDayTimePeriods();
        dayTimePeriods = openingHoursPeriodsRepository.save(dayTimePeriods);

        return new OpeningHoursWeek(dayTimePeriods);
    }
}
