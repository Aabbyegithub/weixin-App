<template>
  <view class="container">
    <text class="title">切换测试用户</text>
    <view class="list">
      <view class="item" v-for="u in users" :key="u.id" @tap="switchTo(u)">
        <image class="avatar" :src="u.avatar" mode="aspectFill" />
        <view class="meta">
          <text class="name">{{ u.nickname }}</text>
          <text class="uid">ID: {{ u.id }}</text>
        </view>
        <text class="use">使用</text>
      </view>
    </view>
  </view>
</template>

<script>
import { generateUserAvatar } from '../../utils/image'

export default {
  data(){ return { users:[{id:1,nickname:'小明',avatar:generateUserAvatar('1')},{id:2,nickname:'小红',avatar:generateUserAvatar('2')},{id:3,nickname:'测试用户',avatar:generateUserAvatar('3')}]} },
  methods:{
    switchTo(u){
      const app = getApp()
      app.setUserInfo(u)
      uni.setStorageSync('token', 'dev-token-'+u.id)
      uni.showToast({ title:'已切换到 '+u.nickname, icon:'success' })
      setTimeout(()=> uni.switchTab({ url: '/pages/me/index' }), 800)
    }
  }
}
</script>

<style scoped>
.container{ padding:24rpx }
.title{ font-size:34rpx; font-weight:700; color:#333; margin-bottom:20rpx }
.item{ display:flex; align-items:center; background:#fff; border-radius:16rpx; padding:20rpx; margin-bottom:16rpx }
.avatar{ width:80rpx; height:80rpx; border-radius:50%; margin-right:12rpx }
.meta{ flex:1; display:flex; flex-direction:column }
.name{ font-size:30rpx; color:#333 }
.uid{ font-size:24rpx; color:#999 }
.use{ color:#4DD0E1; font-size:28rpx }
</style>
