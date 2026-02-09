'use strict';

const uniID = require('uni-id-common');

exports.main = async (event, context) => {
  const { method } = event;

  // 初始化 uni-id
  const uniIdInstance = uniID.createInstance({
    context
  });

  try {
    switch (method) {
      case 'loginByWeixin':
        // 微信小程序登录
        const { code } = event;
        const loginRes = await uniIdInstance.loginByWeixin({
          code
        });

        return {
          errCode: 0,
          errMsg: '登录成功',
          ...loginRes
        };

      case 'register':
        // 用户注册
        const { username, password, nickname } = event;
        const registerRes = await uniIdInstance.register({
          username,
          password,
          nickname,
          autoLogin: true
        });

        return {
          errCode: 0,
          errMsg: '注册成功',
          ...registerRes
        };

      case 'getUserInfo':
        // 获取用户信息
        const { uid } = event;
        const userInfo = await uniIdInstance.getUserInfo({
          uid
        });

        return {
          errCode: 0,
          errMsg: '获取成功',
          ...userInfo
        };

      case 'updateUserInfo':
        // 更新用户信息
        const { updateData, updateUid } = event;
        const updateRes = await uniIdInstance.updateUser({
          uid: updateUid,
          ...updateData
        });

        return {
          errCode: 0,
          errMsg: '更新成功',
          ...updateRes
        };

      case 'logout':
        // 退出登录
        await uniIdInstance.logout(event.token);

        return {
          errCode: 0,
          errMsg: '退出成功'
        };

      default:
        return {
          errCode: 1,
          errMsg: '未知方法'
        };
    }
  } catch (e) {
    console.error('uni-id error:', e);
    return {
      errCode: 1,
      errMsg: e.message || '操作失败'
    };
  }
};