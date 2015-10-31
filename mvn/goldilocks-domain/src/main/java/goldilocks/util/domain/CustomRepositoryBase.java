package goldilocks.util.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.transaction.annotation.Transactional;

public class CustomRepositoryBase<T extends DomainObject<T, K>, K extends Serializable> {

	@PersistenceContext
	private EntityManager entityManager;

	@Transactional
	public void flush() {
		getEntityManager().flush();
	}

	protected EntityManager getEntityManager() {
		return entityManager;
	}

	protected boolean isNew(T entity) {
		return entity.getId() == null;
	}

	@Transactional
	public <S extends T> List<S> save(Iterable<S> entities) {

		List<S> result = new ArrayList<S>();

		if (entities == null) {
			return result;
		}

		for (S entity : entities) {
			result.add(save(entity));
		}

		return result;
	}

	@Transactional
	public <S extends T> S save(S entity) {
		if (isNew(entity)) {
			getEntityManager().persist(entity);
			return entity;
		} else {
			return getEntityManager().merge(entity);
		}
	}

	@Transactional
	public <S extends T> S saveAndFlush(S entity) {

		S result = save(entity);
		flush();

		return result;
	}
}
