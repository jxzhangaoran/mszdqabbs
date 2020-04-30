package matsk.mszdqabbs.Service;

import javax.servlet.http.HttpServletRequest;

public interface CollectionService {

    String toggleCollect(Integer collection_id, Integer collection_type, HttpServletRequest request);

}
