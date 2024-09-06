package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import acorn.entity.Login;
import acorn.repository.LoginRepository;

@Service
public class LoginService {

	@Autowired
	private LoginRepository loginRepository;
	
	public Login addUser(Login login) {
		return loginRepository.save(login);
	}
}
