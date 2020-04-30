package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Follow {
    private Integer id;
    private Integer to_follow;
    private Integer folllower;
}
