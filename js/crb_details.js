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
});

function pulldownRefresh() {
	mui.ajax(app.serverUrl+"/corner/getpost",{
		data:{
			postId:postid
		},
		dataType:'json',
		type:'POST',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		success:function(data){
			nickname=data.data.user.nickname;
			date=new Date(data.data.postDate);
			content=data.data.postContent;
			postlike=data.data.postLike;
		}
	})
	
	document.getElementById("title").innerHTML=nickname;
	document.getElementById("time").innerHTML=date;
	document.getElementById("content").innerHTML=content;
	document.getElementById("postlike").innerHTML=postlike;
		
	head = 0;
	max = 10;
	var data = {
		start:0,
		max:max,//需要的字段名
		postId:postid,
	}
	mui.post(app.serverUrl + "/corner/getcomment", data, function(rsp) {
		if(rsp.data==""){
			mui('#comment').pullRefresh().endPulldownToRefresh();
		}else{
			/*console.log(rsp.data[0].commentId);
			console.log(JSON.stringify(rsp.data));*/
			mui('#comment').pullRefresh().endPulldownToRefresh();
			rsp=rsp.data;
			if(rsp && rsp.length > 0) {
				lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用
				posts.items = convert(rsp);
			
				var list=document.getElementById("commentlist");
				var postHtml="";
				for(var i=0;i<posts.items.length;i++){
					var j=parseInt(i)+parseInt(1);
					postHtml+=addpost(posts.items[i],j);
				}
				if(max>posts.items.length){
					index=posts.items.length;
				}else{
					index=max;
				}
				list.innerHTML=postHtml;
			}
		}	
	},'json');
}

function addpost(post,j) {
	var html="";
	html='<div class="mui-card comment" id="commentItem">'+
			'评论'+j+'<br/>'+
			post.sendUser+':'+post.postContent+
		'</div>';
		
	return html;
}

var posts = new Vue({
	el: '#posts',
	data: {
		items: [] //列表信息流数据
	}
});

function convert(items) {
	var postItems = [];
	items.forEach(function(item) {
		postItems.push({
			//icon:item.user.icon,
			commentId:item.commentId,
			postContent:item.postContent,
			sendUser:item.sendUser.userId
		});
	});
	//console.log(postItems);
	return postItems;
}

//上拉(！！有问题，仍在修改中！！必须先下拉刷新才能正常显示上拉加载的功能)
function pullupRefresh() {
	head += 1;
	max = 1;
	var data = {
		start:0,
		max:max,//需要的字段名
		postId:postid,
	}
	mui.post(app.serverUrl + "/corner/getcomment", data, function(rsp) {
		rsp=rsp.data;
		posts.items = posts.items.concat(convert(rsp));
		console.log(posts.items.length);
		console.log(index);
		if(posts.items.length>parseInt(index)+1){
			lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用
			var list=document.getElementById("commentlist");
			var postHtml="";
			console.log(index);
			for(var i=index;i<posts.items.length;i++){
				var j=parseInt(i)+parseInt(1)
				postHtml+=addpost(posts.items[i],j);
				index++;
			}
			list.innerHTML+=postHtml;
		}
		/*if(rsp.data==""){
			mui('#comment').pullRefresh().endPullupToRefresh();
		}else{
			/*console.log(rsp.data[0].commentId);
			console.log(JSON.stringify(rsp.data));*/
			/*mui('#comment').pullRefresh().endPullupToRefresh();
			rsp=rsp.data;
			if(rsp && rsp.length > 0) {
				lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用
				//posts.items = convert(rsp);
				posts.items = posts.items.concat(convert(rsp));
				var list=document.getElementById("commentlist");
				var postHtml="";
				console.log(index);
				for(var i=index;i<posts.items.length;i++,index++){
					var j=parseInt(i)+parseInt(1)
					postHtml+=addpost(posts.items[i],j);
				}
				list.innerHTML+=postHtml;
			}
		}*/
	},'json');
	this.endPullupToRefresh(true);
}

//窗口隐藏时，重置页面数据
mui.plusReady(function () {
	
	var user = app.getUserGlobalInfo();
	var Webview=plus.webview.currentWebview();
	postid=Webview.postid;
	console.log(postid);
	nickname=Webview.nickname;
	content=Webview.content;
	date=Webview.date;
	postlike=Webview.postlike;
	/*postid=Webview.postid;
	console.log(postlike);*/

	
	
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
		success:function(data){
			if (data.status == 200) {
				console.log(JSON.stringify(data));
				if(data.data=="已经点赞"){
					like.innerHTML="已赞";
				}else if(data.data=="尚未点赞"){
					like.innerHTML="赞";
				}
	        }
	    	else{
	        	app.showToast(data.msg, "error");
	        }
	    }
	});
	
	
	like=document.getElementById("like");
	like.addEventListener('tap',function(){
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
			
		console.log("我改好了");
		mui.ajax(app.serverUrl+"/corner/getpost",{
			data:{
				postId:postid
			},
			dataType:'json',
			type:'POST',
			timeout:10000,
			contentType:'application/json;charset=utf-8',
			success:function(data){
				nickname=data.data.user.userId;
				date=new Date(data.data.postDate);
				content=data.data.postContent;
				postlike=data.data.postLike;
			}
		})
		
		
		document.getElementById("title").innerHTML=nickname;
		document.getElementById("time").innerHTML=date;
		document.getElementById("content").innerHTML=content;
		document.getElementById("postlike").innerHTML=postlike;
		console.log("postid"+postid);
		console.log(postlike);
		
		
	});
	
	var send=document.getElementById("send-btn");
	send.addEventListener('tap',function(){
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
	   	}
	   });
	   }
	});	
})
