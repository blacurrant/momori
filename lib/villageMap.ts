// Helper to convert grid coordinates to isometric screen coordinates
export const gridToIso = (x: number, y: number, tileSize: number) => {
  const tileHalfWidth = tileSize;
  const tileHalfHeight = tileSize / 2;
  return {
    x: (x - y) * tileHalfWidth,
    y: (x + y) * tileHalfHeight,
  };
};

// Helper to convert isometric screen coordinates to grid coordinates
export const isoToGrid = (
  screenX: number,
  screenY: number,
  tileSize: number,
) => {
  const tileHalfWidth = tileSize;
  const tileHalfHeight = tileSize / 2; // Iso transform inverse

  const a = screenX / tileHalfWidth;
  const b = screenY / tileHalfHeight;

  return {
    x: Math.round((a + b) / 2),
    y: Math.round((b - a) / 2),
  };
};

// Helper for isometric depth sorting
export const getDepth = (x: number, y: number, z: number = 0) => {
  return (x + y) * 100 + z * 10;
};

export interface PropData {
  id: string;
  x: number;
  y: number;
  z?: number; // Elevation level
  rotation?: number;
  animated?: boolean;
  animationType?: "sway" | "flicker";
  collidable?: boolean; // Collision property
}

const MAP_SIZE = 36;

// Generate 36x36 map data
const generateMap = () => {
  const elevation = Array(MAP_SIZE)
    .fill(0) // Flat map
    .map(() => Array(MAP_SIZE).fill(0));

  const tiles = Array(MAP_SIZE)
    .fill(0) // Default Grass (0)
    .map(() => Array(MAP_SIZE).fill(0));

  // 1. Central Plaza (Stone ID 2)
  // Center is ~18,18
  const centerX = 17.5;
  const centerY = 17.5;
  const radius = 6;

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        // Outer rim is dirt (ID 1), inner is stone (ID 2)
        tiles[y][x] = dist > radius - 1.2 ? 1 : 2;
      }
    }
  }

  // 2. S-Curve Path 1 (Dirt ID 1) - Top-Left to Bottom-Right
  for (let i = 0; i <= 100; i++) {
    const t = i / 100; // Cubic Bezier: P0(0,0), P1(25,5), P2(5,30), P3(35,35)

    const cx =
      Math.pow(1 - t, 3) * 0 +
      3 * Math.pow(1 - t, 2) * t * 25 +
      3 * (1 - t) * Math.pow(t, 2) * 5 +
      Math.pow(t, 3) * 35;

    const cy =
      Math.pow(1 - t, 3) * 0 +
      3 * Math.pow(1 - t, 2) * t * 5 +
      3 * (1 - t) * Math.pow(t, 2) * 30 +
      Math.pow(t, 3) * 35;

    const tx = Math.floor(cx);
    const ty = Math.floor(cy);

    if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
      if (tiles[ty][tx] === 0) tiles[ty][tx] = 1;
      if (tx + 1 < MAP_SIZE && tiles[ty][tx + 1] === 0) tiles[ty][tx + 1] = 1;
    }
  }

  // 3. S-Curve Path 2 (Dirt ID 1) - Top-Right to Bottom-Left
  for (let i = 0; i <= 100; i++) {
    const t = i / 100; // Cubic Bezier: P0(35,0), P1(10,5), P2(30,30), P3(0,35)

    const cx =
      Math.pow(1 - t, 3) * 35 +
      3 * Math.pow(1 - t, 2) * t * 10 +
      3 * (1 - t) * Math.pow(t, 2) * 30 +
      Math.pow(t, 3) * 0;

    const cy =
      Math.pow(1 - t, 3) * 0 +
      3 * Math.pow(1 - t, 2) * t * 5 +
      3 * (1 - t) * Math.pow(t, 2) * 30 +
      Math.pow(t, 3) * 35;

    const tx = Math.floor(cx);
    const ty = Math.floor(cy);

    if (tx >= 0 && tx < MAP_SIZE && ty >= 0 && ty < MAP_SIZE) {
      if (tiles[ty][tx] === 0) tiles[ty][tx] = 1;
      if (tx + 1 < MAP_SIZE && tiles[ty][tx + 1] === 0) tiles[ty][tx + 1] = 1;
    }
  }

  // 4. Add Water on Outskirts (Edges)
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      // Distance from center (17.5, 17.5)
      const dx = x - 17.5;
      const dy = y - 17.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Noise-based water edges (simple deterministic noise)
      const noise = Math.sin(x * 0.5 + y * 0.3) + Math.cos(x * 0.3 - y * 0.5);

      // Edges are water if far and noisy (Radius ~16-18)
      // Map radius is 18.
      if (dist > 15 + noise * 1.5) {
        if (tiles[y][x] === 0) tiles[y][x] = 3; // Turn grass to water
      }
    }
  }

  return { elevation, tiles };
};

const mapData = generateMap();

export const villageMap = {
  width: MAP_SIZE,
  height: MAP_SIZE,
  tileSize: 64,

  elevation: mapData.elevation,
  tiles: mapData.tiles,

  props: [
    // --- PLAZA DECOR (Center ~18,18) ---
    { id: "well", x: 18, y: 18, z: 0, collidable: true },
    { id: "bench", x: 15, y: 18, z: 0, collidable: true },
    { id: "bench", x: 21, y: 18, z: 0, collidable: true },

    // 4 Lamps on corners
    { id: "lamp_post", x: 15, y: 15, z: 0, collidable: true },
    { id: "lamp_post", x: 21, y: 15, z: 0, collidable: true },
    { id: "lamp_post", x: 15, y: 21, z: 0, collidable: true },
    { id: "lamp_post", x: 21, y: 21, z: 0, collidable: true },

    { id: "flowers_pink", x: 17, y: 17, z: 0 },
    { id: "flowers_red", x: 19, y: 19, z: 0 },

    // --- HOUSES (Distributed) ---
    { id: "cottage_large", x: 8, y: 8, z: 0, collidable: true },
    { id: "cottage_medium", x: 28, y: 6, z: 0, collidable: true },
    { id: "cottage_small", x: 6, y: 28, z: 0, collidable: true },
    { id: "cottage_medium", x: 28, y: 28, z: 0, collidable: true },

    // --- WORKSTATIONS ---
    {
      id: "forge",
      x: 26,
      y: 29,
      z: 0,
      collidable: true,
      animated: true,
      animationType: "flicker",
    },
    { id: "anvil", x: 27, y: 30, z: 0, collidable: true },
    { id: "laundry_line", x: 30, y: 8, z: 0 },

    // --- CAMPSITE ---
    { id: "tent", x: 29, y: 12, z: 0, collidable: true },

    // --- FOREST OUTSKIRTS (Border Clusters) ---
    // Top-Left
    { id: "tree_pine", x: 1, y: 1, z: 0, collidable: true },
    { id: "tree_pine", x: 2, y: 1, z: 0, collidable: true },
    { id: "tree_oak", x: 3, y: 2, z: 0, collidable: true },

    // Top-Right
    { id: "tree_pine", x: 34, y: 1, z: 0, collidable: true },
    { id: "tree_pine", x: 33, y: 1, z: 0, collidable: true },
    { id: "tree_oak", x: 32, y: 10, z: 0, collidable: true },

    // Bottom-Left
    { id: "tree_pine", x: 1, y: 34, z: 0, collidable: true },
    { id: "tree_pine", x: 2, y: 34, z: 0, collidable: true },
    { id: "tree_oak", x: 3, y: 33, z: 0, collidable: true },

    // Bottom-Right
    { id: "tree_pine", x: 34, y: 34, z: 0, collidable: true },
    { id: "tree_pine", x: 33, y: 34, z: 0, collidable: true },
    { id: "tree_oak", x: 32, y: 32, z: 0, collidable: true },

    // Random Clutter
    { id: "rock_large", x: 4, y: 18, z: 0, collidable: true },
    { id: "bush_small", x: 18, y: 4, z: 0 },
    { id: "stump", x: 32, y: 32, z: 0 },
  ] as PropData[],
};

// Check if a tile is walkable
export const isWalkable = (x: number, y: number): boolean => {
  if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return false; // Check Grid Collision (e.g. Water)

  if (villageMap.tiles[Math.floor(y)][Math.floor(x)] === 3) return false; // Check Props
  // Use integer rounding

  const lx = Math.round(x);
  const ly = Math.round(y);

  const prop = villageMap.props.find(
    (p) => Math.round(p.x) === lx && Math.round(p.y) === ly,
  );
  if (prop && prop.collidable) return false;

  return true;
};
