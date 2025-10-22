<template>
  <view class="upload-container">
    <!-- 内容输入区 -->
    <view class="content-section">
      <textarea 
        class="content-input"
        placeholder="分享你的精彩瞬间..."
        placeholder-class="input-placeholder"
        maxlength="500"
        auto-height
        v-model="content"
        @input="onContentInput"
      ></textarea>
      <text class="char-count">{{ content.length }}/500</text>
    </view>

    <!-- 图片上传区 -->
    <view class="image-section">
      <view class="image-list">
        <!-- 已选择的图片 -->
        <block v-for="(item, index) in imageList" :key="index">
          <view class="image-item">
            <image class="preview-image" :src="item" mode="aspectFill"></image>
            <view class="remove-btn" @tap="removeImage" :data-index="index">
              <text class="remove-icon">×</text>
            </view>
          </view>
        </block>
        
        <!-- 添加图片按钮 -->
        <view class="add-image" v-if="imageList.length < 9" @tap="chooseImage">
          <image class="add-icon" src="/static/icons/camera.png" mode="aspectFit"></image>
          <text class="add-text">{{ imageList.length }}/9</text>
        </view>
      </view>
    </view>

    <!-- 分割线 -->
    <view class="divider"></view>

    <!-- 底部发布栏 -->
    <view class="publish-bar safe-area-bottom">
      <view class="toolbar">
        <text class="tips-text">💡 分享你的精彩瞬间</text>
      </view>
      
      <button class="publish-btn" :class="{ active: canPublish }" @tap="handlePublish" :disabled="!canPublish">
        📤 发布
      </button>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'

export default {
  data() {
    return {
      content: '',
      imageList: [],
      canPublish: false
    }
  },

  onLoad() {
    // 检查登录状态
    const app = getApp()
    if (!app.checkLogin()) {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }
  },

  methods: {
    // 内容输入
    onContentInput(e) {
      const content = e.detail.value
      this.content = content
      this.canPublish = content.trim().length > 0 || this.imageList.length > 0
    },

    // 选择图片
    chooseImage() {
      const remainCount = 9 - this.imageList.length
      
      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const imageList = [...this.imageList, ...res.tempFilePaths]
          this.imageList = imageList
          this.canPublish = this.content.trim().length > 0 || imageList.length > 0
        }
      })
    },

    // 移除图片
    removeImage(e) {
      const index = e.currentTarget.dataset.index
      const imageList = this.imageList.filter((_, i) => i !== index)
      
      this.imageList = imageList
      this.canPublish = this.content.trim().length > 0 || imageList.length > 0
    },

    // 发布
    async handlePublish() {
      if (!this.canPublish) return
      
      uni.showLoading({
        title: '发布中...'
      })
      
      try {
        // 先上传图片
        const uploadedImages = []
        for (const imagePath of this.imageList) {
          try {
            const uploadRes = await request.upload('/api/upload', imagePath)
            if (uploadRes.code === 200 && uploadRes.data) {
              uploadedImages.push(uploadRes.data.url)
            }
          } catch (err) {
            console.error('Upload image error:', err)
          }
        }
        
        // 发布动态
        const res = await request.post('/api/post', {
          text: this.content,
          images: uploadedImages
        })
        
        uni.hideLoading()
        
        if (res.code === 200) {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })
          
          // 清空数据
          this.content = ''
          this.imageList = []
          this.canPublish = false
          
          // 跳转到动态页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/feed/index'
            })
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Publish error:', error)
      }
    }
  }
}
</script>

<style scoped>
/* 发布页样式 */
.upload-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 内容输入区 */
.content-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 30rpx;
  line-height: 1.6;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #cccccc;
  font-size: 28rpx;
}

.char-count {
  position: absolute;
  bottom: 20rpx;
  right: 30rpx;
  font-size: 24rpx;
  color: #999999;
}

/* 图片上传区 */
.image-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid white;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.remove-btn:active {
  transform: scale(0.9);
}

.remove-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.add-image {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #cccccc;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  transition: all 0.3s;
}

.add-image:active {
  background: #e8e8e8;
  border-color: #4DD0E1;
}

.add-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 16rpx;
  opacity: 0.6;
}

.add-text {
  font-size: 24rpx;
  color: #666666;
}

/* 分割线 */
.divider {
  height: 20rpx;
  background: #f5f5f5;
}

/* 底部发布栏 */
.publish-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.toolbar {
  flex: 1;
}

.tips-text {
  font-size: 26rpx;
  color: #666666;
}

.publish-btn {
  padding: 20rpx 40rpx;
  background: #cccccc;
  color: white;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 50rpx;
  border: none;
  transition: all 0.3s;
  min-width: 160rpx;
}

.publish-btn.active {
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  box-shadow: 0 4rpx 20rpx rgba(77, 208, 225, 0.3);
}

.publish-btn.active:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(77, 208, 225, 0.3);
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>

