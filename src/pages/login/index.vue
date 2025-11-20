<template>
  <view class="login-page">
    <!-- Logo -->
    <view class="logo-area">
      <image
        class="logo"
        mode="aspectFit"
        src="/static/logo.png"
      ></image>
    </view>

    <!-- 欢迎文案 -->
    <view class="title">欢迎使用心栖助手</view>
    <view class="subtitle">开启你的心理健康之旅</view>

    <!-- 微信授权按钮 -->
    <button
      class="wx-login-btn"
      open-type="getUserProfile"
      @tap="onLogin"
    >
      微信一键登录
    </button>

    <!-- 底部文案 -->
    <view class="desc">
      本产品所提供的内容与建议基于人工智能生成，仅供用户参考，不应作为医学、心理或法律等专业结论或唯一依据。如需获得专业判断，请咨询具备资质的专业人士。
    </view>
  </view>
</template>
<script setup>
const onLogin = () => {
  uni.showLoading({ title: '登录中...' })
  uni.login({
    success(res) {
      uni.request({
        url: `${import.meta.env.VITE_API_BASE}/user/wx-login`,
        method: 'POST',
        data: { code: res.code },
        success: (resp) => {
          const data = resp.data.data
          console.log('后端返回', data)
          uni.setStorageSync('wx-user-info', data)
          uni.hideLoading()

          if (!data.avatar_url || !data.nickname) {
            uni.redirectTo({
              url: '/pages/profile/index'
            })
            return
          }
          uni.showToast({ title: '登录成功' })
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/chat/index'
            })
          }, 500)
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '登录失败', icon: 'none' })
        }
      })
    },
    fail() {
      uni.hideLoading()
      uni.showToast({ title: '调用登录失败', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.logo-area {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;

  .logo {
    width: 200rpx;
    height: 200rpx;
  }
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 14rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #808080;
  margin-bottom: 60rpx;
}

.wx-login-btn {
  width: 600rpx;
  height: 90rpx;
  background: #07c160;
  color: #fff;
  font-size: 32rpx;
  line-height: 90rpx;
  border-radius: 8rpx;
}

.desc {
  margin: 40rpx 80rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
