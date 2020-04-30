package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface FollowDAO {
    int getFollowerCount(Integer to_follow);

    int follow(@Param("follower") Integer follower, @Param("to_follow") Integer to_follow);

    int isAlreadyFollow(@Param("follower") Integer follower, @Param("to_follow") Integer to_follow);

    int cancel(@Param("follower") Integer follower, @Param("to_follow") Integer to_follow);

    List<User> getFollowersOf(Integer to_follow);

    List<User> getFollowsOf(Integer follower);
}
