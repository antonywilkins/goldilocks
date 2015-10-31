package goldilocks.util.domain;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

public class SortUtil {

	public static Sort createSort(String sortField, String[] remainingSortOrder) {
		Sort sort = null;
		Sort.Direction dir = Direction.ASC;
		if (sortField != null) {
			if (sortField.startsWith("-")) {
				dir = Direction.DESC;
			}
			if (sortField.startsWith("-") || sortField.startsWith("+")) {
				sortField = sortField.substring(1);
			}
		}

		List<String> defaultSort = new ArrayList<>(
				Arrays.asList(remainingSortOrder));

		if (sortField == null) {
			sortField = defaultSort.get(0);
			defaultSort.remove(sortField);
		}

		sort = new Sort(dir, sortField);
		for (String f : defaultSort) {
			sort = sort.and(new Sort(Direction.ASC, f));
		}
		return sort;
	}

}
