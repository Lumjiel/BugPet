import { ref } from 'vue'
import { getPetMessage, type PetState } from '../pet'

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

const SPEECH_COOLDOWNS: Record<string, number> = {
  focused: 15000,
  idle: 5000,
  chaotic: 3000,
  watching: 10000,
  desktop: 5000
}

export function useSpeech() {
  const speechMessage = ref('')
  const speechVisible = ref(false)
  let speechTimeout: number | null = null
  let speechCooldown: number | null = null
  let lastSpeechMessage = ''

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
      case 'desktop':
        return true
      default:
        return false
    }
  }

  function showSpeech(state: PetState, isDragging: boolean) {
    if (isDragging) return

    const newMessage = getPetMessage(state)

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
      }, SPEECH_COOLDOWNS[state] || 5000)
    }, 3000)
  }

  function showDragMessage(pet: string, level: number, lang: 'zh' | 'en') {
    const msgs = dragMessages[pet]?.[level]?.[lang] || dragMessages.bugcat[1][lang]
    const dragMsg = msgs[Math.floor(Math.random() * msgs.length)]
    speechMessage.value = dragMsg
    speechVisible.value = true

    if (speechTimeout) {
      clearTimeout(speechTimeout)
    }
    speechTimeout = window.setTimeout(() => {
      speechVisible.value = false
    }, 2800)
  }

  function showHoverMessage(state: PetState, isDragging: boolean, panelVisible: boolean) {
    if (isDragging || panelVisible) return
    speechVisible.value = true
    if (speechTimeout) {
      clearTimeout(speechTimeout)
    }
    speechTimeout = window.setTimeout(() => {
      speechVisible.value = false
    }, 3000)
  }

  function clearSpeech() {
    if (speechTimeout) {
      clearTimeout(speechTimeout)
      speechTimeout = null
    }
    if (speechCooldown) {
      clearTimeout(speechCooldown)
      speechCooldown = null
    }
  }

  return {
    speechMessage,
    speechVisible,
    showSpeech,
    showDragMessage,
    showHoverMessage,
    clearSpeech,
    shouldShowSpeech
  }
}
