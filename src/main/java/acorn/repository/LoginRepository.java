package acorn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import acorn.entity.Login;

public interface LoginRepository extends JpaRepository<Login, Integer>{
	Login findByLoginId(String loginId);
}
