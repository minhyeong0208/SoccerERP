package acorn.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int personIdx;

    private String teamIdx;
    private int facilityIdx;
    private String personName;
    private double height;
    private double weight;
    private Date birth;
    private String position;
    private int backNumber;
    private String nationality;
    private Date contractStart;
    private Date contractEnd;
    private String id;
    private String phone;
    private String gender;
    private String email;
    private String typeCode;
    private String personImage;

    // Ability와의 연관 관계 설정
    @OneToOne(mappedBy = "person", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Ability ability;
}
