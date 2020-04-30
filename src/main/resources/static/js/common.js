/*此ES6 Promise方法为所有页面公用，
在需要登录的场景里调用islogin方法判断是否登录，
如果登录了就返回用户id，其他页面拿到id之后可以做其他工作，如加载头像、加载文章等
如果没登录就返回空字符串*/
/*
用法如下：
tryGetUid
//已登录
.then(function (uid) {
	//do sth when login with uid
})
//未登录
.catch(function (err) {
	if(err == "") {
		//do sth when not login
	}
});
*/
var tryGetUid = new Promise(function(resolve, reject) {
	$.ajax({
		url: "usr/tryJWTverify",
		type: "POST",
		dataType: "json",
		success: function(response) {
			if (response.islogin == "true") {
				resolve(response.uid);
			} else reject("");
		},
		error: function(response) {
			reject("");
		}
	});
});

function getCookie(cookie_name) {
	let allcookies = document.cookie;
	//索引长度，开始索引的位置
	let cookie_pos = allcookies.indexOf(cookie_name);
	// 如果找到了索引，就代表cookie存在,否则不存在
	if (cookie_pos !== -1) {
		// 把cookie_pos放在值的开始，只要给值加1即可
		//计算取cookie值得开始索引，加的1为“=”
		cookie_pos = cookie_pos + cookie_name.length + 1;
		//计算取cookie值得结束索引
		var cookie_end = allcookies.indexOf(";", cookie_pos);

		if (cookie_end === -1) {
			cookie_end = allcookies.length;
		}
		//得到想要的cookie的值
		return unescape(allcookies.substring(cookie_pos, cookie_end));
	}
	return "";
}

//清除指定名称cookie
function clearCookie(name) {
	let date = new Date();
	date.setTime(date.getTime() - 10000);
	document.cookie = name + "=v; expires=" + date.toUTCString();
}

$(document).ready(function() {
	//绑定侧边菜单弹出事件
	$("#togglePusher").on("click", function() {
		$("#sidebar")
			.sidebar('setting', 'transition', 'overlay')
			.sidebar('toggle');
	});

	//绑定logo点击事件
	$("#navlogo").on("click", function() {
		window.open("./index.html", "_self");
	});

	//绑定头像点击事件，弹出用户信息tips
	$("#headphotocontainer")
		.popup({
			popup: $("#usertips"),
			on: 'click'
		});

	$("#pccancellogin,#mobilecancellogin").on("click", function() {
		doCancelLogin();
	});

	function doCancelLogin() {
		clearCookie("token");
		window.location.reload();
	}

	$(".logintrigger").on("click", function() {
		//先收起侧边栏，再打开登录模态框，否则交互体验不好
		new Promise(function(resolve, reject) {
				if ($("#sidebar").hasClass("visible")) {
					$("#sidebar")
						.sidebar('setting', 'transition', 'overlay')
						.sidebar('toggle');
					setTimeout(function() {
						resolve();
					}, 500);
				} else resolve();
			})
			.then(function() {
				$("#loginmodal").modal("show")
			});
	});

	$("#loginbtn").on("click", function() {
		if ($("#usernameinput").val() == "") {
			$("#usernamefield").addClass("error");
			$("#loginerrorlist .list").html("");
			$("#loginerrorlist .list").append("<li>请输入用户名！</li>");
			$("#loginerrorlist").css("display", "block");
		} else if ($("#passwordinput").val() == "") {
			$("#usernamefield").removeClass("error");
			$("#passwordfield").addClass("error");
			$("#loginerrorlist .list").html("");
			$("#loginerrorlist .list").append("<li>请输入密码！</li>");
			$("#loginerrorlist").css("display", "block");
		} else {
			$("#usernamefield").removeClass("error");
			$("#passwordfield").removeClass("error");
			$("#loginerrorlist .list").html("");
			$("#loginerrorlist").css("display", "none");
			$(this).addClass("loading");
			$(this).addClass("disabled");
			$.ajax({
				url: "usr/login",
				type: "POST",
				dataType: "json",
				data: {
					"username": $("#usernameinput").val(),
					"password": $("#passwordinput").val()
				},
				success: function(response) {
					//console.log(response);
					if (response.success == "true") {
						//登录成功，刷新页面
						window.location.reload();
					} else {
						if (response.timeToWait != null) {
							//console.log("锁住了");
							$("#loginbtn").removeClass("blue");
							$("#loginbtn").addClass("red");
							$("#loginbtn").removeClass("loading");
							let lockTimeLeft = response.timeToWait;
							$("#loginbtn").html("请等待" + (lockTimeLeft) + "秒后重试");
							let lockDown = setInterval(function() {
								$("#loginbtn").html("请等待" + (--lockTimeLeft) + "秒后重试");
								if (lockTimeLeft <= 0) {
									loadRetry();
									clearInterval(lockDown);
								}
							}, 1000);
						} else {
							//console.log("没锁住");
							loadRetry();
						}
					}
				},
				error: function(response) {

				}
			});
		}
	});

	function loadRetry() {
		$("#loginbtn").removeClass("loading");
		$("#loginbtn").removeClass("blue");
		$("#loginbtn").removeClass("disabled");
		$("#loginbtn").addClass("red");
		$("#loginbtn").html("重试");
	}

	$("#loginform").on("submit", function() {
		return false;
	});

	$("#passwordinput").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#loginbtn").trigger("click");
		}
	});

	$("#getBackPassword").on("click", function() {
		$("#findPasswordModal")
			.modal("show");
	});

	//找回密码模态框
	$("#findpasswordbtn").on("click", function() {
		$("#findpassworderrorlist .list").html("");
		$("#findpassword").removeClass("error");
		$("#findpassworderrorlist").css("display", "none");
		let pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		if (!pattern.test($("#findpasswordemailinput").val())) {
			$("#findpassworderrorlist .list").append("<li>邮箱格式不正确！</li>");
			$("#findpasswordfield").addClass("error");
			$("#findpassworderrorlist").css("display", "block");
		} else {
			$("#findpasswordbtn").addClass("loading");
			$("#findpasswordbtn").addClass("disabled");
			$.ajax({
				url: "usr/findPassword",
				type: "POST",
				dataType: "json",
				data: {
					"email": $("#findpasswordemailinput").val()
				},
				success: function(response) {
					//console.log(response);
					if (response.success == "true") {
						//更改模态框状态，进入下一步，等待用户输入验证码
						$("#findpasswordfield").css("display", "none");
						$("#findpasswordbtn").css("display", "none");
						$("#findpasswordbtn_step2").css("display", "block");
						$("#findPasswordModal .header").html("已发送，请检查您的邮箱");
						$("#findpasswordverifycodefield").css("display", "block");
					} else {
						$("#findpasswordbtn").removeClass("blue");
						$("#findpasswordbtn").addClass("red");
						$("#findpasswordbtn").html("重试");
						$("#findpasswordbtn").removeClass("loading");
						$("#findpasswordbtn").removeClass("disabled");
						$("#findPasswordModal .header").html(
							response.reason != null ? response.reason : "貌似出了点问题"
						);
					}
				},
				error: function(response) {
					$("#findpasswordbtn").removeClass("blue");
					$("#findpasswordbtn").addClass("red");
					$("#findpasswordbtn").html("对不起，该功能现在不可用。");
					$("#findpasswordbtn").removeClass("loading");
				}
			});
		}
	});

	$("#findpasswordverifycodeinput").on("input", function() {
		let pattern = /^\d{6}$/;
		//console.log(pattern.test($("#findpasswordverifycodeinput").val()));
		if (pattern.test($("#findpasswordverifycodeinput").val())) {
			checkVerifyCode();
		}
	});

	function checkVerifyCode() {
		$("#findpasswordbtn_step2").addClass("loading");

		$.ajax({
			url: "usr/findPasswordVerifyCode",
			type: "POST",
			dataType: "json",
			data: {
				"code": $("#findpasswordverifycodeinput").val()
			},
			success: function(response) {
				if (response.success == "true") {
					$("#findpasswordbtn_step2").removeClass("loading");
					$("#findpasswordbtn_step2").removeClass("disabled");
					$("#findpasswordbtn_step2").html("下一步");
				} else {
					$("#findpasswordbtn_step2").removeClass("loading");
					$("#findpasswordbtn_step2").html("验证码错误");
					$("#findpasswordbtn_step2").addClass("disabled");
				}
			}
		});

	}

	$("#goRegister").on("click", function() {
		window.open("register.html", "_self");
	});

	$("#findpasswordbtn_step2").on("click", function() {
		$("#findpasswordbtn_step2").css("display", "none");
		$("#findPasswordModal .header").html("输入新密码");
		$("#findpasswordbtn_step3").css("display", "block");
		$("#findpasswordverifycodefield").css("display", "none");
		$("#findpasswordinputfield").css("display", "block");
	});

	$("#newpasswordinput").on("input", function() {
		let patternR = new RegExp("^(?=.{6,20}$)(?![0-9]+$)(?!.*(.).*\1)[0-9a-zA-Z$#@^&]+$");
		if (patternR.test($("#newpasswordinput").val())) {
			$("#findpasswordbtn_step3").removeClass("disabled");
			//console.log("true:" + $("#newpasswordinput").val());
		} else {
			$("#findpasswordbtn_step3").addClass("disabled");
			//console.log("false:" + $("#newpasswordinput").val());
		}
	});

	$("#findpasswordbtn_step3").on("click", function() {
		$("#findpasswordbtn_step3").addClass("loading");
		$("#findpasswordbtn_step3").addClass("disabled");
		$.ajax({
			url: "usr/doChangePassword",
			type: "POST",
			dataType: "json",
			data: {
				"newPassword": $("#newpasswordinput").val()
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
						.modal("show");
				} else {
					$("#failed_modal")
						.modal('setting', 'closable', false)
						.modal({
							onHidden: function() {
								window.location.reload();
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
							window.location.reload();
						}
					})
					.modal("show");
			}
		});
		return false;
	});

	//登录状态下点击头像，跳转到“我的”
	$("#sidebarheadphoto").on("click", function() {
		if ($(".mobilelogined").css("display") != "none") {
			window.open("me.html", "_self");
		}
	});

	//搜索框输入，显示预览项
	$("#search").search({
		apiSettings: {
			url: 'search/preSearch?q={query}'
		},
		fields: {
			results: 'items',
			title: 'name',
			description: 'description',
			url: 'html_url'
		},
		minCharacters: 1,
		error: {
			source: '无法搜索：未成功加载Semantic UI搜索模块',
			noResults: '暂无结果',
			logging: '无法搜索：日志出错',
			noEndpoint: '无法搜索：未指定搜索终点',
			noTemplate: '无法搜索：找不到搜索模板',
			oldSearchSyntax: 'searchFullText设置已重命名为fullTextSearch以保持一致性，请调整设置。',
			serverError: '无法搜索：服务器出错（500）',
			maxResults: '无法搜索：结果必须是数组才能使用maxResults设置',
			method: '无法搜索：调用的方法未定义.'
		}
	});
});
