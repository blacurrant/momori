import {
  Container,
  Sprite,
  Texture,
  Rectangle,
  Assets,
  AnimatedSprite,
} from "pixi.js";
import { gridToIso, isoToGrid, isWalkable, villageMap } from "@/lib/villageMap";

export interface CharacterController {
  container: Container;
  update: (delta: number) => void;
  destroy: () => void;
  setInput: (x: number, y: number) => void;
  sprite: AnimatedSprite;
  isoX: number;
  isoY: number;
}

// ─── Sprite-sheet layout ──────────────────────────────────────────
// cat.png  1792 × 576  →  11 cols × 4 rows  →  ~162 × 144 per frame
//
//  Row 0  Walk cycle (11 frames)
//  Row 1  Directional turnaround (11 poses)
//  Row 2  Sitting idle (first few frames; rest empty)
//  Row 3  Special actions (lie, yarn-play, stand)
// ──────────────────────────────────────────────────────────────────

const FRAME_W = Math.floor(1792 / 11); // 162
const FRAME_H = 144;
const COLS = 11;

// Which column of Row 1 to use for each facing direction idle frame
// 11 poses spread across 8 directions (approximate mapping)
const IDLE_FRAME_COL: Record<string, number> = {
  down: 0,
  "down-left": 1,
  left: 3,
  "up-left": 4,
  up: 5,
  "up-right": 7,
  right: 8,
  "down-right": 10,
};

const SIT_IDLE_DELAY = 180; // frames (~3 s at 60 fps) before sitting
const MAP_SIZE = 28; // from villageMap

export async function createCharacter(
  parent: Container,
  x: number,
  y: number,
  tileSize: number,
): Promise<CharacterController> {
  const sheetTexture = await Assets.load("/village/cat.png");

  // ── Build frame textures ────────────────────────────────────────
  const makeFrame = (col: number, row: number) =>
    new Texture({
      source: sheetTexture.source,
      frame: new Rectangle(col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H),
    });

  // Row 0 – walk cycle (all 11 frames)
  const walkFrames: Texture[] = [];
  for (let c = 0; c < COLS; c++) walkFrames.push(makeFrame(c, 0));

  // Row 1 – directional idle (one frame per direction)
  const idleFrames: Record<string, Texture> = {};
  for (const [dir, col] of Object.entries(IDLE_FRAME_COL)) {
    idleFrames[dir] = makeFrame(col, 1);
  }

  // Row 2 – sitting (first 3 frames)
  const sitFrames: Texture[] = [];
  for (let c = 0; c < 3; c++) sitFrames.push(makeFrame(c, 2));

  // Row 3 – special / yarn-play (11 frames, reserved for future)
  const specialFrames: Texture[] = [];
  for (let c = 0; c < COLS; c++) specialFrames.push(makeFrame(c, 3));

  // ── AnimatedSprite setup ────────────────────────────────────────
  // Start with the idle-down frame so initial state is consistent
  const sprite = new AnimatedSprite([idleFrames["down"]]);
  sprite.animationSpeed = 0.15;
  sprite.anchor.set(0.5, 0.85);
  sprite.scale.set(0.5);
  sprite.gotoAndStop(0);

  // ── State ───────────────────────────────────────────────────────
  const speed = 4;
  let currentDir = "down";
  let isMoving = false;
  let idleTimer = 0;
  let isSitting = false;

  type AnimState = "walk" | "idle" | "sit";
  let animState: AnimState = "idle";

  // Logical isometric position (Village.tsx adjusts visual Y for elevation)
  const isoStart = gridToIso(x, y, tileSize);
  let isoX = isoStart.x;
  let isoY = isoStart.y;
  sprite.x = isoX;
  sprite.y = isoY;

  // ── Input ───────────────────────────────────────────────────────
  const keys: Record<string, boolean> = {};
  const inputVector = { x: 0, y: 0 };
  const onKeyDown = (e: KeyboardEvent) => {
    keys[e.code] = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    keys[e.code] = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  parent.addChild(sprite);
  (sprite as any).isCharacter = true;

  // ── Helpers ─────────────────────────────────────────────────────
  const getGridPos = (ix: number, iy: number) => isoToGrid(ix, iy, tileSize);

  /** Determine 8-way direction from velocity */
  const dirFromVelocity = (vx: number, vy: number): string => {
    if (vx === 0 && vy < 0) return "up";
    if (vx === 0 && vy > 0) return "down";
    if (vx < 0 && vy === 0) return "left";
    if (vx > 0 && vy === 0) return "right";
    if (vx < 0 && vy < 0) return "up-left";
    if (vx > 0 && vy < 0) return "up-right";
    if (vx < 0 && vy > 0) return "down-left";
    if (vx > 0 && vy > 0) return "down-right";
    return currentDir;
  };

  /** Switch animation state & textures */
  const setAnim = (state: AnimState) => {
    if (state === animState) return;
    animState = state;

    if (state === "walk") {
      sprite.textures = walkFrames;
      sprite.animationSpeed = 0.15;
      sprite.play();
    } else if (state === "sit") {
      sprite.textures = sitFrames;
      sprite.animationSpeed = 0.08;
      sprite.play();
    } else {
      // idle – single frame
      const idleTex = idleFrames[currentDir] || idleFrames["down"];
      sprite.textures = [idleTex];
      sprite.gotoAndStop(0);
    }
  };

  // ── Update loop ─────────────────────────────────────────────────
  const update = (delta: number) => {
    let vx = 0;
    let vy = 0;

    // Keyboard input
    if (keys["ArrowUp"] || keys["KeyW"]) vy -= 1;
    if (keys["ArrowDown"] || keys["KeyS"]) vy += 1;
    if (keys["ArrowLeft"] || keys["KeyA"]) vx -= 1;
    if (keys["ArrowRight"] || keys["KeyD"]) vx += 1;

    // Combine with Joystick input
    vx += inputVector.x;
    vy += inputVector.y;

    // Clamp magnitude to 1 if exceeding (so diagonal keyboard + joystick isn't super fast)
    const mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }

    // Apply speed
    vx *= speed;
    vy *= speed;

    isMoving = mag > 0.1; // Threshold for movement

    // Normalize diagonal is handled above by clamping magnitude

    // ── Guardrails: boundary + collision (wall-slide) ─────────
    const currentGrid = getGridPos(isoX, isoY);

    // Try X axis independently
    const tryX = isoX + vx * delta;
    const gridAfterX = getGridPos(tryX, isoY);

    // Only block if we'd enter a DIFFERENT grid cell that is non-walkable
    const xChangesCell =
      Math.round(gridAfterX.x) !== Math.round(currentGrid.x) ||
      Math.round(gridAfterX.y) !== Math.round(currentGrid.y);

    if (!xChangesCell) {
      // Sub-tile movement, always allow
      isoX = tryX;
    } else if (
      gridAfterX.x >= 0 &&
      gridAfterX.x < MAP_SIZE &&
      gridAfterX.y >= 0 &&
      gridAfterX.y < MAP_SIZE &&
      isWalkable(gridAfterX.x, gridAfterX.y)
    ) {
      isoX = tryX;
    }

    // Try Y axis independently (wall-slide)
    const tryY = isoY + vy * delta;
    const gridAfterY = getGridPos(isoX, tryY);

    const yChangesCell =
      Math.round(gridAfterY.x) !== Math.round(currentGrid.x) ||
      Math.round(gridAfterY.y) !== Math.round(currentGrid.y);

    if (!yChangesCell) {
      isoY = tryY;
    } else if (
      gridAfterY.x >= 0 &&
      gridAfterY.x < MAP_SIZE &&
      gridAfterY.y >= 0 &&
      gridAfterY.y < MAP_SIZE &&
      isWalkable(gridAfterY.x, gridAfterY.y)
    ) {
      isoY = tryY;
    }

    // Final hard clamp: never let logical grid pos escape [0, MAP_SIZE-1]
    const finalGrid = getGridPos(isoX, isoY);
    if (
      finalGrid.x < 0 ||
      finalGrid.x >= MAP_SIZE ||
      finalGrid.y < 0 ||
      finalGrid.y >= MAP_SIZE
    ) {
      // Revert to safe position
      const safeGrid = {
        x: Math.max(0, Math.min(MAP_SIZE - 1, finalGrid.x)),
        y: Math.max(0, Math.min(MAP_SIZE - 1, finalGrid.y)),
      };
      const safeIso = gridToIso(safeGrid.x, safeGrid.y, tileSize);
      isoX = safeIso.x;
      isoY = safeIso.y;
    }

    // Update sprite logical position
    sprite.x = isoX;
    sprite.y = isoY;

    // ── Animation state machine ───────────────────────────────
    if (isMoving) {
      const newDir = dirFromVelocity(vx, vy);
      currentDir = newDir;
      idleTimer = 0;
      isSitting = false;

      // Flip sprite horizontally for rightward directions
      // If the source sprite faces RIGHT by default:
      // - No flip (positive scale) = Right
      // - Flip (negative scale) = Left
      const facingRight =
        currentDir === "right" ||
        currentDir === "up-right" ||
        currentDir === "down-right";

      // If source is right-facing:
      // facingRight -> positive scale
      // facingLeft -> negative scale
      sprite.scale.x = facingRight
        ? Math.abs(sprite.scale.x)
        : -Math.abs(sprite.scale.x);

      setAnim("walk");
    } else {
      // Not moving
      idleTimer += delta;

      if (idleTimer > SIT_IDLE_DELAY && !isSitting) {
        isSitting = true;
        setAnim("sit");
      } else if (!isSitting) {
        // Only update idle frame if we're not already in idle state OR direction changed
        // causing a texture update (handled inside setAnim optimization or here)
        if (animState !== "idle") {
          setAnim("idle");
        } else {
          // If already idle, check if we need to update the texture for a new direction
          // (though direction only changes when moving, so this might be redundant unless logic changes)
          // But mostly, we just stay in idle.
          // Ensure the frame is correct for the current direction if we drifted
          const idleTex = idleFrames[currentDir] || idleFrames["down"];
          if (sprite.textures[0] !== idleTex) {
            sprite.textures = [idleTex];
            sprite.gotoAndStop(0);
          }
        }
      }
    }
  };

  // ── Cleanup ─────────────────────────────────────────────────────
  const destroy = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    sprite.destroy();
  };

  const setInput = (x: number, y: number) => {
    inputVector.x = x;
    inputVector.y = y;
  };

  return {
    container: sprite as unknown as Container,
    update,
    destroy,
    setInput,
    sprite,
    get isoX() {
      return isoX;
    },
    get isoY() {
      return isoY;
    },
  };
}
