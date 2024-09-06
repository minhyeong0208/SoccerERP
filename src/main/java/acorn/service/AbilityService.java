package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import acorn.entity.Ability;
import acorn.repository.AbilityRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AbilityService {

    private final AbilityRepository abilityRepository;

    @Autowired
    public AbilityService(AbilityRepository abilityRepository) {
        this.abilityRepository = abilityRepository;
    }

    // 모든 능력치 조회
    public List<Ability> getAllAbilities() {
        return abilityRepository.findAll();
    }

    // 특정 능력치 조회
    public Ability getAbilityById(int abilityIdx) {
        Optional<Ability> ability = abilityRepository.findById(abilityIdx);
        return ability.orElse(null);
    }

    // 새로운 능력치 추가
    public Ability addAbility(Ability ability) {
        return abilityRepository.save(ability);
    }

    // 능력치 업데이트
    public Ability updateAbility(int abilityIdx, Ability abilityDetails) {
        Ability ability = getAbilityById(abilityIdx);
        if (ability != null) {
            ability.setPass(abilityDetails.getPass());
            ability.setPhysical(abilityDetails.getPhysical());
            ability.setShoot(abilityDetails.getShoot());
            ability.setSpeed(abilityDetails.getSpeed());
            ability.setDribble(abilityDetails.getDribble());
            ability.setDefence(abilityDetails.getDefence());
            return abilityRepository.save(ability);
        }
        return null;
    }

    // 능력치 삭제
    public void deleteAbility(int abilityIdx) {
        abilityRepository.deleteById(abilityIdx);
    }
}
