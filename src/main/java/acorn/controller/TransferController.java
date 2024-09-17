package acorn.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import acorn.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import acorn.entity.Transfer;
import acorn.entity.Person;
import acorn.service.TransferService;

@RestController
@RequestMapping("/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @Autowired
    private PersonService personService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 선수 판매
    @PostMapping("/sell")
    public ResponseEntity<String> sell(@RequestBody Transfer transfer) {
        // 이적 타입이 0인지 확인
        if (transfer.getTransferType() != 0) {
            return ResponseEntity.badRequest().body("Invalid transfer type. Sale transfers must have transferType set to 0.");
        }
        transfer.setTransferType(0);  // 판매 타입을 0으로 설정
        Person person = personService.getPersonById(transfer.getPersonIdx());
        transfer.setPerson(person);
        transferService.addSaleTransfer(transfer);
        return ResponseEntity.ok("Sale transfer created successfully.");
    }

    // 선수 구매 (파일 업로드 기능 추가)
    @PostMapping("/buy")
    public ResponseEntity<String> createPurchaseTransfer(
            @RequestBody Transfer transfer,
            @RequestBody Person person,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        return ResponseEntity.ok("Purchase transfer created successfully.");
    }

    // 특정 이적 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransferById(@PathVariable("id") int id) {
        Transfer transfer = transferService.getTransferById(id);
        return transfer != null ? ResponseEntity.ok(transfer) : ResponseEntity.notFound().build();
    }

    // 이적 정보 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Transfer> updateTransfer(
            @PathVariable int id, @RequestBody Transfer transferDetails) {
        Transfer updatedTransfer = transferService.updateTransfer(id, transferDetails);
        return updatedTransfer != null ? ResponseEntity.ok(updatedTransfer) : ResponseEntity.notFound().build();
    }

    // 이적 정보 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable int id) {
        transferService.deleteTransfer(id);
        return ResponseEntity.ok().build();
    }

    // 선택된 이적 기록 삭제
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<Void> deleteTransfers(@RequestBody List<Integer> transferIds) {
        transferService.deleteTransfers(transferIds);
        return ResponseEntity.ok().build();
    }

    // 모든 이적 정보 조회 (페이징 처리)
    @GetMapping
    public Page<Transfer> getAllTransfers(@RequestParam(required = false) String transferType, Pageable pageable) {
        if (transferType != null) return transferService.getAllTransfersFilterType(transferType, pageable);
        return transferService.getAllTransfers(pageable);
    }

    // 선수 이름으로 검색 (페이징 처리 지원)
    @GetMapping("/search")
    public Page<Transfer> searchTransfersByPersonName(@RequestParam(required = true) String filterType,
                                                      @RequestParam(required = false) String team,
                                                      @RequestParam(required = false) String person,
                                                      Pageable pageable) {
        String name = (team != null) ? team : person;
        return transferService.searchTransfersByName(filterType, name, pageable);
    }

    @GetMapping("/detail/{id}")
    public String getTransferDetail(@PathVariable int id, Model model) {
        Transfer selectedTransfer = transferService.getTransferById(id);
        model.addAttribute("selectedTransfer", selectedTransfer);
        return "transfer"; // transfer.html 뷰 이름
    }

    /**
     * 판매 대상 선수 목록 조회
     * @return
     */
    @GetMapping("/person/list")
    public ResponseEntity<?> getPersonList() {
        Map<Integer, String> persons = new HashMap<>();
        /**
         * TODO
         * teamIdx Session 내 처리
         */
        String teamIdx = "GFC";
        for (Person item : personService.findAllWithTeamIdx(teamIdx)) {
            persons.put(item.getPersonIdx(), item.getPersonName());
        }
        return ResponseEntity.ok(persons);
    }

    // 이적 리스트 이적 날짜 내림차순 정렬
    public String listTransfers(Model model,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("tradingDate").descending());
        Page<Transfer> transferPage = transferService.getAllTransfers(pageable);

        model.addAttribute("transfers", transferPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", transferPage.getTotalPages());

        return "transfers";
    }
}