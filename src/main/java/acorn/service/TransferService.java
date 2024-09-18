package acorn.service;

import java.sql.Timestamp;
import java.util.List;

import acorn.entity.Person;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import acorn.entity.Finance;
import acorn.entity.Transfer;
import acorn.repository.PersonRepository;
import acorn.repository.TransferRepository;

@Service
public class TransferService {

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private FinanceService financeService;

    private static final int TRANSFER_TYPE_BUY = 1;
    private static final int TRANSFER_TYPE_SELL = 0;

    private static final String TRANSFER_FILTER_TEAM = "team";
    private static final String TRANSFER_FILTER_PERSON = "person";

    // 구매 이적 처리
    @Transactional
    public void addPurchaseTransfer(Transfer transfer) {
        Transfer savedTransfer = transferRepository.save(transfer);

        Finance expense = Finance.builder()
                .financeType("지출")
                .financeDate(new Timestamp(System.currentTimeMillis()))
                .amount(savedTransfer.getPrice())
                .trader(savedTransfer.getOpponent())
                .purpose("선수 구매")
                .financeMemo("선수 구매에 따른 지출")
                .build();

        financeService.addExpense(expense);
    }

    // 판매 이적 처리
    @Transactional
    public void addSaleTransfer(Transfer transfer) {
        Transfer savedTransfer = transferRepository.save(transfer);
        personRepository.deleteById(transfer.getPersonIdx());

        Finance income = Finance.builder()
                .financeType("수입")
                .financeDate(new Timestamp(System.currentTimeMillis()))
                .amount(savedTransfer.getPrice())
                .trader(savedTransfer.getOpponent())
                .purpose("선수 판매")
                .financeMemo("선수 판매에 따른 수입")
                .build();

        financeService.addIncome(income);
    }

    // 특정 이적 정보 조회
    @Transactional(readOnly = true)
    public Transfer getTransferById(int transferIdx) {
        return transferRepository.findById(transferIdx).orElse(null);
    }

    // 이적 정보 업데이트
    @Transactional
    public Transfer updateTransfer(int transferIdx, Transfer transferDetails) {
        Transfer transfer = getTransferById(transferIdx);
        if (transfer != null) {
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

    // 선택된 이적 기록 삭제
    @Transactional
    public void deleteTransfers(List<Integer> transferIds) {
        for (Transfer transfer : transferRepository.findByTransferIdxIn(transferIds)) {
            int transferType = transfer.getTransferType();
            switch (transferType) {
                case TRANSFER_TYPE_BUY: // TODO : 정산 추가
                    int personIdx = transfer.getPersonIdx(); // person 검증
                    if (personIdx > 0) personRepository.deleteById(personIdx);
                    break;
                case TRANSFER_TYPE_SELL: // TODO : 정산 추가
                    break;
                default:
            }
        }

        transferRepository.deleteAllById(transferIds);
    }

    // 선수, 팀 이름으로 이적 정보 검색 (페이징 처리 지원)
    @Transactional(readOnly = true)
    public Page<Transfer> searchTransfers(String filterType, String name, String transferTypeStr, Pageable pageable) {
        int transferType = (("전체".equals(transferTypeStr) || null == transferTypeStr) ? -1 : ("구매".equals(transferTypeStr)) ? 1 : 0);
        if ("".equals(name) || null == name) {
            if ( -1 == transferType ) return transferRepository.findAllWithPerson(pageable); // 전체
            return transferRepository.findAllWithPersonFilterTransferType(transferType, pageable); // 조건
        }

        if ("team".equals(filterType)) {
            if ( -1 == transferType ) return transferRepository.findByTeamNameContaining(name, pageable); // 전체, 팀 검색
            else return transferRepository.findByTeamNameContainingFilterTransferType(name, transferType, pageable); // 조건, 팀 검색
        }

        if ( -1 == transferType ) return transferRepository.findByPersonNameContaining(name, pageable); // 전체, 선수 검색
        return transferRepository.findByPersonNameContainingFilterTransferType(name, transferType, pageable); // 조건, 선수 검색
    }
}