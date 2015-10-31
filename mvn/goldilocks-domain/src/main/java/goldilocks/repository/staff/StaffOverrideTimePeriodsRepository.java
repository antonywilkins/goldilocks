package goldilocks.repository.staff;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.staff.StaffOverrideTimePeriods;

public interface StaffOverrideTimePeriodsRepository extends JpaRepository<StaffOverrideTimePeriods, Long> {
    static final String TYPE = "StaffOverrideTimePeriods";
    static final String JOIN_FETCH = " LEFT join fetch t.periods LEFT join fetch t.staff ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<StaffOverrideTimePeriods> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<StaffOverrideTimePeriods> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<StaffOverrideTimePeriods> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<StaffOverrideTimePeriods> findAll(Sort sort);

    @Query(SELECT + "where t.day = :day")
    List<StaffOverrideTimePeriods> findByDay(@Param("day") LocalDate day);

    @Query(SELECT + "where t.day between :start and :end")
    List<StaffOverrideTimePeriods> findByDayBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query(SELECT + "where t.staff.id = :id")
    List<StaffOverrideTimePeriods> findByStaffId(@Param("id") Long id);

    @Query(SELECT + "where t.staff.id = :id and t.day = :day")
    StaffOverrideTimePeriods findByStaffIdAndDay(@Param("id") Long id, @Param("day") LocalDate day);

    @Query(SELECT + "where t.staff.id = :id and t.day between :start and :end")
    List<StaffOverrideTimePeriods> findByStaffIdAndDayBetween(@Param("id") Long id, @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Override
    @Query(SELECT + "where t.id = :id")
    StaffOverrideTimePeriods findOne(@Param("id") Long id);

}