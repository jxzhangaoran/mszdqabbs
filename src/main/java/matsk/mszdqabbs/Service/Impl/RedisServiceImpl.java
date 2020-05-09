package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.*;
import matsk.mszdqabbs.Service.RedisService;
import matsk.mszdqabbs.Utils.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisServiceImpl implements RedisService {
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private AnswerDAO answerDAO;
    @Autowired
    private QuestionDAO questionDAO;
    @Autowired
    private CommentDAO commentDAO;
    @Autowired
    private CollectionDAO collectionDAO;
    @Autowired
    private EvaluateDAO evaluateDAO;

    private static final String[] evaluateTypeMapping = {"answer", "article", "question", "comment"};

    private static final String[] collectionTypeMapping = {"answer", "article", "question"};

    private static final long CACHE_EXPIRE_DURATION = TimeUnit.DAYS.toSeconds(1);//缓存过期时间一天

    /**
     * 获取指定评价类型的赞或踩的数量。
     *
     * @param to_evaluate   评价对象的ID
     * @param evaluate_type 评价对象类型，0代表回答，1代表文章，2代表问题，3代表评论
     * @param likeOrDislike 0代表踩，1代表赞
     * @return 评价值
     */
    public Integer getEvaluateCount(int to_evaluate, int evaluate_type, int likeOrDislike) {
        if (evaluate_type < 0
                || evaluate_type > 3
                || likeOrDislike < 0
                || likeOrDislike > 1) return null;
        Object countStr = redisUtil.hget("evaluate:" + evaluateTypeMapping[evaluate_type], to_evaluate + ":" + likeOrDislike);
        Integer res;
        if (countStr == null) {
            res = getEvaluateCountFromDatabaseAndFlushCache(to_evaluate, evaluate_type, likeOrDislike);
        } else {
            res = Integer.parseInt(countStr + "");
        }
        return res;
    }

    /**
     * 当Redis缓存中不存在需要的评价值时，从数据库读出，并写入Redis
     *
     * @param to_evaluate   评价对象的ID
     * @param evaluate_type 评价对象类型，0代表回答，1代表文章，2代表问题，3代表评论
     * @param likeOrDislike 0代表踩，1代表赞
     * @return 评价值
     */
    private Integer getEvaluateCountFromDatabaseAndFlushCache(int to_evaluate, int evaluate_type, int likeOrDislike) {
        Integer countVal = null;
        switch (evaluateTypeMapping[evaluate_type]) {
            case "answer": {
                countVal = likeOrDislike == 0 ? answerDAO.getDislikeCount(to_evaluate)
                        : answerDAO.getLikeCount(to_evaluate);
                break;
            }
            case "article": {
                countVal = likeOrDislike == 0 ? articleDAO.getDislikeCount(to_evaluate)
                        : articleDAO.getLikeCount(to_evaluate);
                break;
            }
            case "question": {
                countVal = likeOrDislike == 0 ? questionDAO.getDislikeCount(to_evaluate)
                        : questionDAO.getLikeCount(to_evaluate);
                break;
            }
            case "comment":
                countVal = likeOrDislike == 0 ? commentDAO.getDislikeCount(to_evaluate)
                        : commentDAO.getLikeCount(to_evaluate);
                break;
        }
        if (redisUtil.getExpire("evaluate:" + evaluateTypeMapping[evaluate_type]) > 0) {
            //若hash已存在，则直接存入新键值对，不刷新过期时间
            redisUtil.hset("evaluate:" + evaluateTypeMapping[evaluate_type],
                    to_evaluate + ":" + likeOrDislike, countVal);
        } else {
            //否则创建键值对并插入值，设置过期时间
            redisUtil.hset("evaluate:" + evaluateTypeMapping[evaluate_type],
                    to_evaluate + ":" + likeOrDislike, countVal,
                    CACHE_EXPIRE_DURATION);
        }
        return countVal;
    }

    /**
     * 点赞或踩
     * @param to_evaluate   评价对象的ID
     * @param evaluate_type 评价对象类型，0代表回答，1代表文章，2代表问题，3代表评论
     * @param likeOrDislike 0代表踩，1代表赞
     * @return 1代表操作成功，否则返回null
     */
    @Override
    public Integer likeOrDislike(int to_evaluate, int evaluate_type, int likeOrDislike) {
        if (evaluate_type < 0
                || evaluate_type > 3
                || likeOrDislike < 0
                || likeOrDislike > 1) return null;
        //插入mysql
        int insertSuccess = likeOrDislike == 0 ? evaluateDAO.dislike(to_evaluate, evaluate_type)
                : evaluateDAO.like(to_evaluate, evaluate_type);
        if (insertSuccess == 1) {
            //redis自增
            redisUtil.hincr("evaluate:" + evaluateTypeMapping[evaluate_type],
                    to_evaluate + ":" + likeOrDislike, 1);
            return 1;
        }
        return null;
    }

    /**
     * 获取收藏数
     * @param collection_id 收藏对象的ID
     * @param collection_type 收藏对象类型，0代表回答，1代表文章，2代表问题
     * @return 收藏数
     */
    @Override
    public Integer getCollectionCount(int collection_id, int collection_type) {
        if (collection_type < 0
                || collection_type > 2) return null;
        Object countStr = redisUtil.hget("collection:" + collectionTypeMapping[collection_type], collection_id + "");
        Integer res;
        if (countStr == null) {
            res = getCollectionCountFromDatabaseAndFlushCache(collection_id, collection_type);
        } else {
            res = Integer.parseInt(countStr + "");
        }
        return res;
    }

    /**
     * 当Redis缓存中不存在需要的收藏数时，从数据库中读取并写入Redis
     *
     * @param collection_id 收藏对象的ID
     * @param collection_type 收藏对象类型，0代表回答，1代表文章，2代表问题
     * @return 收藏数
     */
    private Integer getCollectionCountFromDatabaseAndFlushCache(int collection_id, int collection_type) {
        Integer countVal = null;
        switch (collectionTypeMapping[collection_type]) {
            case "answer": {
                countVal = answerDAO.getCollectionCount(collection_id);
                break;
            }
            case "article": {
                countVal = articleDAO.getCollectionCount(collection_id);
                break;
            }
            case "question": {
                countVal = questionDAO.getCollectionCount(collection_id);
                break;
            }
        }
        if (redisUtil.getExpire("collection:" + collectionTypeMapping[collection_type]) > 0) {
            //若hash已存在，则直接存入新键值对，不刷新过期时间
            redisUtil.hset("collection:" + collectionTypeMapping[collection_type],
                    collection_id + "", countVal);
        } else {
            //否则创建键值对并插入值，设置过期时间
            redisUtil.hset("collection:" + collectionTypeMapping[collection_type],
                    collection_id + "", countVal,
                    CACHE_EXPIRE_DURATION);
        }
        return countVal;
    }

    /**
     * 收藏或取消收藏
     * @param collection_id 收藏对象的ID
     * @param collection_type 收藏对象类型，0代表回答，1代表文章，2代表问题
     * @param collector 收藏者
     * @return 取消（cancel）或收藏（collect）或null（数据非法）
     */
    @Override
    public String toggleCollect(Integer collection_id, Integer collection_type, Integer collector) {
        if (collection_type < 0
                || collection_type > 2
                || collector < 0) return null;
        if (collectionDAO.isAlreadyCollect(collection_id, collector, collection_type) >= 1) {
            if (collectionDAO.cancel(collection_id, collector, collection_type) == 1) {
                redisUtil.hdecr("collection:" + collectionTypeMapping[collection_type],
                        collection_id + "", 1);
                return "cancel";
            }
        } else {
            if (collectionDAO.collect(collection_id, collector, collection_type) == 1) {
                redisUtil.hincr("collection:" + collectionTypeMapping[collection_type],
                        collection_id + "", 1);
                return "collect";
            }
        }
        return null;
    }
}