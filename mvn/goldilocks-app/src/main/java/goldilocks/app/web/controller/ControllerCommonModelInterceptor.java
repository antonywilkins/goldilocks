package goldilocks.app.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.ui.ModelMap;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.WebRequestInterceptor;

import goldilocks.app.web.service.appConfig.ApplicationConfigService;
import goldilocks.domain.appconfig.ApplicationConfig;
import goldilocks.domain.user.User;
import goldilocks.repository.user.AuthenticationService;

@Component
public class ControllerCommonModelInterceptor implements WebRequestInterceptor {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private ApplicationConfigService configService;

    private boolean useJsMin;

    @Override
    public void afterCompletion(WebRequest request, Exception ex) throws Exception {
    }

    @Override
    public void postHandle(WebRequest request, ModelMap model) throws Exception {
        if (model == null) {
            return;
        }

        if (model.get("jsMin") == null) {
            model.addAttribute("jsMin", useJsMin ? ".min" : "");
        }

        if (model.get("user") == null) {
            User currentUser = authenticationService.getCurrentUser();
            if (currentUser != null) {
                model.addAttribute("user", currentUser);
            }
        }

        if (model.get("applicationConfig") == null) {
            ApplicationConfig config = configService.findCurrent();
            if (config != null) {
                model.addAttribute("applicationConfig", config.asMap());
            }
        }
    }

    @Override
    public void preHandle(WebRequest request) throws Exception {
    }

}
