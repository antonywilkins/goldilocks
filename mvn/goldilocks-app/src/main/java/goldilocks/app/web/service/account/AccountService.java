package goldilocks.app.web.service.account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.user.User;
import goldilocks.repository.user.AuthenticationService;
import goldilocks.repository.user.UserRepository;
import goldilocks.util.web.ServiceRequestPayloadRequiredException;

@RestController
public class AccountService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    @RequestMapping(value = "/service/account/changePassword", method = RequestMethod.POST)
    public User changePassword(@RequestBody PasswordChange passwordChange) {
        User user = userRepository.findOne(authService.getCurrentUser().getId());

        if (passwordChange == null) {
            throw new ServiceRequestPayloadRequiredException();
        }
        if (passwordChange.getExistingPassword() == null || passwordChange.getExistingPassword().trim().isEmpty()) {
            throw new ExistingPasswordRequiredException();
        }

        if (passwordChange.getNewPassword() == null || passwordChange.getNewPassword().trim().isEmpty()) {
            throw new NewPasswordRequiredException();
        }

        boolean matchesExisting = passwordEncoder.matches(passwordChange.getExistingPassword(), user.password());
        if (!matchesExisting) {
            throw new InvalidCredentialsException();
        }

        boolean newMatchesExisting = passwordEncoder.matches(passwordChange.getNewPassword(), user.password());
        if (newMatchesExisting || passwordChange.getNewPassword().length() < 6
                || passwordChange.getNewPassword().toLowerCase().contains(user.getId().toLowerCase())
                || passwordChange.getNewPassword().toLowerCase().contains("password")) {
            throw new PasswordPolicyViolatedException();
        }

        String encodedNewPassword = passwordEncoder.encode(passwordChange.getNewPassword());
        user.setPassword(encodedNewPassword);
        user.setResetPassword(false);
        return userRepository.save(user);
    }

}
