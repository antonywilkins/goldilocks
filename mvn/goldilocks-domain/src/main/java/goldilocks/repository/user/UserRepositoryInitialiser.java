package goldilocks.repository.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import goldilocks.domain.user.User;

@Component
@Order(2000)
public class UserRepositoryInitialiser implements CommandLineRunner {

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserRepository userRepository;

	@Override
	public void run(String... args) throws Exception {
		User superuser = userRepository.findBySuperuserIsTrue();
		if (superuser == null) {
			superuser = userRepository.findOne("admin");
			if (superuser == null) {
				superuser = new User("admin", passwordEncoder.encode("password"), "Super User", false);
			}
			superuser.setSuperuser(true);
			userRepository.save(superuser);
		}
	}

}
