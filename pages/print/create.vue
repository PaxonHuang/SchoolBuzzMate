<template>
  <view class="container">
    <brutalist-card>
      <view class="form-group">
        <text class="label">上传文件</text>
        <view class="upload-area" @click="selectFile">
          <text class="upload-icon">📄</text>
          <text>{{ file ? file.name : '点击上传文档' }}</text>
          <text class="hint">支持PDF/DOCX/JPEG格式（最大50MB）</text>
        </view>
      </view>

      <view class="form-group">
        <text class="label">打印店选择</text>
        <picker
          :range="printShops"
          :value="printShopIndex"
          @change="onShopChange"
        >
          <view class="picker">
            {{ printShopIndex !== null ? printShops[printShopIndex] : '请选择打印店' }}
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">打印规格</text>
        <view class="options-grid">
          <view
            v-for="option in printOptions"
            :key="option.value"
            class="option-card"
            :class="{ 'selected': formData.printOption === option.value }"
            @click="formData.printOption = option.value"
          >
            {{ option.label }}
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">份数</text>
        <view class="quantity-selector">
          <text class="btn" @click="decreaseQuantity">-</text>
          <text class="quantity">{{ formData.copies }}</text>
          <text class="btn" @click="increaseQuantity">+</text>
        </view>
      </view>

      <brutalist-card accent @click="submitOrder">
        <view class="submit-btn">
          <text>提交订单（预估：{{ calculatePrice }}元）</text>
        </view>
      </brutalist-card>
    </brutalist-card>
  </view>
</template>

<script setup lang="uts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'

interface FormData {
  file?: File;
  printShop?: string;
  printOption: 'mono-single' | 'mono-double' | 'color-single' | 'color-double';
  copies: number;
}

const userStore = useUserStore();
const file = ref<File | null>(null);
const printShopIndex = ref<number | null>(null);

const printShops = [
  '图书馆一楼打印店',
  '学生活动中心B座打印点',
  '东门校外打印店（5分钟）',
  '西门快印中心'
];

const printOptions = [
  { label: '黑白 单面', value: 'mono-single' },
  { label: '黑白 双面', value: 'mono-double' },
  { label: '彩色 单面', value: 'color-single' },
  { label: '彩色 双面', value: 'color-double' }
];

const formData = ref<FormData>({
  printOption: 'mono-single',
  copies: 1
});

const calculatePrice = computed((): string => {
  const basePrice = formData.value.printOption.startsWith('color') ? 0.8 : 0.3;
  const duplexFactor = formData.value.printOption.endsWith('double') ? 0.9 : 1;
  return (basePrice * formData.value.copies * duplexFactor).toFixed(1);
});

const selectFile = () => {
  uni.chooseFile({
    count: 1,
    type: 'file',
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        file.value = res.tempFiles[0];
      }
    }
  });
};

const onShopChange = (e: any) => {
  printShopIndex.value = e.detail.value;
};

const increaseQuantity = () => {
  if (formData.value.copies < 100) {
    formData.value.copies++;
  }
};

const decreaseQuantity = () => {
  if (formData.value.copies > 1) {
    formData.value.copies--;
  }
};

const submitOrder = async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  if (!file.value) {
    uni.showToast({ title: '请上传文件', icon: 'none' });
    return;
  }

  if (printShopIndex.value === null) {
    uni.showToast({ title: '请选择打印店', icon: 'none' });
    return;
  }

  try {
    // 上传文件到云存储
    const uploadRes = await uniCloud.uploadFile({
      filePath: file.value.tempFilePath,
      cloudPath: `prints/${Date.now()}_${file.value.name}`
    });

    const db = uniCloud.database();
    const { user } = userStore;
    const amount = parseFloat(calculatePrice.value);

    // 创建打印请求
    const { _id } = await db.collection('requests').add({
      type: 'print',
      title: `打印任务 - ${file.value.name}`,
      description: `${file.value.name} x ${formData.value.copies}份`,
      tags: [formData.value.printOption],
      createTime: Date.now(),
      creator: user._id,
      status: 'unpaid',
      print: {
        fileId: uploadRes.fileID,
        shop: printShops[printShopIndex.value],
        option: formData.value.printOption,
        copies: formData.value.copies
      }
    });


    // 创建订单记录
    await db.collection('orders').add({
      requestId: _id,
      amount: amount,
      status: 'unpaid',
      createTime: Date.now()
    });


    // 跳转到支付页面
    uni.navigateTo({
      url: `/pages/payment/index?orderId=${_id}&amount=${amount}`
    });
  } catch (e) {
    console.error('提交失败:', e);
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
$black: #000;

.container {
  padding: 24rpx;
}

.form-group {
  margin-bottom: 32rpx;

  .label {
    display: block;
    margin-bottom: 16rpx;
    font-weight: bold;
    font-size: 28rpx;
  }

  .picker {
    border: 2rpx solid $black;
    padding: 16rpx;
    border-radius: 4rpx;
    margin-top: 16rpx;
  }
}

.upload-area {
  border: 2rpx dashed $black;
  border-radius: 4rpx;
  padding: 32rpx 0;
  text-align: center;

  .hint {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #666;
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;

  .option-card {
    border: 2rpx solid $black;
    border-radius: 4rpx;
    padding: 16rpx;
    text-align: center;

    &.selected {
      background-color: var(--uni-color-primary);
      color: white;
    }
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 2rpx solid $black;
  border-radius: 4rpx;
  overflow: hidden;

  .btn {
    flex: 1;
    padding: 16rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-right: 2rpx solid $black;


    &:last-child {
      border-right: none;
    }
  }

  .quantity {
    flex: 2;
    padding: 16rpx;
    text-align: center;
  }
}

.submit-btn {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;

  text {
    font-size: 36rpx;
    font-weight: bold;
  }
}
</style>