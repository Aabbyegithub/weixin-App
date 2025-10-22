<template>
  <view class="help-container">
    <view class="help-content">
      <text class="help-title">帮助与反馈</text>
      
      <view class="help-section">
        <text class="section-title">常见问题</text>
        
        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @tap="toggleFaq" :data-index="index">
          <view class="faq-question">
            <text class="question-text">{{ item.question }}</text>
            <text class="toggle-icon" :class="{ active: item.expanded }">▼</text>
          </view>
          <view class="faq-answer" v-if="item.expanded">
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>

      <view class="help-section">
        <text class="section-title">联系我们</text>
        
        <view class="contact-item" @tap="copyContact" data-type="email">
          <image class="contact-icon" src="/static/icons/email.png" mode="aspectFit"></image>
          <view class="contact-info">
            <text class="contact-label">邮箱</text>
            <text class="contact-value">support@linkme.com</text>
          </view>
          <text class="copy-text">复制</text>
        </view>

        <view class="contact-item" @tap="copyContact" data-type="phone">
          <image class="contact-icon" src="/static/icons/phone.png" mode="aspectFit"></image>
          <view class="contact-info">
            <text class="contact-label">电话</text>
            <text class="contact-value">400-123-4567</text>
          </view>
          <text class="copy-text">复制</text>
        </view>

        <view class="contact-item" @tap="openWechat">
          <image class="contact-icon" src="/static/icons/wechat.png" mode="aspectFit"></image>
          <view class="contact-info">
            <text class="contact-label">微信客服</text>
            <text class="contact-value">LinkMe_Support</text>
          </view>
          <text class="copy-text">添加</text>
        </view>
      </view>

      <view class="help-section">
        <text class="section-title">意见反馈</text>
        
        <view class="feedback-form">
          <textarea 
            class="feedback-input"
            placeholder="请描述您遇到的问题或建议..."
            v-model="feedbackText"
            maxlength="500"
          ></textarea>
          <text class="char-count">{{ feedbackText.length }}/500</text>
          
          <button class="submit-btn" :class="{ active: feedbackText.trim().length > 0 }" @tap="submitFeedback" :disabled="feedbackText.trim().length === 0">
            提交反馈
          </button>
        </view>
      </view>

      <view class="help-section">
        <text class="section-title">版本信息</text>
        <view class="version-info">
          <text class="version-text">当前版本：v1.0.0</text>
          <text class="version-text">更新时间：2024-01-01</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackText: '',
      faqList: [
        {
          question: '如何注册账户？',
          answer: '您可以通过手机号码注册账户，系统会发送验证码到您的手机。',
          expanded: false
        },
        {
          question: '忘记密码怎么办？',
          answer: '您可以在登录页面点击"忘记密码"，通过手机验证码重置密码。',
          expanded: false
        },
        {
          question: '如何发布动态？',
          answer: '点击底部导航栏的"发布"按钮，输入文字内容并选择图片即可发布。',
          expanded: false
        },
        {
          question: '如何添加好友？',
          answer: '您可以通过搜索用户名、扫描二维码或通过手机通讯录添加好友。',
          expanded: false
        },
        {
          question: '如何设置隐私？',
          answer: '在"我的"页面点击设置，可以调整账户隐私设置和动态可见性。',
          expanded: false
        }
      ]
    }
  },

  methods: {
    // 切换FAQ展开状态
    toggleFaq(e) {
      const index = e.currentTarget.dataset.index
      this.faqList[index].expanded = !this.faqList[index].expanded
    },

    // 复制联系方式
    copyContact(e) {
      const type = e.currentTarget.dataset.type
      let text = ''
      
      if (type === 'email') {
        text = 'support@linkme.com'
      } else if (type === 'phone') {
        text = '400-123-4567'
      }
      
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },

    // 打开微信
    openWechat() {
      uni.showToast({
        title: '请手动添加微信：LinkMe_Support',
        icon: 'none',
        duration: 3000
      })
    },

    // 提交反馈
    async submitFeedback() {
      if (!this.feedbackText.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '提交中...'
      })

      try {
        // 这里应该调用API提交反馈
        // const res = await request.post('/api/feedback', {
        //   content: this.feedbackText
        // })
        
        // 模拟提交成功
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '反馈提交成功',
            icon: 'success'
          })
          this.feedbackText = ''
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.help-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.help-content {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.help-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 60rpx;
  display: block;
}

.help-section {
  margin-bottom: 60rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #4DD0E1;
  margin-bottom: 30rpx;
  display: block;
}

/* FAQ样式 */
.faq-item {
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  transition: all 0.3s;
}

.faq-item:active {
  background: #f8f8f8;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #f8f8f8;
}

.question-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  flex: 1;
}

.toggle-icon {
  font-size: 24rpx;
  color: #666666;
  transition: transform 0.3s;
}

.toggle-icon.active {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 30rpx 30rpx;
  background: white;
}

.answer-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

/* 联系方式样式 */
.contact-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s;
}

.contact-item:active {
  background: #f8f8f8;
}

.contact-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 8rpx;
}

.contact-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.copy-text {
  font-size: 24rpx;
  color: #4DD0E1;
  padding: 8rpx 16rpx;
  border: 1rpx solid #4DD0E1;
  border-radius: 20rpx;
}

/* 反馈表单样式 */
.feedback-form {
  position: relative;
}

.feedback-input {
  width: 100%;
  min-height: 200rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 30rpx;
  font-size: 28rpx;
  color: #333333;
  border: none;
  outline: none;
  box-sizing: border-box;
}

.char-count {
  position: absolute;
  bottom: 20rpx;
  right: 30rpx;
  font-size: 24rpx;
  color: #999999;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background: #cccccc;
  color: white;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 40rpx;
  border: none;
  margin-top: 30rpx;
  transition: all 0.3s;
}

.submit-btn.active {
  background: linear-gradient(135deg, #4DD0E1, #80DEEA);
  box-shadow: 0 4rpx 20rpx rgba(77, 208, 225, 0.3);
}

.submit-btn.active:active {
  transform: scale(0.95);
}

/* 版本信息样式 */
.version-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.version-text {
  font-size: 26rpx;
  color: #666666;
}
</style>
