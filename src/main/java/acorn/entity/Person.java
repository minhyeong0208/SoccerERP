package acorn.entity;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @OneToOne(mappedBy = "person", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Ability ability;
    
    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Injury> injuries;  // Injury와의 관계 설정

}
