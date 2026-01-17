<template>
  <view class="page-container">
    <!-- 页面背景装饰 -->
    <view class="page-doodle-1">✦</view>

    <!-- 返回导航 -->
    <view class="nav-back" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <!-- 标题卡片 -->
    <brutalist-card class="header-card" taped accent>
      <text class="header-title">发布新帖</text>
      <text class="header-subtitle">分享你的校园生活</text>
    </brutalist-card>

    <!-- 表单卡片 -->
    <brutalist-card class="form-card">
      <!-- 标题输入 -->
      <view class="form-group">
        <text class="form-label">
          <text>📝</text>
          <text>帖子标题</text>
          <text class="required">*</text>
        </text>
        <brutalist-input
          v-model="formData.title"
          placeholder="请输入标题（5-50字）"
          :maxlength="50"
          show-count
          taped
        />
      </view>

      <!-- 分类选择 -->
      <view class="form-group">
        <text class="form-label">
          <text>🏷️</text>
          <text>选择分类</text>
          <text class="required">*</text>
        </text>
        <view class="category-grid">
          <view
            v-for="cat in categories"
            :key="cat.value"
            class="category-item"
            :class="{ 'active': formData.category === cat.value }"
            @click="selectCategory(cat.value)"
          >
            <text class="cat-emoji">{{ cat.emoji }}</text>
            <text class="cat-label">{{ cat.label }}</text>
          </view>
        </view>
      </view>

      <!-- 内容输入 -->
      <view class="form-group">
        <text class="form-label">
          <text>✍️</text>
          <text>帖子内容</text>
          <text class="required">*</text>
        </text>
        <view class="textarea-wrapper">
          <textarea
            v-model="formData.content"
            class="form-textarea"
            placeholder="分享你的想法、经验或问题..."
            :maxlength="500"
          />
          <text class="char-count">{{ formData.content.length }}/500</text>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="form-group">
        <text class="form-label">
          <text>📷</text>
          <text>添加图片</text>
          <text class="optional">（选填）</text>
        </text>
        <view class="image-upload">
          <view
            v-for="(img, index) in formData.images"
            :key="index"
            class="image-item"
          >
            <image class="upload-image" :src="img" mode="aspectFill" />
            <text class="image-remove" @click="removeImage(index)">×</text>
          </view>
          <view v-if="formData.images.length < 9" class="image-add" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <brutalist-button
        class="submit-btn"
        accent
        taped
        arrow
        large
        @click="submitPost"
      >
        发布帖子
      </brutalist-button>
    </brutalist-card>

    <!-- 提示 -->
    <view class="tips">
      <text class="tips-text">📌 请遵守社区规范，文明发言</text>
    </view>
  </view>
</template>

<script setup lang="uts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import BrutalistButton from '@/components/brutalist/BrutalistButton.vue'
import BrutalistInput from '@/components/brutalist/BrutalistInput.vue'

interface FormData {
  title: string
  content: string
  category: string
  images: string[]
}

interface Category {
  label: string
  value: string
  emoji: string
}

const userStore = useUserStore()
const formData = ref<FormData>({
  title: '',
  content: '',
  category: 'study',
  images: []
})

const categories: Category[] = [
  { label: '学习交流', value: 'study', emoji: '📚' },
  { label: '校园生活', value: 'life', emoji: '🌟' },
  { label: '失物招领', value: 'lost', emoji: '🔍' },
  { label: '二手交易', value: 'trade', emoji: '💰' },
  { label: '活动聚会', value: 'event', emoji: '🎉' }
]

function selectCategory(value: string) {
  formData.value.category = value
}

function chooseImage() {
  uni.chooseImage({
    count: 9 - formData.value.images.length,
    success: (res: any) => {
      formData.value.images.push(...res.tempFilePaths)
    }
  })
}

function removeImage(index: number) {
  formData.value.images.splice(index, 1)
}

function goBack() {
  uni.navigateBack()
}

async function submitPost() {
  // 检查登录
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  // 验证标题
  if (!formData.value.title.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none'
    })
    return
  }

  if (formData.value.title.trim().length < 5) {
    uni.showToast({
      title: '标题至少5个字',
      icon: 'none'
    })
    return
  }

  // 验证内容
  if (!formData.value.content.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
    return
  }

  if (formData.value.content.trim().length < 10) {
    uni.showToast({
      title: '内容至少10个字',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '发布中...' })

  try {
    const db = uniCloud.database()

    // 获取分类名称
    const category = categories.find(c => c.value === formData.value.category)
    const categoryName = category?.label || '学习交流'

    await db.collection('posts').add({
      type: 'post',
      title: formData.value.title,
      content: formData.value.content,
      category: formData.value.category,
      categoryName: categoryName,
      images: formData.value.images,
      creatorName: userStore.user?.nickname || '校园用户',
      creatorAvatar: userStore.user?.avatar || '',
      createTime: Date.now(),
      viewCount: 0,
      commentCount: 0,
      likeCount: 0,
      status: 'published'
    })

    uni.hideLoading()
    uni.showToast({
      title: '发布成功！',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.hideLoading()
    console.error('发布失败:', e)

    // 降级处理：使用本地存储模拟
    const mockPost = {
      _id: 'post_' + Date.now(),
      title: formData.value.title,
      content: formData.value.content,
      category: formData.value.category,
      categoryName: categories.find(c => c.value === formData.value.category)?.label || '学习交流',
      images: formData.value.images,
      creatorName: userStore.user?.nickname || '校园用户',
      creatorAvatar: '',
      createTime: Date.now(),
      viewCount: 0,
      commentCount: 0,
      likeCount: 0
    }

    // 保存到本地
    const posts = uni.getStorageSync('mock_posts') || []
    posts.unshift(mockPost)
    uni.setStorageSync('mock_posts', posts)

    uni.showToast({
      title: '发布成功（本地）',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
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

// 标题卡片
.header-card {
  text-align: center;
  padding: 32rpx 24rpx !important;
  margin-bottom: 24rpx !important;

  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: 900;
    color: $black;
    margin-bottom: 8rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 24rpx;
    color: #666;
  }
}

// 表单卡片
.form-card {
  padding: 32rpx 24rpx !important;
}

.form-group {
  margin-bottom: 32rpx;

  .form-label {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 12rpx;
    font-size: 26rpx;
    font-weight: 900;

    text:first-child {
      font-size: 28rpx;
    }

    .required {
      color: $red;
    }

    .optional {
      font-size: 22rpx;
      color: #999;
      font-weight: 400;
    }
  }
}

// 分类网格
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border: 3rpx solid $black;
  background: $white;
  box-shadow: 3rpx 3rpx 0 $black;
  transition: all 0.2s ease;

  .cat-emoji {
    font-size: 32rpx;
    margin-bottom: 6rpx;
  }

  .cat-label {
    font-size: 20rpx;
    font-weight: 700;
  }

  &.active {
    background: $teal;
    transform: translate(-2rpx, -2rpx);
    box-shadow: 5rpx 5rpx 0 $black;
  }

  &:active {
    transform: translate(2rpx, 2rpx);
    box-shadow: 1rpx 1rpx 0 $black;
  }
}

// 文本域
.textarea-wrapper {
  position: relative;

  .form-textarea {
    width: 100%;
    min-height: 240rpx;
    padding: 20rpx;
    border: 4rpx solid $black;
    background: $white;
    font-size: 28rpx;
    line-height: 1.6;
    box-shadow: 4rpx 4rpx 0 $black;

    // 不规则边缘
    clip-path: polygon(
      1% 0%, 98% 1%, 99% 98%, 1% 100%
    );
  }

  .char-count {
    position: absolute;
    bottom: 16rpx;
    right: 16rpx;
    font-size: 22rpx;
    color: #999;
  }
}

// 图片上传
.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border: 3rpx solid $black;
  box-shadow: 3rpx 3rpx 0 $black;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.image-remove {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  background: $red;
  color: $white;
  border: 2rpx solid $black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 900;
}

.image-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  border: 3rpx dashed $black;
  background: #F5F5F5;

  .add-icon {
    font-size: 48rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .add-text {
    font-size: 22rpx;
    color: #999;
  }
}

.submit-btn {
  width: 100%;
  margin-top: 24rpx;
}

// 提示
.tips {
  text-align: center;
  padding: 24rpx;

  .tips-text {
    font-size: 24rpx;
    color: #999;
  }
}

// 动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
