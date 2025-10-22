<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-into-view="scrollToView"
      scroll-with-animation
      :enhanced="true"
      :show-scrollbar="false"
    >
      <block v-for="item in messages" :key="item.id">
        <view class="message-wrapper" :class="item.isSelf ? 'self' : 'other'" :id="`msg-${item.id}`">
          <!-- 时间提示 -->
          <view class="time-divider" v-if="item.showTime">
            <text class="time-text">{{ item.timeStr }}</text>
          </view>
          
          <!-- 消息内容 -->
          <view class="message-item">
            <!-- 头像 -->
            <image 
              class="avatar" 
              :src="item.avatar" 
              mode="aspectFill"
              @tap="viewProfile"
              :data-user-id="item.userId"
            ></image>
            
            <!-- 消息主体 -->
            <view class="message-content">
              <!-- 文本消息 -->
              <view class="message-bubble text" v-if="item.type === 'text'">
                <text class="message-text" user-select>{{ item.content }}</text>
              </view>
              
              <!-- 图片消息 -->
              <view class="message-bubble image" v-else-if="item.type === 'image'">
                <image 
                  class="message-image" 
                  :src="item.content" 
                  mode="widthFix"
                  @tap="previewImage"
                  :data-url="item.content"
                ></image>
              </view>
              
              <!-- 语音消息 -->
              <view class="message-bubble voice" 
                    :class="{ playing: item.playing }"
                    v-else-if="item.type === 'voice'"
                    @tap="playVoice"
                    :data-id="item.id">
                <image class="voice-icon" src="/static/icons/voice.png" mode="aspectFit"></image>
                <text class="voice-duration">{{ item.duration }}″</text>
              </view>
              
              <!-- 位置消息 -->
              <view class="message-bubble location" 
                    v-else-if="item.type === 'location'"
                    @tap="openLocation"
                    :data-location="item.location">
                <image class="location-map" :src="item.mapImage" mode="aspectFill"></image>
                <view class="location-info">
                  <text class="location-name">{{ item.location.name }}</text>
                  <text class="location-address">{{ item.location.address }}</text>
                </view>
              </view>
            </view>
            
            <!-- 发送状态 -->
            <view class="message-status" v-if="item.isSelf">
              <image class="status-icon" v-if="item.status === 'sending'" src="/static/icons/sending.png" mode="aspectFit"></image>
              <image class="status-icon" v-else-if="item.status === 'failed'" src="/static/icons/failed.png" mode="aspectFit"></image>
              <text class="status-text" v-else-if="item.status === 'read'">已读</text>
            </view>
          </view>
        </view>
      </block>
      <!-- 底部空白区域，确保最后一条消息不被输入栏遮挡 -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 输入栏 -->
    <view class="input-bar safe-area-bottom" :style="keyboardHeight > 0 ? `bottom: ${keyboardHeight}px;` : ''">
      <!-- 语音/键盘切换 -->
      <view class="input-icon" @tap="switchInputType">
        <image :src="isVoiceInput ? '/static/icons/keyboard.png' : '/static/icons/voice.png'" mode="aspectFit"></image>
      </view>
      
      <!-- 文本输入框 -->
      <input 
        v-if="!isVoiceInput"
        class="text-input" 
        type="text"
        confirm-type="send"
        placeholder="输入消息..."
        placeholder-class="input-placeholder"
        v-model="inputText"
        @input="onInput"
        @confirm="sendTextMessage"
        @focus="onInputFocus"
        @blur="onInputBlur"
        :focus="inputFocus"
        :adjust-position="false"
      />
      
      <!-- 语音按钮 -->
      <view 
        v-else
        class="voice-button"
        @touchstart="startRecord"
        @touchend="stopRecord"
        @touchcancel="cancelRecord"
      >
        <text>{{ recordingText }}</text>
      </view>
      
      <!-- 表情 -->
      <view class="input-icon" @tap="showEmoji">
        <image src="/static/icons/emoji.png" mode="aspectFit"></image>
      </view>
      
      <!-- 更多功能 -->
      <view class="input-icon" @tap="showMore">
        <image src="/static/icons/plus.png" mode="aspectFit"></image>
      </view>
      
      <!-- 发送按钮 -->
      <view class="send-button" :class="{ active: canSend }" v-if="canSend" @tap="sendTextMessage">
        <text>发送</text>
      </view>
    </view>

    <!-- 更多功能面板 -->
    <view class="more-panel" v-if="showMorePanel">
      <view class="more-grid">
        <view class="more-item" @tap="chooseImage">
          <view class="more-icon-wrapper">
            <image class="more-icon" src="/static/icons/album.png" mode="aspectFit"></image>
          </view>
          <text class="more-text">相册</text>
        </view>
        <view class="more-item" @tap="takePhoto">
          <view class="more-icon-wrapper">
            <image class="more-icon" src="/static/icons/camera.png" mode="aspectFit"></image>
          </view>
          <text class="more-text">拍摄</text>
        </view>
        <view class="more-item" @tap="chooseLocation">
          <view class="more-icon-wrapper">
            <image class="more-icon" src="/static/icons/location.png" mode="aspectFit"></image>
          </view>
          <text class="more-text">位置</text>
        </view>
        <view class="more-item" @tap="makeCall">
          <view class="more-icon-wrapper">
            <image class="more-icon" src="/static/icons/call.png" mode="aspectFit"></image>
          </view>
          <text class="more-text">语音通话</text>
        </view>
        <view class="more-item" @tap="makeVideoCall">
          <view class="more-icon-wrapper">
            <image class="more-icon" src="/static/icons/video_call.png" mode="aspectFit"></image>
          </view>
          <text class="more-text">视频通话</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { generateUserAvatar, formatTime, processImageUrl } from '../../utils/image'

export default {
  data() {
    return {
      chatId: '',
      messages: [],
      inputText: '',
      canSend: false,
      scrollToView: '',
      isVoiceInput: false,
      recordingText: '按住 说话',
      isRecording: false,
      showMorePanel: false,
      inputFocus: false,
      keyboardHeight: 0
    }
  },

  onLoad(options) {
    this.chatId = options.id || ''
    
    // 设置导航标题
    uni.setNavigationBarTitle({
      title: '小明' // 实际应从数据中获取
    })
    
    this.loadMessages()
    
    // 监听键盘高度变化
    uni.onKeyboardHeightChange((res) => {
      console.log('Keyboard height changed:', res.height)
      this.keyboardHeight = res.height
      
      // 键盘弹起时滚动到最底部
      if (res.height > 0 && this.messages.length > 0) {
        setTimeout(() => {
          const lastMsg = this.messages[this.messages.length - 1]
          this.scrollToView = `msg-${lastMsg.id}`
        }, 100)
      }
    })
  },

  methods: {
    // 加载消息
    async loadMessages() {
      if (!this.chatId) {
        console.error('Chat ID is required')
        return
      }
      
      try {
        const res = await request.get('/api/chat/private', {
          peer: this.chatId
        })
        
        if (res.code === 200 && res.data) {
          const messages = res.data.messages || []
          
          // 处理消息数据，使用真实数据库头像并映射字段
          const processedMessages = messages.map(msg => {
            let content = msg.content
            
            // 处理图片消息的URL
            if (msg.content_type === 'image') {
              content = processImageUrl(msg.content) || msg.content
            }
            
            return {
              id: msg.id,
              type: msg.content_type,
              content: content,
              isSelf: msg.is_mine,
              userId: msg.sender ? msg.sender.id : null,
              avatar: msg.sender ? processImageUrl(msg.sender.avatar) || generateUserAvatar(msg.sender.id) : '',
              timeStr: formatTime(msg.created_at),
              showTime: false, // 可以根据时间间隔计算
              status: msg.is_mine ? 'read' : 'sent',
              sender: msg.sender ? {
                id: msg.sender.id,
                nickname: msg.sender.nickname,
                avatar: processImageUrl(msg.sender.avatar) || generateUserAvatar(msg.sender.id)
              } : null
            }
          })
          
          this.messages = processedMessages
          this.scrollToView = processedMessages.length > 0 ? `msg-${processedMessages[processedMessages.length - 1].id}` : ''
          
          // 设置导航标题为对方昵称
          if (processedMessages.length > 0) {
            const peerMessage = processedMessages.find(msg => !msg.isSelf)
            if (peerMessage && peerMessage.sender && peerMessage.sender.nickname) {
              uni.setNavigationBarTitle({
                title: peerMessage.sender.nickname
              })
            }
          }
        }
      } catch (error) {
        console.error('Load messages error:', error)
        uni.showToast({
          title: '加载消息失败',
          icon: 'none'
        })
      }
    },

    // 输入文本
    onInput(e) {
      const inputText = e.detail.value
      this.inputText = inputText
      this.canSend = inputText.trim().length > 0
    },

    // 输入框获取焦点
    onInputFocus() {
      this.inputFocus = true
      
      // 延迟滚动到底部，等待键盘弹起
      setTimeout(() => {
        if (this.messages.length > 0) {
          const lastMsg = this.messages[this.messages.length - 1]
          this.scrollToView = `msg-${lastMsg.id}`
        }
      }, 300)
    },

    // 输入框失去焦点
    onInputBlur() {
      this.inputFocus = false
    },

    // 发送文本消息
    async sendTextMessage() {
      if (!this.canSend) return
      
      const app = getApp()
      const message = {
        id: `msg_${Date.now()}`,
        type: 'text',
        content: this.inputText,
        isSelf: true,
        userId: app.globalData.userInfo?.id || 'user_1',
        avatar: app.globalData.userInfo?.avatar || 'https://picsum.photos/100/100?random=2',
        timeStr: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        showTime: false,
        status: 'sending'
      }
      
      const messages = [...this.messages, message]
      
      this.messages = messages
      this.inputText = ''
      this.canSend = false
      this.scrollToView = `msg-${message.id}`
      
      try {
        // 发送到后端
        const res = await request.post('/api/chat/private', {
          to: parseInt(this.chatId),
          text: message.content
        }, { showLoading: false })
        
        if (res.code === 200) {
          this.updateMessageStatus(message.id, 'sent')
          // 模拟已读
          setTimeout(() => {
            this.updateMessageStatus(message.id, 'read')
          }, 1500)
        } else {
          this.updateMessageStatus(message.id, 'failed')
        }
      } catch (error) {
        console.error('Send message error:', error)
        this.updateMessageStatus(message.id, 'failed')
      }
    },

    // 更新消息状态
    updateMessageStatus(messageId, status) {
      const messages = this.messages.map(msg => {
        if (msg.id === messageId) {
          msg.status = status
        }
        return msg
      })
      this.messages = messages
    },

    // 切换输入方式
    switchInputType() {
      this.isVoiceInput = !this.isVoiceInput
      this.showMorePanel = false
    },

    // 开始录音
    startRecord() {
      this.isRecording = true
      this.recordingText = '松开 发送'
      
      uni.vibrateShort({
        type: 'light'
      })
      
      // 实际应调用录音API
      const recorderManager = uni.getRecorderManager()
      recorderManager.start({
        duration: 60000,
        format: 'mp3'
      })
    },

    // 停止录音
    stopRecord() {
      if (!this.isRecording) return
      
      this.isRecording = false
      this.recordingText = '按住 说话'
      
      const recorderManager = uni.getRecorderManager()
      recorderManager.stop()
      
      // 模拟发送语音消息
      const message = {
        id: `msg_${Date.now()}`,
        type: 'voice',
        duration: Math.floor(Math.random() * 10) + 1,
        isSelf: true,
        userId: 'user_1',
        avatar: 'https://picsum.photos/100/100?random=2',
        timeStr: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        showTime: false,
        status: 'sending',
        playing: false
      }
      
      const messages = [...this.messages, message]
      
      this.messages = messages
      this.scrollToView = `msg-${message.id}`
    },

    // 取消录音
    cancelRecord() {
      this.isRecording = false
      this.recordingText = '按住 说话'
      
      const recorderManager = uni.getRecorderManager()
      recorderManager.stop()
    },

    // 播放语音
    playVoice(e) {
      const messageId = e.currentTarget.dataset.id
      const messages = this.messages.map(msg => {
        if (msg.id === messageId && msg.type === 'voice') {
          msg.playing = !msg.playing
          
          if (msg.playing) {
            // 模拟播放结束
            setTimeout(() => {
              this.stopVoice(messageId)
            }, msg.duration * 1000)
          }
        } else if (msg.type === 'voice') {
          msg.playing = false
        }
        return msg
      })
      
      this.messages = messages
    },

    // 停止语音播放
    stopVoice(messageId) {
      const messages = this.messages.map(msg => {
        if (msg.id === messageId) {
          msg.playing = false
        }
        return msg
      })
      this.messages = messages
    },

    // 显示表情
    showEmoji() {
      uni.showToast({
        title: '表情功能开发中',
        icon: 'none'
      })
    },

    // 显示更多功能
    showMore() {
      this.showMorePanel = !this.showMorePanel
      this.isVoiceInput = false
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          res.tempFilePaths.forEach(path => {
            const message = {
              id: `msg_${Date.now()}_${Math.random()}`,
              type: 'image',
              content: path,
              isSelf: true,
              userId: 'user_1',
              avatar: 'https://picsum.photos/100/100?random=2',
              timeStr: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              showTime: false,
              status: 'sending'
            }
            
            const messages = [...this.messages, message]
            
            this.messages = messages
            this.scrollToView = `msg-${message.id}`
            this.showMorePanel = false
          })
        }
      })
    },

    // 拍照
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          const message = {
            id: `msg_${Date.now()}`,
            type: 'image',
            content: res.tempFilePaths[0],
            isSelf: true,
            userId: 'user_1',
            avatar: 'https://picsum.photos/100/100?random=2',
            timeStr: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            showTime: false,
            status: 'sending'
          }
          
          const messages = [...this.messages, message]
          
          this.messages = messages
          this.scrollToView = `msg-${message.id}`
          this.showMorePanel = false
        }
      })
    },

    // 选择位置
    chooseLocation() {
      uni.chooseLocation({
        success: (res) => {
          const message = {
            id: `msg_${Date.now()}`,
            type: 'location',
            location: {
              name: res.name,
              address: res.address,
              latitude: res.latitude,
              longitude: res.longitude
            },
            mapImage: 'https://picsum.photos/400/200?random=map',
            isSelf: true,
            userId: 'user_1',
            avatar: 'https://picsum.photos/100/100?random=2',
            timeStr: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            showTime: false,
            status: 'sending'
          }
          
          const messages = [...this.messages, message]
          
          this.messages = messages
          this.scrollToView = `msg-${message.id}`
          this.showMorePanel = false
        }
      })
    },

    // 语音通话
    makeCall() {
      uni.showToast({
        title: '语音通话功能开发中',
        icon: 'none'
      })
    },

    // 视频通话
    makeVideoCall() {
      uni.showToast({
        title: '视频通话功能开发中',
        icon: 'none'
      })
    },

    // 预览图片
    previewImage(e) {
      const url = e.currentTarget.dataset.url
      const imageMessages = this.messages
        .filter(msg => msg.type === 'image')
        .map(msg => msg.content)
      
      uni.previewImage({
        current: url,
        urls: imageMessages
      })
    },

    // 打开位置
    openLocation(e) {
      const location = e.currentTarget.dataset.location
      uni.openLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address,
        scale: 15
      })
    },

    // 查看用户资料
    viewProfile(e) {
      const userId = e.currentTarget.dataset.userId
      if (userId !== 'user_1') {
        uni.navigateTo({
          url: `/pages/profile/index?userId=${userId}`
        })
      }
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
