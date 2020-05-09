package matsk.mszdqabbs.Service;

public interface RedisService {

    Integer getEvaluateCount(int to_evaluate, int evaluate_type, int likeOrDislike);

    Integer likeOrDislike(int to_evaluate, int evaluate_type, int likeOrDislike);

    Integer getCollectionCount(int collection_id, int collection_type);

    String toggleCollect(Integer collection_id, Integer collection_type, Integer collector);
}
