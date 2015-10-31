package goldilocks.domain.user;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.springframework.validation.annotation.Validated;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;

@Entity
@Validated
public class Role extends DomainObjectBase<Role, String>implements Serializable, Comparable<Role> {

	private static final long serialVersionUID = 1L;

	@Id
	private String id;

	@Column(nullable = false)
	@NotNull
	private String description;

	@Version
	private Long version;

	public Role() {
	}

	public Role(String id, String description) {
		this.id = id;
		this.description = description;
	}

	@Override
	public int compareTo(Role o) {
		int c = CompareUtil.compare(id, o.id);
		return c;
	}

	public String getDescription() {
		return description;
	}

	@Override
	public String getId() {
		return id;
	}

	@Override
	public Long getVersion() {
		return version;
	}

	@Override
	public void setId(String id) {
		this.id = id;
	}

	@Override
	public void setVersion(Long version) {
		this.version = version;
	}

	@Override
	public String toString() {
		return String.format("Role[%s, '%s']", id, description);
	}

}