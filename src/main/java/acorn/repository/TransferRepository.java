package acorn.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import acorn.entity.Transfer;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Integer> {

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person p ORDER BY t.tradingDate DESC")
    Page<Transfer> findAllWithPerson(Pageable pageable);

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person p WHERE t.transferType = :transferType ORDER BY t.tradingDate DESC")
    Page<Transfer> findAllWithPersonFilterTransferType(int transferType, Pageable pageable);

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person p WHERE p.personName LIKE %:name% order by t.tradingDate desc")
    Page<Transfer> findByPersonNameContaining(@Param("name") String name, Pageable pageable);

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person p WHERE t.opponent LIKE %:name% order by t.tradingDate desc")
    Page<Transfer> findByTeamNameContaining(@Param("name") String name, Pageable pageable);

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person p WHERE p.personName LIKE %:term% OR t.opponent LIKE %:term%")
    Page<Transfer> searchTransfers(@Param("term") String term, Pageable pageable);

    @Query("SELECT t FROM Transfer t LEFT JOIN FETCH t.person WHERE t.transferIdx = :id")
    Transfer findByIdWithPerson(@Param("id") int id);
}