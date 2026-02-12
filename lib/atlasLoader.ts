import { Texture, Rectangle } from "pixi.js";

interface SpriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  anchor?: { x: number; y: number };
}

interface AtlasData {
  frames: Record<string, SpriteFrame>;
  meta: {
    image: string;
    size: { w: number; h: number };
    scale: string;
  };
}

/**
 * Parses a standard JSON Hash format texture atlas and returns a map of Textures.
 * @param baseTexture The source image texture (Pixi Texture)
 * @param atlasData The JSON data object
 */
export function parseTextureAtlas(
  baseTexture: Texture,
  atlasData: AtlasData,
): Record<string, Texture> {
  const textures: Record<string, Texture> = {};

  for (const [name, data] of Object.entries(atlasData.frames)) {
    const { x, y, w, h } = data.frame;

    // Create a texture for this frame
    // Note: We ignore rotation/trim for now as this specific atlas (Cat Room) seems simple.
    const frameTexture = new Texture({
      source: baseTexture.source,
      frame: new Rectangle(x, y, w, h),
    });

    textures[name] = frameTexture;
  }

  return textures;
}
