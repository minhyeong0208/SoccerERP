package acorn.user.entity;

import java.util.Date;

import acorn.user.dto.GameDto;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="game")
public class Game {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int gameId;
	
	private String teamId;
	private String gameType;
	private int gameGoal;
	private int gameConcede;
	private String gameTeam;
	private Date gameDate;
	private String gameStadium;
	private String gameResult;
	
	public static Game toEntity(GameDto dto) {
			return Game.builder()
					.gameId(dto.getGame_id())
					.teamId(dto.getTeam_id())
					.gameType(dto.getGame_type())
					.gameGoal(dto.getGame_goal())
					.gameConcede(dto.getGame_concede())
					.gameTeam(dto.getGame_team())
					.gameDate(dto.getGame_date())
					.gameStadium(dto.getGame_stadium())
					.gameResult(dto.getGame_result())
					.build();
	}
}
