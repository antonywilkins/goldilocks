package goldilocks.domain.appconfig;

import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import goldilocks.TestApplication;
import goldilocks.repository.appconfig.ApplicationConfigRepository;
import goldilocks.repository.user.UserRepository;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = TestApplication.class)
public class ApplicationConfigRepositoryTest {

	@Autowired
	private ApplicationConfigRepository repository;

	@Autowired
	private UserRepository userRepository;

	@Test
	public void testFinders() throws Exception {
		List<ApplicationConfig> results = repository.findAll();
		Assert.assertEquals("findAll", 2, results.size());

		ApplicationConfig result = repository.findByUserId("admin");
		Assert.assertNotNull("findByUserId", result);
	}

	@Test(expected = DataIntegrityViolationException.class)
	public void testUniqueNullUser() {
		ApplicationConfig config = new ApplicationConfig();
		config.setPropertyText("{}");
		repository.save(config);
	}

	@Test(expected = DataIntegrityViolationException.class)
	public void testUniqueUser() {
		ApplicationConfig config = new ApplicationConfig(userRepository.findOne("admin"));
		config.setPropertyText("{}");
		repository.save(config);
	}

}
