package goldilocks.domain.client;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;

import goldilocks.util.domain.DomainTypeBase;

@Embeddable
public class PhoneNumber extends DomainTypeBase implements Serializable {

	private static final long serialVersionUID = 1L;

	@Column(nullable = false)
	@NotNull
	private String phoneNumber;

	@Column(nullable = false)
	@NotNull
	private PhoneNumberType type;

	public PhoneNumber() {
	}

	public PhoneNumber(PhoneNumberType type, String phoneNumber) {
		super();
		this.setType(type);
		this.setPhoneNumber(phoneNumber);
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public PhoneNumberType getType() {
		return type;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public void setType(PhoneNumberType type) {
		this.type = type;
	}

	@Override
	public String toString() {
		return String.format("PhoneNumber[type='%s', phoneNumber='%s']", getType(), getPhoneNumber());
	}

}