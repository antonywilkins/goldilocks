package goldilocks.repository.appointment;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.appointment.ClientAppointment;

public interface ClientAppointmentRepository extends JpaRepository<ClientAppointment, Long> {

    static final String TYPE = "ClientAppointment";
    static final String JOIN_FETCH = " LEFT join fetch t.services LEFT join fetch t.client ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<ClientAppointment> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<ClientAppointment> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<ClientAppointment> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<ClientAppointment> findAll(Sort sort);

    @Query(SELECT + "where t.start between :start and :end")
    List<ClientAppointment> findByStartBetween(@Param("start") Instant start, @Param("end") Instant end, @Param("sort") Sort sort);

    @Override
    @Query(SELECT + "where t.id = :id")
    ClientAppointment findOne(@Param("id") Long id);
}