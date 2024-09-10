package acorn.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // 역할 구분에 따른 조회 (선수/코치) - 페이징 처리
    @Query("SELECT p FROM Person p WHERE p.typeCode = :typeCode")
    Page<Person> findByTypeCode(@Param("typeCode") String typeCode, Pageable pageable);

    // 이름 또는 포지션으로 검색
    @Query("SELECT p FROM Person p WHERE (:personName IS NULL OR p.personName LIKE %:personName%) "
    	     + "AND (:position IS NULL OR p.position = :position)")
    	Page<Person> searchByPersonNameOrPosition(@Param("personName") String personName, 
    	                                          @Param("position") String position, 
    	                                          Pageable pageable);  // 페이징 지원
   
    // 여러 ID에 해당하는 사람들을 한 번에 삭제
    void deleteAllByIdInBatch(Iterable<Integer> ids);
}
