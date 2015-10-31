package goldilocks.domain.appointment.staffview;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import goldilocks.domain.appointment.ClientAppointment;
import goldilocks.domain.appointment.ServiceBooking;
import goldilocks.domain.client.Client;
import goldilocks.domain.product.Service;
import goldilocks.domain.staff.Staff;
import goldilocks.util.domain.DomainTypeBase;
import goldilocks.util.domain.InstantPeriod;
import goldilocks.util.domain.LocalDateTimePeriod;
import goldilocks.util.domain.LocalTimePeriod;

public class StaffAppointments extends DomainTypeBase implements Serializable {

	private static final long serialVersionUID = 1L;

	private List<ClientAppointment> clientAppointments;

	private Map<Staff, List<LocalTimePeriod>> staffRosters;

	private LocalDate day;

	public StaffAppointments() {
	}

	public StaffAppointments(List<ClientAppointment> appointments, LocalDate day,
			Map<Staff, List<LocalTimePeriod>> roster) {
		for (ClientAppointment app : appointments) {
			addAppointment(app);
		}
		this.staffRosters = roster;
		this.day = day;
	}

	public Map<Staff, List<LocalTimePeriod>> _getStaffRosters() {
		if (staffRosters == null) {
			staffRosters = new TreeMap<>();
		}
		return staffRosters;
	}

	private void addAppointment(ClientAppointment app) {
		getClientAppointments().add(app);
	}

	private void addServices(ClientAppointment app, Collection<Service> services) {
		for (ServiceBooking serviceBooking : app.getServices()) {
			if (serviceBooking.getService() != null) {
				services.add(serviceBooking.getService());
			}
		}
	}

	private void addStaff(ClientAppointment app, Collection<Staff> staff) {
		for (ServiceBooking service : app.getServices()) {
			if (service.getStaff() != null) {
				staff.add(service.getStaff());
			}
		}
	}

	@JsonIgnore
	public List<ClientAppointment> getClientAppointments() {
		if (clientAppointments == null) {
			clientAppointments = new ArrayList<>();
		}
		return clientAppointments;
	}

	@JsonProperty("clientAppointments")
	public List<ClientAppointmentView> getClientAppointmentViews() {
		List<ClientAppointmentView> result = new ArrayList<>();
		for (ClientAppointment o : getClientAppointments()) {
			result.add(new ClientAppointmentView(o));
		}
		return result;
	}

	@JsonProperty
	public Collection<Client> getClients() {
		Set<Client> clients = new TreeSet<>();
		for (ClientAppointment app : getClientAppointments()) {
			clients.add(app.getClient());
		}
		return clients;
	}

	@JsonProperty
	public Collection<Service> getServices() {
		Set<Service> services = new TreeSet<>();
		for (ClientAppointment app : getClientAppointments()) {
			addServices(app, services);
		}
		return services;
	}

	@JsonProperty
	public Collection<Staff> getStaff() {
		Set<Staff> staff = new TreeSet<>();
		for (ClientAppointment app : getClientAppointments()) {
			addStaff(app, staff);
		}
		for (Staff s : _getStaffRosters().keySet()) {
			staff.add(s);
		}
		return staff;
	}

	public Map<Long, List<InstantPeriod>> getStaffRosters() {
		Map<Long, List<InstantPeriod>> result = new TreeMap<>();
		for (Map.Entry<Staff, List<LocalTimePeriod>> e : _getStaffRosters().entrySet()) {
			List<InstantPeriod> periods = new ArrayList<>();
			for (LocalTimePeriod p : e.getValue()) {
				periods.add(new LocalDateTimePeriod(day, p).toInstantPeriod());
			}
			result.put(e.getKey().getId(), periods);
		}
		return result;
	}

}
