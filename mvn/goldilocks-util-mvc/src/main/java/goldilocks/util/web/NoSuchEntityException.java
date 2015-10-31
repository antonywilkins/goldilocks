package goldilocks.util.web;

import java.io.Serializable;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoSuchEntityException extends ResponseStatusClientException {

    private static final long serialVersionUID = 1L;

    private final Serializable id;

    public NoSuchEntityException(Serializable id) {
        this(id, null);
    }

    public NoSuchEntityException(Serializable id, Throwable cause) {
        super(cause);
        this.id = id;
    }

    public Serializable getId() {
        return id;
    }
}
