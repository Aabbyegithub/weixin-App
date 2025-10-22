<template>
  <view class="noti-container">
    <scroll-view class="list" scroll-y @scrolltolower="loadMore">
      <view class="item" v-for="n in notifications" :key="n.id" :class="{ unread: !n.read }" @tap="open(n)">
        <view class="left">
          <image class="icon" :src="n.icon" mode="aspectFit" />
        </view>
        <view class="right">
          <view class="row">
            <text class="title">{{ n.title }}</text>
            <text class="time">{{ n.timeStr }}</text>
          </view>
          <text class="content">{{ n.content }}</text>
        </view>
      </view>
      <view class="loading" v-if="isLoadingMore">加载中...</view>
      <view class="no-more" v-if="noMore && notifications.length">没有更多了</view>
      <view class="empty" v-if="!notifications.length && !isLoading">暂无通知</view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { formatTime } from '../../utils/image'

export default {
  data() {
    return { notifications: [], page: 1, pageSize: 20, isLoading: false, isLoadingMore: false, noMore: false }
  },
  onLoad() { this.load() },
  methods: {
    async load() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await request.get('/api/notifications', { page: this.page, size: this.pageSize })
        if (res.code === 200 && res.data) {
          const items = (res.data.notifications || []).map(x => ({
            id: x.id,
            title: x.title || '系统通知',
            content: x.content || '',
            timeStr: formatTime(x.created_at),
            read: !!x.read,
            icon: '/static/icons/notification.png'
          }))
          this.notifications = this.page === 1 ? items : this.notifications.concat(items)
          this.noMore = !res.data.has_more
          if (res.data.has_more) this.page += 1
        }
      } finally { this.isLoading = false; this.isLoadingMore = false }
    },
    loadMore() { if (!this.noMore && !this.isLoadingMore) { this.isLoadingMore = true; this.load() } },
    async open(n) {
      if (!n.read) {
        try { await request.post(`/api/notifications/${n.id}/read`) } catch(e) {}
        n.read = true
      }
      // 可根据类型跳转
    }
  }
}
</script>

<style scoped>
.noti-container { width: 100%; height: 100vh; background: #f5f5f5; }
.list { height: 100%; padding: 20rpx; }
.item { display:flex; background:#fff; padding:20rpx; border-radius:16rpx; margin-bottom:16rpx; }
.item.unread { background: #f0fbfd; }
.left { width: 80rpx; display:flex; align-items:center; justify-content:center; }
.icon { width: 44rpx; height: 44rpx; }
.right { flex:1; display:flex; flex-direction:column; }
.row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8rpx; }
.title { font-size:30rpx; color:#333; font-weight:600; }
.time { font-size:22rpx; color:#999; }
.content { font-size:26rpx; color:#555; line-height:1.5; }
.loading, .no-more, .empty { text-align:center; padding: 30rpx 0; color:#999; }
</style>
