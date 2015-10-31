package goldilocks.repository.appconfig;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.appconfig.ApplicationConfig;

public interface ApplicationConfigRepository extends JpaRepository<ApplicationConfig, Long>, ApplicationConfigRepositoryCustom {

    static final String TYPE = "ApplicationConfig";
    static final String JOIN_FETCH = " LEFT join fetch t.user ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<ApplicationConfig> findAll();

    @Override
    @Query(SELECT)
    List<ApplicationConfig> findAll(Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<ApplicationConfig> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<ApplicationConfig> findAll(Sort sort);

    @Query(SELECT + "where t.user.id = :id")
    ApplicationConfig findByUserId(@Param("id") String userId);

    @Query(SELECT + "where t.user is null")
    ApplicationConfig findByUserIsNull();

    @Override
    @Query(SELECT + "where t.id = :id")
    ApplicationConfig findOne(@Param("id") Long id);
}