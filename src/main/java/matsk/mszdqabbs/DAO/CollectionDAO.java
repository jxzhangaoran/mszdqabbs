package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.userCollection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface CollectionDAO {
    int collect(@Param("collection_id") Integer collection_id,
                @Param("collector") Integer collector,
                @Param("collection_type") Integer collection_type);

    int isAlreadyCollect(@Param("collection_id") Integer collection_id,
                          @Param("collector") Integer collector,
                          @Param("collection_type") Integer collection_type);

    int cancel(@Param("collection_id") Integer collection_id,
               @Param("collector") Integer collector,
               @Param("collection_type") Integer collection_type);

    List<userCollection> getCollectionsCollectedBy(Integer collector);
}
