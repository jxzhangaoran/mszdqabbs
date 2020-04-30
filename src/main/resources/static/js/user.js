//获取地址栏参数
function getQueryString(name) {
	let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	let r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
}

//补齐前缀0
function addFrontZero(n) {
	if (Number(n) < 10 && Number(n) > 0) {
		return "0" + n;
	} else return n;
}

//访问用户ID非法时跳转404
function jump404() {
	window.open("404.html", "_self");
}

$(document).ready(function() {
	let loginUser;

	let visitUser;

	let visitUid = getQueryString("visitUid");

	if (visitUid == null || visitUid == "") {
		window.open("index.html", "_self");
	} else if ((parseInt(visitUid) != visitUid) || (visitUid < 0)) {
		jump404();
	}

	tryGetUid
		//已登录
		.then(function(uid) {
			//如果访问的是登录者本人的主页，直接跳转我的主页
			if (uid == visitUid) {
				window.open("me.html", "_self");
			}

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
					2、加载移动端的头像div，并加入两个选项：“我的” 和 “注销”
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
							if(response.success == "true" && invitationNum != null && invitationNum > 0) {
								$(".inviteNumber").html(invitationNum > 99 ? 99 : invitationNum);
								$(".inviteNumber").css("display","inline-block");
								$(".msgTipRedPoint").attr("style","opacity: 1 !important");
							}
						}
					});
					//处理本页面的其他事件
					loadVisitUserBasicInfo();
					loadArticles();
				}
			});
		})
		.catch(function(err) {
			loadVisitUserBasicInfo();
			loadArticles();
		});


	function loadVisitUserBasicInfo() {
		$.ajax({
			url: "usr/getVisitUserBasicInfo",
			type: "POST",
			dataType: "json",
			data: {
				"visitUid": visitUid
			},
			success: function(response) {
				if (response != null && response != "") {
					//console.log(response);

					visitUser = response;

					let headphoto = visitUser.headPhotoUrl == null || visitUser.headPhotoUrl == "" ?
						"image/default_headphoto.png" : visitUser.headPhotoUrl;

					//加载用户信息到头部信息栏
					let registerTime = new Date(visitUser.registerTime);
					$("#nickname").html(visitUser.nickname);
					$("title").html(visitUser.nickname + " | 码上知道");
					$("#usernameshow").html(visitUser.username);
					$("#registertimeshow").html(registerTime.getFullYear() + "年" +
						(registerTime.getMonth() + 1) + "月" +
						registerTime.getDate() + "日&nbsp;" +
						addFrontZero(registerTime.getHours()) + ":" +
						addFrontZero(registerTime.getMinutes()) + ":" +
						addFrontZero(registerTime.getSeconds()));
					$("#mottoshow").html(visitUser.motto);
					$("#myheadphotoborder").css("background-image", "url(" + headphoto + ")");
					//判断是否已关注，并绑定提示框事件
					if (visitUser.isAlreadyFollow == "true") {
						$(".followTA").removeClass("blue");
						$(".followTA").addClass("green");
						$(".followTA").html("<i class='check icon' style='color: white'></i>已关注");
					}
					setTimeout(function() {
						$("#myheadphotocontainer").click();
					}, 500);
					//console.log(visitUser);
					$(".followTA").on("click", function() {
						if (loginUser == null || loginUser == "") {
							//打开登录框
							$(".logintrigger").trigger("click");
						} else {
							toggleFollow(visitUser.visitUserId);
						}
					});
					//加载完毕后要解除占位符
					$(".placeholder").hide();
					$(".hidewhenloading").removeClass("hidewhenloading");
					//加载粉丝
					loadFans();

				} else {
					jump404();
				}
			},
			error: function(response) {
				jump404();
			}
		});
	}

	$("#mytabs_main .item").tab();

	$("#mytabs_aside .item").tab();

	//响应式改变宽度，避免布局错乱

	adjustWidth();

	function adjustWidth() {
		if (window.innerWidth < 1281 && window.innerWidth > 767) {
			$("#asidearea").removeClass("four");
			$("#asidearea").removeClass("wide");
			$("#asidearea").removeClass("column");

			$("#asidearea").addClass("six");
			$("#asidearea").addClass("wide");
			$("#asidearea").addClass("column");

			$("#mainarea").removeClass("twelve");
			$("#mainarea").removeClass("wide");
			$("#mainarea").removeClass("column");

			$("#mainarea").addClass("ten");
			$("#mainarea").addClass("wide");
			$("#mainarea").addClass("column");
		}
	}

	$(window).resize(function() {
		adjustWidth();
	});

	//移动端和PC端的关注提示框弹出位置不同
	if (window.innerWidth > 768) {
		$("#myheadphotocontainer").popup({
			popup: $("#followPopup"),
			on: "click",
			position: "bottom center",
			hoverable: "true"
		});
	}

	function toggleFollow(visitUid) {
		$(".followTA").addClass("loading");
		$(".followTA").addClass("disabled");
		$.ajax({
			url: "usr/toggleFollow",
			type: "POST",
			dataType: "json",
			data: {
				"to_follow": visitUid
			},
			success: function(response) {
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

	//如果粉丝、关注、文章等tab的ajax查询结果为空，则调用这个方法
	//将显示“空空如也”图片和信息
	function showEmpty(tabList) {
		//防止多次添加
		$(tabList).find(".emptyResult").remove();
		$(tabList).siblings(".input").hide();
		$(tabList).append($(".allTemplates .emptyResultTemplate .emptyResult").clone());
		$(tabList).parent().show();
		$(tabList).parent().siblings(".hideAfterTabLoaded").hide();
	}

	$(".loadFansTab").on("click", function() {
		loadFans();
	});

	function loadFans() {
		//先清空粉丝列表
		$(".fanslist").html("");
		//显示加载占位符
		$("#fans .hideAfterTabLoaded").show();
		$("#fans .showAfterTabLoaded").hide();
		$.ajax({
			url: "usr/getFollowersOf",
			type: "POST",
			dataType: "json",
			data: {
				"to_follow": visitUid
			},
			success: function(response) {
				if (response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						setTimeout(function() {
							//取出模板，准备填充粉丝内容
							let $fan = $(".allTemplates .fansTemplate .fan");
							//绑定头像
							if (response[i].headPhotoUrl != null && response[i].headPhotoUrl != "") {
								$fan.find("img").attr("src", response[i].headPhotoUrl);
							} else $fan.find("img").attr("src", "image/default_headphoto.png");
							//绑定昵称
							$fan.find("h4").html(response[i].nickname);
							//绑定用户主页URL
							$fan.find("a").attr("href", "user.html?visitUid=" + response[i].followerId);
							//插入结果集
							$(".fanslist").append($fan.clone());

						}, 0);
					}
					//修改搜索框显示的粉丝数目
					$(".fansSearch").attr("placeholder", "搜索TA的" + response.length + "个粉丝...");
					//绑定搜索输入事件
					$(".fansSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".fanslist .fan").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".fanslist .fan").each(function() {
								if ($(this).find("h4").html().toLowerCase().indexOf(searchVal) == -1) {
									$(this).hide();
								} else $(this).show();
							});
						}
					});
					$(".fansSearch").parent().show();
					//显示结果集
					$("#fans .hideAfterTabLoaded").hide();
					$("#fans .showAfterTabLoaded").show();
				} else {
					showEmpty(".fanslist");
				}
			},
			error: function(response) {
				showEmpty(".fanslist");
			}
		});
	}

	$(".loadFollowsTab").on("click", function() {
		loadFollows();
	});

	function loadFollows() {
		//先清空被关注者列表
		$(".followslist").html("");
		//显示加载占位符
		$("#followers .hideAfterTabLoaded").show();
		$("#followers .showAfterTabLoaded").hide();
		$.ajax({
			url: "usr/getFollowsOf",
			type: "POST",
			dataType: "json",
			data: {
				"follower": visitUid
			},
			success: function(response) {
				if (response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						setTimeout(function() {
							//取出模板，准备填充被关注者内容
							let $follows = $(".allTemplates .followsTemplate .follow");
							//绑定头像
							if (response[i].headPhotoUrl != null && response[i].headPhotoUrl != "") {
								$follows.find("img").attr("src", response[i].headPhotoUrl);
							} else $follows.find("img").attr("src", "image/default_headphoto.url");
							//绑定昵称
							$follows.find("h4").html(response[i].nickname);
							//绑定用户主页URL
							$follows.find("a").attr("href", "user.html?visitUid=" + response[i].followerId);
							//插入结果集
							$(".followslist").append($follows.clone());

						}, 0);
					}
					//修改搜索框显示的关注数目
					$(".followsSearch").attr("placeholder", "搜索TA关注的" + response.length + "个用户...");
					//绑定搜索输入事件
					$(".followsSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".followslist .follow").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".followslist .follow").each(function() {
								if ($(this).find("h4").html().toLowerCase().indexOf(searchVal) == -1) {
									$(this).hide();
								} else $(this).show();
							});
						}
					});
					$(".followsSearch").parent().show();
					//显示结果集
					$("#followers .hideAfterTabLoaded").hide();
					$("#followers .showAfterTabLoaded").show();
				} else {
					showEmpty(".followslist");
				}
			},
			error: function(response) {
				showEmpty(".followslist");
			}
		});
	}

	$(".loadArticlesTab").on("click", function() {
		loadArticles();
	});

	function loadArticles() {
		//先清空被关注者列表
		$(".articleslist tbody").html("");
		//显示加载占位符
		$("#articles .hideAfterTabLoaded").show();
		$("#articles .showAfterTabLoaded").hide();
		$.ajax({
			url: "article/getArticlesWriteBy",
			type: "GET",
			dataType: "json",
			data: {
				"authorId": visitUid
			},
			success: function(response) {
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {

						setTimeout(function() {
							let $article = $(".allTemplates .articleTemplate .articleDiv .article");
							//console.log($article.html());
							//绑定修改时间
							let lut = new Date(response[i].lastUpdateTime);
							$article.find(".articleLastUpdateTimeWord").html(
								lut.getFullYear() + "年" +
								(lut.getMonth() + 1) + "月" +
								lut.getDate() + "日");
							//绑定文章标题
							$article.find(".articleTitle").html(response[i].title);
							//绑定标题的文章ID数据
							$article.find(".articleTitle").attr("data-articleId", response[i].articleId);
							//插入到文章列表中
							$(".articleslist tbody").append($article.clone());
						}, 0);
					}
					//修改搜索框显示的文章数目
					$(".articlesSearch").attr("placeholder", "搜索TA的" + response.length + "篇文章标题...");
					//绑定搜索输入事件
					$(".articlesSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".articleslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".articleslist tbody tr").each(function() {
								if ($(this).find(".articleTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									$(this).hide();
								} else $(this).show();
							});
						}
					});
					//绑定文章标题点击事件
					$(".articleslist tbody").on("click", ".articleTitle", function() {
						window.open("showArticle.html?articleId=" + $(this).attr("data-articleId"), "_self");
					});
					$(".articlesSearch").parent().show();
					//显示结果集
					$("#articles .hideAfterTabLoaded").hide();
					$("#articles .showAfterTabLoaded").show();
				} else {
					showEmpty(".articleslist");
				}
			},
			error: function(response) {
				showEmpty(".articleslist");
			}
		});
	}
	
	$(".loadQuestionsTab").on("click", function() {
		loadQuestions();
	});
	
	function loadQuestions() {
		//先清空问题列表
		$(".questionslist tbody").html("");
		//显示加载占位符
		$("#questions .hideAfterTabLoaded").show();
		$("#questions .showAfterTabLoaded").hide();
		$.ajax({
			url: "question/getQuestionsAskedBy",
			type: "GET",
			dataType: "json",
			data: {
				"authorId": visitUid
			},
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {
						let $question = $(".allTemplates .questionTemplate .questionDiv .question");
						//console.log($question.html());
						//绑定修改时间
						let lut = new Date(response[i].lastUpdateTime);
						$question.find(".questionLastUpdateTimeWord").html(
							lut.getFullYear() + "年" +
							(lut.getMonth() + 1) + "月" +
							lut.getDate() + "日");
						//绑定问题标题
						$question.find(".questionTitle").html(response[i].title);
						//绑定标题和删除的问题ID数据
						$question.find(".questionTitle").attr("data-questionId", response[i].questionId);
						$question.find(".deleteQuestion").attr("data-questionId", response[i].questionId);
						$question.find(".alternateQuestion").attr("data-questionId", response[i].questionId);
						//插入到问题列表中
						$(".questionslist tbody").append($question.clone());
					}
					//修改搜索框显示的收藏问题数目
					$(".questionsSearch").attr("placeholder", "搜索TA的" + response.length + "个问题标题...");
					//绑定搜索输入事件
					$(".questionsSearch").on("input", function() {
						//console.log($(this).val());
						if ($(this).val().length == 0) {
							$(".questionslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".questionslist tbody tr").each(function() {
								if ($(this).find(".questionTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定问题标题点击事件
					$(".questionslist tbody").on("click", ".questionTitle", function() {
						window.open("showQuestion.html?questionId=" + $(this).attr("data-questionId"), "_self");
					});
					$(".questionsSearch").parent().show();
					//显示结果集
					$("#questions .hideAfterTabLoaded").hide();
					$("#questions .showAfterTabLoaded").show();
				} else {
					showEmpty(".questionslist");
				}
			},
			error: function(response) {
				showEmpty(".questionslist");
			}
		});
	}
	
	$(".loadAnswersTab").on("click", function() {
		loadAnswers();
	});
	
	function loadAnswers() {
		//先清空回答列表
		$(".answerslist").html("");
		//显示加载占位符
		$("#answers .hideAfterTabLoaded").show();
		$("#answers .showAfterTabLoaded").hide();
		
		$.ajax({
			url: "answer/getAnswersWriteBy",
			type: "GET",
			dataType: "json",
			data: {
				"authorId": visitUid
			},
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {
						let $answer = $(".allTemplates .answerTemplate .eachAnswer");
						//console.log($answer.html());
						//绑定修改时间
						let lut = new Date(response[i].lastUpdateTime);
						$answer.find(".answerLastUpdateTimeNum").html(
							lut.getFullYear() + "年" +
							(lut.getMonth() + 1) + "月" +
							lut.getDate() + "日");
						//绑定问题标题
						$answer.find(".answerQuestionTitle h3").html(response[i].questionTitle);
						//绑定内容预览
						let answerContent = response[i].answerContent;
						//先替换掉图片，图片链接显示成 【图片】
						let imageReg = /!\[(.*)\]\((.*)\)/g;
						//替换Markdown的标签
						let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
						answerContent = answerContent.replace(imageReg, " 【图片】 ").replace(reg, "");
						if(answerContent.length > 150) {
							answerContent = answerContent.substr(0, 150) + "...";
						}
						$answer.find(".answerContentPreview p").html(answerContent);
						//绑定标题、内容预览和删除的回答ID数据
						$answer.find(".answerQuestionTitle").attr("data-questionId", response[i].questionId);
						$answer.find(".answerContentPreview").attr("data-answerId", response[i].answerId);
						$answer.find(".deleteAnswer").attr("data-answerId", response[i].answerId);
						$answer.find(".alterAnswer").attr("data-answerId", response[i].answerId);
						//插入到回答列表中
						$(".answerslist").append($answer.clone());
					}
					//修改搜索框显示的收藏问题数目
					$(".answersSearch").attr("placeholder", "搜索TA的" + response.length + "个回答内容...");
					//绑定搜索输入事件
					$(".answersSearch").on("input", function() {
						//console.log($(this).val());
						if ($(this).val().length == 0) {
							$(".answerslist .eachAnswer").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".answerslist .eachAnswer").each(function() {
								if ($(this).find(".answerContentPreview p").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定问题标题点击事件
					$(".answerslist").on("click", ".answerQuestionTitle", function() {
						window.open("showQuestion.html?questionId=" + $(this).attr("data-questionId"), "_self");
					});
					//绑定回答内容点击事件
					$(".answerslist").on("click",".answerContentPreview", function() {
						window.open("showAnswer.html?answerId=" + $(this).attr("data-answerId"), "_self");
					});
		
					$(".answerslist").on("blur", ".deleteAnswer", function() {
						$(this).html("<i class='trash alternate outline icon'></i>删除");
					});
		
					$(".answersSearch").parent().show();
					//显示结果集
					$("#answers .hideAfterTabLoaded").hide();
					$("#answers .showAfterTabLoaded").show();
				} else {
					showEmpty(".answerslist");
				}
			},
			error: function(response) {
				showEmpty(".answerslist");
			}
		});
	}
	
	$(".loadCommentsTab").on("click", function() {
		loadCommentsTab();
	});
	
	function loadCommentsTab() {
		//先清空文章列表
		$(".commentslist tbody").html("");
		//显示加载占位符
		$("#comments .hideAfterTabLoaded").show();
		$("#comments .showAfterTabLoaded").hide();
		$.ajax({
			url: "comment/getCommentsBy",
			type: "GET",
			dataType: "json",
			data: {
				"commentator": visitUid
			},
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						setTimeout(function() {
							let $comment = $(".allTemplates .commentTemplate .commentDiv .comment");
							//绑定评论时间
							let lut = new Date(response[i].commentTime);
							$comment.find(".commentSubmitTimeWord").html(
								lut.getFullYear() + "年" +
								(lut.getMonth() + 1) + "月" +
								lut.getDate() + "日");
							//绑定评论内容和其评论对象的ID和类别
							$comment.find(".commentContent").html(response[i].commentContent);
							$comment.find(".commentContent").attr("data-commentToId", response[i].clickId);
							$comment.find(".commentContent").attr("data-commentType", response[i].commentType);
							//绑定评论对象内容
							$comment.find(".commentTo").html(response[i].commentTo);
							//绑定评论对象ID和类别
							$comment.find(".commentTo").attr("data-commentToId", response[i].clickId);
							$comment.find(".commentTo").attr("data-commentType", response[i].commentType);
							//插入到评论列表中
							$(".commentslist tbody").append($comment.clone());
						}, 0);
					}
					//修改搜索框显示的收藏文章数目
					$(".commentsSearch").attr("placeholder", "搜索TA的" + response.length + "个评论内容...");
					//绑定搜索输入事件
					$(".commentsSearch").on("input", function() {
						//console.log($(this).val());
						if ($(this).val().length == 0) {
							$(".commentslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".commentslist tbody tr").each(function() {
								if ($(this).find(".commentContent").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
	
					//绑定评论内容点击内容，直接跳转评论区
					$(".commentslist tbody").on("click", ".commentContent", function() {
						if ($(this).attr("data-commentType") == 0) {
							window.open("showAnswer.html?answerId=" +  $(this).attr("data-commentToId") + "&target=comment","_self");
						} else if ($(this).attr("data-commentType") == 1) {
							window.open("showArticle.html?articleId=" + $(this).attr("data-commentToId") + "&target=comment", "_self");
						}
					});
					
					//绑定评论对象点击事件
					$(".commentslist tbody").on("click", ".commentTo", function() {
						if ($(this).attr("data-commentType") == 0) {
							window.open("showAnswer.html?answerId=" +  $(this).attr("data-commentToId"),"_self");
						} else if ($(this).attr("data-commentType") == 1) {
							window.open("showArticle.html?articleId=" + $(this).attr("data-commentToId"), "_self");
						}
					});
	
					$(".commentsSearch").parent().show();
					//显示结果集
					$("#comments .hideAfterTabLoaded").hide();
					$("#comments .showAfterTabLoaded").show();
				} else {
					showEmpty(".commentslist");
				}
			},
			error: function(response) {
				showEmpty(".commentslist");
			}
		});
	}
	
	
	$(".tabSwitcher").on("click", function() {
		$(this).siblings(".tabSwitcher").removeClass("active");
		$(this).addClass("active");
	})
	
	$(".loadCollectionsTab").on("click", function() {
		//默认加载文章的收藏
		$(".loadArticleCollectionsTab").trigger("click");
	});
	
	let tabSwitcherClicked = [false, false, false];
	
	$(".loadArticleCollectionsTab").on("click", function() {
		if(tabSwitcherClicked[1] != true && tabSwitcherClicked[2] != true) {
			tabSwitcherClicked[0] = true;
			loadArticleCollections();
			tabSwitcherClicked[0] = false;
		}
	});
	
	$(".loadQuestionCollectionsTab").on("click", function() {
		if(tabSwitcherClicked[0] != true && tabSwitcherClicked[2] != true) {
			tabSwitcherClicked[1] = true;
			loadQuestionCollections();
			tabSwitcherClicked[1] = false;
		}
	});
	
	$(".loadAnswerCollectionsTab").on("click", function() {
		if(tabSwitcherClicked[0] != true && tabSwitcherClicked[1] != true) {
			tabSwitcherClicked[2] = true;
			loadAnswerCollections();
			tabSwitcherClicked[2] = false;
		}
	});
	
	function loadArticleCollections() {
		$("#collections .showAfterTabLoaded").hide();
		//先清空列表
		$(".articleCollections .collectionslist tbody").html("");
		//显示加载占位符
		$("#collections .hideAfterTabLoaded").show();
		$("#collections .articleCollections").hide();
		//防止因用户多次不同标签卡点击导致结果重叠
		$("#collections .showAfterTabLoaded").hide();
		$.ajax({
			url: "article/getArticlesCollectedBy",
			type: "GET",
			dataType: "json",
			data: {
				"collector" : visitUid
			},
			success: function(response) {
				if(response != null && response.length > 0) {
					//console.log(response);
					for(let i = 0;i < response.length;i++) {
						
						setTimeout(function() {
							let $article = $(".allTemplates .collectionArticleTemplate .collectionArticleDiv .articleCollection");
							//console.log($article.html());
							//绑定修改时间
							let lut = new Date(response[i].lastUpdateTime);
							$article.find(".articleCollectionLastUpdateTimeWord").html(
							lut.getFullYear() + "年" +
							(lut.getMonth() + 1) + "月" + 
							lut.getDate() + "日");
							//绑定文章标题
							$article.find(".articleCollectionTitle").html(response[i].title);
							//绑定标题的文章ID数据
							$article.find(".articleCollectionTitle").attr("data-collectionArticleId", response[i].articleId);
							//插入到文章列表中
							$(".articleCollections .collectionslist tbody").append($article.clone());
						}, 0);
					}
					//修改搜索框显示的收藏文章数目
					$(".articleCollections .collectionsSearch").attr("placeholder","搜索TA收藏的" + response.length + "篇文章标题...");
					//绑定搜索输入事件
					$(".articleCollections .collectionsSearch").on("input",function() {
						if($(this).val().length == 0) {
							$(".articleCollections .collectionslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".articleCollections .collectionslist tbody tr").each(function () {
								if($(this).find(".articleCollectionTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style","display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定文章标题点击事件
					$(".articleCollections .collectionslist tbody").on("click",".articleCollectionTitle",function() {
						window.open("showArticle.html?articleId=" + $(this).attr("data-collectionArticleId"), "_self");
					});
					
					$(".articleCollections .collectionsSearch").parent().show();
					//显示结果集
					$("#collections .hideAfterTabLoaded").hide();
					$("#collections .articleCollections").show();
				} else {
					showEmpty(".articleCollections .collectionslist");
				}
			},
			error: function(response) {
				showEmpty(".articleCollections .collectionslist");
			}
		});
	}
	
	function loadQuestionCollections() {
		$("#collections .showAfterTabLoaded").hide();
		//先清空列表
		$(".questionCollections .collectionslist tbody").html("");
		//显示加载占位符
		$("#collections .hideAfterTabLoaded").show();
		$("#collections .articleCollections").hide();
		//防止因用户多次不同标签卡点击导致结果重叠
		$("#collections .showAfterTabLoaded").hide();
		$.ajax({
			url: "question/getQuestionsCollectedBy",
			type: "GET",
			dataType: "json",
			data: {
				"collector": visitUid
			},
			success: function(response) {
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {
		
						setTimeout(function() {
							let $question = $(".allTemplates .collectionQuestionTemplate .collectionQuestionDiv .questionCollection");
							//console.log($question.html());
							//绑定修改时间
							let lut = new Date(response[i].lastUpdateTime);
							$question.find(".questionCollectionLastUpdateTimeWord").html(
								lut.getFullYear() + "年" +
								(lut.getMonth() + 1) + "月" +
								lut.getDate() + "日");
							//绑定问题标题
							$question.find(".questionCollectionTitle").html(response[i].title);
							//绑定标题、修改和删除的问题ID数据
							$question.find(".questionCollectionTitle").attr("data-collectionQuestionId", response[i].questionId);
							$question.find(".deleteCollectionQuestion").attr("data-collectionQuestionId", response[i].questionId);
							//插入到问题列表中
							$(".questionCollections .collectionslist tbody").append($question.clone());
						}, 0);
					}
					//修改搜索框显示的问题数目
					$(".questionCollections .collectionsSearch").attr("placeholder", "搜索TA收藏的" + response.length + "个问题标题...");
					//绑定搜索输入事件
					$(".questionCollections .collectionsSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".questionCollections .collectionslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".questionCollections .collectionslist tbody tr").each(function() {
								if ($(this).find(".questionCollectionTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定文章标题点击事件
					$(".questionCollections .collectionslist tbody").on("click", ".questionCollectionTitle", function() {
						window.open("showQuestion.html?questionId=" + $(this).attr("data-collectionQuestionId"), "_self");
					});
		
					$(".questionCollections .collectionsSearch").parent().show();
					//显示结果集
					$("#collections .hideAfterTabLoaded").hide();
					$("#collections .questionCollections").show();
				} else {
					showEmpty(".questionCollections .collectionslist");
				}
			},
			error: function(response) {
				showEmpty(".questionCollections .collectionslist");
			}
		});
	}
	
	function loadAnswerCollections() {
		$("#collections .showAfterTabLoaded").hide();
		//先清空列表
		$(".answerCollections .collectionslist").html("");
		//显示加载占位符
		$("#collections .hideAfterTabLoaded").show();
		$("#collections .answerCollections").hide();
		
		$.ajax({
			url: "answer/getAnswersCollectedBy",
			type: "GET",
			dataType: "json",
			data: {
				"collector": visitUid
			},
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {
						let $answer = $(".allTemplates .collectionAnswerTemplate .eachCollectionAnswer");
						//console.log($answer.html());
						//绑定修改时间
						let lut = new Date(response[i].lastUpdateTime);
						$answer.find(".collectionAnswerLastUpdateTimeNum").html(
							lut.getFullYear() + "年" +
							(lut.getMonth() + 1) + "月" +
							lut.getDate() + "日");
						//绑定问题标题
						$answer.find(".collectionAnswerQuestionTitle h3").html(response[i].questionTitle);
						//绑定内容预览
						let answerContent = response[i].answerContent;
						//先替换掉图片，图片链接显示成 【图片】
						let imageReg = /!\[(.*)\]\((.*)\)/g;
						//替换Markdown的标签
						let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
						answerContent = answerContent.replace(imageReg, " 【图片】 ").replace(reg, "");
						if(answerContent.length > 150) {
							answerContent = answerContent.substr(0, 150) + "...";
						}
						$answer.find(".collectionAnswerContentPreview p").html(answerContent);
						//绑定标题、内容预览和取消收藏的回答ID数据
						$answer.find(".collectionAnswerQuestionTitle").attr("data-questionId", response[i].questionId);
						$answer.find(".collectionAnswerContentPreview").attr("data-answerId", response[i].answerId);
						$answer.find(".deleteCollectionAnswer").attr("data-collectionAnswerId", response[i].answerId);
						//插入到回答列表中
						$(".answerCollections .collectionslist").append($answer.clone());
					}
					//修改搜索框显示的收藏问题数目
					$(".answerCollections .collectionsSearch").attr("placeholder", "搜索TA的" + response.length + "个收藏回答内容...");
					//绑定搜索输入事件
					$(".answerCollections .collectionsSearch").on("input", function() {
						//console.log($(this).val());
						if ($(this).val().length == 0) {
							$(".answerCollections .collectionslist .eachCollectionAnswer").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".answerCollections .collectionslist .eachCollectionAnswer").each(function() {
								if ($(this).find(".collectionAnswerContentPreview p").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定收藏回答对应问题标题点击事件
					$(".answerCollections .collectionslist").on("click", ".collectionAnswerQuestionTitle", function() {
						window.open("showQuestion.html?questionId=" + $(this).attr("data-questionId"), "_self");
					});
					//绑定收藏回答内容点击事件
					$(".answerCollections .collectionslist").on("click",".collectionAnswerContentPreview", function() {
						window.open("showAnswer.html?answerId=" + $(this).attr("data-answerId"), "_self");
					});
		
					$(".answerCollections .collectionslist").on("blur", ".deleteCollectionAnswer", function() {
						$(this).html("<i class='trash alternate outline icon'></i>取消收藏");
					});
		
					$(".answerCollections .collectionsSearch").parent().show();
					//显示结果集
					$("#collections .hideAfterTabLoaded").hide();
					$("#collections .answerCollections").show();
				} else {
					showEmpty(".answerCollections .collectionslist");
				}
			},
			error: function(response) {
				showEmpty(".answerCollections .collectionslist");
			}
		});
	}
});
