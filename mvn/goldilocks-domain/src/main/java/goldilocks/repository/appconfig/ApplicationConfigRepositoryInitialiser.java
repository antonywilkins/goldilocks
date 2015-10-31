package goldilocks.repository.appconfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import goldilocks.domain.appconfig.ApplicationConfig;

@Component
@Order(5000)
public class ApplicationConfigRepositoryInitialiser implements CommandLineRunner {

	@Autowired
	private ApplicationConfigRepository configRepository;

	@Override
	public void run(String... args) throws Exception {

		ApplicationConfig globalConfig = configRepository.findByUserIsNull();
		if (globalConfig == null) {
			globalConfig = new ApplicationConfig();
			globalConfig.setPropertyText("{}");
			configRepository.save(globalConfig);
		}
	}

}
