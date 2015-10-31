package goldilocks.repository.role;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import goldilocks.domain.user.Role;

@Component
@Order(1000)
public class RoleRepositoryInitialiser implements CommandLineRunner {

	@Autowired
	private RoleRepository roleRepository;

	@Override
	public void run(String... args) throws Exception {
		List<Role> roles = Arrays.asList(new Role("ROLE_USER", "User"),
				new Role("ROLE_SYSTEM_ADMIN", "System Administration"),
				new Role("ROLE_USER_ADMIN", "User Administration"), new Role("ROLE_PRODUCT_ADMIN", "Product Editor"),
				new Role("ROLE_SERVICE_ADMIN", "Service Editor"), new Role("ROLE_STAFF_ADMIN", "Staff Administration"));

		for (Role role : roles) {
			if (roleRepository.findOne(role.getId()) == null) {
				roleRepository.save(role);
			}
		}
	}

}
