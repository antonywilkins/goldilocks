package goldilocks.domain.staff;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.springframework.validation.annotation.Validated;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;

@Entity
@Validated
@Table(indexes = { @Index(name = "IDX_STAFF_NAME", columnList = "NAME") })
public class Staff extends DomainObjectBase<Staff, Long>implements Serializable, Comparable<Staff> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "NAME", nullable = false)
    @NotNull
    private String name;

    @Version
    private Long version;

    @Column(nullable = false)
    @NotNull
    private ExpertiseLevel expertiseLevel = ExpertiseLevel.JUNIOR;

    public Staff() {
        super();
    }

    public Staff(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(Staff o) {
        int c = CompareUtil.compare(name, o.name);
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
        Staff other = (Staff) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    public ExpertiseLevel getExpertiseLevel() {
        return expertiseLevel;
    }

    @Override
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
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

    public void setExpertiseLevel(ExpertiseLevel expertiseLevel) {
        this.expertiseLevel = expertiseLevel;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
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
