package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgreeOrNot {
    private Integer id;
    private Integer to_evaluate;
    private Integer evaluate_type;
    private boolean agreeornot;
}
