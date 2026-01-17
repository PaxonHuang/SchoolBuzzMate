<template>
  <view
    class="brutalist-card"
    :class="{
      'accent': props.accent,
      'taped': props.taped,
      'dashed': props.dashed
    }"
  >
    <!-- 胶带装饰 -->
    <view v-if="props.taped" class="tape-tl"></view>
    <view v-if="props.taped" class="tape-tr"></view>
    <view v-if="props.taped" class="tape-bl"></view>
    <view v-if="props.taped" class="tape-br"></view>

    <!-- 涂鸦装饰 -->
    <view v-if="props.doodle" class="doodle-corner-1">
      <text class="doodle-star">✦</text>
    </view>
    <view v-if="props.doodle" class="doodle-corner-2">
      <text class="doodle-circle">◉</text>
    </view>

    <slot></slot>
  </view>
</template>

<script setup lang="uts">
interface Props {
  accent?: boolean
  taped?: boolean
  dashed?: boolean
  doodle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accent: false,
  taped: false,
  dashed: false,
  doodle: false
})
</script>

<style lang="scss" scoped>
// 野兽派配色方案
$black: #000000;
$white: #ffffff;
$red: #FF6B6B;
$teal: #4ECDC4;
$yellow: #FFE66D;
$shadow: 8rpx;

.brutalist-card {
  position: relative;
  background: $white;
  // 不规则手撕边缘效果
  clip-path: polygon(
    1% 0%, 98% 2%, 99% 98%, 2% 100%,
    0% 1%, 100% 0%, 99% 99%, 0% 99%
  );
  border: 4rpx solid $black;
  padding: 32rpx;
  margin: 24rpx;
  // 硬阴影效果
  box-shadow: $shadow $shadow 0 $teal;
  transition: all 0.2s ease;

  // 激活状态
  &.accent {
    background: linear-gradient(135deg, $yellow 0%, #FFEAA7 100%);
    border-color: $black;
    box-shadow: $shadow $shadow 0 $red;
  }

  // 虚线边框
  &.dashed {
    border-style: dashed;
    border-width: 3rpx;
  }

  // 悬停效果
  &:active {
    transform: translate(2rpx, 2rpx);
    box-shadow: ($shadow - 2rpx) ($shadow - 2rpx) 0 $teal;
  }
}

// 胶带装饰
.tape {
  position: absolute;
  width: 60rpx;
  height: 20rpx;
  background: rgba(255, 107, 107, 0.8);
  opacity: 0.9;

  &.tape-tl {
    top: -10rpx;
    left: 20rpx;
    transform: rotate(-45deg);
  }

  &.tape-tr {
    top: -10rpx;
    right: 20rpx;
    transform: rotate(45deg);
  }

  &.tape-bl {
    bottom: -10rpx;
    left: 20rpx;
    transform: rotate(45deg);
  }

  &.tape-br {
    bottom: -10rpx;
    right: 20rpx;
    transform: rotate(-45deg);
  }
}

// 涂鸦装饰
.doodle {
  &-corner {
    position: absolute;
    font-size: 24rpx;
    opacity: 0.6;
  }

  &-corner-1 {
    top: 8rpx;
    right: 12rpx;
    color: $red;
  }

  &-corner-2 {
    bottom: 8rpx;
    left: 12rpx;
    color: $teal;
  }

  .doodle-star {
    animation: spin 10s linear infinite;
  }

  .doodle-circle {
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
