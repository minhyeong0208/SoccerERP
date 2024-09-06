package acorn.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import acorn.entity.Transfer;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Integer> {

    // 선수 이름으로 이적 정보 검색 (페이징 처리 지원)
	// 이적 정보엔 선수 이름 칼럼이 없어서 조인해서 사용
    @Query("SELECT t FROM Transfer t JOIN Person p ON t.personIdx = p.personIdx WHERE p.personName LIKE %:name%")
    Page<Transfer> findByPersonNameContaining(String name, Pageable pageable);
}
