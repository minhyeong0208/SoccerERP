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
@Table(name = "transfer")
public class Transfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int transferIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_idx")
    private Person person;

    private int transferType;
    private Date tradingDate;
    private String opponent;
    private String transferMemo;
    private int price;

    @Transient
    private int personIdx;

    @Transient // DB에 저장하지 않고 임시로 사용
    private String playerName;  // 경기 결과(승, 무, 패)
}
