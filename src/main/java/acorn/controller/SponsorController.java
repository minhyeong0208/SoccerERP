package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Sponsor;
import acorn.service.SponsorService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/sponsors")
public class SponsorController {

    private final SponsorService sponsorService;

    @Autowired
    public SponsorController(SponsorService sponsorService) {
        this.sponsorService = sponsorService;
    }

    // 모든 스폰서 조회 (페이징 처리)
    @GetMapping
    public Page<Sponsor> getAllSponsors(Pageable pageable) {
        return sponsorService.getAllSponsors(pageable);
    }

    // 스폰서 이름으로 검색 (페이징 처리)
    @GetMapping("/search")
    public Page<Sponsor> searchSponsorsByName(@RequestParam String sponsorName, Pageable pageable) {
        return sponsorService.searchSponsorsByName(sponsorName, pageable);
    }

    // 기간으로 스폰서 검색 (페이징 처리)
    @GetMapping("/search-by-date")
    public Page<Sponsor> searchSponsorsByDateRange(@RequestParam Date startDate, @RequestParam Date endDate, Pageable pageable) {
        return sponsorService.searchSponsorsByDateRange(startDate, endDate, pageable);
    }

    // 새로운 스폰서 추가
    @PostMapping
    public Sponsor createSponsor(@RequestBody Sponsor sponsor) {
        return sponsorService.addSponsor(sponsor);
    }

    // 스폰서 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Sponsor> updateSponsor(
            @PathVariable(value = "id") int sponsorIdx, @RequestBody Sponsor sponsorDetails) {
        Sponsor updatedSponsor = sponsorService.updateSponsor(sponsorIdx, sponsorDetails);
        if (updatedSponsor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedSponsor);
    }

    // 스폰서 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSponsor(@PathVariable(value = "id") int sponsorIdx) {
        sponsorService.deleteSponsor(sponsorIdx);
        return ResponseEntity.ok("Sponsor with ID " + sponsorIdx + " has been successfully deleted.");
    }

    // 선택된 스폰서 삭제
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<String> deleteSponsors(@RequestBody List<Integer> sponsorIds) {
        sponsorService.deleteSponsors(sponsorIds);
        return ResponseEntity.ok("Sponsors with IDs " + sponsorIds + " have been successfully deleted.");
    }
}
