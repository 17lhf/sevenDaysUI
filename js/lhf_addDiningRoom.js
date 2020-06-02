/*
本文件由lhf创建维护
本文件服务于lhf_addDiningRoom（即添加食堂页面）

需要传入一个参数
userId
*/

var tagStr;//记录添加标签传回的字符串
var userId;//记录用户id


mui.init();


mui.plusReady(function () {
	
	var thisWebview=plus.webview.currentWebview();
	userId=thisWebview.userId;
    
	/* 点击“添加标签” */
	mui("#addTag").addEventListener('tap', function() {
		mui.openWindow({
			url:"lhf_addTag.html",
			id:"lhf_addTag.html",//每个朋友的聊天页面独立
			extras:{
				userId:userId,
				oldTags:""
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	//点击确认键
	mui("#createConfirm").addEventListener('tap',function(){
		var roomName=mui("#roomName").value;
		//检测是否已经填写了食堂名称
		if(app.isNotNull(roomName)==false){
			mui.toast("请先书写你的食堂招牌呦！(๑‾᷅^‾᷅๑)");
		}
		//检测是否填写了食堂主营（标签）
		else if(app.isNotNull(tagStr)==false){
			mui.toast("请先敲定你的食堂主营呦！(๑‾᷅^‾᷅๑)");
		}
		//已经正确填写
		else{
			if(createRoomRequests()==true){
				var fatherWebview=plus.webview.currentWebview().opener();
				fatherWebview.evalJS("renderStoredCreateRoom()");//重新渲染自己创建的食堂列表
				mui.back();
			}
		}
	});
	//点击取消键
	mui("#createCancel").addEventListener('tap',function(){
		mui.back();
	});
});


//渲染标签内容
function renderNewTag(newTags){
	tagStr=newTags;//记录传回的标签
	var addTagDom=mui("#diningRoomTags");
	newTags = newTags.split(" ");
	if (app.isNotNull(newTags)) {
		var theTagsHtml = "";
		for (var i = 0; i < newTags.length; i++) {
			theTagsHtml += '<label style="background-color: lightgreen; margin-left: 5px;border-radius: 7px;">'
			+newTags[i]+'</label>';
		}
		addTagDom.innerHTML = theTagsHtml;
	}
	else {
		addTagDom.innerHTML = "";
	}
}


//发送创建请求到后端
//创建成功，返回true，创建失败，返回false
function createRoomRequests(){
	var roomName=mui("#roomName").value;
	
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"chatRoom/create",{
		async:false, 
		data:{
			userId:userId,
			chatroomName:roomName,
			chatroomTag:tagStr
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
				app.addMyRoom(data.data);//修改缓存
				return true;
			}
			else{
				mui.toast("发送添加新食堂加载请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("发送新建食堂出错error");
			// console.log(JSON.stringify(data.data));
		}
	});
	return false;
}