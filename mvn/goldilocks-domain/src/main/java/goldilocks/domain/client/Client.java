package goldilocks.domain.client;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.ForeignKey;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

import goldilocks.util.domain.CompareUtil;
import goldilocks.util.domain.DomainObjectBase;
import goldilocks.util.text.TextUtil;

@Entity
@Validated
@SuppressWarnings("deprecation")
@Table(indexes = { @Index(name = "IDX_CLIENT_NAMES", columnList = "FIRST_NAME_STRIPPED,LAST_NAME_STRIPPED") })
public class Client extends DomainObjectBase<Client, Long>implements Serializable, Comparable<Client> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    @NotNull
    private String firstName;

    @Column(name = "FIRST_NAME_STRIPPED", nullable = false)
    @NotNull
    private String firstNameStripped;

    @Column(nullable = false)
    @NotNull
    private String lastName;

    @Column(name = "LAST_NAME_STRIPPED", nullable = false)
    @NotNull
    private String lastNameStripped;

    @Column(nullable = false)
    @NotNull
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    @NotNull
    private Gender gender = Gender.FEMALE;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "CLIENT_PHONE_NUMBERS")
    @ForeignKey(name = "FK_CLIENT_PHONE_NUMBERS_CLIENT")
    private List<PhoneNumber> phoneNumbers = new ArrayList<>();

    @Column(name = "ADDRESS", nullable = true, length = 1000)
    private String address;

    @Column(name = "EMAIL", nullable = true, length = 100)
    private String email;

    @Column(name = "COMMENTS", nullable = true, length = 1000)
    private String comments;

    @Version
    private Long version;

    public Client() {
    }

    public Client(String firstName, String lastName) {
        setFirstName(firstName);
        setLastName(lastName);
    }

    @Override
    public int compareTo(Client o) {
        int c = CompareUtil.compare(getLastName(), o.getLastName());
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(getFirstName(), o.getFirstName());
        if (c != 0) {
            return c;
        }
        c = CompareUtil.compare(id, o.id);
        return c;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        Client other = (Client) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        return true;
    }

    public String getAddress() {
        return address;
    }

    public String getComments() {
        return comments;
    }

    @JsonSerialize(using = LocalDateSerializer.class)
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    @JsonIgnore
    public String getFirstNameStripped() {
        return firstNameStripped;
    }

    public Gender getGender() {
        return gender;
    }

    @Override
    public Long getId() {
        return id;
    }

    public String getLastName() {
        return lastName;
    }

    @JsonIgnore
    public String getLastNameStripped() {
        return lastNameStripped;
    }

    public List<PhoneNumber> getPhoneNumbers() {
        return phoneNumbers;
    }

    @Override
    public Long getVersion() {
        return version;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    @JsonDeserialize(using = LocalDateDeserializer.class)
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        this.firstNameStripped = TextUtil.stripAccents(firstName);
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        this.lastNameStripped = TextUtil.stripAccents(lastName);
    }

    public void setPhoneNumbers(List<PhoneNumber> phone) {
        this.phoneNumbers = phone;
    }

    @Override
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return String.format("%s[%s, '%s %s']", getClass().getSimpleName(), id, getFirstName(), getLastName());
    }

}