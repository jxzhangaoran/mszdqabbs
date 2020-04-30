package matsk.mszdqabbs.Service.Impl;

import matsk.mszdqabbs.DAO.FollowDAO;
import matsk.mszdqabbs.DAO.InviteDAO;
import matsk.mszdqabbs.DAO.QuestionDAO;
import matsk.mszdqabbs.DAO.UserDAO;
import matsk.mszdqabbs.Pojo.Invite;
import matsk.mszdqabbs.Pojo.User;
import matsk.mszdqabbs.Service.InviteService;
import matsk.mszdqabbs.Service.UserService;
import matsk.mszdqabbs.Utils.JacksonUtils;
import matsk.mszdqabbs.Utils.TokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Service
public class InviteServiceImpl implements InviteService {
    @Autowired
    private InviteDAO inviteDAO;
    @Autowired
    private FollowDAO followDAO;
    @Autowired
    private UserDAO userDAO;
    @Autowired
    private UserService userService;
    @Autowired
    private QuestionDAO questionDAO;

    @Override
    public String getHowManyNotReadInvitationOf(HttpServletRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer be_invited = TokenUtils.getUid(request);
        if(be_invited != null) {
            resultMap.put("howManyNotReadInvitation", inviteDAO.getHowManyNotReadInvitationOf(be_invited));
            resultMap.put("success","true");
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getFollowsAndInivitationState(Integer questionId, HttpServletRequest request) {
        Integer uid = TokenUtils.getUid(request);
        if(uid != null) {
            List<Map<String, Object>> resultList = new ArrayList<>();
            List<User> to_follow = followDAO.getFollowsOf(uid);
            List<Invite> invitationState = inviteDAO.getFollowsInvitationStateOf(questionId, uid);
            to_follow.forEach(to_follow_each -> {
                Map<String, Object> eachFollowMap = new HashMap<>();
                eachFollowMap.put("followId", to_follow_each.getId());
                eachFollowMap.put("headPhotoUrl", to_follow_each.getHead_photo_url());
                eachFollowMap.put("nickname", to_follow_each.getNickname());
                eachFollowMap.put("alreadyInvited","false");
                invitationState.forEach(state -> {
                    //已经被邀请的条件是：邀请者是登录用户，并且被邀请者是当前关注者
                    if(state.getBe_invited().equals(to_follow_each.getId()) && state.getInviter().equals(uid)) {
                        eachFollowMap.put("alreadyInvited","true");
                    }
                });
                resultList.add(eachFollowMap);
            });
            try {
                return JacksonUtils.obj2json(resultList);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        return null;
    }

    @Override
    @Transactional
    public String invite(Integer questionId, Integer be_invited, HttpServletRequest request) {
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("success","false");
        Integer uid = TokenUtils.getUid(request);
        if(uid != null && !be_invited.equals(uid)) {//不允许自己邀请自己
            Invite newInvite = new Invite(0, uid, be_invited, questionId, 0, null);
            if(inviteDAO.isAlreadyInvited(newInvite) == 0) { //同一个问题，不允许同一个邀请者邀请同一个被邀请者多次
                if (inviteDAO.invite(newInvite) == 1) {
                    resultMap.put("success", "true");
                }
            }
        }
        return JacksonUtils.mapToJson(resultMap);
    }

    @Override
    @Transactional
    public String getSearchUserAndInvitationState(Integer questionId, String searchStr, HttpServletRequest request) {
        Integer uid = TokenUtils.getUid(request);
        if(uid != null) {
            List<Map<String, Object>> resultList = new ArrayList<>();
            List<User> searchUsers = userDAO.findUsersLikely(searchStr, uid);
            List<Invite> invitationState = inviteDAO.getSearchUsersInvitationStateOf(questionId, uid, searchStr);
            searchUsers.forEach(searchUser -> {
                Map<String, Object> eachSearchUserMap = new HashMap<>();
                eachSearchUserMap.put("userId", searchUser.getId());
                eachSearchUserMap.put("headPhotoUrl", searchUser.getHead_photo_url());
                eachSearchUserMap.put("nickname", searchUser.getNickname());
                eachSearchUserMap.put("alreadyInvited","false");
                invitationState.forEach(state -> {
                    //已经被邀请的条件是：邀请者是登录用户，并且被邀请者是当前搜索用户
                    if(state.getBe_invited().equals(searchUser.getId()) && state.getInviter().equals(uid)) {
                        eachSearchUserMap.put("alreadyInvited","true");
                    }
                });
                resultList.add(eachSearchUserMap);
            });
            try {
                return JacksonUtils.obj2json(resultList);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        return null;
    }

    @Override
    @Transactional
    public String getInvitationsOf(HttpServletRequest request) {
        Integer be_invited = TokenUtils.getUid(request);
        if(be_invited != null) {
            List<Invite> myInvitation = inviteDAO.getMyInvitation(be_invited);
            if(myInvitation != null && myInvitation.size() > 0) {
                List<Map<String, Object>> resultList = new ArrayList<>();
                //使用SET保存所有邀请者、所有问题，确保相同的对象查询只执行一次
                Set<Integer> myInvitationInviterIds = new HashSet<>();
                Set<Integer> myInvitationQuestionIds = new HashSet<>();
                myInvitation.forEach(invitation -> {
                    myInvitationInviterIds.add(invitation.getInviter());
                    myInvitationQuestionIds.add(invitation.getWhich_question());
                });
                //由于只需要知道邀请者的ID、头像、昵称，可以借用UserService的getUserInfoOfComment方法
                Map<Integer, Map<String, Object>> inviterInfos = new HashMap<>();
                myInvitationInviterIds.forEach(inviter -> {
                    try {
                        inviterInfos.put(inviter, userService.getUserInfoOfComment(inviter));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
                //从问题里加载标题信息
                Map<Integer, String> invitationQuestionTitles = new HashMap<>();
                myInvitationQuestionIds.forEach(question -> {
                    invitationQuestionTitles.put(question, questionDAO.getQuestionTitleById(question));
                });
                //填充结果集
                myInvitation.forEach(invitation -> {
                    Map<String, Object> eachInvitation = new HashMap<>();
                    eachInvitation.put("inviteId", invitation.getId());
                    eachInvitation.put("inviter", inviterInfos.get(invitation.getInviter()));
                    eachInvitation.put("questionId",invitation.getWhich_question());
                    eachInvitation.put("questionTitle", invitationQuestionTitles.get(invitation.getWhich_question()));
                    eachInvitation.put("inviteTime", invitation.getInvite_time());
                    eachInvitation.put("isRead",invitation.getIs_read());
                    resultList.add(eachInvitation);
                });
                //未读消息放在前面
                resultList.sort((r1,r2) -> {
                    Integer r1IsRead = Integer.parseInt(r1.get("isRead") + "");
                    Integer r2IsRead = Integer.parseInt(r2.get("isRead") + "");
                    return r1IsRead.compareTo(r2IsRead);
                });

                try {
                    return JacksonUtils.obj2json(resultList);
                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
            }
        }
        return null;
    }

    @Override
    @Transactional
    public String readInvites(List<Integer> readInviteIds, HttpServletRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("success","false");
        if(TokenUtils.isLogin(request)) {
            readInviteIds.forEach(inviteId -> {
                if(inviteDAO.readInvite(inviteId) != 1) {
                    throw new RuntimeException("存在重复邀请或邀请不存在");
                }
            });
            resultMap.put("success","true");
        }
        return JacksonUtils.mapToJson(resultMap);
    }
}
