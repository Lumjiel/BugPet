# BugPet 🐱

一款基于 Tauri + Vue 3 构建的跨平台桌面宠物应用，追踪你的编码状态，与你共同成长。

![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC107?style=flat-square)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square)
![Rust](https://img.shields.io/badge/Rust-1.94.1-DE8B4E?style=flat-square)

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [开始使用](#开始使用)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [宠物系统](#宠物系统)
- [状态机制](#状态机制)
- [数据存储](#数据存储)
- [窗口配置](#窗口配置)
- [构建发布](#构建发布)
- [常见问题](#常见问题)

---

## 🎯 项目简介

BugPet 源自 [macOS 原版](https://github.com/Lumjiel/BugPet)，经过重构后支持 Windows 平台运行。作为一款桌宠应用，BugPet 不仅提供陪伴体验，还能智能识别你的编码状态，通过可爱的宠物形象实时反馈你的工作模式。

### 核心价值

| 价值 | 说明 |
|------|------|
| **专注力追踪** | 自动识别 VS Code、IntelliJ IDEA 等主流 IDE，统计你的编码时长 |
| **成长可视化** | XP 经验值与等级系统，让编码成果看得见 |
| **轻量级运行** | 基于 Tauri 框架，资源占用极低，不影响开发性能 |
| **跨平台支持** | 从 macOS 到 Windows，一次开发多处运行 |

---

## ✨ 功能特性

### 🖥️ 桌面交互

| 功能 | 描述 |
|------|------|
| **透明悬浮窗口** | 220×252 像素透明窗口，始终置顶显示 |
| **智能拖拽** | 左键拖拽移动窗口，宠物会显示不同反应 |
| **右键菜单** | 右键点击打开控制面板 |
| **悬停交互** | 鼠标悬停显示对话气泡 |
| **任务栏隐藏** | 可选择隐藏任务栏图标，保持桌面整洁 |

### 🐾 宠物系统

| 功能 | 描述 |
|------|------|
| **四种宠物** | BugCat（猫咪）、TRAE（机器人）、Codex（书本）、Claude Code（小丑） |
| **三级等级** | Lv.1 → Lv.2（600 XP）→ Lv.3（1800 XP） |
| **状态动画** | 每种状态对应独特动画效果 |
| **恐惧表情** | 拖拽时 BugCat 会显示恐惧表情 |
| **副宠物槽位** | Lv.3 解锁，可同时显示两只宠物 |

### 📊 编码追踪

| 功能 | 描述 |
|------|------|
| **应用识别** | 自动识别 15+ 主流 IDE 和代码编辑器 |
| **专注统计** | 区分专注编码与频繁切换的混乱状态 |
| **热力图** | GitHub 风格的年度贡献热力图 |
| **今日/本月/总计时长** | 多维度编码时长统计 |

### 💬 对话气泡

| 功能 | 描述 |
|------|------|
| **状态变化提示** | 宠物状态改变时自动显示 |
| **悬停显示** | 鼠标悬停宠物时显示 |
| **冷却机制** | 不同状态有不同的显示冷却时间 |
| **多语言支持** | 中英文双语对话 |

### 📋 控制面板

| 功能 | 描述 |
|------|------|
| **概览页** | 当前应用、编码统计、热力图 |
| **待办页** | 添加、完成、删除待办事项 |
| **设置页** | 宠物选择、等级管理、主题切换 |
| **多主题** | 支持浅色、深色、系统主题 |

---

## 🏗️ 技术架构

### 技术栈概览

```
┌─────────────────────────────────────────────────────────┐
│                    前端层 (Vue 3 + TypeScript)           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │   UI    │  │  状态    │  │  动画   │  │  样式    │  │
│  │ 组件    │  │  管理    │  │  系统   │  │  Tailwind│  │
│  └─────────┘  └──────────┘  └────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────┤
│                    通信层 (Tauri IPC)                   │
├─────────────────────────────────────────────────────────┤
│                    后端层 (Rust)                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  Windows    │  │   文件       │  │   系统        │ │
│  │  API        │  │   存储       │  │   监控        │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心技术对比

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Vue 3 | ^3.5.13 | 响应式 UI，组件化开发，Composition API |
| **类型系统** | TypeScript | ~5.6.2 | 类型安全，提升代码质量 |
| **样式框架** | Tailwind CSS | ^4.2.2 | 原子化 CSS，快速样式开发 |
| **构建工具** | Vite | ^6.0.3 | 快速开发服务器，热模块替换 |
| **桌面框架** | Tauri | ^2 | 轻量级，Rust 后端，原生窗口 |
| **后端语言** | Rust | 1.94.1 | 高性能，内存安全，跨平台 |
| **状态存储** | localStorage | - | 前端数据持久化 |
| **持久化插件** | tauri-plugin-store | ^2 | Rust 端数据存储 |

### 为什么选择 Tauri？

| 特性 | Tauri | Electron |
|------|-------|----------|
| 包体积 | 2-10 MB | 50-150 MB |
| 内存占用 | 10-30 MB | 100-300 MB |
| 启动速度 | < 100ms | 2-5s |
| 安全性 | Rust 原生 | Node.js 沙箱 |
| 定制性 | 高 | 中 |

---

## 🚀 开始使用

### 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18.0 | 前端开发环境 |
| Rust | ≥ 1.70 | Tauri 后端编译 |
| npm / pnpm | 最新版 | 包管理器 |

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/BugPet.git
cd BugPet

# 2. 安装前端依赖
npm install

# 3. 开发模式运行
npm run tauri dev
```

### 开发模式说明

运行 `npm run tauri dev` 后：

1. Vite 开发服务器启动（默认 `http://localhost:1420`）
2. Tauri 应用窗口打开
3. 修改前端代码会自动热更新
4. 修改 Rust 代码会自动重新编译

---

## 📁 项目结构

```
BugPet/
├── src/                          # Vue 前端源码
│   ├── App.vue                   # 主应用组件
│   ├── main.ts                   # 主入口文件
│   ├── panel.ts                  # 面板入口（控制面板渲染）
│   ├── style.css                 # 全局样式
│   ├── vite-env.d.ts             # Vite 类型声明
│   │
│   ├── assets/                   # 静态资源
│   │   └── vue.svg               # Vue Logo
│   │
│   └── components/               # Vue 组件
│       ├── Panel/                # 控制面板组件
│       │   ├── ControlPanel.vue  # 主面板（概览/待办/设置）
│       │   └── Heatmap.vue       # 贡献热力图组件
│       │
│       └── Pet/                  # 宠物组件
│           ├── PetSprite.vue     # 宠物精灵动画
│           └── SpeechBubble.vue  # 对话气泡组件
│
├── src-tauri/                    # Tauri/Rust 后端源码
│   ├── src/
│   │   ├── lib.rs                # 库入口，核心业务逻辑
│   │   └── main.rs               # 应用入口
│   │
│   ├── icons/                   # 应用图标
│   │   ├── icon.ico              # Windows 图标
│   │   ├── icon.icns             # macOS 图标
│   │   └── *.png                 # 各尺寸 PNG 图标
│   │
│   ├── capabilities/             # Tauri 权限配置
│   │   └── default.json          # 默认权限集
│   │
│   ├── Cargo.toml                # Rust 依赖配置
│   ├── tauri.conf.json           # Tauri 应用配置
│   └── build.rs                  # 构建脚本
│
├── public/                        # 公共静态资源
│   ├── pets/                     # 宠物图片资源
│   │   ├── bugcat-*.png/gif      # BugCat 动画帧
│   │   ├── trae-*.png/gif        # TRAE 动画帧
│   │   ├── codex-*.png/gif       # Codex 动画帧
│   │   └── claudecode-*.png/gif  # Claude Code 动画帧
│   │
│   ├── tauri.svg                 # Tauri Logo
│   └── vite.svg                  # Vite Logo
│
├── index.html                    # 主页面 HTML
├── panel.html                    # 面板页面 HTML
├── package.json                  # npm 依赖配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Node 类型配置
├── vite.config.ts                # Vite 构建配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
├── LOG.md                        # 开发日志
├── SPEC.md                       # 功能需求文档
└── README.md                     # 项目说明文档
```

---

## 🔧 核心模块

### 1. 主应用组件 (App.vue)

主应用组件是整个前端的核心，负责：

```typescript
// 状态管理
const petState = ref<PetState>('idle')           // 宠物状态
const selectedPet = ref<PetType>('bugcat')        // 当前宠物
const speechMessage = ref('')                     // 气泡消息
const panelVisible = ref(false)                   // 面板显示
const xp = ref(0)                                  // 经验值
const level = ref(1)                              // 当前等级

// 核心功能
- 定时获取前台活动应用
- 计算宠物状态（idle/watching/focused/chaotic）
- 管理 XP 经验和等级成长
- 处理宠物对话逻辑
- 响应鼠标交互事件
```

### 2. 宠物精灵组件 (PetSprite.vue)

宠物精灵负责宠物的显示和动画：

| 功能 | 说明 |
|------|------|
| **状态动画** | 根据宠物状态应用不同 CSS 类 |
| **GIF 播放** | chaotic 状态播放 GIF 动画 |
| **空闲动画** | idle-bob 上下漂浮效果 |
| **恐惧表情** | 拖拽时 BugCat 显示恐惧图 |
| **图片切换** | 根据状态和等级切换不同图片 |

### 3. 对话气泡组件 (SpeechBubble.vue)

对话气泡负责显示宠物的"心声"：

| 属性 | 说明 |
|------|------|
| `message` | 显示的文字内容 |
| `visible` | 是否显示 |
| `theme` | 主题（影响样式） |
| `language` | 语言（影响文案） |

### 4. 控制面板组件 (ControlPanel.vue)

控制面板是用户与宠物交互的主要界面：

```typescript
// 面板页面结构
const activeTab = ref<'overview' | 'todos' | 'pet'>('overview')

// Overview 页面
- 当前应用卡片
- 编码统计（今日/本月/总计时长）
- 年度贡献热力图

// Todos 页面
- 输入框 + 添加按钮
- 待办列表（支持完成/删除）
- 批量操作

// Pet 页面
- 宠物选择列表（4种宠物）
- 等级/XP 进度条
- 主题切换
- 语言切换
```

### 5. 热力图组件 (Heatmap.vue)

GitHub 风格的贡献热力图：

```typescript
interface ContributionDay {
  date: string           // YYYY-MM-DD
  focusedSeconds?: number // 专注秒数
}

// 颜色等级
const colorLevels = ['', '#9be9a8', '#40c463', '#30a14e', '#216e39']
// 分别对应：0分钟、0-30分钟、30-60分钟、60-120分钟、120+分钟
```

### 6. Rust 后端 (lib.rs)

Rust 后端负责与 Windows 系统交互：

| 功能 | 说明 |
|------|------|
| `get_foreground_app` | 获取前台应用名称和 Bundle ID |
| `get_idle_time` | 获取系统空闲时间 |
| `init_config` | 初始化配置 |

---

## 🐾 宠物系统

### 宠物种类

| ID | 名称 | 特点 |
|----|------|------|
| `bugcat` | BugCat 🐱 | 有恐惧表情，3种状态图 |
| `trae` | TRAE SOLO 🤖 | 机器人风格，混乱时 GIF |
| `codex` | Codex 📖 | 学术风格，对话较正式 |
| `claudecode` | Claude Code 🤡 | 小丑形象，逗趣风格 |

### 等级系统

| 等级 | XP 门槛 | 解锁内容 |
|------|---------|----------|
| Lv.1 | 0 XP | 基础宠物，静态图 |
| Lv.2 | 600 XP | 动画 GIF，恐惧表情 |
| Lv.3 | 1800 XP | 副宠物槽位，高级动画 |

### XP 获取规则

| 状态 | 转换比例 | 说明 |
|------|----------|------|
| `focused` | 60秒 = 1 XP | 专注编码状态 |
| `chaotic` | 240秒 = 1 XP | 频繁切换应用 |

---

## 🔄 状态机制

### 四种状态

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   空闲 ≥ 60秒  ──────────→  idle (空闲)                 │
│                                                         │
│   非编码应用  ──────────→  watching (围观)              │
│                                                         │
│   编码应用 + 切换 < 8次 →  focused (专注)                │
│                                                         │
│   切换 ≥ 8次  ──────────→  chaotic (混乱)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 状态动画

| 状态 | 动画类 | 动画时长 | 效果 |
|------|--------|----------|------|
| `idle` | `idle-bob` | 3s | 上下漂浮 |
| `watching` | `watching-look` | 2s | 左看右看 |
| `focused` | `focused-bounce` | 0.6s | 轻微跳动 |
| `chaotic` | `chaotic-shake` | 0.3s | 疯狂抖动 |

### 状态消息

| 状态 | 中文消息 | 英文消息 |
|------|----------|----------|
| idle | 在想什么呢~、休息一下也好... | What are you thinking?、Taking a break... |
| watching | 发现你了！、你在看什么呀？... | I found you!、What are you looking at?... |
| focused | 加油写代码！、很棒哦~... | Keep coding!、You're doing great~... |
| chaotic | 好忙啊！、切换太快了！... | So busy!、Switching too fast!... |

### 对话冷却时间

| 状态 | 冷却时间 |
|------|----------|
| focused | 65秒 |
| idle | 100秒 |
| chaotic | 45秒 |
| watching | 75秒 |

---

## 💾 数据存储

### localStorage Keys

| Key | 类型 | 说明 |
|-----|------|------|
| `bugpet_xp` | string (number) | 累计经验值 |
| `bugpet_level` | string (number) | 当前等级 (1-3) |
| `bugpet_focused_ms` | string (number) | 专注毫秒数（未结算） |
| `bugpet_chaotic_ms` | string (number) | 混乱毫秒数（未结算） |
| `bugpet_contribution_days` | JSON string | 贡献天数数组 |
| `bugpet_today_seconds` | string (number) | 今日编码秒数 |
| `bugpet_total_seconds` | string (number) | 总编码秒数 |
| `bugpet_current_app` | string | 当前前台应用名称 |
| `bugpet_language` | string | 语言设置 (zh/en) |
| `bugpet_theme` | string | 主题设置 (light/dark/system) |
| `bugpet_pet` | string | 当前宠物 ID |
| `bugpet_todos` | JSON string | 待办事项数组 |

### ContributionDay 数据结构

```typescript
interface ContributionDay {
  date: string           // 格式: "YYYY-MM-DD"
  focusedSeconds?: number // 当日专注编码秒数
}
```

---

## 🖼️ 窗口配置

### 窗口属性

```json
{
  "width": 220,
  "height": 252,
  "resizable": false,
  "decorations": false,
  "transparent": true,
  "alwaysOnTop": true,
  "skipTaskbar": true,
  "dragDropEnabled": false
}
```

### 组件布局

```
┌─────────────────────────────────────┐ y: 0
│         状态卡片 (156×24)            │ y: 动态
│      ┌───────────────────┐         │
│      │    气泡 (182×76)   │         │ y: 动态 (宠物上方 8px)
│      └───────────────────┘         │
│                                     │
│           ┌─────┐                  │ y: 44
│           │ 宠物 │ (76×76)         │ 居中显示
│           └─────┘                  │
└─────────────────────────────────────┘ y: 252
```

### 组件层级 (z-index)

| 层级 | 组件 |
|------|------|
| z: 5 | 宠物 |
| z: 2 | 状态卡片 |
| z: 1 | 对话气泡 |

---

## 📦 构建发布

### 开发构建

```bash
npm run tauri dev
```

### 生产构建

```bash
npm run tauri build
```

构建完成后，安装包位于：

```
src-tauri/target/release/bundle/
├── nsis/*.exe      # Windows NSIS 安装包
├── msi/*.msi       # Windows MSI 安装包
└── dmg/*.dmg       # macOS DMG 安装包
```

### 应用配置

在 `src-tauri/tauri.conf.json` 中修改应用信息：

```json
{
  "productName": "BugPet",
  "version": "0.1.0",
  "identifier": "com.bugpet.app"
}
```

---

## ❓ 常见问题

### Q: 窗口无法拖动？

**A:** 确保在 `tauri.conf.json` 中启用了 `dragDropEnabled: false`，并通过自定义拖拽区域实现。

### Q: 宠物状态不更新？

**A:** 检查：
1. 是否有编码应用在前台运行
2. localStorage 是否正常
3. Rust 后端是否正常获取前台应用

### Q: 如何添加新的宠物？

**A:** 
1. 在 `public/pets/` 添加宠物图片
2. 在 `App.vue` 的 `petMessages` 添加对话文案
3. 在 `ControlPanel.vue` 的 `pets` 数组添加宠物配置

### Q: 如何自定义编码应用白名单？

**A:** 在 `App.vue` 的 `isCodingApp` 函数中添加应用标识：

```typescript
function isCodingApp(app: string): boolean {
  const codingApps = [
    'code', 'devenv', 'rider', 'idea', 
    'webstorm', 'pycharm', 'goland', 'clion',
    'androidstudio', 'sublime_text', 'atom',
    'notepad++', 'vim', 'emacs', 'cursor', 'trae',
    // 添加自定义应用
    'your-custom-app'
  ]
  return codingApps.some(codingApp => app.toLowerCase().includes(codingApp))
}
```

---

## 📄 License

本项目基于 MIT 协议开源。

## 🙏 致谢

- 原始 macOS 版本: [Lumjiel/BugPet](https://github.com/Lumjiel/BugPet)
- Tauri 框架: [tauri-apps/tauri](https://github.com/tauri-apps/tauri)
- Vue 框架: [vuejs/core](https://github.com/vuejs/core)
