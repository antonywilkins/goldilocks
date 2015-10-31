package goldilocks.repository.product;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.product.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    static final String TYPE = "Service";
    static final String JOIN_FETCH = " LEFT join fetch t.prices ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<Service> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<Service> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<Service> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<Service> findAll(Sort sort);

    @Query(value = SELECT + " where UPPER(t.name) like UPPER(:name) or UPPER(t.description) like UPPER(:description)",
            countQuery = COUNT + " where UPPER(t.name) like UPPER(:name) or UPPER(t.description) like UPPER(:description)")
    Page<Service> findByNameIgnoreCaseLikeOrDescriptionIgnoreCaseLike(@Param("name") String name, @Param("description") String description,
            Pageable pageable);

    @Override
    @Query(SELECT + "where t.id = :id")
    Service findOne(@Param("id") Long id);
}