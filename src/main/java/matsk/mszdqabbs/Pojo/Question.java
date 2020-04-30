package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    private Integer id;
    private String title;
    private String detail;
    private Integer questioner;
    private Timestamp submit_time;
    private Timestamp last_update_time;
    private Integer browse_count;
}
