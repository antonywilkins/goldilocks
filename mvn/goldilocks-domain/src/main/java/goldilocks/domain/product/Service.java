package goldilocks.domain.product;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.MapKeyColumn;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import goldilocks.domain.staff.ExpertiseLevel;
import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;

@Entity
@Validated
@SuppressWarnings("deprecation")
@Table(indexes = { @Index(name = "IDX_SERVICE_NAMES", columnList = "NAME,DESCRIPTION") })
public class Service extends DomainObjectBase<Service, Long>implements Serializable, Comparable<Service> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "NAME", nullable = false)
    @NotNull
    private String name;

    @Column(name = "DESCRIPTION", nullable = false)
    @NotNull
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @MapKeyColumn(name = "EXPERTISE_LEVEL")
    @Column(name = "PRICE")
    @CollectionTable(name = "SERVICE_PRICES", joinColumns = @JoinColumn(name = "SERVICE_ID") )
    @ForeignKey(name = "FK_SERVICE_PRICES")
    private Map<ExpertiseLevel, Integer> prices;

    @Version
    private Long version;

    public Service() {
    }

    public Service(String name, String description) {
        this.name = name;
        this.description = description;
    }

    @Override
    public int compareTo(Service o) {
        int c = CompareUtil.compare(id, o.id);
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
        Service other = (Service) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Map<ExpertiseLevel, Integer> getPrices() {
        if (prices == null) {
            prices = new HashMap<>();
        }
        return prices;
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

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(ExpertiseLevel level, Integer price) {
        getPrices().put(level, price);
    }

    public void setPrices(Map<ExpertiseLevel, Integer> prices) {
        this.prices = prices;
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return String.format("%s[%s, '%s']", getClass().getSimpleName(), id, name);
    }
}
