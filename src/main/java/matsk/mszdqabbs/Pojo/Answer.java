package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Answer {
    private Integer id;
    private Integer which_question;
    private Integer answerer;
    private String content;
    private Timestamp answer_time;
    private Timestamp last_update_time;
    private Integer browse_count;
}
