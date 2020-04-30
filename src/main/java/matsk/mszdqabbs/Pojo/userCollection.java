package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class userCollection {
    private Integer id;
    private Integer collection_id;
    private Integer collector;
    private Integer collection_type;
}
