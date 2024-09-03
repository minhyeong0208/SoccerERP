package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Game;
import acorn.repository.GameRepository;

import java.util.Optional;

@Service
public class GameService {

    private final GameRepository gameRepository;

    @Autowired
    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // 모든 경기 조회 (페이징 처리)
    public Page<Game> getAllGames(Pageable pageable) {
        return gameRepository.findAll(pageable);
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
}
