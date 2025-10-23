<template>
  <view class="login-container">
    <!-- 欢迎文字 -->
    <view class="welcome-section">
      <text class="welcome-text">欢迎来到Linkme</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 手机号输入 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">📱</text>
          <input 
            class="phone-input" 
            type="number" 
            maxlength="11"
            placeholder="请输入手机号码"
            placeholder-class="input-placeholder"
            v-model="phoneNumber"
            @input="onPhoneInput"
          />
        </view>
      </view>

      <!-- 验证码输入 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🛡️</text>
          <input 
            class="code-input" 
            type="number" 
            maxlength="6"
            placeholder="请输入验证码"
            placeholder-class="input-placeholder"
            v-model="verifyCode"
            @input="onCodeInput"
          />
          <view class="code-btn" :class="{ disabled: !canGetCode }" @tap="getVerifyCode">
            <text>{{ codeText }}</text>
          </view>
        </view>
      </view>

      <!-- 自动创建账号提示 -->
      <view class="info-text">
        <text>未注册的手机号验证后自动创建Linkme账号</text>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn"
        :class="{ active: canLogin }" 
        @tap="handleLogin"
        :disabled="!canLogin"
      >
        登录
      </button>

      <!-- 第三方登录 -->
      <view class="third-party-section">
        <view class="divider-wrapper">
          <view class="divider-line"></view>
          <view class="divider-line"></view>
        </view>
        
        <view class="third-party-buttons">
          <view class="third-party-btn" @tap="handleWxLogin">
            <image class="third-party-icon" src="../../static/icons/微信.png" mode="widthFix" />
            <text class="third-party-text">微信</text>
          </view>
          <view class="third-party-btn" @tap="handleQQLogin">
            <image class="third-party-icon" src="../../static/icons/QQ (1).png" mode="widthFix" />  
            <text class="third-party-text">QQ</text>
          </view>
        </view>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <text class="agreement-text">登录即同意</text>
        <text class="agreement-link" @tap="goToAgreement">用户协议</text>
      </view>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'

export default {
  data() {
    return {
      phoneNumber: '',
      verifyCode: '',
      codeText: '获取验证',
      canGetCode: false,
      canLogin: false,
      countdown: 60
    }
  },

  methods: {
    // 手机号输入
    onPhoneInput(e) {
      this.phoneNumber = e.detail.value
      this.updateCanLogin()
    },

    // 验证码输入
    onCodeInput(e) {
      this.verifyCode = e.detail.value
      this.updateCanLogin()
    },

    // 更新登录按钮状态
    updateCanLogin() {
      const { phoneNumber, verifyCode } = this
      let canLogin = false
      let canGetCode = false
      
      if (this.validatePhone(phoneNumber)) {
        canGetCode = true
        canLogin = verifyCode.length === 6
      }
      
      this.canLogin = canLogin
      this.canGetCode = canGetCode
    },

    // 验证手机号
    validatePhone(phone) {
      return /^1[3-9]\d{9}$/.test(phone)
    },

    // 获取验证码
    async getVerifyCode() {
      if (!this.canGetCode) return
      
      uni.showLoading({
        title: '发送中...'
      })
      
      try {
        const res = await request.post('/api/send_code', {
          phone: this.phoneNumber
        })
        
        if (res.code === 200) {
          uni.hideLoading()
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          this.startCountdown()
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Send code error:', error)
      }
    },

    // 倒计时
    startCountdown() {
      let countdown = 60
      this.canGetCode = false
      this.codeText = `${countdown}s`
      
      const timer = setInterval(() => {
        countdown--
        if (countdown <= 0) {
          clearInterval(timer)
          this.canGetCode = true
          this.codeText = '重新获取'
        } else {
          this.codeText = `${countdown}s`
        }
      }, 1000)
    },

    // 协议勾选
    onAgreeChange(e) {
      const isAgree = e.detail.value.includes('agree')
      this.isAgree = isAgree
      this.updateCanLogin()
    },

    // 登录
    async handleLogin() {
      if (!this.canLogin) return
      
      uni.showLoading({
        title: '登录中...'
      })
      
      try {
        const { phoneNumber, verifyCode } = this
        const app = getApp()
        
        const loginData = {
          phone:'13800138000',//phoneNumber,
          password:'123456',
          code:''// verifyCode
        }
        
        const res = await request.post('/api/login', loginData)
        
        if (res.code === 200 && res.data) {
          // 保存登录信息
          const { user, token } = res.data
          
          app.setUserInfo(user)
          app.globalData.isLogin = true
          app.globalData.token = token
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', user)
          
          uni.hideLoading()
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/feed/index'
            })
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Login error:', error)
      }
    },

    // 微信登录
    async handleWxLogin() {
      uni.showToast({
        title: '微信登录功能暂未开放',
        icon: 'none'
      })
    },

    // QQ登录
    async handleQQLogin() {
      uni.showToast({
        title: 'QQ登录功能暂未开放',
        icon: 'none'
      })
    },

    // 跳转到用户协议
    goToAgreement() {
      uni.navigateTo({
        url: '/pages/agreement/index'
      })
    },

    // 跳转到隐私政策
    goToPrivacy() {
      uni.navigateTo({
        url: '/pages/agreement/index?type=privacy'
      })
    }
  }
}
</script>

<style scoped>
/* 登录页样式 */
.login-container {
  /* width: 100%; */
  height:87.5vh;
  background: #00CED1; /* 青绿色背景 */
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 120rpx 60rpx 60rpx 60rpx;
}

/* 欢迎文字 */
.welcome-section {
  display: flex;
  justify-content: center;
  margin-bottom: 80rpx;
}

.welcome-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
}

/* 登录表单 */
.login-form {
  flex: 1;
}

.form-item {
  margin-bottom: 40rpx;
    border-radius: 0 50% 50% 0 / 50% 0 0 50%; /* 左右两边圆角 */
  overflow: hidden;
}

/* 输入框样式 */
.input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20rpx;
  padding: 0 30rpx;
  height: 100rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.input-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.phone-input,
.code-input {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  border: none;
  background: transparent;
}

.input-placeholder {
  color: #999999;
  font-size: 30rpx;
}

/* 验证码按钮 */
.code-btn {
  padding: 16rpx 24rpx;
  background: #000000;
  color: white;
  font-size: 28rpx;
  border-radius: 10rpx;
  white-space: nowrap;
  margin-left: 16rpx;
  transition: all 0.3s;
}
.code-btn.disabled {
  background: #CCCCCC;
  color: white;
}

/* 信息提示文字 */
.info-text {
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
}

.info-text text {
  font-size: 28rpx;
  color: white;
  text-align: center;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 100rpx;
  background: #CCCCCC;
  color: white;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 20rpx;
  border: none;
  margin-bottom: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.login-btn.active {
  background: #000000;
  color: white;
}
.login-btn.active:active {
  transform: translateY(2rpx);
}

/* 第三方登录区域 */
.third-party-section {
  margin-bottom: 60rpx;
}

.divider-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.divider-line {
  width: 60rpx;
  height: 2rpx;
  background: #999999;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
  gap: 80rpx;
}

.third-party-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.third-party-icon {
  width: 100rpx;
}

.third-party-text {
  font-size: 28rpx;
  color: #000000;
  font-weight: bold;
}

/* 用户协议 */
.agreement-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  padding-top: 100px;
}

.agreement-text {
  font-size: 28rpx;
  color: white;
}

.agreement-link {
  font-size: 28rpx;
  color: white;
  font-weight: bold;
  text-decoration: underline;
}

</style>

