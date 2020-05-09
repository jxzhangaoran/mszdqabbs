package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.CollectionDAO;
import matsk.mszdqabbs.DAO.FollowDAO;
import matsk.mszdqabbs.DAO.QuestionDAO;
import matsk.mszdqabbs.Pojo.Question;
import matsk.mszdqabbs.Pojo.User;
import matsk.mszdqabbs.Scheduled.CleanUnusedContentImageSchedule;
import matsk.mszdqabbs.Service.QuestionService;
import matsk.mszdqabbs.Service.RedisService;
import matsk.mszdqabbs.Service.UserService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.TokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuestionServiceImpl implements QuestionService {
    @Autowired
    private QuestionDAO questionDAO;
    @Autowired
    private FollowDAO followDAO;
    @Autowired
    private CollectionDAO collectionDAO;
    @Autowired
    private UserService userService;
    @Autowired
    private RedisService redisService;

    private static final int howManyForEachPage = 3;//每页显示几个问题

    @Override
    @Transactional
    public String insertNewQuestion(String title, String detail, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer questioner = TokenUtils.getUid(request);
        if(title != null && questioner != null) {
            Question newQuestion = new Question(
                    0,
                    title,
                    detail,
                    questioner,
                    null,
                    null,
                    0);
            if(questionDAO.insertNewQuestion(newQuestion) == 1) {
                resultMap.put("success","true");
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getSomeQuestionNew(int pageIndex, HttpServletRequest request) {
        return getSomeQuestion(0, pageIndex);
    }

    @Override
    @Transactional
    public String getSomeQuestionPopular(int pageIndex, HttpServletRequest request) {
        return getSomeQuestion(1, pageIndex);
    }

    @Override
    public String getTotalPageCount() {
        //向上取整
        double pageCount = Math.ceil(questionDAO.getAllQuestionCount() / (double)howManyForEachPage);
        Map<String, Integer> resultMap = new HashMap<>();
        resultMap.put("totalPageCount",(int)pageCount);
        return JacksonUtils.mapToJson(resultMap);
    }

    private String getSomeQuestion(int type, int pageIndex) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Question> someQuestion = null;
        //防止用户请求非法页面
        int totalPageCount = questionDAO.getAllQuestionCount() / howManyForEachPage + 1;
        if(pageIndex > totalPageCount) {
            //直接返回最后一个页面
            pageIndex = totalPageCount;
        } else if(pageIndex < 1) pageIndex = 1;//直接返回第一个页面
        if(type == 0) {//获取最新问题
            someQuestion = questionDAO.getSomeQuestionNew(
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        } else if(type == 1) {//获取最热问题
            someQuestion = questionDAO.getSomeQuestionPopular(
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        }
        if (someQuestion != null) {
            for(Question q : someQuestion) {
                //每个问题列表要显示的内容包括如下几个部分，用Map装载
                Map<String, Object> eachQuestion = new HashMap<>();
                //问题主体
                eachQuestion.put("question",q);
                //问题作者
                List<User> questioner = questionDAO.getQuestionerOf(q.getId());
                if(questioner.size() == 1) {
                    eachQuestion.put("questionerId",questioner.get(0).getId());
                    eachQuestion.put("questionerNickName",questioner.get(0).getNickname());
                    eachQuestion.put("questionerHeadPhotoUrl",questioner.get(0).getHead_photo_url());
                }
                //收藏次数
                int collectionCount = redisService.getCollectionCount(q.getId(), 2);
                eachQuestion.put("collectionCount",collectionCount);
                //点赞次数
                int likeCount = redisService.getEvaluateCount(q.getId(), 2, 1);
                eachQuestion.put("likeCount",likeCount);
                //回答数量
                int answerCount = questionDAO.getAnswerCount(q.getId());
                eachQuestion.put("answerCount",answerCount);
                //尝试查找问题内容里是否有图片链接，如果有就加入结果集里，将在网页显示预览图
                List<String> imagesOfDetail = CleanUnusedContentImageSchedule.analyzeContent(q.getDetail());
                if(imagesOfDetail != null && imagesOfDetail.size() > 0) {
                    eachQuestion.put("previewImageUrl", imagesOfDetail.get(0));
                } else eachQuestion.put("previewImageUrl", "");
                //浏览次数包含在问题主体对象里
                //加入结果集
                resultList.add(eachQuestion);
            }
        }
        try {
            return JacksonUtils.obj2json(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    @Transactional
    public String getSpecificQuestionById(int questionId, HttpServletRequest request) {
        Map<String, Object> resultMap = null;
        List<Question> thisQuestion = questionDAO.getQuestionById(questionId);
        //问题存在并且不重复
        if (thisQuestion != null && thisQuestion.size() == 1) {
            resultMap = new HashMap<>();
            Integer questionerId = thisQuestion.get(0).getQuestioner();
            //作者存在
            if(questionerId != null) {
                try {
                    resultMap.putAll(userService.getUserInfoToShowAside(questionerId));
                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
                resultMap.put("question", thisQuestion.get(0));
                resultMap.put("answerCount", questionDAO.getAnswerCount(questionId));
                resultMap.put("collectionCount", redisService.getCollectionCount(questionId, 2));
                resultMap.put("likeCount", redisService.getEvaluateCount(questionId, 2, 1));
                //用户未登录情况下，默认未关注、未收藏
                resultMap.put("isAlreadyFollow","false");
                resultMap.put("isAlreadyCollect","false");
                //判断用户是否登录，如果登录，需要判断用户是否已经关注作者、是否已经收藏问题
                Integer loginUid = TokenUtils.getUid(request);
                if(loginUid != null) {
                    //是否已经关注作者
                    if(followDAO.isAlreadyFollow(loginUid, questionerId) >= 1) {
                        resultMap.put("isAlreadyFollow","true");
                    }
                    //是否已收藏此问题
                    if(collectionDAO.isAlreadyCollect(questionId, loginUid, 2) >= 1) {
                        resultMap.put("isAlreadyCollect","true");
                    }
                }
            }
        }
        //被浏览次数+1
        questionDAO.beBrowsed(questionId);
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String likeOrDislike(int questionId, int likeOrDislike) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        if(likeOrDislike == 0 || likeOrDislike == 1) {
            redisService.likeOrDislike(questionId, 2, likeOrDislike);
            resultMap.put("success","true");
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getQuestionsAskedBy(Integer questioner) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Question> questionsList = questionDAO.getQuestionsAskedBy(questioner);

        for(Question a : questionsList) {
            Map<String, Object> eachQuestionMap = new HashMap<>();
            eachQuestionMap.put("questionId",a.getId());
            eachQuestionMap.put("lastUpdateTime",a.getLast_update_time() == null
                    ? a.getSubmit_time() : a.getLast_update_time());
            eachQuestionMap.put("title",a.getTitle());
            if(questionDAO.getAnswerCount(a.getId()) > 0) {
                eachQuestionMap.put("hasAnswer","true");
            } else {
                eachQuestionMap.put("hasAnswer","false");
            }
            resultList.add(eachQuestionMap);
        }
        //按照lastUpdateTime降序排序
        resultList.sort((o1, o2) -> {
            Timestamp t1 = (Timestamp) o1.get("lastUpdateTime");
            Timestamp t2 = (Timestamp) o2.get("lastUpdateTime");
            return t2.compareTo(t1);
        });

        try {
            return JacksonUtils.obj2json(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public String getQuestionToEdit(Integer questionId, HttpServletRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success","false");
        resultMap.put("reason","找不到此问题！");
        List<Question> toEditQuestion = questionDAO.getQuestionById(questionId);
        if(toEditQuestion != null && toEditQuestion.size() == 1) {
            if(TokenUtils.getUid(request).equals(toEditQuestion.get(0).getQuestioner())) {
                resultMap.put("questionId",toEditQuestion.get(0).getId());
                resultMap.put("title",toEditQuestion.get(0).getTitle());
                resultMap.put("detail",toEditQuestion.get(0).getDetail());
                resultMap.put("success","true");
                resultMap.remove("reason");
            } else {
                resultMap.put("reason","无修改权限！");
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String updateQuestion(Integer questionId, String newTitle, String newDetail, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer author = TokenUtils.getUid(request);
        List<User> authorOf = questionDAO.getQuestionerOf(questionId);
        if(authorOf != null && authorOf.size() == 1 && authorOf.get(0).getId().equals(author)) {
            if(newTitle != null && newTitle.length() < 50 && newDetail != null) {
                if (questionDAO.updateQuestion(questionId, newTitle, newDetail) == 1) {
                    resultMap.put("success", "true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String getQuestionsCollectedBy(Integer collector) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Question> questionsList = questionDAO.getQuestionsCollectedBy(collector);

        for(Question q : questionsList) {
            Map<String, Object> eachQuestionMap = new HashMap<>();
            eachQuestionMap.put("questionId",q.getId());
            eachQuestionMap.put("lastUpdateTime",q.getLast_update_time() == null
                    ? q.getSubmit_time() : q.getLast_update_time());
            eachQuestionMap.put("title",q.getTitle());
            resultList.add(eachQuestionMap);
        }
        //按照lastUpdateTime降序排序
        resultList.sort((o1, o2) -> {
            Timestamp t1 = (Timestamp) o1.get("lastUpdateTime");
            Timestamp t2 = (Timestamp) o2.get("lastUpdateTime");
            return t2.compareTo(t1);
        });

        try {
            return JacksonUtils.obj2json(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    @Transactional
    public String deleteQuestion(Integer questionId, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer questioner = TokenUtils.getUid(request);
        List<User> questionerOf = questionDAO.getQuestionerOf(questionId);
        if(questionerOf != null && questionerOf.size() == 1 && questionerOf.get(0).getId().equals(questioner)) {
            try {
                questionDAO.deleteQuestionAndAssociations(questionId);
                resultMap.put("success", "true");
            } catch (RuntimeException e) {
                e.printStackTrace();
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }
}
