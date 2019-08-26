<template>
	<view class="user">
		<view class="user-top">
			<view class="left">
				<image :src="photo" @click="toUserInfo"></image>
			</view>
			<view class="right">
				<view class="top">{{username}}</view>
				<view class="bottom" @click="toUserInfo">
					<view class="account">饺子号：<text>{{phone}}</text></view>
					<view class="code">
						<image class="icon-code" src="../../static/code.png"></image>
						<image class="icon-right" src="../../static/right.png" style="margin-left: 1rem;"></image>
					</view>
				</view>
			</view>
		</view>
		<view class="option-list">
			<navigator url="">
				<view class="item">
					<view class="item-icon">
						<image src="../../static/user/payment.png"></image>
					</view>
					<view class="item-name">
						<view class="title">支付</view>
						<image class="icon-right" src="../../static/right.png"></image>
					</view>
				</view>
			</navigator>
			<view class="item-list">
				<navigator open-type="navigate">
					<view class="item-info">
						<view class="item-icon">
							<image src="../../static/user/collection.png"></image>
						</view>
						<view class="item-name">
							<view class="title">收藏</view>
							<image class="icon-right" src="../../static/right.png"></image>
						</view>
					</view>
				</navigator>
				<navigator open-type="navigate">
					<view class="item-info">
						<view class="item-icon">
							<image src="../../static/user/expression.png"></image>
						</view>
						<view class="item-name">
							<view class="title">表情</view>
							<image class="icon-right" src="../../static/right.png"></image>
						</view>
					</view>
				</navigator>
			</view>
			<navigator url="settings" open-type="navigate" hover-class="item-hover">
				<view class="item">
					<view class="item-icon">
						<image src="../../static/user/setting.png"></image>
					</view>
					<view class="item-name">
						<view class="title">设置</view>
						<image class="icon-right" src="../../static/right.png"></image>
					</view>
				</view>
			</navigator>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: 'PC52020620',
				photo: '../../static/jiaozibao.jpg',
				username: '饺子包'
			}
		},
		onLoad() {
			
		},
		methods: {
			toUserInfo() {
				uni.navigateTo({
					url: 'info'
				})
			}
		},
	}
</script>

<style lang="scss">
	.user {
		width: 100%;
		overflow: hidden;
		.item-hover {
			background-color: rgba(0,0,0,0.5);
		}
		.user-top {
			padding: 2rem 0.8rem 2.5rem 1.5rem;
			background-color: #FFFFFF;
			overflow: hidden;
			position: relative;
			display: flex;
			display: -webkit-flex;
			flex-direction: row;
			flex-wrap: nowrap;
			.left {
				width: 3.8rem;
				height: 3.8rem;
				margin-right: 0.8rem;
				image {
					width: 3.8rem;
					height: 3.8rem;
					border-radius: 0.3rem;
				}
			}
			.right {
				width: 100%;
				height: 3.8rem;
				position: relative;
				.top {
					font-size: 42upx;
					font-weight: bold;
					position: absolute;
					top: 0;
				}
				.bottom {
					font-size: 32upx;
					color: #7f7f7f;
					position: absolute;
					bottom: -2upx;
					width: 100%;
					display: flex;
					display: -webkit-flex;
					flex-direction: row;
					flex-wrap: nowrap;
					justify-content: space-between;
					.code {
						display: inline-block;
						margin-top: 0.15rem;
						.icon-code {
							width: 1rem;
							height: 1rem;
						}
						.icon-right {
							margin-right: 0;
							margin-bottom: 4upx;
						}
					}
				}
			}
		}
		.user-top::after {
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
		.option-list {
			.item-list {
				position: relative;
				background-color: #FFFFFF;
				margin-top: 0.5rem;
			}
			.item {
				margin-top: 0.5rem;
			}
			.item,.item-info {
				width: 100%;
				height: 3.2rem;
				line-height: 3.2rem;
				display: flex;
				display: -webkit-flex;
				flex-direction: row;
				flex-wrap: nowrap;
				background-color: #FFFFFF;
				position: relative;
				.item-icon {
					width: 4rem;
					height: 3.2rem;
					image {
						width: 1.3rem;
						height: 1.3rem;
						display: block;
						margin: 0 auto;
						margin-top: 0.9rem;
					}
				}
				.item-name {
					width: 100%;
					display: flex;
					display: -webkit-flex;
					flex-direction: row;
					flex-wrap: nowrap;
					justify-content: space-between;
					.title {
						width: 100%;
					}
				}
			}
			.item-info::after {
				content: " ";
				position: absolute;
				z-index: 3;
				bottom: -2upx;
				left: 3.3rem;
				width: 100%;
				height: 2upx;
				border-bottom: 2upx solid #D8D8D8;
				-webkit-transform-origin: 0 0;
				transform-origin: 0 0;
				-webkit-transform: scaleY(.5);
				transform: scaleY(.5)
			}
			.item::after,.item-list::after {
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
			.item::before,.item-list::before {
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
		}
	}
</style>
