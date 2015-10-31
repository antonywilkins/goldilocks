package goldilocks.repository.user;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import goldilocks.domain.user.Role;
import goldilocks.domain.user.User;

public class UserDetailsImpl implements UserDetails {

	private static final long serialVersionUID = -4342515698338499310L;

	private User user;

	public UserDetailsImpl(User user) {
		super();
		this.user = user;
	}

	@Override
	public boolean equals(Object obj) {
		return user.equals(obj);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Collection<GrantedAuthority> authorities = new ArrayList<>();
		for (Role role : getRoles()) {
			GrantedAuthority auth = new GrantedAuthorityImpl(role.getId());
			authorities.add(auth);
		}
		return authorities;

	}

	public String getName() {
		return user.getName();
	}

	@Override
	public String getPassword() {
		return user.password();
	}

	public Set<Role> getRoles() {
		return user.getRoles();
	}

	public User getUser() {
		return user;
	}

	@Override
	public String getUsername() {
		return user.getId();
	}

	@Override
	public int hashCode() {
		return user.hashCode();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return user.isEnabled();
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return user.isEnabled();
	}

	@Override
	public boolean isEnabled() {
		return user.isEnabled();
	}

	public void setName(String name) {
		user.setName(name);
	}

	public void setPassword(String password) {
		user.setPassword(password);
	}

	public void setUsername(String username) {
		user.setId(username);
	}

	@Override
	public String toString() {
		return user.toString();
	}

}
