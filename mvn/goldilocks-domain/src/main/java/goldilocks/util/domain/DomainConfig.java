
package goldilocks.util.domain;

import java.util.Properties;

import javax.validation.ValidatorFactory;

import org.hibernate.cfg.beanvalidation.BeanValidationEventListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
public class DomainConfig {

	// extension means that I can register this instance over the standard one.
	// This one supports injection into ConstraintValidators
	@SuppressWarnings("serial")
	public final class BeanValidationEventListenerExtension extends BeanValidationEventListener {
		private BeanValidationEventListenerExtension(ValidatorFactory factory, Properties properties) {
			super(factory, properties);
		}
	}

	private LocalValidatorFactoryBean validator;
	private BeanValidationEventListenerExtension validationEventListener;

	@Bean
	public BeanValidationEventListenerExtension eventListener() {
		if (validationEventListener == null) {
			Properties properties = new Properties();
			validationEventListener = new BeanValidationEventListenerExtension(validator(), properties);
		}
		return validationEventListener;
	};

	@Bean
	public PasswordEncoder passwordEncoder() {
		PasswordEncoder encoder = new BCryptPasswordEncoder();
		return encoder;
	}

	@Bean
	public LocalValidatorFactoryBean validator() {
		if (validator == null) {
			validator = new LocalValidatorFactoryBean();
		}
		return validator;
	}
}
