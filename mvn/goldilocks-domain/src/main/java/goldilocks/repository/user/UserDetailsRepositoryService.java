package goldilocks.repository.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import goldilocks.domain.user.User;

@Service
public class UserDetailsRepositoryService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findOne(username);
		if (user != null) {
			UserDetailsImpl userDetails = new UserDetailsImpl(user);
			return userDetails;
		}
		throw new UsernameNotFoundException("user " + username + " not found");
	}

}
