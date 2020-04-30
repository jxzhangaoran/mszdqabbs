package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invite {
    private Integer id;
    private Integer inviter;
    private Integer be_invited;
    private Integer which_question;
    private Integer is_read;
    private Timestamp invite_time;
}
