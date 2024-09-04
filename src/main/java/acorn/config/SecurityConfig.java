package acorn.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import acorn.entity.Login;
import acorn.repository.LoginRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
    private LoginRepository loginRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
            	.requestMatchers("/").permitAll()
            	.requestMatchers("/admin/**").hasRole("ADMIN") // 관리자만 접근 가능	
            	.requestMatchers("/user/**").hasRole("USER") // 사용자만 접근 가능	
                .anyRequest().authenticated() // 모든 요청에 대해 인증을 요구
            )
            .formLogin(form -> form
                .loginPage("/login") // 커스텀 로그인 페이지 설정
                .successHandler(customAuthenticationSuccessHandler()) // 커스텀 성공 핸들러 사용
                .permitAll() // 로그인 페이지는 누구나 접근 가능
            )
            .logout(logout -> logout
                .permitAll() // 로그아웃은 누구나 접근 가능
            )
            .sessionManagement(session -> session
            	.maximumSessions(10)  // 최대 허용 세션 개수
            	.expiredUrl("/login")
            );
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Login login = loginRepository.findByLoginId(username);
            if (login == null) {
                throw new UsernameNotFoundException("User not found");
            }
            // 비밀번호는 암호화하지 않기 때문에 raw 비밀번호로 User 객체를 생성
            UserBuilder builder = User.withUsername(username)
                .password("{noop}" + login.getPw())
                .roles(login.getRole());

            return builder.build();
        };
    }
    
    @Bean
    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
    	return new AuthSuccessHandler();
    }
}
