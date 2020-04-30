package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.AnswerDAO;
import matsk.mszdqabbs.DAO.ArticleDAO;
import matsk.mszdqabbs.DAO.QuestionDAO;
import matsk.mszdqabbs.DAO.UserDAO;
import matsk.mszdqabbs.Pojo.Answer;
import matsk.mszdqabbs.Pojo.Article;
import matsk.mszdqabbs.Pojo.Question;
import matsk.mszdqabbs.Pojo.User;
import matsk.mszdqabbs.Service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private UserDAO userDAO;
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private QuestionDAO questionDAO;
    @Autowired
    private AnswerDAO answerDAO;

    @Override
    @Transactional
    public Map<String, List<Map<String, String>>> searchPreview(String queryStr) {
        Map<String, List<Map<String, String>>> res = new HashMap<>();
        List<Map<String, Object>> sumList = new ArrayList<>();

        List<Map<String, Object>> userSearchList = userDAO.searchUserInNaturalLanguageMode(queryStr);
        List<Map<String, Object>> articleSearchList = articleDAO.searchArticleInNaturalLanguageMode(queryStr);
        List<Map<String, Object>> questionSearchList = questionDAO.searchQuestionInNaturalLanguageMode(queryStr);
        List<Map<String, Object>> answerSearchList = answerDAO.searchAnswerInNaturalLanguageMode(queryStr);

        sumList.addAll(userSearchList);
        sumList.addAll(articleSearchList);
        sumList.addAll(questionSearchList);
        sumList.addAll(answerSearchList);

        //按照匹配度 降序排列
        sumList.sort((s1, s2) -> {
            Double d1 = (double) s1.get("score");
            Double d2 = (double) s2.get("score");
            return d1.compareTo(d2);
        });

        //取前7个结果
        List<Map<String, String>> resultList = new ArrayList<>();
        for(int i = 0;i < 7;i++) {
            Map<String, String> eachRes = new HashMap<>();
            Map<String, Object> unit;
            if(sumList.size() > i && (unit = sumList.get(i)) != null) {
                switch (unit.get("type") + "") {
                    case "user": {
                        eachRes.put("name", reduceLength(unit.get("nickname") + ""));
                        eachRes.put("description", "用户");
                        eachRes.put("html_url", "user.html?visitUid=" + unit.get("id"));
                        break;
                    }
                    case "article": {
                        eachRes.put("name", reduceLength(unit.get("title") + ""));
                        eachRes.put("description", "文章");
                        eachRes.put("html_url", "showArticle.html?articleId=" + unit.get("id"));
                        break;
                    }
                    case "question": {
                        eachRes.put("name", reduceLength(unit.get("title") + ""));
                        eachRes.put("description", "问题");
                        eachRes.put("html_url", "showQuestion.html?questionId=" + unit.get("id"));
                        break;
                    }
                    case "answer": {
                        eachRes.put("name", reduceLength(unit.get("content") + ""));
                        eachRes.put("description", "回答");
                        eachRes.put("html_url", "showAnswer.html?answerId=" + unit.get("id"));
                        break;
                    }
                }
                resultList.add(eachRes);
            } else break;
        }
        res.put("items", resultList);
        return res;
    }

    //避免显示过长，取前20个字符 + 省略号
    private String reduceLength(String s) {
        if(s.length() > 20) {
            s = s.substring(0, 20) + "...";
        }
        return s;
    }
}
