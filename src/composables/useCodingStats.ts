import { ref } from 'vue'

export interface ContributionDay {
  date: string;
  focusedSeconds?: number;
  watchingSeconds?: number;
}

export function useCodingStats() {
  const contributionDays = ref<ContributionDay[]>([])
  const todayCodingSeconds = ref(0)
  const totalCodingSeconds = ref(0)
  let lastCodingSampleAt = Date.now()
  let lastCodingDate = ''

  function recordCodingStats(isCodingApp: boolean, isFocused: boolean, isWatching: boolean) {
    const now = Date.now()
    const elapsed = Math.min(now - lastCodingSampleAt, 10000)
    lastCodingSampleAt = now

    if (elapsed <= 0) return

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

    if (isFocused && isCodingApp) {
      dayData.focusedSeconds = (dayData.focusedSeconds || 0) + Math.floor(elapsed / 1000)
      todayCodingSeconds.value += elapsed
    } else if (isWatching) {
      dayData.watchingSeconds = (dayData.watchingSeconds || 0) + Math.floor(elapsed / 1000)
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
        if (!d.watchingSeconds) {
          d.watchingSeconds = 0
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

  function flushCodingStats() {
    saveCodingStats()
  }

  function resetCodingSample() {
    lastCodingSampleAt = Date.now()
  }

  return {
    contributionDays,
    todayCodingSeconds,
    totalCodingSeconds,
    recordCodingStats,
    loadCodingStats,
    saveCodingStats,
    flushCodingStats,
    resetCodingSample
  }
}
