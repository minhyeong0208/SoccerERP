package acorn.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public List<Person> searchPersons(
            @RequestParam(value = "personName", required = false) String personName,
            @RequestParam(value = "position", required = false) String position) {
        return personService.searchPersons(personName, position);
    }

    // 새로운 사람 추가 (구매 시)
    @PostMapping
    public Person createPerson(@RequestBody Person person) {
        return personService.addPerson(person);
    }

    // 사람 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Person> updatePerson(
            @PathVariable(value = "id") int personIdx, @RequestBody Person personDetails) {
        Person updatedPerson = personService.updatePerson(personIdx, personDetails);
        if (updatedPerson == null) {
            return ResponseEntity.notFound().build();
        }
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
