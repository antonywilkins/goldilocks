package goldilocks.repository.appconfig;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import goldilocks.domain.appconfig.ApplicationConfig;
import goldilocks.util.domain.CustomRepositoryBase;

public class ApplicationConfigRepositoryImpl extends CustomRepositoryBase<ApplicationConfig, Long>
		implements ApplicationConfigRepositoryCustom {

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public ApplicationConfig save(ApplicationConfig entity) {
		if (entity.getUser() == null) {
			List<ApplicationConfig> existingNullUserConfigs = getEntityManager()
					.createQuery("select ac from ApplicationConfig ac where ac.user is null").getResultList();

			if (existingNullUserConfigs.size() > 1) {
				throw new DataIntegrityViolationException(
						"ApplicationConfig.user may be null for only one persistent instance - persistent store contains "
								+ existingNullUserConfigs.size());
			}

			ApplicationConfig existing = existingNullUserConfigs.size() > 0
					? (ApplicationConfig) existingNullUserConfigs.get(0) : null;

			if (existing != null) {
				if (isNew(entity) || !entity.getId().equals(existing.getId())) {
					throw new DataIntegrityViolationException(
							"ApplicationConfig.user may be null for only one persistent instance");
				}
			}
		}

		return super.save(entity);
	}
}
