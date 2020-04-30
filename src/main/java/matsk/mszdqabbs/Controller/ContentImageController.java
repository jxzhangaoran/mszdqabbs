package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.ContentImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/contentImage")
public class ContentImageController {
    @Autowired
    private ContentImageService contentImageService;

    @PostMapping("/uploadImage")
    public String uploadImage(@RequestParam("editormd-image-file") MultipartFile file,
                              HttpServletRequest request) {
        return contentImageService.handleUploadImage(request, file);
    }
}
