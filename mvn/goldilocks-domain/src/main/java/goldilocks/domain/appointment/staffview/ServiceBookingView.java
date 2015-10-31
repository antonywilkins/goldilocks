package goldilocks.domain.appointment.staffview;

import java.time.Duration;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import goldilocks.domain.appointment.ServiceBooking;
import goldilocks.domain.product.Service;
import goldilocks.domain.staff.Staff;
import goldilocks.util.domain.DelegateDomainObjectView;
import goldilocks.util.domain.DomainObjectReferenceView;
import goldilocks.util.domain.DurationSerializer;

public class ServiceBookingView extends DelegateDomainObjectView<ServiceBooking, Long> {

	public ServiceBookingView(ServiceBooking delegate) {
		super(delegate);
	}

	@JsonProperty
	@JsonSerialize(using = DurationSerializer.class)
	public Duration getDuration() {
		return getDelegate().getDuration();
	}

	@JsonProperty
	public DomainObjectReferenceView<Service, Long> getService() {
		return new DomainObjectReferenceView<>(getDelegate().getService());
	}

	@JsonProperty
	public DomainObjectReferenceView<Staff, Long> getStaff() {
		return new DomainObjectReferenceView<>(getDelegate().getStaff());
	}

}
