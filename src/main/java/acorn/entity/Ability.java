package acorn.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Ability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int abilityIdx;

    private int pass;
    private int physical;
    private int shoot;
    private int speed;
    private int dribble; 
    private int defence;

    // Person과의 연관 관계 설정
    @OneToOne
    @JoinColumn(name = "person_idx")
    @JsonBackReference
    @ToString.Exclude  // Lombok toString에서 순환 참조 방지
    private Person person;
}
