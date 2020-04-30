package matsk.mszdqabbs.Service;

import java.util.List;
import java.util.Map;

public interface SearchService {

    Map<String, List<Map<String, String>>> searchPreview(String queryStr);
}
