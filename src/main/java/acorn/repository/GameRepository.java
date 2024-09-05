package acorn.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import acorn.entity.Game;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    // 기본적인 CRUD 메서드와 페이징 지원 메서드 포함
    Page<Game> findByGameType(String gameType, Pageable pageable);
}
