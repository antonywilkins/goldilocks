package goldilocks.app.web.service.role;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.user.Role;
import goldilocks.repository.role.RoleRepository;
import goldilocks.util.domain.SortUtil;

@RestController
public class RoleService {
	private static final String[] DEFAULT_SORT_ORDER = new String[] { "description", "id" };

	@Autowired
	private RoleRepository roleRepository;

	@RequestMapping("/service/role/search/findAll")
	public List<Role> findAll(@RequestParam(value = "sort", required = false) String sortField) {
		Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
		return roleRepository.findAll(sort);
	}

}
