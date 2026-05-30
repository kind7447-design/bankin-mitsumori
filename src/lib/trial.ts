// トライアル管理
// - 初回アクセス日をlocalStorageに保存（2週間有効）
// - AI読み取り枚数をカウント（上限100枚）

const TRIAL_START_KEY = 'trial_start';
const AI_COUNT_KEY = 'ai_read_count';
const TRIAL_DAYS = 14;
export const AI_LIMIT = 100;

export function getTrialStart(): Date | null {
  const v = localStorage.getItem(TRIAL_START_KEY);
  return v ? new Date(v) : null;
}

export function initTrial(): void {
  if (!localStorage.getItem(TRIAL_START_KEY)) {
    localStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
  }
}

export function isTrialExpired(): boolean {
  const start = getTrialStart();
  if (!start) return false;
  const diff = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diff > TRIAL_DAYS;
}

export function getTrialDaysLeft(): number {
  const start = getTrialStart();
  if (!start) return TRIAL_DAYS;
  const diff = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - diff));
}

export function getAiReadCount(): number {
  return parseInt(localStorage.getItem(AI_COUNT_KEY) ?? '0', 10);
}

export function incrementAiReadCount(): void {
  const n = getAiReadCount() + 1;
  localStorage.setItem(AI_COUNT_KEY, String(n));
}

export function isAiLimitReached(): boolean {
  return getAiReadCount() >= AI_LIMIT;
}
