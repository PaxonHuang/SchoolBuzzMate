<template>
  <view
    class="brutalist-button"
    :class="{
      'accent': props.accent,
      'large': props.large,
      'small': props.small,
      'disabled': props.disabled,
      'outline': props.outline
    }"
    @click="handleClick"
  >
    <!-- 胶带装饰 -->
    <view v-if="props.taped" class="button-tape"></view>

    <text class="button-text">
      <slot></slot>
    </text>

    <!-- 箭头装饰 -->
    <text v-if="props.arrow" class="button-arrow">→</text>
  </view>
</template>

<script setup lang="uts">
interface Props {
  accent?: boolean
  large?: boolean
  small?: boolean
  disabled?: boolean
  outline?: boolean
  taped?: boolean
  arrow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accent: false,
  large: false,
  small: false,
  disabled: false,
  outline: false,
  taped: false,
  arrow: false
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (!props.disabled) {
    emit('click')
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

.brutalist-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $black;
  background: $white;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 6rpx 6rpx 0 $black;

  // 不规则边缘
  clip-path: polygon(
    2% 0%, 98% 1%, 99% 98%, 1% 100%
  );

  // 激活状态
  &.accent {
    background: $red;
    color: $white;
    box-shadow: 6rpx 6rpx 0 $black;
  }

  // 轮廓按钮
  &.outline {
    background: transparent;
    color: $black;

    &.accent {
      background: transparent;
      color: $red;
      border-color: $red;
    }
  }

  // 大尺寸
  &.large {
    padding: 32rpx 64rpx;
    font-size: 32rpx;
  }

  // 小尺寸
  &.small {
    padding: 16rpx 32rpx;
    font-size: 24rpx;
    border-width: 3rpx;
  }

  // 禁用状态
  &.disabled {
    opacity: 0.5;
    filter: grayscale(1);
  }

  // 悬停效果
  &:active:not(.disabled) {
    transform: translate(3rpx, 3rpx);
    box-shadow: 3rpx 3rpx 0 $black;
  }

  // 胶带装饰
  .button-tape {
    position: absolute;
    top: -8rpx;
    left: 50%;
    transform: translateX(-50%) rotate(-2deg);
    width: 40rpx;
    height: 16rpx;
    background: rgba(255, 230, 109, 0.9);
  }

  // 文本
  .button-text {
    position: relative;
    z-index: 1;
  }

  // 箭头
  .button-arrow {
    margin-left: 12rpx;
    font-size: 32rpx;
    transition: transform 0.3s ease;
  }

  &:active .button-arrow {
    transform: translateX(4rpx);
  }
}
</style>
