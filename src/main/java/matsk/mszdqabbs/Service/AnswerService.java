package matsk.mszdqabbs.Service;

import matsk.mszdqabbs.Pojo.Answer;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface AnswerService {
    String insertNewAnswer(Integer which_answer, String content, HttpServletRequest request);

    String getSomeAnswerNew(Integer which_question, int pageIndex, HttpServletRequest request);

    String getSomeAnswerPopular(Integer which_question, int pageIndex, HttpServletRequest request);

    String getTotalPageCount(Integer which_question);

    String getSpecificAnswerById(int answerId, HttpServletRequest request);

    String likeOrDislike(int answerId, int likeOrDislike);

    String getAnswersWriteBy(Integer answerer);

    String getAnswerToEdit(Integer answerId, HttpServletRequest request);

    String updateAnswer(Integer answerId, String newContent, HttpServletRequest request);

    String deleteAnswer(Integer answerId, HttpServletRequest request);

    String getAnswersCollectedBy(Integer collector);
}
