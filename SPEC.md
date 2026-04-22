# BugPet 功能需求文档

## 项目概述

BugPet 是一个跨平台桌宠项目，追踪用户编码状态、提供成长反馈和陪伴体验。

---

## 1. UI 布局

### 1.1 窗口配置

| 属性 | 值 |
|------|-----|
| 宽度 | 220px |
| 高度 | 252px |
| 透明背景 | true |
| 无边框 | true |
| 置顶 | true |
| 隐藏任务栏 | true |
| 可拖拽 | true |

### 1.2 组件布局坐标

```
┌─────────────────────────────────┐ y:0
│      状态卡片 (156×24)           │ y:动态 (气泡上方)
│      ┌───────────────────┐      │
│      │    气泡 (182×76)   │      │ y:动态 (宠物上方 8px)
│      └───────────────────┘      │
│                                 │
│          ┌─────┐               │ y:44
│          │ 宠物 │ (76×76)    │ 居中, 可缩放
└─────────────────────────────────┘ y:252
```

| 组件 | X | Y | 宽度 | 高度 |
|------|---|---|------|------|
| 气泡 | 18 | 动态 | 182 | 76 |
| 宠物 | 72 | 44 | 76 | 76 |
| 状态卡片 | 动态居中 | 动态 | 156 | 24 |

**动态布局规则**:
- 气泡: `宠物顶部 - 8px`
- 状态卡片: `气泡顶部 - 6px`
- 最小气泡 Y: 56

### 1.3 组件层级 (z-index)

1. 气泡 (z: 1)
2. 状态卡片 (z: 2)
3. 宠物 (z: 5)

---

## 2. 宠物系统

### 2.1 宠物种类 (4种)

| ID | 显示名称 | Emoji |
|----|---------|-------|
| bugcat | BugCat | 🐱 |
| trae | TRAE SOLO | 🤖 |
| codex | Codex | 📖 |
| claudecode | Claude Code | 🤡 |

### 2.2 等级系统

| 等级 | XP 门槛 | XP 公式 |
|------|---------|---------|
| Lv.1 | 0 | - |
| Lv.2 | 600 | 专注60秒 = 1 XP |
| Lv.3 | 1800 | 混乱240秒 = 1 XP |

**最大 XP**: 1800

### 2.3 宠物尺寸缩放

| 尺寸 | 缩放比例 |
|------|---------|
| 小 | 0.88 |
| 中 (默认) | 1.0 |
| 大 | 1.18 |

---

## 3. 状态系统

### 3.1 四种状态

| 状态 | 触发条件 | 动画名称 | 动画时长 |
|------|---------|---------|---------|
| `idle` | 空闲 ≥ 60秒 | idle-bob | 3s 上下漂浮 |
| `watching` | 非编码应用 | watching-look | 2s 左看右看 |
| `focused` | 编码应用 + 切换 < 8次 | focused-bounce | 0.6s 跳动 |
| `chaotic` | 切换 ≥ 8次 | chaotic-shake | 0.3s 疯狂抖动 |

### 3.2 状态切换逻辑

```
if idleSeconds >= 60:
    -> idle
else if not isCodingApp:
    -> watching
else if switchCount >= 8:
    -> chaotic
else:
    -> focused
```

---

## 4. 气泡对话系统

### 4.1 显示条件

- 状态变化时立即显示
- 悬停宠物时显示
- 冷却时间后重新显示

### 4.2 冷却时间

| 状态 | 冷却时间 |
|------|---------|
| focused | 65秒 |
| idle | 100秒 |
| chaotic | 45秒 |
| watching | 75秒 |

### 4.3 显示时长

- 默认: 5秒
- 升级提示: 5秒
- 欢迎语: 首次显示

### 4.4 气泡样式

```css
宽度: 182px
最小高度: 76px
最大高度: 152px
背景: rgba(255, 255, 255, 0.92)
圆角: 18px
阴影: 0 -2px 10px rgba(0, 0, 0, 0.2)
内边距: 14px
字体大小: 12px
字体粗细: 500
文字颜色: #141826
行高: 1.4
```

### 4.5 气泡尾巴

```css
宽度: 0
高度: 0
左边框: 9px transparent
右边框: 9px transparent
上边框: 14px solid rgba(255, 255, 255, 0.92)
位置: 居中, bottom: -10px
```

---

## 5. 控制面板 (右键菜单)

### 5.1 打开方式

- 右键点击宠物

### 5.2 面板样式

```css
宽度: 270px
高度: 340px
圆角: 18px
背景 (亮色): rgba(250, 248, 243, 0.98)
背景 (暗色): rgba(30, 30, 33, 0.98)
阴影: 0 8px 32px rgba(0, 0, 0, 0.2)
```

### 5.3 页面结构 (3页翻页)

#### Page 1: 概览 (Overview)

**当前应用卡片**
- 显示当前前台应用名称
- 空白时显示 "-"

**编码统计卡片**
| 指标 | 标签 |
|------|------|
| 今日编码 | Today |
| 本月编码 | Current Month |
| 总编码时间 | Total |

**年度贡献热力图**
- GitHub 风格
- 颜色等级: 5级 (空 → 很低 → 低 → 中 → 高 → 很高)
- 可切换年份
- 悬停显示日期和分钟数

#### Page 2: 待办 (Todo)

**输入区域**
- 输入框 + 添加按钮
- 回车添加

**待办列表**
- 勾选框 + 标题
- 点击勾选完成 (带冒号动画)
- 支持删除

**空状态**: "No todos yet"

#### Page 3: 宠物 (Pet)

**宠物选择列表**
- 4个宠物按钮
- 每个显示: Emoji + 名称 + 等级标签

**等级/XP 卡片**
```
┌─────────────────────┐
│ Level 2             │
│ ████████░░░░ 67%   │
│ 400 / 600 XP        │
└─────────────────────┘
```

**升级/降级按钮** (DEBUG 模式)
- Upgrade
- Downgrade

**副宠物槽位**
- Lv.3 解锁
- 显示第二个宠物

### 5.4 主题支持

| 主题 | 描述 |
|------|------|
| system | 跟随系统 |
| light | 亮色 |
| dark | 暗色 |

---

## 6. 交互

### 6.1 鼠标交互

| 交互 | 触发区域 | 行为 |
|------|---------|------|
| 左键拖动 | 宠物 | 移动窗口 + 宠物显示恐惧表情 |
| 右键点击 | 宠物 | 打开控制面板 |
| 鼠标悬停 | 宠物 | 显示气泡 + 标记悬停状态 |

### 6.2 拖动时的宠物表情

- BugCat Lv.1-2: 显示恐惧静态图
- 其他宠物/等级: 无变化

---

## 7. 编码应用白名单

### 7.1 预设应用

| 名称 | Bundle ID |
|------|----------|
| Xcode | com.apple.dt.Xcode |
| Visual Studio Code | com.microsoft.VSCode |
| Cursor | - |
| TRAE | - |
| Codex | - |
| Zed | - |
| Android Studio | - |
| IntelliJ IDEA | - |
| WebStorm | - |
| Sublime Text | - |
| Terminal | com.apple.Terminal |
| iTerm2 | com.googlecode.iterm2 |
| Ghostty | - |
| Warp | - |
| WezTerm | - |
| Alacritty | - |
| Kitty | - |
| Hyper | - |

### 7.2 自定义应用

- 支持添加自定义白名单应用
- 支持删除

---

## 8. 数据存储

### 8.1 UserDefaults Keys

| Key | 类型 | 描述 |
|-----|------|------|
| language | String | zh/en |
| selected-pet | String | 当前宠物 ID |
| panel-theme | String | system/light/dark |
| show-status-bar | Bool | 是否显示状态条 |
| pet-display-scale | Double | 缩放比例 |
| todo-items | JSON | 待办列表 |
| selected-whitelist-ids | JSON | 选中的白名单 |
| custom-whitelist-apps | JSON | 自定义白名单 |

### 8.2 进度存储

```json
{
  "xp": 600,
  "level": 2,
  "focusedMsCarry": 0,
  "chaoticMsCarry": 0
}
```

---

## 9. 动画规格

### 9.1 宠物动画 (CSS)

```css
/* Idle - 上下漂浮 */
@keyframes idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
/* duration: 3s, ease-in-out, infinite */

/* Watching - 左看 */
@keyframes watching-look {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-3px); }
}
/* duration: 2s, ease-in-out, infinite */

/* Focused - 跳动 */
@keyframes focused-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
/* duration: 0.6s, ease-in-out, infinite */

/* Chaotic - 抖动 */
@keyframes chaotic-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-2px) rotate(-3deg); }
  75% { transform: translateX(2px) rotate(3deg); }
}
/* duration: 0.3s, ease-in-out, infinite */
```

### 9.2 气泡动画

```css
/* 淡入淡出 */
.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.8);
}
```

### 9.3 状态卡片

**内容格式**: `状态 · 工具/应用`

**示例**:
- `专注 · VS Code`
- `围观 · Chrome`
- `空闲 · Finder`
- `混乱 · Terminal`

**显示条件**: 气泡可见时

### 9.4 编码工具检测 (CodingToolKind)

| 工具 | 检测关键词 |
|------|-----------|
| TRAE | "trae" |
| Codex | "codex" |
| Claude Code | "claudecode" |
| Xcode | "xcode" |
| VS Code | "vscode", "vscodium" |
| Cursor | "cursor" |
| other | - |

### 9.5 气泡内容消息

**升级消息**:
- `levelUp.bugcat`: "升级了! Lv.\(level)" (zh/en)
- `levelUp.trae`: "TRAE upgraded to Lv.\(level)!" (zh/en)
- 其他宠物类似

**状态消息** (按语言区分):
- focused: "专心 coding~" / "Stay focused!"
- watching: "在围观什么呢" / "Watching..."
- idle: "休息一下?" / "Taking a break?"
- chaotic: "好忙啊!" / "So busy!"

---

## 10. 控制面板子系统

### 10.1 面板页面 (3页)

| 页码 | 名称 | 内容 |
|------|------|------|
| 1 | Overview | 当前应用、编码统计、热力图 |
| 2 | Todo | 待办列表 |
| 3 | Pet | 宠物选择、等级/XP、副宠物槽位 |

### 10.2 副宠物槽位 (Fusion Slot)

- 解锁条件: 主宠物达到 Lv.3
- 显示: 两个小圆点 (11×11px)
- 状态: 空心=未解锁，实心=已解锁

### 10.3 白名单编辑器 (WhitelistEditor)

**功能**:
- 列表显示所有预设+自定义白名单应用
- 勾选启用/禁用
- 添加当前应用
- 从磁盘添加 .app
- 删除自定义应用

**存储 Key**: `bugpet.native.whitelist.v1`

### 10.4 开发者面板 (DeveloperPanel)

**内容**:
- 开发者: Eiddie
- 反馈邮箱: 可复制
- GitHub 仓库: 可打开

### 10.5 检查更新

- 打开 GitHub Releases 页面
- URL: `https://github.com/eiddiedev/BugPet/releases`

---

## 11. 数据存储

### 11.1 Storage Keys

| Key | 类型 | 描述 |
|-----|------|------|
| `bugpet.native.progress.v1` | JSON | 主宠物进度 |
| `bugpet.native.progress.secondary.v1` | JSON | 副宠物进度 |
| `bugpet.native.coding-stats.v1` | JSON | 编码统计 |
| `bugpet.native.whitelist.v1` | JSON | 白名单 |
| `bugpet.native.todos.v1` | JSON | 待办列表 |
| `language` | String | zh/en |
| `selected-pet` | String | 当前宠物 ID |
| `panel-theme` | String | system/light/dark |
| `shows-status-bar` | Bool | 显示状态条 |
| `pet-display-scale` | Double | 缩放 (0.82-2.0) |
| `selected-whitelist-ids` | JSON | 选中的白名单 ID |

### 11.2 PetProgress 结构

```json
{
  "xp": 600,
  "level": 2,
  "focusedMsCarry": 0,
  "chaoticMsCarry": 0
}
```

### 11.3 CodingStats 结构

```json
{
  "days": {
    "2024-01-15": {
      "focusedSeconds": 3600,
      "codingSeconds": 7200
    }
  },
  "totalCodingSeconds": 86400
}
```

---

## 12. 多语言支持

### 12.1 支持语言

- 中文 (zh)
- 英文 (en)

### 12.2 自动检测

- 跟随系统语言设置

---

## 13. 热力图 (Contribution Heatmap)

### 13.1 颜色等级 (5级)

| 等级 | 分钟数 | 颜色 (亮) | 颜色 (暗) |
|------|--------|----------|----------|
| 空 | 0 | #EBEDF0 | #161B22 |
| 很低 | 1-30 | #9BE9A5 | #0E4429 |
| 低 | 31-60 | #40C463 | #006D32 |
| 中 | 61-120 | #30A14E | #26A641 |
| 高 | 121+ | #216E39 | #39D353 |

### 13.2 悬停提示

- 显示日期和专注分钟数
- 格式: `MMM d, yyyy: ## min`

### 13.3 年份切换

- 支持查看不同年份的数据
- 当前年份高亮

---

## 14. 待实现功能清单

### P0 (阻塞)

- [x] 窗口拖动
- [x] 右键菜单
- [ ] 气泡显示
- [ ] 宠物状态动画
- [ ] 编码应用检测

### P1 (核心)

- [ ] 等级/XP 系统
- [ ] 宠物选择
- [ ] 多语言支持
- [ ] 主题切换

### P2 (增强)

- [ ] 待办功能
- [ ] 年度热力图
- [ ] 副宠物槽位
- [ ] 白名单编辑

### P3 (优化)

- [ ] 宠物尺寸缩放
- [ ] 状态卡片显示控制
- [ ] 欢迎语

---

## 15. 文件结构

```
bugpet/
├── src/
│   ├── App.vue                 # 主应用
│   ├── main.ts
│   ├── style.css
│   ├── components/
│   │   ├── Pet/
│   │   │   ├── PetSprite.vue   # 宠物精灵组件
│   │   │   └── SpeechBubble.vue # 气泡组件
│   │   └── Panel/
│   │       └── ControlPanel.vue # 控制面板
│   └── stores/                 # 状态管理 (待添加)
├── src-tauri/
│   ├── src/
│   │   └── lib.rs              # Rust 后端逻辑
│   └── tauri.conf.json
├── public/
│   └── pets/                   # 宠物图片
│       ├── bugcat-level{1,2,3}.{png,gif}
│       ├── trae-level{1,2,3}.{png,gif}
│       ├── codex-level{1,2,3}.{png,gif}
│       └── claudecode-level{1,2,3}.{png,gif}
└── package.json
```

---

## 16. 参考资料

- macOS 原项目: `_archive/macos/Sources/BugPetNative/`
- 原始 Swift 实现: `PetCoordinator.swift`, `PetStateEngine.swift`, `GrowthEngine.swift`, `ControlPanelViewController.swift`
