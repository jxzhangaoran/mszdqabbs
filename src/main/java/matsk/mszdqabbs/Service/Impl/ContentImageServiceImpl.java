package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.Configuration.conf.imageResourceMapper;
import matsk.mszdqabbs.DAO.ImageDAO;
import matsk.mszdqabbs.IO.ContentImageIO;
import matsk.mszdqabbs.Pojo.ContentImage;
import matsk.mszdqabbs.Service.ContentImageService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.RequestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Service
public class ContentImageServiceImpl implements ContentImageService {
    @Autowired
    private ImageDAO imageDAO;
    @Autowired
    private ContentImageIO contentImageIO;

    @Override
    @Transactional
    public String handleUploadImage(HttpServletRequest request, MultipartFile image) {
        Map<String, Object> responseJson = new HashMap<>();
        String saveRes = contentImageIO.saveImageFile(image);
        if(saveRes.equals("写入失败")) {
            responseJson.put("success",0);
        } else {
            String path = imageResourceMapper.getContentPhotoFileLocationByEnvironment() + saveRes;//物理路径
            String url = RequestUtils.getProjectRootUrl(request)
                    //这里substring的原因是，项目根URL后不需要多余的/
                    + imageResourceMapper.contentPhotoUrlSuffix.substring(1)
                    + saveRes;//外部访问URL

            ContentImage newImageInfo = new ContentImage(
                    0,//因为是自增ID，这个无所谓
                    saveRes,
                    path,
                    url,
                    null);

            //存入数据库
            if(imageDAO.insertImageInfo(newImageInfo) > 0) {
                //返回前端Editor.md要求的规范化Json
                responseJson.put("success",1);
                responseJson.put("message","上传成功");
                responseJson.put("url",newImageInfo.getUrl());
            } else {//存入数据库失败
                responseJson.put("success",0);
            }
        }
        try {
            return JacksonUtils.obj2json(responseJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
