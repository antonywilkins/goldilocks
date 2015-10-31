package goldilocks.domain.appointment;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ServiceBookingIsForStaffServicesOrGapConstraintValidator
		implements ConstraintValidator<ServiceBookingIsForStaffServicesOrGapConstraint, ServiceBooking> {

	@Override
	public void initialize(ServiceBookingIsForStaffServicesOrGapConstraint constraintAnnotation) {
	}

	@Override
	public boolean isValid(ServiceBooking value, ConstraintValidatorContext context) {
		return (value.getService() == null) == (value.getStaff() == null);
	}

}
