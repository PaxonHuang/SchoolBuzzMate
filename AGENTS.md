# AGENTS.md

This file provides essential guidelines for agentic coding agents working in this repository.

## Build & Development Commands

```bash
# Development (default platform)
npm run dev

# Development for WeChat Mini Program
npm run dev:mp-weixin

# Production build
npm run build

# Production build for WeChat Mini Program
npm run build:mp-weixin
```

**Note:** This project does not currently have automated linting or testing configured. Always manually review code for type errors and ensure UniCloud functions are properly deployed.

## Tech Stack Overview

- **Framework:** UniApp X (DCloud's cross-platform framework)
- **Language:** UTS (Uni TypeScript) - mandatory for all `.vue` files
- **UI Framework:** Vue 3 Composition API with `<script setup lang="uts">`
- **State Management:** Pinia
- **Backend:** UniCloud (Alibaba Cloud/Tencent Cloud)
- **Styling:** SCSS with rpx units (responsive pixel units)
- **Design System:** Brutalist + Hand-drawn style

## Code Style Guidelines

### File Structure

All `.vue` components must use this exact structure:

```vue
<template>
  <!-- Template code -->
</template>

<script setup lang="uts">
  // UTS code with strict typing
</script>

<style lang="scss" scoped>
  // SCSS styles
</style>
```

### UTS Type Safety (MANDATORY)

**CRITICAL:** Every component MUST use `<script setup lang="uts">`. Never use plain JavaScript or Vue 2 syntax.

All props must have typed interfaces:

```uts
interface Props {
  title: string
  accent?: boolean
  count: number
}

const props = withDefaults(defineProps<Props>(), {
  accent: false
})
```

All emits must be typed:

```uts
const emit = defineEmits<{
  (e: 'click'): void
  (e: 'change', value: string): void
}>()
```

### Imports

Use ES module imports with `@` alias for project root:

```uts
import { ref, computed, onMounted } from 'vue'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
```

### Naming Conventions

- **Components:** PascalCase (e.g., `BrutalistCard.vue`, `UserProfile.vue`)
- **Files:** kebab-case for pages (e.g., `pages/user-profile/index.vue`)
- **Variables:** camelCase (e.g., `userInfo`, `isLoggedIn`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Stores:** `use` prefix (e.g., `useUserStore`, `useCartStore`)
- **Functions:** camelCase with verb prefix (e.g., `handleLogin`, `fetchData`)

### Styling with SCSS

Use the Brutalist design system colors:

```scss
$black: #000000;
$white: #ffffff;
$red: #FF6B6B;
$teal: #4ECDC4;
$yellow: #FFE66D;
```

Use `rpx` units for responsive design:

```scss
.component {
  padding: 32rpx;
  margin: 24rpx;
  border: 4rpx solid $black;
}
```

Use CSS variables from uni-app theme:

```scss
text {
  color: var(--uni-color-primary);
}
```

### Pinia State Management

All stores must use composition API pattern in `/stores/` directory:

```uts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  _id: string
  nickname: string
  avatar: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    uni.setStorageSync('userInfo', info)
  }

  return { userInfo, setUserInfo }
})
```

### UniCloud Integration

**Database Operations (Cloud Functions):**

Always use JQL or server-side `db.collection()`:

```uts
const db = uniCloud.database()
const res = await db.collection('users')
  .where('status == $env.UNI_USER_ID')
  .get()
```

**Calling Cloud Functions:**

```uts
const res = await uniCloud.callFunction({
  name: 'uni-id-cf',
  data: { method: 'loginByWeixin', code: code }
})
```

**Error Handling:**

Always wrap UniCloud calls in try-catch:

```uts
try {
  const res = await uniCloud.callFunction({ name: 'myFunction' })
  if (res.result?.errCode === 0) {
    // Success
  }
} catch (error) {
  console.error('Function call failed:', error)
  uni.showToast({ title: '操作失败', icon: 'none' })
}
```

### Brutalist UI Components

Always use existing Brutalist components for consistency:

- `BrutalistCard` - Content containers with tape/doodle decorations
- `BrutalistButton` - Buttons with accent/large/small/disabled variants
- `BrutalistInput` - Form inputs
- `TabBar` - Bottom navigation

Example usage:

```vue
<template>
  <brutalist-card class="my-card" taped accent>
    <text>{{ title }}</text>
    <brutalist-button @click="handleClick">
      Click Me
    </brutalist-button>
  </brutalist-card>
</template>
```

### Uni-id Authentication

Always use uni-id for user authentication:

```uts
// Frontend login
const loginRes = await uni.login({ provider: 'weixin' })
const code = loginRes[1].code

const res = await uniCloud.callFunction({
  name: 'uni-id-cf',
  data: { method: 'loginByWeixin', code: code }
})
```

Store token securely:

```uts
uni.setStorageSync('token', res.result.token)
uni.setStorageSync('userInfo', res.result.userInfo)
```

### Uni-pay Payment Integration

Payment flow:

```uts
// 1. Request payment params
const res = await uniCloud.callFunction({
  name: 'createPayment',
  data: { orderId: 'xxx' }
})

// 2. Request payment
await uni.requestPayment({
  provider: 'wxpay',
  ...res.result.paymentInfo
})

// 3. Handle payment callback in cloud function
```

### Error Handling Patterns

Always handle errors gracefully:

```uts
async function fetchData() {
  uni.showLoading({ title: '加载中...' })
  try {
    const res = await uniCloud.callFunction({ name: 'getData' })
    if (res.result?.errCode === 0) {
      data.value = res.result.data
    } else {
      throw new Error(res.result?.errMsg || '请求失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
```

### Performance Guidelines

- Use `lazy-load` directive on images: `<image lazy-load :src="url" />`
- Always provide unique `:key` on `v-for` lists
- Use `computed` for derived data instead of complex template expressions
- Minimize re-renders by properly using `watch` and `watchEffect`

### Security Rules

- **NEVER** hardcode secrets or API keys in frontend code
- Always validate `uniIdToken` in cloud functions requiring auth
- Use UniCloud's clientDB rules for client-side database access
- Sanitize user inputs before database operations

### Lifecycle Hooks

Import and use UniApp lifecycle hooks:

```uts
import { onLaunch, onShow, onHide, onPullDownRefresh } from '@dcloudio/uni-app'
import { onMounted, onUnmounted } from 'vue'

onLaunch(() => {
  console.log('App launched')
})

onMounted(() => {
  // Component mounted
})
```

### Page Navigation

Use standard UniApp navigation:

```uts
// Tab page (maintains TabBar)
uni.switchTab({
  url: '/pages/index/index'
})

// Regular page (hides TabBar)
uni.navigateTo({
  url: '/pages/detail/index?id=123'
})

// Back to previous page
uni.navigateBack()
```

### Comments

Add comments for complex logic:

```uts
// Calculate user level based on points
function calculateLevel(points: number): string {
  if (points >= 1000) return 'VIP'
  if (points >= 500) return 'Gold'
  return 'Silver'
}
```

## Testing Notes

Since automated tests are not configured, manually test:
1. User login/logout flow
2. Cloud function calls in WeChat DevTools
3. Database operations in UniCloud console
4. Payment flow in sandbox environment
5. All responsive layouts on different screen sizes

## Common Patterns

**Loading State:**

```uts
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    // ... data loading
  } finally {
    loading.value = false
  }
}
```

**Empty State:**

```vue
<view v-if="data.length === 0" class="empty-state">
  <text>暂无数据</text>
</view>
```

**List with Key:**

```vue
<view v-for="(item, index) in list" :key="item._id || index">
  {{ item.title }}
</view>
```

## Deployment Checklist

Before deploying:

- [ ] All components use `<script setup lang="uts">`
- [ ] Type errors resolved (check HBuilderX console)
- [ ] Cloud functions uploaded to UniCloud
- [ ] Database schemas imported
- [ ] `manifest.json` appid and permissions configured
- [ ] `pages.json` routes configured
- [ ] Test payment flow in sandbox
- [ ] Verify uni-id authentication
- [ ] Check responsive design on mobile
