package goldilocks.app.web.service.appConfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.appconfig.ApplicationConfig;
import goldilocks.domain.user.User;
import goldilocks.repository.appconfig.ApplicationConfigRepository;
import goldilocks.repository.user.AuthenticationService;

@RestController
public class ApplicationConfigService {
	@Autowired
	private AuthenticationService authenticationService;

	@Autowired
	private ApplicationConfigRepository configRepository;

	@Transactional
	@RequestMapping("/service/appconfig/search/findCurrent")
	public ApplicationConfig findCurrent() {
		ApplicationConfig current = new ApplicationConfig();

		ApplicationConfig master = configRepository.findByUserIsNull();
		if (master != null) {
			current.merge(master);
		}

		User user = authenticationService.getCurrentUser();
		if (user != null) {
			String userId = user.getId();
			ApplicationConfig userConfig = configRepository.findByUserId(userId);
			if (userConfig != null) {
				current.merge(userConfig);
			}
		}

		return current;
	}

	@Transactional
	@RequestMapping("/service/appconfig/search/findGlobal")
	public ApplicationConfig findGlobal() {
		ApplicationConfig master = configRepository.findByUserIsNull();
		if (master == null) {
			master = new ApplicationConfig();
			master = configRepository.save(master);
		}
		return master;
	}

	@Transactional
	@RequestMapping(value = "/service/appconfig/update", method = RequestMethod.POST)
	public ApplicationConfig update(@RequestBody ApplicationConfig config) {
		return configRepository.save(config);
	}

}
