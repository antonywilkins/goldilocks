package org.thymeleaf.spring.support;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.util.Assert;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

public class ThymeleafLayoutInterceptor extends HandlerInterceptorAdapter {

	private static final String DEFAULT_LAYOUT = "layouts/default";
	private static final String DEFAULT_VIEW_ATTRIBUTE_NAME = "view";

	private String defaultLayout = DEFAULT_LAYOUT;
	private String viewAttributeName = DEFAULT_VIEW_ATTRIBUTE_NAME;

	private String getLayoutName(Object handler) {
		if (handler instanceof HandlerMethod) {
			HandlerMethod handlerMethod = (HandlerMethod) handler;
			Layout layout = getMethodOrTypeAnnotation(handlerMethod);
			if (layout == null) {
				return this.defaultLayout;
			} else {
				return layout.value();
			}
		}
		return null;
	}

	private Layout getMethodOrTypeAnnotation(HandlerMethod handlerMethod) {
		Layout layout = handlerMethod.getMethodAnnotation(Layout.class);
		if (layout == null) {
			return handlerMethod.getBeanType().getAnnotation(Layout.class);
		}
		return layout;
	}

	private boolean isRedirectOrForward(String viewName) {
		return viewName.startsWith("redirect:")
				|| viewName.startsWith("forward:");
	}

	@Override
	public void postHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		if (modelAndView == null || !modelAndView.hasView()) {
			return;
		}

		String originalViewName = modelAndView.getViewName();
		if (isRedirectOrForward(originalViewName)) {
			return;
		}
		String layoutName = getLayoutName(handler);
		if (layoutName != null) {
			modelAndView.setViewName(layoutName);
			modelAndView.addObject(this.viewAttributeName, originalViewName);
		}
	}

	public void setDefaultLayout(String defaultLayout) {
		Assert.hasLength(defaultLayout);
		this.defaultLayout = defaultLayout;
	}

	public void setViewAttributeName(String viewAttributeName) {
		Assert.hasLength(defaultLayout);
		this.viewAttributeName = viewAttributeName;
	}
}