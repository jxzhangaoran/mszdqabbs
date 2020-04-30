package matsk.mszdqabbs.Controller;

import com.auth0.jwt.interfaces.Claim;
import matsk.mszdqabbs.Service.UserService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.TokenUtils;
import matsk.mszdqabbs.Verify.UserVerifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/usr")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/sendRegisterEmail")
    public String sendRegisterEmail(HttpServletRequest request, HttpServletResponse response) {
        return userService.handleRegisterMailRequest(request, response);
    }

    @PostMapping("/checkVerifyCode")
    public String checkVerifyCode(HttpServletRequest request, HttpServletResponse response) {
        return userService.checkVerifyCode(request, response);
    }

    @PostMapping("/register")
    public String register(HttpServletRequest request, HttpServletResponse response) {
        return userService.doRegister(request, response);
    }

    @PostMapping("/login")
    public String login(@RequestParam("username") String username,
                        @RequestParam("password") String password,
                        HttpServletRequest request,
                        HttpServletResponse response) {
        return userService.doLogin(username, password, request, response);
    }

    //无需请求数据库，在Controller层就可以处理
    @PostMapping("/tryJWTverify")
    public String tryVerifyLoginState(HttpServletRequest request) {
        //客户端每次同源请求会自动带上cookies
        Cookie[] cookies = request.getCookies();
        Map<String, Claim> tokenMap;
        Map<String, String> res = new HashMap<>();
        res.put("islogin","false");
        if(cookies != null && cookies.length != 0) {
            //遍历cookie
            for (Cookie cookie : cookies) {
                if(cookie.getName().equals("token")) {
                    //token验证成功，说明用户登录了
                    if((tokenMap = TokenUtils.getTokenInfo(cookie.getValue())) != null) {
                        //覆盖之前的false
                        res.put("islogin","true");
                        res.put("uid",tokenMap.get("uid").asInt() + "");
                        //跳出循环
                        break;
                    }
                }
            }
        }
        return JacksonUtils.mapToJson(res);
    }

    @PostMapping("/getUser")
    public String getUser(@RequestParam("uid") String uid,
                          HttpServletRequest request) {
        return userService.getUser(uid, request);
    }

    @PostMapping("/updateNickname")
    public String updateNickname(@RequestParam("uid") String uid,
                                 @RequestParam("newNickname") String newNickname,
                                 HttpServletRequest request) {
        return userService.updateNickname(uid, newNickname, request);
    }

    @PostMapping("/updateMotto")
    public String updateMotto(@RequestParam("uid") String uid,
                                 @RequestParam("newMotto") String newMotto,
                                 HttpServletRequest request) {
        return userService.updateMotto(uid, newMotto, request);
    }

    @PostMapping("/updateHeadPhoto")
    public String uploadHeadPhoto(@RequestParam("newHeadPhotoImage") MultipartFile newHeadPhotoImage,
                                  HttpServletRequest request) {
        //因为是流的形式传递文件，无法直接获取表单数据，所以从cookie中读取用户id
        Integer id = TokenUtils.getUid(request);
        return userService.handleHeadPhotoUpdate(id, newHeadPhotoImage, request);
    }

    @PostMapping("/findPassword")
    public String findPassword(@RequestParam("email") String email, HttpServletRequest request) {
        return userService.handleFindPassword(email, request);
    }

    @PostMapping("/findPasswordVerifyCode")
    public String checkFindPasswordVerifyCode(@RequestParam("code") String code,
                                              HttpServletRequest request) {
        return userService.checkFindPasswordVerifyCode(code, request);
    }

    @PostMapping("/doChangePassword")
    public String doChangePassword(@RequestParam("newPassword") String newPassword,
                                   HttpServletRequest request) {
        return userService.handlePasswordChangeRequest(newPassword, request);
    }

    @PostMapping("/toggleFollow")
    public String toggleFollow(@RequestParam("to_follow") String to_follow, HttpServletRequest request) {
        return userService.toggleFollow(Integer.parseInt(to_follow), request);
    }

    @PostMapping("/getVisitUserBasicInfo")
    public String getVisitUserBasicInfo(@RequestParam("visitUid") String visitUid,
                                        HttpServletRequest request) {
        try {
            return userService.getVisitUserBasicInfo(Integer.parseInt(visitUid), request);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @PostMapping("/getFollowersOf")
    public String getFollowersOf(@RequestParam("to_follow") String to_follow) {
        return userService.getFollowersOf(Integer.parseInt(to_follow));
    }

    @PostMapping("/getFollowsOf")
    public String getFollowsOf(@RequestParam("follower") String follower) {
        return userService.getFollowsOf(Integer.parseInt(follower));
    }
}