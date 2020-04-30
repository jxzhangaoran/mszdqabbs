package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/question")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    @PostMapping("/newQuestion")
    public String insertNewQuestion(@RequestParam("title") String title,
                                   @RequestParam("detail") String detail,
                                   HttpServletRequest request) {
        return questionService.insertNewQuestion(title, detail, request);
    }

    @GetMapping("/getSomeQuestionNew")
    public String getSomeQuestionNew(@RequestParam("pageIndex") String pageIndex,
                                    HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return questionService.getSomeQuestionNew(pageIndexInt, request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getSomeQuestionPopular")
    public String getSomeQuestionPopular(@RequestParam("pageIndex") String pageIndex,
                                        HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return questionService.getSomeQuestionPopular(pageIndexInt, request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getTotalPageCount")
    public String getTotalPageCount() {
        return questionService.getTotalPageCount();
    }

    @GetMapping("/getQuestion")
    public String getQuestion(@RequestParam("questionId") String questionId,
                             HttpServletRequest request) {
        return questionService.getSpecificQuestionById(Integer.parseInt(questionId), request);
    }

    @GetMapping("/evaluate")
    public String likeOrDislike(@RequestParam("questionId") String questionId,
                                @RequestParam("likeOrDislike") String likeOrDislike) {
        try {
            return questionService.likeOrDislike(Integer.parseInt(questionId),
                    Integer.parseInt(likeOrDislike));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getQuestionsAskedBy")
    public String getQuestionsAskedBy(@RequestParam("authorId") String authorId) {
        return questionService.getQuestionsAskedBy(Integer.parseInt(authorId));
    }

    @PostMapping("/getQuestionToEdit")
    public String getQuestionToEdit(@RequestParam("editId") String editId,
                                   HttpServletRequest request) {
        return questionService.getQuestionToEdit(Integer.parseInt(editId), request);
    }

    @PostMapping("/updateQuestion")
    public String updateQuestion(@RequestParam("editId") String editId,
                                @RequestParam("newTitle") String newTitle,
                                @RequestParam("newDetail") String newDetail,
                                HttpServletRequest request) {
        return questionService.updateQuestion(Integer.parseInt(editId), newTitle, newDetail, request);
    }

    @GetMapping("/getQuestionsCollectedBy")
    public String getQuestionsCollectedBy(@RequestParam("collector") String collector) {
        return questionService.getQuestionsCollectedBy(Integer.parseInt(collector));
    }

    @PostMapping("/deleteQuestion")
    public String deleteQuestion(@RequestParam("questionId") String questionId,
                                 HttpServletRequest request) {
        return questionService.deleteQuestion(Integer.parseInt(questionId), request);
    }
}
