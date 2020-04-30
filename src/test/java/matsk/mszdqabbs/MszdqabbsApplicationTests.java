package matsk.mszdqabbs;

import matsk.mszdqabbs.DAO.AnswerDAO;
import matsk.mszdqabbs.DAO.ArticleDAO;
import matsk.mszdqabbs.DAO.QuestionDAO;
import matsk.mszdqabbs.DAO.UserDAO;
import matsk.mszdqabbs.Pojo.Article;
import matsk.mszdqabbs.Scheduled.CleanUnusedContentImageSchedule;
import matsk.mszdqabbs.Service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@SpringBootTest
class MszdqabbsApplicationTests {
    @Autowired
    private CleanUnusedContentImageSchedule cleanUnusedContentImageSchedule;
    @Autowired
    private ArticleService articleService;
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private UserDAO userDAO;
    @Autowired
    private AnswerDAO answerDAO;
    @Autowired
    private QuestionDAO questionDAO;
/*
    @Test
    void contextLoads() {
        //cleanUnusedContentImageSchedule.clean();
    }

    @Test
    void testPageCount() {
        System.out.println(articleService.getTotalPageCount());
    }

    @Test
    void testGetArticle() {

    }

    @Test
    void testSearchArticle() {
        List<Map<String, Object>> res = articleDAO.searchArticleInNaturalLanguageMode("第二");
        res.stream().map((r) -> r.get("title") + "," + r.get("score")).forEach(System.out::println);
    }

    @Test
    void testSearchUser() {
        List<Map<String, Object>> usersLikely
                = userDAO.searchUserInNaturalLanguageMode("matsk");
        usersLikely.forEach(System.out::println);
    }

    @Test
    void testSearchAnswer() {
        List<Map<String, Object>> answersLikely
                = answerDAO.searchAnswerInNaturalLanguageMode("回答测试");
        answersLikely.stream().map((r) -> r.get("content") + "," + r.get("score")).forEach(System.out::println);
    }

    @Test
    void testSearchQuestion() {
        List<Map<String, Object>> res = questionDAO.searchQuestionInNaturalLanguageMode("下面是");
        res.stream().map((r) -> r.get("title") + "," + r.get("score")).forEach(System.out::println);
    }

 */
}
