<template>
  <view class="feed-container">
    <!-- 顶部导航 -->
    <view class="feed-header">
      <view class="header-tabs">
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'follow' }"
          data-tab="follow"
          @tap="switchTab"
        >
          <text class="tab-text">关注</text>
          <view class="tab-indicator" v-if="activeTab === 'follow'"></view>
        </view>
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'recommend' }"
          data-tab="recommend"
          @tap="switchTab"
        >
          <text class="tab-text">推荐</text>
          <view class="tab-indicator" v-if="activeTab === 'recommend'"></view>
        </view>
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'nearby' }"
          data-tab="nearby"
          @tap="switchTab"
        >
          <text class="tab-text">附近</text>
          <view class="tab-indicator" v-if="activeTab === 'nearby'"></view>
        </view>
      </view>
      <view class="header-search" @tap="goToSearch">
        <image class="search-icon" src="/static/icons/search.png" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 动态列表 -->
    <scroll-view 
      class="feed-list" 
      scroll-y 
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 动态卡片 -->
      <block v-for="item in postList" :key="item.id">
        <PostCard :post="item" @like="onPostLike" @favorite="onPostFavorite"/>
      </block>

      <!-- 加载状态 -->
      <view class="loading-more" v-if="isLoadingMore">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!postList.length && !isLoading">
        <image class="empty-image" src="/static/icons/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无动态</text>
        <text class="empty-hint">快去关注感兴趣的人吧</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="noMore && postList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 悬浮发布按钮 -->
    <view class="fab-button" @tap="goToUpload">
      <image class="fab-icon" src="/static/icons/add.png" mode="aspectFit"></image>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { generateUserAvatar, generatePostImage, formatTime, processImageUrl } from '../../utils/image'

export default {
  data() {
    return {
      activeTab: 'recommend',
      postList: [],
      isRefreshing: false,
      isLoading: false,
      isLoadingMore: false,
      noMore: false,
      page: 1,
      pageSize: 10
    }
  },

  onLoad() {
    this.loadPosts()
  },

  onShow() {
    // 检查登录状态
    const app = getApp()
    if (!app.checkLogin()) {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }
  },

  methods: {
    // 切换标签
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab
      if (tab === this.activeTab) return
      
      this.activeTab = tab
      this.postList = []
      this.page = 1
      this.noMore = false
      
      this.loadPosts()
    },

    // 加载动态
    async loadPosts() {
      if (this.isLoading) return
      
      this.isLoading = true
      
      try {
        const res = await request.get('/api/feed', {
          page: this.page,
          size: this.pageSize
        })
        
        if (res.code === 200 && res.data) {
          const { posts, has_more } = res.data
          
          // 处理动态数据，使用真实数据库信息
          const processedPosts = posts.map((post, postIndex) => ({
            id: post.id,
            userId: post.author.id,
            nickname: post.author.nickname,
            avatar: processImageUrl(post.author.avatar) || generateUserAvatar(post.author.id), // 处理头像URL
            content: post.text,
            images: post.images, // 直接使用数据库中的图片URLs
            timeStr: formatTime(post.created_at),
            likeCount: post.likes_count,
            commentCount: post.comments_count,
            shareCount: Math.floor(post.likes_count * 0.3), // 基于点赞数计算分享数
            isLiked: post.is_liked,
            isFavorited: post.is_favorited || false, // 收藏状态
            location: null // 暂时没有位置信息
          }))
          
          this.postList = this.page === 1 ? processedPosts : [...this.postList, ...processedPosts]
          this.isLoading = false
          this.isRefreshing = false
          this.isLoadingMore = false
          this.noMore = !has_more
          
          // 只有在成功加载且有更多数据时才增加页码
          if (has_more) {
            this.page = this.page + 1
          }
        }
      } catch (error) {
        console.error('Load posts error:', error)
        this.isLoading = false
        this.isRefreshing = false
        this.isLoadingMore = false
      }
    },

    // 下拉刷新
    onRefresh() {
      this.isRefreshing = true
      this.page = 1
      this.noMore = false
      this.loadPosts()
    },

    // 上拉加载更多
    onLoadMore() {
      if (this.noMore || this.isLoadingMore) return
      
      this.isLoadingMore = true
      this.page = this.page + 1
      this.loadPosts()
    },

    // 点赞事件
    async onPostLike(e) {
      const { postId, isLiked, likeCount } = e.detail
      
      try {
        // 发送点赞请求到后端
        const res = await request.post(`/api/post/${postId}/like`, {}, {
          showLoading: false
        })
        
        if (res.code === 200) {
          const postList = this.postList.map(post => {
            if (post.id === postId) {
              return { ...post, isLiked, likeCount }
            }
            return post
          })
          
          this.postList = postList
          
          // 显示点赞动画
          uni.showToast({
            title: isLiked ? '已点赞' : '已取消',
            icon: 'none',
            duration: 1000
          })
        }
      } catch (error) {
        console.error('Like post error:', error)
      }
    },

    // 收藏动态
    async onPostFavorite(e) {
      const { postId, isFavorited } = e.detail
      
      try {
        let res
        if (isFavorited) {
          // 添加收藏
          res = await request.post('/api/favorites', { post_id: postId })
        } else {
          // 取消收藏
          res = await request.delete(`/api/favorites/${postId}`)
        }
        
        if (res.code === 200) {
          const postList = this.postList.map(post => {
            if (post.id === postId) {
              return { ...post, isFavorited }
            }
            return post
          })
          
          this.postList = postList
        }
      } catch (error) {
        console.error('Favorite post error:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 跳转搜索
    goToSearch() {
      uni.navigateTo({
        url: '/pages/search/index'
      })
    },

    // 跳转发布
    goToUpload() {
      uni.switchTab({
        url: '/pages/upload/index'
      })
    },

    // 分享
    onShareAppMessage() {
      return {
        title: 'Link Me - 链接你我，分享精彩',
        path: '/pages/feed/index'
      }
    },

    onShareTimeline() {
      return {
        title: '发现精彩瞬间'
      }
    }
  }
}
</script>

<style scoped>
/* 动态页样式 */
.feed-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.feed-header {
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-tabs {
  display: flex;
  gap: 60rpx;
}

.tab-item {
  position: relative;
  padding: 20rpx 0;
  cursor: pointer;
}

.tab-text {
  font-size: 32rpx;
  color: #666666;
  font-weight: 500;
  transition: color 0.3s;
}

.tab-item.active .tab-text {
  color: #4DD0E1;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #4DD0E1;
  border-radius: 2rpx;
}

.header-search {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 50%;
  transition: all 0.3s;
}

.header-search:active {
  background: #e8e8e8;
  transform: scale(0.95);
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
}

/* 动态列表 */
.feed-list {
  flex: 1;
  padding: 20rpx 0;
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

/* 没有更多 */
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

/* 悬浮发布按钮 */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(77, 208, 225, 0.4);
  z-index: 1000;
  transition: all 0.3s;
}

.fab-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 20rpx rgba(77, 208, 225, 0.4);
}

.fab-icon {
  width: 48rpx;
  height: 48rpx;
}
</style>

