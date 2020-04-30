//补齐前缀0
function addFrontZero(n) {
	if (Number(n) < 10 && Number(n) > 0) {
		return "0" + n;
	} else return n;
}

$(document).ready(function() {
	let loginUser;

	new Promise(function(resolve, reject) {
			tryGetUid
				//已登录
				.then(function(uid) {
					$.ajax({
						url: "usr/getUser",
						type: "POST",
						dataType: "json",
						data: {
							"uid": uid
						},
						success: function(response) {
							//保存到本地变量，以便之后使用
							loginUser = response;
							let headphoto = loginUser.head_photo_url == null || loginUser.head_photo_url == "" ?
								"image/default_headphoto.png" : loginUser.head_photo_url;
							/*所有页面都需要做的事：
							1、加载PC端的右侧头像div，填入用户名和替换用户头像
							2、加载移动端的头像div，并加入三个选项：“邀请回答”、“我的” 和 “注销”
							*/

							//PC端右侧头像div
							$("#usernameinfo").html(loginUser.nickname);
							$("#logined").removeClass("loginhidden");
							$("#notlogin").addClass("loginhidden");
							$("#headphotocontainer").css("background-image", "url(" + headphoto + ")");
							//移动端侧边栏
							$("#sidebarlogintips").html(loginUser.nickname);
							$(".mobilelogined").removeClass("loginhidden");
							$("#sidebarlogintips").addClass("usernameinfo");
							$("#sidebarheadphoto").css("background-image", "url(" + headphoto + ")");
							//加载未读邀请回答的次数
							$.ajax({
								url: "invite/getHowManyNotReadInvitationOf",
								type: "POST",
								dataType: "json",
								success: function(response) {
									//console.log(response);
									let invitationNum = response.howManyNotReadInvitation;
									if (response.success == "true" && invitationNum != null && invitationNum > 0) {
										$(".inviteNumber").html(invitationNum > 99 ? 99 : invitationNum);
										$(".inviteNumber").css("display", "inline-block");
										$(".msgTipRedPoint").attr("style", "opacity: 1 !important");
									}
								}
							});
							//处理本页面的其他事件
							resolve();
						}
					});
				})
				.catch(function(err) {
					window.open("index.html","_self");
				});
		})
		.then(function() {
			loadMyInvitation();
		});


	function jump404() {
		window.open("404.html", "_self");
	}

	function loadMyInvitation() {
		$.ajax({
			url: "invite/getInvitationsOf",
			type: "POST",
			dataType: "json",
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					$(".invitationlist").html("");
					$(".howManyInvitationsNum").html(response.length);
					let hasNotRead = false;
					for (let i = 0; i < response.length; i++) {
						let $inv = $(".invitationTemplate .invitation");
						//填充头像
						let invHeadphoto = $inv.find(".inviterHeadPhoto");
						if (response[i].inviter.headPhotoUrl != null && response[i].inviter.headPhotoUrl != "") {
							invHeadphoto.find("img").attr("src", response[i].inviter.headPhotoUrl);
						} else invHeadphoto.css("background-image", "url(image/default_headphoto.png)");
						//邀请者昵称
						let invNickname = $inv.find(".inviterNickname");
						invNickname.find(".inviterNicknameWord").html(response[i].inviter.nickname);
						//绑定邀请者主页URL
						invHeadphoto.children("a").attr("href", "user.html?visitUid=" + response[i].inviter.authorId);
						invNickname.children("a").attr("href", "user.html?visitUid=" + response[i].inviter.authorId);
						//邀请回答问题的标题
						let invTitle = $inv.find(".inviteQuestionTitle");
						invTitle.find(".inviteQuestionTitleWordR").html(response[i].questionTitle);
						//绑定问题URL
						invTitle.children("a").attr("href", "showQuestion.html?questionId=" + response[i].questionId);
						//邀请时间
						let invTime = new Date(response[i].inviteTime);
						$inv.find(".inviteTimeNum").html(
							invTime.getFullYear() + "年" +
							(invTime.getMonth() + 1) + "月" +
							invTime.getDate() + "日&nbsp;" +
							addFrontZero(invTime.getHours()) + ":" +
							addFrontZero(invTime.getMinutes()));
						//绑定问题详情点击事件
						$inv.find(".clickToReadQuestion").attr("onclick", "javascript:window.open('showQuestion.html?questionId=" +
							response[i].questionId + "',target='_self')");
						//绑定已读按钮属性
						let invRead = $inv.find(".clickToRead");
						invRead.attr("data-inviteId", response[i].inviteId);
						invRead.removeClass("disabled");
						$inv.removeClass("notRead");
						if (response[i].isRead) {
							invRead.addClass("disabled");
						} else {
							hasNotRead = true;
							$inv.addClass("notRead");
						}
						//添加到invitationlist
						$(".invitationlist").append($inv.clone());
					}
					//绑定已读点击事件
					$(".invitationlist").on("click", ".clickToRead", function() {
						let inviteId = $(this).attr("data-inviteId");
						if (inviteId != null && inviteId != "") {
							$(this).addClass("disabled");
							$(this).parents(".invitation").removeClass("notRead");
							//若全部已读，则取消一键已读的事件绑定，并禁用
							let isAllRead = true;
							$(".invitationlist .invitation").each(function(index, element) {
								if($(this).hasClass("notRead")) isAllRead = false;
							});
							if(isAllRead) {
								$(".clickToReadAll").css("color", "gray");
								$(".clickToReadAll").css("cursor", "default");
								$(".clickToReadAll").unbind("click");
							}
							readInvite(inviteId);
						}
					});
					//是否需要启用一键已读
					if (hasNotRead) {
						//绑定一键已读事件
						$(".clickToReadAll").on("click", function() {
							let inviteIdArr = new Array();
							$(".invitationlist .clickToRead").each(function(index, element) {
								inviteIdArr[index] = Number($(this).attr("data-inviteId"));
							});
							$(".clickToReadAll").css("color", "gray");
							$(".clickToReadAll").css("cursor", "default");
							$(".clickToRead").addClass("disabled");
							$(".invitation").removeClass("notRead");
							$(".clickToReadAll").unbind("click");
							readAllInvite(inviteIdArr);
						});
					} else {
						$(".clickToReadAll").css("color", "gray");
						$(".clickToReadAll").css("cursor", "default");
					}
					$(".loadingHolder").hide();
					$(".hasInvitation").show();
				} else {
					$(".loadingHolder").hide();
					$(".noInvitation").show();
				}
			},
			error: function(response) {
				//console.log(response);
				$(".loadingHolder").hide();
				$(".noInvitation").show();
			}
		});
	}

	function readInvite(inviteId) {
		let inviteIdArr = new Array(1);
		inviteIdArr[0] = Number(inviteId);
		readAllInvite(inviteIdArr);
	}

	function readAllInvite(inviteIdArr) {
		//console.log(inviteIdArr);
		//console.log(JSON.stringify(inviteIdArr));
		
		if(inviteIdArr != null && inviteIdArr.length > 0) {
			$.ajax({
				url: "invite/readInvites",
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(inviteIdArr),
				success: function(response) {
					console.log(response);
				},
				error: function(response) {
					console.log(response);
				}
			});
		}
	}
});
