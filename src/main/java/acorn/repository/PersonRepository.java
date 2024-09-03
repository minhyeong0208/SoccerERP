package acorn.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import acorn.entity.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Integer> {
    Page<Person> findAll(Pageable pageable); // 페이징 처리를 위한 메서드
}
