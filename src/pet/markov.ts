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
      idle: ['无聊','摸鱼','睡觉','咖啡','等待','if','else','变量','TODO','bored','coffee','wait','sleep'],
      watching: ['偷看','好奇','分号','函数','bug','注释','缩进','Stack','Overflow','semicolon','function','comment'],
      focused: ['加油','编译','代码','艺术','flow','通过','保存','质量','compile','focus','commit','art'],
      chaotic: ['窗口','tab','Alt','晕','慢点','救命','混乱','派对','window','switch','chaos','party']
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
    if (this.starters.length === 0) return "...";

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

    const generated = result.join('');
    const wordCount = this.tokenize(generated).length;

    if (wordCount < 3 && this.corpus.length > 0) {
      const fallback = this.corpus[Math.floor(Math.random() * this.corpus.length)];
      return fallback;
    }

    return generated;
  }
}

const messageGenerators = {
  idle: new WeightedMarkovChain(idleCorpus, 'idle'),
  watching: new WeightedMarkovChain(watchingCorpus, 'watching'),
  focused: new WeightedMarkovChain(focusedCorpus, 'focused'),
  chaotic: new WeightedMarkovChain(chaoticCorpus, 'chaotic')
};

export function getPetMessage(state: PetState): string {
  return messageGenerators[state].generate();
}