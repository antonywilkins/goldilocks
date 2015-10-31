package goldilocks.app.web.service.user;

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

import goldilocks.domain.appconfig.ApplicationConfig;
import goldilocks.domain.user.User;
import goldilocks.repository.appconfig.ApplicationConfigRepository;
import goldilocks.repository.user.UserRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.text.TextUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class UserService {

    private static final String[] DEFAULT_SORT_ORDER = new String[] { "name", "id" };

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationConfigRepository configRepository;

    @Transactional
    @RequestMapping(value = "/service/user/create", method = RequestMethod.POST)
    public User create(@RequestBody User user) {
        return update(user);
    }

    @RequestMapping("/service/user/search/findAll")
    public Page<User> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        Page<User> page = userRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        return page;
    }

    @RequestMapping("/service/user/search/findById")
    public User findById(@RequestParam(value = "id", required = true) String id) {
        User entity = userRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/user/search/findByIdOrName")
    public Page<User> findByIdOrName(@RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);

        Page<User> page;
        if (name == null) {
            page = userRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        } else {
            name = TextUtil.like(name);
            page = userRepository.findByIdIgnoreCaseLikeOrNameIgnoreCaseLike(name, name, new PageRequest(pageNumber, pageSize, sort));
        }
        return page;
    }

    @Transactional
    @RequestMapping("/service/user/remove")
    public void remove(@RequestParam(value = "id") String id) {
        ApplicationConfig config = configRepository.findByUserId(id);
        if (config != null) {
            configRepository.delete(config);
        }
        userRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/user/update", method = RequestMethod.POST)
    public User update(@RequestBody User user) {
        return userRepository.save(user);
    }
}
