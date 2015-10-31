package goldilocks.domain.user;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;

@SuppressWarnings("deprecation")
@Entity
@Validated
@Table(name = "APP_USER", indexes = { @Index(name = "IDX_USER_NAMES", columnList = "name,id") })
public class User extends DomainObjectBase<User, String>implements Serializable, Comparable<User> {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Column(nullable = false, length = 255)
    @NotNull
    private String name;

    @Column(nullable = false, length = 255)
    @NotNull
    private String password;

    @ForeignKey(name = "FK_APP_USER_ROLES", inverseName = "FK_APP_USER_ROLES_ROLENAME")
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Role> roles;

    @Column(nullable = false)
    private boolean resetPassword;

    @Column(nullable = false)
    private boolean enabled = true;

    // constrained by repository
    @Column(nullable = false)
    private boolean superuser = false;

    @Version
    private Long version;

    public User() {
    }

    public User(String id, String password, String name, boolean resetPassword) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.resetPassword = resetPassword;
    }

    @Override
    public int compareTo(User o) {
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
        User other = (User) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    @Override
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Set<Role> getRoles() {
        if (roles == null) {
            roles = new HashSet<>();
        }
        return roles;
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

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isResetPassword() {
        return resetPassword;
    }

    public boolean isSuperuser() {
        return superuser;
    }

    public String password() {
        return password;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setResetPassword(boolean resetPassword) {
        this.resetPassword = resetPassword;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void setSuperuser(boolean superuser) {
        this.superuser = superuser;
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