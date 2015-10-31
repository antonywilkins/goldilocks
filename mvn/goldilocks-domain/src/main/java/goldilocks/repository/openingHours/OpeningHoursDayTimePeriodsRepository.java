package goldilocks.repository.openingHours;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.openingHours.OpeningHoursRegularDayTimePeriods;

public interface OpeningHoursDayTimePeriodsRepository extends JpaRepository<OpeningHoursRegularDayTimePeriods, DayOfWeek> {
    static final String TYPE = "OpeningHoursRegularDayTimePeriods";
    static final String JOIN_FETCH = " LEFT join fetch t.periods ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<OpeningHoursRegularDayTimePeriods> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<OpeningHoursRegularDayTimePeriods> findAll(@Param("ids") Iterable<DayOfWeek> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<OpeningHoursRegularDayTimePeriods> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<OpeningHoursRegularDayTimePeriods> findAll(Sort sort);

    @Override
    @Query(SELECT + "where t.id = :id")
    OpeningHoursRegularDayTimePeriods findOne(@Param("id") DayOfWeek id);

}