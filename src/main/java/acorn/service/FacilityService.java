package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import acorn.entity.Facility;
import acorn.repository.FacilityRepository;

import java.util.List;
import java.util.Optional;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    @Autowired
    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    // 모든 시설 조회 (페이징 없이)
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    // 시설명으로 검색
    public List<Facility> searchFacilitiesByName(String facilityName) {
        return facilityRepository.findByFacilityNameContaining(facilityName);
    }

    // 새로운 시설 추가
    public Facility addFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    // 시설 업데이트
    public Facility updateFacility(int facilityIdx, Facility facilityDetails) {
        Facility facility = getFacilityById(facilityIdx);
        if (facility != null) {
            facility.setFacilityName(facilityDetails.getFacilityName());
            facility.setLatitude(facilityDetails.getLatitude());
            facility.setLongitude(facilityDetails.getLongitude());
            facility.setCapacity(facilityDetails.getCapacity());
            facility.setFacilityFound(facilityDetails.getFacilityFound());
            return facilityRepository.save(facility);
        }
        return null;
    }

    // 특정 시설 조회
    public Facility getFacilityById(int facilityIdx) {
        Optional<Facility> facility = facilityRepository.findById(facilityIdx);
        return facility.orElse(null);
    }

    // 시설 삭제
    public void deleteFacility(int facilityIdx) {
        facilityRepository.deleteById(facilityIdx);
    }

    // 선택된 시설들 삭제
    public void deleteFacilities(List<Integer> facilityIds) {
        facilityRepository.deleteAllByIdInBatch(facilityIds);
    }
}
