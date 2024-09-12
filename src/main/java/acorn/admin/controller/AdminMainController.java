package acorn.admin.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminMainController {
	@GetMapping("/admin")
	public String nav() {
		return "/admin/nav";
	}
}
