package goldilocks.app.web.service.staff;

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

import goldilocks.domain.staff.Staff;
import goldilocks.repository.staff.StaffRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.text.TextUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class StaffService {

    private static final String[] DEFAULT_SORT_ORDER = new String[] { "name", "id" };

    @Autowired
    private StaffRepository staffRepository;

    @Transactional
    @RequestMapping(value = "/service/staff/create", method = RequestMethod.POST)
    public Staff create(@RequestBody Staff service) {
        return update(service);
    }

    public Sort createSort(String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        return sort;
    }

    @RequestMapping("/service/staff/search/findAll")
    public Page<Staff> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = createSort(sortField);
        Page<Staff> page = staffRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        return page;
    }

    @RequestMapping("/service/staff/search/findById")
    public Staff findById(@RequestParam(value = "id", required = true) Long id) {
        Staff entity = staffRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/staff/search/findByName")
    public Page<Staff> findByName(@RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = createSort(sortField);

        Page<Staff> page;
        if (name == null) {
            page = staffRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        } else {
            name = TextUtil.like(name);
            page = staffRepository.findByNameIgnoreCaseLike(name, new PageRequest(pageNumber, pageSize, sort));
        }
        return page;
    }

    @Transactional
    @RequestMapping("/service/staff/remove")
    public void remove(@RequestParam(value = "id") Long id) {
        staffRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/staff/update", method = RequestMethod.POST)
    public Staff update(@RequestBody Staff service) {
        return staffRepository.save(service);
    }
}
