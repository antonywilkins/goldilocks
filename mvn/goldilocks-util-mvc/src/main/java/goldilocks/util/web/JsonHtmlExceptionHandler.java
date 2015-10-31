package goldilocks.util.web;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class JsonHtmlExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String MESSAGES_IO_INTERNAL_SERVER_ERROR = "messages.io.exception.internalServerError";
    private static Logger log = Logger.getLogger(JsonHtmlExceptionHandler.class.getName());

    private static String[] getHeaderValues(WebRequest request, String... headerNames) {
        List<String> result = new ArrayList<>();
        for (String headerName : headerNames) {
            String[] headerValues = request.getHeaderValues(headerName);
            if (headerValues != null) {
                for (String headerValue : headerValues) {
                    String[] parsed = headerValue.split(",");
                    for (String p : parsed) {
                        result.add(p.trim());
                    }
                }
            }
        }
        String[] values = result.toArray(new String[result.size()]);
        return values;
    }

    private static boolean isJson(String[] headerValues) {
        if (headerValues != null) {
            for (String contentType : headerValues) {
                if (MediaType.APPLICATION_JSON.includes(MediaType.valueOf(contentType))) {
                    return true;
                }
            }
        }
        return false;
    }

    private static boolean isJsonRequest(WebRequest request) {
        String[] headerValues = getHeaderValues(request, "Content-Type", "Accept");
        return isJson(headerValues);
    }

    @ExceptionHandler({ Exception.class })
    protected ResponseEntity<Object> handle(Exception e, WebRequest request) {
        boolean jsonRequest = isJsonRequest(request);

        HttpHeaders headers = new HttpHeaders();

        HttpStatus status = null;
        String messageId = null;
        Throwable body = null;
        if (jsonRequest) {
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (e instanceof ClientException) {
                body = e;
                ClientException clientException = (ClientException) e;
                messageId = clientException.getMessageId();
                try {
                    int statusCode = clientException.getStatus();
                    status = HttpStatus.valueOf(statusCode);
                } catch (IllegalArgumentException ie) {
                    // fallthrough
                }
            }
            ResponseStatus annotation = e.getClass().getAnnotation(ResponseStatus.class);
            if (annotation != null) {
                if (status == null) {
                    status = annotation.value();
                }
                if (messageId == null) {
                    messageId = annotation.reason();
                }
            }
        }

        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        if (messageId == null) {
            messageId = MESSAGES_IO_INTERNAL_SERVER_ERROR;
        }
        if (body == null) {
            body = new GenericClientException(e.getMessage(), e, messageId, status.value());
        }

        log.log(Level.SEVERE, "Exception executing service", e);
        return handleExceptionInternal(e, body, headers, status, request);
    }
}
