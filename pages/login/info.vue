<template>
	<view class="login-info">
		<view class="swiper">
			<image class="photo" src="../../static/jiaozibao.jpg"></image>
			<view class="mobile">{{areaCode +' '+ phone}}</view>
			<view class="login-form">
				<view class="password line" v-show="switchType">
					<view class="left">密码</view>
					<input class="right" @input="inputPassword" password="true" confirm-type="go" @confirm="login" placeholder="请填写饺子包密码" />
				</view>
				<view class="code line" v-show="!switchType">
					<view class="left">验证码</view>
					<input class="right" @input="inputCode" password="true" confirm-type="go" @confirm="login" placeholder="请输入验证码" />
					<text class="get-code" :class="checkCode > 0 ? 'on-code' : ''" @click.stop="getCode">{{checkCode > 0 ? checkCode + '后重新获取' : '获取验证码'}}</text>
				</view>
			</view>
		</view>
		<view class="middle">
			<text class="switch" @click="switchType = !switchType">{{switchType ? '用短信验证码登录' : '用饺子包密码登录'}}</text>
			<button hover-class="none" @click="login" plain="true" :disabled="switchType ? password == '' : code == ''">登录</button>
		</view>
		<view class="bottom-more">
			<view class="more">找回密码</view>
			<view class="more mid">丨</view>
			<view class="more" @click="showList = true">更多选项</view>
		</view>
		<view class="more-list" v-show="showList" @click="showList = false">
			<view class="bottom" :class="showList ? 'showList' : 'hideList'">
				<view class="top">
					<view class="line" @click.stop="loginOther">登录其它账号</view>
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
				areaCode: '+86',
				phone: '151 8028 0150',
				switchType: true,
				checkCode: 0,
				password: '',
				code: '',
				showList: false
			}
		},
		onLoad(option) {
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
			inputPassword(e) {
				this.password = e.detail.value
			},
			inputCode(e) {
				this.code = e.detail.value
			},
			getCode() {
				let that = this;
				console.log(this.phone.replace(/[ ]/g, ''))
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
				uni.showToast({title: '请稍候...', icon: 'loading'})
				socket.initSocket(1278)
			},
			loginOther() {
				let that = this;
				uni.navigateTo({
					url: 'index',
					success: () => {
						that.showList = false
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.login-info {
		margin-top: 25%;
		padding: 0 5%;
		overflow: hidden;
		.swiper {
			width: 100%;
			.photo {
				width: 4rem;
				height: 4rem;
				display: block;
				margin: 0 auto;
				border-radius: 0.3rem;
			}
			.mobile {
				text-align: center;
				font-size: 38upx;
				margin: 20upx 0 90upx;
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
