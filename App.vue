<script>
	export default {
		onLaunch: function() {
			let token = uni.getStorageSync('token')
			if (!token || token == '') {
				let userInfo = uni.getStorageSync('userInfo')
				if (userInfo && userInfo != '') {
					uni.reLaunch({
						url: 'pages/login/info'
					})
				} else {
					uni.reLaunch({
						url: 'pages/login/index'
					})
				}
			}
			console.log('App Launch')
		},
		onShow: function(e) {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	page{
		font-family: Arial, Helvetica, sans-serif;
		background-color: #ededed;
	}
	.icon-right {
		width: 0.8rem;
		height: 0.8rem;
		margin: auto 0;
		margin-right: 0.8rem;
	}
	@keyframes showList{
		from{bottom: -10rem;}
		to{bottom: 0;}
	}
	@keyframes hideList{
		from{bottom: 0;}
		to{bottom: -10rem;}
	}
	.more-list {
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 999;
		position: absolute;
		background-color: rgba(0,0,0,.3);
		.showList {
			animation: showList .3s;
			animation-fill-mode: forwards;
		}
		.hideList {
			animation: hideList .3s;
			animation-fill-mode: forwards;
		}
		.bottom {
			position: absolute;
			width: 100%;
			bottom: 0;
			background-color: #F8F8F8;
			text-align: center;
			border-radius: 0.85rem 0.85rem 0 0;
			overflow: auto;
			.line {
				font-size: 35upx;
				padding: 0.8rem 0;
				background-color: #FFFFFF;
			}
			.last {
				margin-top: 0.5rem;
			}
			.top {
				.line {
					position: relative;
				}
				.line::after {
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
				.line:last-of-type::after {
					display: none;
				}
			}
		}
	}
	.option-line,.item-line {
		position: relative;
	}
	.option-line::after,.item-line::after {
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
	.option-line::before {
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
</style>
