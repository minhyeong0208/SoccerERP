package acorn.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import acorn.entity.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Integer> {
    
    // 페이징 처리를 위한 메서드, ability와 함께 가져오기
    @Query(value = "SELECT p FROM Person p LEFT JOIN FETCH p.ability",
           countQuery = "SELECT count(p) FROM Person p")
    Page<Person> findAllWithAbility(Pageable pageable);
    
    // 모든 사람 조회 (능력치 포함, 페이징 없이)
    @Query("SELECT p FROM Person p LEFT JOIN FETCH p.ability")
    List<Person> findAllWithAbility(); 
}
