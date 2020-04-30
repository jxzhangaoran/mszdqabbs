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
						resolve();
					}
				});
			})
			.catch(function(err) {
				resolve();
			});
	}).then(function() {
		loadArticleAndAuthor();
	});
	
	function jump404() {
		window.open("404.html", "_self");
	}

	let articleId = getQueryString("articleId");
	if (articleId == null) {
		window.open("article.html", "_self");
	} else if ((parseInt(articleId) != articleId) || (articleId < 0)) {
		jump404();
	}

	function loadArticleAndAuthor() {
		//获取文章和作者信息并填充DOM
		new Promise(function(resolve, reject) {
			$.ajax({
				url: "article/getArticle",
				type: "GET",
				dataType: "json",
				data: {
					"articleId": articleId
				},
				success: function(response) {
					//console.log(response);
					if (response != null && response != "") {
						//console.log(response);
						//更改HTML Title
						$("title").html(response.article.title + " | 码上知道");
						//填充移动端头部DOM
						if (response.headPhotoUrl != null && response.headPhotoUrl != "") {
							$(".mobile_authorHeadPhoto img").attr("src", response.headPhotoUrl);
						}
						$(".authorName").html(response.nickname);
						$(".mottoWord").html(response.motto);
						//填充PC端右侧作者信息DOM
						if (response.headPhotoUrl != null && response.headPhotoUrl != "") {
							$(".authorBasicInfo img").attr("src", response.headPhotoUrl);
						}
						$(".answerCount").html(response.answerCount);
						$(".articleCount").html(response.articleCount);
						$(".fansCount").html(response.followerCount);
						//填充文章主体
						$(".articleTitle h1").html(response.article.title);
						let submitTime = new Date(response.article.submit_time);
						$(".submitTimeValue").html(
							submitTime.getFullYear() + "年" +
							(submitTime.getMonth() + 1) + "月" +
							submitTime.getDate() + "日&nbsp;" +
							addFrontZero(submitTime.getHours()) + ":" +
							addFrontZero(submitTime.getMinutes()));
						//若文章有修改，则填充修改时间并显示
						if (response.article.last_update_time != null && response.article.last_update_time != "") {
							let lastUpdateTime = new Date(response.article.last_update_time);
							$(".lastUpdateTimeValue").html(
								lastUpdateTime.getFullYear() + "年" +
								(lastUpdateTime.getMonth() + 1) + "月" +
								lastUpdateTime.getDate() + "日&nbsp;" +
								addFrontZero(lastUpdateTime.getHours()) + ":" +
								addFrontZero(lastUpdateTime.getMinutes()));
							$(".lastUpdateTime").css("display", "block");
						}
						$(".browseCountValue").html("被浏览次数：" + response.article.browse_count);
						//填充文章内容Markdown
						$("#mainContent textarea").html(response.article.content);
						//转换正文html
						editormd.markdownToHTML("mainContent", {
							htmlDecode: "style,script,iframe",
							emoji: true,
							taskList: true,
							tex: true, // 默认不解析
							flowChart: true, // 默认不解析
							sequenceDiagram: true // 默认不解析
						});
						//加载赞同数
						let likeCount = response.likeCount;
						if (Number(likeCount) > 1000) {
							likeCount = "1K+";
						} else if (Number(likeCount) > 10000) likeCount = "1W+";
						$(".like_count").html(likeCount);
						//加载收藏数
						let collectionCount = response.collectionCount;
						if (Number(collectionCount) > 1000) {
							collectionCount = "1K+";
						} else if (Number(collectionCount) > 10000) collectionCount = "1W+";
						$(".collectionCountValue").html(collectionCount);
						//加载评论数
						let commentCount = response.commentCount;
						if (Number(commentCount) > 1000) {
							commentCount = "1K+";
						} else if (Number(commentCount) > 10000) commentCount = "1W+";
						$(".commentCountValue").html(commentCount);
						//绑定用户头像、昵称、“TA的主页”点击事件
						$(".mobile_authorHeadPhoto,.authorName,.authorNameAndMotto .authorName,.goToMainPageOfTA,.authorHeadPhoto").on("click",function() {
							window.open("user.html?visitUid=" + response.article.author,"_self");
						});
						//取消占位符显示
						$(".loadingHolder").css("display", "none");
						//处理从属关系
						refreshRelation(response.authorId,
							response.isAlreadyFollow == "true",
							response.isAlreadyCollect == "true");
						//加载评论区
						loadTopComments();
						//判断是否需要显示fixed工具条
						//持续判断，确保显示正常
						setInterval(function() {
							checkReachContentBottom();
						}, 500);
						resolve();
					} else jump404();
				},
				error: function(response) {
					//console.log(response);
					jump404();
				}
			});
		}).then(function() {
			//加载完成后判断是否直接跳转评论区
			if (getQueryString("target") == "comment") {
				//滚动到评论区
				setTimeout(function() {
					let $target = $('[name=commenttag]');
					let targetOffset = $target.offset().top;
					$('html,body').animate({
						scrollTop: targetOffset
					}, 0);
				}, 50);
			}
		});
	}

	//作者是自己、已收藏等情况的处理
	function refreshRelation(authorId, isAlreadyFollow, isAlreadyCollect) {
		//未登录
		if (loginUser == null || loginUser == "") {
			$(".collection,.followTA,.commentInput").on("click", function() {
				//打开登录框
				$(".logintrigger").trigger("click");
				$(".commentInput").blur();
			});
		}
		//作者是本人
		else if (loginUser.id == authorId) {
			$(".followTA").css("display", "none");
			$(".goToMainPageOfTA").html("&nbsp;我的主页&nbsp;");
			$(".goToMainPageOfTA").on("click", function() {
				window.open("me.html", "_self");
			});
			$(".authorHeadPhoto,.mobile_authorHeadPhoto").on("click", function() {
				window.open("me.html", "_self");
			});
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
				toggleFollow(authorId);
			});

			//不能自己收藏自己写的文章，所以收藏文章的事件绑定放在这里
			//是否已收藏文章
			if (isAlreadyCollect) {
				$(".addCollection").css("display", "none");
				$(".cancelCollection").css("display", "block");
			}
			$("#collectNotFixed").popup({
				on: "click",
				popup: $("#collectionPopup"),
				position: "top center"
			});
			$("#collectFixed").popup({
				on: "click",
				popup: $("#collectionPopupFixed"),
				position: "top center"
			});

			$(".addCollectionBtn,.cancelCollectionBtn").on("click", function() {
				toggleCollect();
			});
		}
	}

	function toggleFollow(authorId) {
		$(".followTA").addClass("loading");
		$(".followTA").addClass("disabled");
		$.ajax({
			url: "usr/toggleFollow",
			type: "POST",
			dataType: "json",
			data: {
				"to_follow": authorId
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

	function toggleCollect() {
		let isCollect = ($(".cancelCollection").css("display") == "none");
		if (isCollect) {
			$(".addCollectionBtn").addClass("loading");
			$(".addCollectionBtn").addClass("disabled");
		} else {
			$(".cancelCollectionBtn").addClass("loading");
			$(".cancelCollectionBtn").addClass("disabled");
		}

		$.ajax({
			url: "collection/toggleCollection",
			type: "POST",
			dataType: "json",
			data: {
				"collection_id": articleId,
				"collection_type": "1"
			},
			success: function(response) {
				$(".addCollection").css("display", "none");
				$(".cancelCollection").css("display", "none");
				if (isCollect && response.type == "collect") {
					$(".addCollectionBtn").removeClass("loading");
					$(".addCollectionBtn").removeClass("disabled");
					$(".cancelCollection").css("display", "block");
				} else if (response.type == "cancel") {
					$(".cancelCollectionBtn").removeClass("loading");
					$(".cancelCollectionBtn").removeClass("disabled");
					$(".addCollection").css("display", "block");
				}
			},
			error: function(response) {
				$(".addCollectionBtn").removeClass("loading");
				$(".addCollectionBtn").removeClass("disabled");
				$(".cancelCollectionBtn").removeClass("loading");
				$(".cancelCollectionBtn").removeClass("disabled");
			}
		});
	}

	/**
	 * 判断元素是否可见
	 * @param {Object} elm
	 */
	function checkVisible(elm) {
		let rect = elm.getBoundingClientRect();
		//console.log(elm.id + ".top:" + rect.top + "  .bottom:" + rect.bottom);
		//获取当前浏览器的视口高度，不包括工具栏和滚动条
		//document.documentElement.clientHeight兼容 Internet Explorer 8、7、6、5
		let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
		//bottom top是相对于视口的左上角位置
		//bottom大于0或者top-视口高度小于0可见
		return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
	}

	checkReachContentBottom();

	$(window).scroll(function() {
		checkReachContentBottom();
	});

	//检查是否看到文章尾部
	function checkReachContentBottom() {
		if (checkVisible($("#checkReachBottom")[0]) || !checkVisible($("#mainContent")[0])) {
			//console.log("visible");
			$(".fixedActions").hide();
		} else {
			//console.log("notVisible");
			$(".fixedActions").css("width", $(".articleTop").outerWidth());
			$(".fixedActions").slideDown(300);
		}
	}

	$(".like").on("click", function() {
		$.ajax({
			url: "article/evaluate",
			type: "GET",
			dataType: "json",
			data: {
				"articleId": articleId,
				"likeOrDislike": "1"
			}
		});

		if ($(".like_count").html().indexOf("+") == -1) {
			let oldCount = Number($(".like_count").html());
			$(".like_count").html(++oldCount);
		}
		$(".likeWord").html("<i class='smile outline icon'></i>");
		$(".like").unbind("click");
		$(".dislike").unbind("click");
	});

	$(".dislike").on("click", function() {
		$.ajax({
			url: "article/evaluate",
			type: "GET",
			dataType: "json",
			data: {
				"articleId": articleId,
				"likeOrDislike": "0"
			}
		});

		$(".dislikeWord").html("<i class='frown outline icon'></i>");
		$(".dislike").unbind("click");
		$(".like").unbind("click");
	});

	$(".clickToSlideToComment").on("click", function() {
		let $target = $('[name=commenttag]');
		let targetOffset = $target.offset().top;
		$('html,body').animate({
			scrollTop: targetOffset
		}, 300);
	});

	$(".commentInput").on("input", function() {
		let inputLength = $(".commentInput").val().length;
		$(".howManyCanInputNumber").html(200 - inputLength >= 0 ? 200 - inputLength : 0);
		if (inputLength > 0 && inputLength < 201) {
			$(".commentSubmit").removeClass("disabled");
		} else $(".commentSubmit").addClass("disabled");
	});

	$("#success_modal_ok").on("click", function() {
		window.location.reload();
	});

	$(".commentSubmit").on("click", function() {
		if (loginUser != null && loginUser != "") {
			$.ajax({
				url: "comment/insertComment",
				type: "POST",
				dataType: "json",
				data: {
					"to_comment": articleId,
					"to_comment_type": "1",
					"content": $(".commentInput").val()
				},
				success: function(response) {
					if (response.success == "true" && response.type == "article") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.location.reload();
								}
							})
							.modal("show");
					} else {
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});


		} else {
			//打开登录框
			$(".logintrigger").trigger("click");
			$(".commentInput").blur();
		}
	});

	function loadTopComments() {
		$.ajax({
			url: "comment/getTopComments",
			type: "GET",
			dataType: "json",
			data: {
				"to_comment": articleId,
				"to_comment_type": "1"
			},
			success: function(response) {
				if (response != null && response.success == "true" && response.comments.length > 0) {
					//显示评论列表
					$(".hasCommentDiv").css("display", "block");
					//隐藏无评论的提示div
					$(".noCommentDiv").css("display","none");
					new Promise(function(resolve, reject) {
						for (let i = 0; i < response.comments.length; i++) {
							appendAComment(response.comments[i]);
						}
						resolve();
					})
					.then(function() {
						bindingCommentActions();
					});
					if (response.comments.length > 0 && response.isThatAll != "true") {
						$(".moreCommentDiv").css("display", "block");
					}
				}
			},
			error: function(response) {
				//console.log(response);
			}
		});
	}
	
	$(".clickToShowAllComments").on("click",function() {
		$(this).css("display","none");
		$(this).siblings(".loader").css("display","block");
		
		$.ajax({
			url: "comment/getRemainAllComments",
			type: "GET",
			dataType: "json",
			data: {
				"to_comment": articleId,
				"to_comment_type": "1"
			},
			success: function(response) {
				if (response != null && response.success == "true" && response.comments.length > 0) {
					new Promise(function(resolve, reject) {
						for (let i = 0; i < response.comments.length; i++) {
							appendAComment(response.comments[i]);
						}
						resolve();
					})
					.then(function() {
						bindingCommentActions();
						$(".moreCommentDiv").css("display","none");
						$(".clickToShowAllComments").unbind("click");
					});
				} else {
					$(".moreCommentDiv").css("display","none");
					$(".clickToShowAllComments").unbind("click");
				}
			},
			error: function(response) {
				//console.log(response);
				$(".moreCommentDiv").css("display","none");
				$(".clickToShowAllComments").unbind("click");
			}
		});
	});
	
	function appendAComment(aComment) {
		setTimeout(function() {
			//获取评论块模板
			let $c = $(".commentDivTemplate").children(".commentsDiv");
			//开始构造模板数据
			//评论者头像
			let commentatorHeadPhoto = $c.find(".commentatorHeadphoto");
			if (aComment.commentator.headPhotoUrl != null && aComment.commentator.headPhotoUrl !=
				"") {
				commentatorHeadPhoto.attr("src", aComment.commentator.headPhotoUrl);
			} else commentatorHeadPhoto.attr("src", "image/default_headphoto.png");
			//评论者昵称
			let commentatorNickname = $c.find(".commentatorNickname");
			commentatorNickname.html(aComment.commentator.nickname);
			//评论时间
			let commentTime = $c.find(".commentTime");
			let submitTime = new Date(aComment.comment.comment_time);
			commentTime.html(
				submitTime.getFullYear() + "年" +
				(submitTime.getMonth() + 1) + "月" +
				submitTime.getDate() + "日&nbsp;" +
				addFrontZero(submitTime.getHours()) + ":" +
				addFrontZero(submitTime.getMinutes()));
			//评论正文
			let mainContent = $c.find(".commentsBody");
			mainContent.html(aComment.comment.content);
			//点赞次数
			let likeCount = $c.find(".likeCount");
			let likeCountNum = Number(aComment.likeCount) > 99 ? "99+" : aComment.likeCount;
			likeCount.html(likeCountNum);
			//踩次数
			let dislikeCount = $c.find(".dislikeCount");
			let dislikeCountNum = Number(aComment.dislikeCount) > 99 ? "99+" : aComment.dislikeCount;
			dislikeCount.html(dislikeCountNum);
			//绑定评论ID和评论作者ID
			$c.attr("data-commentId",aComment.comment.id);
			$c.attr("data-commentatorId",aComment.commentator.authorId);
			//插入评论列表DOM
			$(".comments").append($c.clone());
		}, 0);
	}
	
	function bindingCommentActions() {
		//先取消绑定，防止重复绑定
		$(".comments").unbind("click");
		//绑定回复点击事件
		$(".comments").on("click", ".replySpan", function(event) {
			if (loginUser != null && loginUser != "") {
				$(".commentInput").val("回复给 " + $(this)
					.parent()
					.siblings(".commentsHeader")
					.children(".commentatorNickname")
					.html() + "：");
				//评论输入框获得焦点
				$(".commentInput").focus();
				//刷新可输入字符数
				$(".commentInput").trigger("input");
				//跳转评论输入框处
				setTimeout(function() {
					let $target = $('[name=commenttag]');
					let targetOffset = $target.offset().top;
					$('html,body').animate({
						scrollTop: targetOffset
					}, 0);
				}, 50);
			} else {
				//打开登录框
				$(".logintrigger").trigger("click");
			}
			//阻止冒泡
			event.stopPropagation();
		});
		//绑定点赞事件
		$(".comments").on("click",".likeSpan",function(event) {
			if($(this).attr("data-isAlreadyClicked") != "true") {
				let commentId = $(this).parent().parent().attr("data-commentId");
				//let commentatorId = $(this).parent().parent().attr("data-commentatorId");
				//ajax
				$.ajax({
					url: "comment/evaluate",
					type: "GET",
					dataType: "json",
					data: {
						"commentId" : commentId,
						"likeOrDislike" : "1"
					}
				});
				
				$(this).children(".likeCount").html(Number($(this).children(".likeCount").html()) + 1);
				$(this).siblings(".dislikeSpan").attr("data-isAlreadyClicked","true");
				$(this).css("color","royalblue");
				$(this).attr("data-isAlreadyClicked","true");
			}
			//阻止冒泡
			event.stopPropagation();
		});
		//绑定踩事件
		$(".comments").on("click",".dislikeSpan",function(event) {
			if($(this).attr("data-isAlreadyClicked") != "true") {
				let commentId = $(this).parent().parent().attr("data-commentId");
				//let commentatorId = $(this).parent().parent().attr("data-commentatorId");
				//ajax
				$.ajax({
					url: "comment/evaluate",
					type: "GET",
					dataType: "json",
					data: {
						"commentId" : commentId,
						"likeOrDislike" : "0"
					}
				});
				
				$(this).children(".dislikeCount").html(Number($(this).children(".dislikeCount").html()) + 1);
				$(this).siblings(".likeSpan").attr("data-isAlreadyClicked","true");
				$(this).css("color","royalblue");
				$(this).attr("data-isAlreadyClicked","true");
			}
			//阻止冒泡
			event.stopPropagation();
		});
		//绑定评论者头像和昵称点击事件
		$(".comments").on("click",".commentatorHeadphoto,.commentatorNickname",function() {
			window.open("user.html?visitUid=" + $(this).parent().parent().attr("data-commentatorId"),"_self");
		});
	}
});
