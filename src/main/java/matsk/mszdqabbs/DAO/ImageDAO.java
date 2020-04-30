package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.ContentImage;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface ImageDAO {
    int insertImageInfo(ContentImage i);

    List<ContentImage> getAllImage();

    int deleteImageInfo(ContentImage i);
}
