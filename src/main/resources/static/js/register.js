$(document).ready(function() {
	$("#nextstep").on("click", function() {
		$("#step1").removeClass("active");
		$("#step1").addClass("completed");
		$("#step2").addClass("active");
		$("#emailform").css("display", "none");
		$("#infoform").css("display", "block");
	});

	$("#emailsender").on("click", function() {
		$(this).addClass("loading");
		$("#emailsender").addClass("disabled");
		$("#emailformerrmsg").css("display", "none");
		$("#emailfield").removeClass("error");
		let pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		//不符合邮件格式
		if ($("#emailinput").val() == "") {
			tipEmailErr("请输入邮件地址！");
		} else if (!pattern.test($("#emailinput").val())) {
			tipEmailErr("邮件格式不正确！");
		} else {
			$.ajax({
				url: "usr/sendRegisterEmail",
				type: "POST",
				dataType: "json",
				data: {
					"emailinput": $("#emailinput").val()
				},
				success: function(response) {
					if (response.success == "false") {
						tipEmailErr(response.reason);
					} else {
						$("#emailsender").html("已发");
						$("#verifycodeinput").removeAttr("disabled");
					}
					$("#emailsender").removeClass("loading");
				},
				error: function(response) {
					tipEmailErr("未知错误！");
				}
			});
		}
	});

	function tipEmailErr(content) {
		$("#emailformerrmsg .list").html("");
		$("#emailformerrmsg .list").append("<li>" + content + "</li>");
		$("#emailformerrmsg").css("display", "block");
		$("#emailfield").addClass("error");
		$("#emailinput").focus();
		$("#emailsender").removeClass("loading");
		$("#emailsender").removeClass("disabled");
	}
	
	$("#verifycodeinput").on("input", function() {
		let pattern = /^\d{6}$/;
		if(pattern.test($("#verifycodeinput").val())) {
			checkVerifyCode();
		}
	});

	function checkVerifyCode() {
		$("#nextstep").addClass("loading");
		$.ajax({
			url: "usr/checkVerifyCode",
			type: "POST",
			dataType: "json",
			data: {
				"verifycodeinput": $("#verifycodeinput").val()
			},
			success: function(response) {
				//console.log(response);
				if (response.success == "true") {
					$("#nextstep").removeClass("loading");
					$("#nextstep").removeClass("disabled");
					$("#nextstep").html("下一步");
				} else {
					$("#nextstep").removeClass("loading");
					$("#nextstep").html("验证码错误");
					$("#nextstep").addClass("disabled");
				}
			}
		});
	}

	let repasswordverified = false;

	$("#infoform")
		.form({
			on: 'blur',
			fields: {
				username: {
					identifier: 'username',
					rules: [{
						type: 'regExp[/^[a-zA-Z0-9]{4,16}$/]',
						prompt: '用户名格式错误！（4-16位字母/数字）'
					}]
				},
				nickname: {
					identifier: 'nickname',
					rules: [{
						type: 'regExp[/^[\u4e00-\u9fa5_a-zA-Z0-9]{2,10}$/]',
						prompt: '昵称格式错误！（2-10位字母/中文/数字/下划线）'
					}]
				},
				password: {
					identifier: 'password',
					rules: [{
						type: 'regExp[/^(?=.{6,20}$)(?![0-9]+$)(?!.*(.).*\1)[0-9a-zA-Z$#@^&]+$/]',
						prompt: '密码格式错误！（必须包含字母和数字，6-20位）'
					}]
				},
				notrobot: {
					identifier: 'notrobot',
					rules: [{
						type: 'checked',
						prompt: '请执行人机验证！'
					}]
				}
			}
		});

	$("#registersubmit").on("click", function() {
		if ($("#repasswordinput").val() != $("#passwordinput").val()) {
			$("#repasswordfield").addClass("error");
			repasswordverified = false;
			//必须等Semantic UI自带的验证把其他验证完了再执行
			setTimeout(function() {
				$("#infoformerrmsg .list").append("<li>两次密码输入不一致！</li>");
			}, 0);
		} else {
			$("#repasswordfield").removeClass("error");
			repasswordverified = true;
		}
	});

	$("#repasswordinput").on("blur", function() {
		if ($("#repasswordinput").val() != $("#passwordinput").val()) {
			$("#repasswordfield").addClass("error");
			repasswordverified = false;
		} else {
			$("#repasswordfield").removeClass("error");
			repasswordverified = true;
		}
	});
	
	$("#robotCheck").on("click",function(){
		generateQuestion();
		$("#robotChecker")
		.modal('setting', 'closable', false)
		.modal('show');
	});
	
	$("#calcansweryes").on("click",function(){
		notRobotCheck(true);
	});
	
	$("#calcanswerno").on("click",function(){
		notRobotCheck(false);
	});

	$("#infoform").on("submit", function() {
		if (!$("#infoform .field").hasClass("error") && repasswordverified) {
			//提交前禁用注册按钮，防止重复提交
			$("#registersubmit").addClass("disabled");
			//验证完成，提交注册数据
			$.ajax({
				url: "usr/register",
				type: "POST",
				dataType: "json",
				data: {
					"username" : $("#usernameinput").val(),
					"password" : $("#passwordinput").val(),
					"nickname" : $("#nicknameinput").val()
				},
				success: function (response) {
					//注册成功，跳转登录
					if(response.success == "true") {
						let start = 5;
						$("#redirecttime").html(start--);
						setInterval(function() {
							if(start == 0) window.open("../index.html","_self");
							$("#redirecttime").html(start--);
						},1000);
						$("#registerSuccess")
						.modal({
							closable  : false,
							onApprove : function() {
							  window.open("../index.html","_self");
							}
						})
						.modal('show');
					} else {
						registerFailedMsg(response.reason);
					}
				},
				error: function(response) {
					registerFailedMsg("未知错误！请联系管理员。")
				}
			});
		}
		return false;
	});

	function registerFailedMsg(content) {
		$("#infoformerrmsg .list").html("");
		$("#infoformerrmsg .list").append("<li>" + content + "</li>");
		$("#infoformerrmsg").css("display","block");
		$("#passwordinput").val("");
		$("#repasswordinput").val("");
		$("#notrobotinput").removeAttr("checked");
		$("#robotCheck").removeClass("disabled");
		$("#registersubmit").removeClass("disabled");
	}
	
	let correctAnswer;
	
	//随机生成一个10以内的加减乘算式，
	//并给出一个不一定正确的结果，
	//让用户判断是否正确
	function generateQuestion() {
		let num1 = Math.floor((Math.random()*10)+1);
		let num2 = Math.floor((Math.random()*10)+1);
		let discription = Math.random() > 0.5 ? "正确" : "错误";
		let opr;
		let oprRand = Math.random();
		let res;
		if(oprRand < 0.33) {
			opr = "+";
			res = num1 + num2;
		} else if(oprRand < 0.66) {
			opr = "-";
			res = num1 - num2;
		} else {
			opr = "×";
			res = num1 * num2;
		}
		
		//再加入50%的概率进行答案扰动
		if(discription == "正确") {
			if(Math.random() < 0.5) {
				//答案修改了，正解取反
				res += Math.floor((Math.random() * 4) - 5);
				correctAnswer = false;
			} else {
				correctAnswer = true;
			}
		} else {
			if(Math.random() < 0.5) {
				//答案修改了，正解取反
				res += Math.floor((Math.random() * -4) + 5);
				correctAnswer = true;
			} else {
				correctAnswer = false;
			}
		}
		
		$("#num1").html(num1);
		$("#opr").html(opr);
		$("#num2").html(num2);
		$("#res").html(res);
		$("#judge").html(discription);
	}
	
	function notRobotCheck(yesorno) {
		//回答正确，勾选并禁用
		if(yesorno == correctAnswer) {
			$("#notrobotinput").attr("checked", true);
			$("#robotCheck").addClass("disabled");
			$("#robotCheck").removeClass("error");
		} else {//回答错误，取消勾选变红色
			$("#robotCheck").addClass("error");
			$("#notrobotinput").removeAttr("checked");
		}
	}

	$("#logocontainer").on("click",function() {
		window.open("index.html","_self");
	})
});
