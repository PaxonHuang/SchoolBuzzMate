<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>

    <!-- 返回导航 -->
    <view class="nav-back" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <view v-if="post" class="content-wrapper">
      <!-- 帖子详情卡片 -->
      <brutalist-card class="post-detail-card" taped>
        <!-- 帖子头部 -->
        <view class="post-header">
          <view class="author-avatar">
            <text>{{ post.creatorName?.charAt(0) || 'U' }}</text>
          </view>
          <view class="author-info">
            <text class="author-name">{{ post.creatorName }}</text>
            <text class="post-time">{{ formatTime(post.createTime) }}</text>
          </view>
          <view class="post-category">
            <text>{{ post.categoryName }}</text>
          </view>
        </view>

        <!-- 帖子标题 -->
        <text class="post-title">{{ post.title }}</text>

        <!-- 帖子内容 -->
        <text class="post-content">{{ post.content }}</text>

        <!-- 帖子图片 -->
        <view v-if="post.images && post.images.length > 0" class="post-images">
          <view
            v-for="(img, index) in post.images"
            :key="index"
            class="image-wrapper"
          >
            <image class="post-image" :src="img" mode="aspectFill" @click="previewImage(index)" />
          </view>
        </view>

        <!-- 帖子统计 -->
        <view class="post-stats">
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
      </brutalist-card>

      <!-- 评论区 -->
      <brutalist-card class="comments-card" dashed>
        <view class="comments-header">
          <text class="comments-title">💬 评论</text>
          <text class="comments-count">{{ comments.length }}条</text>
        </view>

        <!-- 评论输入 -->
        <view class="comment-input-wrapper">
          <input
            v-model="commentText"
            class="comment-input"
            placeholder="说点什么..."
          />
          <brutalist-button
            class="comment-btn"
            accent
            @click="submitComment"
          >
            发送
          </brutalist-button>
        </view>

        <!-- 评论列表 -->
        <view v-if="comments.length > 0" class="comment-list">
          <view
            v-for="comment in comments"
            :key="comment._id"
            class="comment-item"
          >
            <view class="comment-avatar">
              <text>{{ comment.userName?.charAt(0) || 'U' }}</text>
            </view>
            <view class="comment-content">
              <text class="comment-user">{{ comment.userName }}</text>
              <text class="comment-text">{{ comment.content }}</text>
              <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-comments">
          <text>暂无评论，快来抢沙发~</text>
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

interface Post {
  _id: string
  title: string
  content: string
  creatorName: string
  categoryName: string
  images: string[]
  viewCount: number
  commentCount: number
  likeCount: number
  createTime: number
}

interface Comment {
  _id: string
  userName: string
  content: string
  createTime: number
}

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const postId = ref('')

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

function goBack() {
  uni.navigateBack()
}

function previewImage(index: number) {
  if (post.value?.images) {
    uni.previewImage({
      urls: post.value.images,
      current: index
    })
  }
}

function submitComment() {
  if (!commentText.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }

  // 模拟添加评论
  const newComment: Comment = {
    _id: 'comment_' + Date.now(),
    userName: '我',
    content: commentText.value,
    createTime: Date.now()
  }

  comments.value.unshift(newComment)
  commentText.value = ''

  uni.showToast({
    title: '评论成功',
    icon: 'success'
  })
}

async function loadPost() {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  postId.value = options.id || ''

  if (!postId.value) {
    uni.showToast({
      title: '帖子不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  try {
    const db = uniCloud.database()
    const res = await db.collection('posts')
      .doc(postId.value)
      .get()

    if (res.data && res.data.length > 0) {
      post.value = res.data[0] as Post

      // 加载评论
      loadComments()
    } else {
      // 使用模拟数据
      post.value = {
        _id: postId.value,
        title: '图书馆约学习搭子',
        content: '明天下午2点，图书馆三楼，有没有一起复习高数的同学？可以一起讨论问题，互相监督！',
        creatorName: '学习达人',
        categoryName: '学习交流',
        images: [],
        viewCount: 128,
        commentCount: 15,
        likeCount: 32,
        createTime: Date.now() - 3600000
      }
    }
  } catch (e) {
    console.error('加载失败:', e)
    // 使用模拟数据
    post.value = {
      _id: postId.value,
      title: '图书馆约学习搭子',
      content: '明天下午2点，图书馆三楼，有没有一起复习高数的同学？可以一起讨论问题，互相监督！',
      creatorName: '学习达人',
      categoryName: '学习交流',
      images: [],
      viewCount: 128,
      commentCount: 15,
      likeCount: 32,
      createTime: Date.now() - 3600000
    }
  }
}

async function loadComments() {
  // 模拟评论数据
  comments.value = [
    {
      _id: '1',
      userName: '同学A',
      content: '我也在复习高数，一起吧！',
      createTime: Date.now() - 1800000
    },
    {
      _id: '2',
      userName: '同学B',
      content: '几点见面？',
      createTime: Date.now() - 900000
    }
  ]
}

onMounted(() => {
  loadPost()
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
  background: linear-gradient(180deg, #F0FFF4 0%, #ffffff 50%, #FFF9E6 100%);
  position: relative;
}

// 背景涂鸦
.page-doodle-1 {
  position: fixed;
  top: 100rpx;
  right: 30rpx;
  font-size: 40rpx;
  color: $yellow;
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

// 帖子详情卡片
.post-detail-card {
  padding: 32rpx 24rpx !important;
  margin-bottom: 24rpx !important;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;

  .author-avatar {
    width: 72rpx;
    height: 72rpx;
    border: 3rpx solid $black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $yellow, #FFEAA7);
    margin-right: 16rpx;
    box-shadow: 3rpx 3rpx 0 $black;

    text {
      font-size: 32rpx;
      font-weight: 900;
      color: $black;
    }
  }

  .author-info {
    flex: 1;

    .author-name {
      display: block;
      font-size: 28rpx;
      font-weight: 700;
      margin-bottom: 4rpx;
    }

    .post-time {
      font-size: 22rpx;
      color: #999;
    }
  }

  .post-category {
    padding: 6rpx 12rpx;
    border: 2rpx solid $black;
    background: $teal;
    font-size: 22rpx;
    font-weight: 700;
  }
}

.post-title {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
  color: $black;
  line-height: 1.4;
  margin-bottom: 20rpx;
}

.post-content {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  margin-bottom: 24rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;

  .image-wrapper {
    width: 220rpx;
    height: 220rpx;
    border: 3rpx solid $black;
    box-shadow: 3rpx 3rpx 0 $black;
    overflow: hidden;
  }

  .post-image {
    width: 100%;
    height: 100%;
  }
}

.post-stats {
  display: flex;
  gap: 32rpx;
  padding-top: 20rpx;
  border-top: 2rpx dashed #ddd;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    color: #666;
    font-weight: 600;

    text:first-child {
      font-size: 26rpx;
    }
  }
}

// 评论区
.comments-card {
  padding: 24rpx !important;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .comments-title {
    font-size: 28rpx;
    font-weight: 900;
  }

  .comments-count {
    font-size: 24rpx;
    color: #999;
  }
}

.comment-input-wrapper {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;

  .comment-input {
    flex: 1;
    padding: 16rpx;
    border: 3rpx solid $black;
    background: $white;
    font-size: 26rpx;
  }

  .comment-btn {
    padding: 12rpx 24rpx !important;
  }
}

.comment-list {
  .comment-item {
    display: flex;
    gap: 12rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-avatar {
    width: 56rpx;
    height: 56rpx;
    border: 2rpx solid $black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
    flex-shrink: 0;

    text {
      font-size: 24rpx;
      font-weight: 700;
      color: $black;
    }
  }

  .comment-content {
    flex: 1;

    .comment-user {
      display: block;
      font-size: 24rpx;
      font-weight: 700;
      color: $black;
      margin-bottom: 6rpx;
    }

    .comment-text {
      display: block;
      font-size: 26rpx;
      color: #333;
      line-height: 1.5;
      margin-bottom: 8rpx;
    }

    .comment-time {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.empty-comments {
  text-align: center;
  padding: 48rpx 0;
  color: #999;
  font-size: 26rpx;
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
