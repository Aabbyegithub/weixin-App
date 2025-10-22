<template>
  <view class="profile-container">
    <view class="header">
      <image class="avatar" :src="user.avatar" mode="aspectFill" />
      <view class="meta">
        <text class="name">{{ user.nickname || '未命名' }}</text>
        <text class="bio">{{ user.bio || '这个人很神秘' }}</text>
        <view class="stats">
          <text class="stat" @tap="go('following')">关注 {{ stats.following }}</text>
          <text class="stat" @tap="go('followers')">粉丝 {{ stats.followers }}</text>
          <text class="stat">动态 {{ stats.posts }}</text>
        </view>
      </view>
      <button class="edit" @tap="edit">编辑资料</button>
    </view>

    <view class="tabs">
      <text class="tab" :class="{active: tab==='posts'}" @tap="switchTab('posts')">动态</text>
      <text class="tab" :class="{active: tab==='likes'}" @tap="switchTab('likes')">获赞</text>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <block v-for="p in list" :key="p.id">
        <view class="card" @tap="open(p)">
          <text class="text">{{ p.text }}</text>
          <image v-if="p.images && p.images[0]" class="cover" :src="p.images[0]" mode="aspectFill" />
        </view>
      </block>
      <view class="loading" v-if="isLoadingMore">加载中...</view>
      <view class="no-more" v-if="noMore && list.length">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl, generateUserAvatar } from '../../utils/image'

export default {
  data(){
    return { userId: '', user: {}, stats:{following:0,followers:0,posts:0}, tab: 'posts', list: [], page:1, pageSize:10, isLoading:false, isLoadingMore:false, noMore:false }
  },
  onLoad(q){ this.userId = q.userId || ''; this.loadUser(); this.load() },
  methods:{
    async loadUser(){
      const res = await request.get(`/api/user/${this.userId}`)
      if (res.code===200 && res.data){
        const u = res.data
        this.user = { id:u.id, nickname:u.nickname, bio:u.bio, avatar: processImageUrl(u.avatar) || generateUserAvatar(u.id) }
        this.stats = { following: u.following_count||0, followers: u.followers_count||0, posts: (u.posts||[]).length }
      }
    },
    async load(){
      if (this.isLoading) return
      this.isLoading = true
      try {
        const res = await request.get('/api/user/posts', { user_id: this.userId, page:this.page, size:this.pageSize, type:this.tab })
        if (res.code===200 && res.data){
          const items = (res.data.items||[]).map(p=>({ id:p.id, text:p.text, images:(p.images||[]).map(x=>processImageUrl(x)||x) }))
          this.list = this.page===1?items:this.list.concat(items)
          this.noMore = !res.data.has_more
          if (res.data.has_more) this.page+=1
        }
      } finally { this.isLoading=false; this.isLoadingMore=false }
    },
    loadMore(){ if (!this.noMore && !this.isLoadingMore){ this.isLoadingMore = true; this.load() } },
    switchTab(t){ if (this.tab!==t){ this.tab=t; this.page=1; this.noMore=false; this.list=[]; this.load() } },
    open(p){ uni.navigateTo({ url: `/pages/post/detail?id=${p.id}` }) },
    edit(){ uni.navigateTo({ url: '/pages/profile/edit' }) },
    go(type){ uni.navigateTo({ url: `/pages/${type}/index` }) }
  }
}
</script>

<style scoped>
.profile-container{ background:#f5f5f5; min-height:100vh }
.header{ display:flex; padding:24rpx; background:#fff }
.avatar{ width:120rpx; height:120rpx; border-radius:50%; margin-right:16rpx }
.meta{ flex:1; display:flex; flex-direction:column }
.name{ font-size:34rpx; color:#333; font-weight:700 }
.bio{ font-size:26rpx; color:#666; margin-top:6rpx }
.stats{ display:flex; gap:20rpx; margin-top:10rpx; color:#666; font-size:24rpx }
.edit{ align-self:flex-start; background:#4DD0E1; color:#fff; border:none; border-radius:24rpx; padding:10rpx 20rpx }
.tabs{ display:flex; background:#fff; margin-top:12rpx }
.tab{ flex:1; text-align:center; padding:20rpx 0; color:#666 }
.tab.active{ color:#4DD0E1; font-weight:700; border-bottom: 4rpx solid #4DD0E1 }
.content{ height: calc(100vh - 320rpx); padding:20rpx }
.card{ background:#fff; border-radius:16rpx; padding:20rpx; margin-bottom:16rpx }
.text{ font-size:28rpx; color:#333; margin-bottom:10rpx }
.cover{ width:100%; height:300rpx; border-radius:12rpx }
.loading,.no-more{text-align:center;color:#999;padding:20rpx 0}
</style>
