<template>
  <brutalist-card class="payment-container">
    <view class="payment-header">
      <text class="title">订单支付</text>
      <text class="amount">¥{{ amount }}</text>
    </view>

    <brutalist-card>
      <view class="payment-method">
        <text class="payment-icon">💳</text>
        <text>微信支付</text>
      </view>
    </brutalist-card>

    <brutalist-card accent @click="handlePayment">
      <view class="submit-btn">
        <text>立即支付</text>
      </view>
    </brutalist-card>
  </brutalist-card>
</template>

<script setup lang="uts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app';
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'

const orderId = ref<string>('');
const amount = ref<number>(0);

onLoad((options: any) => {
  orderId.value = options.orderId;
  amount.value = parseFloat(options.amount);
});

const handlePayment = async () => {
  try {
    // 1. 调用云函数获取支付参数
    const paymentRes = await uniCloud.callFunction({
      name: 'createPayment',
      data: { orderId: orderId.value }
    });

    if (paymentRes.result.code !== 200) {
      uni.showToast({
        title: paymentRes.result.message || '支付参数获取失败',
        icon: 'none'
      });
      return;
    }

    const { paymentParams } = paymentRes.result.data;

    // 2. 发起微信支付
    await uni.requestPayment({
      ...paymentParams,
      success: async () => {
        // 3. 支付成功，更新订单状态
        await uniCloud.database().collection('orders').doc(orderId.value).update({
          status: 'paid',
          paymentTime: Date.now()
        });

        uni.showToast({ title: '支付成功' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        console.error('支付失败:', err);
        uni.showToast({
          title: '支付取消或失败',
          icon: 'none'
        });
      }
    });
  } catch (e) {
    console.error('支付处理失败:', e);
    uni.showToast({
      title: '支付处理失败',
      icon: 'none'
    });
  }
};
</script>

<style lang="scss" scoped>
$black: #000;

.payment-container {
  padding: 48rpx 24rpx;

  .payment-header {
    text-align: center;
    margin-bottom: 48rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 16rpx;
    }

    .amount {
      font-size: 64rpx;
      font-weight: bold;
      color: var(--uni-color-primary);
    }
  }

  .payment-method {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 24rpx;
    border: 2rpx solid $black;
    border-radius: 4rpx;

    text {
      font-size: 32rpx;
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
}
</style>