//获取地址栏参数
function getQueryString(name) {
	let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	let r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
}

function backToIndex() {
	window.open("index.html", "_self");
}

$(document).ready(function() {
	//从地址栏尝试获取跳转至编辑器页面的目的
	//如果URL非法，直接返回首页
	let EditorPageType = getQueryString("type");
	let QuestionId = getQueryString("questionId");
	let EditId = getQueryString("editId");
	//URL非法或用户未登录
	if (EditorPageType == null || EditorPageType == "" || getCookie("token") == "") {
		backToIndex();
	}
	//根据类别修改网页标题
	switch (EditorPageType) {
		case "writeArticle":
			$("title").html("发表文章 | 码上知道");
			$(".writeArticleToShow").removeClass("hiddenFirst");
			break;
		case "submitQuestion":
			$("title").html("提问题 | 码上知道");
			$(".submitQuestionToShow").removeClass("hiddenFirst");
			break;
		case "submitAnswer":
			if (QuestionId == null || QuestionId == "") {
				backToIndex();
			}
			$("title").html("写回答 | 码上知道");
			$(".submitAnswerToShow").removeClass("hiddenFirst");
			break;
		case "editArticle":
			if (EditId == null || EditId == "") {
				backToIndex();
			}
			$("title").html("编辑文章 | 码上知道");
			$(".editArticleToShow").removeClass("hiddenFirst");
			break;
		case "editQuestion":
			if (EditId == null || EditId == "") {
				backToIndex();
			}
			$("title").html("编辑问题 | 码上知道");
			$(".editQuestionToShow").removeClass("hiddenFirst");
			break;
		case "editAnswer":
			if(EditId == null || EditId == "") {
				backToIndex();
			}
			$("title").html("编辑回答 | 码上知道");
			$(".editAnswerToShow").removeClass("hiddenFirst");
			break;
		default:
			backToIndex();
	}
	//如果用户未登录，则不允许访问本页
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
		.catch(function(err) {
			//未登录，跳转首页
			backToIndex();
		});

	//标题输入长度非法时，显示红色边框
	$("#articleHeadInput").on("input", function() {
		if (!$("#articleHeadInput").val().length > 0 && $("#articleHeadInput").val().length < 50) {
			$("#articleTitleInputContainer").addClass("error");
		} else {
			$("#articleTitleInputContainer").removeClass("error");
		}
	});

	$("#editArticleHeadInput").on("input", function() {
		if (!$("#editArticleHeadInput").val().length > 0 && $("#editArticleHeadInput").val().length < 50) {
			$("#editArticleHeadContainer").addClass("error");
		} else {
			$("#editArticleHeadContainer").removeClass("error");
		}
	});
	
	$("#questionHeadInput").on("input", function() {
		if (!$("#questionHeadInput").val().length > 0 && $("#questionHeadInput").val().length < 50) {
			$("#questionTitleInputContainer").addClass("error");
		} else {
			$("#questionTitleInputContainer").removeClass("error");
		}
	});
	
	$("#editQuestionHeadInput").on("input", function() {
		if (!$("#editQuestionHeadInput").val().length > 0 && $("#editQuestionHeadInput").val().length < 50) {
			$("#editQuestionHeadContainer").addClass("error");
		} else {
			$("#editQuestionHeadContainer").removeClass("error");
		}
	});

	//标题输入提示

	$("#articleHeadInput").popup({
		on: "focus"
	});

	$("#editArticleHeadInput").popup({
		on: "focus"
	});

	$("#questionHeadInput").popup({
		on: "focus"
	});
	
	$("#editQuestionHeadInput").popup({
		on: "focus"
	});

	//加载Editor.md

	let editor;

	//不是编辑操作时，直接创建Editor.md编辑器
	if (EditorPageType.indexOf("edit") == -1) {
		if(EditorPageType == "submitQuestion") {
			editor = createEditor("markdownArea","问题的详细描述，可为空");
		} else if(EditorPageType == "submitAnswer") {
			const name = "questionTitle";
			let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			let decodedUrl = decodeURI(window.location.href)
			let r = decodedUrl.substr(decodedUrl.indexOf("?") + 1).match(reg);
			let questionToAnswerTitle = (r == null ? null : unescape(r[2]));
			if(questionToAnswerTitle == null || questionToAnswerTitle == "" || questionToAnswerTitle.length == 0) {
				backToIndex();
			} else {
				$(".questionToAnswerTitle").html(questionToAnswerTitle);
				$(".questionToAnswerTitleDiv a").attr("href","showQuestion.html?questionId=" + QuestionId);
			}
			editor = createEditor("markdownArea","在此输入回答的内容");
		} else {
			editor = createEditor("markdownArea",null);
		}
	} else if (EditorPageType.indexOf("edit") != -1) {
		if (EditorPageType == "editArticle") {
			//从后台获取数据，构建编辑器
			$.ajax({
				url: "article/getArticleToEdit",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId
				},
				success: function(response) {
					//console.log(response);
					if (response.success == "true" && response.articleId == EditId) {
						$("#editArticleHeadInput").val(response.title);
						//构建有初始内容的Editor.md编辑器
						$("#markdownArea").append("<textarea style='display:none;'>" + response.content + "</textarea>");
						editor = createEditor("markdownArea");
					} else {
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.history.back();
								}
							})
							.modal("show");
					}
				},
				error: function(response) {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.history.back();
							}
						})
						.modal("show");
				}
			});
		} else if(EditorPageType == "editQuestion") {
			//从后台获取数据，构建编辑器
			$.ajax({
				url: "question/getQuestionToEdit",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId
				},
				success: function(response) {
					//console.log(response);
					if (response.success == "true" && response.questionId == EditId) {
						$("#editQuestionHeadInput").val(response.title);
						//构建有初始内容的Editor.md编辑器
						$("#markdownArea").append("<textarea style='display:none;'>" + response.detail + "</textarea>");
						editor = createEditor("markdownArea");
					} else {
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.history.back();
								}
							})
							.modal("show");
					}
				},
				error: function(response) {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.history.back();
							}
						})
						.modal("show");
				}
			});
		} else if(EditorPageType == "editAnswer") {
			//从后台获取数据，构建编辑器
			$.ajax({
				url: "answer/getAnswerToEdit",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId
				},
				success: function(response) {
					//console.log(response);
					if (response.success == "true" && response.answerId == EditId) {
						$(".questionToEditAnswerTitle").html(response.questionTitle);
						//构建有初始内容的Editor.md编辑器
						$("#markdownArea").append("<textarea style='display:none;'>" + response.content + "</textarea>");
						editor = createEditor("markdownArea");
					} else {
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.history.back();
								}
							})
							.modal("show");
					}
				},
				error: function(response) {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.history.back();
							}
						})
						.modal("show");
				}
			});
		} else {
			backToIndex();
		}
	}

	function createEditor(editorContainer, customPlaceHolder) {
		if (customPlaceHolder == null) customPlaceHolder = "享受MarkDown编辑的乐趣吧~";
		return editormd(editorContainer, {
			placeholder: customPlaceHolder,
			width: "100%",
			height: "100%",
			path: "vendor/Editor.md/lib/",
			tex: true, // 开启科学公式TeX语言支持，默认关闭
			flowChart: true, // 开启流程图支持，默认关闭
			sequenceDiagram: true, // 开启时序/序列图支持，默认关闭,
			emoji: true, // 启用emoji表情
			imageUpload: true, // 开启图片上传功能
			imageUploadURL: "contentImage/uploadImage"
		});
	}

	//提交问题事件
	$("#questionSubmitBtn").on("click", function() {
		let titleStr = $("#questionHeadInput").val();
		let contentStr = editor.getMarkdown();
		//console.log(titleStr);
		//console.log(contentStr);
		if (titleStr.length == 0 || titleStr.length > 50) {
			$("#questionHeadInput").focus();
			remindInputHeadInfos();
		} else {
			$("#questionSubmitBtn").addClass("disabled");
			$("#questionSubmitBtn").addClass("loading");
			$.ajax({
				url: "question/newQuestion",
				type: "POST",
				dataType: "json",
				data: {
					"title": titleStr,
					"detail": contentStr + ""
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("index.html", "_self");
								}
							})
							.modal("show");
					} else {
						$("#questionSubmitBtn").removeClass("disabled");
						$("#questionSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#questionSubmitBtn").removeClass("disabled");
					$("#questionSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});

	//提交文章事件
	$("#articleSubmitBtn").on("click", function() {
		let titleStr = $("#articleHeadInput").val();
		let contentStr = editor.getMarkdown();
		if (titleStr.length == 0 || titleStr.length > 50) {
			$("#articleHeadInput").focus();
			remindInputHeadInfos();
		} else if (contentStr.length == 0) {
			$("#articleSubmitBtn").removeClass("blue");
			$("#articleSubmitBtn").addClass("red");
			$("#articleBtnWord").html("请输入内容");
		} else {
			$("#articleSubmitBtn").addClass("disabled");
			$("#articleSubmitBtn").addClass("loading");
			$.ajax({
				url: "article/newArticle",
				type: "POST",
				dataType: "json",
				data: {
					"title": titleStr,
					"content": contentStr
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("article.html", "_self");
								}
							})
							.modal("show");
					} else {
						$("#articleSubmitBtn").removeClass("disabled");
						$("#articleSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#articleSubmitBtn").removeClass("disabled");
					$("#articleSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});
	
	//提交编写回答事件
	$("#answerSubmitBtn").on("click", function() {
		let contentStr = editor.getMarkdown();
		if (contentStr.length == 0) {
			$("#answerSubmitBtn").removeClass("blue");
			$("#answerSubmitBtn").addClass("red");
			$("#answerBtnWord").html("请输入内容");
		} else {
			$("#answerSubmitBtn").addClass("disabled");
			$("#answerSubmitBtn").addClass("loading");
			$.ajax({
				url: "answer/newAnswer",
				type: "POST",
				dataType: "json",
				data: {
					"which_question": QuestionId,
					"content": contentStr
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("showQuestion.html?questionId=" + QuestionId, "_self");
								}
							})
							.modal("show");
					} else {
						$("#answerSubmitBtn").removeClass("disabled");
						$("#answerSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#answerSubmitBtn").removeClass("disabled");
					$("#answerSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});

	//提交编辑文章事件
	$("#editArticleSubmitBtn").on("click", function() {
		let titleStr = $("#editArticleHeadInput").val();
		let contentStr = editor.getMarkdown();
		if (titleStr.length == 0 || titleStr.length > 50) {
			$("#editArticleHeadInput").focus();
			remindInputHeadInfos();
		} else if (contentStr.length == 0) {
			$("#editArticleSubmitBtn").removeClass("blue");
			$("#editArticleSubmitBtn").addClass("red");
			$("#editArticleBtnWord").html("请输入内容");
		} else {
			$("#editArticleSubmitBtn").addClass("disabled");
			$("#editArticleSubmitBtn").addClass("loading");
			$.ajax({
				url: "article/updateArticle",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId,
					"newTitle": titleStr,
					"newContent": contentStr
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("showArticle.html?articleId=" + EditId, "_self");
								}
							})
							.modal("show");
					} else {
						$("#editArticleSubmitBtn").removeClass("disabled");
						$("#editArticleSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#editArticleSubmitBtn").removeClass("disabled");
					$("#editArticleSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});
	
	//提交编辑问题事件
	$("#editQuestionSubmitBtn").on("click", function() {
		let titleStr = $("#editQuestionHeadInput").val();
		let contentStr = editor.getMarkdown();
		if (titleStr.length == 0 || titleStr.length > 50) {
			$("#editQuestionHeadInput").focus();
			remindInputHeadInfos();
		} else {
			$("#editQuestionSubmitBtn").addClass("disabled");
			$("#editQuestionSubmitBtn").addClass("loading");
			$.ajax({
				url: "question/updateQuestion",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId,
					"newTitle": titleStr,
					"newDetail": contentStr
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("showQuestion.html?questionId=" + EditId, "_self");
								}
							})
							.modal("show");
					} else {
						$("#editQuestionSubmitBtn").removeClass("disabled");
						$("#editQuestionSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#editQuestionSubmitBtn").removeClass("disabled");
					$("#editQuestionSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});
	
	//提交编辑回答事件
	$("#editAnswerSubmitBtn").on("click", function() {
		let contentStr = editor.getMarkdown();
		if (contentStr.length == 0) {
			$("#editAnswerSubmitBtn").removeClass("blue");
			$("#editAnswerSubmitBtn").addClass("red");
			$("#editAnswerBtnWord").html("请输入内容");
		} else {
			$("#editAnswerSubmitBtn").addClass("disabled");
			$("#editAnswerSubmitBtn").addClass("loading");
			$.ajax({
				url: "answer/updateAnswer",
				type: "POST",
				dataType: "json",
				data: {
					"editId": EditId,
					"newContent": contentStr
				},
				success: function(response) {
					if (response.success == "true") {
						$("#success_modal")
							.modal('setting', 'closable', false)
							.modal({
								onHidden: function() {
									window.open("showAnswer.html?answerId=" + EditId, "_self");
								}
							})
							.modal("show");
					} else {
						$("#editAnswerSubmitBtn").removeClass("disabled");
						$("#editAnswerSubmitBtn").removeClass("loading");
						$("#failed_modal")
							.modal('setting', 'closable', false)
							.modal("show");
					}
				},
				error: function(response) {
					$("#editAnswerSubmitBtn").removeClass("disabled");
					$("#editAnswerSubmitBtn").removeClass("loading");
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal("show");
				}
			});
		}
	});

	$("#success_modal_ok").on("click", function() {
		//不同的编辑类型，跳转不同的页面
		switch (EditorPageType) {
			case "writeArticle":
				window.open("article.html", "_self");
				break;
			case "submitQuestion":
				window.open("index.html","_self");
				break;
			case "submitAnswer":
				window.open("showQuestion.html?questionId=" + QuestionId,"_self");
				break;
			case "editArticle":
				window.open("showArticle.html?articleId=" + EditId, "_self");
				break;
			case "editQuestion":
				window.open("showAnswer.html?answerId=" + EditId, "_self");
				break;
			case "editAnswer":
				window.open("showAnswer.html?answerId=" + EditId, "_self");
				break;
			default:
				backToIndex();
		}
	});

	//移动端提示框隐藏
	$("#mobileEditTip .close,#mobileEditTip .button").on("click", function() {
		$("#mobileEditTip")
			.closest('#mobileEditTip')
			.transition('fade');
	});

	//跳转头部信息输入位置
	function remindInputHeadInfos() {
		let $target = $('[name=needInputHeadInfos]');
		let targetOffset = $target.offset().top;
		$('html,body').animate({
			scrollTop: targetOffset
		}, 300);
	}
});
