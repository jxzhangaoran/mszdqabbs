package matsk.mszdqabbs.Pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private String username;
    private String encrypted_password;
    private String email;
    private String nickname;
    private String motto;
    private String head_photo_path;
    private String head_photo_url;
    private String head_photo_name;
    private Timestamp register_time;
    private Timestamp last_login_time;
    private Timestamp last_update_info_time;
    private String last_login_ip;
}
