<template>
  <view class="chat-container">
    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToView" scroll-with-animation>
      <view v-for="m in messages" :key="m.id" class="message-wrapper" :class="m.isSelf ? 'self':'other'" :id="`msg-${m.id}`">
        <view class="message-item">
          <image class="avatar" :src="m.avatar" mode="aspectFill" />
          <view class="message-content">
            <text class="sender" v-if="!m.isSelf">{{ m.senderName }}</text>
            <view class="message-bubble text" v-if="m.type==='text'"><text class="message-text">{{ m.content }}</text></view>
            <view class="message-bubble image" v-else-if="m.type==='image'">
              <image class="message-image" :src="m.content" mode="widthFix" />
            </view>
          </view>
        </view>
      </view>
      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="input-bar safe-area-bottom">
      <input class="text-input" v-model="inputText" placeholder="输入消息..." @confirm="send" confirm-type="send" />
      <view class="send-button" :class="{active: inputText.trim().length}" @tap="send"><text>发送</text></view>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { generateUserAvatar, processImageUrl } from '../../utils/image'

export default {
  data(){ return { groupId:'', messages:[], inputText:'', scrollToView:'' } },
  onLoad(q){ this.groupId = q.id || ''; this.load() },
  methods:{
    async load(){
      const res = await request.get('/api/chat/group', { id: this.groupId })
      if (res.code===200 && res.data){
        this.messages = (res.data.messages||[]).map(m=>({
          id:m.id, type:m.content_type, content:m.content, isSelf:m.is_mine,
          senderName: m.sender?.nickname || '成员',
          avatar: processImageUrl(m.sender?.avatar) || generateUserAvatar(m.sender?.id || '0')
        }))
        if (this.messages.length) this.scrollToView = `msg-${this.messages[this.messages.length-1].id}`
      }
    },
    async send(){
      const text = this.inputText.trim(); if (!text) return
      const app = getApp()
      const msg = { id:`msg_${Date.now()}`, type:'text', content:text, isSelf:true, avatar: app.globalData.userInfo?.avatar || generateUserAvatar('me'), senderName:'我' }
      this.messages = [...this.messages, msg]; this.inputText=''; this.scrollToView = `msg-${msg.id}`
      try { await request.post('/api/chat/group', { id: this.groupId, text }) } catch(e) {}
    }
  }
}
</script>

<style scoped>
/* 聊天页面样式 */
.chat-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message-wrapper {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
}

.message-wrapper.self {
  align-items: flex-end;
}

.message-wrapper.other {
  align-items: flex-start;
}

.time-divider {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.time-text {
  background: rgba(0, 0, 0, 0.1);
  color: #666666;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  max-width: 80%;
}

.message-wrapper.self .message-item {
  flex-direction: row-reverse;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 16rpx;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-wrapper.self .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 8rpx;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
}

.message-wrapper.other .message-bubble {
  background: white;
  border-bottom-left-radius: 8rpx;
}

.message-wrapper.self .message-bubble {
  background: #4DD0E1;
  color: white;
  border-bottom-right-radius: 8rpx;
}

.message-bubble.text .message-text {
  font-size: 30rpx;
  line-height: 1.4;
}

.message-bubble.image {
  padding: 0;
  border-radius: 16rpx;
  overflow: hidden;
}

.message-image {
  max-width: 400rpx;
  max-height: 400rpx;
  border-radius: 16rpx;
}

.message-bubble.voice {
  display: flex;
  align-items: center;
  min-width: 120rpx;
  background: #4DD0E1;
  color: white;
}

.message-bubble.voice.playing {
  background: #26C6DA;
}

.voice-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.voice-duration {
  font-size: 28rpx;
  font-weight: 500;
}

.message-bubble.location {
  padding: 0;
  border-radius: 16rpx;
  overflow: hidden;
  background: white;
  color: #333333;
}

.location-map {
  width: 200rpx;
  height: 120rpx;
}

.location-info {
  padding: 16rpx;
}

.location-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.location-address {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.message-status {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
  font-size: 20rpx;
  color: #999999;
}

.status-icon {
  width: 24rpx;
  height: 24rpx;
}

.status-text {
  font-size: 20rpx;
  color: #999999;
}

.bottom-spacer {
  height: 120rpx;
}

/* 输入栏 */
.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.input-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  border-radius: 50%;
  transition: all 0.3s;
}

.input-icon:active {
  background: #f0f0f0;
}

.input-icon image {
  width: 40rpx;
  height: 40rpx;
}

.text-input {
  flex: 1;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 40rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #333333;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #cccccc;
  font-size: 28rpx;
}

.voice-button {
  flex: 1;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #666666;
  transition: all 0.3s;
}

.voice-button:active {
  background: #e8e8e8;
}

.send-button {
  padding: 20rpx 32rpx;
  background: #cccccc;
  color: white;
  font-size: 28rpx;
  border-radius: 40rpx;
  margin-left: 16rpx;
  transition: all 0.3s;
}

.send-button.active {
  background: #4DD0E1;
}

.send-button.active:active {
  background: #26C6DA;
  transform: scale(0.95);
}

/* 更多功能面板 */
.more-panel {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  background: white;
  padding: 40rpx;
  border-top: 1rpx solid #e0e0e0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 40rpx;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

.more-item:active {
  transform: scale(0.95);
}

.more-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  background: #f8f8f8;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.more-icon {
  width: 50rpx;
  height: 50rpx;
}

.more-text {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>

