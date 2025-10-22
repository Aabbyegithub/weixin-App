/**
 * 封装请求方法
 * @param {Object} options - 请求配置
 * @param {String} options.url - 请求地址
 * @param {String} options.method - 请求方法
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 * @param {Boolean} options.showLoading - 是否显示加载提示
 */
const request = (options = {}) => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true
  } = options

  // 显示加载提示
  if (showLoading) {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
  }

  // 获取token
  const token = uni.getStorageSync('token')
  
  // 设置请求头
  const requestHeader = {
    'Content-Type': 'application/json',
    ...header
  }
  
  if (token) {
    requestHeader['Authorization'] = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: getApp().globalData.baseUrl + url,
      method,
      data,
      header: requestHeader,
      success: (res) => {
        if (showLoading) {
          uni.hideLoading()
        }

        // 处理响应
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            // 业务错误
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // 未授权，需要登录
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          
          // 清除登录信息
          getApp().clearLoginInfo()
          
          // 跳转登录页
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/login/index'
            })
          }, 1500)
          
          reject(res)
        } else {
          // 其他错误
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        if (showLoading) {
          uni.hideLoading()
        }
        
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        
        reject(err)
      }
    })
  })
}

// 导出请求方法
export default {
  get: (url, data, options = {}) => {
    return request({
      url,
      method: 'GET',
      data,
      ...options
    })
  },
  
  post: (url, data, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  
  put: (url, data, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },
  
  delete: (url, data, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  },
  
  upload: (url, filePath, formData = {}, options = {}) => {
    const token = uni.getStorageSync('token')
    
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: getApp().globalData.baseUrl + url,
        filePath,
        name: 'file',
        formData,
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            uni.showToast({
              title: data.msg || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }
}

