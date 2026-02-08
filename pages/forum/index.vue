<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>
    <view class="page-doodle-2">◉</view>

    <!-- 页面标题卡片 -->
    <brutalist-card class="page-header" taped accent>
      <text class="page-title">校园论坛</text>
      <text class="page-subtitle">分享你的校园生活</text>
    </brutalist-card>

    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <brutalist-button class="create-btn" accent taped arrow @click="navigateToCreate">
        + 发布帖子
      </brutalist-button>
    </view>

    <!-- 分类筛选标签 -->
    <view class="category-tabs">
      <view
        v-for="category in categories"
        :key="category.value"
        class="category-tag"
        :class="{ 'active': currentCategory === category.value }"
        @click="changeCategory(category.value)"
      >
        <text class="tag-emoji">{{ category.emoji }}</text>
        <text class="tag-label">{{ category.label }}</text>
      </view>
    </view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <view
        v-for="post in filteredPosts"
        :key="post._id"
        class="post-card-wrapper"
        @click="viewDetail(post)"
      >
        <brutalist-card class="post-card" :class="{ 'taped': post.pinned }">
          <!-- 帖子头部 -->
          <view class="post-header">
            <view class="avatar-wrapper">
              <text class="avatar-text">{{ post.creatorName?.charAt(0) || 'U' }}</text>
            </view>
            <view class="user-info">
              <text class="username">{{ post.creatorName }}</text>
              <text class="time">{{ formatTime(post.createTime) }}</text>
            </view>
            <view v-if="post.pinned" class="pinned-badge">
              <text>📌</text>
            </view>
          </view>

          <!-- 帖子标题 -->
          <text class="post-title">{{ post.title }}</text>

          <!-- 帖子内容 -->
          <text class="post-content">{{ post.content }}</text>

          <!-- 帖子图片 -->
          <view v-if="post.images?.length > 0" class="post-images">
            <view
              v-for="(img, index) in (post.images || []).slice(0, 3)"
              :key="index"
              class="image-wrapper"
            >
              <image class="post-image" :src="img" mode="aspectFill" />
            </view>
            <view v-if="(post.images?.length || 0) > 3" class="more-images">
              <text>+{{ (post.images?.length || 0) - 3 }}</text>
            </view>
          </view>

          <!-- 帖子底部信息 -->
          <view class="post-footer">
            <view class="stats">
              <view class="stat-item">
                <text>👁</text>
                <text>{{ post.viewCount || 0 }}</text>
              </view>
              <view class="stat-item">
                <text>💬</text>
                <text>{{ post.commentCount || 0 }}</text>
              </view>
              <view class="stat-item">
                <text>👍</text>
                <text>{{ post.likeCount || 0 }}</text>
              </view>
            </view>
            <view class="category-badge">
              <text>{{ post.categoryName }}</text>
            </view>
          </view>
        </brutalist-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredPosts.length === 0" class="empty-state">
      <brutalist-card class="empty-card" dashed>
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无相关帖子</text>
        <text class="empty-hint">快来发布第一条帖子吧！</text>
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

interface Post {
  _id: string
  title: string
  content: string
  creatorName: string
  creatorAvatar: string
  categoryName: string
  category: string
  images: string[]
  viewCount: number
  commentCount: number
  likeCount: number
  createTime: number
  pinned?: boolean
}

const userStore = useUserStore()
const posts = ref<Post[]>([])
const currentCategory = ref<string>('all')

// 分类选项（带emoji）
const categories = [
  { label: '全部', value: 'all', emoji: '📰' },
  { label: '学习', value: 'study', emoji: '📚' },
  { label: '生活', value: 'life', emoji: '🌟' },
  { label: '失物', value: 'lost', emoji: '🔍' },
  { label: '交易', value: 'trade', emoji: '💰' },
  { label: '活动', value: 'event', emoji: '🎉' }
]

// 筛选后的帖子
const filteredPosts = computed(() => {
  if (currentCategory.value === 'all') {
    return posts.value
  }
  return posts.value.filter(post => post.category === currentCategory.value)
})

// 切换分类
function changeCategory(category: string) {
  currentCategory.value = category
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
    url: '/pages/forum/create'
  })
}

// 查看详情
function viewDetail(post: Post) {
  uni.navigateTo({
    url: `/pages/forum/detail?id=${post._id}`
  })
}

// 加载数据
async function loadPosts() {
  try {
    const db = uniCloud.database()
    const res = await db.collection('posts')
      .orderBy('createTime desc', 'desc')
      .limit(20)
      .get()

    const data = res.data as Post[]
    posts.value = data.map(item => ({
      ...item,
      createTime: item.createTime || Date.now()
    }))
  } catch (e) {
    console.error('加载失败:', e)
    const localData = uni.getStorageSync('mock_posts') || []
    posts.value = localData.map((item: any) => ({
      ...item,
      createTime: item.createTime || Date.now()
    }))

    if (posts.value.length === 0) {
      posts.value = [
        {
          _id: '1',
          title: '图书馆约学习搭子',
          content: '明天下午2点，图书馆三楼，有没有一起复习高数的同学？',
          creatorName: '学习达人',
          creatorAvatar: '',
          categoryName: '学习交流',
          category: 'study',
          images: [],
          viewCount: 128,
          commentCount: 15,
          likeCount: 32,
          createTime: Date.now() - 3600000,
          pinned: true
        },
        {
          _id: '2',
          title: '食堂二楼新开的麻辣烫好评！',
          content: '今天试了二楼新开的麻辣烫，味道很不错，推荐大家去试试~',
          creatorName: '美食探索家',
          creatorAvatar: '',
          categoryName: '校园生活',
          category: 'life',
          images: [],
          viewCount: 256,
          commentCount: 42,
          likeCount: 88,
          createTime: Date.now() - 7200000
        }
      ] as Post[]
    }
  }
}

onMounted(() => {
  loadPosts()
})

// 页面显示时刷新列表（从创建页面返回时触发）
onShow(() => {
  loadPosts()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await loadPosts()
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
  background: linear-gradient(180deg, #F0FFF4 0%, #ffffff 50%, #FFF9E6 100%);
  position: relative;
}

// 页面背景涂鸦
.page-doodle {
  &-1 {
    position: fixed;
    top: 150rpx;
    right: 30rpx;
    font-size: 40rpx;
    color: $yellow;
    opacity: 0.35;
    animation: spin 10s linear infinite;
    z-index: 0;
  }

  &-2 {
    position: fixed;
    top: 400rpx;
    left: 40rpx;
    font-size: 36rpx;
    color: $teal;
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

// 分类标签
.category-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 32rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;

  .category-tag {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 10rpx 16rpx;
    border: 3rpx solid $black;
    background: $white;
    box-shadow: 3rpx 3rpx 0 $black;
    white-space: nowrap;
    transition: all 0.2s ease;

    .tag-emoji {
      font-size: 24rpx;
    }

    .tag-label {
      font-size: 24rpx;
      font-weight: 700;
    }

    &.active {
      background: $teal;
      box-shadow: 3rpx 3rpx 0 $black;
      transform: translate(-1rpx, -1rpx);
    }

    &:active {
      transform: translate(2rpx, 2rpx);
      box-shadow: 1rpx 1rpx 0 $black;
    }
  }
}

// 帖子列表
.post-list {
  .post-card-wrapper {
    margin-bottom: 24rpx;
  }

  .post-card {
    padding: 24rpx !important;
    margin: 0 !important;
    cursor: pointer;

    &.taped {
      border-color: $teal;
    }
  }

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .avatar-wrapper {
      width: 64rpx;
      height: 64rpx;
      border: 3rpx solid $black;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, $yellow, #FFEAA7);
      margin-right: 16rpx;
      box-shadow: 3rpx 3rpx 0 $black;
    }

    .avatar-text {
      font-size: 28rpx;
      font-weight: 900;
      color: $black;
    }

    .user-info {
      flex: 1;

      .username {
        display: block;
        font-size: 26rpx;
        font-weight: 700;
        margin-bottom: 4rpx;
      }

      .time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .pinned-badge {
      font-size: 28rpx;
    }
  }

  .post-title {
    display: block;
    font-size: 32rpx;
    font-weight: 900;
    margin-bottom: 12rpx;
    color: $black;
    line-height: 1.4;
  }

  .post-content {
    display: block;
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .post-images {
    display: flex;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .image-wrapper {
      position: relative;
      width: 180rpx;
      height: 180rpx;
      border: 3rpx solid $black;
      box-shadow: 3rpx 3rpx 0 $black;
      overflow: hidden;
    }

    .post-image {
      width: 100%;
      height: 100%;
    }

    .more-images {
      position: absolute;
      bottom: 0;
      right: 0;
      padding: 4rpx 8rpx;
      background: rgba(0, 0, 0, 0.7);
      color: $white;
      font-size: 20rpx;
      font-weight: 700;
    }
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 2rpx dashed #ddd;

    .stats {
      display: flex;
      gap: 24rpx;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4rpx;
        font-size: 22rpx;
        color: #666;
        font-weight: 600;

        text:first-child {
          font-size: 24rpx;
        }
      }
    }

    .category-badge {
      padding: 6rpx 12rpx;
      border: 2rpx solid $black;
      background: $yellow;
      font-size: 22rpx;
      font-weight: 700;
      box-shadow: 2rpx 2rpx 0 $black;
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
