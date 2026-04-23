以下是根据要求优化后的简洁版 README。内容保留了中英双语结构，风格与 macOS 原版的介绍相近，并突出了 Windows 移植版的技术栈差异。

---

# BugPet 🐱

> A lightweight Windows desktop pet that tracks your coding presence, grows with you, and adds playful companionship to your dev life.  
> 一款轻量的 Windows 桌面宠物，追踪编码状态、陪伴成长、带来好玩的生命反馈。

[![Windows](https://img.shields.io/badge/Windows-10/11-0078D4?style=flat-square)](https://www.microsoft.com/windows)  
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC107?style=flat-square)](https://tauri.app)  
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square)](https://vuejs.org)  
[![Rust](https://img.shields.io/badge/Rust-1.94-DE8B4E?style=flat-square)](https://www.rust-lang.org)  
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📥 下载

> 安装包及后续发布版本请访问：
> **https://github.com/Lumjiel/BugPet/releases**
> *（macOS 原版官网：[bp.eiddie.top](https://bp.eiddie.top)）*

---

## 📖 中文说明

### 项目简介

BugPet 最初是 macOS 原生桌宠，本项目是其 **Windows 移植版**，采用现代化跨平台技术栈重写：

- **Tauri** – 轻量桌面框架  
- **Vue 3 + TypeScript** – 响应式前端  
- **Rust** – 高性能系统交互  

在保留原版陪伴感与成长反馈的同时，带来 **极低资源占用** 与 Windows 10/11 原生体验。

### 当前功能

- 🪟 透明悬浮宠物窗口，始终置顶  
- 🖱️ 左键拖拽移动，右键呼出控制面板  
- 🔍 自动识别前台 IDE / 编辑器，追踪编码专注状态  
- 📈 经验值（XP）与等级成长（Lv.1 → Lv.3）  
- 💬 状态对话气泡 + 悬停交互  
- 📊 今日 / 本月 / 总计编码时长 & 贡献热力图  
- ✅ 简易待办清单（Todos）  
- 🐾 四种可选宠物（BugCat、TRAE、Codex、Claude Code）  
- 🌗 深色 / 浅色 / 跟随系统主题  
- 🌐 中 / English 语言切换  
- 🎯 显示桌面（Win + D）专属语料彩蛋  

### 运行项目

在项目根目录执行：

```bash
npm install
npm run tauri dev
```

仅编译检查（不启动应用窗口）：

```bash
npm run tauri build
```

### 欢迎参与贡献

项目的趣味性和完成度离不开每一个贡献者，欢迎任何形式的参与：

- 🐞 反馈 Bug 与使用问题  
- ✨ 提新功能想法或交互优化方案  
- 🎨 设计或改进动画 / UI  
- 🧪 完善数据统计与 Windows 系统兼容性  
- 📦 帮助维护发布版本  

欢迎提交 [Issue](https://github.com/Lumjiel/BugPet/issues) 与 [Pull Request](https://github.com/Lumjiel/BugPet/pulls)。

### 未来路线图

- [ ] 直接接入 IDE 活动日志检测  
- [ ] 更完整的历史统计与周报  
- [ ] 自定义宠物资源导入  
- [ ] 成就系统  
- [ ] 宠物融合 / 进化机制  
- [ ] 更丰富的情景动画与语音气泡  

### 许可证

本项目基于 **MIT License** 开源，详情见 [LICENSE](LICENSE) 文件。

---

## 📘 English

### Overview

BugPet was originally a native macOS companion app. This is the **Windows port**, rebuilt with a modern stack:

- **Tauri** – lean desktop runtime  
- **Vue 3 + TypeScript** – reactive frontend  
- **Rust** – fast, safe system interactions  

It preserves the original feeling of growth and company while delivering **minimal resource usage** on Windows 10/11.

### Features

- 🪟 Transparent always-on‑top pet window  
- 🖱️ Left-drag to move, right-click for control panel  
- 🔍 Detects foreground IDE / editor activity to track coding focus  
- 📈 XP and level system (Lv.1 → Lv.3)  
- 💬 Context‑aware speech bubbles & hover interactions  
- 📊 Daily / monthly / total coding time + contribution heatmap  
- ✅ Simple todo list  
- 🐾 Four selectable pets (BugCat, TRAE, Codex, Claude Code)  
- 🌗 Light / dark / system theme support  
- 🌐 Chinese / English language toggle  
- 🎯 Easter‑egg messages when pressing `Win + D` (Show Desktop)  

### Run

From the project root:

```bash
npm install
npm run tauri dev
```

Build only:

```bash
npm run tauri build
```

### Contribute

This project grows with the community. Ways to help:

- 🐞 Bug reports and debugging  
- ✨ Feature requests and UX ideas  
- 🎨 Polish animations or UI details  
- 🧪 Improve stats accuracy and Windows integration  
- 📦 Help with release packaging  

Feel free to open an [Issue](https://github.com/Lumjiel/BugPet/issues) or [Pull Request](https://github.com/Lumjiel/BugPet/pulls).

### Roadmap

- [ ] Direct log detection from IDEs  
- [ ] Advanced historical stats & weekly summaries  
- [ ] Custom pet import  
- [ ] Achievement system  
- [ ] Pet fusion / evolution mechanics  
- [ ] More expressive animations & dynamic dialogues  

### License

This project is open source under the **MIT License**. See [LICENSE](LICENSE) for details.

---

> *macOS 原版设计：[ChenXin360/BugPet](https://github.com/ChenXin360/BugPet)*
> *Windows 移植版：基于 Tauri + Vue + Rust*