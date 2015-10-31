package goldilocks.app.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.thymeleaf.spring.support.Layout;

@Controller
public class ViewController {

    @Layout("layouts/default")
    @RequestMapping("/")
    public String home(Model model) {
        return view("home", model);
    }

    @Layout("layouts/default")
    @RequestMapping("/web/{viewId}")
    public String view(@PathVariable String viewId, Model model) {
        return viewId;
    }

    @Layout("layouts/default")
    @RequestMapping("/web/{viewId}/*")
    public String viewExtraPath(@PathVariable String viewId, Model model) {
        return viewId;
    }
}
