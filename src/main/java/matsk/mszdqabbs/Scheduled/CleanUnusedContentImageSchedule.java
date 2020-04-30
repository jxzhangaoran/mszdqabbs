package matsk.mszdqabbs.Scheduled;

import matsk.mszdqabbs.DAO.AnswerDAO;
import matsk.mszdqabbs.DAO.ArticleDAO;
import matsk.mszdqabbs.DAO.ImageDAO;
import matsk.mszdqabbs.DAO.QuestionDAO;
import matsk.mszdqabbs.Pojo.ContentImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 考虑如下业务场景：
 *
 * 1、用户上传了图片之后，又觉得不需要这个图片，于是在markdown正文里删除了图片链接；
 * 2、用户后期编辑文章，删除了之前上传的图片的链接；
 *
 * 以上两种场景会在硬盘和图片信息表里留下无效的数据，
 * 解决方法就是定时任务，扫描全部文章，
 * 并清理冗余图片文件和数据记录
 */
@Component
public class CleanUnusedContentImageSchedule {
    @Autowired
    private ArticleDAO articleDAO;
    @Autowired
    private QuestionDAO questionDAO;
    @Autowired
    private AnswerDAO answerDAO;
    @Autowired
    private ImageDAO imageDAO;

    @Transactional
    @Scheduled(cron = "0 0 0/6 * * ? ") //从0小时开始，每6小时执行一次清理
    public void clean() {
        //所有图片对象的集合
        List<ContentImage> allContentImage = imageDAO.getAllImage();
        //从数据库的文章里截取出来的图片资源URL片段组成的集合
        Map<String,Integer> ContentImageUrlsFromArticleWords = new HashMap<>();
        //待删除的路径集合
        List<String> toDelete = new ArrayList<>();

        //所有文章的内容
        List<String> allArticleContent = articleDAO.getAllArticleContent();
        //把所有文章里的所有URL加入Map中
        for (String s : allArticleContent) {
            List<String> eachContentUrls = analyzeContent(s);
            if (eachContentUrls != null) {
                for (String eachContentUrl : eachContentUrls) {
                    ContentImageUrlsFromArticleWords.put(eachContentUrl,
                            ContentImageUrlsFromArticleWords.getOrDefault(eachContentUrl,0) + 1);
                }
            }
        }

        //所有问题的详情
        List<String> allQuestionDetail = questionDAO.getAllQuestionDetail();
        //把所有文章里的所有URL加入Map中
        for (String s : allQuestionDetail) {
            List<String> eachContentUrls = analyzeContent(s);
            if (eachContentUrls != null) {
                for (String eachContentUrl : eachContentUrls) {
                    ContentImageUrlsFromArticleWords.put(eachContentUrl,
                            ContentImageUrlsFromArticleWords.getOrDefault(eachContentUrl,0) + 1);
                }
            }
        }

        //所有回答的正文
        List<String> allAnswerContent = answerDAO.getAllAnswerContent();
        //把所有文章里的所有URL加入Map中
        for (String s : allAnswerContent) {
            List<String> eachContentUrls = analyzeContent(s);
            if (eachContentUrls != null) {
                for (String eachContentUrl : eachContentUrls) {
                    ContentImageUrlsFromArticleWords.put(eachContentUrl,
                            ContentImageUrlsFromArticleWords.getOrDefault(eachContentUrl,0) + 1);
                }
            }
        }

        //遍历数据库中存的图片对象集合
        for (ContentImage ContentImage : allContentImage) {
            //如果Map里不存在此图片，说明该图片不再被引用
            if(ContentImageUrlsFromArticleWords.get(ContentImage.getUrl()) == null) {
                //添加到待删除集合
                toDelete.add(ContentImage.getPath());
                //删除数据库记录
                if(!(imageDAO.deleteImageInfo(ContentImage) > 0)) {
                    throw new RuntimeException();
                }
            }
        }
        //最后清理文件
        doClean(toDelete);
    }

    /**
     * 分析每一篇文章的全文内容，找出图片的URL并添加到结果集中
     *
     * Markdown的图片语法示例：
     *
     * ![](http://mtk.pub:8080/save/1584247263843-6.jpg)
     *
     * [![test](http://mtk.pub:8080/save/1584247263843-6.jpg "test")](http://mtk.pub:8080/search.html "test")
     *
     * 66![](dddd)6666![]6 ![](http://mtk.pub:8080/save/1584247263926-2.jpg) dsfasdfasdfasd
     *
     * @param content 要分析的全文
     * @return 文章中包含的所有图片URL
     */
    public static List<String> analyzeContent(String content) {
        if(content.length() == 0) return null;
        List<String> res = new ArrayList<>();
        for(int i = 0;i < content.length();i++) {
            //捕捉"!["
            if(content.charAt(i) == '!'
                    && i < content.length() - 1
                    && content.charAt(i + 1) == '[') {
                int j;
                j = i + 2;
                //寻找下一个']'
                while (j < content.length() && content.charAt(j) != ']') {
                    j++;
                }
                j++;
                if(j + 1 < content.length()) {
                    int k = j + 1;
                    while (k < content.length()) {
                        if(content.charAt(k) == ')' || content.charAt(k) == ' ') {
                            //找到可能的URL目标
                            String possibleUrl = content.substring(j + 1,k);
                            //进行进一步的正则表达式判断
                            //必须是URL
                            Pattern p = Pattern.compile(
                                    "^(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$");
                            Matcher m = p.matcher(possibleUrl);
                            //正则表达式判断正确，加入结果集
                            if(m.matches()) {
                                res.add(possibleUrl);
                            }
                            break;
                        } else k++;
                    }
                }
            }
        }
        return res;
    }

    /**
     * 执行清除操作
     * @param filePaths 待清除的文件路径集合
     */
    private boolean doClean(List<String> filePaths) {
        for (String filePath : filePaths) {
            File file = new File(filePath);
            if(file.exists()) {
                return file.delete();
            }
        }
        return false;
    }
}
