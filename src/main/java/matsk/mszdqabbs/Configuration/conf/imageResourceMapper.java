package matsk.mszdqabbs.Configuration.conf;

/**
 * 静态资源映射类
 * 按照自己的环境和需求配置即可
 */
public final class imageResourceMapper {
    //用户头像的存储映射

    //要在浏览器显示的URL尾段，类似http://localhost/image/1.jpg
    public static final String headPhotoUrlSuffix = "/headPhotoImage/";
    //Window本地文件夹，注意路径不能省略最后一个/
    public static final String headPhotoFileLocation = "E://uploadFiles/mszdqabbs/headPhotoImage/";
    //Linux环境本地文件夹
    public static final String linuxHeadPhotoFileLocation = "/var/uploadFiles/mszdqabbs/headPhotoImage/";

    //文章里的图片的存储映射

    //要在浏览器显示的URL尾段，类似http://localhost/image/1.jpg
    public static final String contentPhotoUrlSuffix = "/contentPhotoImage/";
    //本地文件夹，注意路径不能省略最后一个/
    public static final String contentPhotoFileLocation = "E://uploadFiles/mszdqabbs/contentPhotoImage/";
    //Linux环境本地文件夹
    public static final String linuxContentPhotoFileLocation = "/var/uploadFiles/mszdqabbs/contentPhotoImage/";

    public static String getEnvironment() {
        if(System.getProperty("os.name").toLowerCase().contains("linux")) {
            return "linux";
        } else if(System.getProperty("os.name").toLowerCase().contains("win")) {
            return "windows";
        } else return System.getProperty("os.name");
    }

    public static String getHeadPhotoFileLocationByEnvironment() {
        if(getEnvironment().equals("linux")) {
            return linuxHeadPhotoFileLocation;
        } else if(getEnvironment().equals("windows")) {
            return headPhotoFileLocation;
        } else throw new RuntimeException("Unsupported Running Environment");
    }

    public static String getContentPhotoFileLocationByEnvironment() {
        if(getEnvironment().equals("linux")) {
            return linuxContentPhotoFileLocation;
        } else if(getEnvironment().equals("windows")) {
            return contentPhotoFileLocation;
        } else throw new RuntimeException("Unsupported Running Environment");
    }
}
