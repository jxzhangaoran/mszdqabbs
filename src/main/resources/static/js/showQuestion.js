//获取地址栏参数
function getQueryString(name) {
	let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	let r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
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
									$(".msgTipRedPoint").attr("style","opacity: 1 !important");
								}
							}
						});
						//处理本页面的其他事件
						resolve();
					}
				});
			})
			.catch(function(err) { resolve() });
	})
	.then(function() {
		loadQuestionAndQuestioner();
	});
	
	
	function jump404() {
		window.open("404.html", "_self");
	}
	
	let questionId = getQueryString("questionId");
	let questionTitle;
	if (questionId == null) {
		window.open("index.html", "_self");
	} else if ((parseInt(questionId) != questionId) || (questionId < 0)) {
		jump404();
	}
	
	function loadQuestionAndQuestioner() {
		$.ajax({
			url: "question/getQuestion",
			type: "GET",
			dataType: "json",
			data: {
				"questionId": questionId
			},
			success: function(response) {
				//console.log(response);
				if (response != null && response != "") {
					//console.log(response);
					//修改HTML Title
					$("title").html(response.question.title + " | 码上知道");
					//填充问题标题
					$(".questionTitleWord").html(response.question.title);
					//绑定到全局变量，写回答点击时用于传递标题文字到editor
					questionTitle = response.question.title;
					//填充提问者信息DOM
					if (response.headPhotoUrl != null && response.headPhotoUrl != "") {
						$(".questionerHeadPhoto img").attr("src", response.headPhotoUrl);
					} else $(".questionerHeadPhoto img").attr("src", "image/default_headphoto.png");
					$(".questionerNicknameWord").html(response.nickname);
					//问题发布时间
					let submitTime = new Date(response.question.submit_time);
					$(".questionTimeAgo").html("&nbsp;<i class='clock outline icon'></i>" +
						(submitTime.getMonth() + 1) + "月" +
						submitTime.getDate() + "日&nbsp;");
					//赞同次数
					let likeCount = response.likeCount;
					if (Number(likeCount) > 999) {
						likeCount = (likeCount / 1000) + "K+";
					}
					$(".goodQuestionCount").html(likeCount);
					//收藏数
					let collectionCount = response.collectionCount;
					if (Number(collectionCount) > 999) {
						collectionCount = (collectionCount / 1000) + "K+";
					}
					$(".collectNum").html(collectionCount);
					//回答数
					let answerCount = response.answerCount;
					if (Number(answerCount) > 999) {
						answerCount = (answerCount / 1000) + "K+";
					}
					$(".answerNum").html(answerCount);
					//浏览次数
					let browseCountNum = response.question.browse_count;
					if(browseCountNum > 999) {
						browseCountNum = (browseCountNum / 1000) + "K+";
					}
					$(".browseNum").html(browseCountNum);
					//如果有问题详情，则显示详情预览和展示详情按钮
					if(response.question.detail != null && response.question.detail != "") {
						//先替换掉图片，图片链接显示成 【图片】
						let imageReg = /!\[(.*)\]\((.*)\)/g;
						//替换Markdown的标签
						let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
						$(".detailPreview").html(response.question.detail.replace(imageReg, " 【图片】 ").replace(reg, ""));
						//填充问题内容Markdown
						$("#questionDetail textarea").html(response.question.detail);
						//转换正文html
						editormd.markdownToHTML("questionDetail", {
							htmlDecode: "style,script,iframe",
							emoji: true,
							taskList: true,
							tex: true, // 默认不解析
							flowChart: true, // 默认不解析
							sequenceDiagram: true // 默认不解析
						});
					} else {
						$(".questionDetailDiv,.toggleDetailDiv").hide();
					}
					//绑定用户头像、昵称、“TA的主页”点击事件
					$(".goToMainPageOfTA").on("click",function() {
						window.open("user.html?visitUid=" + response.question.questioner,"_self");
					});
					//处理从属关系
					refreshRelation(response.question.questioner,
						response.isAlreadyFollow == "true",
						response.isAlreadyCollect == "true");
					//取消占位符显示
					$(".hideAfterQuestionLoaded").hide();
					$(".showAfterQuestionLoaded").attr("style","");
				} else jump404();
			},
			error: function(response) {
				//console.log(response);
				jump404();
			}
		});
	}
	
	//作者是自己、已收藏等情况的处理
	function refreshRelation(questionerId, isAlreadyFollow, isAlreadyCollect) {
		//未登录
		if (loginUser == null || loginUser == "") {
			$(".inviteToAnswerAction,.collectAction,.writeAnswerAction,.followTA").on("click", function() {
				//打开登录框
				$(".logintrigger").trigger("click");
			});
		}
		//作者是本人
		else if (loginUser.id == questionerId) {
			$(".followTA").css("display", "none");
			$(".goToMainPageOfTA").on("click", function() {
				window.open("me.html", "_self");
			});
			//无论是自己还是其他人的提出的问题，都可以邀请其他人回答
			bindingInvitePopup();
			//问题允许自问自答
			bindingWriteAnswer();
		}
		//作者不是本人
		else {
			//是否已关注作者
			if (isAlreadyFollow) {
				$(".followTA").removeClass("blue");
				$(".followTA").addClass("green");
				$(".followTA").html("<i class='check icon' style='color: white'></i>已关注");
			}
			$(".followTA").on("click", function() {
				toggleFollow(questionerId);
			});
	
			//不能自己收藏自己写的问题，所以收藏问题的事件绑定放在这里
			//是否已收藏问题
			if (isAlreadyCollect) {
				$(".collectAction .actionWord").html("已收藏");
				$(".collectAction .actionWord,.collectAction .actionIcon").addClass("alreadyCollect");
			}
	
			$(".collectAction").on("click", function() {
				toggleCollect();
			});
			
			bindingInvitePopup();
			bindingWriteAnswer();
		}
	}
	
	function toggleFollow(questionerId) {
		$(".followTA").addClass("loading");
		$(".followTA").addClass("disabled");
		$.ajax({
			url: "usr/toggleFollow",
			type: "POST",
			dataType: "json",
			data: {
				"to_follow": questionerId
			},
			success: function(response) {
				//console.log(response);
				if ($(".followTA").hasClass("blue") && response.type == "follow") {
					$(".followTA").removeClass("blue");
					$(".followTA").addClass("green");
					$(".followTA").html("<i class='check icon' style='color: white'></i>已关注");
				} else if ($(".followTA").hasClass("green") && response.type == "cancel") {
					$(".followTA").removeClass("green");
					$(".followTA").addClass("blue");
					$(".followTA").html("<i class='plus square outline icon'></i>关注TA");
				}
				$(".followTA").removeClass("loading");
				$(".followTA").removeClass("disabled");
			},
			error: function(response) {
				$(".followTA").removeClass("loading");
				$(".followTA").removeClass("disabled");
			}
		});
	}
	
	function toggleCollect() {
		$(".collectLoader").show();
	
		$.ajax({
			url: "collection/toggleCollection",
			type: "POST",
			dataType: "json",
			data: {
				"collection_id": questionId,
				"collection_type": "2"
			},
			success: function(response) {
				$(".collectLoader").hide();
				if (response.type == "collect") {
					$(".collectAction .actionWord,.collectAction .actionIcon").addClass("alreadyCollect");
					$(".collectAction .actionWord").html("已收藏");
				} else if (response.type == "cancel") {
					$(".collectAction .actionWord,.collectAction .actionIcon").removeClass("alreadyCollect");
					$(".collectAction .actionWord").html("收藏问题");
				}
			},
			error: function(response) {
				$(".collectLoader").hide();
			}
		});
	}
	
	//展开详情
	$(".toggleDetail").on("click", function() {
		if($(".questionDetailDiv").css("display") == "none") {
			$(".detailPreview").hide(300);
			$(".questionDetailDiv").slideDown(300, function() {
				$(".toggleDetail i").removeClass("down");
				$(".toggleDetail i").addClass("up");
				$(".toggleDetailWord").html("收起描述");
			});
		} else {
			$(".detailPreview").show(300);
			$(".questionDetailDiv").slideUp(300, function() {
				$(".toggleDetail i").removeClass("up");
				$(".toggleDetail i").addClass("down");
				$(".toggleDetailWord").html("展开描述");
			});
		}
	});
	
	//点赞
	$(".goodQuestion").on("click", function() {
		$(this).removeClass("goodQuestionBeforeClick");
		$(this).addClass("goodQuestionClicked");
		
		$.ajax({
			url: "question/evaluate",
			type: "GET",
			dataType: "json",
			data: {
				"questionId" : questionId,
				"likeOrDislike" : "1"
			}
		});
		
		$(".goodQuestionCount").html(Number($(".goodQuestionCount").html()) + 1);
		$(".goodQuestion").off("click");
	});
	
	function bindingInvitePopup() {
		//弹出邀请回答
		$(".inviteToAnswerAction").popup({
			popup: $("#inviteToAnswerPopup"),
			on: "click",
			position: "bottom left"
		});
	}
	
	//默认加载已激活的tab内容
	$(".inviteToAnswerAction").on("click", function() {
		if($("#inviteMyFollows").hasClass("active")) {
			$("#inviteMyFollows").trigger("click");
		} else if($("#inviteAllUsers").hasClass("active")) {
			$("#inviteAllUsers").trigger("click");
		} else {
			$("#inviteMyFollows").trigger("click");
		}
	});
	
	$("#inviteToAnswerPopup .item").on("click", function() {
		$(this).siblings(".item").removeClass("active");
		$(this).addClass("active");
	});
	
	function showEmpty(tabList) {
		//防止多次添加
		$(tabList).find(".emptyResult").remove();
		$(tabList).siblings(".input").hide();
		$(tabList).append($(".allTemplates .emptyResultTemplate .emptyResult").clone());
		$(tabList).parent().show();
		$(tabList).parent().siblings(".hideAfterTabLoaded").hide();
	}
	
	$("#inviteMyFollows").on("click", function() {
		//切换面板
		$("#inviteAllUsersTab").hide();
		$("#inviteMyFollowsTab").show();
		//显示占位符
		$("#followers .hideAfterTabLoaded").show();
		$("#followers .showAfterTabLoaded").hide();
		//先清空关注列表
		$(".followslist").html("");
		
		$.ajax({
			url: "invite/getFollowsAndInivitationState",
			type: "POST",
			dataType: "json",
			data: {
				"questionId" : questionId
			},
			success: function(response) {
				if(response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						//console.log("follow" + i + ":" + response[i].followId);
						setTimeout(function() {
							//取出模板，准备填充被关注者内容
							let $follow = $(".allTemplates .to_invite_Template .to_invite");
							//绑定头像
							if (response[i].headPhotoUrl != null && response[i].headPhotoUrl != "") {
								$follow.find("img").attr("src", response[i].headPhotoUrl);
							} else $follow.find("img").attr("src", "image/default_headphoto.png");
							//绑定昵称
							$follow.find("h4").html(response[i].nickname);
							//绑定用户主页URL
							$follow.find("a").attr("href", "user.html?visitUid=" + response[i].followId);
							//绑定用户ID到邀请按钮
							$follow.find(".to_invite_action span").attr("data-beInvitedId", response[i].followId + "");
							//判断是否已邀请
							if(response[i].alreadyInvited == "true") {
								let inviteTASpan = $follow.find(".to_invite_action span");
								//显示已邀请，变灰色
								inviteTASpan.removeClass("inviteTA");
								inviteTASpan.html("已邀请");
								inviteTASpan.addClass("invited");
							} else {
								let inviteTASpan = $follow.find(".to_invite_action span");
								//显示未邀请，变蓝色
								inviteTASpan.removeClass("invited");
								inviteTASpan.html("<i class='envelope outline icon'></i>邀请");
								inviteTASpan.addClass("inviteTA");
							}
							//插入结果集
							$(".followslist").append($follow.clone());
						}, 0);
					}
					//修改搜索框显示的关注数目
					$(".followsSearch").attr("placeholder", "搜索我关注的" + response.length + "个用户...");
					//绑定搜索输入事件
					$(".followsSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".followslist .to_invite").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".followslist .to_invite").each(function() {
								if ($(this).find("h4").html().toLowerCase().indexOf(searchVal) == -1) {
									$(this).hide();
								} else $(this).show();
							});
						}
					});
					$(".followsSearch").parent().show();
					//显示结果
					$("#followers .hideAfterTabLoaded").hide();
					$("#followers .showAfterTabLoaded").show();
				} else {
					showEmpty($(".followslist"));
				}
			},
			error: function(response) {
				$("#followers .hideAfterTabLoaded").hide();
				$("#followers .showAfterTabLoaded").show();
				
				showEmpty($(".followslist"));
			}
		});
	});
	
	$("#inviteAllUsers").on("click", function() {
		//切换面板
		$("#inviteMyFollowsTab").hide();
		$("#inviteAllUsersTab").show();
		//输入框获得焦点
		$(".allusersSearch").focus();
		//等待搜索
		$("#allusers .hideAfterTabLoaded").hide();
		$("#allusers .showAfterTabLoaded").show();
		if($(".alluserslist").children(".to_invite").length == 0) {
			showEmpty($(".alluserslist"));
		} else {
			doSearchAllUsersInvitationState();
		}
	});
	
	//邀请事件
	$("#inviteMyFollowsTab,#inviteAllUsersTab").on("click",".inviteTA",function() {
		let inviteBtn = $(this);
		if(inviteBtn.hasClass("inviteTA")) {
			$.ajax({
				url: "invite/doInvite",
				type: "POST",
				dataType: "json",
				data: {
					"questionId" : questionId,
					"be_invited" : inviteBtn.attr("data-beInvitedId")
				},
				success: function(response) {
					//console.log(response);
					if(response != null && response.success == "true") {
						inviteBtn.removeClass("inviteTA");
						inviteBtn.html("已邀请");
						inviteBtn.addClass("invited");
					}
				}
			});
		}
	});
	
	//节流搜索：当用户一直在输入搜索内容时，暂时不执行ajax方法
	//当用户搜索停止后（距离最后输入字符的时间1秒），判断用户输入完毕，执行ajax方法
	let inputStopDelay;
	
	$(".allusersSearch").on("input", function() {
		clearTimeout(inputStopDelay);
		if($(this).val() != null && $(this).val().trim() != "") {
			inputStopDelay = setTimeout(function() {
				doSearchAllUsersInvitationState();
			}, 1000);
		}
	});
	
	//搜索所有用户，同时检查是否在本问题下受到登录用户的邀请
	function doSearchAllUsersInvitationState() {
		if($(".allusersSearch").val().trim().length > 0) {
			//先清空搜索用户列表
			$(".alluserslist").html("");
			//显示占位符
			$("#allusers .hideAfterTabLoaded").show();
			$("#allusers .showAfterTabLoaded").hide();
			$.ajax({
				url: "invite/getSearchUserAndInvitationState",
				type: "POST",
				dataType: "json",
				data: {
					"questionId" : questionId,
					"searchStr" : $(".allusersSearch").val().trim()
				},
				success: function(response) {
					if(response != null && response.length > 0) {
						for (let i = 0; i < response.length; i++) {
							//console.log("search" + i + ":" + response[i].userId);
							setTimeout(function() {
								//取出模板，准备填充被关注者内容
								let $to_invite = $(".allTemplates .to_invite_Template .to_invite");
								//绑定头像
								if (response[i].headPhotoUrl != null && response[i].headPhotoUrl != "") {
									$to_invite.find("img").attr("src", response[i].headPhotoUrl);
								} else $to_invite.find("img").attr("src", "image/default_headphoto.png");
								//绑定昵称
								$to_invite.find("h4").html(response[i].nickname);
								//绑定用户主页URL
								$to_invite.find("a").attr("href", "user.html?visitUid=" + response[i].userId);
								//绑定用户ID到邀请按钮
								$to_invite.find(".to_invite_action span").attr("data-beInvitedId", response[i].userId + "");
								//判断是否已邀请
								if(response[i].alreadyInvited == "true") {
									let inviteTASpan = $to_invite.find(".to_invite_action span");
									//显示已邀请，变灰色
									inviteTASpan.removeClass("inviteTA");
									inviteTASpan.html("已邀请");
									inviteTASpan.addClass("invited");
								} else {
									let inviteTASpan = $to_invite.find(".to_invite_action span");
									//显示未邀请，变蓝色
									inviteTASpan.removeClass("invited");
									inviteTASpan.html("<i class='envelope outline icon'></i>邀请");
									inviteTASpan.addClass("inviteTA");
								}
								//插入结果集
								$(".alluserslist").append($to_invite.clone());
							}, 0);
						}
						$("#allusers .showAfterTabLoaded").show();
						//显示结果
						$("#allusers .hideAfterTabLoaded").hide();
						$("#allusers .showAfterTabLoaded").show();
					} else {
						showEmpty($(".alluserslist"));
					}
				},
				error: function(response) {
					//console.log(response);
					$("#allusers .hideAfterTabLoaded").hide();
					$("#allusers .showAfterTabLoaded").show();
					
					showEmpty($(".alluserslist"));
				}
			});
		} else {
			$("#allusers .hideAfterTabLoaded").hide();
			$("#allusers .showAfterTabLoaded").show();
		}
	}
	
	function bindingWriteAnswer() {
		$(".writeAnswerAction").on("click", function() {
			if(loginUser != null && loginUser != "" && questionId != null && questionTitle != null) {
				window.open(encodeURI("editor.html?type=submitAnswer&questionId=" + questionId + "&questionTitle=" + questionTitle),"_self");
			} 
		});
	}
});
