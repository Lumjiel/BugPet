import { ref } from 'vue'

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

export function useGrowth() {
  const xp = ref(0)
  const level = ref(2)
  const focusedMsCarry = ref(0)
  const chaoticMsCarry = ref(0)
  let lastTickAt = Date.now()

  function loadGrowthData() {
    const storedXp = localStorage.getItem('bugpet_xp')
    const storedLevel = localStorage.getItem('bugpet_level')
    const storedFocusedMs = localStorage.getItem('bugpet_focused_ms')
    const storedChaoticMs = localStorage.getItem('bugpet_chaotic_ms')
    if (storedXp) xp.value = parseInt(storedXp, 10)
    if (storedLevel) level.value = parseInt(storedLevel, 10)
    if (storedFocusedMs) focusedMsCarry.value = parseInt(storedFocusedMs, 10)
    if (storedChaoticMs) chaoticMsCarry.value = parseInt(storedChaoticMs, 10)
  }

  function saveGrowthData() {
    localStorage.setItem('bugpet_xp', xp.value.toString())
    localStorage.setItem('bugpet_level', level.value.toString())
    localStorage.setItem('bugpet_focused_ms', focusedMsCarry.value.toString())
    localStorage.setItem('bugpet_chaotic_ms', chaoticMsCarry.value.toString())
  }

  function updateGrowth(state: string, isCodingApp: boolean, onTick?: (isCodingApp: boolean, isFocused: boolean, isWatching: boolean) => void) {
    const now = Date.now()
    const elapsed = Math.min(now - lastTickAt, 10000)
    lastTickAt = now

    if (state === 'focused') {
      focusedMsCarry.value += elapsed
    } else if (state === 'chaotic') {
      chaoticMsCarry.value += elapsed
    } else if (state === 'watching') {
      focusedMsCarry.value += Math.floor(elapsed * 0.3)
    }

    if (onTick) {
      onTick(isCodingApp, state === 'focused', state === 'watching')
    }

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

  function resetTick() {
    lastTickAt = Date.now()
  }

  return {
    xp,
    level,
    focusedMsCarry,
    chaoticMsCarry,
    loadGrowthData,
    saveGrowthData,
    updateGrowth,
    resetTick
  }
}
