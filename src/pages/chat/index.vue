<template>
  <view v-if="messages.length" class="chat">
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
        :key="item.role + item.id"
        :id="item.id"
      >
        <!-- <image
          v-if="item.role === 'ai'"
          class="avatar"
          src="/static/logo.png"
        />
        <image
          v-if="item.role === 'user'"
          class="avatar"
          :src="userAvatar"
        /> -->

        <!-- 内容 -->
        <view class="bubble" :style="{ padding: `${item.role === 'user' ? '8px' : '0px'} 10px 8px 10px;` }">
          <text v-if="item.role === 'user'">{{ item.content }}</text>
          <Markdown v-else :content="item.content" :canExpand="index !== messages.length - 1" />
          <!-- 时间 -->
          <text class="date">{{ item.date }}</text>
        </view>
      </view>
    </scroll-view>
    <view class="bottom-input" :style="{ bottom: keyboardHeight + 'px' }">
      <input
        class="input-field"
        type="text"
        v-model="question"
        placeholder="请输入内容"
        :focus="focus"
        @focus="onFocus"
        @blur="onBlur"
        confirm-type="send"
        @confirm="onSend"
      />
      <view v-if="loading" class="spin">
        <view class="spin-icon"></view>
      </view>
      <button v-else class="send-btn" @tap="onSend">发送</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, onBeforeUnmount, onBeforeMount } from 'vue'
import Markdown from '@/components/markdown/index.vue'
import { getDifyInfo } from '@/lib/tools';

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

const messages = ref<Message[]>([]);
const question = ref('')
const focus = ref(false)
const keyboardHeight = ref(0)
const scrollTop = ref(999999999999)
const userAvatar = ref('')
const loading = ref(false)

// 聚焦
const onFocus = () => {
  focus.value = true
}

// 失焦
const onBlur = () => {
  focus.value = false
}

// 点击发送
const onSend = async () => {
  const query = question.value.trim()
  if (!query || loading.value) {
    return
  }

  const { DIFY_CONVERSATION_ID, DIFY_USER } = getDifyInfo()

  if (!DIFY_USER) {
    uni.showToast({ title: '请先登录', icon: 'error' })
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }, 500)
    return
  }

  loading.value = true

  const data = {
    inputs: {},
    query,
    response_mode: 'streaming',
    user: DIFY_USER,
    conversation_id: ''
  }
  if (DIFY_CONVERSATION_ID) {
    data.conversation_id = DIFY_CONVERSATION_ID
  }

  const requestTask = uni.request({
    url: `${import.meta.env.VITE_DIFY_DOMAIN}/chat-messages`,
    method: 'POST',
    data,
    header: {
      Authorization: `Bearer ${import.meta.env.VITE_DIFY_KEY}`,
      'Content-Type': 'application/json'
    },
    enableChunked: true,
    responseType: 'arraybuffer',
    timeout: 600000,
    success: () => {
      loading.value = false
      console.info('请求成功: ', onSend);
    },
    fail: (err) => {
      console.error('请求失败', err);
    }
  });

  let text = '';
  (requestTask as any).onChunkReceived((res: any) => {
    const uint8Array = new Uint8Array(res.data);
    const type = Object.prototype.toString.call(uint8Array);
    let buffer = ''
    if (type === "[object Uint8Array]") {
      buffer = decodeURIComponent(escape(String.fromCharCode(...uint8Array)));
    } else if (uint8Array instanceof ArrayBuffer) {
      const arr = new Uint8Array(uint8Array);
      buffer = decodeURIComponent(escape(String.fromCharCode(...arr)));
    }

    if (buffer.includes(`"event":"message"`)) {
      try {
        const rows = buffer
          .replaceAll('data: ', '')
          .split('\n\n')
          .filter(row => row.length && row.includes(`"event":"message"`))
          .map(row => JSON.parse(row))

        text += rows.map(row => row.answer).join('')

        const lastRow = messages.value.at(-1)
        const [exampleRow] = rows

        if (lastRow?.id === `ai-${exampleRow.message_id}`) {
          messages.value = [...messages.value.slice(0, -1), { ...lastRow!, content: text }]
        } else {
          messages.value = [
            ...messages.value,
            { id: `user-${exampleRow.message_id}`, role: 'user', content: question.value, date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss') },
            { id: `ai-${exampleRow.message_id}`, role: 'ai', content: text, date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss') },
          ]
          question.value = ''
          if (data.conversation_id === '') {
            const userInfo = uni.getStorageSync('wx-user-info')
            uni.request({
              url: `${import.meta.env.VITE_API_BASE}/user/save-wx-info`,
              method: 'POST',
              data: { ...userInfo, conversation_id: exampleRow.conversation_id },
              success(res: any) {
                const data = res.data.data
                if (data.avatar_url === userInfo.avatar_url) {
                  uni.setStorageSync('wx-user-info', data)
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
        }
        scrollTop.value += 1
      } catch (e) {
        console.error('解析数据失败', buffer);
      }
    }
  });
}

const getHistory = () => {
  const { DIFY_CONVERSATION_ID, DIFY_USER } = getDifyInfo()

  if (!DIFY_USER || !DIFY_CONVERSATION_ID) {
    messages.value = [{
      role: 'ai',
      content: '你好，我在这里等你，有什么想说的吗？',
      date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      id: 'welcome-message',
    }]
    return
  }
  uni.showLoading({ title: '加载中...' })
  uni.request({
    url: `${import.meta.env.VITE_DIFY_DOMAIN}/messages?limit=10&user=${DIFY_USER}&conversation_id=${DIFY_CONVERSATION_ID}`,
    method: 'GET',
    header: {
      Authorization: `Bearer ${import.meta.env.VITE_DIFY_KEY}`
    },
    success(res) {
      console.info('res: ', res)
      const { data } = res.data as { data: Array<History> }
      if (!data || data.length === 0) {
        messages.value = [{
          role: 'ai',
          content: '你好，我在这里等你，有什么想说的吗？',
          date: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          id: 'welcome-message',
        }]
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
      uni.hideLoading()
      setTimeout(() => {
        scrollTop.value += 1
      }, 500);
    },
    fail(err) {
      console.error('获取历史数据失败', err)
      uni.showToast({ title: '获取历史数据失败，请重试', icon: 'none' })
    }
  })
}

onBeforeMount(async () => {
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
    height: calc(100vh - 50px);
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    .message-row {
      display: flex;
      margin-bottom: 8px;
      align-items: flex-start;

      &:last-child {
        padding-bottom: 20px; /* 底部输入框高度 + 间距 */
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
      width: fit-content;
      box-sizing: border-box;
    }
    
    /* AI 气泡（浅绿色） */
    .message-row.ai .bubble {
      background-color: #E8F5E9;
      color: #333;
      border-radius: 10px 10px 10px 0;

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
      border-radius: 10px 10px 0;

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
    padding: 10px 8px;
    background-color: white;

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

    > .spin {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 0 0 10px;

      > .spin-icon {
        width: 42rpx;
        height: 42rpx;
        border: 4rpx solid #f3f3f3;
        border-top: 4rpx solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    }
  }
}
</style>
