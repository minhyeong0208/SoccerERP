package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Facility;
import acorn.service.FacilityService;

import java.util.List;

@RestController
@RequestMapping("/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    @Autowired
    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    // 모든 시설 조회 (페이징 없이)
    @GetMapping("/all")
    public List<Facility> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    // 시설명으로 검색
    @GetMapping("/search")
    public List<Facility> searchFacilitiesByName(@RequestParam String facilityName) {
        return facilityService.searchFacilitiesByName(facilityName);
    }

    // 새로운 시설 추가
    @PostMapping
    public Facility createFacility(@RequestBody Facility facility) {
        return facilityService.addFacility(facility);
    }

    // 시설 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateFacility(
            @PathVariable(value = "id") int facilityIdx, @RequestBody Facility facilityDetails) {
        Facility updatedFacility = facilityService.updateFacility(facilityIdx, facilityDetails);
        if (updatedFacility == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedFacility);
    }

    // 시설 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFacility(@PathVariable(value = "id") int facilityIdx) {
        facilityService.deleteFacility(facilityIdx);
        return ResponseEntity.ok("Facility with ID " + facilityIdx + " has been successfully deleted.");
    }


    // 선택된 시설 삭제
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<String> deleteFacilities(@RequestBody List<Integer> facilityIds) {
        facilityService.deleteFacilities(facilityIds);
        return ResponseEntity.ok("Facilities with IDs " + facilityIds + " have been successfully deleted.");
    }

}
