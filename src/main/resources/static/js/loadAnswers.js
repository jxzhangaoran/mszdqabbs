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
	
	//绑定最新、最热切换事件
	$("#loadNewAnswers").on("click",function(){
		$(this).addClass("active");
		$("#loadPopularAnswers").removeClass("active");
		getSomeAnswerNew();
		orderType = "new";
	});
	
	$("#loadPopularAnswers").on("click",function(){
		$(this).addClass("active");
		$("#loadNewAnswers").removeClass("active");
		getSomeAnswerPopular();
		orderType = "popular";
	});
	
	//获取问题id
	let questionId = getQueryString("questionId");
	//URL为空时默认为第一页
	let pageIndexStr = getQueryString("page");
	let pageIndex = (pageIndexStr == null || (parseInt(pageIndexStr) != pageIndexStr) || parseInt(pageIndexStr) < 1) ? 1 : pageIndexStr; //页码
	//默认看最新回答
	let orderType = (getQueryString("orderType") == null || 
	getQueryString("orderType") != "new" && getQueryString("orderType") != "popular") ? "new" : getQueryString("orderType");
	//执行加载回答列表
	doGetAnswers(orderType);
	//激活对应菜单项
	$("." + orderType).addClass("active");
	
	//执行页码信息初始化
	initPageSettings();
	
	function getSomeAnswerNew() {
		doGetAnswers("new");
	}
	
	function getSomeAnswerPopular() {
		doGetAnswers("popular");
	}
	
	function doGetAnswers(newOrPopular) {
		//先清空回答列表
		$(".answers").html("");
		let urlToGet;
		//获取最新发布的回答
		if(newOrPopular == "new") {
			urlToGet = "answer/getSomeAnswerNew";
		//获取最受欢迎的回答
		} else if(newOrPopular == "popular") {
			urlToGet = "answer/getSomeAnswerPopular";
		}
	
		$.ajax({
			url: urlToGet,
			type: "GET",
			data: {
				"which_question": questionId,
				"pageIndex": pageIndex
			},
			dataType: "json",
			success: function(response) {
				//console.log(response);
				if (response != null && response.length > 0) {
					for (let i = 0; i < response.length; i++) {
						//console.log(i);
						//生成每一篇回答对象
						setTimeout(function() {
							let $a = $('#eachanswertemplate').children(".eachanswercontainer");
							
							//若详情不为空，则需要设置详情
							if(response[i].answer.content != null && response[i].answer.content != "") {
								$a.find(".eachanswerbody").attr("style","display: flex !important");
								//设置详情，只显示纯文本
								let content = $a.find(".eachanswercontent > p > a");
								//先替换掉图片，图片链接显示成 【图片】
								let imageReg = /!\[(.*)\]\((.*)\)/g;
								//替换Markdown的标签
								let reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g;
								content.html(response[i].answer.content.replace(imageReg, " 【图片】 ").replace(reg, ""));
							} else {
								//详情为空，隐藏回答body
								$a.find(".eachanswerbody").attr("style","display: none !important");
							}
							
							//设置头像
							let headPhoto = $a.find(".eachanswerheadphoto");
							if(response[i].answererHeadPhotoUrl != null && response[i].answererHeadPhotoUrl != "") {
								headPhoto.css("background-image", "url(" + response[i].answererHeadPhotoUrl + ")");
							} else headPhoto.css("background-image", "url(image/default_headphoto.png)");
							//绑定头像点击参数
							headPhoto.attr("data-visitUid", response[i].answererId);
							//设置提问者昵称
							let nickName = $a.find(".eachansweranswerername");
							nickName.html(response[i].answererNickName);
							//绑定昵称点击参数
							nickName.attr("data-visitUid", response[i].answererId);
							//设置收藏次数
							let collectionCount = $a.find(".collect_count");
							collectionCount.html(response[i].collectionCount > 99 ? "99+" : response[i].collectionCount);
							//点击收藏，打开回答详情
							$a.find(".info_collect").attr("onclick",
							"javascript:window.open('showAnswer.html?answerId=" + response[i].answer.id + "','_self')");
							//设置点赞次数
							let likeCount = $a.find(".like_count");
							likeCount.html(response[i].likeCount > 99 ? "99+" : response[i].likeCount);
							//绑定点赞事件id参数
							let infoLike = $a.find(".info_like");
							infoLike.attr("data-answerId",response[i].answer.id);
							//设置评论个数
							let commentCount = $a.find(".comment_count");
							commentCount.html(response[i].commentCount > 99 ? "99+" : response[i].commentCount);
							//点击评论个数，打开回答详情并直接跳转评论区
							$a.find(".info_comment").attr("onclick",
							"javascript:window.open('showAnswer.html?answerId="
							+ response[i].answer.id
							+ "&target=comment"
							+ "','_self')");
							//设置浏览次数
							let browseCount = $a.find(".browse_count");
							browseCount.html(response[i].answer.browse_count > 99 ? "99+" : response[i].answer.browse_count);
							//点击浏览次数，打开回答详情
							$a.find(".info_browsecount").attr("onclick",
							"javascript:window.open('showAnswer.html?answerId=" + response[i].answer.id + "','_self')");
							//查看是否有预览图，有的话就显示，没有则隐藏掉预览图div
							let previewImageContainer = $a.find(".eachanswerimg > a > img");
							let imageContainer = $a.find(".eachanswerimg");
							let contentContainer = $a.find(".eachanswercontent");
							if (response[i].previewImageUrl != "") {
								//console.log(i + "not null:" + response[i].previewImageUrl);
								previewImageContainer.attr("src", response[i].previewImageUrl);
								imageContainer.css("display", "inline-block");
								contentContainer.attr("class", "eachanswercontent ten wide column");
							} else {
								//console.log(i + "is null:" + response[i].previewImageUrl);
								imageContainer.css("display", "none");
								contentContainer.attr("class", "eachanswercontent sixteen wide column");
							}
							//修改回答的超链接，点击会跳转到回答详情页
							let hyperLink = $a.find("a");
							hyperLink.each(function() {
								$(this).attr("href","showAnswer.html?answerId=" + response[i].answer.id,"_self");
							});
							//填充时要用clone，不然只会覆盖前面的
							$(".answers").append($a.clone());
						}, 0);
					}
					//点赞事件
					$(".answers").on("click",".info_like", function() {
						if($(this).attr("data-liked") == null || $(this).attr("data-liked") != "true") {
							let to_evaluate = $(this).attr("data-answerId");
							
							$.ajax({
								url: "answer/evaluate",
								type: "GET",
								dataType: "json",
								data: {
									"answerId" : to_evaluate,
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
					$(".answers").on("click",".eachanswerheadphoto",function() {
						window.open("user.html?visitUid=" + $(this).attr("data-visitUid"),"_self");
					});
					//昵称跳转用户主页事件
					$(".answers").on("click",".eachansweranswerername",function() {
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
					$(".hideIfNotEmpty").show();
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
			url: "answer/getTotalPageCount",
			type: "GET",
			dataType: "json",
			data: {
				"which_question" : questionId
			},
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
					window.open("showQuestion.html?questionId=" + questionId + "&page=1" + "&orderType=" + orderType, "_self");
				}
				//页码输入框显示当前页码
				$("#jumpPage").val(pageIndex);
				//绑定最后一页的点击事件
				$("#maxPage").on("click", function() {
					if (!$(this).hasClass("disabled")) {
						window.open("showQuestion.html?questionId=" + questionId + "&page=" + $(this).html() + "&orderType=" + orderType, "_self");
					}
				});
			},
			error: function() {
	
			}
		});
	}
	
	$("#firstPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("showQuestion.html?questionId=" + questionId + "&page=1" + "&orderType=" + orderType, "_self");
		}
	});
	
	//下一页
	$("#nextPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("showQuestion.html?questionId=" + questionId + "&page=" + (Number(pageIndex) + 1) + "&orderType=" + orderType, "_self");
		}
	});
	
	//上一页
	$("#lastPage").on("click", function() {
		if (!$(this).hasClass("disabled")) {
			window.open("showQuestion.html?questionId=" + questionId + "&page=" + (Number(pageIndex) - 1) + "&orderType=" + orderType, "_self");
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
		window.open("showQuestion.html?questionId=" + questionId + "&page=" + pi + "&orderType=" + orderType, "_self");
	}
});