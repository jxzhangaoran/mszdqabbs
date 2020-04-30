package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.Question;
import matsk.mszdqabbs.Pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@Mapper
public interface QuestionDAO {
    int insertNewQuestion(Question newQuestion);

    List<String> getAllQuestionDetail();

    List<Question> getSomeQuestionNew(@Param("startAt") Integer startAt, @Param("howMany") Integer howMany);

    List<Question> getSomeQuestionPopular(@Param("startAt") Integer startAt, @Param("howMany") Integer howMany);

    List<User> getQuestionerOf(Integer questionId);

    int getCollectionCount(Integer questionId);

    int getLikeCount(Integer questionId);

    int getDislikeCount(Integer questionId);

    int getAnswerCount(Integer questionId);

    int getAllQuestionCount();

    int getQuestionCountAskedBy(Integer author);

    List<Question> getQuestionById(Integer questionId);

    int beBrowsed(Integer questionId);

    List<Question> getQuestionsAskedBy(Integer questioner);

    int updateQuestion(@Param("questionId") Integer questionId,
                      @Param("newTitle") String newTitle,
                      @Param("newDetail") String newDetail);

    List<Question> getQuestionsCollectedBy(Integer collector);

    List<String> getQuestionerNicknameByQuestionId(Integer questionId);

    String getQuestionTitleById(Integer questionId);

    int deleteQuestionAndAssociations(Integer questionId);

    List<Map<String, Object>> searchQuestionInNaturalLanguageMode(String searchVal);
}
