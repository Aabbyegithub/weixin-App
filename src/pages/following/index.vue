<template>
  <view class="list-container">
    <scroll-view class="scroll" scroll-y @scrolltolower="loadMore">
      <view class="user-item" v-for="u in users" :key="u.id">
        <image class="avatar" :src="u.avatar" mode="aspectFill"></image>
        <view class="meta">
          <text class="name">{{ u.nickname }}</text>
          <text class="bio">{{ u.bio || '暂无签名' }}</text>
        </view>
        <button class="btn danger" @tap="unfollow(u)">取消关注</button>
      </view>
      <view class="loading" v-if="isLoadingMore">加载中...</view>
      <view class="no-more" v-if="noMore && users.length">没有更多了</view>
      <view class="empty" v-if="!users.length && !isLoading">暂无关注</view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl, generateUserAvatar } from '../../utils/image'

export default {
  data() {
    return { users: [], page: 1, pageSize: 20, isLoading: false, isLoadingMore: false, noMore: false }
  },
  onLoad() { this.load() },
  methods: {
    async load() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await request.get('/api/following', { page: this.page, size: this.pageSize })
        if (res.code === 200 && res.data) {
          const items = (res.data.items || []).map(x => ({
            id: x.id,
            nickname: x.nickname,
            bio: x.bio,
            avatar: processImageUrl(x.avatar) || generateUserAvatar(x.id)
          }))
          this.users = this.page === 1 ? items : this.users.concat(items)
          this.noMore = !res.data.has_more
          if (res.data.has_more) this.page += 1
        }
      } finally { this.isLoading = false; this.isLoadingMore = false }
    },
    loadMore() { if (!this.noMore && !this.isLoadingMore) { this.isLoadingMore = true; this.load() } },
    async unfollow(user) {
      try { await request.post('/api/unfollow', { user_id: user.id }); this.users = this.users.filter(u => u.id !== user.id) }
      catch(e) { uni.showToast({ title: '操作失败', icon: 'none' }) }
    }
  }
}
</script>

<style scoped>
.list-container { width: 100%; height: 100vh; background: #f5f5f5; }
.scroll { height: 100%; padding: 20rpx; }
.user-item { display: flex; align-items: center; background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; }
.avatar { width: 96rpx; height: 96rpx; border-radius: 50%; margin-right: 20rpx; }
.meta { flex: 1; display: flex; flex-direction: column; }
.name { font-size: 30rpx; color: #333; font-weight: 600; }
.bio { font-size: 24rpx; color: #999; margin-top: 6rpx; }
.btn { padding: 12rpx 24rpx; border-radius: 26rpx; background: #4DD0E1; color: #fff; border: none; }
.btn.danger { background: #ff4757; }
.loading, .no-more, .empty { text-align: center; padding: 30rpx 0; color: #999; }
</style>
