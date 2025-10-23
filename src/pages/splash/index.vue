<template>
  <view class="splash-container">
    <!-- 链接图标 -->
    <view class="link-icon-section">
      <view class="link-icon">
        <view class="link-symbol">🔗</view>
      </view>
    </view>
    
    <!-- 主标题 -->
    <view class="title-section">
      <text class="main-title">Link me, 链接你我</text>
    </view>
    
    <!-- 进入按钮 -->
    <view class="enter-button-section">
      <view class="enter-button" @tap="handleEnter">
        <text class="arrow">→</text>
      </view>
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
  background: #00CED1; /* 青绿色背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 0 60rpx; */
  position: relative;
}

/* 链接图标区域 */
.link-icon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

.link-icon {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-symbol {
  font-size: 100rpx;
  color: white;
  font-weight: normal;
}

/* 主标题区域 */
.title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 80rpx;
}

.main-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  text-align: center;
  letter-spacing: 2rpx;
  font-family: sans-serif;
}

/* 进入按钮区域 */
.enter-button-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.enter-button {
  width: 120rpx;
  height: 120rpx;
  background: #87CEEB; /* 浅蓝色圆形按钮 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20rpx rgba(135, 206, 235, 0.5); /* 柔和发光效果 */
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

.enter-button:active {
  transform: scale(0.95);
  box-shadow: 0 0 30rpx rgba(135, 206, 235, 0.8);
}

.arrow {
  font-size: 48rpx;
  color: white;
  font-weight: bold;
  margin-left: 4rpx;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20rpx rgba(135, 206, 235, 0.5);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30rpx rgba(135, 206, 235, 0.8);
  }
}
</style>

