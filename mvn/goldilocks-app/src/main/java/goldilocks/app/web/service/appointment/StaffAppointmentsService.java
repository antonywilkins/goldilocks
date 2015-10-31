package goldilocks.app.web.service.appointment;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.app.web.service.staff.RosterService;
import goldilocks.domain.appointment.ClientAppointment;
import goldilocks.domain.appointment.staffview.StaffAppointments;
import goldilocks.domain.staff.Staff;
import goldilocks.util.domain.DateUtil;
import goldilocks.util.domain.LocalTimePeriod;

@RestController
public class StaffAppointmentsService {

	@Autowired
	private AppointmentService appointmentService;

	@Autowired
	private RosterService rosterService;

	@RequestMapping("/service/staffappointments/search/findByDay")
	public StaffAppointments findByDay(
			@RequestParam(value = "day", required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate day) {
		day = day == null ? LocalDate.now() : day;

		LocalDateTime startLocal = day.atTime(0, 0);
		Instant start = DateUtil.toInstant(startLocal);
		LocalDateTime endLocal = startLocal.plusDays(1);
		Instant end = DateUtil.toInstant(endLocal);

		List<ClientAppointment> clientAppointments = appointmentService.findByStartBetween(start, end);

		Map<Staff, List<LocalTimePeriod>> roster = rosterService.findByDay(day);

		return new StaffAppointments(clientAppointments, day, roster);
	}
}
