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
				}
			});
		})
		.catch(function(err) { /*不需要做任何事*/ });

	$(".clickToAskQuestion").on("click", function() {
		if (loginUser != null) {
			window.open("editor.html?type=submitQuestion","_self");
		} else {
			//打开登录框
			$(".logintrigger").trigger("click");
		}
	});

	$(".clickToWriteArticle").on("click", function() {
		if (loginUser != null) {
			window.open("editor.html?type=writeArticle","_self");
		} else {
			//打开登录框
			$(".logintrigger").trigger("click");
		}
	});
	
	//绑定最新、最热切换事件
	$("#loadNewArticles").on("click",function(){
		$(this).addClass("active");
		$("#loadPopularArticles").removeClass("active");
		getSomeArticleNew();
		orderType = "new";
	});
	
	$("#loadPopularArticles").on("click",function(){
		$(this).addClass("active");
		$("#loadNewArticles").removeClass("active");
		getSomeArticlePopular();
		orderType = "popular";
	});

	//URL为空时默认为第一页
	let pageIndexStr = getQueryString("page");
	let pageIndex = (pageIndexStr == null || (parseInt(pageIndexStr) != pageIndexStr) || parseInt(pageIndexStr) < 1) ? 1 : pageIndexStr; //页码
	//默认看最新文章
	let orderType = (getQueryString("orderType") == null || 
	getQueryString("orderType") != "new" && getQueryString("orderType") != "popular") ? "new" : getQueryString("orderType");
	//执行加载文章列表
	doGetArticles(orderType);
	//激活对应菜单项
	$("." + orderType).addClass("active");
	
	//执行页码信息初始化
	initPageSettings();

	function getSomeArticleNew() {
		doGetArticles("new");
	}
	
	function getSomeArticlePopular() {
		doGetArticles("popular");
	}

	function doGetArticles(newOrPopular) {
		//先清空文章列表
		$(".articles").html("");
		let urlToGet;
		//获取最新发布的文章
		if(newOrPopular == "new") {
			urlToGet = "article/getSomeArticleNew";
		//获取最受欢迎的文章
		} else if(newOrPopular == "popular") {
			urlToGet = "article/getSomeArticlePopular";
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
						//生成每一篇文章对象
						setTimeout(function() {
							let $a = $('#eacharticletemplate').children(".eacharticlecontainer");
							//设置标题
							let title = $a.find(".eacharticletitle > h2 > a");
							title.html(response[i].article.title);

							//设置内容，只显示纯文本
							let content = $a.find(".eacharticlecontent > p > a");
							//先替换掉图片，图片链接显示成 【图片】
							let imageReg = /!\[(.*)\]\((.*)\)/g;
							//替换Markdown的标签
							let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
							content.html(response[i].article.content.replace(imageReg, " 【图片】 ").replace(reg, ""));
							
							//设置头像
							let headPhoto = $a.find(".eacharticleheadphoto");
							if(response[i].authorHeadPhotoUrl != null && response[i].authorHeadPhotoUrl != "") {
								headPhoto.css("background-image", "url(" + response[i].authorHeadPhotoUrl + ")");
							} else headPhoto.css("background-image", "url(image/default_headphoto.png)");
							//绑定头像点击参数
							headPhoto.attr("data-visitUid", response[i].authorId);
							//设置作者昵称
							let nickName = $a.find(".eacharticleauthorname");
							nickName.html(response[i].authorNickName);
							//绑定昵称点击参数
							nickName.attr("data-visitUid", response[i].authorId);
							//设置收藏次数
							let collectionCount = $a.find(".collect_count");
							collectionCount.html(response[i].collectionCount > 99 ? "99+" : response[i].collectionCount);
							//点击收藏，打开文章详情
							$a.find(".info_collect").attr("onclick",
							"javascript:window.open('showArticle.html?articleId=" + response[i].article.id + "','_self')");
							//设置点赞次数
							let likeCount = $a.find(".like_count");
							likeCount.html(response[i].likeCount > 99 ? "99+" : response[i].likeCount);
							//绑定点赞事件id参数
							let infoLike = $a.find(".info_like");
							infoLike.attr("data-articleId",response[i].article.id);
							//设置评论次数
							let commentCount = $a.find(".comment_count");
							commentCount.html(response[i].commentCount > 99 ? "99+" : response[i].commentCount);
							//打开文章详情，直接跳转评论区
							$a.find(".info_comment").attr("onclick",
							"javascript:window.open('showArticle.html?articleId=" 
							+ response[i].article.id 
							+ "&target=comment','_self')");
							//设置浏览次数
							let browseCount = $a.find(".browse_count");
							browseCount.html(response[i].article.browse_count > 99 ? "99+" : response[i].article.browse_count);
							//打开文章详情
							$a.find(".info_browsecount").attr("onclick",
							"javascript:window.open('showArticle.html?articleId=" + response[i].article.id + "','_self')");
							//查看是否有预览图，有的话就显示，没有则隐藏掉预览图div
							let previewImageContainer = $a.find(".eacharticleimg > a > img");
							let imageContainer = $a.find(".eacharticleimg");
							let contentContainer = $a.find(".eacharticlecontent");
							if (response[i].previewImageUrl != "") {
								//console.log(i + "not null:" + response[i].previewImageUrl);
								previewImageContainer.attr("src", response[i].previewImageUrl);
								imageContainer.css("display", "inline-block");
								contentContainer.attr("class", "eacharticlecontent ten wide column");
							} else {
								//console.log(i + "is null:" + response[i].previewImageUrl);
								imageContainer.css("display", "none");
								contentContainer.attr("class", "eacharticlecontent sixteen wide column");
							}
							//修改文章的超链接，点击会跳转到文章详情页
							let hyperLink = $a.find("a");
							hyperLink.each(function() {
								$(this).attr("href","showArticle.html?articleId=" + response[i].article.id,"_self");
							});
							//填充时要用clone，不然只会覆盖前面的
							$(".articles").append($a.clone());
						}, 0);
					}
					//点赞事件
					$(".articles").on("click",".info_like", function() {
						if($(this).attr("data-liked") == null || $(this).attr("data-liked") != "true") {
							let to_evaluate = $(this).attr("data-articleId");
							
							$.ajax({
								url: "article/evaluate",
								type: "GET",
								dataType: "json",
								data: {
									"articleId" : to_evaluate,
									"likeOrDislike" : "1"
								}
							});
							if($(this).children(".like_count").html().indexOf("+") == -1) {
								let oldCount = Number($(this).children(".like_count").html());
								$(this).children(".like_count").html(++oldCount);
							}
							$(this).css("color","#175199");
							$(this).attr("data-liked","true");
						}
					});
					//头像跳转用户主页事件
					$(".articles").on("click",".eacharticleheadphoto",function() {
						window.open("user.html?visitUid=" + $(this).attr("data-visitUid"),"_self");
					});
					//昵称跳转用户主页事件
					$(".articles").on("click",".eacharticleauthorname",function() {
						window.open("user.html?visitUid=" + $(this).attr("data-visitUid"),"_self");
					});
					//显示页码信息
					$(".pageSelector").css("display","block");
					//隐藏加载占位符
					$(".loadingHolder").css("display","none");
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
			url: "article/getTotalPageCount",
			type: "GET",
			dataType: "json",
			success: function(response) {
				$("#maxPage").html(response.totalPageCount);
				//是否禁用
				if (pageIndex <= 1) {
					$("#firstPage").addClass("active");
					$("#lastPage").addClass("disabled");
				} 
				if (pageIndex == response.totalPageCount) {
					$("#maxPage").addClass("active");
					$("#nextPage").addClass("disabled");
				}
				if (pageIndex > response.totalPageCount && response.totalPageCount != 0) {
					window.open("article.html?page=1" + "&orderType=" + orderType, "_self");
				}
				//页码输入框显示当前页码
				$("#jumpPage").val(pageIndex);
				//绑定最后一页的点击事件
				$("#maxPage").on("click", function() {
					if (!$(this).hasClass("disabled")) {
						window.open("article.html?page=" + $(this).html() + "&orderType=" + orderType, "_self");
					}
				});
			},
			error: function() {

			}
		});
	}

	$("#firstPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("article.html?page=1" + "&orderType=" + orderType, "_self");
		}
	});

	//下一页
	$("#nextPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("article.html?page=" + (Number(pageIndex) + 1) + "&orderType=" + orderType, "_self");
		}
	});

	//上一页
	$("#lastPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("article.html?page=" + (Number(pageIndex) - 1) + "&orderType=" + orderType, "_self");
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
		window.open("article.html?page=" + pi + "&orderType=" + orderType, "_self");
	}
});
