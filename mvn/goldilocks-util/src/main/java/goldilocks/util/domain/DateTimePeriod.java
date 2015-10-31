package goldilocks.util.domain;

import java.time.Instant;

public interface DateTimePeriod {

	Instant getEnd();

	Instant getStart();
}
