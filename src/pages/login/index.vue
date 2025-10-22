<template>
  <view class="login-container">
    <!-- 顶部Logo -->
    <view class="login-header">
      <view class="app-logo">
        <text class="logo-text">Link Me</text>
      </view>
      <text class="welcome-text">欢迎来到 Link Me</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 登录方式切换 -->
      <view class="login-type-tabs">
        <view 
          class="type-tab"
          :class="{ active: loginType === 'password' }"
          data-type="password"
          @tap="switchLoginType"
        >
          账号密码
        </view>
        <view 
          class="type-tab"
          :class="{ active: loginType === 'code' }"
          data-type="code"
          @tap="switchLoginType"
        >
          验证码登录
        </view>
      </view>

      <!-- 手机号输入 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-prefix">+86</text>
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

      <!-- 密码输入 -->
      <view class="form-item" v-if="loginType === 'password'">
        <view class="input-wrapper">
          <input 
            class="password-input" 
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
            v-model="password"
            @input="onPasswordInput"
          />
          <view class="password-toggle" @tap="togglePasswordVisible">
            <text class="toggle-icon">{{ passwordVisible ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>

      <!-- 验证码输入 -->
      <view class="form-item" v-if="loginType === 'code'">
        <view class="input-wrapper">
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

      <!-- 登录按钮 -->
      <button 
        class="login-btn"
        :class="{ active: canLogin }" 
        @tap="handleLogin"
        :disabled="!canLogin"
      >
        登录
      </button>

      <!-- 微信登录 -->
      <view class="wx-login-section">
        <view class="divider-wrapper">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>
        
        <button class="wx-login-btn" open-type="getUserInfo" @getuserinfo="handleWxLogin">
          <image class="wx-icon" src="/static/icons/wechat.png" mode="aspectFit"></image>
          <text>使用微信号登录</text>
        </button>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <view class="agreement-wrapper">
          <checkbox-group @change="onAgreeChange">
            <label class="agreement-label">
              <checkbox class="agreement-checkbox" value="agree" :checked="isAgree"/>
              <text class="agreement-text">我已阅读并同意</text>
            </label>
          </checkbox-group>
          <text class="agreement-link" @tap="goToAgreement">《用户协议》</text>
          <text class="agreement-text">和</text>
          <text class="agreement-link" @tap="goToPrivacy">《隐私政策》</text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="bottom-decoration">
      <view class="decoration-wave wave-1"></view>
      <view class="decoration-wave wave-2"></view>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'

export default {
  data() {
    return {
      loginType: 'password', // 'password' 或 'code'
      phoneNumber: '',
      password: '',
      verifyCode: '',
      codeText: '获取验证码',
      canGetCode: false,
      canLogin: false,
      isAgree: false,
      countdown: 60,
      passwordVisible: false
    }
  },

  methods: {
    // 手机号输入
    onPhoneInput(e) {
      this.phoneNumber = e.detail.value
      this.updateCanLogin()
    },

    // 密码输入
    onPasswordInput(e) {
      this.password = e.detail.value
      this.updateCanLogin()
    },

    // 验证码输入
    onCodeInput(e) {
      this.verifyCode = e.detail.value
      this.updateCanLogin()
    },

    // 切换登录方式
    switchLoginType(e) {
      const loginType = e.currentTarget.dataset.type
      this.loginType = loginType
      this.password = ''
      this.verifyCode = ''
      this.updateCanLogin()
    },

    // 切换密码可见性
    togglePasswordVisible() {
      this.passwordVisible = !this.passwordVisible
    },

    // 更新登录按钮状态
    updateCanLogin() {
      const { phoneNumber, password, verifyCode, loginType, isAgree } = this
      let canLogin = false
      let canGetCode = false
      
      if (this.validatePhone(phoneNumber) && isAgree) {
        if (loginType === 'password') {
          canLogin = password.length >= 6
        } else {
          canLogin = verifyCode.length === 6
          canGetCode = true
        }
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
        const { phoneNumber, password, verifyCode, loginType } = this
        const app = getApp()
        
        const loginData = {
          phone: phoneNumber
        }
        
        if (loginType === 'password') {
          loginData.password = password
        } else {
          loginData.code = verifyCode
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
    async handleWxLogin(e) {
      if (!this.isAgree) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }
      
      uni.showToast({
        title: '微信登录功能暂未开放',
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
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 头部Logo */
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  margin-bottom: 80rpx;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(77, 208, 225, 0.3);
  margin-bottom: 30rpx;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  letter-spacing: 2rpx;
}

.welcome-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
  letter-spacing: 2rpx;
}

/* 登录表单 */
.login-form {
  padding: 0 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

/* 登录方式切换 */
.login-type-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
  gap: 40rpx;
}
.type-tab {
  font-size: 30rpx;
  color: #999999;
  padding: 0 32rpx 12rpx 32rpx;
  cursor: pointer;
  border-bottom: 4rpx solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.type-tab.active {
  color: #4DD0E1;
  font-weight: bold;
  border-bottom: 4rpx solid #4DD0E1;
}

/* 输入框优化 */
.input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50rpx;
  padding: 0 40rpx;
  height: 100rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 8rpx;
}
.input-prefix {
  font-size: 30rpx;
  color: #666666;
  margin-right: 20rpx;
  padding-right: 20rpx;
  border-right: 2rpx solid #E5E5E5;
}
.phone-input,
.code-input,
.password-input {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
  border: none;
  background: transparent;
}
.input-placeholder {
  color: #CCCCCC;
  font-size: 28rpx;
}

/* 密码可见按钮 */
.password-toggle {
  margin-left: 16rpx;
  font-size: 32rpx;
  color: #4DD0E1;
  cursor: pointer;
}
.toggle-icon {
  font-size: 32rpx;
}

/* 验证码按钮 */
.code-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  color: white;
  font-size: 26rpx;
  border-radius: 30rpx;
  white-space: nowrap;
  margin-left: 16rpx;
  transition: all 0.3s;
}
.code-btn.disabled {
  background: #CCCCCC;
  color: white;
}

/* 登录按钮优化 */
.login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #CCCCCC, #DDDDDD);
  color: white;
  font-size: 34rpx;
  font-weight: 500;
  border-radius: 50rpx;
  border: none;
  margin-top: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0.7;
}
.login-btn.active {
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  box-shadow: 0 10rpx 30rpx rgba(77, 208, 225, 0.3);
  opacity: 1;
}
.login-btn.active:active {
  transform: translateY(2rpx);
  box-shadow: 0 5rpx 20rpx rgba(77, 208, 225, 0.3);
}

/* 微信登录按钮优化 */
.wx-login-section {
  margin-top: 80rpx;
}
.wx-login-btn {
  width: 100%;
  height: 100rpx;
  background: white;
  border: 2rpx solid #07C160;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #07C160;
  transition: all 0.3s;
  margin-top: 0;
}
.wx-login-btn:active {
  background: #F0FFF5;
}
.wx-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 16rpx;
}

/* 用户协议区优化 */
.agreement-section {
  margin-top: 60rpx;
  padding-bottom: 40rpx;
}
.agreement-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8rpx;
}
.agreement-label {
  display: flex;
  align-items: center;
}
.agreement-checkbox {
  transform: scale(0.7);
  margin-right: -10rpx;
}
.agreement-text {
  font-size: 24rpx;
  color: #999999;
}
.agreement-link {
  font-size: 24rpx;
  color: #4DD0E1;
  margin: 0 4rpx;
  text-decoration: underline;
}

/* 底部装饰优化 */
.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
  z-index: -1;
}
.decoration-wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 200rpx;
  border-radius: 50%;
}
.wave-1 {
  background: rgba(77, 208, 225, 0.05);
  left: -50%;
  animation: wave 20s linear infinite;
}
.wave-2 {
  background: rgba(128, 222, 234, 0.05);
  left: -50%;
  animation: wave 25s linear infinite reverse;
}
@keyframes wave {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(25%) translateY(-20rpx);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
}
</style>

