package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private Integer id;
    private String content;
    private Integer commentator;
    private Integer to_comment;
    private Integer to_comment_type;
    private Timestamp comment_time;
}
