package goldilocks.util.domain;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class DomainObjectReferenceView<T, K> {

	public static <RT extends DomainObject<RT, RK>, RK> List<DomainObjectReferenceView<RT, RK>> list(List<RT> objects) {
		List<DomainObjectReferenceView<RT, RK>> result = new ArrayList<>();
		for (RT o : objects) {
			result.add(new DomainObjectReferenceView<RT, RK>(o));
		}
		return result;
	}

	private final DomainObject<T, K> delegate;

	public DomainObjectReferenceView(DomainObject<T, K> delegate) {
		super();
		this.delegate = delegate;
	}

	@JsonProperty
	public String get_type() {
		return getDelegate().get_type();
	}

	@JsonIgnore
	public DomainObject<T, K> getDelegate() {
		return delegate;
	}

	@JsonProperty
	public K getId() {
		return getDelegate().getId();
	}

}
