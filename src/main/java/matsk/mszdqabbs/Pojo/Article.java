package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private Integer id;
    private String title;
    private String content;
    private Integer author;
    private Timestamp submit_time;
    private Timestamp last_update_time;
    private Integer browse_count;
}
