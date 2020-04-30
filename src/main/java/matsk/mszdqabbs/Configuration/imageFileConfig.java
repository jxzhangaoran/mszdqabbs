package matsk.mszdqabbs.Configuration;

import matsk.mszdqabbs.Configuration.conf.imageResourceMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class imageFileConfig extends WebMvcConfigurerAdapter {
    //最新的WebMvcConfigurationSupport会覆盖默认配置

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //定义到硬盘
        //用户头像的静态资源映射
        registry.addResourceHandler(imageResourceMapper.headPhotoUrlSuffix + "**")
                .addResourceLocations("file:" + imageResourceMapper.getHeadPhotoFileLocationByEnvironment());
        //文章、提问、回答的内容图片的静态资源映射
        registry.addResourceHandler(imageResourceMapper.contentPhotoUrlSuffix + "**")
                .addResourceLocations("file:" + imageResourceMapper.getContentPhotoFileLocationByEnvironment());
        super.addResourceHandlers(registry);
    }
}
