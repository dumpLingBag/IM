<template>
	<view class="mailList">
		<view class="search item-line">
			<input placeholder="搜索" confirm-type="search" @confirm="search" />
		</view>
		<view class="option-line">
			<navigator url="" open-type="navigate">
				<view class="item-line">
					<image src="../../static/jiaozibao.jpg"></image>
					<text class="title">新的朋友</text>
				</view>
			</navigator>
			<navigator url="" open-type="navigate">
				<view class="item-line">
					<image src="../../static/jiaozibao.jpg"></image>
					<text class="title">群聊</text>
				</view>
			</navigator>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		onLoad(option) {
			
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
	.mailList {
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
			}
		}
		.option-line {
			background-color: #FFFFFF;
			.item-line {
				display: flex;
				display: -webkit-flex;
				flex-direction: row;
				flex-wrap: nowrap;
				height: 2.5rem;
				line-height: 2.5rem;
				padding: 0.6rem 0.9rem;
				image {
					width: 2.5rem;
					height: 2.5rem;
					border-radius: 0.2rem;
				}
				.title {
					margin-left: 0.5rem;
				}
			}
			.item-line::after {
				left: 3.8rem;
			}
		}
	}
</style>
