package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Game;
import acorn.service.GameService;

import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // 모든 경기 조회 (페이징 처리)
    @GetMapping
    public Page<Game> getAllGames(Pageable pageable) {
        return gameService.getAllGames(pageable);
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
    public ResponseEntity<String> deleteGame(@PathVariable(value = "id") int gameIdx) {
        gameService.deleteGame(gameIdx);
        return ResponseEntity.ok("Game with ID " + gameIdx + " has been successfully deleted.");
    }

    // 선택된 경기 삭제
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<String> deleteGames(@RequestBody List<Integer> gameIds) {
        gameService.deleteGames(gameIds);
        return ResponseEntity.ok("Games with IDs " + gameIds + " have been successfully deleted.");
    }
}
