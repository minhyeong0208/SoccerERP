package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Game;
import acorn.service.GameService;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/games")
public class GameController {

    @Autowired
    private GameService gameService;

    private final static String gameTypeStr = "전체,리그,토너먼트";

    @GetMapping("/dashboard")
    public String gameList(Model model) {
        /* 경기 수 */
        model.addAttribute("matchCount", gameService.getTotalGames());
        /* 승패 마진 */
        model.addAttribute("winLossMargin", gameService.getWinLossMargin());
        /* 팀 득점 */
        model.addAttribute("teamScore", gameService.getTotalGoals());
        /* 팀 도움 */
//        model.addAttribute("teamAssists", teamAssists);

        /* 게임 구분 */
        List<String> gameType = Arrays.asList(gameTypeStr.split(","));
        model.addAttribute("gameType", gameType);
        /* 최근 1경기 */
        model.addAttribute("mostRecentGame", gameService.getMostRecentGame());
        return "layout/games";
    }

    // 모든 경기 조회 (페이징 처리)
    @GetMapping("/list")
    public ResponseEntity<Object> getAllGames(
    		@RequestParam(value = "gameType", required = false) String gameType,
            Pageable pageable) {
        Page<Game> gameList;

        // 초기, 전체인 경우 전체 조회를 위한 구성
        if ("null".equals(gameType) || "전체".equals(gameType)) gameType = null;

        if (gameType != null && !gameType.isEmpty())  gameList = gameService.getGamesByType(gameType, pageable);
        else gameList = gameService.getAllGames(pageable);

        return ResponseEntity.ok().body(gameList);
    }

    // 특정 경기 조회
    @GetMapping("/{id}")
    public ResponseEntity<Game> getGameById(@PathVariable(value = "id") int gameIdx) {
        Game game = gameService.getGameById(gameIdx);
        if (game == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(game);
    }

    // 새로운 경기 추가
    @PostMapping("/add")
    public ResponseEntity<?> createGame(@RequestBody Game game) {
        Map<String, String> errors = new HashMap<>();

        // 게임명 검증
        if (game.getGameName() == null || game.getGameName().trim().isEmpty()) {
            errors.put("game_name", "경기명은 필수입니다.");
        }

        // 게임 타입 검증
        if (game.getGameType() == null || game.getGameType().trim().isEmpty()) {
            errors.put("gameType", "대회 유형은 필수입니다.");
        }

        // 상대팀 검증
        if (game.getOpponent() == null || game.getOpponent().trim().isEmpty()) {
            errors.put("opponent", "상대팀은 필수입니다.");
        }

        // 경기 일자 검증
        if (game.getGameDate() == null) {
            errors.put("gameDate", "경기 일자는 필수입니다.");
        }

        // 경기장 검증
        if (game.getStadium() == null || game.getStadium().trim().isEmpty()) {
            errors.put("stadium", "경기장소는 필수입니다.");
        }

        // 득점과 실점 검증 (0 이상의 정수여야 함)
        if (game.getGoal() < 0) {
            errors.put("goal", "득점은 0 이상이어야 합니다.");
        }
        if (game.getConcede() < 0) {
            errors.put("concede", "실점은 0 이상이어야 합니다.");
        }

        // 홈/원정 검증 (0 또는 1이어야 함)
        if (game.getIsHome() != 0 && game.getIsHome() != 1) {
            errors.put("isHome", "홈/원정은 0 또는 1이어야 합니다.");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            Game savedGame = gameService.addGame(game);
            return ResponseEntity.ok(savedGame);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("경기 추가 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 경기 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGame(
            @PathVariable(value = "id") int gameIdx, @RequestBody Game gameDetails) {
        Game updatedGame = gameService.updateGame(gameIdx, gameDetails);
        if (updatedGame == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedGame);
    }

    // 선택된 경기 삭제
    @DeleteMapping
    public ResponseEntity<?> deleteGame(@RequestBody List<Integer> ids) {
        try {
            gameService.deleteGame(ids);
            return ResponseEntity.ok("");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}