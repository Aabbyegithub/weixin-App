<template>
  <view class="wallet-container">
    <view class="card">
      <text class="label">账户余额</text>
      <text class="balance">¥ {{ balance }}</text>
    </view>

    <view class="actions">
      <button class="btn primary" @tap="recharge">充值</button>
      <button class="btn" @tap="withdraw">提现</button>
      <button class="btn" @tap="history">收支明细</button>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request'

export default {
  data(){ return { balance: '0.00' } },
  async onShow(){
    try { const res = await request.get('/api/wallet'); if (res.code===200 && res.data) this.balance = res.data.balance || '0.00' } catch(e) {}
  },
  methods:{
    recharge(){ uni.showToast({ title:'暂未开通', icon:'none' }) },
    withdraw(){ uni.showToast({ title:'暂未开通', icon:'none' }) },
    history(){ uni.showToast({ title:'暂未开通', icon:'none' }) }
  }
}
</script>

<style scoped>
.wallet-container{ padding:24rpx }
.card{ background:linear-gradient(135deg,#4DD0E1,#80DEEA); border-radius:20rpx; padding:40rpx; color:#fff; margin-bottom:24rpx }
.label{ font-size:26rpx; opacity:.9 }
.balance{ display:block; font-size:48rpx; font-weight:700; margin-top:10rpx }
.actions{ display:flex; gap:16rpx }
.btn{ flex:1; height:88rpx; border:none; border-radius:44rpx; background:#eee; color:#333; font-size:32rpx }
.btn.primary{ background:#4DD0E1; color:#fff }
</style>
