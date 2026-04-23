<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  visible: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const displayMessage = computed(() => props.message || '');
</script>

<template>
  <Transition name="bubble">
    <div v-if="visible && displayMessage" class="speech-bubble">
      <div class="bubble-body">
        <div class="bubble-content">
          {{ displayMessage }}
        </div>
      </div>
      <div class="bubble-tail"></div>
    </div>
  </Transition>
</template>

<style scoped>
.speech-bubble {
  position: absolute;
  top: 40px;
  left: 50px;
  z-index: 1;
  pointer-events: none;
}

.bubble-body {
  width: 100px;
  min-height: 50px;
  max-height: 90px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  border: none;
}

.bubble-content {
  font-size: 12px;
  font-weight: 500;
  color: #141826;
  line-height: 1.4;
  word-break: break-word;
  max-height: 120px;
  overflow: hidden;
  -webkit-line-clamp: 3;       /* 最多显示3行 */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.bubble-tail {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 14px solid rgba(255, 255, 255, 0.92);
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dark .bubble-body {
  background: rgba(255, 255, 255, 0.92);
}

.dark .bubble-content {
  color: #141826;
}

.dark .bubble-tail {
  border-top-color: rgba(255, 255, 255, 0.92);
}

@keyframes bubble-appear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
</style>