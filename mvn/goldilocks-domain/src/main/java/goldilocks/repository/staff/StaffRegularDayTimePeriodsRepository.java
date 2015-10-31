package goldilocks.repository.staff;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffRegularDayTimePeriods;

public interface StaffRegularDayTimePeriodsRepository extends JpaRepository<StaffRegularDayTimePeriods, Long> {
    static final String TYPE = "StaffRegularDayTimePeriods";
    static final String JOIN_FETCH = " LEFT join fetch t.periods LEFT join fetch t.staff ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    List<Long> deleteByStaffId(@Param("id") Long id);

    @Override
    @Query(SELECT)
    List<StaffRegularDayTimePeriods> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<StaffRegularDayTimePeriods> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<StaffRegularDayTimePeriods> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<StaffRegularDayTimePeriods> findAll(Sort sort);

    @Query(SELECT + "where t.dayOfWeek = :dayOfWeek")
    List<StaffRegularDayTimePeriods> findByDayOfWeek(@Param("dayOfWeek") DayOfWeek dayOfWeek);

    @Query(SELECT + "where t.staff.id = :id")
    List<StaffRegularDayTimePeriods> findByStaffId(@Param("id") Long id);

    @Query(SELECT + "where t.staff.id = :id and t.dayOfWeek = :dayOfWeek")
    StaffRegularDayTimePeriods findByStaffIdAndDayOfWeek(@Param("id") Long id, @Param("dayOfWeek") DayOfWeek dayOfWeek);

    @Query(SELECT + "where t.staff.id IN :ids")
    List<StaffRegularDayTimePeriods> findByStaffIdIn(@Param("ids") List<Long> ids);

    @Query(SELECT + "where t.staff IN :staff")
    List<StaffRegularDayTimePeriods> findByStaffIn(@Param("staff") List<Staff> staff);

    @Override
    @Query(SELECT + "where t.id = :id")
    StaffRegularDayTimePeriods findOne(@Param("id") Long id);

}