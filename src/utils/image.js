/**
 * 图片处理工具函数
 */

/**
 * 生成用户头像
 * @param {String} userId - 用户ID
 * @returns {String} 头像URL
 */
export function generateUserAvatar(userId) {
  // 使用默认头像或生成基于用户ID的头像
  const defaultAvatars = [
    '/static/images/default-avatar1.png',
    '/static/images/default-avatar2.png',
    '/static/images/default-avatar3.png',
    '/static/images/default-avatar4.png',
    '/static/images/default-avatar5.png'
  ]
  
  if (!userId) return defaultAvatars[0]
  
  // 根据用户ID选择头像
  const index = userId.length % defaultAvatars.length
  return defaultAvatars[index]
}

/**
 * 生成帖子图片
 * @param {String} postId - 帖子ID
 * @returns {String} 图片URL
 */
export function generatePostImage(postId) {
  // 使用默认图片或生成基于帖子ID的图片
  const defaultImages = [
    '/static/images/default-post1.jpg',
    '/static/images/default-post2.jpg',
    '/static/images/default-post3.jpg',
    '/static/images/default-post4.jpg',
    '/static/images/default-post5.jpg'
  ]
  
  if (!postId) return defaultImages[0]
  
  // 根据帖子ID选择图片
  const index = postId.length % defaultImages.length
  return defaultImages[index]
}

/**
 * 格式化时间
 * @param {String|Date} time - 时间
 * @returns {String} 格式化后的时间字符串
 */
export function formatTime(time) {
  if (!time) return ''
  
  const now = new Date()
  const targetTime = new Date(time)
  const diff = now - targetTime
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 小于1周
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 超过1周，显示具体日期
  const year = targetTime.getFullYear()
  const month = targetTime.getMonth() + 1
  const day = targetTime.getDate()
  
  if (year === now.getFullYear()) {
    return `${month}月${day}日`
  } else {
    return `${year}年${month}月${day}日`
  }
}

/**
 * 处理图片URL
 * @param {String} url - 原始图片URL
 * @returns {String} 处理后的图片URL
 */
export function processImageUrl(url) {
  if (!url) return ''
  
  // 如果是相对路径，添加基础URL
  if (url.startsWith('/')) {
    return getApp().globalData.baseUrl + url
  }
  
  // 如果是完整URL，直接返回
  if (url.startsWith('http')) {
    return url
  }
  
  // 其他情况，添加基础URL
  return getApp().globalData.baseUrl + '/' + url
}

/**
 * 压缩图片
 * @param {String} filePath - 图片路径
 * @param {Number} quality - 压缩质量 0-1
 * @returns {Promise} 压缩后的图片路径
 */
export function compressImage(filePath, quality = 0.8) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality: quality,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 选择图片
 * @param {Number} count - 最多选择图片数量
 * @param {String} sizeType - 图片尺寸类型
 * @param {String} sourceType - 图片来源类型
 * @returns {Promise} 选择的图片路径数组
 */
export function chooseImage(count = 9, sizeType = ['original', 'compressed'], sourceType = ['album', 'camera']) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 预览图片
 * @param {Array} urls - 图片URL数组
 * @param {Number} current - 当前显示图片索引
 */
export function previewImage(urls, current = 0) {
  uni.previewImage({
    urls,
    current: current
  })
}

/**
 * 保存图片到相册
 * @param {String} filePath - 图片路径
 * @returns {Promise} 保存结果
 */
export function saveImageToPhotosAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: (res) => {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        resolve(res)
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          uni.showModal({
            title: '提示',
            content: '需要授权保存图片到相册',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        } else {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
        reject(err)
      }
    })
  })
}

