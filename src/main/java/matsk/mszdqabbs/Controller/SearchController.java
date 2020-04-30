package matsk.mszdqabbs.Controller;

import matsk.mszdqabbs.Service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @GetMapping("/preSearch")
    public Map<String, List<Map<String, String>>> searchPreview(@RequestParam("q") String queryStr) {
        return searchService.searchPreview(queryStr);
    }
}
