package acorn.entity;


import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Finance {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int financeIdx;
	
	private String financeType;
	private Date financeDate;
	private int amount;
	private String trader;
	private String purpose;
	private String financeMemo;
}
