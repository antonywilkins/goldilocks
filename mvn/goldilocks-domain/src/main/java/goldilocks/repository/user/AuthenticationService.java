package goldilocks.repository.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import goldilocks.domain.user.User;

@Service
public class AuthenticationService {

	public User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return getUserDetails(authentication);
	}

	public User getUserDetails(Authentication authentication) {
		if (authentication != null) {
			Object principal = authentication.getPrincipal();
			if (principal != null && principal instanceof UserDetailsImpl) {
				UserDetailsImpl user = (UserDetailsImpl) principal;
				return user.getUser();
			}
		}
		return null;
	}
}
