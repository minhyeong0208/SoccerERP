package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import acorn.entity.Facility;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Integer> {
    // 시설명으로 검색
    List<Facility> findByFacilityNameContaining(String facilityName);
    
    // 여러 시설 삭제
    void deleteAllByIdInBatch(Iterable<Integer> ids);
}
