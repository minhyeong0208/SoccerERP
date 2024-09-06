package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import acorn.entity.Sponsor;
import acorn.repository.SponsorRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class SponsorService {

    private final SponsorRepository sponsorRepository;

    @Autowired
    public SponsorService(SponsorRepository sponsorRepository) {
        this.sponsorRepository = sponsorRepository;
    }

    // 모든 스폰서 조회 (페이징 처리)
    public Page<Sponsor> getAllSponsors(Pageable pageable) {
        return sponsorRepository.findAll(pageable);
    }

    // 스폰서 이름으로 검색 (페이징 처리)
    public Page<Sponsor> searchSponsorsByName(String sponsorName, Pageable pageable) {
        return sponsorRepository.findBySponsorNameContaining(sponsorName, pageable);
    }

    // 기간으로 검색 (페이징 처리)
    public Page<Sponsor> searchSponsorsByDateRange(Date startDate, Date endDate, Pageable pageable) {
        return sponsorRepository.findByStartDateBetween(startDate, endDate, pageable);
    }

    // 새로운 스폰서 추가
    public Sponsor addSponsor(Sponsor sponsor) {
        return sponsorRepository.save(sponsor);
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
