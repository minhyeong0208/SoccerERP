package acorn.controller;

import java.util.Arrays;
import java.util.List;

import acorn.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	
	@Autowired
    private GameService gameService;

    @GetMapping("/login")
    public String login() {
        return "layout/login"; // 로그인 페이지 (login.html)
    }
    
    @GetMapping("/finance")
    public String adminFinance() {
    	return "layout/finance";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
    	return "layout/dashboard";
    }
    
    @GetMapping("/game")
    public String gameList(Model model) {
        // 게임 구분 문자열을 메소드 내부에 정의
        String gameTypeStr = "전체,리그,토너먼트";

        /* 경기 수 */
        model.addAttribute("matchCount", gameService.getTotalGames());
        /* 승패 마진 */
        model.addAttribute("winLossMargin", gameService.getWinLossMargin());
        /* 팀 득점 */
        model.addAttribute("teamScore", gameService.getTotalGoals());
        /* 팀 실점 (새로 추가) */
        model.addAttribute("teamConcede", gameService.getTotalConcede());

        /* 게임 구분 */
        List<String> gameType = Arrays.asList(gameTypeStr.split(","));
        model.addAttribute("gameType", gameType);
        /* 최근 1경기 */
        model.addAttribute("mostRecentGame", gameService.getMostRecentGame());

        // 해당 뷰로 이동
        return "layout/games";
    }

    @GetMapping("/schedule")
    public String schedule(){
        return "layout/schedule";
    }

    @GetMapping("/train")
    public String train(){
        return "layout/train";
    }

}
