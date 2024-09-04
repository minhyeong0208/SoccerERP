package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Transfer;
import acorn.repository.TransferRepository;

import java.util.Optional;

@Service
public class TransferService {

    private final TransferRepository transferRepository;

    @Autowired
    public TransferService(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    // 모든 이적 조회 (페이징 처리)
    public Page<Transfer> getAllTransfers(Pageable pageable) {
        return transferRepository.findAll(pageable);
    }

    // 특정 이적 조회
    public Transfer getTransferById(int transferIdx) {
        Optional<Transfer> transfer = transferRepository.findById(transferIdx);
        return transfer.orElse(null);
    }

    // 새로운 이적 추가
    public Transfer addTransfer(Transfer transfer) {
        return transferRepository.save(transfer);
    }

    // 이적 업데이트
    public Transfer updateTransfer(int transferIdx, Transfer transferDetails) {
        Transfer transfer = getTransferById(transferIdx);
        if (transfer != null) {
            transfer.setPersonIdx(transferDetails.getPersonIdx());
            transfer.setTransferType(transferDetails.getTransferType());
            transfer.setTradingDate(transferDetails.getTradingDate());
            transfer.setOpponent(transferDetails.getOpponent());
            transfer.setTransferMemo(transferDetails.getTransferMemo());
            transfer.setPrice(transferDetails.getPrice());
            return transferRepository.save(transfer);
        }
        return null;
    }

    // 이적 삭제
    public void deleteTransfer(int transferIdx) {
        transferRepository.deleteById(transferIdx);
    }
}
