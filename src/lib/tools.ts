export const getDifyInfo = () => {
  const userInfo = uni.getStorageSync('wx-user-info')
  const DIFY_USER = import.meta.env.VITE_DIFY_USER ?? userInfo.nickname
  const DIFY_CONVERSATION_ID = import.meta.env.VITE_DIFY_CONVERSATION_ID ?? userInfo.conversation_id

  return { DIFY_USER, DIFY_CONVERSATION_ID }
}