import { ref } from 'vue'
import type { PetState } from '../pet'

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

const appCategories = {
  focused: ['cursor', 'windsurf', 'trae', 'kiro', 'antigravity', 'code', 'idea64', 'pycharm64', 'webstorm64', 'clion64', 'rider64', 'goland64', 'claude', 'devenv', 'rider', 'idea', 'webstorm', 'pycharm', 'goland', 'clion', 'androidstudio', 'sublime_text', 'atom', 'notepad++', 'vim', 'emacs'],
  watching: ['chrome', 'msedge', 'firefox', 'Acrobat', 'FoxitReader', 'wordpad', 'notepad', 'obsidian', 'explorer', 'wechat', 'QQ'],
  idle: ['抖音', 'TikTok', '快手', 'bilibili', 'steam', 'cloudmusic', 'potplayer', 'sodamusic', 'douyin', '网易云', '音乐', '腾讯视频', '爱奇艺', '优酷'],
}

const stateLabels: Record<string, { zh: string; en: string }> = {
  idle: { zh: '摸鱼', en: 'Idle' },
  watching: { zh: '阅读', en: 'Reading' },
  focused: { zh: '专注', en: 'Focused' },
  chaotic: { zh: '混乱', en: 'Chaotic' },
  desktop: { zh: '桌面', en: 'Desktop' }
}

export function useActivity() {
  const currentApp = ref('')
  const petState = ref<PetState>('idle')
  const statusText = ref('')
  let lastTrackedApp = ''
  const switchTimestamps: number[] = []
  let chaoticEndTime: number | null = null
  const CHAOTIC_MIN_DURATION = 10000

  function getPlatformName(app: string, lang: 'zh' | 'en'): string {
    const lower = app.toLowerCase()
    for (const [key, value] of Object.entries(platformMessages)) {
      if (lower.includes(key)) {
        return value[lang]
      }
    }
    return app
  }

  function getAppCategory(app: string): 'focused' | 'watching' | 'idle' {
    const lower = app.toLowerCase()
    for (const cat of ['idle', 'focused', 'watching'] as const) {
      if (appCategories[cat].some(key => lower.includes(key))) {
        return cat
      }
    }
    return 'watching'
  }

  function trackAppSwitch(appName: string) {
    const normalized = appName.trim().toLowerCase()
    if (!normalized || normalized.includes('bugpet')) {
      return
    }

    if (lastTrackedApp && normalized !== lastTrackedApp) {
      switchTimestamps.push(Date.now())
    }

    lastTrackedApp = normalized

    const now = Date.now()
    const cutoff = now - 60000
    while (switchTimestamps.length > 0 && switchTimestamps[0] < cutoff) {
      switchTimestamps.shift()
    }
  }

  function resolveState(idleTime: number, appCategory: 'idle' | 'watching' | 'focused', isShowingDesktop: boolean): PetState {
    if (isShowingDesktop) {
      return 'desktop'
    }

    if (switchTimestamps.length >= 8) {
      if (!chaoticEndTime || Date.now() >= chaoticEndTime) {
        chaoticEndTime = Date.now() + CHAOTIC_MIN_DURATION
      }
      return 'chaotic'
    }

    if (chaoticEndTime && Date.now() < chaoticEndTime) {
      return 'chaotic'
    }
    chaoticEndTime = null

    if (idleTime >= 60 || appCategory === 'idle') {
      return 'idle'
    }

    if (appCategory === 'watching') {
      return 'watching'
    }

    return 'focused'
  }

  function updateStatusText(state: PetState, app: string, lang: 'zh' | 'en') {
    statusText.value = app ? `${stateLabels[state][lang]} · ${app}` : ''
  }

  return {
    currentApp,
    petState,
    statusText,
    getPlatformName,
    getAppCategory,
    trackAppSwitch,
    resolveState,
    updateStatusText
  }
}
