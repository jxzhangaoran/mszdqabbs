package matsk.mszdqabbs.Service;

import javax.servlet.http.HttpServletRequest;

public interface QuestionService {

    String insertNewQuestion(String title, String content, HttpServletRequest request);

    String getSomeQuestionNew(int pageIndex, HttpServletRequest request);

    String getSomeQuestionPopular(int pageIndex, HttpServletRequest request);

    String getTotalPageCount();

    String getSpecificQuestionById(int questionId, HttpServletRequest request);

    String likeOrDislike(int questionId, int likeOrDislike);

    String getQuestionsAskedBy(Integer author);

    String getQuestionToEdit(Integer questionId, HttpServletRequest request);

    String updateQuestion(Integer questionId, String newTitle, String newDetail, HttpServletRequest request);

    String getQuestionsCollectedBy(Integer collector);

    String deleteQuestion(Integer questionId, HttpServletRequest request);
}
