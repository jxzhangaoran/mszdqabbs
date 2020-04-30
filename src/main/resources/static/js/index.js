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
				}
			});
		})
		.catch(function(err) { /*不需要做任何事*/ });

	$(".clickToAskQuestion").on("click", function() {
		if (loginUser != null) {
			window.open("editor.html?type=submitQuestion", "_self");
		} else {
			//打开登录框
			$(".logintrigger").trigger("click");
		}
	});

	$(".clickToWriteArticle").on("click", function() {
		if (loginUser != null) {
			window.open("editor.html?type=writeArticle", "_self");
		} else {
			//打开登录框
			$(".logintrigger").trigger("click");
		}
	});

	//绑定最新、最热切换事件
	$("#loadNewQuestions").on("click", function() {
		$(this).addClass("active");
		$("#loadPopularQuestions").removeClass("active");
		getSomeQuestionNew();
		orderType = "new";
	});

	$("#loadPopularQuestions").on("click", function() {
		$(this).addClass("active");
		$("#loadNewQuestions").removeClass("active");
		getSomeQuestionPopular();
		orderType = "popular";
	});

	//URL为空时默认为第一页
	let pageIndexStr = getQueryString("page");
	let pageIndex = (pageIndexStr == null || (parseInt(pageIndexStr) != pageIndexStr) || parseInt(pageIndexStr) < 1) ? 1 : pageIndexStr; //页码
	//默认看最新问题
	let orderType = (getQueryString("orderType") == null ||
		getQueryString("orderType") != "new" && getQueryString("orderType") != "popular") ? "new" : getQueryString(
		"orderType");
	//执行加载问题列表
	doGetQuestions(orderType);
	//激活对应菜单项
	$("." + orderType).addClass("active");

	//执行页码信息初始化
	initPageSettings();

	function getSomeQuestionNew() {
		doGetQuestions("new");
	}

	function getSomeQuestionPopular() {
		doGetQuestions("popular");
	}

	function doGetQuestions(newOrPopular) {
		//先清空问题列表
		$(".questions").html("");
		let urlToGet;
		//获取最新发布的问题
		if (newOrPopular == "new") {
			urlToGet = "question/getSomeQuestionNew";
			//获取最受欢迎的问题
		} else if (newOrPopular == "popular") {
			urlToGet = "question/getSomeQuestionPopular";
		}

		$.ajax({
			url: urlToGet,
			type: "GET",
			data: {
				"pageIndex": pageIndex
			},
			dataType: "json",
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						//console.log(i);
						//生成每一篇问题对象
						setTimeout(function() {
							let $a = $('#eachquestiontemplate').children(".eachquestioncontainer");
							//设置标题
							let title = $a.find(".eachquestiontitle > h2 > a");
							title.html(response[i].question.title);

							//若详情不为空，则需要设置详情
							if (response[i].question.detail != null && response[i].question.detail != "") {
								$a.find(".eachquestionbody").attr("style", "display: flex !important");
								//设置详情，只显示纯文本
								let detail = $a.find(".eachquestiondetail > p > a");
								//先替换掉图片，图片链接显示成 【图片】
								let imageReg = /!\[(.*)\]\((.*)\)/g;
								//替换Markdown的标签
								let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
								detail.html(response[i].question.detail.replace(imageReg, " 【图片】 ").replace(reg, ""));
							} else {
								//详情为空，隐藏问题body
								$a.find(".eachquestionbody").attr("style", "display: none !important");
							}

							//设置头像
							let headPhoto = $a.find(".eachquestionheadphoto");
							if (response[i].questionerHeadPhotoUrl != null && response[i].questionerHeadPhotoUrl != "") {
								headPhoto.css("background-image", "url(" + response[i].questionerHeadPhotoUrl + ")");
							} else headPhoto.css("background-image", "url(image/default_headphoto.png)");
							//绑定头像点击参数
							headPhoto.attr("data-visitUid", response[i].questionerId);
							//设置提问者昵称
							let nickName = $a.find(".eachquestionquestionername");
							nickName.html(response[i].questionerNickName);
							//绑定昵称点击参数
							nickName.attr("data-visitUid", response[i].questionerId);
							//设置收藏次数
							let collectionCount = $a.find(".collect_count");
							collectionCount.html(response[i].collectionCount > 99 ? "99+" : response[i].collectionCount);
							//点击收藏，打开问题详情
							$a.find(".info_collect").attr("onclick",
								"javascript:window.open('showQuestion.html?questionId=" + response[i].question.id + "','_self')");
							//设置点赞次数
							let likeCount = $a.find(".like_count");
							likeCount.html(response[i].likeCount > 99 ? "99+" : response[i].likeCount);
							//绑定点赞事件id参数
							let infoLike = $a.find(".info_like");
							infoLike.attr("data-questionId", response[i].question.id);
							//设置回答个数
							let answerCount = $a.find(".answer_count");
							answerCount.html(response[i].answerCount > 99 ? "99+" : response[i].answerCount);
							//点击回答个数，打开问题详情
							$a.find(".info_answer").attr("onclick",
								"javascript:window.open('showQuestion.html?questionId=" + response[i].question.id + "','_self')");
							//设置浏览次数
							let browseCount = $a.find(".browse_count");
							browseCount.html(response[i].question.browse_count > 99 ? "99+" : response[i].question.browse_count);
							//打开问题详情
							$a.find(".info_browsecount").attr("onclick",
								"javascript:window.open('showQuestion.html?questionId=" + response[i].question.id + "','_self')");
							//查看是否有预览图，有的话就显示，没有则隐藏掉预览图div
							let previewImageContainer = $a.find(".eachquestionimg > a > img");
							let imageContainer = $a.find(".eachquestionimg");
							let detailContainer = $a.find(".eachquestiondetail");
							if (response[i].previewImageUrl != "") {
								//console.log(i + "not null:" + response[i].previewImageUrl);
								previewImageContainer.attr("src", response[i].previewImageUrl);
								imageContainer.css("display", "inline-block");
								detailContainer.attr("class", "eachquestiondetail ten wide column");
							} else {
								//console.log(i + "is null:" + response[i].previewImageUrl);
								imageContainer.css("display", "none");
								detailContainer.attr("class", "eachquestiondetail sixteen wide column");
							}
							//修改问题的超链接，点击会跳转到问题详情页
							let hyperLink = $a.find("a");
							hyperLink.each(function() {
								$(this).attr("href", "showQuestion.html?questionId=" + response[i].question.id, "_self");
							});
							//填充时要用clone，不然只会覆盖前面的
							$(".questions").append($a.clone());
						}, 0);
					}
					//点赞事件
					$(".questions").on("click", ".info_like", function() {
						if ($(this).attr("data-liked") == null || $(this).attr("data-liked") != "true") {
							let to_evaluate = $(this).attr("data-questionId");

							$.ajax({
								url: "question/evaluate",
								type: "GET",
								dataType: "json",
								data: {
									"questionId": to_evaluate,
									"likeOrDislike": "1"
								}
							});
							if ($(this).children(".like_count").html().indexOf("+") == -1) {
								let oldCount = Number($(this).children(".like_count").html());
								$(this).children(".like_count").html(++oldCount);
							}
							$(this).css("color", "#175199");
							$(this).attr("data-liked", "true");
						}
					});
					//头像跳转用户主页事件
					$(".questions").on("click", ".eachquestionheadphoto", function() {
						window.open("user.html?visitUid=" + $(this).attr("data-visitUid"), "_self");
					});
					//昵称跳转用户主页事件
					$(".questions").on("click", ".eachquestionquestionername", function() {
						window.open("user.html?visitUid=" + $(this).attr("data-visitUid"), "_self");
					});
					//显示页码信息
					$(".pageSelector").css("display", "block");
					//隐藏加载占位符
					$(".loadingHolder").css("display", "none");
				} else {
					//隐藏加载占位符
					$(".loadingHolder").css("display", "none");
					//显示空结果
					$(".emptyResult").show();
				}
			},
			error: function(response) {
				//console.log(response);
			}
		});
	}

	//加载页码信息
	function initPageSettings() {
		$.ajax({
			url: "question/getTotalPageCount",
			type: "GET",
			dataType: "json",
			success: function(response) {
				$("#maxPage").html(response.totalPageCount);
				//是否禁用
				if (pageIndex <= 1) {
					$("#firstPage").addClass("active");
					$("#lastPage").addClass("disabled");
				}
				if (pageIndex >= response.totalPageCount) {
					$("#maxPage").addClass("active");
					$("#nextPage").addClass("disabled");
				}
				if (pageIndex > response.totalPageCount && response.totalPageCount != 0) {
					window.open("index.html","_self");
				}
				//页码输入框显示当前页码
				$("#jumpPage").val(pageIndex);
				//绑定最后一页的点击事件
				$("#maxPage").on("click", function() {
					if (!$(this).hasClass("disabled")) {
						window.open("index.html?page=" + $(this).html() + "&orderType=" + orderType, "_self");
					}
				});
			},
			error: function() {

			}
		});
	}

	$("#firstPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("index.html?page=1" + "&orderType=" + orderType, "_self");
		}
	});

	//下一页
	$("#nextPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("index.html?page=" + (Number(pageIndex) + 1) + "&orderType=" + orderType, "_self");
		}
	});

	//上一页
	$("#lastPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("index.html?page=" + (Number(pageIndex) - 1) + "&orderType=" + orderType, "_self");
		}
	});

	$("#jumpPage").keyup(function(event) {
		if (event.keyCode == 13) {
			jumpPageTo($("#jumpPage").val());
		}
	});

	$("#jumpPage").on("click", function(event) {
		//阻止冒泡
		event.stopPropagation();
	});

	$("#pageInput").on("click", function() {
		jumpPageTo($("#jumpPage").val());
	});

	function jumpPageTo(pi) {
		window.open("index.html?page=" + pi + "&orderType=" + orderType, "_self");
	}
});
