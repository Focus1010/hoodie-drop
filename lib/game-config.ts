// Shared between client game loop and server-side score validation.

export const GAME_CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  PLAYER_WIDTH: 56,
  PLAYER_HEIGHT: 64,
  PLAYER_SPEED: 320, // px/sec
  STARTING_LIVES: 3,
  ITEM_SIZE: 32,
  BASE_FALL_SPEED: 140, // px/sec
  MAX_FALL_SPEED: 480,
  BASE_SPAWN_INTERVAL: 900, // ms
  MIN_SPAWN_INTERVAL: 280,
  OBSTACLE_CHANCE_START: 0.22,
  OBSTACLE_CHANCE_MAX: 0.5,
  COIN_SCORE: 10,
  DIFFICULTY_RAMP_PER_SCORE: 1, // how score maps to difficulty curve
} as const;

/**
 * Rough ceiling on how many points a session could plausibly generate,
 * used server-side to reject obviously spoofed submissions. This is
 * intentionally generous (not a tight anti-cheat) — a coin every ~280ms
 * at max difficulty for a long, skillful session.
 */
export function maxPlausibleScore(sessionDurationMs: number): number {
  const minMs = GAME_CONFIG.MIN_SPAWN_INTERVAL;
  const maxCoinsPerMs = 1 / minMs;
  const generousMultiplier = 1.5; // headroom for bursts/leniency
  return Math.ceil(
    sessionDurationMs * maxCoinsPerMs * GAME_CONFIG.COIN_SCORE * generousMultiplier
  );
}

// Absolute hard cap regardless of session length — nobody is scoring
// above this in a legit run of a simple catcher game.
export const ABSOLUTE_SCORE_CAP = 100_000;
