package goldilocks.app.web.service.keepalive;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class KeepAliveService {

    @RequestMapping(value = "/service/keepAlive")
    public boolean keepAlive() {
        return true;
    }

}
