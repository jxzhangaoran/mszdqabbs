//补齐前缀0
function addFrontZero(n) {
	if (Number(n) < 10 && Number(n) > 0) {
		return "0" + n;
	} else return n;
}

$(document).ready(function() {
	let loginUser;

	let visitUid;

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
					visitUid = loginUser.id;
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
							if (response.success == "true" && invitationNum != null && invitationNum > 0) {
								$(".inviteNumber").html(invitationNum > 99 ? 99 : invitationNum);
								$(".inviteNumber").css("display", "inline-block");
								$(".msgTipRedPoint").attr("style", "opacity: 1 !important");
							}
						}
					});
					//处理本页面的其他事件

					//加载用户信息到头部信息栏
					let registerTime = new Date(loginUser.register_time);
					$("#nickname").html(loginUser.nickname);
					$("#usernameshow").html(loginUser.username);
					$("#registertimeshow").html(registerTime.getFullYear() + "年" +
						(registerTime.getMonth() + 1) + "月" +
						registerTime.getDate() + "日&nbsp;" +
						addFrontZero(registerTime.getHours()) + ":" +
						addFrontZero(registerTime.getMinutes()) + ":" +
						addFrontZero(registerTime.getSeconds()));
					$("#mottoshow").html(loginUser.motto);
					$("#myheadphotoborder").css("background-image", "url(" + headphoto + ")");

					//加载完毕后要解除占位符
					$(".placeholder").hide();
					$(".hidewhenloading").removeClass("hidewhenloading");

					//加载用户账户控制的模态框初始内容
					$("#nickname_alter_input").val(loginUser.nickname);
					$("#motto_alter_input").val(loginUser.motto);
					//解除用户账户控制的按钮禁用
					$(".aside_account_div button").removeClass("disabled");
					$("#headphoto_alter_container").css("background-image", "url(" + headphoto + ")");
					//加载文章
					loadArticles();
				}
			});
		})
		//未登录，弹出登录框
		.catch(function(err) {
			$("#notlogin .logintrigger").trigger("click");
			//加载完毕后要解除占位符
			$(".placeholder").hide();
			$(".hidewhenloading").removeClass("hidewhenloading");
			//加载文章
			loadArticles();
		});

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


	$("#upload_headphoto_open_modal").on("click", function() {
		$("#headphoto_modal").modal('show');
	});

	$("#alter_nickname_open_modal").on("click", function() {
		$("#nickname_modal").modal('show');
	});

	$("#alter_motto_open_modal").on("click", function() {
		$("#motto_modal").modal('show');
	});

	//昵称修改正则表达式检测
	$("#nickname_alter_input").on("input", function() {
		if ($("#nickname_alter_input").val().match(/^[\u4e00-\u9fa5_a-zA-Z0-9]{2,10}$/)) {
			$("#nickname_alter_container i").removeClass("close");
			$("#nickname_alter_container i").addClass("check");
			$("#nickname_modal_submit").removeClass("disabled");
		} else {
			$("#nickname_alter_container i").removeClass("check");
			$("#nickname_alter_container i").addClass("close");
			$("#nickname_modal_submit").addClass("disabled");
		}
	});

	$("#motto_alter_input").on("input", function() {
		if ($("#motto_alter_input").val().length > 0 && $("#motto_alter_input").val().length < 256) {
			$("#motto_alter_container i").removeClass("close");
			$("#motto_alter_container i").addClass("check");
			$("#motto_modal_submit").removeClass("disabled");
		} else {
			$("#motto_alter_container i").removeClass("check");
			$("#motto_alter_container i").addClass("close");
			$("#motto_modal_submit").addClass("disabled");
		}
	});

	$("#nickname_modal_submit").on("click", function() {
		$.ajax({
			url: "usr/updateNickname",
			type: "POST",
			data: {
				"uid": loginUser.id,
				"newNickname": $("#nickname_alter_input").val()
			},
			dataType: "json",
			success: function(response) {
				if (response.success == "true") {
					$("#success_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				} else {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				}
			},
			error: function() {
				$("#failed_modal")
					.modal('setting', 'closable', false)
					.modal({
						onHidden: function() {
							window.location.reload();
						}
					})
					.modal('show');
			}
		});
	});

	$("#motto_modal_submit").on("click", function() {
		$.ajax({
			url: "usr/updateMotto",
			type: "POST",
			data: {
				"uid": loginUser.id,
				"newMotto": $("#motto_alter_input").val()
			},
			dataType: "json",
			success: function(response) {
				if (response.success == "true") {
					$("#success_modal")
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				} else {
					$("#failed_modal")
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				}
			},
			error: function() {
				$("#failed_modal")
					.modal('setting', 'closable', false)
					.modal({
						onHidden: function() {
							window.location.reload();
						}
					})
					.modal('show');
			}
		})
	});

	$("#selectBtn").on("click", function() {
		$("#selectImage").trigger("click");
	});

	//fileReader处理图片预览
	selectImage.onchange = function() {

		//循环遍历可以多选
		$.each($(selectImage.files), function(index, val) {

			var reader = new FileReader();
			//该方法将文件读取为一段以 data: 开头的字符串，这段字符串的实质就是 Data URL，Data URL是一种将小文件直接嵌入文档的方案。这里的小文件通常是指图像与 html 等格式的文件
			reader.readAsDataURL(val);
			reader.onload = function() {
				//文件地址
				//console.log(this.result);

				if (this.result.toString().indexOf("data:image") != -1) {
					$("#headphoto_alter_container").css("background-image", "url(" + this.result + ")");
					$("#upload_headphoto_btn").removeClass("disabled");
					$("#formattip").removeClass("redtip");
				} else {
					$("#headphoto_alter_container").css("background-image", "url(image/default_headphoto.png)");
					$("#upload_headphoto_btn").addClass("disabled");
					$("#formattip").addClass("redtip");
				};
			}
		});
	}

	$("#upload_headphoto_btn").on("click", function() {
		//console.log($("#selectImage")[0].files[0]);

		let formData = new FormData();

		formData.append("newHeadPhotoImage", $("#selectImage")[0].files[0]);

		$("#upload_headphoto_btn").addClass("loading");
		$("#upload_headphoto_btn").addClass("disabled");

		$.ajax({
			url: "usr/updateHeadPhoto",
			type: "POST",
			dataType: "json",
			data: formData,
			contentType: false,
			processData: false,
			success: function(response) {
				//console.log(response);
				$("#upload_headphoto_btn").removeClass("loading");
				$("#upload_headphoto_btn").removeClass("disabled");
				$("#headphoto_modal").modal('hide');
				if (response.success == "true") {
					$("#success_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				} else {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.location.reload();
							}
						})
						.modal('show');
				}
			},
			error: function(response) {
				//console.log(response);
				$("#upload_headphoto_btn").removeClass("loading");
				$("#upload_headphoto_btn").removeClass("disabled");
				$("#headphoto_modal").modal('hide');
				$("#failed_modal")
					.modal('setting', 'closable', false)
					.modal({
						onHidden: function() {
							window.location.reload();
						}
					})
					.modal('show');
			}
		});
		return false;
	});

	$("#success_modal_ok").on("click", function() {
		window.location.reload();
	});

	$("#failed_modal_ok").on("click", function() {
		window.location.reload();
	});

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
					$(".fansSearch").attr("placeholder", "搜索我的" + response.length + "个粉丝...");
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
							} else $follows.find("img").attr("src","image/default_headphoto.png");
							//绑定昵称
							$follows.find("h4").html(response[i].nickname);
							//绑定用户主页URL
							$follows.find("a").attr("href", "user.html?visitUid=" + response[i].followerId);
							//插入结果集
							$(".followslist").append($follows.clone());

						}, 0);
					}
					//修改搜索框显示的关注数目
					$(".followsSearch").attr("placeholder", "搜索我关注的" + response.length + "个用户...");
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
		//先清空文章列表
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
							//绑定标题和删除的文章ID数据
							$article.find(".articleTitle").attr("data-articleId", response[i].articleId);
							$article.find(".deleteArticle").attr("data-articleId", response[i].articleId);
							$article.find(".alternateArticle").attr("data-articleId", response[i].articleId);
							//插入到文章列表中
							$(".articleslist tbody").append($article.clone());
						}, 0);
					}
					//修改搜索框显示的文章数目
					$(".articlesSearch").attr("placeholder", "搜索我的" + response.length + "篇文章标题...");
					//绑定搜索输入事件
					$(".articlesSearch").on("input", function() {
						//console.log($(this).val());
						if ($(this).val().length == 0) {
							$(".articleslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".articleslist tbody tr").each(function() {
								if ($(this).find(".articleTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定文章标题点击事件
					$(".articleslist tbody").on("click", ".articleTitle", function() {
						window.open("showArticle.html?articleId=" + $(this).attr("data-articleId"), "_self");
					});
					//绑定删除文章事件
					$(".articleslist tbody").on("click", ".deleteArticle", function() {
						if ($(this).html() != "确定?") {
							$(this).removeClass("basic");
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");
							$.ajax({
								url: "article/deleteArticle",
								type: "POST",
								dataType: "json",
								data: {
									"articleId": $(this).attr("data-articleId")
								},
								success: function(response) {
									if (response.success == "true") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
					});

					$(".articleslist tbody").on("blur", ".deleteArticle", function() {
						$(this).addClass("basic");
						$(this).html("删除");
					});
					//绑定修改文章事件
					$(".articleslist tbody").on("click", ".alternateArticle", function() {
						window.open("editor.html?type=editArticle&editId=" + $(this).attr("data-articleId"), "_self");
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
					$(".questionsSearch").attr("placeholder", "搜索我的" + response.length + "个问题标题...");
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
					//绑定删除问题事件
					$(".questionslist tbody").on("click", ".deleteQuestion", function() {
						if ($(this).html() != "确定?") {
							$(this).removeClass("basic");
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");
							$.ajax({
								url: "question/deleteQuestion",
								type: "POST",
								dataType: "json",
								data: {
									"questionId": $(this).attr("data-questionId")
								},
								success: function(response) {
									if (response.success == "true") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
					});

					$(".questionslist tbody").on("blur", ".deleteQuestion", function() {
						$(this).addClass("basic");
						$(this).html("删除");
					});
					//绑定修改问题事件
					$(".questionslist tbody").on("click", ".alternateQuestion", function() {
						window.open("editor.html?type=editQuestion&editId=" + $(this).attr("data-questionId"), "_self");
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
					$(".answersSearch").attr("placeholder", "搜索我的" + response.length + "个回答内容...");
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
					//绑定删除回答事件
					$(".answerslist").on("click", ".deleteAnswer", function() {
						if ($(this).html() != "确定?") {
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");
							$.ajax({
								url: "answer/deleteAnswer",
								type: "POST",
								dataType: "json",
								data: {
									"answerId": $(this).attr("data-answerId")
								},
								success: function(response) {
									if (response.success == "true") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
					});
		
					$(".answerslist").on("blur", ".deleteAnswer", function() {
						$(this).html("<i class='trash alternate outline icon'></i>删除");
					});
					
					//绑定修改回答事件
					$(".answerslist").on("click", ".alterAnswer", function() {
						window.open("editor.html?type=editAnswer&editId=" + $(this).attr("data-answerId"), "_self");
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
		//先清空评论列表
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
					$(".commentsSearch").attr("placeholder", "搜索我的" + response.length + "个评论内容...");
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
	});

	$(".loadCollectionsTab").on("click", function() {
		//默认加载文章的收藏
		$(".loadArticleCollectionsTab").trigger("click");
	});

	let tabSwitcherClicked = [false, false, false];

	$(".loadArticleCollectionsTab").on("click", function() {
		if (tabSwitcherClicked[1] != true && tabSwitcherClicked[2] != true) {
			tabSwitcherClicked[0] = true;
			loadArticleCollections();
			tabSwitcherClicked[0] = false;
		}
	});

	$(".loadQuestionCollectionsTab").on("click", function() {
		if (tabSwitcherClicked[0] != true && tabSwitcherClicked[2] != true) {
			tabSwitcherClicked[1] = true;
			loadQuestionCollections();
			tabSwitcherClicked[1] = false;
		}
	});

	$(".loadAnswerCollectionsTab").on("click", function() {
		if (tabSwitcherClicked[0] != true && tabSwitcherClicked[1] != true) {
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
				"collector": visitUid
			},
			success: function(response) {
				if (response != null && response.length > 0) {
					//console.log(response);
					for (let i = 0; i < response.length; i++) {

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
							//绑定标题、修改和删除的文章ID数据
							$article.find(".articleCollectionTitle").attr("data-collectionArticleId", response[i].articleId);
							$article.find(".deleteCollectionArticle").attr("data-collectionArticleId", response[i].articleId);
							//插入到文章列表中
							$(".articleCollections .collectionslist tbody").append($article.clone());
						}, 0);
					}
					//修改搜索框显示的文章数目
					$(".articleCollections .collectionsSearch").attr("placeholder", "搜索我收藏的" + response.length + "篇文章标题...");
					//绑定搜索输入事件
					$(".articleCollections .collectionsSearch").on("input", function() {
						if ($(this).val().length == 0) {
							$(".articleCollections .collectionslist tbody tr").show();
						} else {
							let searchVal = $(this).val().toLowerCase();
							$(".articleCollections .collectionslist tbody tr").each(function() {
								if ($(this).find(".articleCollectionTitle").html().toLowerCase().indexOf(searchVal) == -1) {
									//不能用hide，优先级会被semantic ui覆盖
									$(this).attr("style", "display:none !important");
								} else $(this).show();
							});
						}
					});
					//绑定文章标题点击事件
					$(".articleCollections .collectionslist tbody").on("click", ".articleCollectionTitle", function() {
						window.open("showArticle.html?articleId=" + $(this).attr("data-collectionArticleId"), "_self");
					});
					//绑定删除收藏文章事件
					$(".articleCollections .collectionslist tbody").on("click", ".deleteCollectionArticle", function() {
						if ($(this).html() != "确定?") {
							$(this).removeClass("basic");
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");

							$.ajax({
								url: "collection/toggleCollection",
								type: "POST",
								dataType: "json",
								data: {
									"collection_id": $(this).attr("data-collectionArticleId"),
									"collection_type": "1"
								},
								success: function(response) {
									if (response.success == "true" && response.type == "cancel") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
					});

					$(".articleCollections .collectionslist tbody").on("blur", ".deleteCollectionArticle", function() {
						$(this).addClass("basic");
						$(this).html("删除");
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
					$(".questionCollections .collectionsSearch").attr("placeholder", "搜索我收藏的" + response.length + "个问题标题...");
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
					//绑定删除收藏文章事件
					$(".questionCollections .collectionslist tbody").on("click", ".deleteCollectionQuestion", function() {
						if ($(this).html() != "确定?") {
							$(this).removeClass("basic");
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");
		
							$.ajax({
								url: "collection/toggleCollection",
								type: "POST",
								dataType: "json",
								data: {
									"collection_id": $(this).attr("data-collectionQuestionId"),
									"collection_type": "2"
								},
								success: function(response) {
									if (response.success == "true" && response.type == "cancel") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
					});
		
					$(".questionCollections .collectionslist tbody").on("blur", ".deleteCollectionQuestion", function() {
						$(this).addClass("basic");
						$(this).html("删除");
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
					$(".answerCollections .collectionsSearch").attr("placeholder", "搜索我的" + response.length + "个收藏回答内容...");
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
					//绑定取消收藏事件
					$(".answerCollections .collectionslist").on("click", ".deleteCollectionAnswer", function() {
						if ($(this).html() != "确定?") {
							$(this).html("确定?");
						} else {
							$(this).addClass("disabled");
							$(this).addClass("loading");
							$.ajax({
								url: "collection/toggleCollection",
								type: "POST",
								dataType: "json",
								data: {
									"collection_id": $(this).attr("data-collectionAnswerId"),
									"collection_type": "0"
								},
								success: function(response) {
									if (response.success == "true") {
										$("#success_modal")
											.modal('setting', 'closable', false)
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									} else {
										$("#failed_modal")
											.modal({
												onHidden: function() {
													window.location.reload();
												}
											})
											.modal('show');
									}
								},
								error: function(response) {
									$("#failed_modal")
										.modal({
											onHidden: function() {
												window.location.reload();
											}
										})
										.modal('show');
								}
							});
						}
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
