package acorn.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import acorn.dto.TransferWithPersonDto;
import acorn.entity.Finance;
import acorn.entity.Person;
import acorn.entity.Transfer;
import acorn.repository.PersonRepository;
import acorn.repository.TransferRepository;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final PersonRepository personRepository;
    private final FinanceService financeService;

    public TransferService(TransferRepository transferRepository, PersonRepository personRepository, FinanceService financeService) {
        this.transferRepository = transferRepository;
        this.personRepository = personRepository;
        this.financeService = financeService;
    }

    // 판매 이적 처리
    @Transactional
    public Transfer addSaleTransfer(Transfer transfer) {
        Transfer savedTransfer = transferRepository.save(transfer);
        personRepository.deleteById(transfer.getPerson().getPersonIdx());

        Finance income = Finance.builder()
                .financeType("수입")
                .financeDate(new Timestamp(System.currentTimeMillis()))
                .amount(transfer.getPrice())
                .trader(transfer.getOpponent())
                .purpose("선수 판매")
                .financeMemo("선수 판매에 따른 수입")
                .build();
        financeService.addIncome(income);

        return savedTransfer;
    }

    // 구매 이적 처리
    @Transactional
    public Transfer addPurchaseTransfer(TransferWithPersonDto dto) {
        Person newPerson = personRepository.save(dto.getPerson());
        dto.getTransfer().setPerson(newPerson);
        Transfer savedTransfer = transferRepository.save(dto.getTransfer());

        Finance expense = Finance.builder()
                .financeType("지출")
                .financeDate(new Timestamp(System.currentTimeMillis()))
                .amount(dto.getTransfer().getPrice())
                .trader(dto.getTransfer().getOpponent())
                .purpose("선수 구매")
                .financeMemo("선수 구매에 따른 지출")
                .build();
        financeService.addExpense(expense);

        return savedTransfer;
    }

    // 특정 이적 정보 조회
    @Transactional(readOnly = true)
    public Transfer getTransferById(int transferIdx) {
        return transferRepository.findById(transferIdx).orElse(null);
    }

    // 모든 이적 정보 조회 (페이징 처리)
    @Transactional(readOnly = true)
    public Page<Transfer> getAllTransfers(Pageable pageable) {
        return transferRepository.findAllWithPerson(pageable);
    }

    // 이적 정보 업데이트
    @Transactional
    public Transfer updateTransfer(int transferIdx, Transfer transferDetails) {
        Transfer transfer = getTransferById(transferIdx);
        if (transfer != null) {
            transfer.setPerson(transferDetails.getPerson());
            transfer.setTransferType(transferDetails.getTransferType());
            transfer.setTradingDate(transferDetails.getTradingDate());
            transfer.setOpponent(transferDetails.getOpponent());
            transfer.setTransferMemo(transferDetails.getTransferMemo());
            transfer.setPrice(transferDetails.getPrice());
            return transferRepository.save(transfer);
        }
        return null;
    }

    // 추가: 모든 이적 정보 조회 (리스트)
    @Transactional(readOnly = true)
    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    // 이적 정보 삭제
    @Transactional
    public void deleteTransfer(int transferIdx) {
        transferRepository.deleteById(transferIdx);
    }

    // 선택된 이적 기록 삭제
    @Transactional
    public void deleteTransfers(List<Integer> transferIds) {
        transferRepository.deleteAllById(transferIds);
    }

    // 선수 이름으로 이적 정보 검색 (페이징 처리 지원)
    @Transactional(readOnly = true)
    public Page<Transfer> searchTransfersByPersonName(String name, Pageable pageable) {
        return transferRepository.findByPersonNameContaining(name, pageable);
    }

    // 추가된 메소드: 통합 검색 (선수 이름 또는 상대팀)
    @Transactional(readOnly = true)
    public Page<Transfer> searchTransfers(String term, Pageable pageable) {
        return transferRepository.searchTransfers(term, pageable);
    }
}