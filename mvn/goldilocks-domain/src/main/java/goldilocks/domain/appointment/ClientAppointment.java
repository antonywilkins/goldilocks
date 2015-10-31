package goldilocks.domain.appointment;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import goldilocks.domain.client.Client;
import goldilocks.domain.product.Product;
import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DateTimePeriod;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.domain.JsonInstantSerializer;

@Validated
@Entity
@SuppressWarnings("deprecation")
@Table(indexes = { @Index(name = "IDX_CLIENT_APPOINTMENT_START", columnList = "START") })
public class ClientAppointment extends DomainObjectBase<ClientAppointment, Long>
        implements Serializable, Comparable<ClientAppointment>, DateTimePeriod {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "START", nullable = false)
    @NotNull
    private Instant start;

    @ForeignKey(name = "FK_CLIENT_APPOINTMENT_CLIENT")
    @ManyToOne(optional = false)
    private Client client;

    @ForeignKey(name = "FK_CLIENT_APPOINTMENT_SERVICES", inverseName = "FK_CLIENT_APPOINTMENT_SERVICES_SERVICE")
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ServiceBooking> services;

    @ForeignKey(name = "FK_CLIENT_APPOINTMENT_PRODUCTS", inverseName = "FK_CLIENT_APPOINTMENT_PRODUCTS_PRODUCT")
    @OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.EAGER)
    private List<Product> products;

    @Column(nullable = true)
    private Instant arrivalTime;

    @Column(nullable = true)
    private CancelReason cancelReason;

    @Column(nullable = true)
    private Instant cancelledTime;

    @Version
    private Long version;

    private List<Product> _getProducts() {
        if (products == null) {
            products = new ArrayList<>();
        }
        return products;
    }

    private List<ServiceBooking> _getServices() {
        if (services == null) {
            services = new ArrayList<>();
        }
        return services;
    }

    public void addService(ServiceBooking service, int index) {
        if (service == null) {
            return;
        }
        _getServices().add(index, service);
    }

    @Override
    public int compareTo(ClientAppointment o) {
        int c = CompareUtil.compare(getStart(), o.getStart());
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(client, o.client);
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(id, o.id);
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
        ClientAppointment other = (ClientAppointment) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    public Instant getArrivalTime() {
        return arrivalTime;
    }

    public Instant getCancelledTime() {
        return cancelledTime;
    }

    public CancelReason getCancelReason() {
        return cancelReason;
    }

    public Client getClient() {
        return client;
    }

    @Override
    @JsonSerialize(using = JsonInstantSerializer.class)
    public Instant getEnd() {
        if (start == null) {
            return null;
        }

        Instant end = start;

        for (ServiceBooking service : _getServices()) {
            if (service.getDuration() != null) {
                end = end.plus(service.getDuration());
            }
        }

        return end;
    }

    @Override
    public Long getId() {
        return id;
    }

    public List<Product> getProducts() {
        return Collections.unmodifiableList(_getProducts());
    }

    public List<ServiceBooking> getServices() {
        return Collections.unmodifiableList(_getServices());
    }

    @Override
    @JsonSerialize(using = JsonInstantSerializer.class)
    public Instant getStart() {
        return start;
    }

    @Override
    public Long getVersion() {
        return version;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    public void setArrivalTime(Instant arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public void setCancelledTime(Instant cancelledTime) {
        this.cancelledTime = cancelledTime;
    }

    public void setCancelReason(CancelReason cancelReason) {
        this.cancelReason = cancelReason;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public void setServices(List<ServiceBooking> services) {
        this.services = services;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return String.format("ClientAppointment [id=%s, start=%s, client=%s]", id, start, client);
    }
}