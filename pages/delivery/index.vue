<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>
    <view class="page-doodle-2">◉</view>

    <!-- 页面标题卡片 -->
    <brutalist-card class="page-header" taped accent>
      <text class="page-title">校园跑腿</text>
      <text class="page-subtitle">互助便利，轻松搞定</text>
    </brutalist-card>

    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <brutalist-button class="create-btn" accent taped arrow @click="navigateToCreate">
        + 发布需求
      </brutalist-button>
    </view>

    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view
        v-for="status in statusTabs"
        :key="status.value"
        class="status-tab"
        :class="{ 'active': currentStatus === status.value }"
        @click="changeStatus(status.value)"
      >
        <text class="tab-emoji">{{ status.emoji }}</text>
        <text class="tab-label">{{ status.label }}</text>
      </view>
    </view>

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
            <view v-if="request.amount" class="amount">
              <text>💰</text>
              <text>¥{{ request.amount }}</text>
            </view>
          </view>
        </brutalist-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredRequests.length === 0" class="empty-state">
      <brutalist-card class="empty-card" dashed>
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无相关需求</text>
        <text class="empty-hint">发布一个跑腿任务吧！</text>
      </brutalist-card>
    </view>

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

// 定义请求接口
interface DeliveryRequest {
  _id: string
  title: string
  description: string
  tags: string[]
  status: string
  createTime: number
  amount?: number
  creator: string
}

const userStore = useUserStore()

const requests = ref<DeliveryRequest[]>([])
const currentStatus = ref<string>('all')

// 状态标签页（带emoji）
const statusTabs = [
  { label: '全部', value: 'all', emoji: '📋' },
  { label: '待接单', value: 'open', emoji: '🔥' },
  { label: '进行中', value: 'in_progress', emoji: '⏳' },
  { label: '已完成', value: 'completed', emoji: '✅' }
]

// 获取标签emoji
function getTagEmoji(tag: string): string {
  const emojiMap: Record<string, string> = {
    '取快递': '📦',
    '买饭': '🍜',
    '打印': '📄',
    '代购': '🛒',
    '送东西': '🚚',
    '其他': '📌'
  }
  return emojiMap[tag] || '🏷️'
}

// 筛选后的请求
const filteredRequests = computed(() => {
  if (currentStatus.value === 'all') {
    return requests.value
  }
  return requests.value.filter(request => request.status === currentStatus.value)
})

// 切换状态
function changeStatus(status: string) {
  currentStatus.value = status
}

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'open': '待接单',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 获取状态图标
function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    'open': '🔥',
    'in_progress': '⏳',
    'completed': '✅',
    'cancelled': '❌'
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
    url: '/pages/delivery/create'
  })
}

// 查看详情
function viewDetail(request: DeliveryRequest) {
  uni.navigateTo({
    url: `/pages/delivery/detail?id=${request._id}`
  })
}

// 加载数据
async function loadRequests() {
  try {
    const db = uniCloud.database()
    const res = await db.collection('requests')
      .where({
        type: 'delivery'
      })
      .orderBy('createTime desc', 'desc')
      .get()

    const data = res.data as DeliveryRequest[]
    requests.value = data.map(item => ({
      ...item,
      createTime: item.createTime || Date.now()
    }))
  } catch (e) {
    console.error('加载失败:', e)
    const localData = uni.getStorageSync('mock_requests') || []
    requests.value = localData.map((item: any) => ({
      ...item,
      createTime: item.createTime || Date.now()
    }))

    if (requests.value.length === 0) {
      requests.value = [
        {
          _id: '1',
          title: '帮忙取个快递',
          description: '菜鸟驿站有个中件快递，帮忙取到南区宿舍楼下，感激不尽！',
          tags: ['取快递'],
          status: 'open',
          createTime: Date.now() - 1800000,
          amount: 5,
          creator: 'user1'
        },
        {
          _id: '2',
          title: '二食堂买份黄焖鸡',
          description: '二食堂黄焖鸡米饭，要微辣，送到图书馆门口。',
          tags: ['买饭'],
          status: 'open',
          createTime: Date.now() - 5400000,
          amount: 8,
          creator: 'user2'
        }
      ] as DeliveryRequest[]
    }
  }
}

onMounted(() => {
  loadRequests()
})

// 页面显示时刷新列表（从创建页面返回时触发）
onShow(() => {
  loadRequests()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await loadRequests()
  // 停止下拉刷新动画
  uni.stopPullDownRefresh()
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
  background: linear-gradient(180deg, #FFF9E6 0%, #ffffff 50%, #FFE6F0 100%);
  position: relative;
}

// 页面背景涂鸦
.page-doodle {
  &-1 {
    position: fixed;
    top: 140rpx;
    right: 35rpx;
    font-size: 42rpx;
    color: $teal;
    opacity: 0.3;
    animation: spin 11s linear infinite;
    z-index: 0;
  }

  &-2 {
    position: fixed;
    top: 380rpx;
    left: 35rpx;
    font-size: 38rpx;
    color: $yellow;
    opacity: 0.35;
    animation: pulse 2.3s ease-in-out infinite;
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

// 状态标签
.status-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 32rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;

  .status-tab {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 10rpx 18rpx;
    border: 3rpx solid $black;
    background: $white;
    box-shadow: 3rpx 3rpx 0 $black;
    white-space: nowrap;
    transition: all 0.2s ease;

    .tab-emoji {
      font-size: 22rpx;
    }

    .tab-label {
      font-size: 24rpx;
      font-weight: 700;
    }

    &.active {
      background: $red;
      color: $white;
      box-shadow: 3rpx 3rpx 0 $black;
      transform: translate(-1rpx, -1rpx);
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

      &.status-in_progress {
        background: $teal;
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
    align-items: center;
    padding-top: 16rpx;
    border-top: 2rpx dashed #ddd;
  }

  .request-time {
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

  .amount {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 32rpx;
    font-weight: 900;
    color: $red;

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
