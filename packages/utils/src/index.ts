import crypto from 'crypto';

// ─── ID Generation ───────────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID();
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ─── Cricket Helpers ─────────────────────────────────────────────────────────

export function oversToString(completedOvers: number, ballsInOver: number): string {
  return `${completedOvers}.${ballsInOver}`;
}

export function calculateRunRate(runs: number, overs: number, balls: number): number {
  const totalOvers = overs + balls / 6;
  if (totalOvers === 0) return 0;
  return Math.round((runs / totalOvers) * 100) / 100;
}

export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  remainingOvers: number,
  remainingBalls: number,
): number {
  const totalRemainingOvers = remainingOvers + remainingBalls / 6;
  if (totalRemainingOvers <= 0) return Infinity;
  const runsNeeded = target - currentRuns;
  return Math.round((runsNeeded / totalRemainingOvers) * 100) / 100;
}

export function calculateStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return Math.round((runs / balls) * 100 * 100) / 100;
}

export function calculateEconomy(runs: number, overs: number, balls: number): number {
  const totalOvers = overs + balls / 6;
  if (totalOvers === 0) return 0;
  return Math.round((runs / totalOvers) * 100) / 100;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// ─── Async Helpers ───────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {},
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(delay * Math.pow(backoff, attempt));
    }
  }

  throw new Error('Retry failed'); // unreachable but satisfies TS
}

// ─── Environment ─────────────────────────────────────────────────────────────

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
