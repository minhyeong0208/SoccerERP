package acorn.controller;

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

import acorn.dto.TransferWithPersonDto;
import acorn.entity.Transfer;
import acorn.service.TransferService;

@RestController
@RequestMapping("/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }
    
    // 선수 판매 
    @PostMapping("/sale")
    public ResponseEntity<Transfer> createSaleTransfer(@RequestBody Transfer transfer) {
        Transfer savedTransfer = transferService.addSaleTransfer(transfer);
        return ResponseEntity.ok(savedTransfer);
    }
    
    // 선수 구매
    @PostMapping("/purchase")
    public ResponseEntity<Transfer> createPurchaseTransfer(@RequestBody TransferWithPersonDto dto) {
        Transfer savedTransfer = transferService.addPurchaseTransfer(dto);
        return ResponseEntity.ok(savedTransfer);
    }

    // 특정 이적 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransferById(@PathVariable("id") int id) {
        Transfer transfer = transferService.getTransferById(id);
        return transfer != null ? ResponseEntity.ok(transfer) : ResponseEntity.notFound().build();
    }


    // 모든 이적 정보 조회 (페이징 처리)
    @GetMapping
    public Page<Transfer> getAllTransfers(Pageable pageable) {
        return transferService.getAllTransfers(pageable);
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

    // 선수 이름으로 검색 (페이징 처리 지원)
    @GetMapping("/search")
    public Page<Transfer> searchTransfersByPersonName(@RequestParam String name, Pageable pageable) {
        return transferService.searchTransfersByPersonName(name, pageable);
    }
}
