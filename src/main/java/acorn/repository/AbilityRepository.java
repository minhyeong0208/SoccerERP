package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import acorn.entity.Ability;

@Repository
public interface AbilityRepository extends JpaRepository<Ability, Integer> {
    // 기본적인 CRUD 메서드 포함
}
