package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/collection")
public class CollectionController {
    @Autowired
    private CollectionService collectionService;

    @PostMapping("/toggleCollection")
    public String toggleCollection(@RequestParam("collection_id") String collection_id,
                                   @RequestParam("collection_type") String collection_type,
                                   HttpServletRequest request) {
        return collectionService.toggleCollect(Integer.parseInt(collection_id),
                Integer.parseInt(collection_type),
                request);
    }

}
