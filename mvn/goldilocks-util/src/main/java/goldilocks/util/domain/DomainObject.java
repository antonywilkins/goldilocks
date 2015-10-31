package goldilocks.util.domain;

public interface DomainObject<T, K> extends Comparable<T>, DomainType {

	K getId();

	Long getVersion();

	void setId(K id);

	void setVersion(Long version);

}
