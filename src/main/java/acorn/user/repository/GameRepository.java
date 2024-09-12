package acorn.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import acorn.user.entity.Game;

public interface GameRepository extends JpaRepository<Game, Integer> {

}
