package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import acorn.entity.Train;

@Repository
public interface TrainRepository extends JpaRepository<Train, Integer> {
    // 페이징과 정렬을 포함한 기본 CRUD 메서드가 자동으로 제공됩니다.
}
