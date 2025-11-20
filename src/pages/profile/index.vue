<template>
  <view class="profile-page">
    <!-- 头像选择 -->
    <button
      class="avatar-btn"
      open-type="chooseAvatar"
      @chooseavatar="onChooseAvatar"
    >
      <image
        class="avatar-img"
        :src="avatarUrl"
        mode="widthFix"
      />
    </button>

    <!-- 昵称输入 -->
    <view class="input-group">
      <text class="label">昵称</text>
      <input
        class="nickname-input"
        type="nickname"
        :value="nickname"
        @input="onNicknameInput"
        placeholder="请告诉我你的名字"
      />
    </view>

    <!-- 提示文字 -->
    <view class="tip-text">
      选择一个能够代表自己的头像，让我更好地认识你 :)
    </view>

    <!-- 提交按钮 -->
    <button class="save-btn" @tap="onSubmit">保存</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const avatarUrl = ref('/static/logo.png')
const nickname = ref('')

function onChooseAvatar(e) {
  const { avatarUrl: url } = e.detail || {}
  if (url) avatarUrl.value = url
}

function onNicknameInput(e) {
  nickname.value = e.detail.value
}

async function onSubmit() {
  if (!nickname.value) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  const { user_id } = await uni.getStorageSync('wx-user-info')
  const body = {
    user_id,
    avatar_url: avatarUrl.value,
    nickname: nickname.value
  }
  uni.request({
    url: `${import.meta.env.VITE_API_BASE}/user/save-wx-info`,
    method: 'POST',
    data: body,
    success(res) {
      const data = res.data.data
      if (data.avatar_url === body.avatar_url) {
        uni.showToast({ title: '资料已保存', icon: 'success' })
        uni.setStorageSync('wx-user-info', data)
        uni.switchTab({
          url: '/pages/chat/index'
        })
      } else {
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    },
    fail(err) {
      console.error('保存失败', err)
      uni.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.profile-page {
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-bg); /* 柔和的绿蓝背景，给人平静感 */
  min-height: 100vh;
}

/* 头像按钮 + 软阴影/neumorphism style */
.avatar-btn {
  width: 144rpx;
  height: 144rpx;
  padding: 0px;
  /* border-radius: 110rpx; */
  overflow: hidden;
  margin-bottom: 60rpx;
  background: var(--color-bg-card);
  box-shadow:
    8rpx 8rpx 16rpx var(--shadow-card),
    -8rpx -8rpx 16rpx var(--shadow-light);
}

.avatar-img {
  width: 144rpx;
  margin: 0 auto;
}

/* 输入组 */
.input-group {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  background: var(--color-bg-card);
  padding: 16rpx;
  border-radius: 20rpx;
  box-shadow:
    inset 4rpx 4rpx 8rpx var(--shadow-card),
    inset -4rpx -4rpx 8rpx var(--shadow-light);
}

.label {
  font-size: 30rpx;
  color: var(--color-text-strong);
  width: 90rpx;
}

.nickname-input {
  flex: 1;
  font-size: 28rpx;
  padding: 12rpx;
  border: none;
  background: transparent;
}

/* 提示文字 */
.tip-text {
  font-size: 24rpx;
  margin-bottom: 50rpx;
  text-align: center;
  color: var(--color-text-weak);
}

/* 保存按钮 */
.save-btn {
  width: fit-content;
  height: 80rpx;
  color: white;
  font-size: 32rpx;
  border-radius: var(--radius-xs);
  text-align: center;
  line-height: 80rpx;
  box-shadow: 4rpx 4rpx 12rpx var(--shadow-card);
  transition: background-color 0.2s;
  background-color: var(--color-primary);
}
</style>
