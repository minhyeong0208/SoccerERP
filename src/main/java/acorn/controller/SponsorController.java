package acorn.controller;

import java.sql.Date;
import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import acorn.entity.Finance;
import acorn.entity.Sponsor;
import acorn.service.SponsorService;
import acorn.service.FinanceService; // FinanceService 추가

@RestController
@RequestMapping("/sponsors")
public class SponsorController {

    private final SponsorService sponsorService;
    private final FinanceService financeService; // FinanceService 필드 추가

    // SponsorService와 FinanceService를 생성자 주입
    public SponsorController(SponsorService sponsorService, FinanceService financeService) {
        this.sponsorService = sponsorService;
        this.financeService = financeService;
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
        // 스폰서 추가
        Sponsor savedSponsor = sponsorService.addSponsor(sponsor);

        // 로그 추가: 중복 호출을 확인
        System.out.println("Adding income for sponsor: " + savedSponsor.getSponsorName());

        // 재정 항목에 수입 기록 추가
        Finance finance = Finance.builder()
            .financeType("수입")
            .financeDate(new java.sql.Date(System.currentTimeMillis()))  // 현재 날짜 또는 계약 날짜
            .amount(savedSponsor.getPrice())  // 스폰서 금액
            .trader(savedSponsor.getSponsorName())  // 거래처 정보
            .purpose("스폰서 계약")
            .financeMemo("스폰서 계약에 따른 수입")
            .build();

        // 재정 항목에 한 번만 수입 기록 추가
        System.out.println("Finance entry is being added for sponsor: " + finance.getTrader());
        financeService.addIncome(finance);  

        return savedSponsor;
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
