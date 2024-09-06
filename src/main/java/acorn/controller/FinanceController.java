package acorn.controller;

import java.sql.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import acorn.service.FinanceService;

@RestController
@RequestMapping("/finances")
public class FinanceController {

	@Autowired
	private FinanceService financeService;

	@GetMapping
	public Page<Finance> getFinances(@RequestParam(name = "type", required = false) String type,
	                                 @RequestParam(name = "startDate", required = false) Date startDateStr,
	                                 @RequestParam(name = "endDate", required = false) Date endDateStr,
	                                 @RequestParam(name = "keyword", required = false) String keyword, // 텍스트 검색 키워드
	                                 @RequestParam(name = "page", defaultValue = "0") int page,
	                                 @RequestParam(name = "size", defaultValue = "10") int size) {

	    // Pageable 객체에 정렬 추가 (financeDate 기준으로 내림차순)
	    Pageable pageable = PageRequest.of(page, size, Sort.by("financeDate").descending());

	    // 필터 적용한 결과 반환
	    return financeService.getFinancesByTypeAndDateAndKeyword(type, startDateStr, endDateStr, keyword, pageable);
	}


	// 수입 항목 추가
	@PostMapping("/income")
	public Finance addIncome(@RequestBody Finance finance) {
		return financeService.addIncome(finance);
	}

	// 지출 항목 추가
	@PostMapping("/expense")
	public Finance addExpense(@RequestBody Finance finance) {
		return financeService.addExpense(finance);
	}

	@PutMapping("/{id}")
	public Finance updateFinance(@PathVariable("id") int id, @RequestBody Finance financeDetails) {
		return financeService.updateFinance(id, financeDetails);
	}

	// 특정 수입/지출 데이터 삭제 (HTTP DELETE 요청 처리)
	@DeleteMapping
	public void deleteFinances(@RequestBody List<Integer> ids) {
	    financeService.deleteFinance(ids);
	}
}
