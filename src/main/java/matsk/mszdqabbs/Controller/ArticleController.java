package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.ArticleService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/article")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @PostMapping("/newArticle")
    public String insertNewArticle(@RequestParam("title") String title,
                                   @RequestParam("content") String content,
                                   HttpServletRequest request) {
        return articleService.insertNewArticle(title, content, request);
    }

    @GetMapping("/getSomeArticleNew")
    public String getSomeArticleNew(@RequestParam("pageIndex") String pageIndex,
                                    HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return articleService.getSomeArticleNew(pageIndexInt, request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getSomeArticlePopular")
    public String getSomeArticlePopular(@RequestParam("pageIndex") String pageIndex,
                                    HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return articleService.getSomeArticlePopular(pageIndexInt, request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getTotalPageCount")
    public String getTotalPageCount() {
        return articleService.getTotalPageCount();
    }

    @GetMapping("/getArticle")
    public String getArticle(@RequestParam("articleId") String articleId,
                             HttpServletRequest request) {
        return articleService.getSpecificArticleById(Integer.parseInt(articleId), request);
    }

    @GetMapping("/evaluate")
    public String likeOrDislike(@RequestParam("articleId") String articleId,
                                @RequestParam("likeOrDislike") String likeOrDislike) {
        try {
            return articleService.likeOrDislike(Integer.parseInt(articleId),
                    Integer.parseInt(likeOrDislike));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getArticlesWriteBy")
    public String getArticlesWriteBy(@RequestParam("authorId") String authorId) {
        return articleService.getArticlesWriteBy(Integer.parseInt(authorId));
    }

    @PostMapping("/getArticleToEdit")
    public String getArticleToEdit(@RequestParam("editId") String editId,
                                   HttpServletRequest request) {
        return articleService.getArticleToEdit(Integer.parseInt(editId), request);
    }

    @PostMapping("/updateArticle")
    public String updateArticle(@RequestParam("editId") String editId,
                                @RequestParam("newTitle") String newTitle,
                                @RequestParam("newContent") String newContent,
                                HttpServletRequest request) {
        return articleService.updateArticle(Integer.parseInt(editId), newTitle, newContent, request);
    }

    @PostMapping("/deleteArticle")
    public String deleteArticle(@RequestParam("articleId") String articleId,
                                HttpServletRequest request) {
        return articleService.deleteArticle(Integer.parseInt(articleId), request);
    }

    @GetMapping("/getArticlesCollectedBy")
    public String getArticlesCollectedBy(@RequestParam("collector") String collector) {
        return articleService.getArticlesCollectedBy(Integer.parseInt(collector));
    }

}
