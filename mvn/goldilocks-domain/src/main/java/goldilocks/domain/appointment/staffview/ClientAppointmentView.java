package goldilocks.domain.appointment.staffview;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import goldilocks.domain.appointment.CancelReason;
import goldilocks.domain.appointment.ClientAppointment;
import goldilocks.domain.appointment.ServiceBooking;
import goldilocks.domain.client.Client;
import goldilocks.util.domain.DelegateDomainObjectView;
import goldilocks.util.domain.DomainObjectReferenceView;

public class ClientAppointmentView extends DelegateDomainObjectView<ClientAppointment, Long> {

	public ClientAppointmentView(ClientAppointment delegate) {
		super(delegate);
	}

	@JsonProperty
	public Instant getArrivalTime() {
		return getDelegate().getArrivalTime();
	}

	@JsonProperty
	public Instant getCancelledTime() {
		return getDelegate().getCancelledTime();
	}

	@JsonProperty
	public CancelReason getCancelReason() {
		return getDelegate().getCancelReason();
	}

	@JsonProperty
	public DomainObjectReferenceView<Client, Long> getClient() {
		return new DomainObjectReferenceView<>(getDelegate().getClient());
	}

	@JsonProperty
	public List<ServiceBookingView> getServices() {
		List<ServiceBookingView> result = new ArrayList<>();
		for (ServiceBooking o : getDelegate().getServices()) {
			result.add(new ServiceBookingView(o));
		}
		return result;
	}

	@JsonProperty
	public Instant getStart() {
		return getDelegate().getStart();
	}
}
