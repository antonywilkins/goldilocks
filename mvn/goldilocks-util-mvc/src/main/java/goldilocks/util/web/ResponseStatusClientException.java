package goldilocks.util.web;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.web.bind.annotation.ResponseStatus;

public class ResponseStatusClientException extends RuntimeException implements ClientException {

    private static final long serialVersionUID = 1L;

    private final String messageId;

    private final int status;

    public ResponseStatusClientException() {
        super();
        this.messageId = initMessageId();
        this.status = initStatus();
    }

    public ResponseStatusClientException(String message) {
        super(message);
        this.messageId = initMessageId();
        this.status = initStatus();
    }

    public ResponseStatusClientException(String message, Throwable cause) {
        super(message, cause);
        this.messageId = initMessageId();
        this.status = initStatus();
    }

    public ResponseStatusClientException(Throwable cause) {
        super(null, cause);
        this.messageId = initMessageId();
        this.status = initStatus();
    }

    public String getExceptionType() {
        Throwable root = ExceptionUtils.getRootCause(this);
        if (root == null) {
            root = this;
        }
        return root.getClass().getName();
    }

    @Override
    public String getMessage() {
        String message = super.getMessage();
        if (message != null) {
            return message;
        }
        return getMessageId();
    }

    @Override
    public String getMessageId() {
        return messageId;
    }

    private ResponseStatus getResponseStatus() {
        ResponseStatus annotation = getClass().getAnnotation(ResponseStatus.class);
        if (annotation == null) {
            throw new IllegalStateException("type must be annotated with @ResponseStatus");
        }
        return annotation;
    }

    @Override
    public int getStatus() {
        return status;
    }

    private String initMessageId() {
        String reason = getResponseStatus().reason();
        if (reason == null || reason.isEmpty()) {
            String exceptionTypeName = getClass().getSimpleName();
            String suffix = "Exception";
            char firstChar = exceptionTypeName.charAt(0);
            if (!Character.isLowerCase(firstChar)) {
                StringBuilder b = new StringBuilder(exceptionTypeName);
                b.setCharAt(0, Character.toLowerCase(firstChar));
                exceptionTypeName = b.toString();
            }
            if (exceptionTypeName.endsWith(suffix)) {
                exceptionTypeName = exceptionTypeName.substring(0, exceptionTypeName.length() - suffix.length());
            }

            reason = new StringBuilder("messages.io.exception.").append(exceptionTypeName).toString();
        }
        return reason;
    }

    private int initStatus() {
        return getResponseStatus().value().value();
    }

    @Override
    public String toString() {
        return String.format("%s [status=%s, messageId=%s, exceptionType=%s, message=%s]", getClass().getSimpleName(), getStatus(),
                getMessageId(), getExceptionType(), getMessage());
    }
}
