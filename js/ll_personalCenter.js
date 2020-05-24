mui.init();
mui.plusReady(function() {
	var user = app.getUserGlobalInfo();
	//refreshBasicInfo();	
	loadPersonalCenter(user);
});


window.addEventListener("show", function() {
	console.log("触发个人中心的show事件");
	//refreshBasicInfo();
	var user = app.getUserGlobalInfo();
	loadPersonalCenter(user);
});


window.addEventListener("refresh",function(){
	console.log("触发个人中心的refresh事件");
	//refreshBasicInfo();
	var user = app.getUserGlobalInfo();
	loadPersonalCenter(user);
});


/* 点击头像 */
document.getElementById("myImage").addEventListener('tap',function(){
	mui.openWindow('ll_updateImage.html','ll_updateImage.html');
});

/* 点击“退出登录”按钮 */
document.getElementById("confirmBtn").addEventListener('tap', function() {
	var btnArray = ['是', '否'];
	mui.confirm('你确定要退出登录吗？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			//清空缓存
			plus.storage.removeItem("userInfo");
			
			var webviews= plus.webview.all();
			
			//打开login页面		
			mui.openWindow("crb_login1.html","crb_login1.html");
			console.log("执行至跳转到登录页面");
						
			mui.toast("退出登录成功！");
			setTimeout(function(){
				for(var i=0;i<webviews.length;i++){
					webviews[i].close();
				}
			},1000);
			
		} else {
			mui.toast("嘿嘿（`v`）");
		}
	})
});

/*点击“黑名单”项*/
document.getElementById("blackList").addEventListener('tap', function() {
	mui.openWindow('ll_blackList.html', 'll_blackList.html');
});

/*点击“十字记忆”项 */
document.getElementById("crossingMemory").addEventListener('tap', function() {
	mui.openWindow('ll_crossingMemory.html', 'll_crossingMemory.html');
});

/* 点击“添加标签” */
document.getElementById("addTag").addEventListener('tap', function() {
	mui.openWindow('ll_addTags.html', 'll_addTags.html');
});

/*点击修改个人资料*/
document.getElementById('modify').addEventListener('tap',function(){
	mui.openWindow('ll_updateInfo.html','ll_updateInfo.html');
});

/*点击进入我的钱包*/
/*document.getElementById('purse').addEventListener('tap',function(){
	mui.openWindow('ll_purse.html','ll_purse.html');
});*/

/*点击进入关于我们*/
document.getElementById('about').addEventListener('tap',function(){
	mui.openWindow('ll_about.html','ll_about.html');
});

/*点击进入帮助*/
document.getElementById('help').addEventListener('tap',function(){
	mui.openWindow('ll_help.html','ll_help.html');
});

function refreshBasicInfo() {
	console.log("请求加载个人中心数据，刷新");
	var user = app.getUserGlobalInfo();
	//var thisWeekTag1;
	//发送请求给后端请求数据
	//后端服务器的url
	mui.ajax(app.serverUrl+'/user/getUser', {
		data: {
			userId:user.userId,
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取用户信息；
			if (data.status == 200) {
				//保存全局用户对象到本地缓存
				//console.log(data.data.thisWeekTag);
				app.setUserGlobalInfo(data.data);
				//thisWeekTag1=data.data.thisWeekTag;
				//loadThisWeekTags(thisWeekTag1);
			}
			else{
				app.showToast(data.msg, "error");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			// console.log(JSON.stringify(data.data));
		}
	});
	var user1=app.getUserGlobalInfo();
	loadPersonalCenter(user1);
	//此处不知为何，始终执行会快过过响应的处理
//	console.log(user.thisWeekTag);
};


function loadPersonalCenter(user){
	console.log('加载缓存中的用户数据');
	//用户基本信息已经在缓存中
	//var myImage=user.icon;//头像
	var nickname = user.nickname; //假名
	var gender = user.gender; //性别
	var profile = user.profile; //简介
	var telephone = user.telephone; //手机号，暂时不允许更改
	//document.getElementById("myImage").src=myImage;
	document.getElementById("nickname").innerHTML = nickname;
	document.getElementById("gender").innerHTML = gender;
	document.getElementById("profile").innerHTML = profile;
	document.getElementById("telephone").innerHTML = telephone;
	loadPastTags();
	loadThisWeekTags(user.thisWeekTag);
}

//加载本周标签
function loadThisWeekTags(tags){
	console.log("加载缓存中的本周标签");
	var tags = tags.split(" ");
	var weekTagsDom=document.getElementById('weekTags');
	if (tags!= null && tags.length > 0 && tags!=undefined) {
		var weekTagsHtml = "";
		for (var i = 0; i <tags.length; i++) {
			weekTagsHtml += '<label style="background-color: lightgreen; margin-left: 5px;border-radius: 7px;">'
			+tags[i]+'</label>';
		}
		weekTagsDom.innerHTML = weekTagsHtml;
	} else {
		weekTagsDom.innerHTML = "";
	}
}

//加载过往标签
function loadPastTags(){
	var user=app.getUserGlobalInfo();
	console.log("从后端加载过往标签");
	mui.ajax(app.serverUrl+'/user/pastTag', {//发送请求返回用户的过往标签
		data: {
			userId:user.userId,
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取信息；
			if (data.status == 200) {
//				console.log(JSON.stringify(data.data));
				var pastTags = data.data;
				var pastTagsDom=document.getElementById('pastTags');
				if (pastTags!= null && pastTags.length > 0) {
					var pastTagsHtml = "";
					for (var i = 0; i <pastTags.length; i++) { //过往标签目前只显示3个
						pastTagsHtml += '<label style="background-color: dimgray; margin-left: 5px;border-radius: 7px;">'
						+pastTags[i]+'</label>'
					}
					pastTagsDom.innerHTML = pastTagsHtml;
				} else {
					pastTagsDom.innerHTML = "";
				}
			}
			else{
				app.showToast(data.msg, "error");
			}
		},
		// error: function(xhr, type, errorThrown) {
		// 	//异常处理；
		// 	console.log(JSON.stringify(data.data));
		// }
	});
}