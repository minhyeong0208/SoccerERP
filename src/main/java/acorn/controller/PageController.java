package acorn.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class PageController {
	
    @GetMapping("/login")
    public String login() {
        return "layout/login"; // 로그인 페이지 (login.html)
    }
    
    @GetMapping("/admin/finance")
    public String adminFinance() {
    	return "layout/finance";
    }
}
