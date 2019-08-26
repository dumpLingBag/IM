<template>
	<view class="settings">
		<view class="setting">
			<view class="name">账户与安全</view>
			<image src="../../static/right.png" class="icon-right"></image>
		</view>
		<view class="setting-list">
			<view class="setting-info">
				<view class="name">隐私</view>
				<image src="../../static/right.png" class="icon-right"></image>
			</view>
			<view class="setting-info">
				<view class="name">通用</view>
				<image src="../../static/right.png" class="icon-right"></image>
			</view>
		</view>
		<view class="setting">
			<text class="middle" @click="showList = true">退出登录</text>
		</view>
		<view class="more-list" v-show="showList" @click="showList = false">
			<view class="bottom" :class="showList ? 'showList' : 'hideList'"><!-- :class="showList ? 'showList' : 'hideList'" -->
				<view class="top">
					<view class="line text">
						退出后不会删除任何历史纪录，下次登录依然可以使用本账号。
					</view>
					<view class="line" style="color: #FA5051;" @click.stop="loginOut">退出登录</view>
				</view>
				<view class="line last" @click.stop="showList = false">
					<text>取消</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showList: false
			}
		},
		onLoad() {
			
		},
		methods: {
			loginOut() {
				uni.showToast({
					title: '退出中...',
					icon: 'loading'
				})
				let that = this;
				uni.clearStorageSync('token')
				uni.reLaunch({
					url: '../login/info',
					success() { // 关闭连接
						clearTimeout(that.globalData.timeoutNum)
						clearTimeout(that.globalData.timeoutObj)
						that.globalData.localSocket.close()
						uni.$off('login')
						uni.hideToast()
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.settings {
		width: 100%;
		overflow: hidden;
		.setting-list {
			position: relative;
			background-color: #ffffff;
		}
		.setting,.setting-list {
			margin-top: 0.5rem;
		}
		.setting,.setting-info {
			width: 100%;
			height: 3.2rem;
			line-height: 3.2rem;
			display: flex;
			display: -webkit-flex;
			flex-direction: row;
			flex-wrap: nowrap;
			background-color: #FFFFFF;
			position: relative;
			.name {
				width: 100%;
				margin-left: 1rem;
			}
			.middle {
				width: 100%;
				text-align: center;
			}
		}
		.setting::after,.setting-list::after {
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
		.setting::before,.setting-list::before {
			content: " ";
			position: absolute;
			z-index: 3;
			top: -2upx;
			left: 0;
			width: 100%;
			height: 2upx;
			border-bottom: 2upx solid #D8D8D8;
			-webkit-transform-origin: 0 0;
			transform-origin: 0 0;
			-webkit-transform: scaleY(.5);
			transform: scaleY(.5)
		}
		.setting-info::after {
			content: " ";
			position: absolute;
			z-index: 3;
			bottom: -2upx;
			left: 1rem;
			width: 100%;
			height: 2upx;
			border-bottom: 2upx solid #D8D8D8;
			-webkit-transform-origin: 0 0;
			transform-origin: 0 0;
			-webkit-transform: scaleY(.5);
			transform: scaleY(.5)
		}
		.bottom {
			.text {
				text-align: center;
				font-size: 24upx;
				color: #888888;
				padding-left: 2rem;
				padding-right: 2rem;
				word-wrap: break-word;
				word-break: normal;
			}
		}
	}
</style>
