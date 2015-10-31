package goldilocks.util.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public abstract class DelegateDomainObjectView<T extends DomainObjectBase<T, K>, K> {

	private final T delegate;

	public DelegateDomainObjectView(T delegate) {
		this.delegate = delegate;
	}

	public int compareTo(DelegateDomainObjectView<T, K> o) {
		return getDelegate().compareTo(o.getDelegate());
	}

	@Override
	public boolean equals(Object obj) {
		return getDelegate().equals(obj);
	}

	@JsonProperty
	public String get_type() {
		return getDelegate().get_type();
	}

	@JsonIgnore
	public T getDelegate() {
		return delegate;
	}

	public K getId() {
		return getDelegate().getId();
	}

	public Long getVersion() {
		return getDelegate().getVersion();
	}

	@Override
	public int hashCode() {
		return getDelegate().hashCode();
	}

	public void setId(K id) {
		getDelegate().setId(id);
	}

	@Override
	public String toString() {
		return getDelegate().toString();
	}
}
