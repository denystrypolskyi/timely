package io.github.denystrypolskyi.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
    private String frontendUrl;
    private String oauth2RedirectUrl;
    private boolean oauth2Enabled;
    private boolean registrationEnabled;
}
