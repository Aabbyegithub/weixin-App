# Link Me - UniApp版本

## 项目简介

Link Me是一个社交图片分享应用，这是从微信小程序重构而来的UniApp版本，支持多端发布（微信小程序、H5、App等）。

## 项目结构

```
uniapp/
├── App.vue                 # 应用入口文件
├── manifest.json          # 应用配置文件
├── pages.json             # 页面路由配置
├── README.md              # 项目说明文档
├── components/            # 组件目录
│   └── PostCard/         # 动态卡片组件
│       └── PostCard.vue
├── pages/                # 页面目录
│   ├── splash/           # 启动页
│   ├── login/            # 登录页
│   ├── feed/             # 动态页
│   ├── messages/         # 消息页
│   ├── me/               # 个人中心
│   ├── upload/           # 发布页
│   ├── chat/             # 聊天页
│   ├── agreement/        # 用户协议
│   ├── help/             # 帮助页面
│   ├── about/            # 关于页面
│   ├── favorites/        # 收藏页面
│   └── ...               # 其他页面
├── static/               # 静态资源
│   ├── icons/           # 图标文件
│   ├── images/          # 图片文件
│   └── css/             # 样式文件
└── utils/               # 工具函数
    ├── request.js       # 网络请求封装
    └── image.js         # 图片处理工具
```

## 主要功能

### 1. 用户系统
- 用户注册/登录
- 个人信息管理
- 头像上传
- 用户协议

### 2. 动态功能
- 发布动态（文字+图片）
- 浏览动态列表
- 点赞、评论、分享
- 收藏动态

### 3. 社交功能
- 私聊聊天
- 群聊聊天
- 关注/粉丝系统
- 消息通知

### 4. 其他功能
- 相册管理
- 钱包功能
- 帮助反馈
- 设置页面

## 技术特点

### 1. 多端适配
- 支持微信小程序、H5、App等多端发布
- 统一的代码结构，条件编译适配不同平台
- 响应式设计，适配不同屏幕尺寸

### 2. 组件化开发
- 可复用的Vue组件
- 组件间通信使用事件机制
- 统一的组件样式规范

### 3. 状态管理
- 使用Vue的响应式数据
- 全局状态通过getApp()管理
- 本地存储使用uni.getStorageSync/setStorageSync

### 4. 网络请求
- 封装的request工具
- 统一的错误处理
- 支持文件上传

## 开发环境

### 环境要求
- Node.js 14+
- HBuilderX 3.0+
- 微信开发者工具（小程序开发）

### 安装依赖
```bash
# 安装uni-app CLI
npm install -g @dcloudio/uvm

# 创建项目（如果从零开始）
uni create -t default linkme-uniapp
```

### 运行项目
```bash
# 开发环境运行
npm run dev:mp-weixin    # 微信小程序
npm run dev:h5           # H5
npm run dev:app          # App

# 生产环境构建
npm run build:mp-weixin  # 微信小程序
npm run build:h5         # H5
npm run build:app        # App
```

## 配置说明

### 1. manifest.json
- 配置应用基本信息
- 设置各平台特有配置
- 权限申请配置

### 2. pages.json
- 页面路由配置
- 全局样式设置
- 底部导航配置

### 3. 环境配置
- 开发环境：http://localhost:8000
- 生产环境：需要修改utils/request.js中的baseUrl

## 页面说明

### 主要页面
1. **启动页** (pages/splash/index.vue)
   - 应用启动动画
   - 登录状态检查
   - 自动跳转逻辑

2. **登录页** (pages/login/index.vue)
   - 手机号登录
   - 验证码登录
   - 微信登录（待实现）

3. **动态页** (pages/feed/index.vue)
   - 动态列表展示
   - 下拉刷新
   - 上拉加载更多
   - 点赞、收藏功能

4. **消息页** (pages/messages/index.vue)
   - 聊天列表
   - 创建群聊
   - 扫一扫功能

5. **个人中心** (pages/me/index.vue)
   - 个人信息展示
   - 统计数据
   - 功能入口

6. **发布页** (pages/upload/index.vue)
   - 文字输入
   - 图片选择
   - 内容发布

7. **聊天页** (pages/chat/private.vue)
   - 实时聊天
   - 消息类型支持
   - 语音、图片、位置消息

## 组件说明

### PostCard组件
- 动态卡片展示
- 支持点赞、评论、分享
- 图片预览功能
- 用户头像点击跳转

## 工具函数

### request.js
- 网络请求封装
- 统一错误处理
- 请求拦截器
- 文件上传支持

### image.js
- 图片处理工具
- 头像生成
- 时间格式化
- 图片压缩

## 注意事项

1. **API接口**
   - 需要后端提供对应的API接口
   - 接口地址在utils/request.js中配置
   - 支持JWT token认证

2. **图片资源**
   - 静态资源放在static目录
   - 支持相对路径和绝对路径
   - 建议使用CDN加速

3. **平台差异**
   - 不同平台API可能有差异
   - 使用条件编译处理平台特有代码
   - 测试时需要在目标平台运行

4. **性能优化**
   - 图片懒加载
   - 列表虚拟滚动
   - 组件按需加载

## 部署说明

### 微信小程序
1. 在微信公众平台注册小程序
2. 配置服务器域名
3. 上传代码到微信开发者工具
4. 提交审核发布

### H5
1. 构建H5版本
2. 部署到Web服务器
3. 配置HTTPS（必需）
4. 配置域名白名单

### App
1. 使用HBuilderX打包
2. 配置应用签名
3. 生成安装包
4. 发布到应用商店

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成基础功能开发
- 支持多端发布

## 联系方式

- 邮箱：support@linkme.com
- 电话：400-123-4567
- 微信：LinkMe_Support

## 许可证

本项目仅供学习和交流使用，请勿用于商业用途。
