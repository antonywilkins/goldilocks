package goldilocks.util.text;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class TextUtil {

	private static Pattern findAccentsPattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

	private static Map<Character, Character> visualEquivalents = new HashMap<>();

	static {
		visualEquivalents.put('ł', 'l');
		visualEquivalents.put('đ', 'd');
		visualEquivalents.put('ħ', 'h');

		visualEquivalents.put('Ł', 'L');
		visualEquivalents.put('Đ', 'D');
		visualEquivalents.put('Ħ', 'H');
	}

	public static String like(String text) {
		return new StringBuilder("%").append(text).append("%").toString();
	}

	public static String stripAccents(String input) {
		if (input == null) {
			return null;
		}
		final String decomposed = Normalizer.normalize(input, Normalizer.Form.NFD);
		// Note that this doesn't correctly remove ligatures...
		String stripped = findAccentsPattern.matcher(decomposed).replaceAll("");
		for (Map.Entry<Character, Character> e : visualEquivalents.entrySet()) {
			stripped = stripped.replace(e.getKey(), e.getValue());
		}
		return stripped;
	}
}
