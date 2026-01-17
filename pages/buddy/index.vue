<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>
    <view class="page-doodle-2">◉</view>

    <!-- 页面标题卡片 -->
    <brutalist-card class="page-header" taped accent>
      <text class="page-title">找搭子</text>
      <text class="page-subtitle">发现有趣的校园伙伴</text>
    </brutalist-card>

    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <brutalist-button class="create-btn" accent taped arrow @click="navigateToCreate">
        + 发布需求
      </brutalist-button>
    </view>

    <!-- 筛选区域 -->
    <brutalist-card class="filter-section" dashed>
      <view class="filter-header">
        <text class="filter-icon">🏷️</text>
        <text class="section-title">筛选标签</text>
      </view>
      <view class="tag-filter">
        <view
          v-for="tag in allTags"
          :key="tag"
          class="filter-tag"
          :class="{ 'active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          <text class="tag-emoji">{{ getTagEmoji(tag) }}</text>
          <text class="tag-label">{{ tag }}</text>
        </view>
      </view>
    </brutalist-card>

    <!-- 请求列表 -->
    <view class="request-list">
      <view
        v-for="request in filteredRequests"
        :key="request._id"
        class="request-card-wrapper"
        @click="viewDetail(request)"
      >
        <brutalist-card class="request-card">
          <view class="request-header">
            <text class="request-title">{{ request.title }}</text>
            <view class="request-status" :class="'status-' + request.status">
              <text>{{ getStatusIcon(request.status) }}</text>
              <text>{{ getStatusText(request.status) }}</text>
            </view>
          </view>

          <text class="request-desc">{{ request.description }}</text>

          <view class="request-tags">
            <view
              v-for="tag in request.tags"
              :key="tag"
              class="tag-badge"
            >
              <text>{{ getTagEmoji(tag) }}</text>
              <text>{{ tag }}</text>
            </view>
          </view>

          <view class="request-footer">
            <view class="request-time">
              <text>⏰</text>
              <text>{{ formatTime(request.createTime) }}</text>
            </view>
            <view class="participants">
              <text>👥</text>
              <text>{{ request.maxParticipants || '不限' }}人</text>
            </view>
          </view>
        </brutalist-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredRequests.length === 0" class="empty-state">
      <brutalist-card class="empty-card" dashed>
        <text class="empty-icon">🔍</text>
        <text class="empty-text">暂无相关需求</text>
        <text class="empty-hint">换个标签试试吧！</text>
      </brutalist-card>
    </view>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="uts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import BrutalistButton from '@/components/brutalist/BrutalistButton.vue'
import TabBar from '@/components/brutalist/TabBar.vue'

// 定义请求接口
interface Request {
  _id: string
  title: string
  description: string
  tags: string[]
  status: string
  createTime: number
  maxParticipants?: number
  creator: string
}

const userStore = useUserStore()

const requests = ref<Request[]>([])
const selectedTags = ref<string[]>([])

// 可选标签（带emoji映射）
const allTags = [
  '学习', '运动', '旅游', '饭搭子', '图书馆',
  '篮球', '足球', '羽毛球', '自习', '考试'
]

// 获取标签emoji
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

// 筛选后的请求
const filteredRequests = computed(() => {
  if (selectedTags.value.length === 0) {
    return requests.value
  }

  return requests.value.filter(request => {
    return selectedTags.value.some(tag => request.tags.includes(tag))
  })
})

// 切换标签选择
function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'open': '招募中',
    'filled': '已满员',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

// 获取状态图标
function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    'open': '🔥',
    'filled': '✅',
    'completed': '🎉'
  }
  return iconMap[status] || '📌'
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

// 导航到创建页面
function navigateToCreate() {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: '/pages/buddy/create'
  })
}

// 查看详情
function viewDetail(request: Request) {
  uni.navigateTo({
    url: `/pages/buddy/detail?id=${request._id}`
  })
}

// 加载数据
async function loadRequests() {
  try {
    const db = uniCloud.database()
    const res = await db.collection('requests')
      .where({
        type: 'buddy',
        status: 'open'
      })
      .orderBy('createTime', 'desc')
      .get()

    requests.value = res.data as Request[]
  } catch (e) {
    console.error('加载失败:', e)
    // 使用模拟数据
    requests.value = [
      {
        _id: '1',
        title: '图书馆约自习',
        description: '明天下午2点，图书馆三楼自习区，有没有一起复习高数的同学？',
        tags: ['学习', '图书馆', '自习'],
        status: 'open',
        createTime: Date.now() - 3600000,
        maxParticipants: 4,
        creator: 'user1'
      },
      {
        _id: '2',
        title: '篮球3v3缺人',
        description: '今晚6点体育馆，还差一个人，会打的来！',
        tags: ['运动', '篮球'],
        status: 'open',
        createTime: Date.now() - 7200000,
        maxParticipants: 6,
        creator: 'user2'
      }
    ] as Request[]
  }
}

onMounted(() => {
  loadRequests()
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
  padding-bottom: 160rpx;
  background: linear-gradient(180deg, #FFE6F0 0%, #ffffff 50%, #E6F9FF 100%);
  position: relative;
}

// 页面背景涂鸦
.page-doodle {
  &-1 {
    position: fixed;
    top: 120rpx;
    right: 40rpx;
    font-size: 44rpx;
    color: $yellow;
    opacity: 0.35;
    animation: spin 10s linear infinite;
    z-index: 0;
  }

  &-2 {
    position: fixed;
    top: 350rpx;
    left: 30rpx;
    font-size: 38rpx;
    color: $red;
    opacity: 0.3;
    animation: pulse 2.5s ease-in-out infinite;
    z-index: 0;
  }
}

// 页面标题卡片
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

// 顶部操作栏
.header-actions {
  margin-bottom: 24rpx;

  .create-btn {
    width: 100%;
  }
}

// 筛选区域
.filter-section {
  margin-bottom: 32rpx !important;

  .filter-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
  }

  .filter-icon {
    font-size: 28rpx;
  }

  .section-title {
    font-size: 26rpx;
    font-weight: 900;
    color: $black;
  }

  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx 14rpx;
    border: 3rpx solid $black;
    background: $white;
    box-shadow: 3rpx 3rpx 0 $black;
    transition: all 0.2s ease;

    .tag-emoji {
      font-size: 20rpx;
    }

    .tag-label {
      font-size: 22rpx;
      font-weight: 700;
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

// 请求列表
.request-list {
  .request-card-wrapper {
    margin-bottom: 24rpx;
  }

  .request-card {
    padding: 24rpx !important;
    margin: 0 !important;
    cursor: pointer;
  }

  .request-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
    gap: 12rpx;

    .request-title {
      font-size: 32rpx;
      font-weight: 900;
      color: $black;
      flex: 1;
      line-height: 1.3;
    }

    .request-status {
      display: flex;
      align-items: center;
      gap: 4rpx;
      padding: 6rpx 12rpx;
      border: 2rpx solid $black;
      background: $white;
      font-size: 22rpx;
      font-weight: 700;
      box-shadow: 2rpx 2rpx 0 $black;
      white-space: nowrap;

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
  }

  .request-desc {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
    line-height: 1.5;
  }

  .request-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 16rpx;
  }

  .tag-badge {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 6rpx 12rpx;
    border: 2rpx solid $black;
    background: #F5F5F5;
    font-size: 22rpx;
    font-weight: 600;

    text:first-child {
      font-size: 20rpx;
    }
  }

  .request-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 16rpx;
    border-top: 2rpx dashed #ddd;
  }

  .request-time,
  .participants {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 22rpx;
    color: #666;
    font-weight: 600;

    text:first-child {
      font-size: 24rpx;
    }
  }
}

// 空状态
.empty-state {
  padding: 64rpx 0;
}

.empty-card {
  text-align: center;
  padding: 48rpx 32rpx !important;

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

// 动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
