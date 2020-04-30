package matsk.mszdqabbs.DAO;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Repository
@Mapper
public interface EvaluateDAO {
    int like(@Param("to_evaluate") Integer to_evaluate, @Param("evaluate_type") Integer evaluate_type);

    int dislike(@Param("to_evaluate") Integer to_evaluate, @Param("evaluate_type") Integer evaluate_type);
}
