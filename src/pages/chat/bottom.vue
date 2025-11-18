<template>
  <view class="bottom-input" :style="{ bottom: keyboardHeight + 'px' }">
    <input
      class="input-field"
      type="text"
      v-model="value"
      placeholder="请输入内容"
      :focus="focus"
      @focus="onFocus"
      @blur="onBlur"
      confirm-type="send"
      @confirm="onSend"
    />
    <button class="send-btn" @tap="onSend">发送</button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const value = ref('')
const focus = ref(false)
const keyboardHeight = ref(0)

// 聚焦
const onFocus = () => {
  focus.value = true
}

// 失焦
const onBlur = () => {
  focus.value = false
}

// 点击发送
const onSend = () => {
  if (!value.value.trim()) return
  console.log('发送内容:', value.value)
  value.value = ''
}

onMounted(() => {
  // 监听键盘高度变化
  uni.onKeyboardHeightChange(res => {
    keyboardHeight.value = res.height > 0 ? res.height - 82 : 0
  })
})

onBeforeUnmount(() => {
  // 移除监听
  uni.offKeyboardHeightChange?.()
})
</script>

<style lang="scss" scoped>
.bottom-input {
  position: fixed;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 6px;
  background-color: #fff;
  z-index: 1000; /* 保证在最上层 */
}

.input-field {
  flex: 1;
  height: 36px;
  line-height: 36px;
  padding: 0 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #000;
  box-sizing: border-box;
}

.send-btn {
  margin-left: 4px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background-color: #007aff;
  color: #fff;
  line-height: 36px;
  font-size: 16px;
}
</style>
