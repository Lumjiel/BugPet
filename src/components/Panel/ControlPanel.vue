<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Heatmap from './Heatmap.vue';

interface TodoItem {
  id: string;
  title: string;
  isDone: boolean;
}

interface ContributionDay {
  date: string;
  focusedSeconds?: number;
}

const language = ref<'zh' | 'en'>('zh');
const theme = ref<'light' | 'dark'>('dark');
const selectedPet = ref('bugcat');
const currentApp = ref('');
const xp = ref(0);
const level = ref(1);
const todos = ref<TodoItem[]>([]);
const todoInput = ref('');
const contributionDays = ref<ContributionDay[]>([]);
const editingId = ref<string | null>(null);
const editingText = ref('');
const showBatchActions = ref(false);

const doneTodos = computed(() => todos.value.filter(t => t.isDone));
const pendingTodos = computed(() => todos.value.filter(t => !t.isDone));
const hasDoneTodos = computed(() => doneTodos.value.length > 0);
const hasTodos = computed(() => todos.value.length > 0);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'changeLanguage', lang: 'zh' | 'en'): void;
  (e: 'changeTheme', theme: 'light' | 'dark'): void;
  (e: 'selectPet', pet: string): void;
  (e: 'addTodo'): void;
  (e: 'toggleTodo', id: string): void;
  (e: 'deleteTodo', id: string): void;
  (e: 'updateTodoInput', value: string): void;
}>();

const activeTab = ref<'overview' | 'todos' | 'pet'>('overview');

const pets = [
  { id: 'bugcat', name: 'BugCat', image: '/pets/bugcat-level1.png' },
  { id: 'trae', name: 'TRAE', image: '/pets/trae-level1.png' },
  { id: 'codex', name: 'Codex', image: '/pets/codex-level1.png' },
  { id: 'claudecode', name: 'Claude Code', image: '/pets/claudecode-level1.png' },
];

const xpProgress = computed(() => {
  const thresholds = [0, 600, 1800];
  const currentThreshold = thresholds[level.value - 1] || 0;
  const nextThreshold = thresholds[level.value] || 1800;
  const progress = ((xp.value - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
});

const totalMinutes = computed(() => {
  return contributionDays.value.reduce((sum, d) => sum + Math.floor((d.focusedSeconds || 0) / 60), 0);
});

const todayMinutes = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return Math.floor((contributionDays.value.find(d => d.date === today)?.focusedSeconds || 0) / 60);
});

const monthMinutes = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return contributionDays.value.reduce((sum, d) => {
    const [y, m] = d.date.split('-').map(Number);
    if (y === year && m === month) return sum + Math.floor((d.focusedSeconds || 0) / 60);
    return sum;
  }, 0);
});

const t = computed(() => ({
  overview: language.value === 'zh' ? '概览' : 'Overview',
  todos: language.value === 'zh' ? '待办' : 'Todos',
  pet: language.value === 'zh' ? '设置' : 'Settings',
  currentApp: language.value === 'zh' ? '当前应用' : 'Current App',
  level: language.value === 'zh' ? '等级' : 'Level',
  xp: language.value === 'zh' ? '经验值' : 'XP',
  today: language.value === 'zh' ? '今日' : 'Today',
  month: language.value === 'zh' ? '本月' : 'Month',
  total: language.value === 'zh' ? '总计' : 'Total',
  heatmap: language.value === 'zh' ? '贡献热力图' : 'Contribution',
  min: language.value === 'zh' ? '分钟' : 'min',
  newTodo: language.value === 'zh' ? '新待办...' : 'New todo...',
  emptyTodos: language.value === 'zh' ? '暂无待办事项' : 'No todos yet',
  theme: language.value === 'zh' ? '主题' : 'Theme',
  languageLabel: language.value === 'zh' ? '语言' : 'Language',
  selectPet: language.value === 'zh' ? '选择宠物' : 'Select Pet',
  less: language.value === 'zh' ? '少' : 'Less',
  more: language.value === 'zh' ? '多' : 'More',
  batchDelete: language.value === 'zh' ? '删除已完成' : 'Delete Done',
  clearAll: language.value === 'zh' ? '清空' : 'Clear All',
  batchActions: language.value === 'zh' ? '批量操作' : 'Batch',
  editingPlaceholder: language.value === 'zh' ? '输入待办内容...' : 'Enter todo...',
  cancel: language.value === 'zh' ? '取消' : 'Cancel',
  confirm: language.value === 'zh' ? '确认' : 'OK',
}));

const currentYear = new Date().getFullYear();

function close() {
  emit('close');
}

function changeLanguage(lang: 'zh' | 'en') {
  language.value = lang;
  localStorage.setItem('bugpet_language', lang);
}

function changeTheme(newTheme: 'light' | 'dark') {
  theme.value = newTheme;
  localStorage.setItem('bugpet_theme', newTheme);
}

function selectPet(pet: string) {
  selectedPet.value = pet;
  localStorage.setItem('bugpet_pet', pet);
  emit('selectPet', pet);
}

function addTodo() {
  const title = todoInput.value.trim();
  if (!title) return;
  todos.value.unshift({ id: Date.now().toString(), title, isDone: false });
  todoInput.value = '';
  saveTodos();
}

function toggleTodo(id: string) {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.isDone = !todo.isDone;
    saveTodos();
  }
}

function deleteTodo(id: string) {
  todos.value = todos.value.filter(t => t.id !== id);
  if (editingId.value === id) {
    editingId.value = null;
  }
  saveTodos();
}

function deleteDoneTodos() {
  todos.value = todos.value.filter(t => !t.isDone);
  saveTodos();
}

function clearAllTodos() {
  todos.value = [];
  saveTodos();
}

function startEdit(todo: TodoItem) {
  if (todo.isDone) return;
  editingId.value = todo.id;
  editingText.value = todo.title;
}

function confirmEdit(id: string) {
  const text = editingText.value.trim();
  if (text) {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      todo.title = text;
      saveTodos();
    }
  }
  editingId.value = null;
  editingText.value = '';
}

function cancelEdit() {
  editingId.value = null;
  editingText.value = '';
}

function saveTodos() {
  localStorage.setItem('bugpet_todos', JSON.stringify(todos.value));
}

function loadFromStorage() {
  language.value = (localStorage.getItem('bugpet_language') as 'zh' | 'en') || 'zh';
  theme.value = (localStorage.getItem('bugpet_theme') as 'light' | 'dark') || 'light';
  selectedPet.value = localStorage.getItem('bugpet_pet') || 'bugcat';
  currentApp.value = localStorage.getItem('bugpet_current_app') || '';

  const storedTodos = localStorage.getItem('bugpet_todos');
  if (storedTodos) {
    todos.value = JSON.parse(storedTodos);
  }

  const storedXp = localStorage.getItem('bugpet_xp');
  if (storedXp) {
    xp.value = parseInt(storedXp, 10);
    if (xp.value >= 1800) level.value = 3;
    else if (xp.value >= 600) level.value = 2;
    else level.value = 1;
  }

  const storedDays = localStorage.getItem('bugpet_contribution_days');
  if (storedDays) {
    contributionDays.value = JSON.parse(storedDays);
  }
}

onMounted(() => {
  loadFromStorage();

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'update') {
      currentApp.value = data.currentApp || '';
      xp.value = data.xp || 0;
      level.value = data.level || 1;
      contributionDays.value = data.contributionDays || [];
    }
  });

  if (window.opener) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'bugpet_panel_update') {
        loadFromStorage();
      }
    });
  }

  setInterval(() => {
    const storedXp = localStorage.getItem('bugpet_xp');
    const storedDays = localStorage.getItem('bugpet_contribution_days');
    const storedApp = localStorage.getItem('bugpet_current_app');
    if (storedApp) {
      currentApp.value = storedApp;
    }
    if (storedXp) {
      xp.value = parseInt(storedXp, 10);
      if (xp.value >= 1800) level.value = 3;
      else if (xp.value >= 600) level.value = 2;
      else level.value = 1;
    }
    if (storedDays) {
      contributionDays.value = JSON.parse(storedDays);
    }
  }, 2000);
});
</script>

<template>
  <div class="control-panel" :class="theme">
    <div class="panel-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        {{ t.overview }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'todos' }"
        @click="activeTab = 'todos'"
      >
        {{ t.todos }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pet' }"
        @click="activeTab = 'pet'"
      >
        {{ t.pet }}
      </button>
    </div>

    <div class="panel-content">
      <div v-if="activeTab === 'overview'" class="tab-page">
        <div class="panel-section">
          <div class="section-label">{{ t.currentApp }}</div>
          <div class="current-app">{{ currentApp || '-' }}</div>
        </div>

        <div class="panel-section">
          <div class="section-label">
            {{ t.level }} {{ level }}
            <span class="xp-label">({{ xp }} {{ t.xp }})</span>
          </div>
          <div class="xp-bar">
            <div class="xp-fill" :style="{ width: xpProgress + '%' }"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value-small">{{ todayMinutes }}</div>
            <div class="stat-label">{{ t.today }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value-small">{{ monthMinutes }}</div>
            <div class="stat-label">{{ t.month }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value-small">{{ totalMinutes }}</div>
            <div class="stat-label">{{ t.total }}</div>
          </div>
        </div>

        <div class="panel-section heatmap-section">
          <div class="section-label">{{ t.heatmap }}</div>
          <div class="heatmap-legend-wrapper">
            <div class="heatmap-legend">
              <span class="legend-label">{{ t.less }}</span>
              <div class="legend-cells">
                <div class="legend-cell" style="background-color: #ebedf0;"></div>
                <div class="legend-cell" style="background-color: #9be9a5;"></div>
                <div class="legend-cell" style="background-color: #40c463;"></div>
                <div class="legend-cell" style="background-color: #30a14e;"></div>
                <div class="legend-cell" style="background-color: #216e39;"></div>
              </div>
              <span class="legend-label">{{ t.more }}</span>
            </div>
          </div>
          <Heatmap
            :days="contributionDays"
            :year="currentYear"
            :theme="theme"
            :language="language"
            :scrollable="true"
          />
        </div>
      </div>

      <div v-if="activeTab === 'todos'" class="tab-page">
        <div class="todo-input-container">
          <input
            type="text"
            class="todo-input"
            :placeholder="t.newTodo"
            v-model="todoInput"
            @keyup.enter="addTodo"
          />
          <button class="todo-clear-btn" @click="clearAllTodos">
            {{ t.clearAll }}
          </button>
        </div>

        <div class="todo-list">
          <div v-if="todos.length === 0" class="todo-empty">
            {{ t.emptyTodos }}
          </div>
          <TransitionGroup name="todo" tag="div" class="todo-list-inner">
            <div
              v-for="todo in todos"
              :key="todo.id"
              class="todo-item"
              :class="{ done: todo.isDone, editing: editingId === todo.id }"
            >
              <input
                type="checkbox"
                :checked="todo.isDone"
                @change="toggleTodo(todo.id)"
              />
              <template v-if="editingId === todo.id">
                <input
                  type="text"
                  class="todo-edit-input"
                  v-model="editingText"
                  @keyup.enter="confirmEdit(todo.id)"
                  @keyup.escape="cancelEdit"
                  :placeholder="t.editingPlaceholder"
                />
                <button class="todo-confirm" @click="confirmEdit(todo.id)">✓</button>
                <button class="todo-cancel" @click="cancelEdit">×</button>
              </template>
              <template v-else>
                <span class="todo-text" @dblclick="startEdit(todo)">{{ todo.title }}</span>
                <button class="todo-delete" @click="deleteTodo(todo.id)">×</button>
              </template>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div v-if="activeTab === 'pet'" class="tab-page">
        <div class="panel-section">
          <div class="section-label">{{ t.theme }}</div>
          <div class="theme-selector">
            <button
              class="theme-btn"
              :class="{ active: theme === 'light' }"
              @click="changeTheme('light')"
            >
              ☀️
            </button>
            <button
              class="theme-btn"
              :class="{ active: theme === 'dark' }"
              @click="changeTheme('dark')"
            >
              🌙
            </button>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-label">{{ t.languageLabel }}</div>
          <div class="language-selector">
            <button
              class="lang-btn"
              :class="{ active: language === 'zh' }"
              @click="changeLanguage('zh')"
            >
              中文
            </button>
            <button
              class="lang-btn"
              :class="{ active: language === 'en' }"
              @click="changeLanguage('en')"
            >
              English
            </button>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-label">{{ t.selectPet }}</div>
          <div class="pet-selector">
            <button
              v-for="p in pets"
              :key="p.id"
              class="pet-btn"
              :class="{ active: selectedPet === p.id }"
              @click="selectPet(p.id)"
            >
              <img class="pet-image" :src="p.image" :alt="p.name" />
              <span class="pet-name">{{ p.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  width: 100%;            /* 占满窗口宽度 */
  height: 380px;           /* 固定高度 */
  overflow: hidden;
}

/* ===== 滚动条 ===== */
.control-panel::-webkit-scrollbar {
  width: 6px;
}

.control-panel::-webkit-scrollbar-track {
  background: transparent;
}

.control-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.dark .control-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.dark .control-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.dark .control-panel {
  background: rgba(30, 30, 30, 0.98);
}

/* ===== 顶部菜单栏 (概览/待办/宠物 + 关闭按钮) ===== */
.panel-tabs {
  display: flex;
  background: rgba(252, 249, 249, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.dark .panel-tabs {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: none;      /* 不平分宽度 */
  width: 70px;      /* 固定宽度 */
  padding: 5px 5px;   /* 菜单按钮内边距 */
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;      /* 菜单文字大小 */
  font-weight: 500;
  color: #e2873b;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #ff6633;
  border-bottom: 2px solid #ff6633;
}

.close-btn {
  width: 24px;          /* 关闭按钮宽度 */
  height: 24px;         /* 关闭按钮高度 */
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;      /* 关闭图标大小 */
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
  margin-left: auto;    /* 靠右 */
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #ff6633;
}

.dark .close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ff6633;
}

/* ===== 内容滚动区 ===== */
.panel-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgba(252, 249, 249, 0.98);
}

.dark .panel-content {
  background: rgba(30, 30, 30, 0.98);
}

.tab-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 12px 0;
  overflow: hidden;
  background: rgba(252, 249, 249, 0.98);
}

:deep(.dark) .tab-page,
.dark .tab-page {
  background: rgba(30, 30, 30, 0.98) !important;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 4px;
}

.section-label {
  font-size: 11px;       /* 等级标题大小 */
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

.xp-label {
  font-weight: normal;
  color: #aaa;
  font-size: 10px;       /* XP标签文字大小 */
}

.xp-bar {
  height: 6px;
  width: 200px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-left: 0;
}

.panel-section:has(.xp-bar) {
  padding-left: 4px;
}

.dark .xp-bar {
  background: rgba(255, 255, 255, 0.1);
}

.xp-fill {
  height: 100%;          /* XP填充高度占满进度条 */
  background: linear-gradient(90deg, #ff6633, #ff9966);
  border-radius: 3px;
  transition: width 0.3s;
}

/* ===== 概览页 - 今日/总计 ===== */
.stats-row {
  display: flex;
  gap: 4px;
  padding-left: 4px;
}

.stat-card {
  flex: none;
  width: 65px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 5px 3px;
  text-align: center;
  min-width: 0;
}

.dark .stat-card {
  background: rgba(255, 255, 255, 0.06);
}

.stat-value-small {
  font-size: 11px;
  font-weight: 600;
  color: #ff6633;
}

.stat-label {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}

/* ===== 热力图 ===== */
.heatmap-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.heatmap-legend-wrapper {
  margin-top: 4px;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-label {
  color: #666;
  font-size: 8px;
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.dark .legend-label {
  color: #8b949e;
}

/* ===== 概览页 - 当前应用 ===== */
.current-app {
  font-size: 13px;       /* 当前应用文字大小 */
  font-weight: 500;
  color: #333;
  padding: 4px 0;        /* 上下内边距 */
}

.dark .current-app {
  color: #f0f0f0;
}

/* ===== 概览页 - 热力图 ===== */
.heatmap-section {
  margin-top: 4px;        /* 热力图上边距 */
}

/* ===== 待办页 - 输入区 ===== */
.todo-input-container {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.todo-input {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.dark .todo-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
}

.todo-input:focus {
  outline: none;
  border-color: #ff6633;
}

.todo-add-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: #ff6633;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 9px;
  font-weight: bold;
  box-sizing: border-box;
}

/* ===== 待办页 - 列表 ===== */
.todo-list {
  flex: 1;                   /* 占满剩余空间 */
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.dark .todo-list {
  background: rgba(255, 255, 255, 0.05);
}

.todo-list-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-empty {
  text-align: center;
  padding: 16px;          /* 空状态内边距 */
  font-size: 11px;       /* 空状态文字大小 */
  color: #999;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px;       /* 待办项内边距 */
  background: rgba(0, 0, 0, 0.04);
  border-radius: 5px;
  font-size: 12px;        /* 待办文字大小 */
}

.dark .todo-item {
  background: rgba(255, 255, 255, 0.06);
}

.todo-item.done .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-item input[type="checkbox"] {
  width: 14px;            /* 复选框宽度 */
  height: 14px;          /* 复选框高度 */
  cursor: pointer;
}

.todo-text {
  flex: 1;
  word-break: break-word;
}

.dark .todo-text {
  color: #f0f0f0;
}

.todo-delete {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;       /* 删除按钮大小 */
  cursor: pointer;
  padding: 0 2px;
  opacity: 0.6;
}

.todo-delete:hover {
  opacity: 1;
  color: #ff6633;
}

.todo-batch-btn {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  font-size: 10px;
  cursor: pointer;
  color: #888;
  transition: all 0.2s;
  box-sizing: border-box;
  white-space: nowrap;
}

.todo-clear-btn {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid rgba(255, 102, 51, 0.3);
  border-radius: 8px;
  background: rgba(255, 102, 51, 0.1);
  color: #ff6633;
  cursor: pointer;
  font-size: 9px;
  font-weight: bold;
  box-sizing: border-box;
  white-space: nowrap;
}

.todo-clear-btn:hover {
  background: rgba(255, 102, 51, 0.2);
  border-color: #ff6633;
}

.dark .todo-batch-btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.todo-batch-btn:hover {
  border-color: #ff6633;
  color: #ff6633;
}

.todo-batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: rgba(255, 102, 51, 0.08);
  border-radius: 6px;
  margin-bottom: 6px;
}

.todo-batch-count {
  font-size: 11px;
  color: #888;
}

.dark .todo-batch-count {
  color: #aaa;
}

.todo-batch-delete {
  padding: 4px 10px;
  border: none;
  background: #ff6633;
  color: white;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-batch-delete:hover {
  background: #ff5500;
}

.todo-edit-input {
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #ff6633;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.dark .todo-edit-input {
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
}

.todo-edit-input:focus {
  outline: none;
}

.todo-confirm,
.todo-cancel {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 0 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.todo-confirm {
  color: #4caf50;
}

.todo-confirm:hover {
  opacity: 1;
}

.todo-cancel {
  color: #999;
}

.todo-cancel:hover {
  opacity: 1;
  color: #ff6633;
}

.todo-list-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-item.editing {
  background: rgba(255, 102, 51, 0.08);
}

.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.todo-move {
  transition: transform 0.3s ease;
}

/* ===== 设置页 - 主题/语言 ===== */
.theme-selector,
.language-selector {
  display: flex;
  gap: 6px;              /* 选项按钮间距 */
}

.theme-btn,
.lang-btn {
  flex: none;
  padding: 5px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  color: #333;
}

.dark .theme-btn,
.dark .lang-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #08e225;
}

.theme-btn.active,
.lang-btn.active {
  border-color: #ff6633;
  background: rgba(255, 102, 51, 0.1);
}

/* ===== 宠物页 - 宠物选择 ===== */
.pet-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pet-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.dark .pet-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.pet-btn.active {
  border-color: #ff6633;
  background: rgba(255, 102, 51, 0.1);
}

.pet-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.dark .pet-name {
  color: #08e225;
}
</style>
