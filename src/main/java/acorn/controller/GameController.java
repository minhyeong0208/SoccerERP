package acorn.controller;

import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    private final static String gameTypeStr = "전체,리그,토너먼트,컵";

    @GetMapping("/dashboard")
    public String gameList(Model model) {
        /* 게임 구분 */
        List<String> gameType = Arrays.asList(gameTypeStr.split(","));
        model.addAttribute("gameType", gameType);
        return "games";
    }

    // 모든 경기 조회 (페이징 처리)
    @GetMapping("/list")
    public ResponseEntity<Object> getAllGames(
            @RequestParam(required = false) String gameType,
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
    @PostMapping
    public Game createGame(@RequestBody Game game) {
        return gameService.addGame(game);
    }

    // 경기 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(
            @PathVariable(value = "id") int gameIdx, @RequestBody Game gameDetails) {
        Game updatedGame = gameService.updateGame(gameIdx, gameDetails);
        if (updatedGame == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedGame);
    }

    // 경기 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable(value = "id") int gameIdx) {
        gameService.deleteGame(gameIdx);
        return ResponseEntity.ok().build();
    }

    // 데이터를 페이징으로 가져오도록 설정
    @GetMapping("/page")
    public Page<Game> getGames(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size) {
        return gameService.getGames(PageRequest.of(page, size));
    }

    // 경기 관리 페이지 뷰 반환
    @GetMapping("/manage")
    public String showGames(Model model,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size) {
        Page<Game> gamesPage = gameService.getGames(PageRequest.of(page, size));
        model.addAttribute("matches", gamesPage.getContent());
        model.addAttribute("currentPage", gamesPage.getNumber());
        model.addAttribute("totalPages", gamesPage.getTotalPages());
        model.addAttribute("totalItems", gamesPage.getTotalElements());

        // 추가 통계 데이터
        model.addAttribute("matchCount", gamesPage.getTotalElements());
        model.addAttribute("winLossMargin", gameService.calculateWinLossMargin());
        model.addAttribute("teamScore", gameService.calculateTotalScore());

        // 최근 경기 데이터 추가
        model.addAttribute("recentMatches", gameService.getRecentGames(5)); // 최근 5경기 가져오기

        return "games";
    }
}