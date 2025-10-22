<template>
  <view class="post-card" @tap="onCardTap">
    <!-- 用户信息头部 -->
    <view class="post-header">
      <image class="user-avatar" :src="post.avatar || '/static/images/default-avatar.png'" @tap="onAvatarTap"></image>
      <view class="user-info">
        <text class="user-name">{{ post.nickname || post.username }}</text>
        <text class="post-time">{{ post.timeStr || post.timeText }}</text>
      </view>
      <view class="more-btn" @tap.stop="onMoreTap">
        <text class="iconfont icon-more">⋯</text>
      </view>
    </view>
    
    <!-- 帖子内容 -->
    <view class="post-content">
      <text class="content-text" user-select>{{ post.content }}</text>
    </view>
    
    <!-- 图片展示 -->
    <view class="post-images" v-if="post.images && post.images.length > 0">
      <!-- 单图 -->
      <view class="image-single" v-if="post.images.length === 1">
        <image 
          class="single-img" 
          :src="post.images[0]" 
          mode="widthFix"
          @tap="onImageTap"
          :data-index="0"
        ></image>
      </view>
      
      <!-- 多图 -->
      <view class="image-grid" :class="`image-grid-${post.images.length > 4 ? '3' : '2'}`" v-else>
        <image 
          class="grid-img" 
          v-for="(item, index) in post.images" 
          :key="index"
          :src="item"
          mode="aspectFill"
          @tap="onImageTap"
          :data-index="index"
          v-if="index < 9"
        ></image>
      </view>
    </view>
    
    <!-- 位置信息 -->
    <view class="post-location" v-if="post.location">
      <text class="iconfont icon-location">📍</text>
      <text class="location-text">{{ post.location }}</text>
    </view>
    
    <!-- 互动栏 -->
    <view class="post-actions">
      <view class="action-item" @tap.stop="onLikeTap">
        <text class="iconfont" :class="post.isLiked ? 'icon-like-fill liked' : 'icon-like'">❤️</text>
        <text class="action-text">{{ post.likeCount || 0 }}</text>
      </view>
      <view class="action-item" @tap.stop="onCommentTap">
        <text class="iconfont icon-comment">💬</text>
        <text class="action-text">{{ post.commentCount || 0 }}</text>
      </view>
      <view class="action-item" @tap.stop="onShareTap">
        <text class="iconfont icon-share">📤</text>
        <text class="action-text">分享</text>
      </view>
    </view>
    
    <!-- 评论预览 -->
    <view class="comment-preview" v-if="post.topComments && post.topComments.length > 0">
      <view class="comment-item" v-for="(item, index) in post.topComments" :key="item.id" v-if="index < 2">
        <text class="comment-name">{{ item.username }}:</text>
        <text class="comment-content">{{ item.content }}</text>
      </view>
      <view class="view-all-comments" v-if="post.commentCount > 2" @tap.stop="onCommentTap">
        查看全部{{ post.commentCount }}条评论
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    // 点击卡片
    onCardTap() {
      uni.navigateTo({
        url: `/pages/post/detail?id=${this.post.id}`
      })
    },

    // 点击头像
    onAvatarTap(e) {
      e.stopPropagation()
      uni.navigateTo({
        url: `/pages/profile/index?userId=${this.post.userId}`
      })
    },

    // 点击更多
    onMoreTap(e) {
      e.stopPropagation()
      uni.showActionSheet({
        itemList: ['举报', '不感兴趣', '复制链接'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '举报成功',
              icon: 'success'
            })
          } else if (res.tapIndex === 1) {
            uni.showToast({
              title: '已减少推荐',
              icon: 'success'
            })
          } else if (res.tapIndex === 2) {
            uni.setClipboardData({
              data: `linkme://post/${this.post.id}`,
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
    },

    // 点击图片
    onImageTap(e) {
      e.stopPropagation()
      const index = e.currentTarget.dataset.index
      uni.previewImage({
        current: this.post.images[index],
        urls: this.post.images
      })
    },

    // 点赞
    onLikeTap(e) {
      e.stopPropagation()
      const post = this.post
      post.isLiked = !post.isLiked
      post.likeCount = post.isLiked ? (post.likeCount + 1) : (post.likeCount - 1)
      
      // 触发事件
      this.$emit('like', {
        postId: post.id,
        isLiked: post.isLiked,
        likeCount: post.likeCount
      })
    },

    // 评论
    onCommentTap(e) {
      e.stopPropagation()
      uni.navigateTo({
        url: `/pages/post/detail?id=${this.post.id}&focus=comment`
      })
    },

    // 分享
    onShareTap(e) {
      e.stopPropagation()
      this.$emit('share', {
        postId: this.post.id
      })
    }
  }
}
</script>

<style scoped>
/* 帖子卡片样式 */
.post-card {
  background: white;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.post-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

/* 用户信息头部 */
.post-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  position: relative;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #f0f0f0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
}

.more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.more-btn:active {
  background: #f0f0f0;
}

.icon-more {
  font-size: 32rpx;
  color: #666666;
  font-weight: bold;
}

/* 帖子内容 */
.post-content {
  padding: 0 30rpx 20rpx;
}

.content-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333333;
  word-break: break-all;
}

/* 图片展示 */
.post-images {
  margin: 0 30rpx 20rpx;
}

.image-single {
  border-radius: 16rpx;
  overflow: hidden;
}

.single-img {
  width: 100%;
  max-height: 600rpx;
  border-radius: 16rpx;
}

.image-grid {
  display: grid;
  gap: 8rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.image-grid-2 {
  grid-template-columns: 1fr 1fr;
}

.image-grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.grid-img {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
}

/* 位置信息 */
.post-location {
  display: flex;
  align-items: center;
  padding: 0 30rpx 20rpx;
  color: #666666;
}

.icon-location {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.location-text {
  font-size: 24rpx;
}

/* 互动栏 */
.post-actions {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 60rpx;
  padding: 10rpx 0;
  transition: all 0.3s;
}

.action-item:active {
  transform: scale(0.95);
}

.iconfont {
  font-size: 32rpx;
  margin-right: 8rpx;
  transition: all 0.3s;
}

.icon-like-fill.liked {
  color: #ff4757;
  transform: scale(1.2);
}

.action-text {
  font-size: 26rpx;
  color: #666666;
}

/* 评论预览 */
.comment-preview {
  padding: 0 30rpx 20rpx;
  background: #f8f8f8;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e8e8e8;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-name {
  font-size: 26rpx;
  color: #4DD0E1;
  font-weight: 600;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.comment-content {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.4;
  flex: 1;
}

.view-all-comments {
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #4DD0E1;
  text-align: center;
  transition: all 0.3s;
}

.view-all-comments:active {
  background: #f0f0f0;
  border-radius: 8rpx;
}
</style>

