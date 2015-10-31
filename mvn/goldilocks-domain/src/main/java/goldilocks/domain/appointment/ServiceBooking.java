package goldilocks.domain.appointment;

import java.io.Serializable;
import java.time.Duration;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import goldilocks.domain.product.Service;
import goldilocks.domain.staff.Staff;
import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.domain.DurationSerializer;

@Entity
@SuppressWarnings("deprecation")
@ServiceBookingIsForStaffServicesOrGapConstraint
@Validated
public class ServiceBooking extends DomainObjectBase<ServiceBooking, Long>implements Serializable, Comparable<ServiceBooking> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    // Constrained by @ServiceBookingIsForStaffServicesOrGapConstraint
    @ForeignKey(name = "FK_SERVICE_BOOKING_STAFF")
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    private Staff staff;

    // Constrained by @ServiceBookingIsForStaffServicesOrGapConstraint
    @ForeignKey(name = "FK_SERVICE_BOOKING_SERVICE")
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    private Service service;

    @Column(nullable = false)
    @NotNull
    private Duration duration;

    @Version
    private Long version;

    @Override
    public int compareTo(ServiceBooking o) {
        int c = CompareUtil.compare(service, o.service);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(staff, o.staff);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(o.duration, duration);
        return c;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        ServiceBooking other = (ServiceBooking) obj;
        return compareTo(other) == 0;
    }

    @JsonSerialize(using = DurationSerializer.class)
    public Duration getDuration() {
        return duration;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Service getService() {
        return service;
    }

    public Staff getStaff() {
        return staff;
    }

    @Override
    public Long getVersion() {
        return version;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((service == null) ? 0 : service.hashCode());
        result = prime * result + ((staff == null) ? 0 : staff.hashCode());
        result = prime * result + ((duration == null) ? 0 : duration.hashCode());
        return result;
    }

    public void setDuration(Duration duration) {
        this.duration = duration;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

}