<template>
  <view class="chat">
    <scroll-view
      v-if="messages.length"
      scroll-y
      class="chat-list"
      :scroll-with-animation="true"
      :scroll-top="scrollTop"
      :style="{ paddingBottom: `${keyboardHeight}px` }"
    >
      <view
        v-for="(item, index) in messages"
        class="message-row"
        :class="item.role"
        :key="item.id"
        :id="item.id"
      >
        <!-- AI 头像 -->
        <image
          v-if="item.role === 'ai'"
          class="avatar"
          src="/static/logo.png"
        />

        <!-- 用户头像 -->
        <image
          v-if="item.role === 'user'"
          class="avatar"
          :src="userAvatar"
        />

        <!-- 内容 -->
        <view class="bubble">
          <text class="content">{{ item.content }}</text>
          <!-- 时间 -->
          <text class="date">{{ item.date }}</text>
        </view>
      </view>
    </scroll-view>
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
  </view>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface History {
  id: string
  query: string;
  answer: string;
  created_at: number;
}
interface Message {
  date: string;
  id: string;
  role: 'ai' | 'user' | string;
  content: string;
}

const messages = ref<Message[]>([
  // { role: 'ai', content: '你好，我在这里等你，有什么想说的吗？' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' },
  // { role: 'ai', content: '你好，我是AI心理助手~' },
  // { role: 'user', content: '最近睡眠质量差怎么办？最近睡眠质量差怎么办？最近睡眠质量差怎么办？' },
  // { role: 'ai', content: '我能理解你的困扰，我们先一起看看原因。' }
]);

const value = ref('')
const focus = ref(false)
const keyboardHeight = ref(0)
const scrollTop = ref(9999999)
const userAvatar = ref('')

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

const getHistory = () => {
  uni.showLoading({ title: '加载中...' })
  // messages.value = [{ role: 'ai', content: '你好，我在这里等你，有什么想说的吗？', date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'), id: 'welcome-message' }]
  // setTimeout(() => {
  //   uni.hideLoading()
  // }, 500);

  uni.request({
    url: `https://api.dify.ai/v1/messages?limit=20&user=${import.meta.env.VITE_DIFY_USER}&conversation_id=${import.meta.env.VITE_DIFY_CONSERVATION_ID}`,
    method: 'GET',
    header: {
      Authorization: `Bearer ${import.meta.env.VITE_DIFY_KEY}`
    },
    success(res) {
      uni.hideLoading()
      const { data } = res.data as { data: Array<History> }
      if (data.length === 0) {
        messages.value = [{ role: 'ai', content: '你好，我在这里等你，有什么想说的吗？', date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'), id: 'welcome-message' }]
      } else {
        messages.value = data
          .filter(item => item.answer)
          .map(item => {
            const param = { date: dayjs(item.created_at * 1000).format('YYYY-MM-DD HH:mm:ss'), id: item.id }
            return [
              { ...param, role: 'user', content: item.query },
              { ...param, role: 'ai', content: item.answer  }
            ]
          }).flat(Infinity) as Message[]
      }
      scrollTop.value += 1
    },
    fail(err) {
      console.error('保存失败', err)
      uni.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  })
}

onMounted(async () => {
  getHistory()
  // 监听键盘高度变化
  uni.onKeyboardHeightChange(res => {
    if (res.height > 0) {
      keyboardHeight.value = res.height - 84
      scrollTop.value += 1
    } else {
      keyboardHeight.value = 0
    }
  })
  const user = await uni.getStorageSync('wx-user-info')
  userAvatar.value = user.avatar_url || '/static/logo.png'
})

onBeforeUnmount(() => {
  // 移除监听
  uni.offKeyboardHeightChange?.()
})
</script>
<style lang="scss" scoped>
.chat {
  > .chat-list {
    height: 100vh;
    // height: calc(100vh - 50px);
    width: 100%;
    padding: 6px;
    box-sizing: border-box;
    .message-row {
      display: flex;
      margin-bottom: 8px;
      align-items: flex-start;

      &:last-child {
        padding-bottom: 80px; /* 底部输入框高度 + 间距 */
      }
    }

    /* AI 消息靠左 */
    .message-row.ai {
      flex-direction: row;
    }

    /* 用户消息靠右 */
    .message-row.user {
      flex-direction: row-reverse;
    }

    /* 气泡 */
    .bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      box-sizing: border-box;
    }
    
    /* AI 气泡（浅绿色） */
    .message-row.ai .bubble {
      background-color: #E8F5E9;
      color: #333;
      > .date {
        display: block;
        font-size: 14px;
        color: var(--color-text-weak);
        margin-top: 6px;
      }
    }

    /* 用户气泡（主色） */
    .message-row.user .bubble {
      background-color: #4CAF50;
      color: #fff;
      > .date {
        display: block;
        font-size: 14px;
        color: var(--color-primary-light);
        margin-top: 6px;
      }
    }

    /* 头像 */
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 0 6px 0 0;
    }
    .user {
      > .avatar {
        margin: 0 0 0 6px;
      }
    }
  }

  > .bottom-input {
    position: fixed;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    z-index: 10;
    padding: 12px 10px 10px 10px;

    background-color: rgba(255, 255, 255, .4); /* 半透明背景 */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px); /* iOS /部分平台兼容 */ 

    > .input-field {
      flex: 1;
      height: 40px;
      line-height: 40px;
      padding: 0 6px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 16px;
      color: var(--color-text-strong);
      box-sizing: border-box;

      background-color: rgba(255, 255, 255, .4); /* 半透明背景 */
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px); /* iOS /部分平台兼容 */ 
    }
    > .send-btn {
      z-index: 11;
      margin-left: 4px;
      padding: 0 14px;
      border-radius: 4px;
      line-height: 40px;
      font-size: 16px;
      color: white;
      background-color: var(--color-primary);
    }
  }
}
</style>
