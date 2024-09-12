package acorn.user.dto;

import java.util.Date;

import acorn.user.entity.Game;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameDto {
	
	private int game_id;
	private String team_id;
	private String game_type;
	private int game_goal;
	private int game_concede;
	private String game_team;
	private Date game_date;
	private String game_stadium;
	private String game_result;
	
	public static GameDto toDto(Game game) {
		return GameDto.builder()
						.game_id(game.getGameId())
						.team_id(game.getTeamId())
						.game_type(game.getGameType())
						.game_goal(game.getGameGoal())
						.game_concede(game.getGameConcede())
						.game_team(game.getGameTeam())
						.game_date(game.getGameDate())
						.game_stadium(game.getGameStadium())
						.game_result(game.getGameResult())
						.build();
	}
}
