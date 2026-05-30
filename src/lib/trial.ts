// トライアル管理（トライアル期間14日 - サーバーサイドでIP管理）

const TRIAL_START_KEY = 'trial_start';
const TRIAL_DAYS = 14;

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
