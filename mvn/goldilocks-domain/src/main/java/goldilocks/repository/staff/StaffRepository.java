package goldilocks.repository.staff;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.staff.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    static final String TYPE = "Staff";
    static final String JOIN_FETCH = "";
    static final String COUNT = "select count(t) from " + TYPE + " t ";
    static final String SELECT_START = "select t from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<Staff> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<Staff> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<Staff> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<Staff> findAll(Sort sort);

    @Query(SELECT + "where UPPER(t.name) like UPPER(:name)")
    Page<Staff> findByNameIgnoreCaseLike(@Param("name") String name, Pageable pageable);

    @Override
    @Query(SELECT + "where t.id = :id")
    Staff findOne(@Param("id") Long id);

}