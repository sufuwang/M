<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(async () => {
  const data = await uni.getStorageSync('wx-user-info')
  if (!data.user_id || !data.conversation_id) {
    uni.showToast({ title: '请先登录', icon: 'error' })
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }, 500)
  }
  console.log("App Show: ", data);
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang='scss'>
@import "uview-plus/index.scss";
@import "./theme.css";
</style>
