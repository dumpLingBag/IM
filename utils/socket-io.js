import global from './global.js'

function initSocket (userId) {
	if (global.connentSocket) {
		console.warn('连接已存在！');
		global.localSocket.close()
	}
	if (!userId || userId == '') {
		console.error('用户id为空连接失败！');
		return false
	}
	global.localSocket = wx.connectSocket({
		//此处 url 可以用来测试 // im.yidap.com webapi.yidapi.com.cn
		url: `${global.url}/notice/socket?userId=${userId}`,
		success: () => {
			global.userId = userId;
			global.connentSocket = true
		}
	})
	//版本库需要在 1.7.0 以上
	global.localSocket.onOpen(function (res) {
		console.log('socket 连接成功！')
		// 系统推送逻辑
		uni.$emit('login', true)
		global.connentSocket = true;
		startConnect();
		global.connectTime = 3000
	})
	global.localSocket.onError(function (res) {
		global.connentSocket = false;
		reconnect();
		global.connectTime = global.connectTime * 2
	})
	global.localSocket.onClose(function (res) {
		global.connentSocket = false
	})
	global.localSocket.onMessage(function (res) {
		// 用于在其他页面监听 websocket 返回的消息
		if (res && res.data) {
			try {
				let result = JSON.parse(res.data);
				console.log('收到消息 -> ', result)
				if (!result.length && !result.currentPage) {
					if (result.fromUserId && result.fromUserId != 0) {
						let message = { id: result.id, fromUserId: 0, toUserId: result.fromUserId, messageId: result.messageId, content: 'page', smsType: 'TEXT', sysType: 1, smsStatus: 40, smsList: false, currentPage: '', pageSize: '' };
						
						sendSocketMessage(JSON.stringify(message));
					}
				}
				global.callback(result);
				resetConnect()
			} catch(e) {
				//TODO handle the exception
				return false;
			}
		}
	})
}

function sendSocketMessage (msg) {
	return new Promise((resolve, reject) => {
		if (global.connentSocket) {
			console.log('发送消息', msg)
			global.localSocket.send({
				data: msg,
				success: function(res) {
					resolve(res)
				},
				fail: function(e) {
					reject(e)
				}
			})
		}
	})
}

function reconnect () {
	if (global.lockReconnect) {
		return false
	}
	global.lockReconnect = true;
	global.timeoutNum && clearTimeout(global.timeoutNum);
	global.timeoutNum = setTimeout(() => {
		if (global.userId && global.userId != '') {
			initSocket(global.userId);
			global.lockReconnect = false
		}
	}, global.connectTime)
}

function resetConnect () {
	clearTimeout(global.timeoutObj);
	startConnect()
}

function startConnect () {
	global.timeoutObj && clearTimeout(global.timeoutObj)
	global.timeoutObj = setTimeout(() => {
		if (global.connentSocket) {
			let message = { fromUserId: 0, toUserId: 0, content: 'ping'};
			sendSocketMessage(JSON.stringify(message))
		} else {
			reconnect()
		}
	}, global.timeout)
}

export default {
	initSocket
}