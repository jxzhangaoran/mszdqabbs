package matsk.mszdqabbs.Controller;


import matsk.mszdqabbs.Service.InviteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/invite")
public class InviteController {
    @Autowired
    private InviteService inviteService;

    @PostMapping("/getHowManyNotReadInvitationOf")
    public String getHowManyNotReadInvitationOf(HttpServletRequest request) {
        return inviteService.getHowManyNotReadInvitationOf(request);
    }

    @PostMapping("/getFollowsAndInivitationState")
    public String getFollowsAndInivitationState(@RequestParam("questionId") String questionId,
                                                HttpServletRequest request) {
        return inviteService.getFollowsAndInivitationState(Integer.parseInt(questionId), request);
    }

    @PostMapping("/getSearchUserAndInvitationState")
    public String getSearchUserAndInvitationState(@RequestParam("questionId") String questionId,
                                                  @RequestParam("searchStr") String searchStr,
                                                  HttpServletRequest request) {
        return inviteService.getSearchUserAndInvitationState(Integer.parseInt(questionId),
                                                            searchStr, request);
    }

    @PostMapping("/doInvite")
    public String invite(@RequestParam("questionId") String questionId,
                         @RequestParam("be_invited") String be_invited,
                         HttpServletRequest request) {
        return inviteService.invite(Integer.parseInt(questionId),
                                    Integer.parseInt(be_invited), request);
    }

    @PostMapping("/getInvitationsOf")
    public String getInvitationsOf(HttpServletRequest request) {
        return inviteService.getInvitationsOf(request);
    }

    @PostMapping("/readInvites")
    public String readInvites(@RequestBody List<Integer> readInviteIds, HttpServletRequest request) {
        return inviteService.readInvites(readInviteIds, request);
    }
}