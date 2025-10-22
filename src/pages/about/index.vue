<template>
  <view class="about-container">
    <view class="about-content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <image class="app-logo" src="/static/icons/logo.png" mode="aspectFit"></image>
        <text class="app-name">Link Me</text>
        <text class="app-version">v1.0.0</text>
        <text class="app-slogan">链接你我，分享精彩</text>
      </view>

      <!-- 功能介绍 -->
      <view class="features-section">
        <text class="section-title">主要功能</text>
        
        <view class="feature-list">
          <view class="feature-item" v-for="(feature, index) in features" :key="index">
            <image class="feature-icon" :src="feature.icon" mode="aspectFit"></image>
            <view class="feature-info">
              <text class="feature-name">{{ feature.name }}</text>
              <text class="feature-desc">{{ feature.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 团队信息 -->
      <view class="team-section">
        <text class="section-title">开发团队</text>
        
        <view class="team-info">
          <text class="team-text">Link Me 由一支充满激情的开发团队精心打造</text>
          <text class="team-text">致力于为用户提供最优质的社交体验</text>
        </view>
      </view>

      <!-- 版权信息 -->
      <view class="copyright-section">
        <text class="copyright-text">© 2024 Link Me. All rights reserved.</text>
        <text class="copyright-text">本应用仅供学习和交流使用</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn" @tap="checkUpdate">
          <image class="btn-icon" src="/static/icons/update.png" mode="aspectFit"></image>
          <text class="btn-text">检查更新</text>
        </button>
        
        <button class="action-btn" @tap="rateApp">
          <image class="btn-icon" src="/static/icons/star.png" mode="aspectFit"></image>
          <text class="btn-text">给我们评分</text>
        </button>
        
        <button class="action-btn" @tap="shareApp">
          <image class="btn-icon" src="/static/icons/share.png" mode="aspectFit"></image>
          <text class="btn-text">分享应用</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      features: [
        {
          name: '动态分享',
          desc: '分享生活点滴，记录美好瞬间',
          icon: '/static/icons/posts.png'
        },
        {
          name: '即时聊天',
          desc: '与好友实时沟通，支持文字、图片、语音',
          icon: '/static/icons/message.png'
        },
        {
          name: '图片相册',
          desc: '管理个人相册，珍藏回忆',
          icon: '/static/icons/album.png'
        },
        {
          name: '社交互动',
          desc: '点赞、评论、关注，建立社交网络',
          icon: '/static/icons/favorite.png'
        }
      ]
    }
  },

  methods: {
    // 检查更新
    checkUpdate() {
      uni.showLoading({
        title: '检查中...'
      })
      
      // 模拟检查更新
      setTimeout(() => {
        uni.hideLoading()
        uni.showModal({
          title: '检查更新',
          content: '当前已是最新版本',
          showCancel: false
        })
      }, 1500)
    },

    // 评分应用
    rateApp() {
      uni.showModal({
        title: '给我们评分',
        content: '您的支持是我们前进的动力！',
        confirmText: '去评分',
        success: (res) => {
          if (res.confirm) {
            // 这里应该跳转到应用商店评分页面
            uni.showToast({
              title: '感谢您的支持！',
              icon: 'success'
            })
          }
        }
      })
    },

    // 分享应用
    shareApp() {
      uni.showActionSheet({
        itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享给好友
            uni.showToast({
              title: '分享给好友',
              icon: 'success'
            })
          } else if (res.tapIndex === 1) {
            // 分享到朋友圈
            uni.showToast({
              title: '分享到朋友圈',
              icon: 'success'
            })
          } else if (res.tapIndex === 2) {
            // 复制链接
            uni.setClipboardData({
              data: 'https://linkme.com',
              success: () => {
                uni.showToast({
                  title: '链接已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.about-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #4DD0E1 0%, #80DEEA 100%);
  padding: 40rpx 30rpx;
}

.about-content {
  background: white;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* Logo区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.app-version {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: #4DD0E1;
  font-weight: 500;
}

/* 功能介绍 */
.features-section {
  margin-bottom: 60rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 40rpx;
  display: block;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f8f8f8;
  border-radius: 20rpx;
  transition: all 0.3s;
}

.feature-item:active {
  background: #e8e8e8;
  transform: scale(0.98);
}

.feature-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 24rpx;
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}

/* 团队信息 */
.team-section {
  margin-bottom: 60rpx;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.team-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  text-align: center;
}

/* 版权信息 */
.copyright-section {
  margin-bottom: 60rpx;
  padding-top: 40rpx;
  border-top: 1rpx solid #e0e0e0;
  text-align: center;
}

.copyright-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.6;
  display: block;
  margin-bottom: 8rpx;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  color: white;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 4rpx 20rpx rgba(77, 208, 225, 0.3);
  transition: all 0.3s;
}

.action-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(77, 208, 225, 0.3);
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
}

.btn-text {
  font-size: 30rpx;
  font-weight: 500;
}
</style>
