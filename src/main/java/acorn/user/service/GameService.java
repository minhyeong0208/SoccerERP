package acorn.user.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import acorn.user.dto.GameDto;
import acorn.user.entity.Game;
import acorn.user.repository.GameRepository;
import jakarta.transaction.Transactional;

@Service
public class GameService {

	@Autowired
	private GameRepository gameRepository;
	
	// 모든 경기 데이터 불러오기 
	/*
	public List<GameDto> getAllGames(){
		return gameRepository.findAll().stream().map(GameDto::toDto).toList();	
	}
	*/

	// 모든 경기 데이터 불러오기 (페이징 처리)
	public Page<GameDto> getAllGames(Pageable pageable){
		return gameRepository.findAll(pageable).map(GameDto::toDto);
	}
	
	// 경기 데이터 추가
	@Transactional
	public Game insertGame(GameDto dto) {
		Game game = Game.toEntity(dto);
		return gameRepository.save(game);
	}
	
	// 경기 데이터 수정	
	@Transactional
	public Game updateGame(int id, GameDto dto) {
	    Game game = gameRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Game not found"));
	    
	    // DTO의 데이터를 엔티티에 반영
	    game.setTeamId(dto.getTeam_id());
	    game.setGameType(dto.getGame_type());
	    game.setGameGoal(dto.getGame_goal());
	    game.setGameConcede(dto.getGame_concede());
	    game.setGameTeam(dto.getGame_team());
	    game.setGameDate(dto.getGame_date());
	    game.setGameStadium(dto.getGame_stadium());
	    game.setGameResult(dto.getGame_result());
	    
	    return gameRepository.save(game);  // 변경된 엔티티를 저장
	}

	// 경기 데이터 삭제 
	@Transactional
	public void deleteGame(int id) throws Exception {
		if(!gameRepository.existsById(id)) {
			throw new RuntimeException("Game with id" + id + "not found");	
		}
		gameRepository.deleteById(id);
	}
}
