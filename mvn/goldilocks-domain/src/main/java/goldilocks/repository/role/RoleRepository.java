package goldilocks.repository.role;

import org.springframework.data.jpa.repository.JpaRepository;

import goldilocks.domain.user.Role;

public interface RoleRepository extends JpaRepository<Role, String> {

}