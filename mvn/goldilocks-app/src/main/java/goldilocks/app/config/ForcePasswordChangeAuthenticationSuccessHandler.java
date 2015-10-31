package goldilocks.app.config;

import goldilocks.domain.user.User;
import goldilocks.repository.user.AuthenticationService;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

public class ForcePasswordChangeAuthenticationSuccessHandler extends
		SavedRequestAwareAuthenticationSuccessHandler {

	private AuthenticationService authService;
	private String passwordChangeUrl = "/web/account#/change-password";

	public ForcePasswordChangeAuthenticationSuccessHandler(
			AuthenticationService authService) {
		this.authService = authService;
	}

	public String getPasswordChangeUrl() {
		return passwordChangeUrl;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {

		User user = authService.getUserDetails(authentication);
		if (user.isResetPassword()) {
			getRedirectStrategy().sendRedirect(request, response,
					getPasswordChangeUrl());
			return;
		}

		super.onAuthenticationSuccess(request, response, authentication);
	}

	public void setPasswordChangeUrl(String passwordChangeUrl) {
		this.passwordChangeUrl = passwordChangeUrl;
	}

}
