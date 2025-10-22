<template>
  <view class="me-container">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <image class="bg-image" src="/static/icons/profile_bg.jpg" mode="aspectFill"></image>
      <view class="bg-overlay"></view>
    </view>

    <!-- 个人信息卡片 -->
    <view class="profile-card">
      <view class="profile-info">
        <!-- 头像 -->
        <view class="avatar-section">
          <image class="user-avatar" :src="userInfo.avatar || '/static/icons/default_avatar.png'" mode="aspectFill" @error="onAvatarError"></image>
          <view class="edit-avatar" @tap="changeAvatar">
            <image class="camera-icon" src="/static/icons/camera_white.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <!-- 用户信息 -->
        <view class="user-info">
          <!-- 昵称编辑 -->
          <view class="name-row">
            <view class="editable-field" v-if="!editing.nickname" @tap="startEditNickname">
              <text class="user-name">{{ userInfo.nickname || '点击设置昵称' }}</text>
              <text class="edit-hint">✏️</text>
            </view>
            <view class="editing-field" v-else>
              <input 
                class="edit-input" 
                type="text" 
                v-model="tempNickname"
                placeholder="输入昵称"
                @input="onNicknameInput"
                :focus="true"
              />
              <view class="edit-actions">
                <text class="save-btn" @tap="saveNickname">✅</text>
                <text class="cancel-btn" @tap="cancelEdit" data-field="nickname">❌</text>
              </view>
            </view>
          </view>
          
          <text class="user-id">ID: {{ userInfo.id || '000000' }}</text>
          
          <!-- 简介编辑 -->
          <view class="bio-section">
            <view class="editable-field" v-if="!editing.bio" @tap="startEditBio">
              <text class="user-bio">{{ userInfo.bio || '点击设置个人简介' }}</text>
              <text class="edit-hint">✏️</text>
            </view>
            <view class="editing-field" v-else>
              <textarea 
                class="edit-textarea" 
                v-model="tempBio"
                placeholder="输入个人简介"
                @input="onBioInput"
                maxlength="100"
                :focus="true"
              ></textarea>
              <view class="edit-actions">
                <text class="save-btn" @tap="saveBio">✅</text>
                <text class="cancel-btn" @tap="cancelEdit" data-field="bio">❌</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="stats-row">
        <view class="stat-item" @tap="goToFollowing">
          <text class="stat-value">{{ stats.following || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goToFollowers">
          <text class="stat-value">{{ stats.followers || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goToPosts">
          <text class="stat-value">{{ stats.posts || 0 }}</text>
          <text class="stat-label">动态</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goToLikes">
          <text class="stat-value">{{ stats.likes || 0 }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <!-- 我的动态 -->
      <view class="function-item" @tap="goToMyPosts">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/posts.png" mode="aspectFit"></image>
          <text class="function-name">我的动态</text>
        </view>
        <view class="function-right">
          <text class="function-value">{{ stats.posts || 0 }}</text>
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 我的收藏 -->
      <view class="function-item" @tap="goToFavorites">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/favorite.png" mode="aspectFit"></image>
          <text class="function-name">我的收藏</text>
        </view>
        <view class="function-right">
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 相册 -->
      <view class="function-item" @tap="goToAlbum">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/album.png" mode="aspectFit"></image>
          <text class="function-name">相册</text>
        </view>
        <view class="function-right">
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 钱包 -->
      <view class="function-item" @tap="goToWallet">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/wallet.png" mode="aspectFit"></image>
          <text class="function-name">钱包</text>
        </view>
        <view class="function-right">
          <text class="function-value">¥{{ wallet.balance || '0.00' }}</text>
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 其他功能 -->
    <view class="other-list">
      <!-- 帮助与反馈 -->
      <view class="function-item" @tap="goToHelp">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/help.png" mode="aspectFit"></image>
          <text class="function-name">帮助与反馈</text>
        </view>
        <view class="function-right">
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 关于 -->
      <view class="function-item" @tap="goToAbout">
        <view class="function-left">
          <image class="function-icon" src="/static/icons/about.png" mode="aspectFit"></image>
          <text class="function-name">关于Link Me</text>
        </view>
        <view class="function-right">
          <text class="function-value">v1.0.0</text>
          <image class="arrow-icon" src="/static/icons/arrow_right.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-button" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'
import { generateUserAvatar, processImageUrl } from '../../utils/image'

export default {
  data() {
    return {
      userInfo: {},
      stats: {
        following: 0,
        followers: 0,
        posts: 0,
        likes: 0
      },
      wallet: {
        balance: '0.00'
      },
      editing: {
        nickname: false,
        bio: false
      },
      tempNickname: '',
      tempBio: ''
    }
  },

  onLoad() {
    this.loadUserInfo()
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
    
    // 刷新用户信息
    this.loadUserInfo()
  },

  methods: {
    // 加载用户信息
    async loadUserInfo() {
      const app = getApp()
      const userInfo = app.getUserInfo()
      if (userInfo) {
        try {
          // 从服务器获取最新用户信息
          const res = await request.get(`/api/user/${userInfo.id}`)
          
          if (res.code === 200 && res.data) {
            const serverUserInfo = res.data
            
            // 处理头像URL
            const avatarUrl = processImageUrl(serverUserInfo.avatar || userInfo.avatar)
            
            // 合并本地和服务器信息
            const updatedUserInfo = {
              ...userInfo,
              ...serverUserInfo,
              avatar: avatarUrl || generateUserAvatar(userInfo.id)
            }
            
            this.userInfo = updatedUserInfo
            this.stats = {
              following: serverUserInfo.following_count || 0,
              followers: serverUserInfo.followers_count || 0,
              posts: serverUserInfo.posts ? serverUserInfo.posts.length : 0,
              likes: 0 // 可以后续计算
            }
            this.tempNickname = updatedUserInfo.nickname || ''
            this.tempBio = updatedUserInfo.bio || ''
            
            // 更新本地存储
            app.setUserInfo(updatedUserInfo)
          } else {
            // 如果服务器请求失败，使用本地信息
            this.userInfo = {
              ...userInfo,
              avatar: userInfo.avatar || generateUserAvatar(userInfo.id)
            }
          }
        } catch (error) {
          console.error('Load user info from server error:', error)
          // 使用本地信息
          this.userInfo = {
            ...userInfo,
            avatar: userInfo.avatar || generateUserAvatar(userInfo.id)
          }
        }
      } else {
        // 未登录，跳转到登录页
        uni.redirectTo({
          url: '/pages/login/index'
        })
      }
    },

    // 更换头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          
          uni.showLoading({
            title: '上传中...'
          })
          
          // 上传头像到服务器
          this.uploadAvatar(tempFilePath)
        }
      })
    },

    // 上传头像
    async uploadAvatar(filePath) {
      try {
        const res = await request.upload('/api/upload/avatar', filePath)
        
        if (res.code === 200 && res.data) {
          let avatarUrl = res.data.url
          
          // 处理头像URL确保是完整的
          avatarUrl = processImageUrl(avatarUrl)
          
          console.log('Uploaded avatar URL:', avatarUrl)
          
          // 同时更新数据库
          const updateRes = await request.put(`/api/user/${this.userInfo.id}/update`, {
            avatar: avatarUrl
          })
          
          if (updateRes.code === 200) {
            // 添加时间戳避免缓存问题
            const avatarUrlWithTimestamp = `${avatarUrl}?t=${Date.now()}`
            console.log('Setting avatar with timestamp:', avatarUrlWithTimestamp)
            
            const userInfo = { ...this.userInfo, avatar: avatarUrlWithTimestamp }
            this.userInfo = userInfo
            const app = getApp()
            app.setUserInfo(userInfo)
            
            uni.hideLoading()
            uni.showToast({
              title: '✅ 头像更新成功',
              icon: 'none'
            })
          }
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Upload avatar error:', error)
        uni.showToast({
          title: '头像上传失败',
          icon: 'none'
        })
      }
    },

    // 头像加载错误处理
    onAvatarError(e) {
      console.error('Avatar load error:', e.detail)
      console.log('Current avatar URL:', this.userInfo.avatar)
      
      // 如果头像加载失败，使用可靠的备用头像
      const userInfo = { ...this.userInfo }
      userInfo.avatar = generateUserAvatar(userInfo.id)
      this.userInfo = userInfo
      
      uni.showToast({
        title: '头像加载失败，已切换默认头像',
        icon: 'none',
        duration: 2000
      })
    },

    // 开始编辑昵称
    startEditNickname() {
      this.editing.nickname = true
      this.tempNickname = this.userInfo.nickname || ''
    },

    // 开始编辑简介
    startEditBio() {
      this.editing.bio = true
      this.tempBio = this.userInfo.bio || ''
    },

    // 昵称输入
    onNicknameInput(e) {
      this.tempNickname = e.detail.value
    },

    // 简介输入
    onBioInput(e) {
      this.tempBio = e.detail.value
    },

    // 保存昵称
    async saveNickname() {
      const nickname = this.tempNickname.trim()
      
      if (!nickname) {
        uni.showToast({
          title: '昵称不能为空',
          icon: 'none'
        })
        return
      }

      try {
        const res = await request.put(`/api/user/${this.userInfo.id}/update`, {
          nickname: nickname
        })

        if (res.code === 200) {
          const userInfo = { ...this.userInfo, nickname: nickname }
          this.userInfo = userInfo
          this.editing.nickname = false
          
          const app = getApp()
          app.setUserInfo(userInfo)
          
          uni.showToast({
            title: '✅ 昵称更新成功',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('Save nickname error:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    },

    // 保存简介
    async saveBio() {
      const bio = this.tempBio.trim()

      try {
        const res = await request.put(`/api/user/${this.userInfo.id}/update`, {
          bio: bio
        })

        if (res.code === 200) {
          const userInfo = { ...this.userInfo, bio: bio }
          this.userInfo = userInfo
          this.editing.bio = false
          
          const app = getApp()
          app.setUserInfo(userInfo)
          
          uni.showToast({
            title: '✅ 简介更新成功',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('Save bio error:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    },

    // 取消编辑
    cancelEdit(e) {
      const field = e.currentTarget.dataset.field
      this.editing[field] = false
    },

    // 查看关注
    goToFollowing() {
      uni.navigateTo({
        url: '/pages/following/index'
      })
    },

    // 查看粉丝
    goToFollowers() {
      uni.navigateTo({
        url: '/pages/followers/index'
      })
    },

    // 查看动态
    goToPosts() {
      uni.navigateTo({
        url: '/pages/profile/index?tab=posts'
      })
    },

    // 查看获赞
    goToLikes() {
      uni.navigateTo({
        url: '/pages/profile/index?tab=likes'
      })
    },

    // 我的动态
    goToMyPosts() {
      uni.navigateTo({
        url: '/pages/profile/index?userId=' + this.userInfo.id
      })
    },

    // 我的收藏
    goToFavorites() {
      uni.navigateTo({
        url: '/pages/favorites/index'
      })
    },

    // 相册
    goToAlbum() {
      uni.navigateTo({
        url: '/pages/album/index'
      })
    },

    // 钱包
    goToWallet() {
      uni.navigateTo({
        url: '/pages/wallet/index'
      })
    },

    // 设置
    goToSettings() {
      uni.navigateTo({
        url: '/pages/settings/index'
      })
    },

    // 聊天测试
    goToChatTest() {
      uni.navigateTo({
        url: '/pages/chat_test/index'
      })
    },

    // 帮助与反馈
    goToHelp() {
      uni.navigateTo({
        url: '/pages/help/index'
      })
    },

    // 关于
    goToAbout() {
      uni.navigateTo({
        url: '/pages/about/index'
      })
    },

    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            uni.clearStorageSync()
            const app = getApp()
            app.globalData.isLogin = false
            app.globalData.userInfo = null
            app.globalData.token = null
            
            // 跳转到登录页
            uni.redirectTo({
              url: '/pages/login/index'
            })
          }
        }
      })
    },

    // 分享
    onShareAppMessage() {
      return {
        title: '来Link Me看看我的主页',
        path: `/pages/profile/index?userId=${this.userInfo.id}`,
        imageUrl: this.userInfo.avatar
      }
    }
  }
}
</script>

<style scoped>
/* 个人中心页样式 */
.me-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

/* 顶部背景 */
.header-bg {
  position: relative;
  height: 400rpx;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(77, 208, 225, 0.8), rgba(128, 222, 234, 0.6));
}

/* 个人信息卡片 */
.profile-card {
  background: white;
  margin: -100rpx 30rpx 30rpx;
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.profile-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.avatar-section {
  position: relative;
  margin-right: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid white;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: #4DD0E1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid white;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.camera-icon {
  width: 20rpx;
  height: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name-row {
  margin-bottom: 16rpx;
}

.editable-field {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  transition: all 0.3s;
}

.editable-field:active {
  background: #f8f8f8;
  border-radius: 8rpx;
  padding: 8rpx 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 12rpx;
}

.edit-hint {
  font-size: 24rpx;
  opacity: 0.6;
}

.editing-field {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 12rpx;
}

.edit-input {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
}

.edit-textarea {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
  min-height: 60rpx;
  line-height: 1.4;
}

.edit-actions {
  display: flex;
  gap: 16rpx;
  margin-left: 16rpx;
}

.save-btn,
.cancel-btn {
  font-size: 28rpx;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.save-btn {
  background: #4DD0E1;
  color: white;
}

.cancel-btn {
  background: #ff4757;
  color: white;
}

.user-id {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.bio-section {
  margin-top: 8rpx;
}

.user-bio {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

/* 统计数据 */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  transition: all 0.3s;
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e0e0e0;
}

/* 功能列表 */
.function-list,
.other-list {
  background: white;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:active {
  background: #f8f8f8;
}

.function-left {
  display: flex;
  align-items: center;
}

.function-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.function-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.function-right {
  display: flex;
  align-items: center;
}

.function-value {
  font-size: 28rpx;
  color: #666666;
  margin-right: 16rpx;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
}

/* 退出登录 */
.logout-section {
  padding: 0 30rpx 60rpx;
}

.logout-button {
  width: 100%;
  height: 100rpx;
  background: #ff4757;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.logout-button:active {
  background: #ff3742;
  transform: scale(0.98);
}
</style>

