package goldilocks.domain.appconfig;

import java.io.Serializable;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.json.JSONObject;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonIgnore;

import goldilocks.domain.user.User;
import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.json.JsonUtil;

@Validated
@Entity
@SuppressWarnings("deprecation")
@Table(uniqueConstraints = { @UniqueConstraint(name = "UK_APPLICATION_CONFIG_USER", columnNames = { "USER_ID" }) })
public class ApplicationConfig extends DomainObjectBase<ApplicationConfig, Long>
		implements Serializable, Comparable<ApplicationConfig> {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue
	private Long id;

	@ForeignKey(name = "FK_APPLICATION_CONFIG_USER")
	@ManyToOne(optional = true)
	@JoinColumn(name = "USER_ID")
	private User user;

	@Lob
	@Column(nullable = false)
	@NotNull
	private String propertyText;

	@Version
	@Column
	private Long version;

	public ApplicationConfig() {
	}

	public ApplicationConfig(User user) {
		super();
		this.user = user;
	}

	public Map<String, Object> asMap() {
		return JsonUtil.jsonToMap(getProperties());
	}

	@Override
	public int compareTo(ApplicationConfig o) {
		int c = CompareUtil.compare(getId(), o.getId());
		return c;
	}

	public Object get(String key) {
		JSONObject props = getProperties();
		String[] parts = key.split("\\.");

		for (int p = 0; p < parts.length; ++p) {
			String keyPart = parts[p];
			if (p + 1 == parts.length) {
				return props.opt(keyPart);
			} else {
				Object propOrValue = props.opt(keyPart);
				if (propOrValue instanceof JSONObject) {
					props = (JSONObject) propOrValue;
				} else {
					return null;
				}
			}
		}
		return null;
	}

	@Override
	public Long getId() {
		return id;
	}

	@JsonIgnore
	public JSONObject getProperties() {
		if (propertyText == null) {
			return new JSONObject();
		}
		return new JSONObject(getPropertyText());
	}

	public String getPropertyText() {
		return propertyText;
	}

	public User getUser() {
		return user;
	}

	@Override
	public Long getVersion() {
		return version;
	}

	public void merge(ApplicationConfig values) {
		JSONObject incomingProperties = values.getProperties();
		JSONObject destinationProperties = getProperties();

		merge(incomingProperties, destinationProperties);

		setAsJson(destinationProperties);
	}

	private void merge(JSONObject incomingProperties, JSONObject destinationProperties) {
		for (String keyPart : incomingProperties.keySet()) {
			Object valuePart = incomingProperties.opt(keyPart);
			Object destinationValue = destinationProperties.opt(keyPart);
			if (destinationValue instanceof JSONObject && valuePart instanceof JSONObject) {
				merge((JSONObject) valuePart, (JSONObject) destinationValue);
			} else {
				destinationProperties.put(keyPart, valuePart);
			}
		}
	}

	public void set(String key, Object value) {
		JSONObject root = getProperties();

		String[] parts = key.split("\\.");

		JSONObject props = root;
		for (int p = 0; p < parts.length; ++p) {
			String keyPart = parts[p];
			if (p + 1 == parts.length) {
				props.put(keyPart, value);
			} else {
				Object propOrValue = props.opt(keyPart);
				JSONObject childProps;
				if (propOrValue instanceof JSONObject) {
					childProps = (JSONObject) propOrValue;
				} else {
					childProps = new JSONObject();
					props.put(keyPart, childProps);
				}
				props = childProps;
			}
		}

		setAsJson(root);
	}

	private void setAsJson(JSONObject destinationProperties) {
		setPropertyText(destinationProperties.toString());
	}

	@Override
	public void setId(Long id) {
		this.id = id;
	}

	public void setPropertyText(String propertyText) {
		this.propertyText = propertyText;
	}

	@Override
	public void setVersion(Long version) {
		this.version = version;
	}

	@Override
	public String toString() {
		return getProperties().toString();
	}

}