<template>
  <view
    class="brutalist-input-wrapper"
    :class="{
      'error': props.error,
      'focused': isFocused,
      'disabled': props.disabled,
      'taped': props.taped
    }"
  >
    <!-- 胶带装饰 -->
    <view v-if="props.taped" class="input-tape-left"></view>
    <view v-if="props.taped" class="input-tape-right"></view>

    <!-- 标签 -->
    <text v-if="props.label" class="input-label">
      {{ props.label }}
      <text v-if="props.required" class="required-mark">*</text>
    </text>

    <!-- 输入框容器 -->
    <view class="input-container">
      <!-- 前缀图标 -->
      <text v-if="props.prefixIcon" class="prefix-icon">{{ props.prefixIcon }}</text>

      <!-- 输入框 -->
      <input
        v-model="inputValue"
        :type="props.type"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        class="input-field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- 后缀图标 -->
      <text v-if="props.suffixIcon" class="suffix-icon">{{ props.suffixIcon }}</text>

      <!-- 清除按钮 -->
      <text
        v-if="props.clearable && inputValue.length > 0 && !props.disabled"
        class="clear-icon"
        @click="handleClear"
      >×</text>
    </view>

    <!-- 提示文本 -->
    <text v-if="props.hint && !props.error" class="hint-text">{{ props.hint }}</text>

    <!-- 错误文本 -->
    <text v-if="props.error && props.errorText" class="error-text">
      <text class="error-icon">!</text>
      {{ props.errorText }}
    </text>

    <!-- 字符计数 -->
    <text v-if="props.showCount && props.maxlength" class="char-count">
      {{ inputValue.length }} / {{ props.maxlength }}
    </text>
  </view>
</template>

<script setup lang="uts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  errorText?: string
  hint?: string
  prefixIcon?: string
  suffixIcon?: string
  required?: boolean
  clearable?: boolean
  maxlength?: number
  showCount?: boolean
  taped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '请输入',
  disabled: false,
  error: false,
  errorText: '',
  hint: '',
  required: false,
  clearable: false,
  maxlength: 140,
  showCount: false,
  taped: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'clear'): void
}>()

const inputValue = ref(props.modelValue)
const isFocused = ref(false)

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

function handleInput(e: any) {
  emit('update:modelValue', e.detail.value)
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleClear() {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
// 野兽派配色方案
$black: #000000;
$white: #ffffff;
$red: #FF6B6B;
$teal: #4ECDC4;
$yellow: #FFE66D;

.brutalist-input-wrapper {
  position: relative;
  margin-bottom: 32rpx;

  // 错误状态
  &.error {
    .input-container {
      border-color: $red;
      box-shadow: 4rpx 4rpx 0 $red;
    }

    .input-label {
      color: $red;
    }
  }

  // 聚焦状态
  &.focused {
    .input-container {
      border-color: $teal;
      box-shadow: 6rpx 6rpx 0 $teal;
      transform: translate(-2rpx, -2rpx);
    }
  }

  // 禁用状态
  &.disabled {
    .input-container {
      background: #F5F5F5;
      opacity: 0.6;
    }

    .input-field {
      color: #999;
    }
  }
}

// 胶带装饰
.input-tape {
  &-left {
    position: absolute;
    top: -8rpx;
    left: 20rpx;
    width: 40rpx;
    height: 14rpx;
    background: rgba(255, 230, 109, 0.8);
    transform: rotate(-3deg);
    z-index: 1;
  }

  &-right {
    position: absolute;
    top: -8rpx;
    right: 20rpx;
    width: 40rpx;
    height: 14rpx;
    background: rgba(255, 230, 109, 0.8);
    transform: rotate(3deg);
    z-index: 1;
  }
}

// 标签
.input-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 900;
  color: $black;
  text-transform: uppercase;
  letter-spacing: 1rpx;

  .required-mark {
    color: $red;
    margin-left: 4rpx;
  }
}

// 输入框容器
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 4rpx solid $black;
  background: $white;
  padding: 0 24rpx;
  min-height: 88rpx;
  box-shadow: 4rpx 4rpx 0 $black;
  transition: all 0.2s ease;

  // 不规则边缘
  clip-path: polygon(
    1% 0%, 98% 1%, 99% 98%, 1% 100%
  );
}

.input-field {
  flex: 1;
  border: none;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: $black;
  background: transparent;

  &::placeholder {
    color: #999;
    font-weight: 400;
  }

  &:focus {
    outline: none;
  }
}

// 前缀图标
.prefix-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
  color: $black;
}

// 后缀图标
.suffix-icon {
  font-size: 32rpx;
  margin-left: 12rpx;
  color: $black;
}

// 清除按钮
.clear-icon {
  font-size: 40rpx;
  line-height: 1;
  margin-left: 12rpx;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    color: $red;
    transform: scale(1.2);
  }
}

// 提示文本
.hint-text {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

// 错误文本
.error-text {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $red;
  font-weight: 600;

  .error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
    background: $red;
    color: $white;
    font-weight: 900;
    font-size: 20rpx;
    border-radius: 50%;
  }
}

// 字符计数
.char-count {
  position: absolute;
  bottom: -28rpx;
  right: 0;
  font-size: 22rpx;
  color: #999;

  .brutalist-input-wrapper.error & {
    color: $red;
  }
}
</style>
