package goldilocks.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(value = Integer.MAX_VALUE)
public class ApplicationPostStartRunner implements CommandLineRunner {

	@Autowired
	private PopulateTestDatabaseService populateTestDatabaseService;

	@Override
	public void run(String... args) throws Exception {
		populateTestDatabaseService.populate();
	}
}
