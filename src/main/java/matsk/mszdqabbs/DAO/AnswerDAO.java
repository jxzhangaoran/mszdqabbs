package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.Answer;
import matsk.mszdqabbs.Pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@Mapper
public interface AnswerDAO {
    int getAnswerCountByUserId(Integer answerer);

    List<String> getAnswererNicknameByAnswerId(Integer answerId);

    List<String> getAllAnswerContent();

    int insertNewAnswer(Answer newAnswer);

    List<Answer> getSomeAnswerNew(@Param("which_question") Integer which_question,
                                  @Param("startAt") Integer startAt,
                                  @Param("howMany") Integer howMany);

    List<Answer> getSomeAnswerPopular(@Param("which_question") Integer which_question,
                                      @Param("startAt") Integer startAt,
                                      @Param("howMany") Integer howMany);

    List<User> getAnswererOf(Integer answerId);

    int getCollectionCount(Integer answerId);

    int getLikeCount(Integer answerId);

    int getDislikeCount(Integer answerId);

    int getCommentCount(Integer answerId);

    int getAllAnswerCount();

    int getAllAnswerCountOf(Integer which_question);

    List<Answer> getAnswerById(Integer answerId);

    int beBrowsed(Integer answerId);

    List<Answer> getAnswersWriteBy(Integer answerer);

    int updateAnswer(@Param("answerId") Integer answerId,
                      @Param("newContent") String newContent);

    int deleteAnswerAndAssociations(Integer answerId);

    List<Answer> getAnswersCollectedBy(Integer collector);

    int getQuestionAnswerCountByAnswerId(Integer answerId);

    String getQuestionTitleByAnswerId(Integer answerId);

    List<Map<String, Object>> searchAnswerInNaturalLanguageMode(String searchVal);
}
