// ─── Common ──────────────────────────────────────────────────────────────────

export type UUID = string;
export type Timestamp = string; // ISO 8601

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: any;
  error?: string;
  message?: string;
  timestamp: Timestamp;
}

export interface HealthCheckResponse {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: Timestamp;
  dependencies?: Record<string, 'up' | 'down'>;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: UUID;
  name: string;
  jersey: number;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle?: BowlingStyle;
  teamId: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlayerRole = 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
export type BattingStyle = 'right-hand' | 'left-hand';
export type BowlingStyle =
  | 'right-arm-fast'
  | 'right-arm-medium'
  | 'left-arm-fast'
  | 'left-arm-medium'
  | 'right-arm-offspin'
  | 'right-arm-legspin'
  | 'left-arm-orthodox'
  | 'left-arm-chinaman';

// ─── Team ────────────────────────────────────────────────────────────────────

export interface Team {
  id: UUID;
  name: string;
  shortName: string;
  logo?: string;
  players: Player[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Match ───────────────────────────────────────────────────────────────────

export interface Match {
  id: UUID;
  title: string;
  format: MatchFormat;
  status: MatchStatus;
  venue: string;
  toss?: TossResult;
  teamA: Team;
  teamB: Team;
  innings: Innings[];
  result?: MatchResult;
  scheduledAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MatchFormat = 'T20' | 'ODI' | 'Test';
export type MatchStatus =
  | 'scheduled'
  | 'toss'
  | 'live'
  | 'innings-break'
  | 'drinks'
  | 'rain-delay'
  | 'completed'
  | 'abandoned';

export interface TossResult {
  wonBy: UUID; // team ID
  decision: 'bat' | 'field';
}

export interface MatchResult {
  winner?: UUID; // team ID, undefined for tie/draw
  resultType: 'runs' | 'wickets' | 'tie' | 'draw' | 'no-result';
  margin?: number;
  description: string;
}

// ─── Innings ─────────────────────────────────────────────────────────────────

export interface Innings {
  id: UUID;
  matchId: UUID;
  number: number; // 1, 2, 3, 4 (for Test)
  battingTeamId: UUID;
  bowlingTeamId: UUID;
  status: InningsStatus;
  overs: Over[];
  totalRuns: number;
  totalWickets: number;
  totalExtras: Extras;
  oversCompleted: number;
  ballsInCurrentOver: number;
  target?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InningsStatus = 'upcoming' | 'in-progress' | 'completed' | 'declared';

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
  total: number;
}

// ─── Over ────────────────────────────────────────────────────────────────────

export interface Over {
  number: number; // 0-indexed
  bowlerId: UUID;
  balls: Ball[];
  runs: number;
  wickets: number;
  maidenOver: boolean;
}

// ─── Ball / Delivery ─────────────────────────────────────────────────────────

export interface Ball {
  id: UUID;
  inningsId: UUID;
  overNumber: number;
  ballNumber: number; // within the over (1-6)
  batsmanId: UUID;
  bowlerId: UUID;
  nonStrikerId: UUID;
  runs: BallRuns;
  isWicket: boolean;
  wicket?: WicketInfo;
  isExtra: boolean;
  extraType?: ExtraType;
  shotType?: string;
  commentary?: string;
  timestamp: Timestamp;
}

export interface BallRuns {
  batsmanRuns: number;
  extraRuns: number;
  totalRuns: number;
}

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';

export interface WicketInfo {
  type: WicketType;
  playerId: UUID; // player dismissed
  fielderId?: UUID;
  bowlerId: UUID;
}

export type WicketType =
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'run-out'
  | 'stumped'
  | 'hit-wicket'
  | 'retired-hurt'
  | 'obstructing-field'
  | 'timed-out'
  | 'handled-ball';

// ─── Scorecard ───────────────────────────────────────────────────────────────

export interface BattingEntry {
  playerId: UUID;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: string;
  isNotOut: boolean;
}

export interface BowlingEntry {
  playerId: UUID;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
}

export interface ScoreCard {
  matchId: UUID;
  innings: InningsScoreCard[];
}

export interface InningsScoreCard {
  inningsNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  extras: Extras;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  runRate: number;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export interface DomainEvent<T = unknown> {
  id: UUID;
  type: EventType;
  source: string;
  payload: T;
  timestamp: Timestamp;
  correlationId?: UUID;
}

export type EventType =
  // Match events
  | 'match.created'
  | 'match.started'
  | 'match.completed'
  | 'match.abandoned'
  | 'match.toss'
  // Innings events
  | 'innings.started'
  | 'innings.completed'
  | 'innings.declared'
  // Scoring events
  | 'ball.bowled'
  | 'wicket.fallen'
  | 'over.completed'
  | 'milestone.reached'
  // Stats events
  | 'stats.updated'
  | 'scorecard.updated';

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface SocketEvents {
  // Client → Server
  'match:join': { matchId: UUID };
  'match:leave': { matchId: UUID };

  // Server → Client
  'match:update': Match;
  'score:update': { matchId: UUID; innings: Innings };
  'ball:update': { matchId: UUID; ball: Ball };
  'wicket:alert': { matchId: UUID; wicket: WicketInfo };
  'milestone:alert': { matchId: UUID; playerId: UUID; milestone: string };
}

// ─── Service Config ──────────────────────────────────────────────────────────

export interface ServiceConfig {
  name: string;
  port: number;
  env: 'development' | 'production' | 'test';
  db?: DatabaseConfig;
  redis?: RedisConfig;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}
