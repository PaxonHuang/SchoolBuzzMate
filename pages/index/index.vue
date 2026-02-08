<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>
    <view class="page-doodle-2">◉</view>
    <view class="page-doodle-3">☆</view>

    <!-- 欢迎卡片 -->
    <brutalist-card class="welcome-card" taped accent doodle>
      <text class="welcome-title">校趣闪搭</text>
      <text class="welcome-subtitle">校园生活服务平台</text>
      <view class="welcome-decoration">
        <text class="deco-line"></text>
        <text class="deco-star">★</text>
        <text class="deco-line"></text>
      </view>
    </brutalist-card>

    <!-- 登录提示卡片 -->
    <brutalist-card v-if="!userStore.isLoggedIn" class="login-card" dashed>
      <view class="login-content">
        <text class="login-icon">👋</text>
        <text class="login-title">欢迎来到校趣</text>
        <text class="login-desc">登录后可使用全部功能</text>

        <view class="feature-tags">
          <view class="feature-tag">
            <text>📝</text>
            <text>发帖交流</text>
          </view>
          <view class="feature-tag">
            <text>👥</text>
            <text>寻找搭子</text>
          </view>
          <view class="feature-tag">
            <text>📦</text>
            <text>跑腿服务</text>
          </view>
        </view>

        <brutalist-button
          class="login-btn"
          accent
          taped
          arrow
          large
          @click="handleLogin"
        >
          立即登录
        </brutalist-button>
      </view>
    </brutalist-card>

    <!-- 用户信息卡片 -->
    <brutalist-card v-else class="user-card" taped>
      <view class="user-header">
        <view class="user-avatar-wrapper" @click="goToProfile">
          <text class="user-avatar">{{ userStore.user?.nickname?.charAt(0) || 'U' }}</text>
          <view class="edit-hint">✏️</view>
        </view>
        <view class="user-info-section">
          <text class="user-name">{{ userStore.user?.nickname || '校园用户' }}</text>
          <view class="user-campus">
            <text class="campus-icon">📍</text>
            <text>{{ userStore.user?.campus || '未设置校区' }}</text>
          </view>
        </view>
        <brutalist-button class="profile-btn" accent taped @click="goToProfile">
          我的
        </brutalist-button>
      </view>

      <!-- 用户标签 -->
      <view v-if="userStore.user?.tags?.length > 0" class="user-tags">
        <view
          v-for="(tag, index) in userStore.user.tags"
          :key="index"
          class="user-tag"
        >
          {{ tag }}
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="quick-actions">
        <view class="action-item" @click="goToPage('buddy')">
          <text class="action-icon">👥</text>
          <text class="action-name">找搭子</text>
          <text class="action-arrow">→</text>
        </view>
        <view class="action-item" @click="goToPage('delivery')">
          <text class="action-icon">📦</text>
          <text class="action-name">跑腿</text>
          <text class="action-arrow">→</text>
        </view>
        <view class="action-item" @click="goToPage('forum')">
          <text class="action-icon">📝</text>
          <text class="action-name">论坛</text>
          <text class="action-arrow">→</text>
        </view>
      </view>
    </brutalist-card>

    <!-- 消息板块 -->
    <brutalist-card class="message-section" dashed>
      <view class="message-header">
        <text class="message-title">消息通知</text>
        <view class="message-unread" v-if="unreadCount > 0">
          <text class="unread-badge">{{ unreadCount }}</text>
        </view>
      </view>
      <view class="message-list" v-if="messages.length > 0">
        <view
          v-for="(message, index) in messages.slice(0, 3)"
          :key="message._id || index"
          class="message-item"
          @click="viewMessage(message)"
        >
          <view class="message-icon" :class="'message-icon-' + message.type">
            <text>{{ getMessageIcon(message.type) }}</text>
          </view>
          <view class="message-content">
            <text class="message-title-text">{{ message.title || getMessageTitle(message.type) }}</text>
            <text class="message-preview">{{ message.content }}</text>
          </view>
          <text class="message-time">{{ formatTime(message.timestamp || message.createTime) }}</text>
        </view>
      </view>
      <view v-else class="no-messages">
        <text class="no-messages-icon">🔔</text>
        <text class="no-messages-text">暂无新消息</text>
      </view>
      <brutalist-button v-if="messages.length > 0" class="view-all-btn" outline @click="goToMessages">
        查看全部消息
      </brutalist-button>
    </brutalist-card>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="uts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import BrutalistButton from '@/components/brutalist/BrutalistButton.vue'
import TabBar from '@/components/brutalist/TabBar.vue'

const userStore = useUserStore()

// 消息类型定义
interface Message {
  _id: string
  type: string
  title: string
  content: string
  timestamp: number
  read: boolean
  status?: string
  orderInfo?: any
}

// 消息数据
const messages = ref<Message[]>([])
const unreadCount = computed(() => {
  return messages.value.filter(m => !m.read).length
})

// 页面加载时检查登录状态
onMounted(() => {
  userStore.checkLoginStatus()
  if (userStore.isLoggedIn) {
    loadMessages()
  }
})

// 页面显示时刷新列表（从创建页面返回时触发）
onShow(() => {
  if (userStore.isLoggedIn) {
    loadMessages()
  }
})

// 页面跳转
function goToPage(page: string) {
  uni.switchTab({
    url: `/pages/${page}/index`
  })
}

// 跳转到个人中心
function goToProfile() {
  uni.navigateTo({
    url: '/pages/user/index'
  })
}

// 跳转到消息中心
function goToMessages() {
  uni.switchTab({
    url: '/pages/messages/index'
  })
}

// 查看消息
function viewMessage(message: Message) {
  uni.navigateTo({
    url: `/pages/messages/index?messageId=${message._id}`
  })
}

// 获取消息图标
function getMessageIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'order': '📦',
    'comment': '💬',
    'like': '❤️',
    'system': '🔔',
    'chat': '💬'
  }
  return iconMap[type] || '🔔'
}

// 获取消息标题
function getMessageTitle(type: string): string {
  const titleMap: Record<string, string> = {
    'order': '订单通知',
    'comment': '新评论',
    'like': '点赞提醒',
    'system': '系统消息',
    'chat': '私信消息'
  }
  return titleMap[type] || '新消息'
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return Math.floor(diff / 86400000) + '天前'
  }
}

// 加载消息
async function loadMessages() {
  try {
    const db = uniCloud.database()
    const res = await db.collection('messages')
      .where('receiver == $env.UNI_USER_ID || sender == $env.UNI_USER_ID')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get()

    messages.value = res.data as Message[]
  } catch (e) {
    console.error('加载消息失败:', e)
    // 模拟数据
    messages.value = [
      {
        _id: '1',
        type: 'order',
        title: '订单通知',
        content: '您的跑腿订单已接单',
        timestamp: Date.now(),
        read: false
      },
      {
        _id: '2',
        type: 'comment',
        title: '新评论',
        content: '用户A评论了您的帖子',
        timestamp: Date.now() - 3600000,
        read: false
      }
    ] as Message[]
  }
}

// 处理登录
async function handleLogin() {
  try {
    uni.showLoading({ title: '登录中...' })

    const loginRes = await uni.login({
      provider: 'weixin'
    })

    uni.hideLoading()

    // 处理返回值 - UTS 中 uni.login 返回的是对象，不是数组
    let code: string = ''

    // 尝试多种方式获取 code
    if (Array.isArray(loginRes)) {
      const result = loginRes[1] || loginRes[0]
      code = result?.code || ''
    } else if (loginRes && typeof loginRes === 'object') {
      code = (loginRes as any).code || ''
    }

    if (!code) {
      console.log('uni.login 返回值:', JSON.stringify(loginRes))
      // 使用模拟 code（开发模式）
      code = 'mock_code_' + Date.now()
    }

    // 调用 store 的 login 方法
    const result = await userStore.login(code)

    if (result.success) {
      uni.showToast({
        title: result.message || '登录成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: result.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (e) {
    uni.hideLoading()
    console.error('登录错误:', e)
    // 直接使用模拟登录
    const result = await userStore.login('fallback_code_' + Date.now())
    if (result.success) {
      uni.showToast({
        title: '登录成功（离线模式）',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  }
}

// 处理退出登录
async function handleLogout() {
  try {
    const res = await uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？'
    })

    if (res.confirm) {
      await userStore.logout()
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
    }
  } catch (e) {
    console.error('退出登录错误:', e)
  }
}
</script>

<style lang="scss" scoped>
// 野兽派配色方案
$black: #000000;
$white: #ffffff;
$red: #FF6B6B;
$teal: #4ECDC4;
$yellow: #FFE66D;

.page-container {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 160rpx;
  background: linear-gradient(180deg, #FFF9E6 0%, #ffffff 50%, #F0FFF4 100%);
  position: relative;
}

// 页面背景涂鸦
.page-doodle {
  &-1 {
    position: fixed;
    top: 100rpx;
    right: 40rpx;
    font-size: 48rpx;
    color: $teal;
    opacity: 0.3;
    animation: spin 12s linear infinite;
    z-index: 0;
  }

  &-2 {
    position: fixed;
    top: 300rpx;
    left: 30rpx;
    font-size: 40rpx;
    color: $yellow;
    opacity: 0.4;
    animation: pulse 3s ease-in-out infinite;
    z-index: 0;
  }

  &-3 {
    position: fixed;
    top: 500rpx;
    right: 60rpx;
    font-size: 36rpx;
    color: $red;
    opacity: 0.25;
    animation: spin 8s linear infinite reverse;
    z-index: 0;
  }
}

// 欢迎卡片
.welcome-card {
  text-align: center;
  padding: 48rpx 32rpx !important;
  margin-bottom: 32rpx !important;

  .welcome-title {
    display: block;
    font-size: 72rpx;
    font-weight: 900;
    color: $black;
    margin-bottom: 16rpx;
    letter-spacing: 4rpx;
    text-transform: uppercase;
  }

  .welcome-subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  .welcome-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24rpx;
    gap: 16rpx;

    .deco-line {
      width: 80rpx;
      height: 4rpx;
      background: $black;
      border-radius: 2rpx;
    }

    .deco-star {
      font-size: 32rpx;
      color: $red;
    }
  }
}

// 登录卡片
.login-card {
  margin-bottom: 32rpx !important;

  .login-content {
    text-align: center;
    padding: 16rpx 0;
  }

  .login-icon {
    display: block;
    font-size: 96rpx;
    margin-bottom: 24rpx;
    animation: wave 1s ease-in-out infinite;
  }

  .login-title {
    display: block;
    font-size: 36rpx;
    font-weight: 900;
    color: $black;
    margin-bottom: 12rpx;
  }

  .login-desc {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 32rpx;
  }

  .feature-tags {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 32rpx;
    flex-wrap: wrap;

    .feature-tag {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 20rpx;
      border: 3rpx solid $black;
      background: $white;
      box-shadow: 4rpx 4rpx 0 $black;

      text:first-child {
        font-size: 32rpx;
        margin-bottom: 4rpx;
      }

      text:last-child {
        font-size: 22rpx;
        font-weight: 700;
      }
    }
  }

  .login-btn {
    width: 100%;
  }
}

// 用户卡片
.user-card {
  margin-bottom: 32rpx !important;

  .user-header {
    display: flex;
    align-items: center;
    padding-bottom: 24rpx;
    border-bottom: 3rpx dashed #ddd;
    margin-bottom: 24rpx;
  }

  .user-avatar-wrapper {
    position: relative;
    width: 96rpx;
    height: 96rpx;
    border: 4rpx solid $black;
    background: linear-gradient(135deg, $teal, #4ECDC4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    box-shadow: 4rpx 4rpx 0 $black;
    cursor: pointer;
  }

  .edit-hint {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32rpx;
    height: 32rpx;
    background: $white;
    border: 2rpx solid $black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18rpx;
    box-shadow: 2rpx 2rpx 0 $black;
  }

  .user-avatar {
    font-size: 48rpx;
    font-weight: 900;
    color: $white;
  }

  .user-info-section {
    flex: 1;
  }

  .user-name {
    display: block;
    font-size: 36rpx;
    font-weight: 900;
    color: $black;
    margin-bottom: 8rpx;
  }

  .user-campus {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #666;

    .campus-icon {
      font-size: 24rpx;
      margin-right: 4rpx;
    }
  }

  .profile-btn {
    padding: 12rpx 24rpx !important;
    font-size: 24rpx !important;
  }

  // 用户标签
  .user-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 24rpx;
    flex-wrap: wrap;
  }

  .user-tag {
    padding: 8rpx 16rpx;
    border: 2rpx solid $black;
    background: $yellow;
    font-size: 22rpx;
    font-weight: 700;
    box-shadow: 2rpx 2rpx 0 $black;
  }

  // 快捷操作
  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .action-item {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    border: 3rpx solid $black;
    background: $white;
    box-shadow: 4rpx 4rpx 0 $teal;
    transition: all 0.2s ease;

    .action-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .action-name {
      flex: 1;
      font-size: 28rpx;
      font-weight: 700;
    }

    .action-arrow {
      font-size: 28rpx;
      color: $black;
    }

    &:active {
      transform: translate(2rpx, 2rpx);
      box-shadow: 2rpx 2rpx 0 $teal;
    }
  }
}

// 消息板块
.message-section {
  margin-bottom: 32rpx !important;

  .message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
  }

  .message-title {
    font-size: 32rpx;
    font-weight: 900;
    color: $black;
  }

  .message-unread {
    position: relative;
  }

  .unread-badge {
    position: absolute;
    top: -12rpx;
    right: -12rpx;
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    border-radius: 16rpx;
    background: $red;
    color: $white;
    font-size: 20rpx;
    font-weight: 900;
    text-align: center;
    line-height: 32rpx;
    box-shadow: 2rpx 2rpx 0 $black;
  }

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .message-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 12rpx;
    border: 2rpx solid #eee;
    border-radius: 8rpx;
    transition: all 0.2s ease;

    &:active {
      background: #f9f9f9;
    }

    .message-icon {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      box-shadow: 2rpx 2rpx 0 $black;

      &-order {
        background: $yellow;
      }

      &-comment {
        background: #FFE0E0;
      }

      &-like {
        background: #E0FFE0;
      }

      &-system {
        background: #E0E8FF;
      }
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-title-text {
      display: block;
      font-size: 26rpx;
      font-weight: 700;
      color: $black;
      margin-bottom: 4rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message-preview {
      display: block;
      font-size: 22rpx;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message-time {
      font-size: 20rpx;
      color: #999;
      flex-shrink: 0;
    }
  }

  .no-messages {
    text-align: center;
    padding: 40rpx 0;
  }

  .no-messages-icon {
    display: block;
    font-size: 48rpx;
    margin-bottom: 12rpx;
    opacity: 0.5;
  }

  .no-messages-text {
    display: block;
    font-size: 24rpx;
    color: #999;
  }

  .view-all-btn {
    width: 100%;
    margin-top: 16rpx;
  }
}

// 动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}
</style>
