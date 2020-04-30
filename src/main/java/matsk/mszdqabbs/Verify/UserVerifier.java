package matsk.mszdqabbs.Verify;

import matsk.mszdqabbs.Pojo.User;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class UserVerifier {

    /**
     * 注册信息正则验证
     * @param newUser
     * @return
     */
    public boolean UserRegisterVerify(User newUser) {
        Pattern usernamePattern = Pattern.compile("^[a-zA-Z0-9]{4,16}$");
        Pattern nicknamePattern = Pattern.compile("^[\\u4e00-\\u9fa5_a-zA-Z0-9]{2,10}$");
        boolean usernameMatches = usernamePattern.matcher(newUser.getUsername()).matches();
        boolean nicknameMatches = nicknamePattern.matcher(newUser.getNickname()).matches();
        return usernameMatches && nicknameMatches;
    }

    /**
     * 邮件正则验证
     * @param email
     * @return
     */
    public boolean EmailFormatVerify(String email) {
        Pattern emailPattern = Pattern.compile("^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$");
        return emailPattern.matcher(email).matches();
    }
}
