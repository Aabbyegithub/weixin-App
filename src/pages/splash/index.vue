<template>
  <view class="splash-container">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo">
        <text class="logo-text">Link Me</text>
      </view>
    </view>
    
    <!-- 标语 -->
    <view class="slogan-section">
      <text class="slogan-main">Link me，链接你我</text>
      <text class="slogan-sub">分享精彩瞬间，连接美好生活</text>
    </view>
    
    <!-- 进入按钮 -->
    <view class="enter-section">
      <view class="enter-button" @tap="handleEnter">
        <view class="arrow-circle">
          <text class="arrow">→</text>
        </view>
      </view>
      <text class="enter-text">轻触进入</text>
    </view>
    
    <!-- 底部装饰 -->
    <view class="bottom-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },

  onLoad() {
    // 自动跳转延迟
    setTimeout(() => {
      this.checkLoginStatus()
    }, 2000)
  },

  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp()
      const isLogin = app.checkLogin()
      if (isLogin) {
        // 已登录，跳转到主页
        uni.switchTab({
          url: '/pages/feed/index'
        })
      } else {
        // 未登录，跳转到登录页
        uni.redirectTo({
          url: '/pages/login/index'
        })
      }
    },

    // 手动点击进入
    handleEnter() {
      this.checkLoginStatus()
    }
  }
}
</script>

<style scoped>
/* 启动页样式 */
.splash-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #4DD0E1 0%, #80DEEA 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Logo区域 */
.logo-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20rpx);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
  animation: logoFloat 3s ease-in-out infinite;
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  letter-spacing: 2rpx;
}

/* 标语区域 */
.slogan-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 60rpx;
  margin-bottom: 100rpx;
}

.slogan-main {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
  letter-spacing: 4rpx;
}

.slogan-sub {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 2rpx;
}

/* 进入按钮 */
.enter-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 120rpx;
}

.enter-button {
  margin-bottom: 20rpx;
  animation: pulse 2s ease-in-out infinite;
}

.arrow-circle {
  width: 120rpx;
  height: 120rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.arrow-circle:active {
  transform: scale(0.95);
  box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.2);
}

.arrow {
  font-size: 48rpx;
  color: #4DD0E1;
  font-weight: bold;
  margin-left: 8rpx;
}

.enter-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10rpx;
}

/* 底部装饰 */
.bottom-decoration {
  position: absolute;
  bottom: -100rpx;
  left: 0;
  right: 0;
  height: 400rpx;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  bottom: -50rpx;
  left: -100rpx;
  animation: floatUp 15s linear infinite;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: 50rpx;
  right: -50rpx;
  animation: floatUp 20s linear infinite;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: floatUp 18s linear infinite;
}

/* 动画 */
@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-500rpx) rotate(360deg);
    opacity: 0;
  }
}
</style>

