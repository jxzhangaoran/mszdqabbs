package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentImage {
    private Integer id;
    private String name;
    private String path;
    private String url;
    private Timestamp uploadtime;
}