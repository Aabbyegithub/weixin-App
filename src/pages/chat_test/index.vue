<template>
  <view class="container">
    <button class="btn" @tap="openPrivate">进入私聊测试</button>
    <button class="btn" @tap="openGroup">进入群聊测试</button>
  </view>
</template>

<script>
export default {
  methods:{
    openPrivate(){ uni.navigateTo({ url: '/pages/chat/private?id=2' }) },
    openGroup(){ uni.navigateTo({ url: '/pages/chat/group?id=1' }) }
  }
}
</script>

<style scoped>
.container{ padding:40rpx; display:flex; flex-direction:column; gap:20rpx }
.btn{ height:100rpx; border:none; border-radius:50rpx; background:#4DD0E1; color:#fff; font-size:32rpx }
</style>
