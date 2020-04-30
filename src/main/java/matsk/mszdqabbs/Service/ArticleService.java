package matsk.mszdqabbs.Service;

import javax.servlet.http.HttpServletRequest;

public interface ArticleService {

    String insertNewArticle(String title, String content, HttpServletRequest request);

    String getSomeArticleNew(int pageIndex, HttpServletRequest request);

    String getSomeArticlePopular(int pageIndex, HttpServletRequest request);

    String getTotalPageCount();

    String getSpecificArticleById(int articleId, HttpServletRequest request);

    String likeOrDislike(int articleId, int likeOrDislike);

    String getArticlesWriteBy(Integer author);

    String getArticleToEdit(Integer articleId, HttpServletRequest request);

    String updateArticle(Integer articleId, String newTitle, String newContent, HttpServletRequest request);

    String deleteArticle(Integer articleId, HttpServletRequest request);

    String getArticlesCollectedBy(Integer collector);
}
