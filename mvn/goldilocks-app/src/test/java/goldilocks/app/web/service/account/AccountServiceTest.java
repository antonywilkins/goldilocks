package goldilocks.app.web.service.account;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import goldilocks.TestWebApplication;
import goldilocks.repository.user.UserDetailsRepositoryService;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = TestWebApplication.class)
@WebAppConfiguration
public class AccountServiceTest {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserDetailsRepositoryService userDetailsService;

    @Test(expected = PasswordPolicyViolatedException.class)
    public void testPasswordPolicy_containsLiteralPassword() {
        UserDetails user = userDetailsService.loadUserByUsername("admin");
        Authentication authentication = new TestingAuthenticationToken(user, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        PasswordChange passwordChange = new PasswordChange();
        passwordChange.setExistingPassword("p");
        passwordChange.setNewPassword("anotherpassword");
        accountService.changePassword(passwordChange);
    }
}
