package acorn.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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
    
    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
    	return "layout/admin_dashboard";
    }
    
    @GetMapping("/user/dashboard")
    public String userDashboard() {
    	return "layout/user_dashboard";
    }
    
    @GetMapping("/game")
    public String gameList(Model model) {
        // 게임 구분 문자열을 메소드 내부에 정의
        String gameTypeStr = "전체,리그,토너먼트,컵";
        
        // 문자열을 ',' 기준으로 분리하여 리스트로 변환
        List<String> gameType = Arrays.asList(gameTypeStr.split(","));
        
        // gameType 리스트를 모델에 추가하여 뷰에서 사용할 수 있도록 설정
        model.addAttribute("gameType", gameType);
        
        // 해당 뷰로 이동
        return "layout/games";
    }

}
