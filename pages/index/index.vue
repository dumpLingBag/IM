<template>
	<view class="index" v-bind:style="[{'min-height': secondHeight + 'px' }]">
		<view class="search">
			<input placeholder="搜索" confirm-type="search" @confirm="search" />
		</view>
		<!-- 数据列表 -->
		<view class="list-box">
			<view class="container_of_slide" v-for="(item,index) in list" :key="index">
				<view class="slide_list" @touchstart="touchStart($event,index)" @touchend="touchEnd($event,index)" @touchmove="touchMove($event,index)"
				 @tap="recover(item, index)" :style="{transform:'translate3d('+item.slide_x+'px, 0, 0)'}">
					<view class="now-message-info" hover-class="uni-list-cell-hover" :style="{width:Screen_width+'px'}">
						<view class="icon-circle"><image :src="item.toAvatarPath"></image></view>
						<view class="list-right">
							<view class="top">
								<view class="username">{{item.nickName || item.userName}}</view>
								<view class="time">{{item.userMessage.dateTime}}</view>
							</view>
							<view class="bottom">
								<view class="msg">{{item.userMessage.smsType == 'TEXT' ? item.userMessage.content : '[图片]'}}</view>
								<view class="tis" v-if="item.unRead>0">{{item.unRead > 99 ? '99..' : item.unRead}}</view>
							</view>
						</view>
					</view>
					<view class="group-btn">
						<view class="top btn-div" @tap="top(item.id)" v-if="item.isShare">
							分享
						</view>
						<view class="removeM btn-div" @tap="removeM(index, item.id)">
							删除
						</view>
					</view>
					<view style="clear:both"></view>
				</view>
			</view>
		</view>
		<!-- 分享弹窗 -->
		<view mode="top-right" class="scan-box" v-if="visible">
			<view class="scan-item">
				<view class="scan-content">
					<view class="scan-icon">
						<image src="../../static/slide-list/icon-scan.png" class="scan-icon-img"></image>
					</view>
					<image src="../../static/slide-list/fork.png" class="scan-btn" @click="cancelEvent"></image>
					<image :src="img" class="scan-img"></image>
					<view class="scan-text">
						扫一扫查看分享信息
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import socket from '../../utils/socket-io.js'
	export default {
		computed: {
			Screen_width() {
				return uni.getSystemInfoSync().windowWidth;
			}
		},
		data() {
			return {
				img: '../../static/slide-list/qr_code.png',
				visible: false,
				start_slide_x: 0,
				btnWidth: 0,
				startX: 0,
				LastX: 0,
				startTime: 0,
				screenName: '',
				list : [],
				btuBottom: '0',
				secondHeight: '',
				index: -1,
				fromUserId: this.globalData.userId
			};
		},
		onLoad(option) {
			if (this.globalData.connentSocket) {
				this.onSend()
			}
			uni.setTabBarBadge({
				index: 0,
				text: '99',
				success() {
					console.log('设置成功')
				}
			})
		},
		onShow() {
			let that = this;
			const res = uni.getSystemInfoSync();
			// 计算主体部分高度,单位为px
			this.secondHeight = res.windowHeight;
			// 接收消息
			this.globalData.callback = function (res) {
				if (res && res.length > 0) {
					for (let value in res) {
						res[value].slide_x = 0
					}
					that.list = res;
				} else {
					if (res.fromUserId != 0) {
						let key = that.list.findIndex((value, index) => {
							return value.userInfoId == res.userInfoId
						})
						if (key != -1) {
							that.list[key].userMessage = res
							that.list[key].unRead++;
						} else {
							that.onSend()
						}
					}
				}
			};
			uni.$on('message', function(data) {
				that.list[that.index].userMessage = data
			});
			uni.$on('chatList', function(data) {
				if (data) {
					that.onSend()
				}
			})
		},
		onUnload() {
			uni.$off()
		},
		methods: {
			onSend() {
				let message = {
					fromUserId: this.fromUserId,
					toUserId: '',
					content: 'page',
					smsType: 'TEXT',
					sysType: 1,
					smsStatus: 10,
					smsList: true,
					currentPage: '',
					pageSize: ''
				}
				this.globalData.localSocket.send({
					data: JSON.stringify(message)
				})
			},
			cancelEvent(){
				this.visible = false
			},
			search(e) {
				
			},
			// 滑动开始
			touchStart(e, index) {
				//记录手指放上去的时间
				this.startTime = e.timeStamp;
				//记录滑块的初始位置
				this.start_slide_x = this.list[index].slide_x;
				// 按钮宽度
				uni.createSelectorQuery()
					.selectAll('.group-btn')
					.boundingClientRect()
					.exec(res => {
						if (res[0] != null) {
							this.btnWidth = res[0][index].width * -1;
						}
					});
				// 记录上一次开始时手指所处位置
				this.startX = e.touches[0].pageX;
				// 记录上一次手指位置
				this.lastX = this.startX;
				//初始化非当前滑动消息列的位置
				this.list.forEach((item, eq) => {
					if (eq !== index) {
						item.slide_x = 0;
					}
				});
			},
			// 滑动中
			touchMove(e, index) {
				const endX = e.touches[0].pageX;
				const distance = endX - this.lastX;
				// 预测滑块所处位置
				const duang = this.list[index].slide_x + distance;
				// 如果在可行区域内
				if (duang <= 0 && duang >= this.btnWidth) {
					this.list[index].slide_x = duang;
				}
				// 此处手指所处位置将成为下次手指移动时的上一次位置
				this.lastX = endX;
			},
			// 滑动结束
			touchEnd(e, index) {
				let distance = 10;
				const endTime = e.timeStamp;
				const x_end_distance = this.startX - this.lastX;
				if (Math.abs(endTime - this.startTime) > 200) {
					distance = this.btnWidth / -2;
				}
				// 判断手指最终位置与手指开始位置的位置差距
				if (x_end_distance > distance) {
					this.list[index].slide_x = this.btnWidth;
				} else if (x_end_distance < distance * -1) {
					this.list[index].slide_x = 0;
				} else {
					this.list[index].slide_x = this.start_slide_x;
				}
			},
			// 点击回复原状
			recover(item, index) {
				this.index = index
				if (item.slide_x && item.slide_x != 0) {
					this.list[index].slide_x = 0
				} else {
					this.list[index].unRead = 0;
					uni.setStorageSync('toAvatarPath', item.toAvatarPath);
					uni.setStorageSync('fromAvatarPath', item.fromAvatarPath);
					uni.navigateTo({
						url: `../chat/chat?name=${item.nickName}&fromUserId=${this.fromUserId}&toUserId=${item.toUserId}`
					})
				}
			},
			// 分享
			top(id) {
				console.log('点击分享')
				if(this.visible){
					this.visible = false
				}else{
					this.visible = true
				}
			},
			// 删除
			removeM(index, id) {
				let self = this
				uni.showModal({
					title: '',
					content: '确定要删除该信息吗？',
					confirmText: '删除',
					confirmColor: '#ff3b32',
					success: function (res) {
						if (res.confirm) {
							self.list.splice(index, 1)
							uni.showToast({
								icon: "success",
								title: '操作成功!',
								duration: 2000
							});
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss">
	.search {
		padding: 3% 2.5%;
		position: relative;
		input {
			border-radius: 0.3rem;
			height: 2.3rem;
			line-height: 2.3rem;
			text-align: center;
			background-color: #FFFFFF;
			border: 1upx solid #E5E5E5;
			position: relative;
		}
	}
	.search::after {
		content: " ";
		position: absolute;
		z-index: 3;
		bottom: -2upx;
		left: 0;
		width: 100%;
		height: 2upx;
		border-bottom: 2upx solid #D8D8D8;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5)
	}
	.container_of_slide {
		width: 100%;
		overflow: hidden;
	}
	.slide_list {
		transition: all 100ms;
		transition-timing-function: ease-out;
		min-width: 200%;
		height: 140upx;
	}
	.slide_list:before {
		content: " ";
		position: absolute;
		z-index: 3;
		left: 160upx;
		bottom: -1px;
		width: 100%;
		height: 1px;
		border-bottom: 1px solid #D9D9D9;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5)
	}
	.container_of_slide:last-child .slide_list:before{
		left: 0;
	}
	.now-message-info {
		box-sizing:border-box;
		display: flex;
		align-items: center;
		font-size: 16px;
		clear:both;
		height: 140upx;
		padding: 0 30upx;
	}
	.now-message-info,.group-btn {
		float: left;
	}

	.group-btn {
		display: flex;
		flex-direction: row;
		height: 140upx;
		min-width: 100upx;
		align-items: center;

	}

	.group-btn .btn-div {
		height: 140upx;
		color: #fff;
		text-align: center;
		padding: 0 50upx;
		font-size: 34upx;
		line-height: 140upx;
	}

	.group-btn .top {
		background-color: #c4c7cd;
	}

	.group-btn .removeM {
		background-color: #ff3b32;
	}

	.icon-circle {
		width:100upx;
		height: 100upx;
		line-height:100upx;
		text-align:center;
		color: #FFFFFF;
		font-weight: bold;
		font-size: 20px;
		float: left;
	}
	.icon-circle image{
		width:100upx;
		height:100upx;
		-webkit-border-radius:20upx;
		border-radius:12upx;
	}
	.list-right {
		flex-shrink:1;
		width:98%;
		padding:6upx 0 6upx 5%;
	}
	.list-right .top {
		width: 100%;
		display: flex;
		margin-bottom: 10upx;
		justify-content: space-between;
		align-items: flex-end;
	}
	.list-right .top .username {
		font-size: 30upx;
		font-weight: 400;
	}
	.list-right .top .time {
		font-size: 25upx;
		color: #bebebe;
	}
	.list-right .bottom {
		width: 100%;
		height: 40upx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.list-right .bottom .msg {
		width: 90%;
		font-size: 25upx;
		color: #777;
		display:-webkit-box;
		-webkit-box-orient:vertical;
		-webkit-line-clamp:1;
		overflow:hidden;
		margin-right: 30upx;
	}
	.list-right .bottom .tis {
		padding: 3upx 12upx;
		font-size: 22upx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #eb4d3d;
		color: #fff;
		border-radius: 6upx;
	}
	.button-box{
		box-sizing: border-box;
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		z-index: 998;
		background: #F8F8F8;
	}
	.btn-sub{
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		-webkit-box-pack: center;
		-webkit-justify-content: center;
		justify-content: center;
		-webkit-box-align: center;
		-webkit-align-items: center;
		align-items: center;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		float: left;
		width: 100%;
		height: 100upx;
		background: #F8F8F8;
		color: #7fb2ff;
	}
	.btn-plusempty{
		width: 110upx;
		height: 110upx;
		background: #007bfa;
		position: fixed;
		bottom: 50upx;
		right: 20upx;
		border-radius: 100%;
		overflow: hidden;
		text-align: center;
		line-height: 110upx;
	}
	.empty{
		color: #999999;
	}
	.plusempty-img{
		width: 50upx;
		height: 50upx;
		margin-top: 30upx;
	}
	.scan-box{
		display:block;
		position:fixed;
		top:0;
		bottom:0;
		left:0;
		right:0;
		background-color:rgba(0, 0, 0, 0.3);
		z-index:99999;
	}
	.scan-item{
		display:-webkit-box;
		display:-webkit-flex;
		display:-ms-flexbox;
		display:flex;
		position:relative;
		margin:0 auto;
		width:80%;
		height:100%;
		-webkit-box-pack:center;
		-webkit-justify-content:center;
		-ms-flex-pack:center;
		justify-content:center;
		-webkit-box-align:center;
		-webkit-align-items:center;
		-ms-flex-align:center;
		align-items:center;
		-webkit-box-sizing:border-box;
		box-sizing:border-box;
		opacity:1;

	}
	.scan-content{
		position:relative;
		width: 400upx;
		height: 500upx;
		background: #FFFFFF;
		border-radius: 20upx;
	}
	.scan-icon{
		position: absolute;
		top: -50upx;
		left: 150upx;
		width: 100upx;
		height: 100upx;
		border-radius: 100%;
		box-sizing:border-box;
		background: #FFFFFF;
		padding: 20upx;
	}
	.scan-icon-img{
		width: 100%;
		height: 100%;
	}
	.scan-text{
		position: absolute;
		bottom: 40upx;
		left: 0;
		width: 100%;
		text-align: center;
		font-size: 14px;
	}
	.scan-share{
		width: 100%;
		height: 100%;
	}
	.scan-img{
		width: 300upx;
		height: 300upx;
		margin: auto;
		display: block;
		position: absolute;
		top: 80upx;
		left: 50upx;
		z-index: 99;
	}
	.scan-btn{
		top:-30upx;
		left:auto;
		right:-30upx;
		bottom:auto;
		position:absolute;
		width:64upx;
		height:64upx;
		border-radius:50%;
		z-index:99999;
		display: flex;
	}
	.uni-list-cell-hover {
		background-color: #eeeeee;
	}
	.bottom-btn-hover{
		background: #0564c7!important;;
	}
</style>
