package acorn.entity;

import java.util.Date;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "game")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int gameIdx;

    private String gameName;
    private Date gameDate;
    private String stadium;
    private int goal;
    private int concede;
    private String opponent;
    private String gameType;
    private int isHome;
}
