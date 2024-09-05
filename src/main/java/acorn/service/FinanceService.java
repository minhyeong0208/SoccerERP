package acorn.service;

import java.sql.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Finance;
import acorn.repository.FinanceRepository;

@Service
public class FinanceService {
	
	@Autowired
	private FinanceRepository financeRepository;

	// 검색 기능
	public Page<Finance> getFinancesByTypeAndDateAndKeyword(String type, Date startDate, Date endDate, String keyword, Pageable pageable) {
        return financeRepository.findByTypeAndDate(type, startDate, endDate, keyword, pageable);
    }
	
	// 수입 항목 추가
    public Finance addIncome(Finance finance) {
        finance.setFinanceType("수입");
        return financeRepository.save(finance);
    }

    // 지출 항목 추가
    public Finance addExpense(Finance finance) {
        finance.setFinanceType("지출");
        return financeRepository.save(finance);
    }
    
    // 수입/지출 데이터 수정
    public Finance updateFinance(int id, Finance entity) {
    	Optional<Finance> financeData = financeRepository.findById(id);
    	
    	if (financeData.isPresent()) {
            Finance finance = financeData.get();
            finance.setFinanceDate(entity.getFinanceDate());
            finance.setAmount(entity.getAmount());
            finance.setTrader(entity.getTrader());
            finance.setPurpose(entity.getPurpose());
            finance.setFinanceMemo(entity.getFinanceMemo());
            // 필요한 경우 더 많은 필드를 업데이트할 수 있습니다.
            return financeRepository.save(finance);
        } else {
            throw new RuntimeException("Finance not found with id " + id);
        }
    }
    
    // 다중 삭제
    public void deleteFinance(List<Integer> ids) {
    	financeRepository.deleteAllByIdInBatch(ids);
    }
}
