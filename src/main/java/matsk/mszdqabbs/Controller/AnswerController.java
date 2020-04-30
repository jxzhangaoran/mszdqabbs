package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/answer")
public class AnswerController {
    @Autowired
    private AnswerService answerService;

    @PostMapping("/newAnswer")
    public String insertNewAnswer(@RequestParam("which_question") String which_question,
                                   @RequestParam("content") String content,
                                   HttpServletRequest request) {
        return answerService.insertNewAnswer(Integer.parseInt(which_question), content, request);
    }


    @GetMapping("/getSomeAnswerNew")
    public String getSomeAnswerNew(@RequestParam("which_question") String which_question,
                                    @RequestParam("pageIndex") String pageIndex,
                                    HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return answerService.getSomeAnswerNew(Integer.parseInt(which_question),
                    pageIndexInt,
                    request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getSomeAnswerPopular")
    public String getSomeAnswerPopular(@RequestParam("which_question") String which_question,
                                        @RequestParam("pageIndex") String pageIndex,
                                        HttpServletRequest request) {
        try {
            int pageIndexInt = Integer.parseInt(pageIndex);
            return answerService.getSomeAnswerPopular(Integer.parseInt(which_question),
                    pageIndexInt,
                    request);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getTotalPageCount")
    public String getTotalPageCount(@RequestParam("which_question") Integer which_question) {
        return answerService.getTotalPageCount(which_question);
    }

    @GetMapping("/getAnswer")
    public String getAnswer(@RequestParam("answerId") String answerId,
                             HttpServletRequest request) {
        return answerService.getSpecificAnswerById(Integer.parseInt(answerId), request);
    }

    @GetMapping("/evaluate")
    public String likeOrDislike(@RequestParam("answerId") String answerId,
                                @RequestParam("likeOrDislike") String likeOrDislike) {
        try {
            return answerService.likeOrDislike(Integer.parseInt(answerId),
                    Integer.parseInt(likeOrDislike));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getAnswersWriteBy")
    public String getAnswersWriteBy(@RequestParam("authorId") String authorId) {
        return answerService.getAnswersWriteBy(Integer.parseInt(authorId));
    }

    @PostMapping("/getAnswerToEdit")
    public String getAnswerToEdit(@RequestParam("editId") String editId,
                                   HttpServletRequest request) {
        return answerService.getAnswerToEdit(Integer.parseInt(editId), request);
    }

    @PostMapping("/updateAnswer")
    public String updateAnswer(@RequestParam("editId") String editId,
                                @RequestParam("newContent") String newContent,
                                HttpServletRequest request) {
        return answerService.updateAnswer(Integer.parseInt(editId), newContent, request);
    }

    @PostMapping("/deleteAnswer")
    public String deleteAnswer(@RequestParam("answerId") String answerId,
                                HttpServletRequest request) {
        return answerService.deleteAnswer(Integer.parseInt(answerId), request);
    }

    @GetMapping("/getAnswersCollectedBy")
    public String getAnswersCollectedBy(@RequestParam("collector") String collector) {
        return answerService.getAnswersCollectedBy(Integer.parseInt(collector));
    }
}
