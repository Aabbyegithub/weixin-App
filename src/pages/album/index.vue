<template>
  <view class="album-container">
    <scroll-view class="album-list" scroll-y @scrolltolower="loadMore">
      <view class="grid">
        <image
          v-for="(img, idx) in images"
          :key="idx"
          class="grid-item"
          :src="img"
          mode="aspectFill"
          @tap="preview(idx)"
        ></image>
      </view>
      <view class="loading" v-if="isLoadingMore"><text>加载中...</text></view>
      <view class="no-more" v-if="noMore && images.length"><text>没有更多了</text></view>
      <view class="empty" v-if="!images.length && !isLoading">
        <image class="empty-image" src="/static/icons/empty.png" mode="aspectFit" />
        <text class="empty-text">暂无图片</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl } from '../../utils/image'

export default {
  data() {
    return {
      images: [],
      page: 1,
      pageSize: 30,
      isLoading: false,
      isLoadingMore: false,
      noMore: false
    }
  },
  onLoad() {
    this.load()
  },
  methods: {
    async load() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await request.get('/api/album', { page: this.page, size: this.pageSize })
        if (res.code === 200 && res.data) {
          const items = (res.data.items || []).map(u => processImageUrl(u.url) || u.url)
          this.images = this.page === 1 ? items : this.images.concat(items)
          this.noMore = !res.data.has_more
          if (res.data.has_more) this.page += 1
        }
      } finally {
        this.isLoading = false
        this.isLoadingMore = false
      }
    },
    loadMore() {
      if (this.noMore || this.isLoadingMore) return
      this.isLoadingMore = true
      this.load()
    },
    preview(index) {
      uni.previewImage({ current: this.images[index], urls: this.images })
    }
  }
}
</script>

<style scoped>
.album-container { width: 100%; height: 100vh; background: #f5f5f5; }
.album-list { height: 100%; padding: 20rpx; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10rpx; }
.grid-item { width: 100%; height: 220rpx; border-radius: 12rpx; }
.loading, .no-more { text-align: center; padding: 30rpx 0; color: #999; }
.empty { padding: 160rpx 0; display: flex; flex-direction: column; align-items: center; }
.empty-image { width: 200rpx; height: 200rpx; margin-bottom: 20rpx; opacity: .6; }
.empty-text { color: #666; }
</style>
