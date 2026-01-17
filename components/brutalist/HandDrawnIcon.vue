<template>
  <view class="hand-drawn-icon" :style="{ fontSize: size + 'rpx' }">
    <text class="icon-char">{{ iconChar }}</text>
  </view>
</template>

<script setup lang="uts">
import { ref, onMounted } from 'vue'

interface Props {
  size?: number
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  icon: ''
})

const iconChar = ref('●')

// 根据传入的 icon 参数返回对应的图标字符
onMounted(() => {
  // 简单的图标映射，使用 emoji 或 unicode 字符
  const iconMap: Record<string, string> = {
    'home': '🏠',
    'buddy': '👥',
    'delivery': '📦',
    'print': '🖨️',
    'chat': '💬',
    'forum': '📝',
    'user': '👤',
    'settings': '⚙️',
    'search': '🔍',
    'close': '✕',
    'check': '✓',
    'plus': '+',
    'minus': '-'
  }

  if (props.icon && iconMap[props.icon]) {
    iconChar.value = iconMap[props.icon]
  }
})
</script>

<style scoped>
.hand-drawn-icon {
  display: inline-block;
  line-height: 1;
}

.icon-char {
  font-style: normal;
}
</style>