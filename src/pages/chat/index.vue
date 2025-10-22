<template>
  <view class="chat-index">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <input class="search-input" placeholder="搜索聊天/群聊" v-model="searchText" @input="onSearchInput" />
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <text class="tab" :class="{active: activeTab==='recent'}" @tap="switchTab('recent')">最近</text>
      <text class="tab" :class="{active: activeTab==='groups'}" @tap="switchTab('groups')">群聊</text>
      <view class="spacer"></view>
      <text class="new" @tap="startNewChat">＋</text>
    </view>

    <!-- 列表 -->
    <scroll-view class="list" scroll-y>
      <block v-if="isSearching">
        <view class="item" v-for="c in searchResults" :key="c.id" @tap="goToChat(c)">
          <image class="avatar" :src="c.avatar" mode="aspectFill" />
          <view class="meta">
            <text class="name">{{ c.name }}</text>
            <text class="last">{{ c.last || '暂无消息' }}</text>
          </view>
          <text class="time">{{ c.time || '' }}</text>
        </view>
      </block>
      <block v-else>
        <!-- 最近 -->
        <view v-if="activeTab==='recent'">
          <view class="item" v-for="c in recentChats" :key="c.id" @tap="goToChat(c)">
            <image class="avatar" :src="c.avatar" mode="aspectFill" />
            <view class="meta">
              <text class="name">{{ c.name }}</text>
              <text class="last">{{ c.last || '暂无消息' }}</text>
            </view>
            <text class="time">{{ c.time || '' }}</text>
          </view>
        </view>
        <!-- 群聊 -->
        <view v-else>
          <view class="item" v-for="g in groupChats" :key="g.id" @tap="goToChat(g)">
            <image class="avatar" :src="g.avatar" mode="aspectFill" />
            <view class="meta">
              <text class="name">{{ g.name }}</text>
              <text class="last">{{ g.last || '暂无消息' }}</text>
            </view>
            <text class="time">{{ g.time || '' }}</text>
          </view>
        </view>
      </block>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl, generateUserAvatar, formatTime } from '../../utils/image'

export default {
  data(){
    return {
      activeTab: 'recent',
      recentChats: [],
      groupChats: [],
      searchText: '',
      isSearching: false,
      searchResults: []
    }
  },
  onLoad(){ this.loadRecent(); this.loadGroups() },
  onShow(){ const app=getApp(); if (!app.checkLogin()) { uni.redirectTo({ url:'/pages/login/index' }); return } this.loadRecent() },
  methods:{
    async loadRecent(){
      try{
        const res = await request.get('/api/chat/recent')
        if (res.code===200 && res.data){
          this.recentChats = (res.data.chats||[]).map(c=>({
            id:c.id,
            type:c.type||'private',
            userId:c.peer?.id,
            name: c.peer?.nickname || c.name || '会话',
            avatar: processImageUrl(c.peer?.avatar) || generateUserAvatar(c.peer?.id||'0'),
            last: c.last_msg || '',
            time: formatTime(c.last_ts)
          }))
        }
      }catch(e){ uni.showToast({ title:'加载失败', icon:'none' }) }
    },
    async loadGroups(){
      try{
        const res = await request.get('/api/chat/groups')
        if (res.code===200 && res.data){
          this.groupChats = (res.data.groups||[]).map(g=>({
            id:g.id,
            type:'group',
            name:g.name,
            avatar: g.avatar ? processImageUrl(g.avatar) : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
            last: g.last_msg || '',
            time: formatTime(g.last_ts)
          }))
        }
      }catch(e){}
    },
    switchTab(t){ this.activeTab=t; this.searchText=''; this.isSearching=false; this.searchResults=[] },
    onSearchInput(e){ const val = e.detail.value; this.searchText = val; if (val.trim()) { this.isSearching = true; this.search(val) } else { this.isSearching=false; this.searchResults=[] } },
    search(keyword){
      const all = [...this.recentChats, ...this.groupChats]
      const lower = keyword.toLowerCase()
      this.searchResults = all.filter(c => (c.name||'').toLowerCase().includes(lower))
    },
    goToChat(c){
      if (c.type === 'group') uni.navigateTo({ url: `/pages/chat/group?id=${c.id}` })
      else uni.navigateTo({ url: `/pages/chat/private?id=${c.userId || c.id}` })
    },
    startNewChat(){
      uni.showActionSheet({ itemList:['发起私聊','创建群聊'], success:(r)=>{ uni.showToast({ title:'功能开发中', icon:'none' }) } })
    }
  }
}
</script>

<style scoped>
.chat-index{ width:100%; height:100vh; background:#f5f5f5; display:flex; flex-direction:column }
.search-bar{ background:#fff; padding:16rpx 20rpx; border-bottom:1rpx solid #eee }
.search-input{ height:72rpx; background:#f8f8f8; border-radius:36rpx; padding:0 24rpx; font-size:28rpx }
.tabs{ display:flex; align-items:center; background:#fff; padding:10rpx 16rpx; border-bottom:1rpx solid #eee }
.tab{ padding:16rpx 20rpx; color:#666 }
.tab.active{ color:#4DD0E1; font-weight:700; border-bottom:4rpx solid #4DD0E1 }
.spacer{ flex:1 }
.new{ background:#4DD0E1; color:#fff; padding:6rpx 18rpx; border-radius:20rpx }
.list{ flex:1; padding:10rpx 16rpx }
.item{ display:flex; align-items:center; background:#fff; border-radius:16rpx; padding:16rpx; margin-bottom:12rpx }
.avatar{ width:84rpx; height:84rpx; border-radius:50%; margin-right:14rpx }
.meta{ flex:1; display:flex; flex-direction:column }
.name{ font-size:30rpx; color:#333; font-weight:600 }
.last{ font-size:24rpx; color:#888; margin-top:4rpx; overflow:hidden; white-space:nowrap; text-overflow:ellipsis }
.time{ font-size:22rpx; color:#999 }
</style>
