package goldilocks.util.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public abstract class DomainTypeBase implements DomainType {

	@Override
	@JsonProperty
	public String get_type() {
		return this.getClass().getSimpleName();
	}

}
