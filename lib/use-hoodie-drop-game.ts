"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "@/lib/game-config";
import { drawCoin, drawHoodiePlayer, drawRugObstacle } from "@/lib/sprites";

type FallingItem = {
  id: number;
  x: number;
  y: number;
  kind: "coin" | "obstacle";
  spin: number;
};

export type GameStatus = "idle" | "playing" | "gameover";

const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  STARTING_LIVES,
  ITEM_SIZE,
  BASE_FALL_SPEED,
  MAX_FALL_SPEED,
  BASE_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  OBSTACLE_CHANCE_START,
  OBSTACLE_CHANCE_MAX,
  COIN_SCORE,
} = GAME_CONFIG;

export function useHoodieDropGame(onGameOver: (score: number, durationMs: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState<number>(STARTING_LIVES);

  // Mutable game state refs (avoid re-render cost inside the loop)
  const playerX = useRef(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const facing = useRef<-1 | 0 | 1>(0);
  const keys = useRef<Set<string>>(new Set());
  const items = useRef<FallingItem[]>([]);
  const nextItemId = useRef(0);
  const lastSpawnAt = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const startTime = useRef(0);
  const dragActive = useRef(false);

  const reset = useCallback(() => {
    playerX.current = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    facing.current = 0;
    items.current = [];
    nextItemId.current = 0;
    lastSpawnAt.current = 0;
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    setScore(0);
    setLives(STARTING_LIVES);
    lastFrameTime.current = null;
    startTime.current = performance.now();
  }, []);

  const start = useCallback(() => {
    reset();
    setStatus("playing");
  }, [reset]);

  const endGame = useCallback(() => {
    setStatus("gameover");
    const durationMs = performance.now() - startTime.current;
    onGameOver(scoreRef.current, durationMs);
  }, [onGameOver]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)) {
        keys.current.add(e.key);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      keys.current.delete(e.key);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Pointer / touch drag control
  const handlePointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;
    const targetX = relativeX - PLAYER_WIDTH / 2;
    playerX.current = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, targetX));
  }, []);

  useEffect(() => {
    if (status !== "playing") return;

    function loop(t: number) {
      if (lastFrameTime.current === null) lastFrameTime.current = t;
      const dt = Math.min(0.05, (t - lastFrameTime.current) / 1000); // clamp for tab-switch spikes
      lastFrameTime.current = t;

      // difficulty scales with score
      const difficulty = Math.min(1, scoreRef.current / 1200);
      const fallSpeed = BASE_FALL_SPEED + difficulty * (MAX_FALL_SPEED - BASE_FALL_SPEED);
      const spawnInterval =
        BASE_SPAWN_INTERVAL - difficulty * (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
      const obstacleChance =
        OBSTACLE_CHANCE_START + difficulty * (OBSTACLE_CHANCE_MAX - OBSTACLE_CHANCE_START);

      // player movement via keyboard (drag handled by pointer events directly)
      if (!dragActive.current) {
        let dx = 0;
        if (keys.current.has("ArrowLeft") || keys.current.has("a")) dx -= 1;
        if (keys.current.has("ArrowRight") || keys.current.has("d")) dx += 1;
        facing.current = dx as -1 | 0 | 1;
        playerX.current = Math.max(
          0,
          Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerX.current + dx * PLAYER_SPEED * dt)
        );
      }

      // spawn items
      lastSpawnAt.current += dt * 1000;
      if (lastSpawnAt.current >= spawnInterval) {
        lastSpawnAt.current = 0;
        const kind: FallingItem["kind"] = Math.random() < obstacleChance ? "obstacle" : "coin";
        items.current.push({
          id: nextItemId.current++,
          x: Math.random() * (CANVAS_WIDTH - ITEM_SIZE),
          y: -ITEM_SIZE,
          kind,
          spin: 0,
        });
      }

      // update items + collision
      const playerRect = {
        x: playerX.current,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 12,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
      };

      const survivors: FallingItem[] = [];
      for (const item of items.current) {
        item.y += fallSpeed * dt;
        item.spin += dt * 6;

        const itemRect = { x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE };
        const collided =
          itemRect.x < playerRect.x + playerRect.w &&
          itemRect.x + itemRect.w > playerRect.x &&
          itemRect.y < playerRect.y + playerRect.h &&
          itemRect.y + itemRect.h > playerRect.y;

        if (collided) {
          if (item.kind === "coin") {
            scoreRef.current += COIN_SCORE;
            setScore(scoreRef.current);
          } else {
            livesRef.current -= 1;
            setLives(livesRef.current);
          }
          continue; // consumed, don't keep
        }

        if (item.y < CANVAS_HEIGHT + ITEM_SIZE) {
          survivors.push(item);
        }
      }
      items.current = survivors;

      if (livesRef.current <= 0) {
        endGame();
        return;
      }

      // render
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ground line
        ctx.strokeStyle = "rgba(237,233,226,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - 8);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 8);
        ctx.stroke();

        for (const item of items.current) {
          if (item.kind === "coin") {
            drawCoin(ctx, item.x, item.y, ITEM_SIZE, item.spin);
          } else {
            drawRugObstacle(ctx, item.x, item.y, ITEM_SIZE);
          }
        }

        drawHoodiePlayer(
          ctx,
          playerRect.x,
          playerRect.y,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          facing.current
        );
      }

      rafId.current = requestAnimationFrame(loop);
    }

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [status, endGame]);

  return {
    canvasRef,
    status,
    score,
    lives,
    start,
    handlePointerMove,
    setDragActive: (active: boolean) => {
      dragActive.current = active;
    },
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
  };
}
