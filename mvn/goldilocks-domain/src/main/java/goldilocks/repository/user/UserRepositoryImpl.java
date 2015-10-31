package goldilocks.repository.user;

import java.util.HashSet;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import goldilocks.domain.user.Role;
import goldilocks.domain.user.User;
import goldilocks.util.domain.CustomRepositoryBase;

public class UserRepositoryImpl extends CustomRepositoryBase<User, String>implements UserRepositoryCustom {

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public User save(User entity) {

		if (entity == null) {
			return null;
		}
		if (entity.password() == null || entity.password().trim().isEmpty()) {
			entity.setPassword("password");
		}

		if (entity.isSuperuser()) {
			List<User> existingSuperusers = getEntityManager()
					.createQuery("select u from User u where u.superuser = true").getResultList();

			if (existingSuperusers.size() > 1) {
				throw new DataIntegrityViolationException(
						"User.superuser may be true for only one persistent instance - persistent store contains "
								+ existingSuperusers.size());
			}

			User existingSuperuser = existingSuperusers.size() > 0 ? (User) existingSuperusers.get(0) : null;

			if (existingSuperuser != null) {
				if (isNew(entity) || !entity.getId().equals(existingSuperuser.getId())) {
					throw new DataIntegrityViolationException(
							"User.superuser may be true for only one persistent instance");
				}
			}

			// ensure superuser has all roles
			List<Role> roles = getEntityManager().createQuery("select r from Role r").getResultList();
			entity.setRoles(new HashSet<>(roles));
		}

		return super.save(entity);
	}

}
