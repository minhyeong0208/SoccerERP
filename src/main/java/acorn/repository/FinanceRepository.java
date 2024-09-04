package acorn.repository;

import java.sql.Date;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import acorn.entity.Finance;


public interface FinanceRepository extends JpaRepository<Finance, Integer> {
	
    // FinanceType & 기간별 조회
    @Query("SELECT f FROM Finance f WHERE (:type IS NULL OR f.financeType = :type) " +
            "AND (:startDate IS NULL OR f.financeDate >= :startDate) " +
            "AND (:endDate IS NULL OR f.financeDate <= :endDate)")
    Page<Finance> findByTypeAndDate(@Param("type") String type, @Param("startDate") Date startDate, @Param("endDate") Date endDate,Pageable pageable);
}
