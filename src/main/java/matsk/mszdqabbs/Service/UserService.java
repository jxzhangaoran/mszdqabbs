package matsk.mszdqabbs.Service;

import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public interface UserService {

    String handleRegisterMailRequest(HttpServletRequest request, HttpServletResponse response);

    String checkVerifyCode(HttpServletRequest request, HttpServletResponse response);

    String doRegister(HttpServletRequest request, HttpServletResponse response);

    String doLogin(String username, String password, HttpServletRequest request, HttpServletResponse response);

    String getUser(String uid, HttpServletRequest request);

    String updateNickname(String uid, String newNickname, HttpServletRequest request);

    String updateMotto(String uid, String newMotto, HttpServletRequest request);

    String handleHeadPhotoUpdate(Integer uid, MultipartFile newHeadPhoto, HttpServletRequest request);

    String handleFindPassword(String email, HttpServletRequest request);

    String checkFindPasswordVerifyCode(String code, HttpServletRequest request);

    String handlePasswordChangeRequest(String newPassword, HttpServletRequest request);

    Map<String, Object> getUserInfoToShowAside(Integer userId) throws Exception;

    String toggleFollow(Integer to_follow, HttpServletRequest request);

    Map<String, Object> getUserInfoOfComment(Integer userId) throws Exception;

    String getVisitUserBasicInfo(Integer visitUserId, HttpServletRequest request) throws Exception;

    String getFollowersOf(Integer uid);

    String getFollowsOf(Integer uid);
}
