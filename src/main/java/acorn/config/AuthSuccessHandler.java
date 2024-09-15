package acorn.config;

import java.io.IOException;

import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class AuthSuccessHandler implements AuthenticationSuccessHandler {

	@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

		String redirectUrl = "/";

        // 사용자 권한에 따라 리다이렉트할 URL 설정
        if (authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"))) {
            redirectUrl = "/dashboard";
        } else if (authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_USER"))) {
            redirectUrl = "/dashboard";
        }

        response.sendRedirect(redirectUrl);
    }
}
