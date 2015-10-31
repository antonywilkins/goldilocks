package goldilocks.domain.appointment;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

import javax.validation.ConstraintViolationException;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import goldilocks.TestApplication;
import goldilocks.repository.appointment.ClientAppointmentRepository;
import goldilocks.repository.client.ClientRepository;
import goldilocks.repository.product.ServiceRepository;
import goldilocks.repository.staff.StaffRepository;
import goldilocks.util.domain.DateUtil;
import goldilocks.util.domain.SortUtil;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = TestApplication.class)
public class ClientAppointmentRepositoryTest {

	@Autowired
	private ClientAppointmentRepository repository;

	@Autowired
	private ServiceRepository serviceRepository;

	@Autowired
	private StaffRepository staffRepository;

	@Autowired
	private ClientRepository clientRepository;

	public ClientAppointment newAppointment() {
		ClientAppointment app = new ClientAppointment();
		ServiceBooking serviceBooking = new ServiceBooking();
		serviceBooking.setService(serviceRepository.findAll().get(0));
		app.addService(serviceBooking, 0);
		app.setClient(clientRepository.findAll().get(0));
		serviceBooking.setStaff(staffRepository.findAll().get(0));
		app.setStart(DateUtil.withTime(LocalDate.now(), 11, 00));
		serviceBooking.setDuration(Duration.ofMinutes(30));
		return app;
	}

	@Test(expected = ConstraintViolationException.class)
	public void testConstraint_ServiceBookingServiceNotNullIfStaffPopulated() {
		ClientAppointment app = newAppointment();
		app.getServices().get(0).setService(null);
		repository.save(app);
	}

	@Test(expected = ConstraintViolationException.class)
	public void testConstraint_ServiceBookingStaffNotNullIfServicePopulated() {
		ClientAppointment app = newAppointment();
		app.getServices().get(0).setStaff(null);
		repository.save(app);
	}

	@Test
	public void testFinders() throws Exception {
		List<ClientAppointment> results = repository.findAll();
		Assert.assertEquals("findAll", 30, results.size());

		results = repository.findByStartBetween(DateUtil.withTime(LocalDate.now(), 0, 0),
				DateUtil.withTime(LocalDate.now().plusDays(1L), 0, 0),
				SortUtil.createSort("start", new String[] { "start", "client" }));
		Assert.assertEquals("findByStartBetween", 6, results.size());
	}

}
