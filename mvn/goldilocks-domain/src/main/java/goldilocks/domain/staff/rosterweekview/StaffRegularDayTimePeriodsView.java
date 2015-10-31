package goldilocks.domain.staff.rosterweekview;

import java.time.DayOfWeek;
import java.time.Duration;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffRegularDayTimePeriods;
import goldilocks.util.domain.DelegateDomainObjectView;
import goldilocks.util.domain.DomainObjectReferenceView;
import goldilocks.util.domain.LocalTimePeriod;

public class StaffRegularDayTimePeriodsView extends DelegateDomainObjectView<StaffRegularDayTimePeriods, Long> {

	public StaffRegularDayTimePeriodsView() {
		this(new StaffRegularDayTimePeriods());
	}

	public StaffRegularDayTimePeriodsView(Staff staff, DayOfWeek dayOfWeek) {
		this(new StaffRegularDayTimePeriods(staff, dayOfWeek));
	}

	public StaffRegularDayTimePeriodsView(StaffRegularDayTimePeriods delegate) {
		super(delegate);
	}

	@JsonProperty
	public DayOfWeek getDayOfWeek() {
		return getDelegate().getDayOfWeek();
	}

	@JsonIgnore
	public Duration getDuration() {
		return getDelegate().getDuration();
	}

	@JsonProperty
	public List<LocalTimePeriod> getPeriods() {
		return getDelegate().getPeriods();
	}

	@JsonProperty
	public DomainObjectReferenceView<Staff, Long> getStaff() {
		return new DomainObjectReferenceView<>(getDelegate().getStaff());
	}

}
