<template>
  <view class="messages-container">
    <!-- 顶部通知栏 -->
    <view class="notification-bar" v-if="unreadNotifications > 0">
      <view class="notification-item" @tap="goToNotifications">
        <view class="notification-left">
          <view class="notification-icon-wrapper">
            <image class="notification-icon" src="/static/icons/notification.png" mode="aspectFit"></image>
            <view class="notification-badge">{{ unreadNotifications }}</view>
          </view>
          <text class="notification-text">系统通知</text>
        </view>
        <view class="notification-right">
          <text class="notification-hint">{{ latestNotification }}</text>
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y>
      <block v-for="item in messageList" :key="item.id">
        <view class="message-item" @tap="goToChat" :data-id="item.id" :data-type="item.type" :data-user-id="item.userId">
          <!-- 左滑删除 -->
          <view class="message-content">
            <!-- 头像 -->
            <view class="avatar-wrapper">
              <image class="user-avatar" :src="item.avatar" mode="aspectFill"></image>
              <view class="online-dot" v-if="item.isOnline"></view>
              <view class="unread-badge" v-if="item.unreadCount > 0">
                {{ item.unreadCount > 99 ? '99+' : item.unreadCount }}
              </view>
            </view>
            
            <!-- 消息内容 -->
            <view class="message-info">
              <view class="message-header">
                <text class="user-name">{{ item.name }}</text>
                <text class="message-time">{{ item.timeStr }}</text>
              </view>
              <view class="message-preview">
                <text class="message-text">{{ item.lastMessage }}</text>
              </view>
            </view>
          </view>
        </view>
      </block>

      <!-- 空状态 -->
      <view class="empty-state" v-if="messageList.length === 0">
        <image class="empty-image" src="/static/icons/empty_message.png" mode="aspectFit"></image>
        <text class="empty-text">暂无消息</text>
        <text class="empty-hint">快去和好友聊天吧</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-button" @tap="startNewChat">
        <text class="action-emoji">💬</text>
        <text class="action-text">发起聊天</text>
      </view>
      <view class="action-button" @tap="createGroup">
        <text class="action-emoji">👥</text>
        <text class="action-text">创建群聊</text>
      </view>
      <view class="action-button" @tap="scanCode">
        <text class="action-emoji">📱</text>
        <text class="action-text">扫一扫</text>
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
      unreadNotifications: 3,
      latestNotification: '您有新的好友请求',
      messageList: []
    }
  },

  onLoad() {
    this.loadMessages()
    this.loadNotifications()
  },

  onShow() {
    // 检查登录状态
    const app = getApp()
    if (!app.checkLogin()) {
      uni.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 刷新消息列表
    this.loadMessages()
    this.loadNotifications()
  },

  methods: {
    // 加载消息列表
    async loadMessages() {
      try {
        const res = await request.get('/api/chats')
        
        if (res.code === 200 && res.data) {
          // 处理消息列表数据
          const messages = res.data.map(chat => {
            let avatar, name, userId
            
            if (chat.type === 'private' && chat.peer) {
              avatar = processImageUrl(chat.peer.avatar) || generateUserAvatar(chat.peer.id)
              name = chat.peer.nickname
              userId = chat.peer.id
            } else if (chat.type === 'group' && chat.group) {
              avatar = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop' // 群聊头像
              name = chat.group.name
              userId = chat.group.id
              console.log('Processing group chat:', chat.group.name, 'ID:', chat.group.id)
            } else {
              avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
              name = '未知用户'
              userId = chat.id
            }
            
            return {
              id: chat.id,
              userId: userId,
              type: chat.type,
              avatar: avatar,
              name: name,
              lastMessage: chat.last_msg || '暂无消息',
              timeStr: formatTime(chat.last_ts),
              unreadCount: chat.unread_count || 0,
              isOnline: Math.random() > 0.5 // 随机在线状态，实际项目中应该从服务器获取
            }
          })
          
          this.messageList = messages
        }
      } catch (error) {
        console.error('Load messages error:', error)
        uni.showToast({
          title: '加载消息失败',
          icon: 'none'
        })
        this.messageList = []
      }
    },

    // 加载通知
    async loadNotifications() {
      try {
        const res = await request.get('/api/notifications')
        
        if (res.code === 200 && res.data) {
          const { notifications, unread_count } = res.data
          
          // 获取最新的通知内容
          const latestNotification = notifications.length > 0 ? 
            notifications[0].content : '暂无通知'
          
          this.unreadNotifications = unread_count
          this.latestNotification = latestNotification
        }
      } catch (error) {
        console.error('Load notifications error:', error)
      }
    },

    // 进入聊天页面
    goToChat(e) {
      const { id, type, userId } = e.currentTarget.dataset
      console.log('goToChat called with:', { id, type, userId })
      
      if (type === 'group') {
        if (!userId || userId === 'undefined' || userId === 'null') {
          uni.showToast({
            title: '群聊ID无效',
            icon: 'error'
          })
          return
        }
        uni.navigateTo({
          url: `/pages/chat/group?id=${userId}`
        })
      } else {
        if (!userId || userId === 'undefined' || userId === 'null') {
          uni.showToast({
            title: '用户ID无效',
            icon: 'error'
          })
          return
        }
        uni.navigateTo({
          url: `/pages/chat/private?id=${userId}`
        })
      }
    },

    // 查看通知
    goToNotifications() {
      uni.navigateTo({
        url: '/pages/notifications/index'
      })
    },

    // 发起聊天
    startNewChat() {
      uni.navigateTo({
        url: '/pages/contacts/index?action=chat'
      })
    },

    // 创建群聊
    createGroup() {
      uni.showActionSheet({
        itemList: ['创建新群聊', '加入群聊'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 创建新群聊
            this.showCreateGroupDialog()
          } else if (res.tapIndex === 1) {
            // 加入群聊
            uni.showToast({
              title: '加入群聊功能开发中',
              icon: 'none'
            })
          }
        }
      })
    },

    // 显示创建群聊对话框
    showCreateGroupDialog() {
      uni.showModal({
        title: '创建群聊',
        content: '请输入群聊名称',
        editable: true,
        placeholderText: '输入群聊名称...',
        success: (res) => {
          if (res.confirm && res.content) {
            this.createNewGroup(res.content.trim())
          }
        }
      })
    },

    // 创建新群聊
    async createNewGroup(groupName) {
      if (!groupName) {
        uni.showToast({
          title: '群聊名称不能为空',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({ title: '创建中...', mask: true })
        
        // 由于后端API要求至少2个成员，我们需要选择一个默认成员
        // 这里我们选择用户ID为2的用户作为默认成员
        const app = getApp()
        const userInfo = app.getUserInfo()
        const res = await request.post('/api/group', {
          name: groupName,
          members: [userInfo.id, 2] // 包含创建者和一个默认成员
        })
        
        uni.hideLoading()
        
        if (res.code === 200) {
          uni.showModal({
            title: '创建成功',
            content: `群聊"${groupName}"创建成功！您可以邀请更多好友加入群聊。`,
            showCancel: false,
            confirmText: '进入群聊',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 刷新消息列表
                this.loadMessages()
                
                // 跳转到群聊页面
                uni.navigateTo({
                  url: `/pages/chat/group?id=${res.data.group_id}`
                })
              }
            }
          })
        } else {
          uni.showToast({
            title: res.msg || '创建失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Create group error:', error)
        
        // 如果API调用失败，提供一个备用方案
        uni.showModal({
          title: '创建群聊',
          content: '群聊功能正在完善中，您可以先使用私聊功能。是否前往已有的测试群聊？',
          success: (res) => {
            if (res.confirm) {
              // 跳转到已存在的测试群聊
              uni.navigateTo({
                url: '/pages/chat/group?id=1'
              })
            }
          }
        })
      }
    },

    // 扫一扫
    scanCode() {
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果：', res)
          uni.showToast({
            title: '扫码成功',
            icon: 'success'
          })
        }
      })
    },

    // 下拉刷新
    onPullDownRefresh() {
      this.loadMessages()
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    }
  }
}
</script>

<style scoped>
/* 消息列表页样式 */
.messages-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部通知栏 */
.notification-bar {
  background: white;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.notification-left {
  display: flex;
  align-items: center;
}

.notification-icon-wrapper {
  position: relative;
  margin-right: 20rpx;
}

.notification-icon {
  width: 40rpx;
  height: 40rpx;
}

.notification-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #ff4757;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.notification-text {
  font-size: 30rpx;
  color: #333333;
  font-weight: 600;
}

.notification-right {
  display: flex;
  align-items: center;
}

.notification-hint {
  font-size: 26rpx;
  color: #666666;
  margin-right: 16rpx;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 0 20rpx;
}

.message-item {
  background: white;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.message-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.message-content {
  display: flex;
  align-items: center;
  padding: 30rpx;
}

.avatar-wrapper {
  position: relative;
  margin-right: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 2rpx solid #f0f0f0;
}

.online-dot {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 20rpx;
  height: 20rpx;
  background: #4DD0E1;
  border-radius: 50%;
  border: 3rpx solid white;
}

.unread-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff4757;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  font-weight: 600;
}

.message-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: 600;
}

.message-time {
  font-size: 24rpx;
  color: #999999;
}

.message-preview {
  display: flex;
  align-items: center;
}

.message-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
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

/* 底部操作栏 */
.bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30rpx 0;
  background: white;
  border-top: 1rpx solid #f0f0f0;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  transition: all 0.3s;
  min-width: 120rpx;
}

.action-button:active {
  background: #f8f8f8;
  transform: scale(0.95);
}

.action-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}
</style>

