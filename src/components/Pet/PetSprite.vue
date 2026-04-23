<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  state: 'idle' | 'watching' | 'focused' | 'chaotic' | 'desktop';
  pet: 'bugcat' | 'trae' | 'codex' | 'claudecode';
  level: number;
  isDragging?: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void;
}>();

const isFrightened = ref(false);
const idleFrameIndex = ref(0);
let idleAnimationTimer: number | null = null;

const isGifPlaying = ref(false);
let gifScheduleTimer: number | null = null;
const GIF_DURATION = 1500;
const gifKey = ref(0);
let _currentGifUrl = '';

watch(() => props.isDragging, (dragging) => {
  if (dragging) {
    isFrightened.value = true;
    stopIdleAnimation();
    stopGifSchedule();
  } else {
    setTimeout(() => {
      isFrightened.value = false;
    }, 760);
  }
});

const animationClass = computed(() => {
  if (isFrightened.value) return 'pet-fear';
  return `pet-${props.state}`;
});

const petImage = computed(() => {
  if (isFrightened.value && props.pet === 'bugcat' && props.level !== 3) {
    return `/pets/bugcat-fear-static.png`;
  }
  if (props.pet === 'bugcat') {
    const stateLevelMap: Record<string, number> = {
      idle: 1,
      watching: 2,
      focused: 3,
      chaotic: 2,
      desktop: 1,
    };
    const displayLevel = stateLevelMap[props.state] || 1;
    if (props.level === 1 && idleFrameIndex.value > 0) {
      return `/pets/bugcat-idle-${idleFrameIndex.value}.png`;
    }
    return `/pets/bugcat-level${displayLevel}.png`;
  }
  if (props.pet === 'trae') {
    const stateLevelMap: Record<string, number> = {
      idle: 1,
      watching: 2,
      focused: 1,
      chaotic: 3,
      desktop: 1,
    };
    const displayLevel = stateLevelMap[props.state] || 1;
    if (isFrightened.value) {
      return `/pets/trae-level${displayLevel}.png`;
    }
    if (props.state === 'chaotic') {
      return `/pets/trae-level${displayLevel}.gif`;
    }
    return `/pets/trae-level${displayLevel}.png`;
  }
  if (props.pet === 'codex' || props.pet === 'claudecode') {
    const stateLevelMap: Record<string, number> = {
      idle: 1,
      watching: 2,
      focused: 1,
      chaotic: 3,
      desktop: 1,
    };
    const displayLevel = stateLevelMap[props.state] || 1;
    if (isFrightened.value) {
      return `/pets/${props.pet}-level${displayLevel}.png`;
    }
    if (props.state === 'chaotic') {
      return `/pets/${props.pet}-level${displayLevel}.gif`;
    }
    return `/pets/${props.pet}-level${displayLevel}.png`;
  }
  return `/pets/${props.pet}-level${props.level}.gif`;
});

const _gifSrc = computed(() => {
  if (props.pet === 'bugcat' && (props.level === 2 || props.level === 3)) {
    return `/pets/bugcat-level${props.level}.gif`;
  }
  if (props.pet === 'trae' && props.state === 'chaotic' && !isFrightened.value) {
    return `/pets/trae-level3.gif`;
  }
  if ((props.pet === 'codex' || props.pet === 'claudecode') && !isFrightened.value && props.state === 'chaotic') {
    return `/pets/${props.pet}-level3.gif`;
  }
  return '';
});

function startIdleAnimation() {
  if (props.pet !== 'bugcat' || props.level !== 1) return;

  const scheduleNext = () => {
    const delay = 1800 + Math.random() * 2200;
    idleAnimationTimer = window.setTimeout(() => {
      idleFrameIndex.value = 1;
      setTimeout(() => {
        idleFrameIndex.value = 2;
        setTimeout(() => {
          idleFrameIndex.value = 3;
          setTimeout(() => {
            idleFrameIndex.value = 0;
            scheduleNext();
          }, 140);
        }, 120);
      }, 120);
    }, delay);
  };
  scheduleNext();
}

function stopIdleAnimation() {
  if (idleAnimationTimer !== null) {
    clearTimeout(idleAnimationTimer);
    idleAnimationTimer = null;
  }
  idleFrameIndex.value = 0;
}

function playGifAnimation() {
  if (props.pet !== 'bugcat' || props.level === 1 || isFrightened.value) return;
  gifKey.value++;
  isGifPlaying.value = true;
  setTimeout(() => {
    isGifPlaying.value = false;
  }, GIF_DURATION);
}

function scheduleGifAnimation() {
  if (props.pet !== 'bugcat' || props.level === 1 || isFrightened.value) return;
  if (gifScheduleTimer !== null) return;

  const delay = 5000 + Math.random() * 5000;
  gifScheduleTimer = window.setTimeout(() => {
    gifScheduleTimer = null;
    playGifAnimation();
    scheduleGifAnimation();
  }, delay);
}

function stopGifSchedule() {
  if (gifScheduleTimer !== null) {
    clearTimeout(gifScheduleTimer);
    gifScheduleTimer = null;
  }
  isGifPlaying.value = false;
}

watch(() => [props.pet, props.level, props.state], () => {
  stopIdleAnimation();
  stopGifSchedule();
  if (!isFrightened.value) {
    if (props.pet === 'bugcat' && props.level === 1) {
      startIdleAnimation();
    } else if (props.pet === 'bugcat' && (props.level === 2 || props.level === 3)) {
      scheduleGifAnimation();
    }
  }
});

onMounted(() => {
  console.log('[DEBUG onMounted] PetSprite mounted', { pet: props.pet, level: props.level, state: props.state });
  if (props.pet === 'bugcat' && props.level === 1) {
    startIdleAnimation();
  } else if (props.pet === 'bugcat' && (props.level === 2 || props.level === 3)) {
    scheduleGifAnimation();
  }
});

onUnmounted(() => {
  stopIdleAnimation();
  stopGifSchedule();
});

function handleMouseDown(e: MouseEvent) {
  emit('mousedown', e);
}

function handleMouseUp() {
}

function handleImageError() {
  console.warn('Failed to load pet image:', petImage.value);
}

defineExpose({ handleMouseUp });
</script>

<template>
  <div
    class="pet-sprite"
    :class="animationClass"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <div class="pet-image-container">
      <img :src="petImage" :alt="pet" class="pet-image" draggable="false" @error="handleImageError" />
    </div>
  </div>
</template>

<style scoped>
.pet-sprite {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}

.pet-sprite:active {
  cursor: grabbing;
}

.pet-image-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-image {
  width: 200px;
  height: 100px;
  object-fit: contain;
  pointer-events: none;
  image-rendering: -webkit-optimize-contrast;
}

.pet-idle .pet-image {
  animation: idle-bob 3s ease-in-out infinite;
}

.pet-watching .pet-image {
  animation: watching-look 2s ease-in-out infinite;
}

.pet-focused .pet-image {
  animation: focused-bounce 0.6s ease-in-out infinite;
}

.pet-chaotic .pet-image {
  animation: chaotic-shake 0.3s ease-in-out infinite;
}

.pet-fear .pet-image {
  animation: fear-shake 0.3s ease-in-out infinite;
}

.pet-gif {
  animation: gif-fade-in 0.1s ease-out forwards;
}

@keyframes gif-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes fear-shake {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes watching-look {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-3px); }
}

@keyframes focused-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes chaotic-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-2px) rotate(-3deg); }
  75% { transform: translateX(2px) rotate(3deg); }
}

@keyframes fear-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
</style>