package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import acorn.entity.Transfer;
import acorn.service.TransferService;

@RestController
@RequestMapping("/transfers")
public class TransferController {

    private final TransferService transferService;

    @Autowired
    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    // 모든 이적 조회 (페이징 처리)
    @GetMapping
    public Page<Transfer> getAllTransfers(Pageable pageable) {
        return transferService.getAllTransfers(pageable);
    }

    // 특정 이적 조회
    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransferById(@PathVariable(value = "id") int transferIdx) {
        Transfer transfer = transferService.getTransferById(transferIdx);
        if (transfer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(transfer);
    }

    // 새로운 이적 추가
    @PostMapping
    public Transfer createTransfer(@RequestBody Transfer transfer) {
        return transferService.addTransfer(transfer);
    }

    // 이적 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Transfer> updateTransfer(
            @PathVariable(value = "id") int transferIdx, @RequestBody Transfer transferDetails) {
        Transfer updatedTransfer = transferService.updateTransfer(transferIdx, transferDetails);
        if (updatedTransfer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedTransfer);
    }

    // 이적 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable(value = "id") int transferIdx) {
        transferService.deleteTransfer(transferIdx);
        return ResponseEntity.ok().build();
    }
}
