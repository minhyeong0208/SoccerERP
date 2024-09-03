package acorn.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    // 특정 사람 조회
    @GetMapping("/{id}")
    public ResponseEntity<Person> getPersonById(@PathVariable(value = "id") int personIdx) {
        Person person = personService.getPersonById(personIdx);
        if (person == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(person);
    }

    // 새로운 사람 추가
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
    public ResponseEntity<Void> deletePerson(@PathVariable(value = "id") int personIdx) {
        personService.deletePerson(personIdx);
        return ResponseEntity.ok().build();
    }
}
