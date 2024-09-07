package acorn.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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

    // 새로운 경기 추가
    public Game addGame(Game game) {
        return gameRepository.save(game);
    }

    // 경기 업데이트
    public Game updateGame(int gameIdx, Game gameDetails) {
        Game game = getGameById(gameIdx);
        if (game != null) {
            game.setGameName(gameDetails.getGameName());
            game.setGameDate(gameDetails.getGameDate());
            game.setStadium(gameDetails.getStadium());
            game.setGoal(gameDetails.getGoal());
            game.setConcede(gameDetails.getConcede());
            game.setOpponent(gameDetails.getOpponent());
            game.setGameType(gameDetails.getGameType());
            game.setIsHome(gameDetails.getIsHome());
            return gameRepository.save(game);
        }
        return null;
    }

    // 경기 삭제
    public void deleteGame(List<Integer> ids) {
        gameRepository.deleteAllByIdInBatch(ids);
    }
}
