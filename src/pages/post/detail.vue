<template>
  <view class="detail-container">
    <view class="header">
      <image class="avatar" :src="post.author.avatar" mode="aspectFill" />
      <view class="meta">
        <text class="name">{{ post.author.nickname }}</text>
        <text class="time">{{ post.timeStr }}</text>
      </view>
    </view>

    <view class="content">
      <text class="text">{{ post.content }}</text>
    </view>

    <view class="images" v-if="post.images && post.images.length">
      <image v-for="(img, i) in post.images" :key="i" class="img" :src="img" mode="widthFix" @tap="preview(i)" />
    </view>

    <view class="actions">
      <button class="btn" :class="{ primary: post.isLiked }" @tap="toggleLike">❤️ {{ post.likeCount }}</button>
      <button class="btn" :class="{ primary: post.isFavorited }" @tap="toggleFav">⭐ 收藏</button>
      <button class="btn" @tap="share">📤 分享</button>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl, formatTime, generateUserAvatar } from '../../utils/image'

export default {
  data() { return { id: '', post: { author: {} } } },
  onLoad(query) { this.id = query.id; this.load() },
  methods: {
    async load() {
      const res = await request.get(`/api/post/${this.id}`)
      if (res.code === 200 && res.data) {
        const p = res.data
        this.post = {
          id: p.id,
          content: p.text,
          images: (p.images || []).map(x => processImageUrl(x) || x),
          timeStr: formatTime(p.created_at),
          isLiked: !!p.is_liked,
          likeCount: p.likes_count || 0,
          isFavorited: !!p.is_favorited,
          author: { id: p.author.id, nickname: p.author.nickname, avatar: processImageUrl(p.author.avatar) || generateUserAvatar(p.author.id) }
        }
      }
    },
    preview(i) { uni.previewImage({ current: this.post.images[i], urls: this.post.images }) },
    async toggleLike() {
      const to = !this.post.isLiked
      const prev = this.post.likeCount
      this.post.isLiked = to
      this.post.likeCount = to ? prev + 1 : Math.max(0, prev - 1)
      try { await request.post(`/api/post/${this.id}/like`) } catch(e) { this.post.isLiked = !to; this.post.likeCount = prev }
    },
    async toggleFav() {
      const to = !this.post.isFavorited
      this.post.isFavorited = to
      try {
        if (to) await request.post('/api/favorites', { post_id: this.id })
        else await request.delete(`/api/favorites/${this.id}`)
      } catch(e) { this.post.isFavorited = !to }
    },
    share() { uni.showShareMenu({ withShareTicket: true }) }
  }
}
</script>

<style scoped>
.detail-container { padding: 20rpx; }
.header { display:flex; align-items:center; margin-bottom: 12rpx; }
.avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 12rpx; }
.meta { display:flex; flex-direction:column }
.name { font-size: 30rpx; color:#333; font-weight:600 }
.time { font-size: 22rpx; color:#999 }
.content { margin: 12rpx 0 }
.text { font-size: 30rpx; color:#333; line-height: 1.6 }
.images { display:flex; flex-direction:column; gap: 10rpx }
.img { width: 100%; border-radius: 12rpx }
.actions { margin-top: 20rpx; display:flex; gap: 16rpx }
.btn { padding: 16rpx 24rpx; border-radius: 28rpx; background:#eee; color:#333; border:none }
.btn.primary { background:#4DD0E1; color:#fff }
</style>
