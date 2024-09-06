package acorn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import acorn.entity.Injury;

@Repository
public interface InjuryRepository extends JpaRepository<Injury, Integer> {

    // 부상 목록을 조회하면서 연관된 선수 정보도 함께 가져오기
    @Query("SELECT i FROM Injury i JOIN FETCH i.person")
    List<Injury> findAllInjuriesWithPerson();
}
