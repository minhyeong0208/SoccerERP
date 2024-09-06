package acorn.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.dto.TransferWithPersonDto;
import acorn.entity.Person;
import acorn.entity.Transfer;
import acorn.repository.PersonRepository;
import acorn.repository.TransferRepository;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final PersonRepository personRepository;

    @Autowired
    public TransferService(TransferRepository transferRepository, PersonRepository personRepository) {
        this.transferRepository = transferRepository;
        this.personRepository = personRepository;
    }

    // 판매 이적 처리
    public Transfer addSaleTransfer(Transfer transfer) {
        Transfer savedTransfer = transferRepository.save(transfer);
        personRepository.deleteById(transfer.getPersonIdx());
        return savedTransfer;
    }

    // 구매 이적 처리
    public Transfer addPurchaseTransfer(TransferWithPersonDto dto) {
        Person newPerson = personRepository.save(dto.getPerson());
        dto.getTransfer().setPersonIdx(newPerson.getPersonIdx());
        return transferRepository.save(dto.getTransfer());
    }

    // 특정 이적 정보 조회
    public Transfer getTransferById(int transferIdx) {
        return transferRepository.findById(transferIdx).orElse(null);
    }

    // 모든 이적 정보 조회 (페이징 처리)
    public Page<Transfer> getAllTransfers(Pageable pageable) {
        return transferRepository.findAll(pageable);
    }

    // 이적 정보 업데이트
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

    // 이적 정보 삭제
    public void deleteTransfer(int transferIdx) {
        transferRepository.deleteById(transferIdx);
    }
    
    // 선택된 이적 기록 삭제
    public void deleteTransfers(List<Integer> transferIds) {
        transferRepository.deleteAllById(transferIds);
    }

    // 선수 이름으로 이적 정보 검색 (페이징 처리 지원)
    public Page<Transfer> searchTransfersByPersonName(String name, Pageable pageable) {
        return transferRepository.findByPersonNameContaining(name, pageable);
    }
}
