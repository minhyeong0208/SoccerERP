package acorn.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import acorn.entity.Game;
import acorn.repository.GameRepository;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    // 모든 경기 조회(일정에 추가)
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    // 모든 경기 조회 (페이징 처리)
    public Page<Game> getAllGames(Pageable pageable) {
        Sort sort = Sort.by(Sort.Direction.DESC, "gameDate");
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return gameRepository.findAll(pageable);
    }

    // 경기 횟수
    public long getTotalGames() {
        return gameRepository.countTotalGames();
    }

    // 총 득점
    public int getTotalGoals() {
        return gameRepository.sumTotalGoals();
    }

    // 총 실점
    public int getTotalConcede() {
        return gameRepository.sumTotalConcede();
    }

    // 승패 마진
    public String getWinLossMargin() {
        int margin = gameRepository.calculateWinLossMargin();
        /**
         * margin 값에 부호를 붙여서 return
         *
         * 0보다 높으면 +
         * 0이면 공백
         * 0보다 낮으면 -
         */
        String marginStr = (margin > 0 ? "+" : "") + margin;
        return marginStr;
    }

    // 게임 분류 조회
    public Page<Game> getGamesByType(String gameType, Pageable pageable) {
        return gameRepository.findByGameType(gameType, pageable);
    }

    // 특정 경기 조회
    public Game getGameById(int gameIdx) {
        Optional<Game> game = gameRepository.findById(gameIdx);
        return game.orElse(null);
    }

    public Game getMostRecentGame() {
        Game game = gameRepository.findFirstByGameDateBeforeOrderByGameDateDesc(LocalDateTime.now());
        if (game == null) {
            throw new NoSuchElementException("최근 경기가 없습니다.");
        }
        return game;
    }

    // 게임 저장 전 유효성 검사
    public Map<String, String> validGame(Game game) {
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
        return errors;
    }

    // 경기 추가 및 갱신
    public Game saveGame(Game game) {
        return gameRepository.save(game);
    }

    // 경기 삭제
    public void deleteGame(List<Integer> ids) {
        gameRepository.deleteAllByIdInBatch(ids);
    }
}
