package acorn.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import acorn.entity.Person;
import acorn.service.PersonService;

@RestController
@RequestMapping("/persons")
public class PersonController {

	private final PersonService personService;

	@Autowired
	public PersonController(PersonService personService) {
		this.personService = personService;
	}

	// 모든 사람 조회 (페이징 처리)
	@GetMapping
	public Page<Person> getAllPersons(Pageable pageable) {
		return personService.getAllPersons(pageable);
	}

	// 모든 선수 조회 (능력치 포함)
	@GetMapping("/with-ability")
	public List<Person> getAllPersonsWithAbility() {
		return personService.getAllPersonsWithAbility();
	}

	// 선수만 조회 (이적 시 판매용)
	@GetMapping("/players")
	public List<Person> getAllPlayers() {
		return personService.getPersonsByTypeCode("player");
	}

	// 코치만 조회
	@GetMapping("/coaches")
	public List<Person> getAllCoaches() {
		return personService.getPersonsByTypeCode("coach");
	}

	// 특정 사람 조회
	@GetMapping("/{id}")
	public ResponseEntity<Person> getPersonById(@PathVariable(value = "id") int personIdx) {
		Person person = personService.getPersonById(personIdx);
		if (person == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok().body(person);
	}

	// 검색 기능: 이름 또는 포지션으로 검색
	@GetMapping("/search")
	public List<Person> searchPersons(@RequestParam(value = "personName", required = false) String personName,
			@RequestParam(value = "position", required = false) String position) {
		return personService.searchPersons(personName, position);
	}

	// 새로운 사람 추가
	@PostMapping
	public Person createPerson(@RequestBody Person person) {
		return personService.addPerson(person);
	}

	// JSON + 이미지 파일 업로드를 받는 새로운 방식
	@PostMapping("/add-player-with-image")
	public ResponseEntity<Person> createPersonWithImage(
	        @RequestPart("person") Person person, 
	        @RequestPart("file") MultipartFile file) throws IOException {

	    // 이미지 파일 저장 경로 설정
	    String fileName = file.getOriginalFilename();
	    String uploadDir = "C:/Project/SoccerERP/src/main/resources/static/img/persons/";
	    Path filePath = Paths.get(uploadDir + fileName);
	    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

	    // DB에 저장할 경로 설정
	    person.setPersonImage(fileName);

	    // 새로운 사람 추가
	    Person savedPerson = personService.addPerson(person);
	    return ResponseEntity.ok(savedPerson);
	}

	// 사람 업데이트
	@PutMapping("/{id}")
	public ResponseEntity<Person> updatePerson(@PathVariable(value = "id") int personIdx,
			@RequestBody Person personDetails) {
		Person updatedPerson = personService.updatePerson(personIdx, personDetails);
		if (updatedPerson == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(updatedPerson);
	}
	
	@PutMapping("/{id}/with-image")
	public ResponseEntity<Person> updatePersonWithImage(
	    @PathVariable(value = "id") int personIdx,
	    @RequestPart("person") Person personDetails,
	    @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
	    
	    Person existingPerson = personService.getPersonById(personIdx);
	    if (existingPerson == null) {
	        return ResponseEntity.notFound().build();
	    }
	    
	    // 파일이 있는 경우에만 이미지 업데이트
	    if (file != null && !file.isEmpty()) {
	        String fileName = file.getOriginalFilename();
	        String uploadDir = "C:/Project/SoccerERP/src/main/resources/static/img/persons/";
	        Path filePath = Paths.get(uploadDir + fileName);
	        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
	        personDetails.setPersonImage(fileName); // 새로운 이미지 경로 설정
	    } else {
	        // 이미지가 없을 경우 기존 이미지를 유지
	        personDetails.setPersonImage(existingPerson.getPersonImage());
	    }
	    
	    // 기타 정보 업데이트
	    Person updatedPerson = personService.updatePerson(personIdx, personDetails);
	    return ResponseEntity.ok(updatedPerson);
	}


	// 사람 삭제
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deletePerson(@PathVariable(value = "id") int personIdx) {
		personService.deletePerson(personIdx);
		return ResponseEntity.ok("Person with ID " + personIdx + " has been successfully deleted.");
	}

	// 다중 삭제 엔드포인트
	@DeleteMapping("/delete-multiple")
	public ResponseEntity<String> deletePersons(@RequestBody List<Integer> personIds) {
		personService.deletePersons(personIds);
		return ResponseEntity.ok("Persons with IDs " + personIds + " have been successfully deleted.");
	}

}
