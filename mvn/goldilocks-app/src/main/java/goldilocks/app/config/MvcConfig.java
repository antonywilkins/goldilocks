package goldilocks.app.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.context.embedded.ErrorPage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.thymeleaf.spring.support.ThymeleafLayoutInterceptor;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import goldilocks.app.web.controller.ControllerCommonModelInterceptor;

@Configuration
public class MvcConfig extends WebMvcConfigurerAdapter {
    private static final int CACHE_PERIOD_SECONDS = 60 * 60;

    private static final String[] CLASSPATH_RESOURCE_LOCATIONS = { "classpath:/META-INF/resources/", "classpath:/resources/",
            "classpath:/static/", "classpath:/public/" };

    @Autowired
    private ControllerCommonModelInterceptor modelInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ThymeleafLayoutInterceptor());
        registry.addWebRequestInterceptor(modelInterceptor);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // static content with caching
        registry.addResourceHandler("/**").addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS).setCachePeriod(CACHE_PERIOD_SECONDS)
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // set controllers for simple views
        registry.addViewController("/login").setViewName("login");
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
        // LocalDateSerialiser
        builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        builder.featuresToEnable(MapperFeature.DEFAULT_VIEW_INCLUSION);

        ObjectMapper objectMapper = builder.build();
        converters.add(new MappingJackson2HttpMessageConverter(objectMapper));
    }

    @Bean
    public EmbeddedServletContainerCustomizer containerCustomizer() {
        return new EmbeddedServletContainerCustomizer() {
            @Override
            public void customize(ConfigurableEmbeddedServletContainer container) {

                String errorsPath = "/errors";
                container.addErrorPages(new ErrorPage(HttpStatus.UNAUTHORIZED, errorsPath), new ErrorPage(HttpStatus.FORBIDDEN, errorsPath),
                        new ErrorPage(HttpStatus.NOT_FOUND, errorsPath), new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR, errorsPath));
            }
        };
    }

}