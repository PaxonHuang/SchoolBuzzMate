<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>

    <!-- 返回导航 -->
    <view class="nav-back" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <view v-if="request" class="content-wrapper">
      <!-- 请求详情卡片 -->
      <brutalist-card class="detail-card" taped>
        <!-- 状态栏 -->
        <view class="status-bar" :class="'status-' + request.status">
          <text>{{ getStatusIcon(request.status) }}</text>
          <text>{{ getStatusText(request.status) }}</text>
        </view>

        <!-- 标题 -->
        <text class="detail-title">{{ request.title }}</text>

        <!-- 描述 -->
        <text class="detail-desc">{{ request.description }}</text>

        <!-- 标签 -->
        <view class="detail-tags">
          <view
            v-for="tag in request.tags"
            :key="tag"
            class="tag-badge"
          >
            <text>{{ getTagEmoji(tag) }}</text>
            <text>{{ tag }}</text>
          </view>
        </view>

        <!-- 信息栏 -->
        <view class="info-bar">
          <view class="info-item">
            <text>👤</text>
            <text>{{ request.creatorName || '校园用户' }}</text>
          </view>
          <view class="info-item">
            <text>⏰</text>
            <text>{{ formatTime(request.createTime) }}</text>
          </view>
          <view class="info-item">
            <text>👥</text>
            <text>{{ request.maxParticipants || '不限' }}人</text>
          </view>
        </view>
      </brutalist-card>

      <!-- 操作卡片 -->
      <brutalist-card v-if="request.status === 'open'" class="action-card">
        <brutalist-button
          class="join-btn"
          accent
          taped
          arrow
          large
          @click="joinRequest"
        >
          我要参加
        </brutalist-button>
        <brutalist-button
          class="contact-btn"
          outline
          @click="contactCreator"
        >
          联系TA
        </brutalist-button>
      </brutalist-card>

      <brutalist-card v-else class="action-card">
        <view class="closed-notice">
          <text>📌 该需求已{{ getStatusText(request.status) }}</text>
        </view>
      </brutalist-card>
    </view>

    <!-- 加载中 -->
    <view v-else class="loading">
      <brutalist-card class="loading-card" dashed>
        <text class="loading-text">加载中...</text>
      </brutalist-card>
    </view>
  </view>
</template>

<script setup lang="uts">
import { ref, onMounted } from 'vue'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import BrutalistButton from '@/components/brutalist/BrutalistButton.vue'

interface Request {
  _id: string
  title: string
  description: string
  tags: string[]
  status: string
  createTime: number
  maxParticipants?: number
  creatorName?: string
}

const request = ref<Request | null>(null)
const requestId = ref('')

function getTagEmoji(tag: string): string {
  const emojiMap: Record<string, string> = {
    '学习': '📚',
    '运动': '🏃',
    '旅游': '✈️',
    '饭搭子': '🍜',
    '图书馆': '📖',
    '篮球': '🏀',
    '足球': '⚽',
    '羽毛球': '🏸',
    '自习': '✍️',
    '考试': '📝'
  }
  return emojiMap[tag] || '🏷️'
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'open': '招募中',
    'filled': '已满员',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    'open': '🔥',
    'filled': '✅',
    'completed': '🎉'
  }
  return iconMap[status] || '📌'
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
  } else {
    return Math.floor(diff / 86400000) + '天前'
  }
}

function goBack() {
  uni.navigateBack()
}

function joinRequest() {
  uni.showToast({
    title: '报名成功！',
    icon: 'success'
  })
}

function contactCreator() {
  uni.showToast({
    title: '请联系发起人',
    icon: 'none'
  })
}

async function loadRequest() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  requestId.value = options.id || ''

  if (!requestId.value) {
    uni.showToast({
      title: '需求不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 使用模拟数据
  request.value = {
    _id: requestId.value,
    title: '图书馆约自习',
    description: '明天下午2点，图书馆三楼自习区，有没有一起复习高数的同学？可以一起讨论问题，互相监督！',
    tags: ['学习', '图书馆', '自习'],
    status: 'open',
    createTime: Date.now() - 3600000,
    maxParticipants: 4,
    creatorName: '学习达人'
  }
}

onMounted(() => {
  loadRequest()
})
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
  padding-bottom: 48rpx;
  background: linear-gradient(180deg, #FFE6F0 0%, #ffffff 50%, #E6F9FF 100%);
  position: relative;
}

// 背景涂鸦
.page-doodle-1 {
  position: fixed;
  top: 100rpx;
  right: 30rpx;
  font-size: 40rpx;
  color: $teal;
  opacity: 0.3;
  animation: spin 10s linear infinite;
  z-index: 0;
}

// 返回导航
.nav-back {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 12rpx 0;

  .back-icon {
    font-size: 36rpx;
    font-weight: 900;
    margin-right: 8rpx;
  }

  .back-text {
    font-size: 26rpx;
    font-weight: 700;
  }
}

// 详情卡片
.detail-card {
  padding: 32rpx 24rpx !important;
  margin-bottom: 24rpx !important;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border: 3rpx solid $black;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 3rpx 3rpx 0 $black;

  &.status-open {
    background: $yellow;
  }

  &.status-filled {
    background: #FFE0E0;
  }

  &.status-completed {
    background: #E0FFE0;
  }
}

.detail-title {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: $black;
  line-height: 1.4;
  margin-bottom: 20rpx;
}

.detail-desc {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  margin-bottom: 24rpx;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tag-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border: 2rpx solid $black;
  background: #F5F5F5;
  font-size: 24rpx;
  font-weight: 600;

  text:first-child {
    font-size: 22rpx;
  }
}

.info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx dashed #ddd;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #666;
  font-weight: 600;

  text:first-child {
    font-size: 22rpx;
  }
}

// 操作卡片
.action-card {
  padding: 24rpx !important;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.join-btn {
  width: 100%;
}

.contact-btn {
  width: 100%;
}

.closed-notice {
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #999;
}

// 加载中
.loading {
  padding: 64rpx 0;

  .loading-card {
    text-align: center;
    padding: 48rpx 32rpx !important;

    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

// 动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
