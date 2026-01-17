<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <brutalist-button accent @click="navigateToCreate">
        + 打印文件
      </brutalist-button>
    </view>

    <!-- 打印店选择 -->
    <brutalist-card class="shop-filter">
      <text class="section-title">选择打印店</text>
      <picker
        :range="printShops"
        :value="selectedShopIndex"
        @change="onShopChange"
      >
        <view class="picker-display">
          {{ selectedShopIndex !== null ? printShops[selectedShopIndex] : '全部打印店' }}
        </view>
      </picker>
    </brutalist-card>

    <!-- 打印记录列表 -->
    <view class="print-list">
      <brutalist-card
        v-for="print in filteredPrints"
        :key="print._id"
        class="print-card"
        @click="viewDetail(print)"
      >
        <view class="print-header">
          <text class="print-title">{{ print.title }}</text>
          <text class="print-status" :class="'status-' + print.status">
            {{ getStatusText(print.status) }}
          </text>
        </view>

        <view class="print-info">
          <text class="info-item">打印店：{{ print.shopName }}</text>
          <text class="info-item">规格：{{ print.option }}</text>
          <text class="info-item">份数：{{ print.copies }}份</text>
        </view>

        <view class="print-footer">
          <text class="print-time">{{ formatTime(print.createTime) }}</text>
          <text class="print-amount">¥{{ print.amount }}</text>
        </view>
      </brutalist-card>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredPrints.length === 0" class="empty-state">
      <text>暂无打印记录</text>
    </view>
  </view>
</template>

<script setup lang="uts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'
import BrutalistButton from '@/components/brutalist/BrutalistButton.vue'

// 定义打印记录接口
interface PrintRecord {
  _id: string
  title: string
  shopName: string
  option: string
  copies: number
  amount: number
  status: string
  createTime: number
  fileId: string
}

const userStore = useUserStore()

const prints = ref<PrintRecord[]>([])
const selectedShopIndex = ref<number | null>(null)

// 打印店列表
const printShops = [
  '全部打印店',
  '图书馆一楼打印店',
  '学生活动中心B座打印点',
  '东门校外打印店（5分钟）',
  '西门快印中心'
]

// 筛选后的打印记录
const filteredPrints = computed(() => {
  if (selectedShopIndex.value === null || selectedShopIndex.value === 0) {
    return prints.value
  }
  return prints.value.filter(print => print.shopName === printShops[selectedShopIndex.value])
})

// 打印店变更
function onShopChange(e: any) {
  selectedShopIndex.value = e.detail.value
}

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '待打印',
    'printing': '打印中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
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
    url: '/pages/print/create'
  })
}

// 查看详情
function viewDetail(print: PrintRecord) {
  uni.navigateTo({
    url: `/pages/print/detail?id=${print._id}`
  })
}

// 加载数据
async function loadPrints() {
  try {
    const db = uniCloud.database()
    const res = await db.collection('requests')
      .where({
        type: 'print'
      })
      .orderBy('createTime', 'desc')
      .get()

    // 转换数据格式
    const requestData = res.data as any[]
    prints.value = requestData.map((item: any) => {
      return {
        _id: item._id,
        title: item.title,
        shopName: item.print?.shop || '',
        option: getPrintOptionText(item.print?.option),
        copies: item.print?.copies || 1,
        amount: calculateAmount(item.print),
        status: item.status,
        createTime: item.createTime,
        fileId: item.print?.fileId || ''
      } as PrintRecord
    })
  } catch (e) {
    console.error('加载失败:', e)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 获取打印选项文本
function getPrintOptionText(option: string): string {
  const optionMap: Record<string, string> = {
    'mono-single': '黑白单面',
    'mono-double': '黑白双面',
    'color-single': '彩色单面',
    'color-double': '彩色双面'
  }
  return optionMap[option] || option
}

// 计算金额
function calculateAmount(print: any): number {
  const basePrice = print?.option?.startsWith('color') ? 0.8 : 0.3
  const duplexFactor = print?.option?.endsWith('double') ? 0.9 : 1
  return parseFloat(((basePrice * (print?.copies || 1) * duplexFactor).toFixed(2)))
}

onMounted(() => {
  loadPrints()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 24rpx;
}

.header-actions {
  margin-bottom: 24rpx;
  display: flex;
  justify-content: flex-end;
}

.shop-filter {
  margin-bottom: 32rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .picker-display {
    border: 2rpx solid #000;
    border-radius: 4rpx;
    padding: 24rpx;
    font-size: 28rpx;
  }
}

.print-list {
  .print-card {
    margin-bottom: 24rpx;

    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .print-title {
        font-size: 32rpx;
        font-weight: bold;
        flex: 1;
      }

      .print-status {
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        font-size: 24rpx;

        &.status-pending {
          background-color: #FFF3E0;
          color: #FF9800;
        }

        &.status-paid {
          background-color: #E3F2FD;
          color: #2196F3;
        }

        &.status-printing {
          background-color: #F3E5F5;
          color: #9C27B0;
        }

        &.status-completed {
          background-color: #E8F5E9;
          color: #4CAF50;
        }

        &.status-cancelled {
          background-color: #FFEBEE;
          color: #F44336;
        }
      }
    }

    .print-info {
      margin-bottom: 16rpx;

      .info-item {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
    }

    .print-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 24rpx;
      color: #999;

      .print-amount {
        font-size: 32rpx;
        font-weight: bold;
        color: var(--uni-color-primary);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 96rpx 0;
  color: #999;
}
</style>