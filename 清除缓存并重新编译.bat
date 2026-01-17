@echo off
echo ========================================
echo 微信小程序 WebSocket 错误修复工具
echo ========================================
echo.
echo 正在清除编译缓存...
echo.

REM 清除缓存目录
if exist "unpackage" (
    rd /s /q "unpackage"
    echo 已删除 unpackage 目录
)

if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo 已删除 Vite 缓存
)

echo.
echo ========================================
echo 缓存清除完成！
echo ========================================
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 关闭微信开发者工具
echo 2. 关闭 HBuilderX
echo 3. 重新打开 HBuilderX
echo 4. 运行到微信开发者工具
echo 5. 在微信开发者工具中点击"编译"
echo.
echo 重要提示：
echo - WebSocket 错误不影响小程序功能
echo - 修改代码后需要手动点击"编译"按钮
echo - 或者使用生产模式测试：npm run build:mp-weixin
echo.
pause
