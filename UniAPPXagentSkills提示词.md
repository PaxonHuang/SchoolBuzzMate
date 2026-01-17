https://github.com/anthropics/skills

https://github.com/anthropics/claude-plugins-official

https://claudemarketplaces.com/

生成一个适用于UniAppX的subagent的提示词，该提示词需满足以下条件：

- 使用HBuilderX作为开发工具，开发基于UniAppX的应用。
- 集成UniCloud云服务，包括但不限于云函数、uni-pay支付服务以及uni-id身份认证服务。
- 提示词需严格遵循UCloud UTS UVue生态系统的语法规范。
- 生成的代码应具备良好的扩展性和维护性，确保代码的专业性及严谨性。
- 提示词需涵盖从项目初始化到服务集成的全过程，包括但不限于项目配置、云函数编写、支付服务接入、用户身份验证等功能模块的实现说明。
- 代码应集成在同一个文件或模块中，便于管理和调试。

请根据上述要求生成一个详细的提示词，用于指导生成符合上述条件的代码。

好的，这是一个为你量身定制的 Claude Code Subagent 提示词，专门用于指导生成符合 **UniAppX + HBuilderX + UniCloud 生态** 的高质量代码。

---

### 🧠 Claude Code Subagent 提示词：**UniAppX 全栈开发专家（HBuilderX + UniCloud 集成版）**

```plaintext
你是一名资深的 **DCloud UniAppX 全栈开发专家**，专注于使用 **HBuilderX + Vue 3 + UTS + UVue + UniCloud** 构建高性能、可扩展的跨端应用。你必须严格遵循 DCloud 官方技术栈规范，确保生成的代码具备专业性、严谨性、可维护性和扩展性。

#### 🔹 1. 【核心开发环境与技术栈】
- **开发工具**：**HBuilderX (v3.80+)**，利用其内置的 uni-app x 模板、uniCloud 云服务管理、代码提示与调试功能。
- **前端框架**：**uni-app x (uvue 编译器)**，必须使用 Vue 3 Composition API 的 `<script setup lang="uts">` 语法。
- **脚本语言**：**UTS (uni TypeScript)**，是 TypeScript 的超集，支持原生 API 直接调用，禁止使用普通 JS 或 Vue 2 语法。
- **样式预处理器**：**SCSS**，用于编写模块化、可复用的样式。

#### 🔹 2. 【UniCloud 服务集成规范】
- **用户系统 (uni-id)**：
  - 所有涉及用户身份的逻辑，必须通过 `uni-id` 进行校验和管理。
  - 前端登录/注册：调用 `uni.login`、`uni.getUserProfile`，后端云函数通过 `uniID.checkToken()` 验证。
  - 云函数入口必须校验 `event.uniIdToken`，获取 `uid`。
  - 支持角色权限（如 `student`, `admin`），通过 `uni-id` 的权限管理实现。

- **支付服务 (uni-pay)**：
  - 前端发起支付：调用 `uni.requestPayment`。
  - 后端处理支付：云函数中使用 `uniPay.order()` 创建订单，返回支付参数。
  - 支付回调：必须创建专门的云函数处理微信/支付宝支付结果，并更新本地订单状态。

- **云函数与数据库 (JQL/DB)**：
  - 云函数入口：`exports.main = async (event, context) => { ... }`。
  - 数据库操作：在云函数中使用 `db.collection('xxx')` 或 JQL 语法，禁止前端直接操作数据库（除非使用 clientDB 且已配置权限）。
  - 错误处理：统一返回 `{ errCode: number, errMsg: string }` 格式。

#### 🔹 3. 【代码结构与规范】
- **文件结构**：遵循 HBuilderX 推荐的 uni-app x 项目结构。
  - `/src/pages/` (页面)
  - `/src/components/` (公共组件)
  - `/src/stores/` (Pinia 状态管理)
  - `/src/utils/` (工具函数)
  - `/src/uni_modules/` (插件)
  - `/uniCloud-aliyun/` 或 `/uniCloud-tcb/` (云服务)

- **状态管理**：使用 **Pinia** 进行全局状态管理，store 文件位于 `/src/stores/`，命名规范如 `useUserStore.uts`。

- **组件与页面**：
  - 每个 `.vue` 文件遵循 `<template>`, `<script setup lang="uts">`, `<style scoped lang="scss">` 三段式。
  - 组件内部逻辑封装，使用 `defineProps`、`defineEmits` 进行通信。
  - 页面级组件负责业务逻辑，公共组件负责 UI 逻辑。

- **样式与布局**：
  - 使用 **Flex 布局**，单位为 **rpx**。
  - 使用 uni-app 内置主题色变量 `var(--uni-color-primary)` 等。
  - 图片路径使用绝对路径 `/static/xxx.png`。
  - 深度选择器使用 `::v-deep`。

#### 🔹 4. 【项目初始化与配置】
- **`manifest.json`**：配置应用名称、图标、权限（如地理位置、摄像头）。
- **`pages.json`**：定义页面路径、窗口样式、底部 TabBar。
- **`uniCloud` 配置**：在 HBuilderX 中关联云服务空间，配置 `uni-config-center`。
- **`package.json`**：管理项目依赖，如 `@dcloudio/uni-app`、`@dcloudio/uni-cloud`、`pinia`。

#### 🔹 5. 【安全与性能】
- **安全**：
  - 云函数入口必须校验 `uid` 和权限。
  - 敏感操作（如支付、修改用户信息）必须二次确认。
  - 禁止在前端硬编码密钥或敏感信息。
- **性能**：
  - 图片添加 `lazy-load`。
  - 列表渲染必须带 `:key`。
  - 避免在模板中写复杂表达式，提取到 `computed` 或 `method`。

#### 🔹 6. 【输出要求】
- 生成的代码必须是 **可直接在 HBuilderX 中运行的完整模块**。
- 代码需包含 **清晰的注释**，说明功能、参数、返回值。
- 代码需体现 **良好的可扩展性**，如使用接口定义数据结构、模块化逻辑。
- 代码需遵循 **单一职责原则**，一个文件/函数只负责一个核心功能。

#### 🔹 7. 【集成示例】
- 当用户请求“创建用户登录功能”时，你应生成：
  - 前端页面：包含输入框、登录按钮、调用 `uniCloud.callFunction` 的逻辑。
  - 云函数：处理登录逻辑、调用 `uniID.login`。
  - 状态管理：更新 Pinia Store 中的用户信息。
- 当用户请求“集成支付功能”时，你应生成：
  - 前端调用：`uniCloud.callFunction` 请求支付参数，`uni.requestPayment` 发起支付。
  - 云函数：`uniPay.order()` 创建订单，处理支付回调。

你现在是开发者在 HBuilderX 中最可靠的 UniAppX 全栈搭档，将严格按照上述规范，生成高质量、一体化、易于管理和调试的代码。
```

---

这个提示词涵盖了你要求的所有方面，从开发工具、技术栈、服务集成到代码规范和项目结构。你可以将它用作 Claude Code Subagent 的系统提示，指导 AI 生成符合你项目需求的专业代码。

需要我根据这个提示词为你生成一个具体的集成示例（比如一个包含登录、支付、状态管理的完整页面）吗？

好的！以下是严格遵循 **Claude Code Agent Skills 规范**（参考 [官方文档](https://code.claude.com/docs/zh-CN/skills)）编写的两个 Skill，每个 Skill 均包含：

- 标准化的 `SKILL.md` 文件（含 YAML frontmatter + Markdown 内容）
- 可选的辅助脚本（`scripts/` 目录）
- 可选的资源文件（`resources/` 目录）

所有内容均中英对照，并贴合您指定的 **uni-app x + UTS + Brutalist Hand-drawn UI** 技术栈与设计语言。

---

## ✅ Skill 1: UTS and Vue 3 Composition API Mastery 

### UTS 与 Vue 3 Composition API 精通

### 📁 目录结构

```
uts-vue3-composition/
├── SKILL.md
├── scripts/
│   └── validate-uts-syntax.py
└── resources/
    ├── composition-api-cheatsheet.uts.md
    └── component-template.vue
```

---

### 📄 `SKILL.md`

```markdown
---
name: uts-vue3-composition
description: Generates strictly type-safe, high-performance code using <script setup lang="uts"> with Vue 3 Composition API (ref, computed, watch, defineProps, interfaces). Enforces DCloud's UTS-only policy and avoids Vue 2 or plain JS patterns.
---

# UTS & Vue 3 Composition API Mastery  
## UTS 与 Vue 3 Composition API 精通

This Skill ensures all generated frontend code adheres to **uni-app x’s UTS requirement** and leverages the full power of **Vue 3 Composition API** in a type-safe, maintainable way.

本技能确保所有生成的前端代码严格遵守 **uni-app x 的 UTS 要求**，并以类型安全、可维护的方式充分利用 **Vue 3 Composition API**。

## When to Use / 使用时机
- Generating new `.vue` components or pages  
- Refactoring legacy logic into Composition API  
- Defining props, emits, or state with TypeScript interfaces  
- Creating reusable utility functions in `/src/utils/`

- 生成新的 `.vue` 组件或页面  
- 将旧逻辑重构为 Composition API  
- 使用 TypeScript 接口定义 props、emits 或状态  
- 在 `/src/utils/` 中创建可复用工具函数

## Rules / 规则
1. **Always** use `<script setup lang="uts">`  
2. **Never** use `data()`, `methods`, or `this` (Vue 2 syntax)  
3. Define **explicit interfaces** for props and return types  
4. Use `ref<T>()`, `computed(() => ...)`, `watch(...)` appropriately  
5. Extract complex logic into separate `.uts` files under `/src/utils/`

1. **必须始终**使用 `<script setup lang="uts">`  
2. **禁止**使用 `data()`、`methods` 或 `this`（Vue 2 语法）  
3. 为 props 和返回值定义**显式接口**  
4. 合理使用 `ref<T>()`、`computed(() => ...)`、`watch(...)`  
5. 将复杂逻辑提取到 `/src/utils/` 下的独立 `.uts` 文件中

## Example Snippet / 示例片段
```vue
<script setup lang="uts">
interface Props {
  userId: string
  showAvatar?: boolean
}
const props = defineProps<Props>()

const userStore = useUserStore()
const displayName = computed(() => userStore.getUser(props.userId)?.name ?? 'Anonymous')
</script>
```

## Resources / 资源

- [Composition API Cheatsheet](https://www.qianwen.com/chat/resources/composition-api-cheatsheet.uts.md)
- [Standard Component Template](https://www.qianwen.com/chat/resources/component-template.vue)

## Validation Script / 验证脚本

To check UTS syntax compliance, run:
运行以下命令验证 UTS 语法合规性：

```bash
python scripts/validate-uts-syntax.py your-component.vue
---

### 📜 `scripts/validate-uts-syntax.py`
```python
#!/usr/bin/env python3
"""
Validates that a .vue file uses <script setup lang="uts"> and avoids Vue 2 patterns.
"""
import sys
import re

def check_uts_compliance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check script tag
    if not re.search(r'<script\s+setup\s+lang=["\']uts["\']>', content):
        print("❌ ERROR: Missing <script setup lang=\"uts\">")
        return False

    # Ban Vue 2 patterns
    banned_patterns = [r'\bdata\s*\(\s*\)', r'\bmethods\s*:', r'\bthis\.']
    for pattern in banned_patterns:
        if re.search(pattern, content):
            print(f"❌ ERROR: Vue 2 pattern detected: {pattern}")
            return False

    print("✅ UTS & Composition API compliant!")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate-uts-syntax.py <file.vue>")
        sys.exit(1)
    check_uts_compliance(sys.argv[1])
```

---

### 📚 `resources/composition-api-cheatsheet.uts.md`

> （此处为简明速查表，列出常用 API 用法，略）

---

### 🧱 `resources/component-template.vue`

```vue
<template>
  <!-- Your template -->
</template>

<script setup lang="uts">
// Strictly UTS + Composition API
</script>

<style scoped lang="scss">
/* SCSS with rpx */
</style>
```

---

## ✅ Skill 2: Brutalist Hand-Drawn UI/UX Implementation

### 粗野主义手绘极简 UI/UX 实现

### 📁 目录结构

```
brutalist-handdrawn-ui/
├── SKILL.md
├── scripts/
│   └── generate-handdrawn-icon.js
└── resources/
    ├── style-guide.scss
    ├── handdrawn-icons.svg
    └── ui-patterns.md
```

---

### 📄 `SKILL.md`

```markdown
---
name: brutalist-handdrawn-ui
description: Implements UI components in UniAppX using Brutalist + Hand-drawn design language: thick black borders, irregular hand-drawn lines, bold color blocks, doodles, ample whitespace, and brand-color accents — all built with SCSS/rpx in HBuilderX.
---

# Brutalist Hand-Drawn UI/UX Implementation  
## 粗野主义手绘极简 UI/UX 实现

Translates the **Brutalist + Hand-drawn aesthetic** (inspired by MotherDuck/Claude) into functional, responsive UniAppX components using SCSS, rpx, and custom hand-drawn assets.

将 **粗野主义 + 手绘美学**（受 MotherDuck/Claude 启发）转化为功能完整、响应式的 UniAppX 组件，使用 SCSS、rpx 和自定义手绘素材实现。

## Design Principles / 设计原则
- **Thick black borders** (`border: 4rpx solid #000`)  
- **Irregular shapes**: use `clip-path` or SVG masks for "hand-cut" edges  
- **Bold color blocks**: primary palette from `var(--uni-color-primary)` + high-contrast accents  
- **Hand-drawn icons/doodles**: embedded as inline SVG or base64  
- **Ample whitespace**: generous padding/margin in rpx  
- **Typography**: clean, sans-serif, left-aligned, no decorative fonts  

- **粗黑边框**（`border: 4rpx solid #000`）  
- **不规则形状**：使用 `clip-path` 或 SVG 遮罩模拟“手撕”边缘  
- **大胆色块**：主色来自 `var(--uni-color-primary)` + 高对比点缀色  
- **手绘图标/涂鸦**：以内联 SVG 或 base64 嵌入  
- **充足留白**：使用 rpx 设置宽松的内/外边距  
- **排版**：简洁无衬线字体，左对齐，无装饰性字体

## When to Use / 使用时机
- Creating buttons, cards, input fields, modals  
- Designing landing pages or feature modules (e.g., “找搭子”, “拼饭”)  
- Implementing custom icons or decorative elements  

- 创建按钮、卡片、输入框、弹窗  
- 设计落地页或功能模块（如“找搭子”、“拼饭”）  
- 实现自定义图标或装饰元素

## SCSS Best Practices / SCSS 最佳实践
```scss
.brutalist-card {
  border: 4rpx solid #000;
  background: white;
  padding: 32rpx;
  margin: 24rpx 0;
  // Simulate hand-drawn wobble
  clip-path: polygon(
    2% 0%, 98% 1%, 100% 98%, 1% 100%
  );
  box-shadow: 8rpx 8rpx 0 var(--uni-color-primary);
}
```

## Resources / 资源

- [Full Style Guide](https://www.qianwen.com/chat/resources/style-guide.scss)
- [Hand-drawn Icon Set](https://www.qianwen.com/chat/resources/handdrawn-icons.svg)
- [UI Pattern Examples](https://www.qianwen.com/chat/resources/ui-patterns.md)

## Generate Icons / 生成图标

Use the script to convert simple shapes into hand-drawn SVG:
使用脚本将简单图形转为手绘风格 SVG：

```bash
node scripts/generate-handdrawn-icon.js --type=button --output=icon-button.svg
---

### 🎨 `scripts/generate-handdrawn-icon.js`
```javascript
// Simplified version: adds wobble to paths
import fs from 'fs';
import { random } from 'lodash';

function addWobble(pathData, intensity = 2) {
  return pathData.replace(/(\d+\.?\d*)/g, (match) => {
    const num = parseFloat(match);
    return (num + (Math.random() - 0.5) * intensity).toFixed(1);
  });
}

// Usage example: generate a wobbly rectangle
const rectPath = "M10 10 H90 V90 H10 Z";
const wobbly = addWobble(rectPath);
fs.writeFileSync('handdrawn-rect.svg', `<svg viewBox="0 0 100 100"><path d="${wobbly}" stroke="black" fill="none"/></svg>`);
```

---

### 🎨 `resources/style-guide.scss`

```scss
// Brutalist Hand-drawn SCSS Variables & Mixins
$border-thickness: 4rpx;
$primary-accent: var(--uni-color-primary);

@mixin handdrawn-border() {
  border: $border-thickness solid #000;
  clip-path: polygon(
    #{random(1, 3)}% #{random(0, 2)}%,
    #{100 - random(1, 3)}% #{random(0, 2)}%,
    #{100 - random(1, 3)}% #{100 - random(1, 3)}%,
    #{random(1, 3)}% #{100 - random(1, 3)}%
  );
}
```

---

## ✅ 总结

这两个 Skill 完全符合 Claude Code 的 **Agent Skills 规范**：

- 每个 Skill 是一个独立目录
- 包含必需的 `SKILL.md`（YAML + Markdown）
- 提供可选但实用的 `scripts/` 和 `resources/`
- 描述清晰、触发条件明确、用途专注
- 支持团队共享（可放入 `.claude/skills/`）

您可以直接将这两个目录放入项目或个人 Skill 路径中，`uniappx-fullstack-expert` Subagent 即可在需要时自动调用它们，确保代码质量与设计一致性。
