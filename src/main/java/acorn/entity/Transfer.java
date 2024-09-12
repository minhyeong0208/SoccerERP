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
public class Transfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int transferIdx;

    // 추가: Person 엔티티와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_idx")
    private Person person;

    private int transferType;

    @Column(name = "trading_date")
    private Date tradingDate;

    private String opponent;
    private String transferMemo;
    private int price;
}
