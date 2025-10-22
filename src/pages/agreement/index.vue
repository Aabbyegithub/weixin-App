<template>
  <view class="agreement-container">
    <view class="agreement-content">
      <text class="agreement-title">用户协议</text>
      
      <view class="agreement-section">
        <text class="section-title">1. 服务条款</text>
        <text class="section-content">
          欢迎使用Link Me！本协议是您与Link Me之间关于您使用Link Me服务所订立的协议。
          请您仔细阅读本协议，特别是免除或者限制责任的条款。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">2. 账户注册</text>
        <text class="section-content">
          您需要注册一个账户才能使用我们的服务。您应当提供真实、准确、完整的信息，并及时更新您的信息以保持其真实、准确、完整。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">3. 用户行为规范</text>
        <text class="section-content">
          您在使用我们的服务时，应当遵守相关法律法规，不得发布违法、有害、威胁、辱骂、诽谤、色情、暴力或其他不当内容。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">4. 隐私保护</text>
        <text class="section-content">
          我们重视您的隐私保护。我们会按照我们的隐私政策收集、使用、存储您的个人信息。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">5. 服务变更</text>
        <text class="section-content">
          我们有权随时修改或终止服务，无需事先通知。我们不对因服务修改或终止而造成的任何损失承担责任。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">6. 免责声明</text>
        <text class="section-content">
          本服务按"现状"提供，我们不保证服务的无中断、无错误、无病毒或其他有害成分。
        </text>
      </view>

      <view class="agreement-section">
        <text class="section-title">7. 联系方式</text>
        <text class="section-content">
          如果您对本协议有任何疑问，请通过以下方式联系我们：
          邮箱：support@linkme.com
          电话：400-123-4567
        </text>
      </view>

      <view class="agreement-footer">
        <text class="footer-text">本协议最后更新时间：2024年1月1日</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },

  onLoad(options) {
    // 根据参数显示不同类型的协议
    if (options.type === 'privacy') {
      uni.setNavigationBarTitle({
        title: '隐私政策'
      })
    }
  }
}
</script>

<style scoped>
.agreement-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  /* padding: 30rpx; */
}

.agreement-content {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.agreement-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 60rpx;
  display: block;
}

.agreement-section {
  margin-bottom: 50rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #4DD0E1;
  margin-bottom: 20rpx;
  display: block;
}

.section-content {
  font-size: 28rpx;
  line-height: 1.8;
  color: #666666;
  text-align: justify;
  display: block;
}

.agreement-footer {
  margin-top: 60rpx;
  padding-top: 40rpx;
  border-top: 1rpx solid #e0e0e0;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
