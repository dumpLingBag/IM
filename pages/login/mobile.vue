<template>
	<view class="main">
		<view class="swiper">
			<view class="mobile-login">
				<text class="login-title">手机号登录</text>
				<view class="login-form">
					<view class="mobile line">
						<view class="left">手机号</view>
						<input class="right" @input="inputMobile" placeholder="请输入手机号" />
					</view>
					<view class="password line" v-if="codeType">
						<view class="left">密码</view>
						<input class="right" @input="inputPassword" password="true" confirm-type="go" @confirm="login" placeholder="请输入密码" />
					</view>
					<view class="code line" v-if="!codeType">
						<view class="left">验证码</view>
						<input class="right" @input="inputCode" @confirm="login" type="number" confirm-type="go" placeholder="请输入验证码" />
						<text class="get-code" :class="checkCode > 0 ? 'on-code' : ''" @click.stop="getCode">{{checkCode > 0 ? checkCode + '后重新获取' : '获取验证码'}}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="middle">
			<text class="switch" @click="switchType">{{codeType ? '用验证码登录' : '用密码登录'}}</text>
			<template v-if="codeType">
				<button hover-class="none" @click="login" plain="true" :disabled="mobile == '' || password == ''">登录</button>
			</template>
			<template v-if="!codeType">
				<button hover-class="none" @click="login" plain="true" :disabled="mobile == '' || code == ''">登录</button>
			</template>
		</view>
	</view>
</template>

<script>
	import socket from '../../utils/socket-io.js'
	export default {
		data() {
			return {
				codeType: true,
				checkCode: 0,
				mobile: '',
				code: '',
				password: ''
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
			inputMobile(e) {
				this.mobile = e.detail.value
			},
			inputPassword(e) {
				this.password = e.detail.value
			},
			inputCode(e) {
				this.code = e.detail.value
			},
			switchType(){
				if (this.loginType == 1) {
					this.loginType == 2;
				} else {
					if (this.loginType == 2) {
						this.loginType == 1
					}
				}
				this.codeType = !this.codeType
			},
			getCode() {
				let that = this;
				if (that.mobile == '') {
					uni.showModal({
						showCancel: false,
						content: '请填写手机号',
						title: '提示'
					})
					return;
				}
				if (that.checkCode != 0) {
					return;
				}
				that.checkCode = 60;
				let interval = setInterval(function() {
					that.checkCode = that.checkCode - 1;
					if (that.checkCode == 0) {
						clearInterval(interval)
					}
				}, 1000)
			},
			login() {
				if (this.codeType) {
					if (this.mobile == '') {
						uni.showModal({
							showCancel: false,
							content: '请填写手机号',
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
				} else {
					if (this.code == '') {
						uni.showModal({
							showCancel: false,
							content: '请填写验证码',
							title: '提示'
						})
						return;
					}
				}
				uni.showToast({title: '请稍候...', icon: 'loading'})
				socket.initSocket(1278)
			}
		},
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
				.get-code {
					height: 1.2rem;
					line-height: 1.3rem;
					font-size: 24upx;
					position: absolute;
					border: 1px solid #000;
					padding: 0.1rem 10upx;;
					border-radius: 10upx;
					right: 10upx;
					top: 0.65rem;
					z-index: 999;
				}
				.on-code {
					color: #D8D8D8;
					border-color: #D8D8D8;
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
	}
</style>
