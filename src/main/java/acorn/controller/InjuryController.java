package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Injury;
import acorn.service.InjuryService;

@RestController
@RequestMapping("/injuries")
public class InjuryController {

    private final InjuryService injuryService;

    @Autowired
    public InjuryController(InjuryService injuryService) {
        this.injuryService = injuryService;
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
}
