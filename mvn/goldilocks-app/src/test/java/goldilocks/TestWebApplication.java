package goldilocks;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.orm.jpa.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@EnableAutoConfiguration
@Configuration
@ComponentScan
@EntityScan(basePackages = { "goldilocks.domain" })
@EnableWebMvc
@EnableWebMvcSecurity
@EnableJpaRepositories
@EnableTransactionManagement
public class TestWebApplication {

}