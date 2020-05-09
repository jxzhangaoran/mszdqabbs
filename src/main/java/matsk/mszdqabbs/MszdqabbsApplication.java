package matsk.mszdqabbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
//启动定时任务，定时清理冗余图片
@EnableScheduling
public class MszdqabbsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MszdqabbsApplication.class, args);
    }
}
