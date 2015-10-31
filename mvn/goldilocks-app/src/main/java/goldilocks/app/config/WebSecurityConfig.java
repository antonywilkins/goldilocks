package goldilocks.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;

import goldilocks.repository.user.AuthenticationService;
import goldilocks.repository.user.UserDetailsRepositoryService;

@Configuration
@EnableWebMvcSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsRepositoryService userDetailsService;

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable();
        http.authorizeRequests()
                //
                .antMatchers("/web/users/**", "/service/user/**").hasAuthority("ROLE_USER_ADMIN")
                //
                .antMatchers("/service/product/create/**", "/service/product/update/**").hasAuthority("ROLE_PRODUCT_ADMIN")
                //
                .antMatchers("/service/service/create/**", "/service/service/update/**").hasAuthority("ROLE_SERVICE_ADMIN")
                //
                .antMatchers("/service/staff/create/**", "/service/staff/update/**", "/service/roster/**").hasAuthority("ROLE_STAFF_ADMIN")
                //
                .antMatchers("/service/appconfig/**").hasAuthority("ROLE_SYSTEM_ADMIN")
                //
                .antMatchers("/web/**", "/service/**").hasAuthority("ROLE_USER")
                //
                .antMatchers("/css/**", "/img/**", "/favicon.*", "/js/**", "/partials/common/**", "/partials/login/**",
                        "/templates/common/**")
                .permitAll()
                //
                .anyRequest().authenticated()
                //
                .and().formLogin().loginPage("/login").successHandler(new ForcePasswordChangeAuthenticationSuccessHandler(authService))
                .permitAll()
                //
                .and().logout().permitAll()
                //
                // .and().requiresChannel().anyRequest().requiresSecure()
                //
        ;
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

}