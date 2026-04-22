# BugPet (Tauri Refactor)

基于 [macOS 原版](https://github.com/Lumjiel/BugPet) 使用 Tauri + Vue 3 重构的跨平台桌宠项目。

## 功能特性

- **透明悬浮宠物窗口** - 始终置顶显示，支持拖拽
- **编码时间追踪** - 识别 IDE 类应用（VS Code、Vim 等），统计专注编码时长
- **成长系统** - XP 经验值与等级系统
- **贡献热力图** - 展示近 4 个月的编码活动，支持横向滚动
- **TODO 面板** - 任务管理
- **多宠物支持** - BugCat、TRAE、Codex、Claude Code
- **中英双语** - 语言切换

## 技术栈

- **Tauri 2.x** - 跨平台桌面框架
- **Vue 3** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

## 开发

```bash
cd bugpet
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

## 项目结构

```
bugpet/
├── src/                    # Vue 前端源码
│   ├── components/
│   │   ├── Panel/          # 控制面板组件
│   │   │   ├── ControlPanel.vue   # 主面板
│   │   │   └── Heatmap.vue        # 贡献热力图
│   │   └── Pet/            # 宠物组件
│   │       ├── PetSprite.vue     # 宠物精灵动画
│   │       └── SpeechBubble.vue   # 气泡组件
│   └── App.vue             # 主应用
├── src-tauri/              # Tauri 后端源码
└── public/                 # 静态资源
```

## License

See [./_archive/macos/LICENSE](./_archive/macos/LICENSE)
