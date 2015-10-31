package goldilocks.util.domain;

import java.io.IOException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

public class JsonInstantSerializer extends JsonSerializer<Instant> {

	private String format(Instant value) {
		if (value == null) {
			return null;
		}
		String formattedDate = DateTimeFormatter.ISO_INSTANT.format(value);
		return formattedDate;
	}

	@Override
	public void serialize(Instant value, JsonGenerator gen,
			SerializerProvider ser) throws IOException, JsonProcessingException {
		String formattedDate = format(value);
		gen.writeString(formattedDate);
	}

}
