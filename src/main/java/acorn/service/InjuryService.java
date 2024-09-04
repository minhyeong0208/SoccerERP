package acorn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Injury;
import acorn.repository.InjuryRepository;

@Service
public class InjuryService {

    private final InjuryRepository injuryRepository;

    @Autowired
    public InjuryService(InjuryRepository injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    
    // 모든 부상 조회(일정에 추가)
    public List<Injury> getAllInjuries() {
        return injuryRepository.findAll();
    }

    // 모든 부상 조회 (페이징 처리)
    public Page<Injury> getAllInjuries(Pageable pageable) {
        return injuryRepository.findAll(pageable);
    }

    // 특정 부상 조회
    public Injury getInjuryById(int injuryIdx) {
        Optional<Injury> injury = injuryRepository.findById(injuryIdx);
        return injury.orElse(null);
    }

    // 새로운 부상 추가
    public Injury addInjury(Injury injury) {
        return injuryRepository.save(injury);
    }

    // 부상 업데이트
    public Injury updateInjury(int injuryIdx, Injury injuryDetails) {
        Injury injury = getInjuryById(injuryIdx);
        if (injury != null) {
            injury.setPersonIdx(injuryDetails.getPersonIdx());
            injury.setBrokenDate(injuryDetails.getBrokenDate());
            injury.setSeverity(injuryDetails.getSeverity());
            injury.setDoctor(injuryDetails.getDoctor());
            injury.setRecovery(injuryDetails.getRecovery());
            injury.setMemo(injuryDetails.getMemo());
            return injuryRepository.save(injury);
        }
        return null;
    }

    // 부상 삭제
    public void deleteInjury(int injuryIdx) {
        injuryRepository.deleteById(injuryIdx);
    }
}
