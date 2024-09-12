package acorn.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import acorn.user.dto.GameDto;
import acorn.user.service.GameService;

@RestController
public class GameController {

	@Autowired
	private GameService gameService;
	
	/*
	@GetMapping("/games")
	public List<GameDto> getAllGames() {
		return gameService.getAllGames();	
	}
	*/
	
	@GetMapping("/games")
	public Page<GameDto> getAllGames(
	        @RequestParam(name = "page", defaultValue = "0") int page,
	        @RequestParam(name = "size", defaultValue = "10") int size) {

	    Pageable pageable = PageRequest.of(page, size);
	    return gameService.getAllGames(pageable);
	}
	/*
	@PostMapping("/games")
	public Map<String, Object> insertGame(@RequestBody GameDto dto) {
		
		Map<String, Object> response = new HashMap<>();
		
		try {
			
			gameService.insertGame(dto);
			
			response.put("status", "success");
			response.put("message", "Game data added successfully");
		} catch (Exception e) {
			response.put("status", "err");
			response.put("message", "Failed to add game data: " + e.getMessage());
		}
		return response;
	}
	*/
	
	@PostMapping("/games")
	public Map<String, Object> insertGame(@RequestBody GameDto dto) {

	    Map<String, Object> response = new HashMap<>();

	    try {
	        gameService.insertGame(dto);
	        response.put("status", "success");
	        response.put("message", "Game data added successfully");
	    } catch (Exception e) {
	        response.put("status", "error");
	        response.put("message", "Failed to add game data: " + e.getMessage());
	    }
	    return response;
	}
	
	@PutMapping("/games/{id}")
	public Map<String, Object> updateGame(@PathVariable("id")int id, @RequestBody GameDto dto) {
		Map<String, Object> response = new HashMap<>();
		
		try {
			gameService.updateGame(id, dto);
			
			response.put("status", "success");
			response.put("message", "Game data updated successfully");
		} catch (Exception e) {
			response.put("status", "error");
			response.put("message", "Failed to update game data: " + e.getMessage());
		}
		return response;
	}
	
	@DeleteMapping("/games/{id}")
	public Map<String, Object> deleteGame(@PathVariable("id")int id) {
		Map<String, Object> response = new HashMap<>();
		
		try {
	        // 선수 데이터를 삭제
	        gameService.deleteGame(id);

	        response.put("status", "success");
	        response.put("message", "Game data deleted successfully");
	    } catch (Exception e) {
	        response.put("status", "error");
	        response.put("message", "Failed to delete game data: " + e.getMessage());
	    }
		
		return response;
	}
	
}