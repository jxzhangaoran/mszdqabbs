package matsk.mszdqabbs.DAO;

import matsk.mszdqabbs.Pojo.Invite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface InviteDAO {
    int getHowManyNotReadInvitationOf(Integer be_invited);

    List<Invite> getFollowsInvitationStateOf(@Param("questionId") Integer questionId,
                                             @Param("inviter") Integer inviter);

    List<Invite> getSearchUsersInvitationStateOf(@Param("questionId") Integer questionId,
                                                 @Param("inviter") Integer inviter,
                                                 @Param("searchStr") String searchStr);

    int invite(Invite newInvite);

    int isAlreadyInvited(Invite newInvite);

    List<Invite> getMyInvitation(Integer be_invited);

    int readInvite(Integer inviteId);
}
