package goldilocks.app.web.service.account;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import goldilocks.util.web.ResponseStatusClientException;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "messages.account.changePassword.invalidCredentials")
public class InvalidCredentialsException extends ResponseStatusClientException {

    private static final long serialVersionUID = 1L;

}
