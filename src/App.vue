<template>
  <view id="app">
    <!-- 全局组件可以在这里定义 -->
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    
    // 展示本地存储能力
    const logs = uni.getStorageSync('logs') || []
    logs.unshift(Date.now())
    uni.setStorageSync('logs', logs)

    // 登录
    uni.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('Login code:', res.code)
      }
    })
  },
  
  onShow: function() {
    console.log('App Show')
  },
  
  onHide: function() {
    console.log('App Hide')
  },
  
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:8000',
    token: null,
    primaryColor: '#4DD0E1',
    isLogin: false
  },

  methods: {
    // 检查登录状态
    checkLogin() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        this.globalData.isLogin = true
        return true
      }
      
      // 清理无效的登录信息
      this.clearLoginInfo()
      return false
    },

    // 清理登录信息
    clearLoginInfo() {
      this.globalData.isLogin = false
      this.globalData.userInfo = null
      this.globalData.token = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    },

    // 跳转到登录页
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.globalData.userInfo = userInfo
      uni.setStorageSync('userInfo', userInfo)
    },

    // 获取用户信息
    getUserInfo() {
      if (this.globalData.userInfo) {
        return this.globalData.userInfo
      }
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
        return userInfo
      }
      return null
    }
  }
}
</script>

<style>
/* 全局样式 */
/* @import url("./static/css/common.css"); */

/* 每个页面公共css */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

/* 通用样式 */
.container {
  padding: 0 30rpx;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 按钮样式 */
.btn {
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
  outline: none;
}

.btn-primary {
  background-color: #4DD0E1;
  color: #fff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

/* 输入框样式 */
.input {
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #fff;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 头像样式 */
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

/* 文字样式 */
.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
}

.text {
  font-size: 26rpx;
  color: #999;
}

/* 间距 */
.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }

.p-10 { padding: 10rpx; }
.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }
</style>

