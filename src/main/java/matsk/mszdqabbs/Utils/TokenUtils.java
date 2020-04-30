package matsk.mszdqabbs.Utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class TokenUtils {
    private static final long EXPIRE_TIME_DAY = 24 * 60 * 60 * 1000;  //一天
    private static final String TOKEN_SECRET="matskqabbs000106";  //密钥盐

    /**
     * 签名生成
     * @param id id
     * @return
     */
    public static String sign(Integer id) {
        try {
            // 设置过期时间
            Date date = new Date(System.currentTimeMillis() + (EXPIRE_TIME_DAY * 365));//自动登录一年
            // 私钥和加密算法
            Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
            // 设置头部信息
            Map<String, Object> header = new HashMap<>(2);
            header.put("typ", "JWT");
            header.put("alg", "HS256");
            // 返回token字符串
            return JWT.create()
                    //第一部分：头部
                    .withHeader(header)
                    //第二部分：载荷
                    .withClaim("uid",id)
                    //过期时间，包含在载荷里，名称为exp
                    .withExpiresAt(date)
                    //第三部分：签名
                    .sign(algorithm);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 获取token信息
     * @param **token**
     * @return
     */
    public static Map<String, Claim> getTokenInfo(String token){
        DecodedJWT jwt;
        try {
            Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
            JWTVerifier verifier = JWT.require(algorithm).build();
            jwt = verifier.verify(token);
            return jwt.getClaims();
        } catch (Exception e){
            return null;
        }
    }

    /**
     * 是否登录
     * @param request
     * @return
     */
    public static boolean isLogin(HttpServletRequest request) {
        //客户端每次同源请求会自动带上cookies
        Cookie[] cookies = request.getCookies();
        boolean isVerified = false;
        if(cookies != null && cookies.length != 0) {
            for (Cookie cookie : cookies) {
                if(cookie.getName().equals("token")) {
                    try {
                        Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
                        JWTVerifier verifier = JWT.require(algorithm).build();
                        verifier.verify(cookie.getValue());
                        isVerified = true;
                    } catch (Exception e){
                        isVerified = false;
                    }
                }
            }
        }
        return isVerified;
    }

    /**
     * 从request里直接获取uid
     * @param request
     * @return 当且仅当用户身份得到认证，返回用户id，否则返回null
     */
    public static Integer getUid(HttpServletRequest request) {
        Integer uid = null;
        //客户端每次同源请求会自动带上cookies
        Cookie[] cookies = request.getCookies();
        if(cookies != null && cookies.length != 0) {
            for (Cookie cookie : cookies) {
                if(cookie.getName().equals("token")) {
                    try {
                        Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
                        JWTVerifier verifier = JWT.require(algorithm).build();
                        Map<String, Claim> claims = verifier.verify(cookie.getValue()).getClaims();
                        for(Map.Entry<String, Claim> entry : claims.entrySet()) {
                            if(entry.getKey().equals("uid")) {
                                uid = entry.getValue().asInt();
                            }
                        }
                    } catch (Exception e){
                        e.printStackTrace();
                    }
                }
            }
        }
        return uid;
    }
}
