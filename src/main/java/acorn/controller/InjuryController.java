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

import acorn.entity.Injury;
import acorn.entity.Person;
import acorn.service.InjuryService;
import acorn.service.PersonService;

@RestController
@RequestMapping("/injuries")
public class InjuryController {

    private final InjuryService injuryService;
    private final PersonService personService;  // PersonService 추가

    @Autowired
    public InjuryController(InjuryService injuryService, PersonService personService) {
        this.injuryService = injuryService;
        this.personService = personService;
    }
    
    @GetMapping("/injuries")
    public List<Injury> getAllInjuriesWithPerson() {
        return injuryService.findAllInjuriesWithPerson();
    }


    // 모든 부상 조회 (페이징 처리)
    @GetMapping
    public Page<Injury> getAllInjuries(Pageable pageable) {
        return injuryService.getAllInjuries(pageable);
    }

    // 특정 부상 조회
    @GetMapping("/{id}")
    public ResponseEntity<Injury> getInjuryById(@PathVariable(value = "id") int injuryIdx) {
        Injury injury = injuryService.getInjuryById(injuryIdx);
        if (injury == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(injury);
    }

    // 새로운 부상 추가
    @PostMapping
    public Injury createInjury(@RequestBody Injury injury) {
        return injuryService.addInjury(injury);
    }

    // 부상 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Injury> updateInjury(
            @PathVariable(value = "id") int injuryIdx, @RequestBody Injury injuryDetails) {
        Injury updatedInjury = injuryService.updateInjury(injuryIdx, injuryDetails);
        if (updatedInjury == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedInjury);
    }

    // 부상 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInjury(@PathVariable(value = "id") int injuryIdx) {
        injuryService.deleteInjury(injuryIdx);
        return ResponseEntity.ok().build();
    }

    // 모든 선수 조회 (부상 추가 시 선택할 수 있도록)
    @GetMapping("/players")
    public List<Person> getAllPlayers() {
        return personService.getAllPersons();
    }
}