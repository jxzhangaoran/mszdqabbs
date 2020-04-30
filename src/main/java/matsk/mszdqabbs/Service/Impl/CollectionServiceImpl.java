package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.CollectionDAO;
import matsk.mszdqabbs.Service.CollectionService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.TokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Service
public class CollectionServiceImpl implements CollectionService {
    @Autowired
    private CollectionDAO collectionDAO;

    @Override
    @Transactional
    public String toggleCollect(Integer collection_id, Integer collection_type, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer collector = TokenUtils.getUid(request);
        if(collector != null) {
            if(collectionDAO.isAlreadyCollect(collection_id, collector, collection_type) >= 1) {
                if(collectionDAO.cancel(collection_id, collector, collection_type) == 1) {
                    resultMap.put("success","true");
                    resultMap.put("type","cancel");
                }
            } else {
                if(collectionDAO.collect(collection_id, collector, collection_type) == 1) {
                    resultMap.put("success","true");
                    resultMap.put("type","collect");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }
}
