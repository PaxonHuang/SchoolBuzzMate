'use strict';

exports.main = async (event, context) => {
  const { orderId } = event;
  const db = uniCloud.database();
  const dbCmd = db.command;

  try {
    // 1. 验证订单存在且未支付
    const orderRes = await db.collection('orders').where({
      _id: orderId,
      status: 'unpaid'
    }).get();

    if (orderRes.data.length === 0) {
      return {
        code: 400,
        message: '订单不存在或已支付'
      };
    }

    const order = orderRes.data[0];


    // 2. 初始化支付
    const payment = uniCloud.initPayment();
    const res = await payment.createOrder({
      subject: `校趣闪搭 - 打印订单 #${orderId.substring(0, 6)}`,
      body: '校园服务平台订单',
      outTradeId: orderId,
      amount: order.amount,
      clientIp: context.CLIENTIP,
      paymentType: 'wxpay'
    });


    // 3. 返回支付参数
    return {
      code: 200,
      data: {
        paymentParams: res,
        orderId: orderId
      }
    };
  } catch (e) {
    console.error('支付创建失败:', e);
    return {
      code: 500,
      message: '支付创建失败'
    };
  }
};