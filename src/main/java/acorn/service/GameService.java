package acorn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import acorn.entity.Game;
import acorn.repository.GameRepository;

@Service
public class GameService {

    private final GameRepository gameRepository;

    @Autowired
    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // 모든 경기 조회(일정에 추가)
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    // 모든 경기 조회 (페이징 처리)
    public Page<Game> getAllGames(Pageable pageable) {
        return gameRepository.findAll(pageable);
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
    public void deleteGame(int gameIdx) {
        gameRepository.deleteById(gameIdx);
    }


    // 추가
    // 페이징을 적용한 서비스 로직
    public Page<Game> getGames(Pageable pageable) {
        return gameRepository.findAll(pageable);
    }

    // 추가: 승패 마진 계산
    public int calculateWinLossMargin() {
        List<Game> allGames = gameRepository.findAll();
        int wins = 0;
        int losses = 0;
        for (Game game : allGames) {
            if (game.getGoal() > game.getConcede()) {
                wins++;
            } else if (game.getGoal() < game.getConcede()) {
                losses++;
            }
        }
        return wins - losses;
    }

    // 추가: 총 득점 계산
    public int calculateTotalScore() {
        List<Game> allGames = gameRepository.findAll();
        return allGames.stream().mapToInt(Game::getGoal).sum();
    }

    public List<Game> getRecentGames(int count) {
        PageRequest pageRequest = PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "gameDate"));
        return gameRepository.findAll(pageRequest).getContent();
    }
}
