package acorn.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<String> createSaleTransfer(@RequestBody Transfer transfer) {
        // 이적 타입이 0인지 확인
        if (transfer.getTransferType() != 0) {
            return ResponseEntity.badRequest().body("Invalid transfer type. Sale transfers must have transferType set to 0.");
        }
        transfer.setTransferType(0);  // 판매 타입을 0으로 설정
        transferService.addSaleTransfer(transfer);
        return ResponseEntity.ok("Sale transfer created successfully.");
    }

    
    // 선수 구매
    @PostMapping("/purchase")
    public ResponseEntity<String> createPurchaseTransfer(@RequestBody TransferWithPersonDto dto) {
        // 이적 타입이 1인지 확인
        if (dto.getTransfer().getTransferType() != 1) {
            return ResponseEntity.badRequest().body("Invalid transfer type. Purchase transfers must have transferType set to 1.");
        }
        dto.getTransfer().setTransferType(1);  // 구매 타입을 1로 설정
        transferService.addPurchaseTransfer(dto);
        return ResponseEntity.ok("Purchase transfer created successfully.");
    }
    
    /*
    // 선수 구매
    @PostMapping("/purchase")
    public ResponseEntity<String> createPurchaseTransfer(
            @RequestPart("dto") TransferWithPersonDto dto, 
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        // 이적 타입이 1인지 확인
        if (dto.getTransfer().getTransferType() != 1) {
            return ResponseEntity.badRequest().body("Invalid transfer type. Purchase transfers must have transferType set to 1.");
        }

        // 구매 타입을 1로 설정
        dto.getTransfer().setTransferType(1);

        // 파일이 있으면 저장 로직 추가
        if (file != null && !file.isEmpty()) {
            try {
                // 파일 저장 경로 설정
                String fileName = file.getOriginalFilename();
                String uploadDir = "/path/to/save/files/";
                Path filePath = Paths.get(uploadDir + fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // person 객체에 파일 경로를 저장
                dto.getPerson().setPersonImage(fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("File upload failed: " + e.getMessage());
            }
        }

        // 이적 정보 추가
        transferService.addPurchaseTransfer(dto);
        return ResponseEntity.ok("Purchase transfer created successfully.");
    }
	*/

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
