<template>
	<view class="main">
		<view class="swiper">
			<view class="account-login">
				<text class="login-title">账号密码登录</text>
				<view class="login-form">
					<view class="username line">
						<view class="left">账号</view>
						<input class="right" @input="inputUserName" confirm-hold="true" @confirm="nextInput" placeholder="请填写账号" />
					</view>
					<view class="password line">
						<view class="left">密码</view>
						<input class="right" @input="inputPassword" @confirm="login" confirm-type="go" password="true" placeholder="请填写密码" />
					</view>
				</view>
			</view>
		</view>
		<view class="middle">
			<text class="switch" @click="switchType">用手机号码登录</text>
			<button hover-class="none" @click="login" plain="true" :disabled="username == '' || password == ''">登录</button>
		</view>
		<view class="bottom-more">
			<view class="more">找回密码</view>
			<view class="more mid">丨</view>
			<view class="more" @click="showList = true">更多选项</view>
		</view>
		<view class="more-list" v-show="showList" @click="showList = false">
			<view class="bottom" :class="showList ? 'showList' : 'hideList'">
				<view class="top">
					<view class="line" @click.stop="register">注册</view>
					<view class="line" @click.stop="goHome">前往官网</view>
				</view>
				<view class="line last" @click.stop="showList = false">
					<text>取消</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import socket from '../../utils/socket-io.js'
	export default {
		data() {
			return {
				username: '',
				password: '',
				showList: false,
				psd: false
			}
		},
		onLoad() {
			uni.$on('login', function(data) {
				if (data) {
					uni.reLaunch({
						url: '/pages/index/index',
						success: () => {
							uni.hideToast()
						}
					})
				}
			})
		},
		onUnload() {
			uni.$off('login')
		},
		methods: {
			inputUserName(e) {
				this.username = e.detail.value
			},
			inputPassword(e) {
				this.password = e.detail.value
			},
			nextInput() {
				this.psd = true
			},
			login() {
				if (this.username == '') {
					uni.showModal({
						showCancel: false,
						content: '请填写账号',
						title: '提示'
					})
					return;
				}
				if (this.password == '') {
					uni.showModal({
						showCancel: false,
						content: '请填写密码',
						title: '提示'
					})
					return;
				}
				uni.showToast({title: '请稍候...', icon: 'loading'})
				socket.initSocket(1278)
			},
			switchType() {
				uni.navigateTo({
					url: 'mobile'
				})
			},
			register() {
				console.log('注册')
			},
			goHome() {
				console.log('前往官网')
			}
		}
	}
</script>

<style lang="scss">
	.main {
		margin-top: 25%;
		padding: 0 5%;
		overflow: hidden;
		.swiper {
			.login-title {
				font-size: 50upx;
				display: block;
				margin-bottom: 80upx;
			}
			.login-form {
				width: 100%;
				margin-bottom: 50upx;
				.line {
					padding: 0.7rem 0;
					font-size: 34upx;
					position: relative;
					.left {
						width: 30%;
						text-align: left;
						float: left;
						height: 1.4rem;
						line-height: 1.4rem;
					}
					.ritht {
						float: right;
					}
					input {
						line-height: 1.4rem;
					}
				}
				.line::after {
					content: " ";
					position: absolute;
					z-index: 3;
					bottom: -2upx;
					width: 100%;
					height: 2upx;
					border-bottom: 2upx solid #D8D8D8;
					-webkit-transform-origin: 0 0;
					transform-origin: 0 0;
					-webkit-transform: scaleY(.5);
					transform: scaleY(.5)
				}
			}
		}
		button {
			margin-top: 100upx;
			color: #fff;
			background-color: #ff65a3;
			border: none;		
		}
		button[disabled] {
			background-color: #ffd0e3;
			color: rgba(255,255,255,.8)
		}		
		.middle {
			.switch {
				font-size: 30upx;
				color: #606f8c;
			}
		}
		.bottom-more {
			position: absolute;
			bottom: 30upx;
			width: 90%;
			overflow: hidden;
			text-align: center;
			.more {
				display: inline-block;
				text-align: center;
				color: #606f8c;
				font-size: 30upx;
			}
			.mid {
				margin: 0 10upx;
			}
		}
	}
</style>
