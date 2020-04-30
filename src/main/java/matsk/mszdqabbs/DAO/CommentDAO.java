package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface CommentDAO {

    int comment(Comment newComment);

    int getCommentCountOf(@Param("to_comment") Integer to_comment,
                          @Param("to_comment_type") Integer to_comment_type);

    List<Comment> getTopComments(@Param("howMany") Integer howMany,
                                 @Param("to_comment") Integer to_comment,
                                 @Param("to_comment_type") Integer to_comment_type);

    List<Comment> getRemainAllComments(@Param("offSet") Integer offSet,
                                       @Param("to_comment") Integer to_comment,
                                       @Param("to_comment_type") Integer to_comment_type);

    int getLikeCount(Integer commentId);

    int getDislikeCount(Integer commentId);

    List<Comment> getCommentsBy(Integer commentator);
}
