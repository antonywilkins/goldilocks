package goldilocks.domain.user;

import java.util.HashSet;
import java.util.Set;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import goldilocks.TestApplication;
import goldilocks.repository.role.RoleRepository;
import goldilocks.repository.user.UserRepository;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = TestApplication.class)
public class UserRepositoryTest {

	@Autowired
	private UserRepository repository;

	@Autowired
	private RoleRepository roleRepository;

	@Test(expected = DataIntegrityViolationException.class)
	public void testOnlyOneSuperuser() {
		User user = new User("test", "test", "test", false);
		user.setSuperuser(true);
		repository.save(user);
	}

	@Test
	@Transactional
	public void testSuperuserHasAllRoles() {
		User superuser = repository.getOne("admin");
		Set<Role> allRoles = new HashSet<>(roleRepository.findAll());
		Set<Role> userRoles = superuser.getRoles();
		Assert.assertEquals("super user must contain all roles", allRoles, userRoles);
	}

}
