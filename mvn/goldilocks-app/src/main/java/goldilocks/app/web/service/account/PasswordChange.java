package goldilocks.app.web.service.account;

public class PasswordChange {

	private String existingPassword;
	private String newPassword;

	public String getExistingPassword() {
		return existingPassword;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setExistingPassword(String existingPassword) {
		this.existingPassword = existingPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}
}
