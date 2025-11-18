<template>
  <view class="chat">
    <view class="content">
    </view>
      <Bottom />
    <!-- <view class="footer">
      <input
        class="input"
        placeholder="请输入内容"
        v-model="value"
      >
      </input>
      <view class="button">发送</view>
    </view> -->
  </view>
</template>
<script setup lang="ts">
import Bottom from './bottom.vue'
import { ref } from 'vue';

const value = ref('');
</script>
<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;

  > .content {
    flex: 1;
    overflow-y: auto;
  }
  > .footer {
    position: fixed;
    bottom: 0px;
    width: 100%;
    // height: fit-content;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 6px;
    box-sizing: border-box;

    > .input {
      flex: 1;
      padding: 6px;
      border: 1px solid rgba(200, 200, 200, .4);
      border-radius: 4px;
      margin-right: 4px;
    }
    > .button {
      width: fit-content;
      padding: 6px 10px;
      border-radius: 4px;
      background-color: rgba(200, 200, 200, .4);
      font-size: 16px;
    }
  }
}
</style>
