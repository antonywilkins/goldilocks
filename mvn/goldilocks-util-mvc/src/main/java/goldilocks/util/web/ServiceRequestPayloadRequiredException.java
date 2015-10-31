package goldilocks.util.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "messages.io.exception.requestPayloadRequired")
public class ServiceRequestPayloadRequiredException extends ResponseStatusClientException {

    private static final long serialVersionUID = 1L;

}
