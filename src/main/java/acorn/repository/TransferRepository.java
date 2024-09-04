package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import acorn.entity.Transfer;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Integer> {
    // 기본적인 CRUD 메서드와 페이징 지원 메서드 포함
}
