package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.AnswerDAO;
import matsk.mszdqabbs.DAO.ArticleDAO;
import matsk.mszdqabbs.DAO.CommentDAO;
import matsk.mszdqabbs.Pojo.Comment;
import matsk.mszdqabbs.Service.CommentService;
import matsk.mszdqabbs.Service.RedisService;
import matsk.mszdqabbs.Service.UserService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.TokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.*;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private CommentDAO commentDAO;
    @Autowired
    private AnswerDAO answerDAO;
    @Autowired
    private UserService userService;
    @Autowired
    private RedisService redisService;

    private static final int howManyToShowAtOneTime = 5;//一次性显示多少评论，更多评论需要用户手动点击“查看所有评论”

    @Override
    @Transactional
    public String handleNewComment(Integer to_comment,
                                   Integer to_comment_type,
                                   String content,
                                   HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        //评论内容长度是否合法
        if(content != null && content.length() > 0 && content.length() <= 200) {
            Integer uid = TokenUtils.getUid(request);
            //验证用户已登录
            if(uid != null) {
                //若评论类型是文章
                if(to_comment_type.equals(1)) {
                    //查找对应文章是否存在
                    if(articleDAO.getArticleById(to_comment).size() == 1) {
                        //构造评论实体
                        Comment newComment = new Comment(
                                0,
                                content,
                                uid,
                                to_comment,
                                to_comment_type,
                                new Timestamp(System.currentTimeMillis())
                        );
                        //执行插入
                        if(commentDAO.comment(newComment) == 1) {
                            resultMap.put("success","true");
                            resultMap.put("type","article");
                        }
                    }
                } else if(to_comment_type.equals(0)) {
                    //查找对应回答是否存在
                    if(answerDAO.getAnswerById(to_comment).size() == 1) {
                        //构造评论实体
                        Comment newComment = new Comment(
                                0,
                                content,
                                uid,
                                to_comment,
                                to_comment_type,
                                new Timestamp(System.currentTimeMillis())
                        );
                        //执行插入
                        if(commentDAO.comment(newComment) == 1) {
                            resultMap.put("success","true");
                            resultMap.put("type","answer");
                        }
                    }
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getTopComment(Integer to_comment, Integer to_comment_type) {
        return getComments(to_comment, to_comment_type, false);
    }

    @Override
    @Transactional
    public String getRemainAllComment(Integer to_comment, Integer to_comment_type) {
        return getComments(to_comment, to_comment_type, true);
    }

    private String getComments(Integer to_comment, Integer to_comment_type, boolean needRemainAll) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        Map<String, Object> resultMap = new HashMap<>();
        List<Comment> comments;
        resultMap.put("success","false");
        if(needRemainAll) {
            comments = commentDAO.getRemainAllComments(howManyToShowAtOneTime,
                    to_comment,
                    to_comment_type);
        } else {
            comments = commentDAO.getTopComments(howManyToShowAtOneTime,
                    to_comment,
                    to_comment_type);
        }
        //使用Set代替List，多个评论如果是同一用户发布，可以减少查询次数
        Set<Integer> commentators = new HashSet<>();
        for(Comment c : comments) {
            commentators.add(c.getCommentator());
        }
        //这个Map记录了每个评论者的用户对象
        Map<Integer, Map<String, Object>> commentatorInfos = new HashMap<>();
        for(Integer commentator : commentators) {
            try {
                commentatorInfos.put(commentator, userService.getUserInfoOfComment(commentator));
            } catch (Exception e) {
                e.printStackTrace();
                return JacksonUtils.mapToJson(resultMap);
            }
        }
        //填充结果List
        for (Comment comment : comments) {
            Map<String, Object> eachComment = new HashMap<>();
            //评论者信息
            eachComment.put("commentator", commentatorInfos.get(comment.getCommentator()));
            //评论主体
            eachComment.put("comment", comment);
            //点赞次数
            eachComment.put("likeCount", redisService.getEvaluateCount(comment.getId(), 3, 1));
            //踩次数
            eachComment.put("dislikeCount", redisService.getEvaluateCount(comment.getId(), 3, 0));
            //加入结果List
            resultList.add(eachComment);
        }
        if(!needRemainAll) {
            //总评论数是否小于最初展示的评论数
            resultMap.put("isThatAll","false");
            if(commentDAO.getCommentCountOf(to_comment, to_comment_type) <= howManyToShowAtOneTime) {
                resultMap.put("isThatAll","true");
            }
        }
        resultMap.put("success","true");
        resultMap.put("comments",resultList);
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String likeOrDislike(int commentId, int likeOrDislike) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        if(likeOrDislike == 0 || likeOrDislike == 1) {
            redisService.likeOrDislike(commentId, 3, likeOrDislike);
            resultMap.put("success","true");
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getCommentsBy(Integer commentator) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Comment> commentList = commentDAO.getCommentsBy(commentator);
        if(commentList != null && commentList.size() > 0) {
            //使用Set来避免重复的数据库查询
            Set<String> commentTo_Set = new HashSet<>();
            //把要查询的对象放在Set里
            for(Comment c : commentList) {
                //如0-19，代表类别为回答、回答ID为19
                commentTo_Set.add(c.getTo_comment_type() + "-" + c.getTo_comment());
            }
            //执行查询，结果保存在两个不同的Map里，分别对应回答评论和文章评论
            Map<Integer, String> answerCommentToWords = new HashMap<>();
            Map<Integer, String> articleCommentToWords = new HashMap<>();

            for(String s : commentTo_Set) {
                //由于每个评论的类别不同，需要对文章评论和回答评论分开处理
                if(s.charAt(0) == '0') {
                    Integer to_comment_id = Integer.parseInt(s.substring(2));
                    //执行回答作者昵称查询
                    List<String> answererNickname = answerDAO.getAnswererNicknameByAnswerId(to_comment_id);
                    if(answererNickname != null && answererNickname.size() == 1) {
                        StringBuilder sb = new StringBuilder(answererNickname.get(0));
                        if(sb.length() > 10) {
                            sb.delete(8, sb.length());
                            sb.append("...");
                        }
                        sb.append("的回答");
                        answerCommentToWords.put(to_comment_id, sb.toString());
                    }
                } else if(s.charAt(0) == '1') {
                    Integer to_comment_id = Integer.parseInt(s.substring(2));
                    //执行文章作者昵称查询
                    List<String> authorNickname = articleDAO.getAuthorNicknameByArticleId(to_comment_id);
                    if(authorNickname != null && authorNickname.size() == 1) {
                        StringBuilder sb = new StringBuilder(authorNickname.get(0));
                        if (sb.length() > 10) {
                            sb.delete(8, sb.length());
                            sb.append("...");
                        }
                        sb.append("的文章");
                        articleCommentToWords.put(to_comment_id, sb.toString());
                    }
                }
            }
            //填充结果集
            for(Comment c : commentList) {
                Map<String, Object> eachCommentMap = new HashMap<>();
                eachCommentMap.put("commentTime", c.getComment_time());
                eachCommentMap.put("commentContent", c.getContent());
                eachCommentMap.put("commentType", c.getTo_comment_type());
                //回答评论
                if(c.getTo_comment_type().equals(0)) {
                    eachCommentMap.put("commentTo", answerCommentToWords.get(c.getTo_comment()));
                    eachCommentMap.put("clickId", c.getTo_comment());
                //文章评论
                } else if(c.getTo_comment_type().equals(1)) {
                    eachCommentMap.put("commentTo", articleCommentToWords.get(c.getTo_comment()));
                    eachCommentMap.put("clickId", c.getTo_comment());
                } else return null;
                resultList.add(eachCommentMap);
            }
        }
        try {
            return JacksonUtils.obj2json(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
