<template>
  <view class="page-container">
    <view class="page-doodle-1">✦</view>
    <view class="page-doodle-2">◉</view>

    <brutalist-card class="page-header" taped accent>
      <text class="page-title">消息中心</text>
      <text class="page-subtitle">查看最新动态</text>
    </brutalist-card>

    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ 'active': currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-emoji">{{ tab.emoji }}</text>
        <text class="tab-label">{{ tab.label }}</text>
        <text v-if="getUnreadCount(tab.value) > 0" class="tab-badge">
          {{ getUnreadCount(tab.value) }}
        </text>
      </view>
    </view>

    <view class="message-list">
      <view
        v-for="message in filteredMessages"
        :key="message._id"
        class="message-item"
        :class="{ 'unread': !message.read }"
        @click="viewMessage(message)"
      >
        <view class="message-icon" :class="'message-icon-' + message.type">
          <text>{{ getMessageIcon(message.type) }}</text>
        </view>

        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title || getMessageTitle(message.type) }}</text>
            <text class="message-time">{{ formatTime(message.timestamp) }}</text>
          </view>
          <text class="message-preview">{{ message.content }}</text>
          <view v-if="message.orderInfo" class="order-info">
            <text class="order-label">订单信息：</text>
            <text>{{ message.orderInfo }}</text>
          </view>
        </view>

        <view v-if="!message.read" class="unread-dot"></view>
      </view>
    </view>

    <view v-if="filteredMessages.length === 0" class="empty-state">
      <brutalist-card class="empty-card" dashed>
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无{{ getTabLabel() }}消息</text>
        <text class="empty-hint">去逛逛其他页面吧！</text>
      </brutalist-card>
    </view>

    <TabBar />
  </view>
</template>

<script setup lang="uts">
import { ref, computed } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import TabBar from '@/components/brutalist/TabBar.vue'

interface Message {
  _id: string
  type: string
  title?: string
  content: string
  timestamp: number
  read: boolean
  orderInfo?: string
}

interface Tab {
  label: string
  value: string
  emoji: string
}

const userStore = useUserStore()
const messages = ref<Message[]>([])
const currentTab = ref<string>('all')

const tabs: Tab[] = [
  { label: '全部', value: 'all', emoji: '📋' },
  { label: '订单', value: 'order', emoji: '📦' },
  { label: '评论', value: 'comment', emoji: '💬' },
  { label: '点赞', value: 'like', emoji: '❤️' },
  { label: '私信', value: 'chat', emoji: '✉️' },
  { label: '系统', value: 'system', emoji: '🔔' }
]

const filteredMessages = computed(() => {
  if (currentTab.value === 'all') {
    return messages.value
  }
  return messages.value.filter(m => m.type === currentTab.value)
})

function switchTab(tab: string) {
  currentTab.value = tab
}

function getUnreadCount(type?: string): number {
  if (type === 'all') {
    return messages.value.filter(m => !m.read).length
  }
  return messages.value.filter(m => !m.read && m.type === type).length
}

function getTabLabel(): string {
  const tab = tabs.find(t => t.value === currentTab.value)
  return tab?.label || ''
}

function getMessageIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'order': '📦',
    'comment': '💬',
    'like': '❤️',
    'system': '🔔',
    'chat': '✉️'
  }
  return iconMap[type] || '🔔'
}

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
  } else if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前'
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return month + '月' + day + '日'
  }
}

function viewMessage(message: Message) {
  if (!message.read) {
    message.read = true
    saveMessages()
  }

  if (message.type === 'order' && message.orderInfo) {
    uni.showModal({
      title: '订单详情',
      content: message.orderInfo,
      showCancel: false
    })
  } else {
    uni.showModal({
      title: message.title || getMessageTitle(message.type),
      content: message.content,
      showCancel: false
    })
  }
}

async function loadMessages() {
  try {
    const db = uniCloud.database()
    const userId = userStore.user?._id || ''

    const res = await db.collection('messages')
      .where(`receiver == '${userId}' || sender == '${userId}'`)
      .orderBy('timestamp desc', 'desc')
      .limit(50)
      .get()

    messages.value = res.data.map((item: any) => ({
      ...item,
      timestamp: item.timestamp || Date.now()
    })) as Message[]
  } catch (e) {
    console.error('加载消息失败:', e)

    const localMessages = uni.getStorageSync('messages') || []

    if (localMessages.length > 0) {
      messages.value = localMessages.map((item: any) => ({
        ...item,
        timestamp: item.timestamp || Date.now()
      }))
    } else {
      messages.value = [
        {
          _id: '1',
          type: 'order',
          title: '订单已接单',
          content: '您的跑腿订单已被人接单，请保持联系',
          timestamp: Date.now() - 1800000,
          read: false,
          orderInfo: '任务：帮忙取个快递\n接单人：小王\n费用：¥5'
        },
        {
          _id: '2',
          type: 'comment',
          title: '新评论',
          content: '用户"学习达人"评论了你的帖子',
          timestamp: Date.now() - 7200000,
          read: true
        },
        {
          _id: '3',
          type: 'like',
          title: '收到点赞',
          content: '你的帖子"图书馆约学习搭子"获得了新点赞',
          timestamp: Date.now() - 14400000,
          read: false
        },
        {
          _id: '4',
          type: 'system',
          title: '系统通知',
          content: '欢迎使用校趣闪搭！这里是你的校园生活服务平台',
          timestamp: Date.now() - 28800000,
          read: true
        },
        {
          _id: '5',
          type: 'chat',
          title: '私信消息',
          content: '美食探索家：那家麻辣烫确实不错！',
          timestamp: Date.now() - 43200000,
          read: false
        }
      ] as Message[]
    }

    saveMessages()
  }
}

function saveMessages() {
  uni.setStorageSync('messages', messages.value)
}

loadMessages()

onPullDownRefresh(async () => {
  await loadMessages()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
$black: #000000;
$white: #ffffff;
$red: #FF6B6B;
$teal: #4ECDC4;
$yellow: #FFE66D;

.page-container {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 160rpx;
  background: linear-gradient(180deg, #FFF9E6 0%, #ffffff 50%, #FFE6F0 100%);
  position: relative;
}

.page-doodle {
  &-1 {
    position: fixed;
    top: 140rpx;
    right: 40rpx;
    font-size: 44rpx;
    color: $teal;
    opacity: 0.3;
    animation: spin 10s linear infinite;
    z-index: 0;
  }

  &-2 {
    position: fixed;
    top: 380rpx;
    left: 40rpx;
    font-size: 38rpx;
    color: $yellow;
    opacity: 0.35;
    animation: pulse 2.5s ease-in-out infinite;
    z-index: 0;
  }
}

.page-header {
  text-align: center;
  padding: 32rpx 24rpx !important;
  margin-bottom: 24rpx !important;

  .page-title {
    display: block;
    font-size: 48rpx;
    font-weight: 900;
    color: $black;
    margin-bottom: 8rpx;
    letter-spacing: 2rpx;
  }

  .page-subtitle {
    display: block;
    font-size: 24rpx;
    color: #666;
  }
}

.filter-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 32rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;

  .filter-tab {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 20rpx;
    border: 3rpx solid $black;
    background: $white;
    box-shadow: 3rpx 3rpx 0 $black;
    white-space: nowrap;
    transition: all 0.2s ease;
    position: relative;

    .tab-emoji {
      font-size: 24rpx;
    }

    .tab-label {
      font-size: 24rpx;
      font-weight: 700;
    }

    .tab-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      min-width: 28rpx;
      height: 28rpx;
      padding: 0 6rpx;
      border-radius: 14rpx;
      background: $red;
      color: $white;
      font-size: 18rpx;
      font-weight: 900;
      text-align: center;
      line-height: 28rpx;
      box-shadow: 2rpx 2rpx 0 $black;
    }

    &.active {
      background: $teal;
      transform: translate(-1rpx, -1rpx);
      box-shadow: 4rpx 4rpx 0 $black;
    }

    &:active {
      transform: translate(2rpx, 2rpx);
      box-shadow: 1rpx 1rpx 0 $black;
    }
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.message-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx;
  border: 3rpx solid $black;
  background: $white;
  box-shadow: 4rpx 4rpx 0 $black;
  transition: all 0.2s ease;
  position: relative;

  &.unread {
    background: #FFF9E6;
  }

  &:active {
    transform: translate(2rpx, 2rpx);
    box-shadow: 2rpx 2rpx 0 $black;
  }

  .message-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    box-shadow: 3rpx 3rpx 0 $black;
    flex-shrink: 0;

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

    &-chat {
      background: #FFE0FF;
    }
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8rpx;
    gap: 12rpx;
  }

  .message-title {
    font-size: 28rpx;
    font-weight: 700;
    color: $black;
  }

  .message-time {
    font-size: 22rpx;
    color: #999;
    flex-shrink: 0;
  }

  .message-preview {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .order-info {
    display: flex;
    flex-wrap: wrap;
    gap: 4rpx;
    padding: 12rpx;
    background: #F5F5F5;
    border: 2rpx dashed #ccc;
    font-size: 22rpx;
    color: #666;
    line-height: 1.5;
  }

  .order-label {
    font-weight: 700;
  }

  .unread-dot {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: $red;
    box-shadow: 2rpx 2rpx 0 $black;
  }
}

.empty-state {
  padding: 80rpx 0;
}

.empty-card {
  text-align: center;
  padding: 64rpx 32rpx !important;

  .empty-icon {
    display: block;
    font-size: 96rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: $black;
    margin-bottom: 12rpx;
  }

  .empty-hint {
    display: block;
    font-size: 24rpx;
    color: #999;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
