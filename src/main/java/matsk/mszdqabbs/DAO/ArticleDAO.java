package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.Article;
import matsk.mszdqabbs.Pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@Mapper
public interface ArticleDAO {
    int insertNewArticle(Article newArticle);

    List<String> getAllArticleContent();

    List<Article> getSomeArticleNew(@Param("startAt") Integer startAt, @Param("howMany") Integer howMany);

    List<Article> getSomeArticlePopular(@Param("startAt") Integer startAt, @Param("howMany") Integer howMany);

    List<User> getAuthorOf(Integer articleId);

    int getCollectionCount(Integer articleId);

    int getLikeCount(Integer articleId);

    int getDislikeCount(Integer articleId);

    int getCommentCount(Integer articleId);

    int getAllArticleCount();

    int getArticleCountWriteBy(Integer author);

    List<Article> getArticleById(Integer articleId);

    int beBrowsed(Integer articleId);

    List<Article> getArticlesWriteBy(Integer author);

    int updateArticle(@Param("articleId") Integer articleId,
                      @Param("newTitle") String newTitle,
                      @Param("newContent") String newContent);

    int deleteArticleAndAssociations(Integer articleId);

    List<Article> getArticlesCollectedBy(Integer collector);

    List<String> getAuthorNicknameByArticleId(Integer articleId);

    List<Map<String, Object>> searchArticleInNaturalLanguageMode(String searchVal);
}
