package acorn.service;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Finance;
import acorn.entity.Sponsor;
import acorn.repository.SponsorRepository;
import jakarta.transaction.Transactional;

@Service
public class SponsorService {

    private final SponsorRepository sponsorRepository;
    private final FinanceService financeService; // FinanceService 필드 추가

    public SponsorService(SponsorRepository sponsorRepository, FinanceService financeService) {
        this.sponsorRepository = sponsorRepository;
        this.financeService = financeService; // 생성자 주입
    }

    // 모든 스폰서 조회 (페이징 처리)
    public Page<Sponsor> getAllSponsors(Pageable pageable) {
        return sponsorRepository.findAll(pageable);
    }

    // 스폰서 이름으로 검색 (페이징 처리)
    public Page<Sponsor> searchSponsorsByName(String sponsorName, Pageable pageable) {
        return sponsorRepository.findBySponsorNameContaining(sponsorName, pageable);
    }

    // contractDate 기준으로 기간별 스폰서 검색 (페이징 처리)
    public Page<Sponsor> searchSponsorsByContractDateRange(Date startDate, Date endDate, Pageable pageable) {
        return sponsorRepository.findByContractDateBetween(startDate, endDate, pageable);
    }

    // 새로운 스폰서 추가
    @Transactional  // 트랜잭션을 명확히 지정
    public Sponsor addSponsor(Sponsor sponsor) {
        Sponsor savedSponsor = sponsorRepository.save(sponsor);

        // 중복 재정 항목이 있는지 확인 (trader와 시분초까지 포함한 financeDate 기준)
        Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());  // 시분초까지 포함한 현재 시간
        
        boolean exists = financeService.existsByTraderAndFinanceDate(savedSponsor.getSponsorName(), currentTimestamp);

        if (!exists) {
            Finance finance = Finance.builder()
                .financeType("수입")
                .financeDate(currentTimestamp)  // 시분초 포함 현재 시간
                .amount(savedSponsor.getPrice())  // 스폰서 금액
                .trader(savedSponsor.getSponsorName())  // 거래처 정보
                .purpose("스폰서 계약")
                .financeMemo("스폰서 계약에 따른 수입")
                .build();

            financeService.addIncome(finance);  // 재정 항목에 추가
        } else {
            System.out.println("Duplicate finance entry detected for sponsor: " + savedSponsor.getSponsorName());
        }

        return savedSponsor;
    }




    // 스폰서 업데이트
    public Sponsor updateSponsor(int sponsorIdx, Sponsor sponsorDetails) {
        Sponsor sponsor = getSponsorById(sponsorIdx);
        if (sponsor != null) {
            sponsor.setSponsorName(sponsorDetails.getSponsorName());
            sponsor.setContractDate(sponsorDetails.getContractDate());
            sponsor.setPrice(sponsorDetails.getPrice());
            sponsor.setContractCondition(sponsorDetails.getContractCondition());
            sponsor.setSponsorMemo(sponsorDetails.getSponsorMemo());
            sponsor.setStartDate(sponsorDetails.getStartDate());
            sponsor.setEndDate(sponsorDetails.getEndDate());
            return sponsorRepository.save(sponsor);
        }
        return null;
    }

    // 특정 스폰서 조회
    public Sponsor getSponsorById(int sponsorIdx) {
        Optional<Sponsor> sponsor = sponsorRepository.findById(sponsorIdx);
        return sponsor.orElse(null);
    }

    // 스폰서 삭제
    public void deleteSponsor(int sponsorIdx) {
        sponsorRepository.deleteById(sponsorIdx);
    }

    // 선택된 스폰서들 삭제
    public void deleteSponsors(List<Integer> sponsorIds) {
        sponsorRepository.deleteAllByIdInBatch(sponsorIds);
    }
}
