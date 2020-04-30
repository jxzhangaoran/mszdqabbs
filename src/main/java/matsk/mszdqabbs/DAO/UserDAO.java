package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Repository
@Mapper
public interface UserDAO {
    int register(User user);

    int emailExistsCheck(String email);

    int usernameExistsCheck(String username);

    int nicknameExistsCheck(String nickname);

    List<User> loginWithEmail(@Param("email") String email,
                              @Param("encrypted_password") String encrypted_password);

    List<User> loginWithUsername(@Param("username") String username,
                          @Param("encrypted_password") String encrypted_password);

    List<User> getUser(Integer id);

    int getAutoIncrement();

    int updateLoginInfoById(@Param("id") Integer id,
                        @Param("last_login_time") Timestamp last_login_time,
                        @Param("last_login_ip") String last_login_ip);

    int updateNickname(@Param("id") Integer id, @Param("nickname") String nickname);

    int updateMotto(@Param("id") Integer id, @Param("motto") String motto);

    int updateHeadPhotoInfo(@Param("id") Integer id,
                            @Param("head_photo_path") String head_photo_path,
                            @Param("head_photo_url") String head_photo_url,
                            @Param("head_photo_name") String head_photo_name);

    int updatePassword(@Param("email") String email, @Param("newPassword") String newPassword);

    List<User> findUsersLikely(@Param("usernameOrNickname") String usernameOrNickname,
                                              @Param("self") Integer self);

    List<Map<String, Object>> searchUserInNaturalLanguageMode(String usernameOrNickname);
}
