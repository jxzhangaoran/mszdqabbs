package matsk.mszdqabbs.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public interface InviteService {
    String getHowManyNotReadInvitationOf(HttpServletRequest request);

    String getFollowsAndInivitationState(Integer questionId, HttpServletRequest request);

    String getSearchUserAndInvitationState(Integer questionId, String searchStr, HttpServletRequest request);

    String invite(Integer questionId, Integer be_invited, HttpServletRequest request);

    String getInvitationsOf(HttpServletRequest request);

    String readInvites(List<Integer> readInviteIds, HttpServletRequest request);
}
