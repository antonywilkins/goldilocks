package goldilocks.domain.product;

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
@Table(indexes = { @Index(name = "IDX_PRODUCT_NAMES", columnList = "NAME,DESCRIPTION") })
public class Product extends DomainObjectBase<Product, Long>implements Serializable, Comparable<Product> {

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

    @Version
    private Long version;

    @Column(nullable = false)
    @NotNull
    private int stock;

    @Column(nullable = false)
    @NotNull
    private int price = 0;

    public Product() {
    }

    public Product(String name, String description) {
        this.name = name;
        this.description = description;
    }

    @Override
    public int compareTo(Product o) {
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
        Product other = (Product) obj;
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

    public int getPrice() {
        return price;
    }

    public int getStock() {
        return stock;
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

    public void setPrice(int price) {
        this.price = price;
    }

    public void setStock(int stock) {
        this.stock = stock;
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
