<template>
	<view>
		<view class="content" @touchstart="hideEmoji">
			<scroll-view class="msg-list" upper-threshold="30" scroll-y="true" :scroll-with-animation="scrollAnimation"
			 :scroll-top="scrollTop" @scrolltoupper="toupper" :scroll-into-view="scrollToView">
				 <view class="loding" v-if="nextPage && !toupperTop">
					 <image src="/static/img/loading.gif"></image>
				 </view>
				<view class="row" v-for="(row,index) in msgList" :key="index" :id="'msg'+index">
					<!-- 自己发出的消息 -->
					<view class="time" v-if="row.timeInterval && row.timeInterval != ''">{{row.timeInterval}}</view>
					<view class="my" v-if="row.fromUserId == fromUserId">
						<view class="left">
							<view v-if="row.smsType=='TEXT'" class="bubble">
								<rich-text :nodes="row.content"></rich-text>
							</view>
							<view v-if="row.smsType=='VOICE'" class="bubble voice" @tap="playVoice(row)" :class="playMsgid == row.id?'play':''">
								<view class="length">{{row.length}}</view>
								<view class="icon my-voice"></view>
							</view>
							<view v-if="row.smsType=='IMAGE'" class="bubble img" @tap="showPic(row)">
								<image :src="row.content" :style="{'width': row.width + 'px', 'height': row.height + 'px'}"></image>
							</view>
						</view>
						<view class="right">
							<image :src="fromAvatarPath"></image>
						</view>
					</view>
					<!-- 别人发出的消息 -->
					<view class="other" v-if="row.fromUserId != fromUserId">
						<view class="left">
							<image :src="toAvatarPath"></image>
						</view>
						<view class="right">
							<!-- <view class="username">
								<view class="name">{{row.username}}</view></view>
							</view> -->
							<view v-if="row.smsType=='TEXT'" class="bubble">
								<rich-text :nodes="row.content"></rich-text>
							</view>
							<view v-if="row.smsType=='VOICE'" class="bubble voice" @tap="playVoice(row)" :class="playMsgid == row.id?'play':''">
								<view class="icon other-voice"></view>
								<view class="length">{{row.length}}</view>
							</view>
							<view v-if="row.smsType=='IMAGE'" class="bubble img" @tap="showPic(row)">
								<image :src="row.content" :style="{'width': row.width + 'px', 'height': row.height + 'px'}"></image>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 表情栏 -->
		<view class="emoji-box" :class="showEmji" @touchmove.stop.prevent="discard">
			<swiper class="swiper" indicator-dots="true" duration="150">
				<swiper-item v-for="(page,pid) in emojiList" :key="pid">
					<view v-for="(em,eid) in page" :key="eid" @tap="addEmoji(em)">
						<image mode="widthFix" :src="'/static/img/emoji/'+em.url"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<!-- 底部输入栏 -->
		<view class="input-box" :class="showEmji" @touchmove.stop.prevent="discard">
			<!-- H5下不能录音，输入栏布局改动一下 -->
			<!-- #ifndef H5 -->
			<view class="voice">
				<view class="icon" :class="isVoice?'jianpan':'yuyin'" @tap="switchVoice"></view>
			</view>
			<!-- #endif -->
			<view class="textbox">
				<view class="voice-mode" :class="[isVoice?'':'hidden',recording?'recording':'']" @touchstart="voiceBegin" @touchmove.stop.prevent="voiceIng" @touchend="voiceEnd" @touchcancel="voiceCancel">{{voiceTis}}</view>
				<view class="text-mode"  :class="isVoice?'hidden':''">
					<view class="box">
						<!-- <textarea v-model="textMsg" auto-height="true" cursor-spacing="15" :show-confirm-bar="false" @confirm="sendText" id="textMsg" /> -->
						<input v-model="textMsg" confirm-type="send" :focus="msgFocus" confirm-hold="true" :cursor-spacing="spacing" @blur="sendBlur" @confirm="sendText" id="textMsg" />
					</view>
				</view>
			</view>
			<view class="em" @tap="chooseEmoji">
				<view class="icon" :class="showEmji == 'showEmoji' ? 'jianpan':'biaoqing'"></view>
			</view>
			<view class="more" @tap="chooseImage">
				<view class="icon tupian"></view>
			</view>
		</view>
	</view>
</template>

<script>
	import md5 from '../../utils/md5.js'
	import socket from '../../utils/socket-io.js'
	export default {
		data() {
			return {
				//文字消息
				textMsg:'',
				//消息列表
				scrollAnimation:false,
				scrollTop:0,
				scrollToView:'',
				msgList:[],
				hideMsgList:[],
				msgImgList:[],
				fromUserId:0,
				toUserId:0,
				toAvatarPath:'',
				fromAvatarPath: '',
				userInfoId:'',
				toupperTop:true,
				currentPage:1,
				nextPage:true,
				msgTotal:0,
				//录音相关参数
				// #ifndef H5
				//H5不能录音
				RECORDER:uni.getRecorderManager(),
				// #endif
				isVoice:false,
				voiceTis:'按住 说话',
				recordTis:"手指上滑 取消发送",
				recording:false,
				willStop:false,
				initPoint:{identifier:0,Y:0},
				recordTimer:null,
				recordLength:0,
				//播放语音相关参数
				AUDIO:uni.createInnerAudioContext(),
				playMsgid:null,
				VoiceTimer:null,
				//表情定义
				showEmji:'',
				emojiList:[
					[{"url":"100.gif",alt:"[微笑]"},{"url":"101.gif",alt:"[伤心]"},{"url":"102.gif",alt:"[美女]"},{"url":"103.gif",alt:"[发呆]"},{"url":"104.gif",alt:"[墨镜]"},{"url":"105.gif",alt:"[哭]"},{"url":"106.gif",alt:"[羞]"},{"url":"107.gif",alt:"[哑]"},{"url":"108.gif",alt:"[睡]"},{"url":"109.gif",alt:"[哭]"},{"url":"110.gif",alt:"[囧]"},{"url":"111.gif",alt:"[怒]"},{"url":"112.gif",alt:"[调皮]"},{"url":"113.gif",alt:"[笑]"},{"url":"114.gif",alt:"[惊讶]"},{"url":"115.gif",alt:"[难过]"},{"url":"116.gif",alt:"[酷]"},{"url":"117.gif",alt:"[汗]"},{"url":"118.gif",alt:"[抓狂]"},{"url":"119.gif",alt:"[吐]"},{"url":"120.gif",alt:"[笑]"},{"url":"121.gif",alt:"[快乐]"},{"url":"122.gif",alt:"[奇]"},{"url":"123.gif",alt:"[傲]"}],
					[{"url":"124.gif",alt:"[饿]"},{"url":"125.gif",alt:"[累]"},{"url":"126.gif",alt:"[吓]"},{"url":"127.gif",alt:"[汗]"},{"url":"128.gif",alt:"[高兴]"},{"url":"129.gif",alt:"[闲]"},{"url":"130.gif",alt:"[努力]"},{"url":"131.gif",alt:"[骂]"},{"url":"132.gif",alt:"[疑问]"},{"url":"133.gif",alt:"[秘密]"},{"url":"134.gif",alt:"[乱]"},{"url":"135.gif",alt:"[疯]"},{"url":"136.gif",alt:"[哀]"},{"url":"137.gif",alt:"[鬼]"},{"url":"138.gif",alt:"[打击]"},{"url":"139.gif",alt:"[bye]"},{"url":"140.gif",alt:"[汗]"},{"url":"141.gif",alt:"[抠]"},{"url":"142.gif",alt:"[鼓掌]"},{"url":"143.gif",alt:"[糟糕]"},{"url":"144.gif",alt:"[恶搞]"},{"url":"145.gif",alt:"[什么]"},{"url":"146.gif",alt:"[什么]"},{"url":"147.gif",alt:"[累]"}],
					[{"url":"148.gif",alt:"[看]"},{"url":"149.gif",alt:"[难过]"},{"url":"150.gif",alt:"[难过]"},{"url":"151.gif",alt:"[坏]"},{"url":"152.gif",alt:"[亲]"},{"url":"153.gif",alt:"[吓]"},{"url":"154.gif",alt:"[可怜]"},{"url":"155.gif",alt:"[刀]"},{"url":"156.gif",alt:"[水果]"},{"url":"157.gif",alt:"[酒]"},{"url":"158.gif",alt:"[篮球]"},{"url":"159.gif",alt:"[乒乓]"},{"url":"160.gif",alt:"[咖啡]"},{"url":"161.gif",alt:"[美食]"},{"url":"162.gif",alt:"[动物]"},{"url":"163.gif",alt:"[鲜花]"},{"url":"164.gif",alt:"[枯]"},{"url":"165.gif",alt:"[唇]"},{"url":"166.gif",alt:"[爱]"},{"url":"167.gif",alt:"[分手]"},{"url":"168.gif",alt:"[生日]"},{"url":"169.gif",alt:"[电]"},{"url":"170.gif",alt:"[炸弹]"},{"url":"171.gif",alt:"[刀子]"}],
					[{"url":"172.gif",alt:"[足球]"},{"url":"173.gif",alt:"[瓢虫]"},{"url":"174.gif",alt:"[翔]"},{"url":"175.gif",alt:"[月亮]"},{"url":"176.gif",alt:"[太阳]"},{"url":"177.gif",alt:"[礼物]"},{"url":"178.gif",alt:"[抱抱]"},{"url":"179.gif",alt:"[拇指]"},{"url":"180.gif",alt:"[贬低]"},{"url":"181.gif",alt:"[握手]"},{"url":"182.gif",alt:"[剪刀手]"},{"url":"183.gif",alt:"[抱拳]"},{"url":"184.gif",alt:"[勾引]"},{"url":"185.gif",alt:"[拳头]"},{"url":"186.gif",alt:"[小拇指]"},{"url":"187.gif",alt:"[拇指八]"},{"url":"188.gif",alt:"[食指]"},{"url":"189.gif",alt:"[ok]"},{"url":"190.gif",alt:"[情侣]"},{"url":"191.gif",alt:"[爱心]"},{"url":"192.gif",alt:"[蹦哒]"},{"url":"193.gif",alt:"[颤抖]"},{"url":"194.gif",alt:"[怄气]"},{"url":"195.gif",alt:"[跳舞]"}],
					[{"url":"196.gif",alt:"[发呆]"},{"url":"197.gif",alt:"[背着]"},{"url":"198.gif",alt:"[伸手]"},{"url":"199.gif",alt:"[耍帅]"},{"url":"200.png",alt:"[微笑]"},{"url":"201.png",alt:"[生病]"},{"url":"202.png",alt:"[哭泣]"},{"url":"203.png",alt:"[吐舌]"},{"url":"204.png",alt:"[迷糊]"},{"url":"205.png",alt:"[瞪眼]"},{"url":"206.png",alt:"[恐怖]"},{"url":"207.png",alt:"[忧愁]"},{"url":"208.png",alt:"[眨眉]"},{"url":"209.png",alt:"[闭眼]"},{"url":"210.png",alt:"[鄙视]"},{"url":"211.png",alt:"[阴暗]"},{"url":"212.png",alt:"[小鬼]"},{"url":"213.png",alt:"[礼物]"},{"url":"214.png",alt:"[拜佛]"},{"url":"215.png",alt:"[力量]"},{"url":"216.png",alt:"[金钱]"},{"url":"217.png",alt:"[蛋糕]"},{"url":"218.png",alt:"[彩带]"},{"url":"219.png",alt:"[礼物]"},]				
				]
			}
		},
		onLoad(option) {
			uni.setNavigationBarTitle({
				title: option.name,
			});
			this.fromUserId = option.fromUserId;
			this.toUserId = option.toUserId;
			this.fromAvatarPath = uni.getStorageSync('fromAvatarPath') || 'https://ossyidap.oss-cn-shenzhen.aliyuncs.com/image/png/9EAFE4BFEFDDF762718332C8F1BE9F2C.png';
			this.toAvatarPath = uni.getStorageSync('toAvatarPath') || 'https://ossyidap.oss-cn-shenzhen.aliyuncs.com/image/png/9EAFE4BFEFDDF762718332C8F1BE9F2C.png';
			this.userInfoId =  parseInt(this.fromUserId) > parseInt(this.toUserId) ? md5.md5(this.toUserId + this.fromUserId) : md5.md5(this.fromUserId + this.toUserId);
			if (this.globalData.connentSocket) {
				let message = {
					fromUserId: this.fromUserId,
					toUserId: this.toUserId,
					content: 'page',
					smsType: 'TEXT',
					sysType: 1,
					smsStatus: 10,
					smsList: false,
					currentPage: 1,
					pageSize: 15
				}
				this.globalData.localSocket.send({
					data: JSON.stringify(message)
				})
			}
			//语音自然播放结束
			this.AUDIO.onEnded((res)=>{
				this.playMsgid=null;
			});
			// #ifndef H5
			//录音开始事件
			this.RECORDER.onStart((e)=>{
				this.recordBegin(e);
			})
			//录音结束事件
			this.RECORDER.onStop((e)=>{
				this.recordEnd(e);
			})
			// #endif
		},
		onShow() {
			let that = this;
			this.globalData.callback = function (res) {
				if (String(res.userInfoId) == '0' || res.fromUserId == 0) {
					return;
				}
				if (res && res.list) {
					that.nextPage = res.totalPage != that.currentPage;
					let result = res.list;
					if (result.length > 0) {
						for (let i = 0; i < result.length; i++) {
							if (result[i].smsType == 'IMAGE') {
								result[i] = that.setPicSize(result[i])
							}
						}
						that.msgList = result.concat(that.msgList)
						
						that.$nextTick(function () {
							if (that.currentPage == 1) {
								// 滚动到底部
								that.scrollTop = 99999;
							} else {
								if (that.nextPage) {
									uni.createSelectorQuery()
										.select('#msg' + (15 + that.msgTotal))
										.boundingClientRect()
										.exec(res => {
											if (res[0] != null) {
												that.scrollTop = res[0].top;
												that.toupperTop = true
											}
										})
								}
							}
						})
					}
				} else {
					if (res.userInfoId == that.userInfoId) {
						let index = that.msgList.push(res);
						that.toView(index)
					} else {
						that.$emit('chatList', true)
					}
				}
			}
		},
		methods: {
			toupper(){
				let that = this;
				if (that.nextPage && that.toupperTop) {
					that.toupperTop = false;
					that.currentPage = that.currentPage + 1
					let message = {
						fromUserId: that.fromUserId,
						toUserId: that.toUserId,
						content: 'page',
						smsType: 'TEXT',
						sysType: 1,
						smsStatus: 10,
						smsList: false,
						currentPage: that.currentPage,
						pageSize: 15
					}
					that.globalData.localSocket.send({
						data: JSON.stringify(message)
					})
				}
			},
			//处理图片尺寸，如果不处理宽高，新进入页面加载图片时候会闪
			setPicSize(row){
				let maxW = uni.upx2px(350);
				let maxH = uni.upx2px(350);
				if(row.width > maxW || row.height > maxH) {
					let scale = row.width / row.height;
					if(row.width > row.height) {
						row.width = maxW;
						row.height = row.width / scale
					} else {
						row.height = maxH;
						row.width = row.height * scale;
					}
				}
				return row;
			},
			// 选择表情
			chooseEmoji(){
				this.showEmji = this.showEmji=='showEmoji'?'hideEmoji':'showEmoji';
			},
			// 隐藏表情
			hideEmoji(){
				this.showEmji = this.showEmji=='showEmoji'?'hideEmoji':'';
			},
			//添加表情
			addEmoji(em){
				this.textMsg+=em.alt;
			},
			// 预览图片
			showPic(row){
				var src = row.content; //获取data-src
				let index = src.indexOf('?')
				if (index != -1) {
					src = src.substring(0, index) + '?x-oss-process=style/big'
				}
				uni.previewImage({
					indicator: "none",
					current: src,
					urls: [src]
				});
			},
			// 播放语音
			playVoice(msg){
				this.playMsgid=msg.id;
				this.AUDIO.src = msg.msg.url;
				console.log("msg.msg.url: " + msg.msg.url);
                this.AUDIO.play();
			},
			// 录音开始
			voiceBegin(e){
				if(e.touches.length>1){
					return ;
				}
				this.initPoint.Y = e.touches[0].clientY;
				this.initPoint.identifier = e.touches[0].identifier;
				this.RECORDER.start({format:"aac"});//录音开始,
			},
			//录音开始UI效果
			recordBegin(e){
				this.recording = true;
				this.voiceTis='松开 结束';
				this.recordLength = 0;
				this.recordTimer = setInterval(()=>{
					this.recordLength++;
				},1000)
			},
			// 录音被打断
			voiceCancel(){
				this.recording = false;
				this.voiceTis='按住 说话';
				this.recordTis = '手指上滑 取消发送'
				this.willStop = true;//不发送录音
				this.RECORDER.stop();//录音结束
			},
			// 录音中(判断是否触发上滑取消发送)
			voiceIng(e){
				if(!this.recording){
					return;
				}
				let touche = e.touches[0];
				//上滑一个导航栏的高度触发上滑取消发送
				if(this.initPoint.Y - touche.clientY>=uni.upx2px(100)){
					this.willStop = true;
					this.recordTis = '松开手指 取消发送'
				}else{
					this.willStop = false;
					this.recordTis = '手指上滑 取消发送'
				}
			},
			// 结束录音
			voiceEnd(e){
				if(!this.recording){
					return;
				}
				this.recording = false;
				this.voiceTis='按住 说话';
				this.recordTis = '手指上滑 取消发送'
				this.RECORDER.stop();//录音结束
			},
			
			//录音结束(回调文件)
			recordEnd(e){
				clearInterval(this.recordTimer);
				if(!this.willStop){
					plus.io.resolveLocalFileSystemURL( e.tempFilePath, function( entry ) {
						// 可通过entry对象操作test.html文件 
						entry.file( function(file){
							console.log(file.size + '--' + file.name);
						} );
					}, function ( e ) {
						alert( "Resolve file URL failed: " + e.message );
					} );
					console.log("e: " + JSON.stringify(e));
					let msg = {
						length:0,
						url:e.tempFilePath
					}
					let min = parseInt(this.recordLength/60);
					let sec = this.recordLength%60;
					min = min<10?'0'+min:min;
					sec = sec<10?'0'+sec:sec;
					msg.length = min+':'+sec;
					this.sendMsg(msg,'voice');
				}else{
					console.log('取消发送录音');
				}
				this.willStop = false;
			},
			// 切换语音/文字输入
			switchVoice(){
				this.hideEmoji();
				this.isVoice = this.isVoice?false:true;
			},
			sendText(e){
				//this.hideEmoji();
				let that = this;
				let content = e.detail.value ? e.detail.value : that.textMsg
				if (!content || content == '') {
					return
				}
				let message = {
					fromUserId: that.fromUserId,
					toUserId: that.toUserId,
					content: content,
					smsType: 'TEXT',
					sysType: 1,
					smsStatus: 10,
					smsList: false,
					currentPage: '',
					pageSize: ''
				}
				
				this.globalData.localSocket.send({
					data: JSON.stringify(message),
					success: () => {
						let index = that.msgList.push(message);
						that.toView(index);
						that.textMsg = '';
						that.msgTotal = that.msgTotal + 1;
						message.dateTime = that.getTime();
						uni.$emit('message', message)
					},
					fail: () => {
						console.log('发送失败！！！')
					}
				})
			},
			// 选择图片发送
			chooseImage(){
				this.hideEmoji();
				let that = this;
				uni.chooseImage({
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					success: (res)=>{
						uni.showLoading({
							title: '发送中',
							mask: false
						});
						let tempFilePaths = res.tempFilePaths;
						for (let index in tempFilePaths) {
							uni.getImageInfo({
								src: tempFilePaths[index],
								success: (image)=>{
									let message = {
										fromUserId: that.fromUserId,
										toUserId: that.toUserId,
										content: image.path,
										smsType: 'IMAGE',
										sysType: 1,
										smsStatus: 10,
										smsList: false,
										currentPage: '',
										pageSize: '',
										width: image.width,
										height: image.height
									}
									that.upload(message)
								}
							});
						}
					}
				});
			},
			upload(message) {
				let that = this;
				const token = uni.getStorageSync('token');
				let uploadTask = uni.uploadFile({
					url: `https://webapi.yidapi.com.cn/app/common/upload`,
					filePath: message.content,
					name: 'file',
					header: {
						'token': `${token}`
					},
					success: (res) => {
						var result = JSON.parse(res.data);
						if (result.code == 200 || result.code == 0 ) {
							message.content = result.data;
							that.globalData.localSocket.send({
								data: JSON.stringify(message),
								success: () => {
									message = that.setPicSize(message)
									let index = that.msgList.push(message);
									that.toView(index);
									that.msgTotal = that.msgTotal + 1;
									message.dateTime = that.getTime();
									that.$emit('message', message)
								}
							})
						}
					},
					complete: () => {
						uni.hideLoading()
					}
				})
			},
			toView(index) {
				let that = this;
				this.$nextTick(function(){
					that.scrollToView = 'msg' + (index - 1)
				})
			},
			sendBlur(event) {
				let that = this;
				// #ifdef H5
				this.$nextTick(function(){
					window.scrollTo(0,0)
				})
				// #endif
			},
			getTime() {
				let date = new Date();
				return date.getHours() + ':' + date.getMinutes();
			},
			discard(){
				return;
			}
		}
	}
</script>

<style lang="scss">
::-webkit-scrollbar
{
width: 6upx;
height: 6upx;
background-color: transparent;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track
{
-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
border-radius: 12upx;
background-color: transparent;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
border-radius: 12px;
-webkit-box-shadow: inset 0 0 6upx rgba(0,0,0,.1);
background-color: rgba(0,0,0,.1);
}

@font-face {font-family:"HMfont-home";src:url('data:application/x-font-woff2;charset=utf-8;base64,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') format('woff2');}
	.icon {
		font-family:"HMfont-home" !important;
		font-size:56upx;
		font-style:normal;
		color: #333;
		&.biaoqing:before {
		  content: "\e797";
		}
		&.jianpan:before {
		  content: "\e7b2";
		}
		&.yuyin:before {
		  content: "\e805";
		}
		&.tupian:before {
		  content: "\e639";
		}
		&.chehui:before {
		  content: "\e904";
		}
		&.luyin:before {
		  content: "\e905";
		}
		&.luyin2:before {
		  content: "\e677";
		}
		&.other-voice:before {
		  content: "\e667";
		}
		&.my-voice:before {
		  content: "\e906";
		}
	}
.hidden{
	display: none !important;
}
@keyframes showEM {
	0% {transform: translateY(0);}
	100% {transform: translateY(-42vw);}
}
@keyframes hideEM {
	0% {transform: translateY(-42vw);}
	100% {transform: translateY(0);}
}
.emoji-box{
	&.hideEmoji{animation: hideEM .15s linear both;}
	&.showEmoji{animation: showEM .15s linear both;}
	width: 96%;
	height: 42vw;
	padding: 20upx 2%;
	background-color: #f3f3f3;
	border-top: solid 1upx #ddd;
	position: fixed;
	z-index: 20;
	top: 100%;
	.swiper{
		swiper-item{
			display: flex;
			flex-wrap: wrap;
			view{
				width: 12vw;
				height: 12vw;
				display: flex;
				justify-content: center;
				image{
					width: 60%;
				}
			}
		}
	}
}
.input-box{
	&.hideEmoji{animation: hideEM .15s linear both;}
	&.showEmoji{animation: showEM .15s linear both;}
	width: 98%;
	min-height: 100upx;
	padding: 0 1%;
	background-color: #f2f2f2;
	display: flex;
	position: fixed;
	z-index: 9999;
	bottom: 0;
	.voice,.em,.more{
		flex-shrink: 0;
		width: 90upx;
		height: 100upx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.send{
		//H5发送按钮左边距
		/* #ifdef H5 */
		margin-left: 20upx;
		/* #endif */
		flex-shrink: 0;
		width: 100upx;
		height: 100upx;
		display: flex;
		align-items: center;
		.btn{
			width: 90upx;
			height: 56upx;
			display: flex;
			justify-content: center;
			align-items: center;
			background:linear-gradient(to right,#f09b37,#eb632c);
			color: #fff;
			border-radius: 6upx;
			font-size: 24upx;
		}
	}
	.textbox{
		width: 100%;
		min-height: 70upx;
		.voice-mode{
			width: 100%;
			height: 70upx;
			border-radius: 40upx;
			/* border:solid 1upx #fff; */
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 28upx;
			background-color: #fff;
			color: #555;
			margin: 15upx 0;
			&.recording{
				background-color: #e5e5e5;
			}
		}
		.text-mode{
			width: 100%;
			min-height: 70upx;
			display: flex;
			background-color: #fff;
			border-radius: 40upx;
			margin: 15upx 0;
			.box{
				width: 100%;
				padding-left: 30upx;
				padding-right: 30upx;
				min-height: 70upx;
				display: flex;
				align-items: center;
				textarea{
					width: 100%;
				}
			}
			/* .em{
				flex-shrink: 0;
				width: 80upx;
				height: 70upx;
				display: flex;
				justify-content: center;
				align-items: center;
			} */
		}
	}
}
.record{
	width: 40vw;
	height: 40vw;
	position: fixed;
	top: 55%;
	left: 30%;
	background-color: rgba(0,0,0,.6);
	border-radius: 20upx;
	.ing{
		width: 100%;
		height: 30vw;
		display: flex;
		justify-content: center;
		align-items: center;
		@keyframes volatility {
			0% {background-position: 0% 130%;}
			20% {background-position: 0% 150%;}
			30% {background-position: 0% 155%;}
			40% {background-position: 0% 150%;}
			50% {background-position: 0% 145%;}
			70% {background-position: 0% 150%;}
			80% {background-position: 0% 155%;}
			90% {background-position: 0% 140%;}
			100% {background-position: 0% 135%;}
		}
		.icon{
			background-image:linear-gradient(to bottom,#f09b37,#fff 50%); 
			background-size:100% 200%;
			animation: volatility 1.5s ease-in-out -1.5s infinite alternate;
			-webkit-background-clip:text; 
			-webkit-text-fill-color:transparent; 
			font-size: 150upx;
			color: #f09b37;
		}
	}
	.cancel{
		width: 100%;
		height: 30vw;
		display: flex;
		justify-content: center;
		align-items: center;
		.icon{
			color: #fff;
			font-size: 150upx;
		}
	}
	.tis{
		width: 100%;
		height: 10vw;
		display: flex;
		justify-content: center;
		font-size: 28upx;
		color: #fff;
		&.change{
			color: #f09b37;
		}
	}
}
.content{
	width: 100%;
	.loding{
		text-align: center;
		padding: 20upx 0 30upx 0;
		image{
			width: 36upx;
			height: 36upx;
		}
	}
	.msg-list{
		width: 100%;
		position: absolute;
		top: 0;
		bottom: 100upx;
		.row{
			/* &:first-child{
				margin-top: 20upx;
			} */
			padding: 20upx 2%;
			.time{
				font-size: 24upx;
				color: #999;
				text-align: center;
				margin-bottom: 30upx;
			}
			.my .left,.other .right{
				width: 100%;
				display: flex;
				.bubble{
					max-width: 70%;
					min-height: 50upx;
					border-radius: 10upx;
					padding: 15upx 20upx;
					display: flex;
					align-items: center;
					font-size: 32upx;
					word-break: break-word;
					&.img{
						background-color: transparent;
						padding:0;
						overflow: hidden;
						image{
							max-width: 350upx;
							max-height: 350upx;
						}
					}
					&.voice{
						.icon{
							font-size: 40upx;
							display: flex;
							align-items: center;
						}
						.icon:after
						{
							content:" ";
							width: 53upx;
							height: 53upx;
							border-radius: 100%;
							position: absolute;
							box-sizing: border-box;
						}
						.length{
							font-size: 28upx;
						}
					}
				}
			}
			.my .right,.other .left{
				flex-shrink: 0;
				width: 80upx;
				height: 80upx;
				image{
					width: 80upx;
					height: 80upx;
					border-radius: 10upx;
				}
			}
			.my{
				width: 100%;
				display: flex;
				justify-content: flex-end;
				.left{
					min-height: 80upx;
					
					align-items: center;
					justify-content: flex-end;
					.bubble{
						/* background-color: #f06c7a; */
						background-color: #ff65a3;
						color: #fff;
						&.voice{
							.icon{
								color: #fff;
							}
							.length{
								margin-right: 20upx;
							}
						}
						&.play{
							@keyframes my-play {
								0% {
									transform: translateX(80%);
								}
								100% {
									transform: translateX(0%);
								}
							}
							.icon:after
							{
								border-left: solid 10upx rgba(240,108,122,.5);
								animation: my-play 1s linear infinite;
							}
						}
					}
				}
				.right{
					margin-left: 15upx;
				}
			}
			.other{
				width: 100%;
				display: flex;
				.left{
					margin-right: 15upx;
				}
				.right{
					flex-wrap: wrap;
					.username{
						width: 100%;
						height: 45upx;
						font-size: 24upx;
						color: #999;
						display: flex;
						.name{
							margin-right: 50upx;
						}
					}
					.bubble{
						background-color: #fff;
						color: #333;
						&.voice{
							.icon{
								color: #333;
								
							}
							.length{
								margin-left: 20upx;
							}
						}
						&.play{
							@keyframes other-play {
								0% {
									transform: translateX(-80%);
								}
								100% {
									transform: translateX(0%);
								}
							}
							.icon:after
							{
								border-right: solid 10upx rgba(255,255,255,.8);
								
								animation: other-play 1s linear infinite;
							}
						}
					}
				}
			}
		}
	}
}
</style>
