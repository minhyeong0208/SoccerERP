package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import acorn.entity.Ability;
import acorn.service.AbilityService;

import java.util.List;

@RestController
@RequestMapping("/abilities")
public class AbilityController {

    private final AbilityService abilityService;

    @Autowired
    public AbilityController(AbilityService abilityService) {
        this.abilityService = abilityService;
    }

    // 모든 능력치 조회
    @GetMapping
    public List<Ability> getAllAbilities() {
        return abilityService.getAllAbilities();
    }

    // 특정 능력치 조회
    @GetMapping("/{id}")
    public ResponseEntity<Ability> getAbilityById(@PathVariable(value = "id") int abilityIdx) {
        Ability ability = abilityService.getAbilityById(abilityIdx);
        if (ability == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(ability);
    }

    // 새로운 능력치 추가
    @PostMapping
    public Ability createAbility(@RequestBody Ability ability) {
        return abilityService.addAbility(ability);
    }

    // 능력치 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Ability> updateAbility(@PathVariable(value = "id") int abilityIdx,
                                                 @RequestBody Ability abilityDetails) {
        Ability updatedAbility = abilityService.updateAbility(abilityIdx, abilityDetails);
        if (updatedAbility == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedAbility);
    }

    // 능력치 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbility(@PathVariable(value = "id") int abilityIdx) {
        abilityService.deleteAbility(abilityIdx);
        return ResponseEntity.ok().build();
    }
}
