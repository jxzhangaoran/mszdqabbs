package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.*;
import matsk.mszdqabbs.Pojo.Article;
import matsk.mszdqabbs.Pojo.User;
import matsk.mszdqabbs.Scheduled.CleanUnusedContentImageSchedule;
import matsk.mszdqabbs.Service.ArticleService;
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
public class ArticleServiceImpl implements ArticleService {
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private FollowDAO followDAO;
    @Autowired
    private CollectionDAO collectionDAO;
    @Autowired
    private UserService userService;
    @Autowired
    private RedisService redisService;

    private static final int howManyForEachPage = 3;//每页显示几篇文章

    @Override
    @Transactional
    public String insertNewArticle(String title, String content, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        //首先要从request里面尝试取出用户id，获取用户登录状态
        Integer uid = TokenUtils.getUid(request);
        if(uid != null) {
            //数据合法性检验
            if(title != null && title.length() < 50 && content != null) {
                Article newArticle = new Article(
                        0,
                        title,
                        content,
                        uid,
                        //这三个用不上，直接设置null
                        null,null,null);
                if(articleDAO.insertNewArticle(newArticle) == 1) {
                    resultMap.put("success","true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getSomeArticleNew(int pageIndex, HttpServletRequest request) {
        return getSomeArticle(0, pageIndex);
    }

    @Override
    @Transactional
    public String getSomeArticlePopular(int pageIndex, HttpServletRequest request) {
        return getSomeArticle(1, pageIndex);
    }

    @Override
    public String getTotalPageCount() {
        //向上取整
        double pageCount = Math.ceil(articleDAO.getAllArticleCount() / (double)howManyForEachPage);
        Map<String, Integer> resultMap = new HashMap<>();
        resultMap.put("totalPageCount",(int)pageCount);
        return JacksonUtils.mapToJson(resultMap);
    }

    private String getSomeArticle(int type, int pageIndex) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Article> someArticle = null;
        //防止用户请求非法页面
        int totalPageCount = articleDAO.getAllArticleCount() / howManyForEachPage + 1;
        if(pageIndex > totalPageCount) {
            //直接返回最后一个页面
            pageIndex = totalPageCount;
        } else if(pageIndex < 1) pageIndex = 1;//直接返回第一个页面
        if(type == 0) {//获取最新文章
            someArticle = articleDAO.getSomeArticleNew(
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        } else if(type == 1) {//获取最热文章
            someArticle = articleDAO.getSomeArticlePopular(
                    (pageIndex - 1) * howManyForEachPage, howManyForEachPage);
        }
        if (someArticle != null) {
            for(Article a : someArticle) {
                //每个文章列表要显示的内容包括如下几个部分，用Map装载
                Map<String, Object> eachArticle = new HashMap<>();
                //文章主体
                eachArticle.put("article",a);
                //文章作者
                List<User> author = articleDAO.getAuthorOf(a.getId());
                if(author.size() == 1) {
                    eachArticle.put("authorId",author.get(0).getId());
                    eachArticle.put("authorNickName",author.get(0).getNickname());
                    eachArticle.put("authorHeadPhotoUrl",author.get(0).getHead_photo_url());
                }
                //收藏次数
                int collectionCount = redisService.getCollectionCount(a.getId(), 1);
                eachArticle.put("collectionCount", collectionCount);
                //点赞次数
                int likeCount = redisService.getEvaluateCount(a.getId(), 1, 1);
                eachArticle.put("likeCount",likeCount);
                //评论数量
                int commentCount = articleDAO.getCommentCount(a.getId());
                eachArticle.put("commentCount",commentCount);
                //尝试查找文章内容里是否有图片链接，如果有就加入结果集里，将在网页显示预览图
                List<String> imagesOfContent = CleanUnusedContentImageSchedule.analyzeContent(a.getContent());
                if(imagesOfContent != null && imagesOfContent.size() > 0) {
                    eachArticle.put("previewImageUrl", imagesOfContent.get(0));
                } else eachArticle.put("previewImageUrl", "");
                //浏览次数包含在文章主体对象里
                //加入结果集
                resultList.add(eachArticle);
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
    public String getSpecificArticleById(int articleId, HttpServletRequest request) {
        Map<String, Object> resultMap = null;
        List<Article> thisArticle = articleDAO.getArticleById(articleId);
        //文章存在并且不重复
        if (thisArticle != null && thisArticle.size() == 1) {
            resultMap = new HashMap<>();
            Integer authorId = thisArticle.get(0).getAuthor();
            //作者存在
            if(authorId != null) {
                try {
                    resultMap.putAll(userService.getUserInfoToShowAside(authorId));
                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
                resultMap.put("article",thisArticle.get(0));
                resultMap.put("commentCount",articleDAO.getCommentCount(articleId));
                resultMap.put("collectionCount", redisService.getCollectionCount(articleId, 1));
                resultMap.put("likeCount", redisService.getEvaluateCount(articleId, 1, 1));
                //用户未登录情况下，默认未关注、未收藏
                resultMap.put("isAlreadyFollow","false");
                resultMap.put("isAlreadyCollect","false");
                //判断用户是否登录，如果登录，需要判断用户是否已经关注作者、是否已经收藏文章
                Integer loginUid = TokenUtils.getUid(request);
                if(loginUid != null) {
                    //是否已经关注作者
                    if(followDAO.isAlreadyFollow(loginUid, authorId) >= 1) {
                        resultMap.put("isAlreadyFollow","true");
                    }
                    //是否已收藏此文章
                    if(collectionDAO.isAlreadyCollect(articleId, loginUid, 1) >= 1) {
                        resultMap.put("isAlreadyCollect","true");
                    }
                }
            }
        }
        //被浏览次数+1
        articleDAO.beBrowsed(articleId);
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String likeOrDislike(int articleId, int likeOrDislike) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        if(likeOrDislike == 0 || likeOrDislike == 1) {
            redisService.likeOrDislike(articleId, 1, likeOrDislike);
            resultMap.put("success","true");
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String getArticlesWriteBy(Integer author) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Article> articlesList = articleDAO.getArticlesWriteBy(author);

        for(Article a : articlesList) {
            Map<String, Object> eachArticleMap = new HashMap<>();
            eachArticleMap.put("articleId",a.getId());
            eachArticleMap.put("lastUpdateTime",a.getLast_update_time() == null
                    ? a.getSubmit_time() : a.getLast_update_time());
            eachArticleMap.put("title",a.getTitle());
            resultList.add(eachArticleMap);
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
    public String getArticleToEdit(Integer articleId, HttpServletRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success","false");
        resultMap.put("reason","找不到此文章！");
        List<Article> toEditArticle = articleDAO.getArticleById(articleId);
        if(toEditArticle != null && toEditArticle.size() == 1) {
            if(TokenUtils.getUid(request).equals(toEditArticle.get(0).getAuthor())) {
                resultMap.put("articleId",toEditArticle.get(0).getId());
                resultMap.put("title",toEditArticle.get(0).getTitle());
                resultMap.put("content",toEditArticle.get(0).getContent());
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
    public String updateArticle(Integer articleId,
                                String newTitle,
                                String newContent,
                                HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer author = TokenUtils.getUid(request);
        List<User> authorOf = articleDAO.getAuthorOf(articleId);
        if(authorOf != null && authorOf.size() == 1 && authorOf.get(0).getId().equals(author)) {
            if(newTitle != null && newTitle.length() < 50 && newContent != null) {
                if (articleDAO.updateArticle(articleId, newTitle, newContent) == 1) {
                    resultMap.put("success", "true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String deleteArticle(Integer articleId, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer author = TokenUtils.getUid(request);
        List<User> authorOf = articleDAO.getAuthorOf(articleId);
        if(authorOf != null && authorOf.size() == 1 && authorOf.get(0).getId().equals(author)) {
            try {
                articleDAO.deleteArticleAndAssociations(articleId);
                resultMap.put("success", "true");
            } catch (RuntimeException e) {
                e.printStackTrace();
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    public String getArticlesCollectedBy(Integer collector) {
        List<Map<String, Object>> resultList = new ArrayList<>();
        List<Article> articlesList = articleDAO.getArticlesCollectedBy(collector);

        for(Article a : articlesList) {
            Map<String, Object> eachArticleMap = new HashMap<>();
            eachArticleMap.put("articleId",a.getId());
            eachArticleMap.put("lastUpdateTime",a.getLast_update_time() == null
                    ? a.getSubmit_time() : a.getLast_update_time());
            eachArticleMap.put("title",a.getTitle());
            resultList.add(eachArticleMap);
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
