export default {
	userId: '',
	url: 'ws://192.168.11.113:9099', // wss://im.yidap.com wss://webapi.yidapi.com.cn
	lockReconnect: false, // 是否真正建立连接
	timeoutObj: null, // 心跳心跳倒计时
	timeoutNum: null, // 断开 重连倒计时
	timeout: 30 * 1000, // 30秒一次心跳
	connectTime: 3000,
	localSocket: {},
	connentSocket: false,
	callback: function () { }
}