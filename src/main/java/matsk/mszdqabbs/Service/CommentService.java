package matsk.mszdqabbs.Service;

import javax.servlet.http.HttpServletRequest;

public interface CommentService {

    String handleNewComment(Integer to_comment,
                            Integer to_comment_type,
                            String content,
                            HttpServletRequest request);

    String getTopComment(Integer to_comment, Integer to_comment_type);

    String getRemainAllComment(Integer to_comment, Integer to_comment_type);

    String likeOrDislike(int commentId, int likeOrDislike);

    String getCommentsBy(Integer commentator);
}
