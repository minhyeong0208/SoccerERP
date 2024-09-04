package acorn.controller;

import java.sql.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<Finance> getFinances(
            @RequestParam(name="type", required = false) String type,
            @RequestParam(name="startDate", required = false) Date startDateStr,
            @RequestParam(name="endDate", required = false) Date endDateStr,
            @RequestParam(name="page", defaultValue = "0") int page,
            @RequestParam(name="size", defaultValue = "10") int size,
            Pageable pageable) {

        // 필터 적용한 결과 반환
        return financeService.getFinancesByTypeAndDate(type, startDateStr, endDateStr, pageable);
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
    public Finance updateFinance(@PathVariable int id, @RequestBody Finance financeDetails) {
    	return financeService.updateFinance(id, financeDetails);
    }
}
