package goldilocks.util.web;

import org.apache.commons.lang3.exception.ExceptionUtils;

final class GenericClientException extends RuntimeException implements ClientException {

    private static final long serialVersionUID = -2961366309897992305L;
    private final String messageId;

    private final int status;

    public GenericClientException(String messageId, int status) {
        super(messageId);
        this.messageId = messageId;
        this.status = status;
    }

    public GenericClientException(String message, String messageId, int status) {
        super(message);
        this.messageId = messageId;
        this.status = status;
    }

    public GenericClientException(String message, Throwable cause, String messageId, int status) {
        super(message, cause);
        this.messageId = messageId;
        this.status = status;
    }

    public GenericClientException(Throwable cause, String messageId, int status) {
        super(messageId, cause);
        this.messageId = messageId;
        this.status = status;
    }

    public String getExceptionType() {
        Throwable root = ExceptionUtils.getRootCause(this);
        if (root == null) {
            root = this;
        }
        return root.getClass().getName();
    }

    @Override
    public String getMessageId() {
        return messageId;
    }

    @Override
    public int getStatus() {
        return status;
    }

    @Override
    public String toString() {
        return String.format("%s [status=%s, messageId=%s, exceptionType=%s, message=%s]", getClass().getSimpleName(), getStatus(),
                getMessageId(), getExceptionType(), getMessage());
    }

}
