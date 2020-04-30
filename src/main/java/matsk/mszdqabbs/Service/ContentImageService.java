package matsk.mszdqabbs.Service;

import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface ContentImageService {

    String handleUploadImage(HttpServletRequest request, MultipartFile image);
}
