package goldilocks.app.web.controller;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ErrorController {

	@RequestMapping("/errors")
	public String error(HttpServletRequest request, Model model) {

		Integer statusCode = (Integer) request
				.getAttribute("javax.servlet.error.status_code");
		Throwable throwable = (Throwable) request
				.getAttribute("javax.servlet.error.exception");
		String errorMessage = getErrorMessage(statusCode, throwable);

		model.addAttribute("exception", throwable);
		model.addAttribute("errorCode", statusCode);
		model.addAttribute("errorMessage", errorMessage);
		model.addAttribute("datetime", new Date());
		model.addAttribute("url", request.getRequestURL());

		return "error";
	}

	private String getErrorMessage(Integer statusCode, Throwable throwable) {
		String errorMessage = null;
		if (throwable != null) {
			errorMessage = throwable.getMessage();
		} else {
			if (statusCode != null) {
				HttpStatus httpStatus = getHttpStatus(statusCode);
				if (httpStatus != null) {
					errorMessage = httpStatus.getReasonPhrase();
				}
			}
		}
		if (errorMessage == null) {
			errorMessage = "Unexpected Error";
		}
		return errorMessage;
	}

	private HttpStatus getHttpStatus(Integer statusCode) {
		for (HttpStatus status : HttpStatus.values()) {
			if (status.value() == statusCode) {
				return status;
			}
		}
		return null;
	}
}
