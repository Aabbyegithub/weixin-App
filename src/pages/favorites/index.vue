<template>
  <view class="favorites-container">
    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view class="filter-tabs">
        <view 
          class="filter-tab"
          :class="{ active: activeFilter === 'all' }"
          @tap="switchFilter"
          data-filter="all"
        >
          <text class="tab-text">全部</text>
        </view>
        <view 
          class="filter-tab"
          :class="{ active: activeFilter === 'posts' }"
          @tap="switchFilter"
          data-filter="posts"
        >
          <text class="tab-text">动态</text>
        </view>
        <view 
          class="filter-tab"
          :class="{ active: activeFilter === 'images' }"
          @tap="switchFilter"
          data-filter="images"
        >
          <text class="tab-text">图片</text>
        </view>
      </view>
    </view>

    <!-- 收藏列表 -->
    <scroll-view class="favorites-list" scroll-y @scrolltolower="onLoadMore">
      <!-- 收藏项目 -->
      <block v-for="item in favoritesList" :key="item.id">
        <view class="favorite-item" @tap="viewDetail" :data-id="item.id">
          <!-- 动态类型 -->
          <view class="favorite-post" v-if="item.type === 'post'">
            <view class="post-header">
              <image class="user-avatar" :src="item.author.avatar" mode="aspectFill"></image>
              <view class="user-info">
                <text class="user-name">{{ item.author.nickname }}</text>
                <text class="post-time">{{ item.timeStr }}</text>
              </view>
              <view class="favorite-time">
                <text class="time-text">{{ item.favoriteTime }}</text>
              </view>
            </view>
            
            <view class="post-content">
              <text class="content-text">{{ item.content }}</text>
            </view>
            
            <view class="post-images" v-if="item.images && item.images.length > 0">
              <image 
                class="post-image" 
                v-for="(img, index) in item.images.slice(0, 3)" 
                :key="index"
                :src="img" 
                mode="aspectFill"
                @tap.stop="previewImage"
                :data-url="img"
                :data-urls="item.images"
              ></image>
              <view class="more-images" v-if="item.images.length > 3">
                <text class="more-text">+{{ item.images.length - 3 }}</text>
              </view>
            </view>
            
            <view class="post-stats">
              <view class="stat-item">
                <text class="stat-icon">❤️</text>
                <text class="stat-text">{{ item.likeCount }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">💬</text>
                <text class="stat-text">{{ item.commentCount }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">📤</text>
                <text class="stat-text">{{ item.shareCount }}</text>
              </view>
            </view>
          </view>

          <!-- 图片类型 -->
          <view class="favorite-image" v-else-if="item.type === 'image'">
            <image class="image-preview" :src="item.imageUrl" mode="aspectFill"></image>
            <view class="image-info">
              <text class="image-title">{{ item.title }}</text>
              <text class="image-desc">{{ item.description }}</text>
              <text class="image-time">{{ item.favoriteTime }}</text>
            </view>
          </view>
        </view>
      </block>

      <!-- 空状态 -->
      <view class="empty-state" v-if="favoritesList.length === 0 && !isLoading">
        <image class="empty-image" src="/static/icons/empty_favorites.png" mode="aspectFit"></image>
        <text class="empty-text">暂无收藏</text>
        <text class="empty-hint">快去收藏喜欢的内容吧</text>
      </view>

      <!-- 加载更多 -->
      <view class="loading-more" v-if="isLoadingMore">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="noMore && favoritesList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { formatTime, processImageUrl } from '../../utils/image'

export default {
  data() {
    return {
      activeFilter: 'all',
      favoritesList: [],
      isLoading: false,
      isLoadingMore: false,
      noMore: false,
      page: 1,
      pageSize: 10
    }
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    // 刷新收藏列表
    this.refreshFavorites()
  },

  methods: {
    // 切换筛选条件
    switchFilter(e) {
      const filter = e.currentTarget.dataset.filter
      if (filter === this.activeFilter) return
      
      this.activeFilter = filter
      this.favoritesList = []
      this.page = 1
      this.noMore = false
      this.loadFavorites()
    },

    // 加载收藏列表
    async loadFavorites() {
      if (this.isLoading) return
      
      this.isLoading = true
      
      try {
        const res = await request.get('/api/favorites', {
          page: this.page,
          size: this.pageSize,
          type: this.activeFilter === 'all' ? '' : this.activeFilter
        })
        
        if (res.code === 200 && res.data) {
          const { favorites, has_more } = res.data
          
          // 处理收藏数据
          const processedFavorites = favorites.map(fav => {
            if (fav.type === 'post') {
              return {
                id: fav.id,
                type: 'post',
                content: fav.post.text,
                images: fav.post.images || [],
                author: {
                  id: fav.post.author.id,
                  nickname: fav.post.author.nickname,
                  avatar: processImageUrl(fav.post.author.avatar) || '/static/images/default-avatar.png'
                },
                timeStr: formatTime(fav.post.created_at),
                favoriteTime: formatTime(fav.created_at),
                likeCount: fav.post.likes_count || 0,
                commentCount: fav.post.comments_count || 0,
                shareCount: Math.floor((fav.post.likes_count || 0) * 0.3)
              }
            } else {
              return {
                id: fav.id,
                type: 'image',
                imageUrl: processImageUrl(fav.image_url) || fav.image_url,
                title: fav.title || '收藏的图片',
                description: fav.description || '',
                favoriteTime: formatTime(fav.created_at)
              }
            }
          })
          
          this.favoritesList = this.page === 1 ? processedFavorites : [...this.favoritesList, ...processedFavorites]
          this.noMore = !has_more
          
          if (has_more) {
            this.page = this.page + 1
          }
        }
      } catch (error) {
        console.error('Load favorites error:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
        this.isLoadingMore = false
      }
    },

    // 刷新收藏列表
    refreshFavorites() {
      this.favoritesList = []
      this.page = 1
      this.noMore = false
      this.loadFavorites()
    },

    // 加载更多
    onLoadMore() {
      if (this.noMore || this.isLoadingMore) return
      
      this.isLoadingMore = true
      this.loadFavorites()
    },

    // 查看详情
    viewDetail(e) {
      const id = e.currentTarget.dataset.id
      const item = this.favoritesList.find(fav => fav.id === id)
      
      if (item && item.type === 'post') {
        uni.navigateTo({
          url: `/pages/post/detail?id=${item.id}`
        })
      }
    },

    // 预览图片
    previewImage(e) {
      const url = e.currentTarget.dataset.url
      const urls = e.currentTarget.dataset.urls
      
      uni.previewImage({
        current: url,
        urls: urls
      })
    }
  }
}
</script>

<style scoped>
.favorites-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.filter-tabs {
  display: flex;
  gap: 40rpx;
}

.filter-tab {
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  transition: all 0.3s;
}

.filter-tab.active {
  background: #4DD0E1;
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.filter-tab.active .tab-text {
  color: white;
  font-weight: 600;
}

/* 收藏列表 */
.favorites-list {
  flex: 1;
  padding: 20rpx;
}

.favorite-item {
  background: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.favorite-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

/* 动态类型样式 */
.favorite-post {
  padding: 30rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
}

.favorite-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-text {
  font-size: 22rpx;
  color: #4DD0E1;
  background: rgba(77, 208, 225, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.post-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.post-images {
  display: flex;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.more-images {
  width: 200rpx;
  height: 200rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-text {
  color: white;
  font-size: 28rpx;
  font-weight: 600;
}

.post-stats {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #666666;
}

/* 图片类型样式 */
.favorite-image {
  display: flex;
  padding: 30rpx;
}

.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.image-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.image-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.image-time {
  font-size: 24rpx;
  color: #999999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #999999;
}

/* 加载状态 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
