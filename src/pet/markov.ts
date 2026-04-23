import { idleCorpus } from './corpus/idle';
import { watchingCorpus } from './corpus/watching';
import { focusedCorpus } from './corpus/focused';
import { chaoticCorpus } from './corpus/chaotic';

export type PetState = 'idle' | 'watching' | 'focused' | 'chaotic';

interface WeightedToken {
  token: string;
  weight: number;
}

class WeightedMarkovChain {
  private chain: Record<string, WeightedToken[]> = {};
  private starters: WeightedToken[] = [];
  private corpus: string[];

  constructor(
    corpus: string[],
    private state: PetState,
    private order: number = 2
  ) {
    this.corpus = corpus;
    this.buildChain(corpus);
  }

  private getWeightMultiplier(token: string): number {
    const highFreqMap: Record<PetState, string[]> = {
      idle: ['静止', '屏幕', '刷视频', '留守', '抖音', '没人', '桌面', '图标', '寂寞', '手机', '傻笑', '发呆', '摸鱼'],
      watching: ['盯', '康康', '这行', '抽象', '命名', '看不懂', '瞳孔', '嗅觉', 'bug', '震撼', '消化', '注释', '瞪'],
      focused: ['Tab', '丝滑', '手速', '键盘', '心流', '回车', '光', '闪电', '输出', '神', '节奏', '代码', '键'],
      chaotic: ['窗口', 'Alt', '切', '晕', '风暴', '甩', '旋转', '切屏', '报错', '炸', '多线程', '洗衣机', '切换']
    };

    const lower = token.toLowerCase();
    for (const kw of highFreqMap[this.state]) {
      if (lower.includes(kw.toLowerCase())) {
        return 2.5;
      }
    }
    return 1.0;
  }

  private buildChain(corpus: string[]) {
    for (const sentence of corpus) {
      const tokens = this.tokenize(sentence);
      if (tokens.length === 0) continue;

      const firstToken = tokens[0];
      const firstWeight = this.getWeightMultiplier(firstToken);
      this.addToStarters(firstToken, firstWeight);

      for (let i = 0; i < tokens.length - this.order; i++) {
        const key = tokens.slice(i, i + this.order).join(' ');
        const next = tokens[i + this.order];
        const weight = this.getWeightMultiplier(next);

        if (!this.chain[key]) this.chain[key] = [];
        const existing = this.chain[key].find(wt => wt.token === next);
        if (existing) {
          existing.weight += weight;
        } else {
          this.chain[key].push({ token: next, weight });
        }
      }
    }
  }

  private addToStarters(token: string, weight: number) {
    const existing = this.starters.find(wt => wt.token === token);
    if (existing) {
      existing.weight += weight;
    } else {
      this.starters.push({ token, weight });
    }
  }

  private weightedRandomChoice(items: WeightedToken[]): string {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item.token;
    }
    return items[0].token;
  }

  private tokenize(text: string): string[] {
    const mixed = text.match(/[\u4e00-\u9fa5]|[a-zA-Z]+|\s+|[^\s\u4e00-\u9fa5a-zA-Z]/g) || [];
    return mixed.filter(t => t.trim() !== '');
  }

  generate(maxLength: number = 20): string {
    if (this.starters.length === 0) return this.fallback();

    let result: string;
    let attempts = 0;

    do {
      result = this.tryGenerate(maxLength);
      attempts++;
    } while ((result.length < 6 || result === '...') && attempts < 5);

    return result.length >= 6 ? result : this.fallback();
  }

  private tryGenerate(maxLength: number): string {
    let key = this.weightedRandomChoice(this.starters);
    const result: string[] = key.split(' ');

    for (let i = 0; i < maxLength; i++) {
      const nextTokens = this.chain[key];
      if (!nextTokens || nextTokens.length === 0) break;

      const next = this.weightedRandomChoice(nextTokens);
      result.push(next);

      const newKeyTokens = [...result.slice(-this.order)];
      key = newKeyTokens.join(' ');

      if (['。', '？', '！', '.', '?', '!'].includes(next)) break;
    }

    return result.join('');
  }

  private fallback(): string {
    const corpus = this.corpus;
    return corpus[Math.floor(Math.random() * corpus.length)];
  }
}

const messageGenerators = {
  idle: new WeightedMarkovChain(idleCorpus, 'idle'),
  watching: new WeightedMarkovChain(watchingCorpus, 'watching'),
  focused: new WeightedMarkovChain(focusedCorpus, 'focused'),
  chaotic: new WeightedMarkovChain(chaoticCorpus, 'chaotic')
};

const corpusMap: Record<PetState, string[]> = {
  idle: idleCorpus,
  watching: watchingCorpus,
  focused: focusedCorpus,
  chaotic: chaoticCorpus
};

class MessageManager {
  private history: string[] = [];
  private unusedQueue: string[] = [];
  private readonly maxHistory = 10;

  getNextMessage(state: PetState): string {
    let msg: string;
    let attempts = 0;

    do {
      if (Math.random() < 0.7) {
        msg = messageGenerators[state].generate();
      } else {
        msg = this.getRandomFromCorpus(state);
      }
      attempts++;
    } while (this.history.includes(msg) && attempts < 10);

    this.history.push(msg);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    return msg;
  }

  private getRandomFromCorpus(state: PetState): string {
    if (this.unusedQueue.length === 0) {
      this.unusedQueue = [...corpusMap[state]];
      this.shuffle(this.unusedQueue);
    }
    return this.unusedQueue.pop()!;
  }

  private shuffle(arr: string[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

const messageManager = new MessageManager();

export function getPetMessage(state: PetState): string {
  return messageManager.getNextMessage(state);
}