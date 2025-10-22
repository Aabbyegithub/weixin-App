<template>
  <view class="postlist-container">
    <scroll-view class="list" scroll-y @scrolltolower="loadMore">
      <block v-for="p in posts" :key="p.id">
        <view class="post-item" @tap="open(p)">
          <view class="row">
            <image class="avatar" :src="p.author.avatar" mode="aspectFill" />
            <view class="meta">
              <text class="name">{{ p.author.nickname }}</text>
              <text class="time">{{ p.timeStr }}</text>
            </view>
          </view>
          <text class="content">{{ p.content }}</text>
          <view class="thumbs" v-if="p.images && p.images.length">
            <image v-for="(img,i) in p.images.slice(0,3)" :key="i" class="thumb" :src="img" mode="aspectFill" />
          </view>
        </view>
      </block>
      <view class="loading" v-if="isLoadingMore">加载中...</view>
      <view class="no-more" v-if="noMore && posts.length">没有更多了</view>
      <view class="empty" v-if="!posts.length && !isLoading">暂无动态</view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { formatTime, processImageUrl, generateUserAvatar } from '../../utils/image'

export default {
  data() {
    return { posts: [], page: 1, pageSize: 10, isLoading: false, isLoadingMore: false, noMore: false }
  },
  onLoad() { this.load() },
  methods: {
    async load() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await request.get('/api/post/mine', { page: this.page, size: this.pageSize })
        if (res.code === 200 && res.data) {
          const items = (res.data.posts || []).map(p => ({
            id: p.id,
            content: p.text,
            images: (p.images || []).map(x => processImageUrl(x) || x),
            timeStr: formatTime(p.created_at),
            author: { id: p.author.id, nickname: p.author.nickname, avatar: processImageUrl(p.author.avatar) || generateUserAvatar(p.author.id) }
          }))
          this.posts = this.page === 1 ? items : this.posts.concat(items)
          this.noMore = !res.data.has_more
          if (res.data.has_more) this.page += 1
        }
      } finally { this.isLoading = false; this.isLoadingMore = false }
    },
    loadMore() { if (!this.noMore && !this.isLoadingMore) { this.isLoadingMore = true; this.load() } },
    open(p) { uni.navigateTo({ url: `/pages/post/detail?id=${p.id}` }) }
  }
}
</script>

<style scoped>
.postlist-container { width:100%; height:100vh; background:#f5f5f5; }
.list { height:100%; padding:20rpx; }
.post-item { background:#fff; border-radius:16rpx; padding:20rpx; margin-bottom:16rpx; }
.row { display:flex; align-items:center; margin-bottom:10rpx; }
.avatar { width:72rpx; height:72rpx; border-radius:50%; margin-right:12rpx; }
.meta { display:flex; flex-direction:column; }
.name { font-size:28rpx; color:#333; font-weight:600; }
.time { font-size:22rpx; color:#999; }
.content { font-size:28rpx; color:#333; line-height:1.5; margin:8rpx 0; }
.thumbs { display:flex; gap:8rpx; }
.thumb { width:200rpx; height:200rpx; border-radius:12rpx; }
.loading, .no-more, .empty { text-align:center; padding: 30rpx 0; color:#999; }
</style>
