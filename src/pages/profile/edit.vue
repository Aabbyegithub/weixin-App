<template>
  <view class="edit-container">
    <view class="avatar-row">
      <image class="avatar" :src="form.avatar" mode="aspectFill" />
      <button class="btn" @tap="changeAvatar">更换头像</button>
    </view>

    <view class="form-item">
      <text class="label">昵称</text>
      <input class="input" v-model="form.nickname" placeholder="请输入昵称" />
    </view>

    <view class="form-item">
      <text class="label">简介</text>
      <textarea class="textarea" v-model="form.bio" placeholder="请输入个人简介" maxlength="100" />
    </view>

    <button class="save" @tap="save">保存</button>
  </view>
</template>

<script>
import request from '../../utils/request'
import { processImageUrl, generateUserAvatar } from '../../utils/image'

export default {
  data(){ return { form: { id:'', nickname:'', bio:'', avatar:'' } } },
  onLoad(){ const app = getApp(); const u = app.getUserInfo() || {}; this.form = { id:u.id, nickname:u.nickname||'', bio:u.bio||'', avatar: u.avatar || generateUserAvatar(u.id) } },
  methods:{
    changeAvatar(){
      uni.chooseImage({ count:1, sizeType:['compressed'], sourceType:['album','camera'], success: async (r)=>{
        const path = r.tempFilePaths[0]
        const up = await request.upload('/api/upload/avatar', path)
        if (up.code===200 && up.data){ this.form.avatar = processImageUrl(up.data.url) }
      }})
    },
    async save(){
      const res = await request.put(`/api/user/${this.form.id}/update`, { nickname: this.form.nickname.trim(), bio: this.form.bio.trim(), avatar: this.form.avatar })
      if (res.code===200){
        const app = getApp(); app.setUserInfo({ ...app.getUserInfo(), ...this.form })
        uni.showToast({ title:'保存成功', icon:'success' })
        setTimeout(()=> uni.navigateBack(), 800)
      }
    }
  }
}
</script>

<style scoped>
.edit-container{ padding:24rpx }
.avatar-row{ display:flex; align-items:center; gap:20rpx; margin-bottom:24rpx }
.avatar{ width:120rpx; height:120rpx; border-radius:50% }
.btn{ background:#4DD0E1; color:#fff; border:none; border-radius:24rpx; padding:10rpx 20rpx }
.form-item{ background:#fff; border-radius:16rpx; padding:20rpx; margin-bottom:16rpx }
.label{ display:block; font-size:24rpx; color:#666; margin-bottom:8rpx }
.input{ font-size:30rpx; color:#333 }
.textarea{ width:100%; min-height:160rpx; font-size:28rpx; color:#333 }
.save{ width:100%; height:88rpx; border:none; border-radius:44rpx; background:#4DD0E1; color:#fff; font-size:32rpx; }
</style>
