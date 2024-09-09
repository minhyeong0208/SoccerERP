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
        /* 팀 실점 */
        model.addAttribute("teamConcede", gameService.getTotalConcede());

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

    // 경기 추가
    @PostMapping("/add")
    public ResponseEntity<?> addGame(@RequestBody Game game) {
        // 값 검사
        Map<String, String> validErrors = gameService.validGame(game);
        if (!validErrors.isEmpty()) return ResponseEntity.badRequest().body(validErrors);

        try {
            Game savedGame = gameService.saveGame(game);
            return ResponseEntity.ok(savedGame);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("경기 추가 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 경기 수정
    @PostMapping("/edit")
    public ResponseEntity<?> editGame(@RequestBody Game game) {
        // 값 검사
        Map<String, String> validErrors = gameService.validGame(game);
        if (!validErrors.isEmpty()) return ResponseEntity.badRequest().body(validErrors);

        try {
            // 이미 Game 객체에 날짜가 포함되어 있으므로 별도의 변환 과정은 필요 없습니다.
            Game savedGame = gameService.saveGame(game);
            return ResponseEntity.ok(savedGame);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("경기 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
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