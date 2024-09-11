package acorn.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Injury;
import acorn.repository.InjuryRepository;

@Service
public class InjuryService {

    private final InjuryRepository injuryRepository;

    public InjuryService(InjuryRepository injuryRepository) {
        this.injuryRepository = injuryRepository;
    }
    
    // 월별 부상 발생 빈도 반환
    public List<Map<String, Object>> getInjuriesCountByMonth() {
        List<Object[]> results = injuryRepository.countInjuriesByMonth();
        List<Map<String, Object>> injuryCounts = new ArrayList<>();

        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", result[0]);
            map.put("count", result[1]);
            injuryCounts.add(map);
        }

        return injuryCounts;
    }
    
    // 모든 부상 조회 (선수 정보 포함)
    public List<Injury> findAllInjuriesWithPerson() {
        return injuryRepository.findAllInjuriesWithPerson();
    }

    // 모든 부상 조회 (페이징 처리)
    public Page<Injury> getAllInjuries(Pageable pageable) {
        return injuryRepository.findAll(pageable);
    }
    
    public List<Injury> getAllInjuries() {
        return injuryRepository.findAll();
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
            // injury.setPerson(injuryDetails.getPerson());  // 수정된 부분
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
