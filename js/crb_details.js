//mui初始化，配置下拉刷新
var head;
var max;
var index;
mui.init({
	pullRefresh: {
		container: '#comment',
		down: {
			style: 'circle',
			offset: '0px',
			auto: true,
			callback: pulldownRefresh
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore:'评论到底了',
			callback: pullupRefresh
		}
	},
})

mui.plusReady(function () {
	
	var user = app.getUserGlobalInfo();
	var Webview=plus.webview.currentWebview();
	postid=Webview.postid;
	icon=Webview.icon;
	nickname=Webview.nickname;
	content=Webview.content;
	date=Webview.date;
	postlike=Webview.postlike;
	
	mui.ajax(app.serverUrl+"/corner/getpost",{
		data:{
			postId:postid
		},
		dataType:'json',
		type:'POST',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		success:function(data){
			//console.log(JSON.stringify(data));
			icon=data.data.user.icon;
			nickname=data.data.user.nickname;
			date=new Date(data.data.postDate);
			content=data.data.postContent;
			postlike=data.data.postLike;
			//console.log(icon);
			var post=document.getElementById("post");
			var html="";
			year=date.getFullYear();
			month=parseInt(date.getMonth()+1);
			day=date.getDate();
			hour=date.getHours();
			minute=date.getMinutes();
			second=date.getSeconds();
			
			html=
				'<div class="mui-card-header mui-card-media">'+
					'<img src="'+icon+'"/>'+
					'<div class="mui-media-body">'+
						nickname+
						'<p>发表于 '+year+'.'+t(month)+'.'+t(day)+' '+
						t(hour)+':'+t(minute)+':'+t(second)+
						'</p>'+
					'</div>'+
				'</div>'+
				'<div class="mui-card-content">'+
					//<img v-html="image" id="post_image" width="100%"-->
					'<p class="content">'+
						content+
					'</p>'+
				'</div>'+
				'<div class="mui-card-footer">'+
					'<p>'+postlike+'</p>'+
					'<label id="like" onclick="likeclick()">'+likeornot()+'</label>'+
				'</div>'+
			'</div>';
			post.innerHTML=html;
		},
	});
})

function t(s){
	return s<10?"0"+s:s;
}

function likeornot(){
	var user = app.getUserGlobalInfo();
	//var like=document.getElementById("like");
	//console.log(like);
	var like="";
	mui.ajax(app.serverUrl+"/corner/likeornot",{//后端url
	//前端默认赞,,,查询后端数据库是否有userid对于post的点赞，
	//若有，改变为已赞，若无，不做操作
		data:{
			postId:postid,
			userId:user.userId
	    },
		dataType:'json',
		type:'POST',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		async: false, 
		success:function(data){
			if (data.status == 200) {
				console.log(JSON.stringify(data));
				if(data.data=="已经点赞"){
					like="已赞";
					//return like;
					//like.innerHTML="已赞";
				}else if(data.data=="尚未点赞"){
					like="赞";
					//return like;
					//like.innerHTML="赞";
					//return "赞";
				}
	        }
	    	else{
	        	app.showToast(data.msg, "error");
	        }	
	    }
	});
	return like;
}

function likeclick(){
	var user = app.getUserGlobalInfo();
	var like=document.getElementById("like");
	console.log(like.innerHTML);
	if(like.innerHTML=="赞"){
		mui.ajax(app.serverUrl+"/corner/like",{//后端url
			data:{
				postId:postid,
				userId:user.userId
			},
			dataType:'json',
			type:'POST',
			timeout:10000,
			contentType:'application/json;charset=utf-8',
			success:function(data){
				if (data.status == 200) {
					console.log(JSON.stringify(data));
					like.innerHTML="已赞";
				}
				else{
					app.showToast(data.msg, "error");
				}
			}
		});
	}else if(like.innerHTML=="已赞"){
		mui.ajax(app.serverUrl+"/corner/notlike",{//后端url
			data:{
				postId:postid,
				userId:user.userId
			},
			dataType:'json',
			type:'POST',
			timeout:10000,
			contentType:'application/json;charset=utf-8',
			success:function(data){
				if (data.status == 200) {
					console.log(JSON.stringify(data));
					like.innerHTML="赞";
				}
				else{
					app.showToast(data.msg, "error");
				}
			}
		});
	}else{
		console.log("发生异常");
	}
}

function send(){
//document.getElementById("send-bn").addEventListener('tap',function(){
		var user = app.getUserGlobalInfo();
		var content=document.getElementById('comment-text').value;
		if(content==''){
			mui.toast('内容不能为空');
			return false; 
		}
		else if(content.length>50){
		   mui.toast('评论不得超过50个字');
		   return false; 
		}
		else{
			var myDate = new Date();
			mui.ajax(app.serverUrl+"/corner/comment", {//后端url
				data: {
					sendUser:{
						userId:user.userId
					},
					post:{
						postId:postid
					},
					postContent:content
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json;charset:utf-8'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否成功发送动态；
					if (data.status == 200) {
						//显示成功信息
						mui.toast("评论发送成功");
						console.log(data.data);
						//var chatWebview = plus.webview.getWebviewById("crb_details.html");
						//chatWebview.evalJS("pulldownRefresh()");
						location.reload()
					}
					else{
						app.showToast(data.msg, "error");
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				},
			});
		}		
	}

function pulldownRefresh() {
	mui('#comment').pullRefresh().endPullupToRefresh(false);
	//location.reload();
	if(window.plus && plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
		plus.nativeUI.toast('似乎已断开与互联网的连接', {
			verticalAlign: 'top'
		});
		return;
	}
	head = 0;
	max = 10;
	var data = {
		start:head,
		max:max,//需要的字段名
		postId:postid,
	}
	mui.post(app.serverUrl + "/corner/getcomment", data, function(rsp) {
		
		mui('#comment').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用			
			posts.items = convert(rsp);
			var list=document.getElementById("commentlist");
			var postHtml="";
			index=posts.items.length;
			for(var i=0;i<posts.items.length;i++){
				var j=parseInt(i)+parseInt(1);
				postHtml+=addcomment(posts.items[i],j);
			}
			list.innerHTML=postHtml;
			//addlistNer();
		}
		console.log(index);
		/*
		if(rsp.data==""){
			
		}else{
			//console.log(rsp.data[0].commentId);
			//console.log(JSON.stringify(rsp.data));
			mui('#comment').pullRefresh().endPulldownToRefresh();
			rsp=rsp.data;
			if(rsp && rsp.length > 0) {
				lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用
				posts.items = convert(rsp);
			
				var list=document.getElementById("commentlist");
				var postHtml="";
				for(var i=0;i<posts.items.length;i++){
					var j=parseInt(i)+parseInt(1);
					postHtml+=addcomment(posts.items[i],j);
				}
				if(max>posts.items.length){
					index=posts.items.length;
				}else{
					index=max;
				}
				console.log(index);
				list.innerHTML=postHtml;
			}
		}	*/
	},'json');
}

function pullupRefresh() {
	console.log(index);
	console.log(head);

	head += max;
	max = 10;
	if(index>=head){
	var data = {
		start:head,
		max:max,//需要的字段名
		postId:postid,
	}
	
	
	//请求历史列表信息流
	mui.post(app.serverUrl + "/corner/getcomment", data, function(rsp) {
		mui('#comment').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].commentId;//保存最新消息的id，方便下拉刷新时使用
			posts.items = convert(rsp);
			var list=document.getElementById("commentlist");
			var postHtml="";
			index=posts.items.length
			console.log(post.ite.length);
			for(var i=0;i<posts.items.length;i++){
				var j=parseInt(i)+parseInt(1);
				postHtml+=addcomment(posts.items[i],j);
			}
			list.innerHTML=postHtml;
		}
	},'json');
	//this.endPullupToRefresh(true);
	}
	else{
		mui('#comment').pullRefresh().endPullupToRefresh(true);
	}
	
}

function addcomment(comment,j) {
	var html="";
	html='<div class="mui-card comment" id="commentItem">'+
			'评论'+j+'<br/>'+
			comment.sendUser+':'+comment.postContent+
		'</div>';
		
	return html;
}

var posts = new Vue({
	el: '#posts',
	data: {
		items: [] //列表信息流数据
	}
})

function convert(items) {
	var postItems = [];
	items.forEach(function(item) {
		postItems.push({
			//icon:item.user.icon,
			commentId:item.commentId,
			postContent:item.postContent,
			sendUser:item.sendUser.nickname,
		});
	});
	//console.log(postItems);
	return postItems;
};