<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import PetSprite from './components/Pet/PetSprite.vue'
import SpeechBubble from './components/Pet/SpeechBubble.vue'
import ControlPanel from './components/Panel/ControlPanel.vue'
import { useGrowth } from './composables/useGrowth'
import { useCodingStats } from './composables/useCodingStats'
import { useActivity } from './composables/useActivity'
import { useSpeech } from './composables/useSpeech'
import type { PetState } from './pet'

type PetType = 'bugcat' | 'trae' | 'codex' | 'claudecode'

const selectedPet = ref<PetType>('bugcat')
const isDragging = ref(false)
const theme = ref<'light' | 'dark'>('light')
const language = ref<'zh' | 'en'>('zh')
const panelVisible = ref(false)
const hideBorder = ref(false)

const { xp, level, loadGrowthData, saveGrowthData, updateGrowth, resetTick } = useGrowth()
const { contributionDays, todayCodingSeconds, totalCodingSeconds, loadCodingStats, flushCodingStats, recordCodingStats, resetCodingSample } = useCodingStats()
const { currentApp, petState, statusText, getPlatformName, getAppCategory, trackAppSwitch, resolveState, updateStatusText } = useActivity()
const { speechMessage, speechVisible, showSpeech, showDragMessage, showHoverMessage, clearSpeech, shouldShowSpeech } = useSpeech()

let activityInterval: number | null = null
let lastDragX = 0
let lastDragY = 0

function loadSettings() {
  const storedPet = localStorage.getItem('bugpet_pet') as PetType
  if (storedPet && ['bugcat', 'trae', 'codex', 'claudecode'].includes(storedPet)) {
    selectedPet.value = storedPet
  }
  hideBorder.value = localStorage.getItem('bugpet_hide_border') === '1'
}

function updatePetState(newState: PetState, idleSeconds: number = 0, isCodingApp: boolean = true) {
  const stateChanged = petState.value !== newState
  petState.value = newState
  updateGrowth(newState, isCodingApp, recordCodingStats)

  if (shouldShowSpeech(newState, idleSeconds, isCodingApp, stateChanged)) {
    showSpeech(newState, isDragging.value)
  }
}

async function fetchActivity() {
  try {
    const result = await invoke<{ frontmost_app_name: string; idle_seconds: number; is_coding_app: boolean; is_showing_desktop: boolean }>('get_activity_info')
    currentApp.value = getPlatformName(result.frontmost_app_name, language.value)
    localStorage.setItem('bugpet_current_app', currentApp.value)

    const appCategory = getAppCategory(result.frontmost_app_name)
    const idleTime = result.idle_seconds || 0
    const isShowingDesktop = result.is_showing_desktop || false

    trackAppSwitch(result.frontmost_app_name)
    const newState = resolveState(idleTime, appCategory, isShowingDesktop)

    updatePetState(newState, idleTime, appCategory === 'focused')
    updateStatusText(newState, currentApp.value, language.value)
  } catch (err) {
    const isDev = typeof window !== 'undefined' && !window.location.href.includes('tauri')
    if (isDev) {
      currentApp.value = 'VS Code'
      localStorage.setItem('bugpet_current_app', currentApp.value)
      trackAppSwitch('code')
      const newState = resolveState(0, 'focused', false)
      updatePetState(newState, 0, true)
      updateStatusText(newState, 'VS Code', language.value)
    }
  }
}

function handleMouseEnter() {
  showHoverMessage(petState.value, isDragging.value, panelVisible.value)
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

  showDragMessage(selectedPet.value, level.value, language.value)

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

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (panelVisible.value && !target.closest('.panel-area') && !target.closest('.pet-area')) {
    panelVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('click', handleClickOutside)

  loadSettings()
  loadGrowthData()
  loadCodingStats()
  resetTick()
  resetCodingSample()

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  fetchActivity()
  activityInterval = window.setInterval(fetchActivity, 1000)
  showSpeech(petState.value, isDragging.value)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('click', handleClickOutside)

  if (activityInterval) {
    clearInterval(activityInterval)
  }

  clearSpeech()
  flushCodingStats()
})
</script>

<template>
  <div
    class="app-container"
    :class="[theme, `state-${petState}`]"
    @mouseenter="handleMouseEnter"
    @contextmenu="handleContextMenu"
  >
    <!-- 控制面板 -->
    <div class="panel-area" v-if="panelVisible">
      <ControlPanel
        @close="panelVisible = false"
        @select-pet="(pet) => selectedPet = pet as PetType"
        @change-hide-border="(hide) => hideBorder = hide"
      />
    </div>

    <!-- 语音气泡 -->
    <SpeechBubble :message="speechMessage" :visible="speechVisible && !panelVisible" />

    <!-- 状态卡：彻底无白色边框 -->
    <div class="status-card" :class="{ 'no-border': hideBorder }" v-if="statusText && !panelVisible">
      {{ statusText }}
    </div>

    <!-- 宠物精灵 -->
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
/* 主容器：彻底清除所有边框/阴影/轮廓 */
.app-container {
  width: 220px;
  height: 252px;
  background: transparent !important;
  position: relative;
  display: flex;
  flex-direction: column;
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 面板：无多余边框/描边 */
.panel-area {
  width: 270px;
  max-height: 380px;
  z-index: 10;
  background: rgba(233, 226, 226, 0.95);
  border-radius: 0;
  overflow-y: auto;
  border: none !important;
  outline: none !important;
  box-shadow:
    0 0 30px rgba(0, 0, 0, 0.06),
    0 0 60px rgba(0, 0, 0, 0.04),
    0 0 100px rgba(0, 0, 0, 0.03);
}

/* 状态卡：默认无白色边框 */
.status-card {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 156px;
  height: 24px;
  background: rgba(0, 0, 0, 0.72);
  border-radius: 12px;
  border: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.94);
  z-index: 2;
  outline: none !important;
}

/* 隐藏边框模式：更简洁 */
.status-card.no-border {
  background: rgba(0, 0, 0, 0.5);
}

/* 宠物区域 */
.pet-area {
  position: absolute;
  top: 150px;
  width: 76px;
  height: 100px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
