package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import acorn.entity.Injury;

@Repository
public interface InjuryRepository extends JpaRepository<Injury, Integer> {
    // 기본적인 CRUD 메서드와 페이징 지원 메서드 포함
}
