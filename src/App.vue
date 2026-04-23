<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import PetSprite from './components/Pet/PetSprite.vue'
import SpeechBubble from './components/Pet/SpeechBubble.vue'
import ControlPanel from './components/Panel/ControlPanel.vue'
import { getPetMessage, type PetState } from './pet'

type PetType = 'bugcat' | 'trae' | 'codex' | 'claudecode'

const petState = ref<PetState>('idle')
const selectedPet = ref<PetType>('bugcat')
const speechMessage = ref('')
const speechVisible = ref(false)
const currentApp = ref('')
const isDragging = ref(false)
const statusText = ref('')
const theme = ref<'light' | 'dark'>('light')
const language = ref<'zh' | 'en'>('zh')
const panelVisible = ref(false)
const xp = ref(0)
const level = ref(2)
const focusedMsCarry = ref(0)
const chaoticMsCarry = ref(0)
let lastTickAt = Date.now()
let lastTrackedApp = ''
const switchTimestamps: number[] = []

interface ContributionDay {
  date: string;
  focusedSeconds?: number;
}
const contributionDays = ref<ContributionDay[]>([])
const todayCodingSeconds = ref(0)
const totalCodingSeconds = ref(0)
let lastCodingSampleAt = Date.now()
let lastCodingDate = ''

const CONSTANTS = {
  focusedInterval: 60000,
  chaoticInterval: 240000,
  level2XP: 600,
  level3XP: 1800,
  maxXP: 1800
}

function calculateLevel(xpValue: number): number {
  if (xpValue >= CONSTANTS.level3XP) return 3
  if (xpValue >= CONSTANTS.level2XP) return 2
  return 1
}

function loadGrowthData() {
  const storedXp = localStorage.getItem('bugpet_xp')
  const storedLevel = localStorage.getItem('bugpet_level')
  const storedFocusedMs = localStorage.getItem('bugpet_focused_ms')
  const storedChaoticMs = localStorage.getItem('bugpet_chaotic_ms')
  if (storedXp) xp.value = parseInt(storedXp, 10)
  if (storedLevel) level.value = parseInt(storedLevel, 10)
  if (storedFocusedMs) focusedMsCarry.value = parseInt(storedFocusedMs, 10)
  if (storedChaoticMs) chaoticMsCarry.value = parseInt(storedChaoticMs, 10)

  const storedPet = localStorage.getItem('bugpet_pet') as PetType
  if (storedPet && ['bugcat', 'trae', 'codex', 'claudecode'].includes(storedPet)) {
    selectedPet.value = storedPet
  }
}

function saveGrowthData() {
  localStorage.setItem('bugpet_xp', xp.value.toString())
  localStorage.setItem('bugpet_level', level.value.toString())
  localStorage.setItem('bugpet_focused_ms', focusedMsCarry.value.toString())
  localStorage.setItem('bugpet_chaotic_ms', chaoticMsCarry.value.toString())
}

function updateGrowth(state: PetState, isCodingApp: boolean) {
  if (!isCodingApp) return

  const now = Date.now()
  const elapsed = Math.min(now - lastTickAt, 10000)
  lastTickAt = now

  if (state === 'focused') {
    focusedMsCarry.value += elapsed
  } else if (state === 'chaotic') {
    chaoticMsCarry.value += elapsed
  }

  recordCodingStats(isCodingApp, state === 'focused')

  const focusedXP = Math.floor(focusedMsCarry.value / CONSTANTS.focusedInterval)
  const chaoticXP = Math.floor(chaoticMsCarry.value / CONSTANTS.chaoticInterval)
  const gainedXP = focusedXP + chaoticXP

  if (gainedXP > 0) {
    focusedMsCarry.value = focusedMsCarry.value % CONSTANTS.focusedInterval
    chaoticMsCarry.value = chaoticMsCarry.value % CONSTANTS.chaoticInterval
    xp.value = Math.min(CONSTANTS.maxXP, xp.value + gainedXP)
    level.value = calculateLevel(xp.value)
    saveGrowthData()
  }
}

function recordCodingStats(isCodingApp: boolean, isFocused: boolean) {
  const now = Date.now()
  const elapsed = Math.min(now - lastCodingSampleAt, 10000)
  lastCodingSampleAt = now

  if (!isCodingApp || elapsed <= 0) return

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  if (todayKey !== lastCodingDate) {
    if (lastCodingDate) {
      saveCodingStats()
    }
    loadCodingStats()
    lastCodingDate = todayKey
  }

  let dayData = contributionDays.value.find(d => d.date === todayKey)
  if (!dayData) {
    dayData = { date: todayKey, focusedSeconds: 0 }
    contributionDays.value.push(dayData)
  }
  dayData.focusedSeconds = (dayData.focusedSeconds || 0) + Math.floor(elapsed / 1000)
  if (isFocused) {
    todayCodingSeconds.value += elapsed
  }
  totalCodingSeconds.value += elapsed
  saveCodingStats()
}

function loadCodingStats() {
  const stored = localStorage.getItem('bugpet_contribution_days')
  if (stored) {
    contributionDays.value = JSON.parse(stored)
    contributionDays.value.forEach(d => {
      if (!d.focusedSeconds && (d as any).focusedMinutes) {
        d.focusedSeconds = (d as any).focusedMinutes * 60
        ;(d as any).focusedMinutes = undefined
      }
    })
  }
  const storedToday = localStorage.getItem('bugpet_today_seconds')
  const storedTotal = localStorage.getItem('bugpet_total_seconds')
  if (storedToday) todayCodingSeconds.value = parseInt(storedToday, 10)
  if (storedTotal) totalCodingSeconds.value = parseInt(storedTotal, 10)
}

function saveCodingStats() {
  localStorage.setItem('bugpet_contribution_days', JSON.stringify(contributionDays.value))
  localStorage.setItem('bugpet_today_seconds', todayCodingSeconds.value.toString())
  localStorage.setItem('bugpet_total_seconds', totalCodingSeconds.value.toString())
}

function trackAppSwitch(appName: string, isCodingApp: boolean) {
  const normalized = appName.trim().toLowerCase()
  if (!normalized || normalized.includes('bugpet')) {
    return
  }

  if (lastTrackedApp && normalized !== lastTrackedApp && isCodingApp) {
    switchTimestamps.push(Date.now())
  }

  lastTrackedApp = normalized

  const now = Date.now()
  const cutoff = now - 60000
  while (switchTimestamps.length > 0 && switchTimestamps[0] < cutoff) {
    switchTimestamps.shift()
  }
}

function resolveState(idleTime: number, appCategory: 'idle' | 'watching' | 'focused'): PetState {
  if (idleTime >= 60 || appCategory === 'idle') {
    return 'idle'
  }

  if (appCategory === 'watching') {
    return 'watching'
  }

  if (switchTimestamps.length >= 8) {
    return 'chaotic'
  }

  return 'focused'
}

let lastDragX = 0
let lastDragY = 0
let speechTimeout: number | null = null
let activityInterval: number | null = null

interface ActivityResult {
  app: string;
  idleTime: number;
}

const dragMessages: Record<string, Record<number, { zh: string[]; en: string[] }>> = {
  bugcat: {
    1: {
      zh: ['别碰我，我害怕喵。', '呜，不要突然拎我起来喵。', '轻一点……我真的会怕喵。'],
      en: ['Don\'t touch me, I\'m scared meow.', 'Wait, don\'t lift me up suddenly meow.', 'Be gentle... I\'m really scared meow.']
    },
    2: {
      zh: ['喂，先打个招呼再拖我呀喵。', '别这么突然，我会应激的喵。', '我没有那么怕了，但你也别太过分喵。'],
      en: ['Hey, say hi before dragging me meow.', 'Don\'t be so sudden, I\'ll get stressed meow.', 'I\'m not that scared anymore, but don\'t go overboard meow.']
    },
    3: {
      zh: ['再碰我我就炸毛了喵。', '你最好是有正当理由才来拎我喵。', '手放尊重点，不然我可要亮爪子了喵。'],
      en: ['Touch me again and I\'ll puff up my fur meow.', 'You better have a good reason to lift me meow.', 'Respect my space, or I\'ll show my claws meow.']
    }
  },
  trae: {
    1: {
      zh: ['等一下，我会慌。', '别突然拖我，我有点害怕。', '轻一点，好吗，我真的会紧张。'],
      en: ['Wait, I\'ll panic.', 'Don\'t drag me suddenly, I\'m scared.', 'Be gentle, please, I\'ll really get nervous.']
    },
    2: {
      zh: ['先说一声，我就没那么慌。', '你这样突然一拖，我还是会抖一下。', '可以拖，但别把我吓到。'],
      en: ['Just say the word and I won\'t be so panicked.', 'If you drag me suddenly, I\'ll still shiver.', 'You can drag, but don\'t scare me.']
    },
    3: {
      zh: ['再这么拽我，我要开始有意见了。', '你可以拖，但别把这当理所当然。', '我现在没那么好欺负了，真的。'],
      en: ['Drag me like that again and I\'ll start complaining.', 'You can drag, but don\'t take it for granted.', 'I\'m not so easy to bully anymore, really.']
    }
  },
  codex: {
    1: {
      zh: ['请停止。当前状态：受惊。', '拖动过于突然。我不喜欢。', '这会触发明显的紧张反应。'],
      en: ['Please stop. Current state: startled.', 'Dragging too sudden. I don\'t like it.', 'This will trigger obvious nervous reactions.']
    },
    2: {
      zh: ['建议先通知我，再进行拖动。', '你的操作有些粗暴。', '我能配合，但不代表我毫无意见。'],
      en: ['I suggest you notify me before dragging.', 'Your operation is a bit rough.', 'I can cooperate, but that doesn\'t mean I have no objections.']
    },
    3: {
      zh: ['继续这样拖，我会把它记录为敌对行为。', '警告：你正在测试我的耐心。', '你最好有充分理由，不然我会直接批评你。'],
      en: ['Continue dragging like this and I\'ll record it as hostile action.', 'Warning: You are testing my patience.', 'You\'d better have good reasons, or I\'ll criticize you directly.']
    }
  },
  claudecode: {
    1: {
      zh: ['呀，等一下，我有点怕。', '可不可以轻一点呀。', '突然这样碰我，我会紧张的。'],
      en: ['Oh, wait, I\'m a bit scared.', 'Can you be gentler?', 'Touching me suddenly like this makes me nervous.']
    },
    2: {
      zh: ['先提醒我一下会更好啦。', '我没有那么容易被吓到，但还是会抖一下。', '慢一点拖，我会比较安心。'],
      en: ['It\'d be better if you warned me first.', 'I\'m not that easily scared, but I\'ll still shiver.', 'Drag slowly and I\'ll feel more at ease.']
    },
    3: {
      zh: ['你再这样突然碰我，我就要认真抗议了。', '我会尽量温柔地说，但你真的有点过分了。', '我们已经很熟了，可这不代表你能随便拎我。'],
      en: ['If you touch me suddenly like this again, I\'ll protest seriously.', 'I\'ll try to say it gently, but you\'re really being a bit much.', 'We\'re already very familiar, but that doesn\'t mean you can just lift me up.']
    }
  }
}

const platformMessages: Record<string, { zh: string; en: string }> = {
  vscode: { zh: 'VS Code', en: 'VS Code' },
  code: { zh: 'VS Code', en: 'VS Code' },
  devenv: { zh: 'Visual Studio', en: 'Visual Studio' },
  rider: { zh: 'Rider', en: 'Rider' },
  idea: { zh: 'IntelliJ IDEA', en: 'IntelliJ IDEA' },
  webstorm: { zh: 'WebStorm', en: 'WebStorm' },
  pycharm: { zh: 'PyCharm', en: 'PyCharm' },
  goland: { zh: 'GoLand', en: 'GoLand' },
  clion: { zh: 'CLion', en: 'CLion' },
  androidstudio: { zh: 'Android Studio', en: 'Android Studio' },
  sublime_text: { zh: 'Sublime Text', en: 'Sublime Text' },
  atom: { zh: 'Atom', en: 'Atom' },
  'notepad++': { zh: 'Notepad++', en: 'Notepad++' },
  vim: { zh: 'Vim', en: 'Vim' },
  emacs: { zh: 'Emacs', en: 'Emacs' },
  cursor: { zh: 'Cursor', en: 'Cursor' },
  trae: { zh: 'Trae', en: 'Trae' },
  explorer: { zh: '桌面', en: 'Desktop' },
  sodamusic: { zh: '汽水音乐', en: 'Soda Music' },
  douyin: { zh: '抖音', en: 'Douyin' },
}

function getPlatformName(app: string): string {
  const lower = app.toLowerCase()
  for (const [key, value] of Object.entries(platformMessages)) {
    if (lower.includes(key)) {
      return value[language.value]
    }
  }
  return app
}

const appCategories = {
  focused: ['cursor', 'windsurf', 'trae', 'kiro', 'antigravity', 'code', 'idea64', 'pycharm64', 'webstorm64', 'clion64', 'rider64', 'goland64', 'claude', 'devenv', 'rider', 'idea', 'webstorm', 'pycharm', 'goland', 'clion', 'androidstudio', 'sublime_text', 'atom', 'notepad++', 'vim', 'emacs'],
  watching: ['chrome', 'msedge', 'firefox', 'Acrobat', 'FoxitReader', 'wordpad', 'notepad', 'obsidian'],
  idle: ['抖音', 'TikTok', '快手', 'bilibili', 'steam', 'wechat', 'QQ', 'cloudmusic', 'potplayer', 'explorer', 'sodamusic', 'douyin'],
}

function getAppCategory(app: string): 'focused' | 'watching' | 'idle' {
  const lower = app.toLowerCase()
  for (const cat of ['focused', 'watching', 'idle'] as const) {
    if (appCategories[cat].some(key => lower.includes(key))) {
      return cat
    }
  }
  return 'watching'
}

function isCodingApp(app: string): boolean {
  return getAppCategory(app) === 'focused'
}

let speechCooldown: number | null = null
let lastSpeechMessage = ''
const SPEECH_COOLDOWNS: Record<string, number> = {
  focused: 30000,
  idle: 10000,
  chaotic: 60000,
  watching: 5000
}

const stateLabels: Record<string, { zh: string; en: string }> = {
  idle: { zh: '摸鱼', en: 'Idle' },
  watching: { zh: '围观', en: 'Watching' },
  focused: { zh: '专注', en: 'Focused' },
  chaotic: { zh: '混乱', en: 'Chaotic' }
}

function shouldShowSpeech(state: PetState, idleSeconds: number, isCodingApp: boolean, stateChanged: boolean): boolean {
  if (speechCooldown) return false
  if (speechVisible.value) return false
  if (stateChanged) return true

  switch (state) {
    case 'focused':
      return isCodingApp && idleSeconds < 10
    case 'idle':
      return true
    case 'chaotic':
      return isCodingApp
    case 'watching':
      return !isCodingApp
    default:
      return false
  }
}

function showSpeech() {
  if (isDragging.value) {
    return
  }

  const newMessage = getPetMessage(petState.value)

  if (newMessage === lastSpeechMessage && Math.random() > 0.3) {
    return
  }
  lastSpeechMessage = newMessage
  speechMessage.value = newMessage
  speechVisible.value = true

  if (speechTimeout) {
    clearTimeout(speechTimeout)
  }

  speechTimeout = window.setTimeout(() => {
    speechVisible.value = false
    speechCooldown = window.setTimeout(() => {
      speechCooldown = null
    }, SPEECH_COOLDOWNS[petState.value] || 5000)
  }, 3000)
}

function updatePetState(newState: PetState, idleSeconds: number = 0, isCodingApp: boolean = true) {
  const stateChanged = petState.value !== newState
  petState.value = newState
  updateGrowth(newState, isCodingApp)

  if (shouldShowSpeech(newState, idleSeconds, isCodingApp, stateChanged)) {
    showSpeech()
  }
}

async function fetchActivity() {
  try {
    const result = await invoke<ActivityResult>('get_foreground_app')
    currentApp.value = getPlatformName(result.app)
    localStorage.setItem('bugpet_current_app', currentApp.value)

    const appCategory = getAppCategory(result.app)
    const idleTime = result.idleTime || 0

    trackAppSwitch(result.app, appCategory === 'focused')
    const newState = resolveState(idleTime, appCategory)

    updatePetState(newState, idleTime, appCategory === 'focused')

    if (newState === 'idle') {
      statusText.value = currentApp.value ? `${stateLabels[newState][language.value]} · ${currentApp.value}` : ''
    } else {
      statusText.value = currentApp.value ? `${stateLabels[newState][language.value]} · ${currentApp.value}` : ''
    }
  } catch (err) {
    const isDev = typeof window !== 'undefined' && !window.location.href.includes('tauri');
    if (isDev) {
      currentApp.value = 'VS Code'
      localStorage.setItem('bugpet_current_app', currentApp.value)
      trackAppSwitch('code', true)
      const newState = resolveState(0, 'focused')
      updatePetState(newState, 0, true)
      statusText.value = `${stateLabels[newState][language.value]} · VS Code`
    }
  }
}

function handleMouseEnter() {
  if (!isDragging.value && !panelVisible.value) {
    speechVisible.value = true
    if (speechTimeout) {
      clearTimeout(speechTimeout)
    }
    speechTimeout = window.setTimeout(() => {
      speechVisible.value = false
    }, 3000)
  }
}

async function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  panelVisible.value = !panelVisible.value
}

async function handleDragStart(e: MouseEvent) {
  if (e.button !== 0) return

  lastDragX = e.screenX
  lastDragY = e.screenY
  isDragging.value = true

  const msgs = dragMessages[selectedPet.value]?.[1]?.[language.value] || dragMessages.bugcat[1][language.value]
  const dragMsg = msgs[Math.floor(Math.random() * msgs.length)]
  speechMessage.value = dragMsg
  speechVisible.value = true

  if (speechTimeout) {
    clearTimeout(speechTimeout)
  }
  speechTimeout = window.setTimeout(() => {
    speechVisible.value = false
  }, 2800)

  try {
    await invoke('start_drag')
  } catch (err) {
    console.error('Start drag failed:', err)
  }
}

async function handleDragMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.screenX - lastDragX
  const deltaY = e.screenY - lastDragY

  if (deltaX !== 0 || deltaY !== 0) {
    try {
      await invoke('move_window', { deltaX, deltaY })
    } catch (err) {
      console.error('Move window failed:', err)
    }

    lastDragX = e.screenX
    lastDragY = e.screenY
  }
}

async function handleDragEnd() {
  if (!isDragging.value) return

  isDragging.value = false

  try {
    await invoke('end_drag')
  } catch (err) {
    console.error('End drag failed:', err)
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('click', handleClickOutside)

  loadGrowthData()
  loadCodingStats()
  const today = new Date()
  lastCodingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  lastTickAt = Date.now()
  lastCodingSampleAt = Date.now()
  fetchActivity()
  activityInterval = window.setInterval(fetchActivity, 1000)
  showSpeech()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('click', handleClickOutside)

  if (activityInterval) {
    clearInterval(activityInterval)
  }
  if (speechTimeout) {
    clearTimeout(speechTimeout)
  }
})

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (panelVisible.value && !target.closest('.panel-area') && !target.closest('.pet-area')) {
    panelVisible.value = false
  }
}
</script>

<template>
  <div
    class="app-container"
    :class="[theme, `state-${petState}`]"
    @mouseenter="handleMouseEnter"
    @contextmenu="handleContextMenu"
  >
    <div class="panel-area" v-if="panelVisible">
      <ControlPanel @close="panelVisible = false" @select-pet="(pet) => selectedPet = pet as PetType" />
    </div>

    <SpeechBubble :message="speechMessage" :visible="speechVisible && !panelVisible" />

    <div class="status-card" v-if="statusText && !panelVisible">
      {{ statusText }}
    </div>

    <div class="pet-area" v-if="!panelVisible">
      <PetSprite
        :state="petState"
        :pet="selectedPet"
        :level="2"
        :is-dragging="isDragging"
        @mousedown="handleDragStart"
      />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 220px;
  height: 252px;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
}

.panel-area {
  width: 270px;
  max-height: 380px;
  z-index: 10;
  background: rgba(233, 226, 226, 0.98);
  border-radius: 12px;
  overflow-y: auto;
}

.status-card {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 156px;
  height: 24px;
  background: rgba(0, 0, 0, 0.72);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.94);
  z-index: 2;
}

.pet-area {
  position: absolute;
  top: 150px;
  width: 76px;
  height: 100px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
