package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.*;
import matsk.mszdqabbs.Pojo.Answer;
import matsk.mszdqabbs.Pojo.User;
import matsk.mszdqabbs.Scheduled.CleanUnusedContentImageSchedule;
import matsk.mszdqabbs.Service.AnswerService;
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
public class AnswerServiceImpl implements AnswerService {
    @Autowired
    private AnswerDAO answerDAO;
    @Autowired
    private EvaluateDAO evaluateDAO;
    @Autowired
    private FollowDAO followDAO;
    @Autowired
    private CollectionDAO collectionDAO;
    @Autowired
    private UserService userService;

    private static final int howManyForEachPage = 3;//每页显示几篇回答

    @Override
    @Transactional
    public String insertNewAnswer(Integer which_question, String content, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        //首先要从request里面尝试取出用户id，获取用户登录状态
        Integer uid = TokenUtils.getUid(request);
        if(uid != null) {
            //数据合法性检验
            if(content != null && content.length() > 0) {
                Answer newAnswer = new Answer(
                        0,
                        which_question,
                        uid,
                        content,
                        null,
                        null,
                        null
                );
                if(answerDAO.insertNewAnswer(newAnswer) == 1) {
                    resultMap.put("success","true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getSomeAnswerNew(Integer which_question, int pageIndex, HttpServletRequest request) {
        return getSomeAnswer(which_question,0, pageIndex);
    }

    @Override
    @Transactional
    public String getSomeAnswerPopular(Integer which_question, int pageIndex, HttpServletRequest request) {
        return getSomeAnswer(which_question,1, pageIndex);
    }

    @Override
    public String getTotalPageCount(Integer which_question) {
        //向上取整
        double pageCount = Math.ceil(answerDAO.getAllAnswerCountOf(which_question) / (double)howManyForEachPage);
        Map<String, Integer> resultMap = new HashMap<>();
        resultMap.put("totalPageCount",(int)pageCount);
        return JacksonUtils.mapToJson(resultMap);
    }

    private String getSomeAnswer(Integer which_question, int type, int pageIndex) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Answer> someAnswer = null;
        //防止用户请求非法页面
        int totalPageCount = answerDAO.getAllAnswerCountOf(which_question) / howManyForEachPage + 1;
        if(pageIndex > totalPageCount) {
            //直接返回最后一个页面
            pageIndex = totalPageCount;
        } else if(pageIndex < 1) pageIndex = 1;//直接返回第一个页面
        if(type == 0) {//获取最新回答
            someAnswer = answerDAO.getSomeAnswerNew(which_question,
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        } else if(type == 1) {//获取最热回答
            someAnswer = answerDAO.getSomeAnswerPopular(which_question,
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        }
        if (someAnswer != null) {
            for(Answer a : someAnswer) {
                //每个回答列表要显示的内容包括如下几个部分，用Map装载
                Map<String, Object> eachAnswer = new HashMap<>();
                //回答主体
                eachAnswer.put("answer",a);
                //回答回答者
                List<User> answerer = answerDAO.getAnswererOf(a.getId());
                if(answerer.size() == 1) {
                    eachAnswer.put("answererId",answerer.get(0).getId());
                    eachAnswer.put("answererNickName",answerer.get(0).getNickname());
                    eachAnswer.put("answererHeadPhotoUrl",answerer.get(0).getHead_photo_url());
                }
                //收藏次数
                int collectionCount = answerDAO.getCollectionCount(a.getId());
                eachAnswer.put("collectionCount",collectionCount);
                //点赞次数
                int likeCount = answerDAO.getLikeCount(a.getId());
                eachAnswer.put("likeCount",likeCount);
                //评论数量
                int commentCount = answerDAO.getCommentCount(a.getId());
                eachAnswer.put("commentCount",commentCount);
                //尝试查找回答内容里是否有图片链接，如果有就加入结果集里，将在网页显示预览图
                List<String> imagesOfContent = CleanUnusedContentImageSchedule.analyzeContent(a.getContent());
                if(imagesOfContent != null && imagesOfContent.size() > 0) {
                    eachAnswer.put("previewImageUrl", imagesOfContent.get(0));
                } else eachAnswer.put("previewImageUrl", "");
                //浏览次数包含在回答主体对象里
                //加入结果集
                resultList.add(eachAnswer);
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
    public String getSpecificAnswerById(int answerId, HttpServletRequest request) {
        Map<String, Object> resultMap = null;
        List<Answer> thisAnswer = answerDAO.getAnswerById(answerId);
        //回答存在并且不重复
        if (thisAnswer != null && thisAnswer.size() == 1) {
            resultMap = new HashMap<>();
            Integer answererId = thisAnswer.get(0).getAnswerer();
            //回答者存在
            if(answererId != null) {
                try {
                    resultMap.putAll(userService.getUserInfoToShowAside(answererId));
                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
                resultMap.put("answer",thisAnswer.get(0));
                resultMap.put("commentCount",answerDAO.getCommentCount(answerId));
                resultMap.put("collectionCount",answerDAO.getCollectionCount(answerId));
                resultMap.put("likeCount",answerDAO.getLikeCount(answerId));
                resultMap.put("questionId", thisAnswer.get(0).getWhich_question());
                resultMap.put("questionTitle", answerDAO.getQuestionTitleByAnswerId(answerId));
                resultMap.put("questionAnswerCount", answerDAO.getQuestionAnswerCountByAnswerId(answerId));
                //用户未登录情况下，默认未关注、未收藏
                resultMap.put("isAlreadyFollow","false");
                resultMap.put("isAlreadyCollect","false");
                //判断用户是否登录，如果登录，需要判断用户是否已经关注回答者、是否已经收藏回答
                Integer loginUid = TokenUtils.getUid(request);
                if(loginUid != null) {
                    //是否已经关注回答者
                    if(followDAO.isAlreadyFollow(loginUid, answererId) >= 1) {
                        resultMap.put("isAlreadyFollow","true");
                    }
                    //是否已收藏此回答
                    if(collectionDAO.isAlreadyCollect(answerId, loginUid, 0) >= 1) {
                        resultMap.put("isAlreadyCollect","true");
                    }
                }
            }
        }
        //被浏览次数+1
        answerDAO.beBrowsed(answerId);
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String likeOrDislike(int answerId, int likeOrDislike) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        if(likeOrDislike == 0) {
            if(evaluateDAO.dislike(answerId,0) == 1) {
                resultMap.put("success","true");
            }
        } else if(likeOrDislike == 1) {
            if(evaluateDAO.like(answerId,0) == 1) {
                resultMap.put("success","true");
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getAnswersWriteBy(Integer answerer) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Answer> answersList = answerDAO.getAnswersWriteBy(answerer);

        for(Answer a : answersList) {
            Map<String, Object> eachAnswerMap = new HashMap<>();
            eachAnswerMap.put("answerId",a.getId());
            eachAnswerMap.put("answerContent",a.getContent());
            eachAnswerMap.put("questionId", a.getWhich_question());
            eachAnswerMap.put("questionTitle", answerDAO.getQuestionTitleByAnswerId(a.getId()));
            eachAnswerMap.put("lastUpdateTime",a.getLast_update_time() == null
                    ? a.getAnswer_time() : a.getLast_update_time());
            resultList.add(eachAnswerMap);
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
    public String getAnswerToEdit(Integer answerId, HttpServletRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success","false");
        resultMap.put("reason","找不到此回答！");
        List<Answer> toEditAnswer = answerDAO.getAnswerById(answerId);
        if(toEditAnswer != null && toEditAnswer.size() == 1) {
            if(TokenUtils.getUid(request).equals(toEditAnswer.get(0).getAnswerer())) {
                resultMap.put("answerId",toEditAnswer.get(0).getId());
                resultMap.put("questionId",toEditAnswer.get(0).getWhich_question());
                resultMap.put("questionTitle",answerDAO.getQuestionTitleByAnswerId(toEditAnswer.get(0).getId()));
                resultMap.put("content",toEditAnswer.get(0).getContent());
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
    public String updateAnswer(Integer answerId,
                                String newContent,
                                HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer answerer = TokenUtils.getUid(request);
        List<User> answererOf = answerDAO.getAnswererOf(answerId);
        if(answererOf != null && answererOf.size() == 1 && answererOf.get(0).getId().equals(answerer)) {
            if(newContent != null) {
                if (answerDAO.updateAnswer(answerId, newContent) == 1) {
                    resultMap.put("success", "true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String deleteAnswer(Integer answerId, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer answerer = TokenUtils.getUid(request);
        List<User> answererOf = answerDAO.getAnswererOf(answerId);
        if(answererOf != null && answererOf.size() == 1 && answererOf.get(0).getId().equals(answerer)) {
            try {
                answerDAO.deleteAnswerAndAssociations(answerId);
                resultMap.put("success", "true");
            } catch (RuntimeException e) {
                e.printStackTrace();
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getAnswersCollectedBy(Integer collector) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Answer> answersList = answerDAO.getAnswersCollectedBy(collector);

        for(Answer a : answersList) {
            Map<String, Object> eachAnswerMap = new HashMap<>();
            eachAnswerMap.put("answerId",a.getId());
            eachAnswerMap.put("answerContent",a.getContent());
            eachAnswerMap.put("questionId", a.getWhich_question());
            eachAnswerMap.put("questionTitle", answerDAO.getQuestionTitleByAnswerId(a.getId()));
            eachAnswerMap.put("lastUpdateTime",a.getLast_update_time() == null
                    ? a.getAnswer_time() : a.getLast_update_time());
            resultList.add(eachAnswerMap);
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
}
