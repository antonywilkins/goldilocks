package goldilocks.app.web.service.appointment;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.appointment.ClientAppointment;
import goldilocks.repository.appointment.ClientAppointmentRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class AppointmentService {

    private static final String[] DEFAULT_SORT_ORDER = new String[] { "start", "client" };

    @Autowired
    private ClientAppointmentRepository appointmentRepository;

    @Transactional
    @RequestMapping(value = "/service/appointment/create", method = RequestMethod.POST)
    public ClientAppointment create(@RequestBody ClientAppointment appointment) {
        return update(appointment);
    }

    @RequestMapping("/service/appointment/search/findAll")
    public Page<ClientAppointment> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        Page<ClientAppointment> page = appointmentRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        return page;
    }

    @RequestMapping("/service/appointment/search/findById")
    public ClientAppointment findById(@RequestParam(value = "id", required = true) Long id) {
        ClientAppointment entity = appointmentRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/appointment/search/findByStartBetween")
    public List<ClientAppointment> findByStartBetween(@RequestParam(value = "start", required = false) Instant start,
            @RequestParam(value = "end", required = false) Instant end) {
        Sort sort = SortUtil.createSort(null, DEFAULT_SORT_ORDER);
        List<ClientAppointment> page = appointmentRepository.findByStartBetween(start, end, sort);
        return page;
    }

    @Transactional
    @RequestMapping("/service/appointment/remove")
    public void remove(@RequestParam(value = "id") Long id) {
        appointmentRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/appointment/update", method = RequestMethod.POST)
    public ClientAppointment update(@RequestBody ClientAppointment appointment) {
        return appointmentRepository.save(appointment);
    }
}
