package goldilocks.app.web.service.product;

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

import goldilocks.domain.product.Service;
import goldilocks.repository.product.ServiceRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.text.TextUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class ServiceService {
    private static final String[] DEFAULT_SORT_ORDER = new String[] { "name", "description" };

    @Autowired
    private ServiceRepository serviceRepository;

    @Transactional
    @RequestMapping(value = "/service/service/create", method = RequestMethod.POST)
    public Service create(@RequestBody Service service) {
        return update(service);
    }

    @RequestMapping("/service/service/search/findAll")
    public Page<Service> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        return serviceRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
    }

    @RequestMapping("/service/service/search/findById")
    public Service findById(@RequestParam(value = "id", required = true) Long id) {
        Service entity = serviceRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/service/search/findByText")
    public Page<Service> findByText(@RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);

        Page<Service> page;
        if (text == null) {
            page = serviceRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        } else {
            text = TextUtil.like(text);
            page = serviceRepository.findByNameIgnoreCaseLikeOrDescriptionIgnoreCaseLike(text, text,
                    new PageRequest(pageNumber, pageSize, sort));
        }
        return page;
    }

    @Transactional
    @RequestMapping("/service/service/remove")
    public void remove(@RequestParam(value = "id") Long id) {
        serviceRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/service/update", method = RequestMethod.POST)
    public Service update(@RequestBody Service service) {
        return serviceRepository.save(service);
    }

}
