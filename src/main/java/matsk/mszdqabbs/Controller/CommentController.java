package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/insertComment")
    public String insertComment(@RequestParam("to_comment") String to_comment,
                                @RequestParam("to_comment_type") String to_comment_type,
                                @RequestParam("content") String content,
                                HttpServletRequest request) {

        return commentService.handleNewComment(
                Integer.parseInt(to_comment),
                Integer.parseInt(to_comment_type),
                content,
                request
        );
    }

    @GetMapping("/getTopComments")
    public String getTopComments(@RequestParam("to_comment") String to_comment,
                                 @RequestParam("to_comment_type") String to_comment_type) {
        return commentService.getTopComment(Integer.parseInt(to_comment),
                Integer.parseInt(to_comment_type));
    }

    @GetMapping("/getRemainAllComments")
    public String getRemainAllComments(@RequestParam("to_comment") String to_comment,
                                 @RequestParam("to_comment_type") String to_comment_type) {
        return commentService.getRemainAllComment(Integer.parseInt(to_comment),
                Integer.parseInt(to_comment_type));
    }

    @GetMapping("/evaluate")
    public String likeOrDislike(@RequestParam("commentId") String commentId,
                                @RequestParam("likeOrDislike") String likeOrDislike) {
        try {
            return commentService.likeOrDislike(Integer.parseInt(commentId),
                    Integer.parseInt(likeOrDislike));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/getCommentsBy")
    public String getCommentsBy(@RequestParam("commentator") String commentator) {
        return commentService.getCommentsBy(Integer.parseInt(commentator));
    }
}
