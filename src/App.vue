<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";

onShow(async () => {
  const data = uni.getStorageSync('wx-user-info') ?? {}
  if (data.user_id) {
    uni.request({
      url: `${import.meta.env.VITE_API_BASE}/user/wx-info?user_id=${data.user_id}`,
      method: 'GET',
      success(res: any) {
        const { data } = res.data
        uni.setStorageSync('wx-user-info', data)
        if (!data.avatar_url || !data.nickname) {
          uni.showToast({ title: '请先完善个人信息', icon: 'error' })
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/profile/index'
            })
          }, 500)
        }
      }
    })
  }
});
</script>
<style lang='scss'>
@import "uview-plus/index.scss";
@import "./theme.css";
</style>
