<template>
  <brutalist-card class="chat-container">
    <view class="chat-header">
      <text class="title">实时消息</text>
    </view>

    <scroll-view class="message-list" scroll-y>
      <view
        v-for="(message, index) in messages"
        :key="index"
        class="message"
        :class="{ 'sent': message.sender === currentUserId }"
      >
        <brutalist-card :class="{ 'accent': message.sender === currentUserId }">
          <text class="content">{{ message.content }}</text>
          <text class="time">{{ formatTime(message.timestamp) }}</text>
        </brutalist-card>
      </view>
    </scroll-view>

    <view class="input-area">
      <input
        v-model="newMessage"
        class="message-input"
        placeholder="输入消息..."
        @confirm="sendMessage"
      />
      <brutalist-card accent @click="sendMessage">
        <view class="send-btn">
          <text>发送</text>
        </view>
      </brutalist-card>
    </view>
  </brutalist-card>
</template>

<script setup lang="uts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/user';
import BrutalistCard from '@/components/brutalist/BrutalistCard.vue'

// 接口定义
interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  timestamp: number;
  read: boolean;
}

// 数据定义
const userStore = useUserStore();
const messages = ref<Message[]>([]);
const newMessage = ref<string>('');
const currentUserId = ref<string>('');
const messageListener = ref<any>(null);

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.navigateTo({ url: '/pages/index/index' });
    return;
  }

  currentUserId.value = userStore.user._id;

  // 初始化消息监听
  const db = uniCloud.database();
  const messageCollection = db.collection('messages');

  // 监听当前用户的消息
  messageListener.value = messageCollection
    .where(`receiver == '${currentUserId.value}' || sender == '${currentUserId.value}'`)
    .orderBy('timestamp', 'asc')
    .watch({
      onChange: (snapshot: any) => {
        messages.value = snapshot.data as Message[];
      },
      onError: (e: any) => {
        console.error('消息监听失败:', e);
      }
    });
});

onUnmounted(() => {
  // 清理消息监听
  if (messageListener.value) {
    messageListener.value.close();
    messageListener.value = null;
  }
});

// 方法定义
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const db = uniCloud.database();
    await db.collection('messages').add({
      content: newMessage.value.trim(),
      sender: currentUserId.value,
      receiver: 'admin', // 实际应用中应替换为具体接收者
      timestamp: Date.now(),
      read: false
    });

    newMessage.value = '';
  } catch (e) {
    console.error('发送失败:', e);
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
$black: #000;

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 24rpx;
}

.chat-header {
  text-align: center;
  margin-bottom: 24rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24rpx;

  .message {
    margin-bottom: 24rpx;

    &.sent {
      display: flex;
      justify-content: flex-end;
    }

    .content {
      display: block;
      margin-bottom: 8rpx;
    }

    .time {
      font-size: 24rpx;
      color: #666;
      text-align: right;
    }
  }
}

.input-area {
  display: flex;
  gap: 16rpx;

  .message-input {
    flex: 1;
    border: 2rpx solid $black;
    border-radius: 4rpx;
    padding: 16rpx;
    font-size: 28rpx;
  }

  .send-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 24rpx;

    text {
      font-weight: bold;
    }
  }
}
</style>