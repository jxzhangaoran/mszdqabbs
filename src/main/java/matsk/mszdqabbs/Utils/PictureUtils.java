package matsk.mszdqabbs.Utils;

import net.coobird.thumbnailator.Thumbnails;

import java.io.File;
import java.io.IOException;

public class PictureUtils {
    /**
     * 输入图片的源路径，对其进行等比例质量压缩，降低到想要的图片大小。
     * 因为算法误差和图片内容不一致，输出图片的大小并不能精确控制
     *
     * @param source 需要降低质量的图片路径
     * @param target 图片输出路径
     * @param targetSize 允许的最大图片容量，单位KB
     */
    public static void lowQuality(String source, String target, long targetSize) throws IOException {
        File f = new File(source);
        //不允许图片质量过低或过高，阈值为250KB ~ 5MB
        if(targetSize < 250 || targetSize > 5120) return;
        //如果文件存在并且容量大于需求容量
        if(f.exists() && (f.length() > targetSize << 10)) {//左移10位，KB转换为字节
            float v = (float)(targetSize << 10) / f.length();
            Thumbnails.of(source).scale(1.00f).outputQuality(v).toFile(target);
        }
    }
}
