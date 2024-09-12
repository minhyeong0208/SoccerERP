package acorn.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserMainController {
	@GetMapping("/user")
	public String nav() {
		return "user/nav";
	}
	
	@GetMapping("/user/injurylist")
	public String injurylist() {
		return "user/injurylist";
	}
}
