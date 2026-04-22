<script setup lang="ts">
import { computed } from 'vue';

interface ContributionDay {
  date: string;
  focusedSeconds?: number;
}

const props = withDefaults(defineProps<{
  days: ContributionDay[];
  year: number;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  compact?: boolean;
  scrollable?: boolean;
}>(), {
  compact: false,
  scrollable: false
});

const weekDays = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabelsZh = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const cellSize = 8;
const cellGap = 2;
const rowHeight = cellSize + cellGap;
const dayLabelWidth = 28;
const topInset = 6;
const leftInset = 12;
const bottomInset = 6;
const monthLabelHeight = 10;

const dayMap = computed(() => {
  const map: Record<string, ContributionDay> = {};
  for (const day of props.days) {
    map[day.date] = day;
  }
  return map;
});

const weeks = computed(() => {
  const today = new Date();
  const endDate = today;
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  
  const firstDay = startDate.getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  startDate.setDate(startDate.getDate() - startOffset);

  const result: { date: Date; week: number }[][] = [];
  let currentWeek: { date: Date; week: number }[] = [];
  let currentWeekNum = 0;
  let weekStarted = false;

  while (startDate <= endDate || currentWeek.length > 0) {
    if (!weekStarted) {
      weekStarted = true;
    }

    if (weekStarted && startDate.getDay() === 1 && currentWeek.length > 0) {
      result.push(currentWeek);
      currentWeek = [];
      currentWeekNum++;
    }

    const d = new Date(startDate);
    if (weekStarted && d <= endDate) {
      currentWeek.push({ date: d, week: currentWeekNum });
    }

    startDate.setDate(startDate.getDate() + 1);

    if (startDate > endDate && currentWeek.length > 0) {
      result.push(currentWeek);
      break;
    }
  }

  return result;
});

const months = computed(() => {
  const result: { month: number; week: number; label: string }[] = [];
  let lastMonth = 0;

  weeks.value.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay) {
      const month = firstDay.date.getMonth() + 1;
      const day = firstDay.date.getDate();
      if (month !== lastMonth && day <= 7) {
        const label = props.language === 'zh' ? monthLabelsZh[month - 1] : monthLabels[month - 1];
        result.push({ month, week: weekIndex, label });
        lastMonth = month;
      }
    }
  });

  return result;
});

const totalWidth = computed(() => {
  return leftInset + dayLabelWidth + weeks.value.length * (cellSize + cellGap) + 12;
});

const totalHeight = computed(() => {
  return topInset + monthLabelHeight + 6 + 7 * rowHeight + bottomInset;
});

function getColor(minutes: number): string {
  const colors = {
    light: {
      empty: '#EBEDF0',
      low: '#9BE9A5',
      medium: '#40C463',
      high: '#30A14E',
      veryHigh: '#216E39'
    },
    dark: {
      empty: '#161B22',
      low: '#0E4429',
      medium: '#006D32',
      high: '#26A641',
      veryHigh: '#39D353'
    }
  };
  const palette = props.theme === 'dark' ? colors.dark : colors.light;

  if (minutes === 0) return palette.empty;
  if (minutes <= 10) return palette.low;
  if (minutes <= 60) return palette.medium;
  if (minutes <= 120) return palette.high;
  return palette.veryHigh;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMinutes(date: Date): number {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const seconds = dayMap.value[key]?.focusedSeconds || 0;
  return Math.floor(seconds / 60);
}

const t = computed(() => ({
  min: props.language === 'zh' ? '分钟' : 'min',
  less: props.language === 'zh' ? '少' : 'Less',
  more: props.language === 'zh' ? '多' : 'More',
}));
</script>

<template>
  <div class="heatmap" :class="{ compact, scrollable }" :style="{ width: totalWidth + 'px', height: totalHeight + 'px' }">
    <div class="heatmap-months">
      <span
        v-for="m in months"
        :key="m.month + '-' + m.week"
        class="month-label"
        :style="{ left: (leftInset + dayLabelWidth + m.week * (cellSize + cellGap)) + 'px' }"
      >
        {{ m.label }}
      </span>
    </div>

    <div class="heatmap-grid">
      <div class="day-labels">
        <span v-for="(day, i) in weekDays" :key="i" class="day-label">{{ day }}</span>
      </div>

      <div class="cells">
        <div v-for="(week, wi) in weeks" :key="wi" class="week">
          <div
            v-for="(day, di) in week"
            :key="di"
            class="cell"
            :style="{ backgroundColor: getColor(getMinutes(day.date)) }"
            :title="`${formatDate(day.date)} · ${getMinutes(day.date)}${t.min}`"
          />
          <div v-if="week.length < 7" v-for="n in (7 - week.length)" :key="'empty-' + n" class="cell empty" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  position: relative;
  font-size: 8px;
}

.heatmap.scrollable {
  overflow-x: auto;
  overflow-y: hidden;
}

.heatmap-months {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 16px;
}

.month-label {
  position: absolute;
  color: #666;
  font-weight: 500;
}

.heatmap-grid {
  display: flex;
  gap: 4px;
  margin-top: 22px;
}

.day-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  padding: 0 2px;
}

.day-label {
  color: #666;
  font-size: 8px;
  height: 8px;
  line-height: 8px;
  text-align: right;
}

.cells {
  display: flex;
  gap: 2px;
}

.cell {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background-color: #ebedf0;
}

.cell.empty {
  background-color: transparent;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  justify-content: flex-end;
}

.legend-label {
  color: #666;
  font-size: 8px;
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cells .cell {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.dark .month-label,
.dark .day-label {
  color: #8b949e;
}
</style>