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
      <text class="header-title">发布找搭子</text>
      <text class="header-subtitle">寻找志同道合的伙伴</text>
    </brutalist-card>

    <!-- 表单卡片 -->
    <brutalist-card class="form-card">
      <!-- 标题输入 -->
      <view class="form-group">
        <text class="form-label">
          <text>📝</text>
          <text>活动标题</text>
          <text class="required">*</text>
        </text>
        <brutalist-input
          v-model="formData.title"
          placeholder="例如：寻找周三图书馆自习伙伴"
          :maxlength="30"
          show-count
          taped
        />
      </view>

      <!-- 活动类型 -->
      <view class="form-group">
        <text class="form-label">
          <text>🏷️</text>
          <text>活动类型</text>
          <text class="required">*</text>
        </text>
        <view class="tag-grid">
          <view
            v-for="tag in buddyTags"
            :key="tag"
            class="tag-item"
            :class="{ 'active': formData.tags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            <text>{{ getTagEmoji(tag) }}</text>
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 详细描述 -->
      <view class="form-group">
        <text class="form-label">
          <text>✍️</text>
          <text>活动描述</text>
          <text class="required">*</text>
        </text>
        <view class="textarea-wrapper">
          <textarea
            v-model="formData.description"
            class="form-textarea"
            placeholder="详细说明你的需求，包括时间、地点等..."
            :maxlength="300"
          />
          <text class="char-count">{{ formData.description.length }}/300</text>
        </view>
      </view>

      <!-- 人数限制 -->
      <view class="form-group">
        <text class="form-label">
          <text>👥</text>
          <text>人数限制</text>
          <text class="optional">（选填）</text>
        </text>
        <view class="participant-selector">
          <view
            v-for="num in [2, 3, 4, 6, 8]"
            :key="num"
            class="participant-item"
            :class="{ 'active': formData.maxParticipants === num }"
            @click="selectParticipants(num)"
          >
            <text>{{ num }}人</text>
          </view>
          <view
            class="participant-item"
            :class="{ 'active': formData.maxParticipants === 0 }"
            @click="selectParticipants(0)"
          >
            <text>不限</text>
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
        @click="submitRequest"
      >
        发布需求
      </brutalist-button>
    </brutalist-card>

    <!-- 提示 -->
    <view class="tips">
      <text class="tips-text">💡 发布后会展示给所有同学，请确保信息真实</text>
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
  description: string
  tags: string[]
  maxParticipants: number
}

const userStore = useUserStore()
const formData = ref<FormData>({
  title: '',
  description: '',
  tags: [],
  maxParticipants: 0
})

const buddyTags = [
  '学习', '运动', '旅游', '饭搭子', '图书馆',
  '篮球', '足球', '羽毛球', '自习', '考试'
]

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

function toggleTag(tag: string) {
  const index = formData.value.tags.indexOf(tag)
  if (index === -1) {
    formData.value.tags.push(tag)
  } else {
    formData.value.tags.splice(index, 1)
  }
}

function selectParticipants(num: number) {
  formData.value.maxParticipants = num
}

function goBack() {
  uni.navigateBack()
}

async function submitRequest() {
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

  // 验证类型
  if (formData.value.tags.length === 0) {
    uni.showToast({
      title: '请选择至少一个类型',
      icon: 'none'
    })
    return
  }

  // 验证描述
  if (!formData.value.description.trim()) {
    uni.showToast({
      title: '请输入描述',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '发布中...' })

  try {
    const db = uniCloud.database()

    await db.collection('requests').add({
      type: 'buddy',
      title: formData.value.title,
      description: formData.value.description,
      tags: formData.value.tags,
      maxParticipants: formData.value.maxParticipants || null,
      creator: userStore.user?._id || 'user_' + Date.now(),
      creatorName: userStore.user?.nickname || '校园用户',
      createTime: Date.now(),
      status: 'open'
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
    const mockRequest = {
      _id: 'req_' + Date.now(),
      title: formData.value.title,
      description: formData.value.description,
      tags: formData.value.tags,
      maxParticipants: formData.value.maxParticipants || null,
      creator: userStore.user?._id || 'user_' + Date.now(),
      creatorName: userStore.user?.nickname || '校园用户',
      createTime: Date.now(),
      status: 'open'
    }

    // 保存到本地
    const requests = uni.getStorageSync('mock_requests') || []
    requests.unshift(mockRequest)
    uni.setStorageSync('mock_requests', requests)

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

// 标签网格
.tag-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
}

.tag-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 8rpx;
  border: 3rpx solid $black;
  background: $white;
  box-shadow: 3rpx 3rpx 0 $black;
  transition: all 0.2s ease;

  text:first-child {
    font-size: 28rpx;
  }

  text:last-child {
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
    min-height: 200rpx;
    padding: 20rpx;
    border: 4rpx solid $black;
    background: $white;
    font-size: 28rpx;
    line-height: 1.6;
    box-shadow: 4rpx 4rpx 0 $black;

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

// 人数选择
.participant-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100rpx;
  padding: 14rpx 20rpx;
  border: 3rpx solid $black;
  background: $white;
  box-shadow: 3rpx 3rpx 0 $black;
  font-size: 24rpx;
  font-weight: 700;
  transition: all 0.2s ease;

  &.active {
    background: $yellow;
    transform: translate(-2rpx, -2rpx);
    box-shadow: 5rpx 5rpx 0 $black;
  }

  &:active {
    transform: translate(2rpx, 2rpx);
    box-shadow: 1rpx 1rpx 0 $black;
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
