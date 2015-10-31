package goldilocks.repository.client;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.client.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {
    static final String TYPE = "Client";
    static final String JOIN_FETCH = " LEFT join fetch t.phoneNumbers ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<Client> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<Client> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<Client> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<Client> findAll(Sort sort);

    @Query(value = SELECT + "where UPPER(t.firstNameStripped) like UPPER(:firstName) and UPPER(t.lastNameStripped) like UPPER(:lastName)",
            countQuery = COUNT
                    + "where UPPER(t.firstNameStripped) like UPPER(:firstName) and UPPER(t.lastNameStripped) like UPPER(:lastName)")
    public Page<Client> findDistinctClientsByLastNameStrippedIgnoreCaseLikeAndFirstNameStrippedIgnoreCaseLike(
            @Param("lastName") String lastName, @Param("firstName") String firstName, Pageable pageable);

    @Query(value = SELECT + " where UPPER(t.firstNameStripped) like UPPER(:firstName) or UPPER(t.lastNameStripped) like UPPER(:lastName)",
            countQuery = COUNT
                    + "where UPPER(t.firstNameStripped) like UPPER(:firstName) or UPPER(t.lastNameStripped) like UPPER(:lastName)")
    public Page<Client> findDistinctClientsByLastNameStrippedIgnoreCaseLikeOrFirstNameStrippedIgnoreCaseLike(
            @Param("lastName") String lastName, @Param("firstName") String firstName, Pageable pageable);

    @Override
    @Query(SELECT + "where t.id = :id")
    Client findOne(@Param("id") Long id);

}