"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Sprite, Texture, Assets, Rectangle, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { villageMap, gridToIso, isoToGrid, getDepth, PropData } from '@/lib/villageMap';
import { createParticleSystem } from './ParticleSystem';
import { VirtualJoystick } from '../UI/VirtualJoystick';
import { AudioController } from './AudioController';
import { createCharacter } from './Character';
import { TavernModal } from '../TavernModal';
import { PlatformSelector } from '../PlatformSelector';
import { ChatList } from '../ChatList';
import { ChatExport } from '@/lib/types';
import { GalleryModal } from '../GalleryModal';
import { CatRoomModal } from '../CatRoomModal';
import { GameRoomModal } from '../GameRoomModal';

interface VillageProps {
    width?: number;
    height?: number;
}


interface PropConfig {
    x: number;
    y: number;
    w: number;
    h: number;
    sheet: { x: number; y: number };
}

// Combined spritesheet offsets (from village-sprites.json)
// Sheet 1 (Terrain): x=0, y=0, 2560x2560
// Sheet 2 (Props):   x=2560, y=0, 2560x2560
// Sheet 3 (Buildings): x=5120, y=0, 2560x2560
const SHEET_OFFSETS = [
    { x: 0, y: 0 },       // Assets 1 (Terrain)
    { x: 2560, y: 0 },    // Assets 2 (Props)
    { x: 5120, y: 0 },    // Assets 3 (Buildings)
    { x: 0, y: 2560 }     // Assets 4 (Vehicles)
];

// Terrain is a 10x10 grid at 256px per cell
const TERRAIN_CELL = 256;

// Props are at specific locations within their 2560x2560 section
const PROP_CONFIGS: Record<string, PropConfig> = {
    // Nature
    rock_small: { x: 19, y: 13, w: 213, h: 232, sheet: SHEET_OFFSETS[1] },
    rock_medium: { x: 276, y: 58, w: 208, h: 176, sheet: SHEET_OFFSETS[1] },
    rock_large: { x: 541, y: 559, w: 195, h: 190, sheet: SHEET_OFFSETS[1] },
    bush_small: { x: 1303, y: 47, w: 212, h: 190, sheet: SHEET_OFFSETS[1] },
    bush_large: { x: 1579, y: 115, w: 174, h: 118, sheet: SHEET_OFFSETS[1] },
    tree_pine: { x: 138, y: 1679, w: 540, h: 842, sheet: SHEET_OFFSETS[1] },
    tree_oak: { x: 1144, y: 1692, w: 592, h: 837, sheet: SHEET_OFFSETS[1] },
    flowers_pink: { x: 1331, y: 311, w: 145, h: 156, sheet: SHEET_OFFSETS[1] },
    flowers_red: { x: 1582, y: 346, w: 162, h: 131, sheet: SHEET_OFFSETS[1] },
    pot_small: { x: 554, y: 86, w: 180, h: 140, sheet: SHEET_OFFSETS[1] },
    potted_plant: { x: 840, y: 340, w: 114, h: 124, sheet: SHEET_OFFSETS[1] },
    grass_tall: { x: 1836, y: 56, w: 188, h: 154, sheet: SHEET_OFFSETS[1] },

    // Village Life
    barrel: { x: 1045, y: 26, w: 216, h: 212, sheet: SHEET_OFFSETS[1] },
    crate: { x: 792, y: 16, w: 210, h: 224, sheet: SHEET_OFFSETS[1] },
    lamp_post: { x: 2361, y: 1409, w: 151, h: 343, sheet: SHEET_OFFSETS[1] },
    sign_arrow: { x: 599, y: 457, w: 89, h: 135, sheet: SHEET_OFFSETS[1] },
    bench: { x: 1814, y: 298, w: 214, h: 191, sheet: SHEET_OFFSETS[1] },

    // Campsite / Misc
    tent: { x: 1096, y: 784, w: 141, h: 196, sheet: SHEET_OFFSETS[1] },
    stump: { x: 850, y: 1857, w: 114, h: 140, sheet: SHEET_OFFSETS[1] },
    cauldron: { x: 2100, y: 1450, w: 180, h: 190, sheet: SHEET_OFFSETS[1] },
    mailbox: { x: 400, y: 400, w: 100, h: 150, sheet: SHEET_OFFSETS[1] }, // Placeholder

    // Special Reference Assets (Forge, Anvil, Laundry, Stairs)
    forge: { x: 22, y: 827, w: 460, h: 408, sheet: SHEET_OFFSETS[1] },
    anvil: { x: 2090, y: 282, w: 164, h: 194, sheet: SHEET_OFFSETS[1] },
    laundry_line: { x: 606, y: 787, w: 329, h: 475, sheet: SHEET_OFFSETS[1] },
    stairs_stone: { x: 2090, y: 1824, w: 174, h: 195, sheet: SHEET_OFFSETS[1] },
    wagon_apples: { x: 602, y: 169, w: 354, h: 312, sheet: SHEET_OFFSETS[3] },
    bridge_wood: { x: 1863, y: 1471, w: 349, h: 289, sheet: SHEET_OFFSETS[1] },
};

// Buildings section
const BUILDING_CONFIGS: Record<string, PropConfig> = {
    cottage_small: { x: 65, y: 48, w: 906, h: 941, sheet: SHEET_OFFSETS[2] },
    cottage_medium: { x: 84, y: 1056, w: 917, h: 974, sheet: SHEET_OFFSETS[2] },
    cottage_large: { x: 1300, y: 42, w: 982, h: 1218, sheet: SHEET_OFFSETS[2] },
    well: { x: 1545, y: 1329, w: 242, h: 425, sheet: SHEET_OFFSETS[2] },
};

// Biome helper
const getBiomeAt = (x: number, y: number): 'forest' | 'orchard' | 'residential' | 'plaza' | 'default' => {
    // Adjusted logic for 28x28 map
    if (x < 5 || y < 5 || x > 23 || y > 23) return 'forest'; // Outskirts
    if (x >= 9 && x <= 19 && y >= 9 && y <= 19) return 'plaza'; // Center
    return 'default';
};

// Interaction Types & Map
type InteractionType = 'chat' | 'gallery' | 'cat_room' | 'game_room' | 'none';

const INTERACTION_MAP: Record<string, InteractionType> = {
    "8,8": "chat",     // Large Cottage -> Tavern/Chat
    "28,6": "gallery", // Medium Cottage -> Gallery
    "6,28": "cat_room", // Small Cottage -> Cat Room
    "28,28": "game_room", // Medium Cottage -> Game Room
};

export function Village({ width = 1920, height = 1080 }: VillageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const viewportRef = useRef<Viewport | null>(null);
    const characterRef = useRef<import('./Character').CharacterController | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Interaction State
    const [activeInteraction, setActiveInteraction] = useState<InteractionType | null>(null);
    const [chatData, setChatData] = useState<ChatExport | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let app: Application | null = null;
        let viewport: Viewport | null = null;
        let mounted = true;
        let resizeHandler: (() => void) | null = null;
        let particleSystem: { update: (delta: number) => void; destroy: () => void; setType: (type: string) => void } | null = null;
        let character: import('./Character').CharacterController | null = null;

        const init = async () => {
            app = new Application();
            await app.init({
                resizeTo: window,
                backgroundColor: 0x2a1f2b,
                antialias: false,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            // Vignette Helper
            let vignette: Sprite | null = null;
            const createVignette = (w: number, h: number) => {
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const grd = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
                    grd.addColorStop(0, "rgba(0,0,0,0)");
                    grd.addColorStop(1, "rgba(0,0,0,0.8)");
                    ctx.fillStyle = grd;
                    ctx.fillRect(0, 0, w, h);
                }
                return Texture.from(canvas);
            };

            if (!mounted || !containerRef.current) return;

            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            const spritesheet = await Assets.load('/village/village-sprites.png');

            if (!mounted) return;

            // Tighter world bounds to keep the map centered and visible (matches diamond shape)
            const WORLD_WIDTH = 4800;
            const WORLD_HEIGHT = 2600;

            viewport = new Viewport({
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                worldWidth: WORLD_WIDTH,
                worldHeight: WORLD_HEIGHT,
                events: app.renderer.events,
            });

            // Handle Resize
            resizeHandler = () => {
                if (viewport) {
                    const w = window.innerWidth;
                    const h = window.innerHeight;

                    viewport.resize(w, h);

                    // Dynamic minScale to ensure world covers screen (no void)
                    // Use Math.max for cover (crop sides/top), Math.min for fit (show whole world + potential void)
                    // Given previous complaints about "cut", let's try to fit the whole world if possible, 
                    // but "max zoom out" usually means "show as much as possible without void".
                    // Let's use Math.max to avoid black bars.
                    const minScale = Math.max(w / WORLD_WIDTH, h / WORLD_HEIGHT);

                    // Clamp Zoom update
                    viewport.clampZoom({
                        minScale: minScale,
                        maxScale: 2.0,
                    });

                    // If current scale is less than new minScale, it will auto-adjust or we force it?
                    if (viewport.scale.x < minScale) {
                        viewport.setZoom(minScale);
                    }

                    viewport.moveCenter(2400, 1300);

                    // Resize Vignette
                    if (vignette) {
                        vignette.texture = createVignette(w, h);
                    }
                }
            };
            window.addEventListener('resize', resizeHandler);

            // Initial Scale
            const initialMinScale = Math.max(window.innerWidth / WORLD_WIDTH, window.innerHeight / WORLD_HEIGHT);

            viewport
                .drag()
                .pinch()
                .wheel()
                .decelerate()
                .clamp({
                    direction: 'all',
                    underflow: 'center',
                    left: 0,
                    right: WORLD_WIDTH,
                    top: 0,
                    bottom: WORLD_HEIGHT,
                })
                .clampZoom({
                    minScale: initialMinScale,
                    maxScale: 2.0,
                });

            // Set initial zoom to slightly zoomed in or minScale?
            // Let's start at a comfortable level (0.45) but respecting minScale.
            viewport.setZoom(Math.max(0.45, initialMinScale));

            app.stage.addChild(viewport);
            viewportRef.current = viewport;

            // Debug Border - Removed
            // Init Vignette
            vignette = new Sprite(createVignette(window.innerWidth, window.innerHeight));
            vignette.eventMode = 'none';
            app.stage.addChild(vignette);

            const groundContainer = new Container();
            const objectsContainer = new Container();

            // Center the container within the 4800x2600 world
            // Map Dimensions: 36x36 tiles
            groundContainer.x = 2400;
            groundContainer.y = 150;
            objectsContainer.x = 2400;
            objectsContainer.y = 150;
            objectsContainer.sortableChildren = true;

            viewport.addChild(groundContainer);
            viewport.addChild(objectsContainer);

            // Create particle system
            particleSystem = createParticleSystem(app.stage, width, height) as any;

            viewport.moveCenter(2400, 1300); // Center of the map
            viewport.setZoom(0.45); // Optimal zoom for full view

            const { tiles, tileSize } = villageMap;
            const BUFFER = 8; // Visual buffer size (reduced from 12)

            for (let y = -BUFFER; y < tiles.length + BUFFER; y++) {
                for (let x = -BUFFER; x < tiles[0].length + BUFFER; x++) {

                    // Check if inside playable area
                    const isPlayable = x >= 0 && x < tiles[0].length && y >= 0 && y < tiles.length;

                    let tileId = 0;
                    if (isPlayable) {
                        tileId = tiles[y][x];
                    } else {
                        tileId = 5; // Buffer / Outskirts
                    }

                    let col = 0;
                    let row = 3;
                    let tint = 0xFFFFFF;

                    const rand = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

                    if (tileId === 0) {
                        col = 3; row = 3; // Grass
                        if (rand > 0.8) tint = 0xE8F5E9;
                    } else if (tileId === 1) {
                        col = 2; row = 3; // Dirt Path
                    } else if (tileId === 2) {
                        col = 7; row = 3; // Stone Plaza (Updated)
                    } else if (tileId === 3) {
                        col = 7; row = 2; // Water
                    } else if (tileId === 4) {
                        col = 1; row = 3; // Wood floor
                    } else if (tileId === 5) {
                        col = 19; row = 1; // Outskirts
                    }

                    const localX = col * TERRAIN_CELL;
                    const localY = row * TERRAIN_CELL;
                    const srcX = SHEET_OFFSETS[0].x + localX;
                    const srcY = SHEET_OFFSETS[0].y + localY;

                    const texture = new Texture({
                        source: spritesheet.source,
                        frame: new Rectangle(srcX, srcY, TERRAIN_CELL, TERRAIN_CELL),
                    });

                    const sprite = new Sprite(texture);
                    sprite.anchor.set(0.5, 0.75);
                    const isoPos = gridToIso(x, y, tileSize);
                    sprite.x = isoPos.x;
                    sprite.y = isoPos.y;
                    sprite.scale.set(0.505);
                    sprite.tint = tint;
                    groundContainer.addChild(sprite);

                    // Buffer Zone Props (Dense Forest + Vegetation)
                    if (!isPlayable) {
                        const zoneNoise = (Math.sin(x * 45.123 + y * 91.532) * 54321.123) % 1;

                        // Decide what to spawn based on noise
                        let propType: string | null = null;

                        // Trees (High Density in deep buffer, less near edge)
                        if (Math.abs(zoneNoise) > 0.3) {
                            propType = Math.abs(zoneNoise) > 0.6 ? 'tree_pine' : 'tree_oak';
                        }
                        // Bushes & Flowers (Medium density filler)
                        else if (Math.abs(zoneNoise) > 0.15) {
                            const subNoise = (Math.sin(x * 12.34 + y * 56.78) * 12345.67) % 1;
                            if (subNoise > 0.6) propType = 'bush_large';
                            else if (subNoise > 0.3) propType = 'bush_small';
                            else if (subNoise > 0.0) propType = 'grass_tall';
                            else if (subNoise > -0.5) propType = 'flowers_pink';
                            else propType = 'flowers_red';
                        }

                        if (propType) {
                            const config = PROP_CONFIGS[propType];
                            if (!config) continue;

                            const propTex = new Texture({
                                source: spritesheet.source,
                                frame: new Rectangle(config.sheet.x + config.x, config.sheet.y + config.y, config.w, config.h),
                            });
                            const propSpr = new Sprite(propTex);
                            propSpr.anchor.set(0.5, 0.95);

                            // Jitter
                            const jx = (Math.random() - 0.5) * 40;
                            const jy = (Math.random() - 0.5) * 40;
                            propSpr.x = isoPos.x + jx;
                            propSpr.y = isoPos.y + jy;

                            const scaleBase = propType.includes('tree') ? 0.35 : 0.4;
                            const scaleRand = 0.8 + (Math.random() * 0.4);
                            propSpr.scale.set(scaleBase * scaleRand);

                            // Setup Animation Data
                            const animData = {
                                id: propType,
                                x: x,
                                y: y,
                                animated: true,
                                animationType: 'sway'
                            };
                            (propSpr as any).animData = animData;
                            (propSpr as any).baseRotation = (Math.random() - 0.5) * 0.1; // Initial tilt
                            propSpr.rotation = (propSpr as any).baseRotation;

                            // Depth sort manually here since we are generating them outside the main prop loop
                            // Or add to objectsContainer and let it sort?
                            // Yes, add to objectsContainer.
                            propSpr.zIndex = getDepth(x, y, 0);
                            objectsContainer.addChild(propSpr);
                        }
                    }
                }
            }

            // ... (rest of props loop)
            objectsContainer.sortableChildren = true;

            for (const prop of villageMap.props) {
                const config = PROP_CONFIGS[prop.id] || BUILDING_CONFIGS[prop.id];
                if (!config) continue;

                const texture = new Texture({
                    source: spritesheet.source,
                    frame: new Rectangle(config.sheet.x + config.x, config.sheet.y + config.y, config.w, config.h),
                });

                const sprite = new Sprite(texture);
                sprite.anchor.set(0.5, 0.95);

                // Interaction for Buildings
                if (prop.id.includes('cottage')) {
                    sprite.eventMode = 'static';
                    sprite.cursor = 'pointer';

                    const houseKey = `${prop.x},${prop.y}`;
                    const interactionType = INTERACTION_MAP[houseKey];

                    if (interactionType) {
                        sprite.on('pointerdown', () => {
                            setActiveInteraction(interactionType);
                        });
                        // Hover effect
                        sprite.on('pointerover', () => { sprite.tint = 0xdddddd; });
                        sprite.on('pointerout', () => { sprite.tint = 0xFFFFFF; });
                    }
                }

                const level = (prop as any).z || 0;
                const isoPos = gridToIso(prop.x, prop.y, tileSize);

                // Add minor jitter for natural look
                const jitter = (Math.sin(prop.x * 0.5 + prop.y) * 10);
                sprite.x = isoPos.x + jitter;
                sprite.y = isoPos.y + jitter - (level * 24); // 24px vertical offset per level

                // Natural perturbation
                const scaleBase = prop.id.includes('tree') ? 0.35 : 0.4;
                const scaleRand = 0.95 + (Math.random() * 0.1);
                sprite.scale.set(scaleBase * scaleRand);

                // Inject animation props if vegetation
                const isVegetation = ['tree', 'bush', 'flower', 'grass'].some(k => prop.id.startsWith(k));
                if (isVegetation) {
                    (prop as any).animated = true;
                    (prop as any).animationType = 'sway';
                    (sprite as any).baseRotation = (Math.random() - 0.5) * 0.05;
                } else {
                    (sprite as any).baseRotation = (Math.random() - 0.5) * 0.05;
                }

                sprite.rotation = (sprite as any).baseRotation || 0;

                (sprite as any).animData = prop;
                sprite.zIndex = getDepth(prop.x, prop.y, level);
                objectsContainer.addChild(sprite);
            }

            // Spawn Character near plaza center
            character = await createCharacter(objectsContainer, 18, 18, tileSize);
            characterRef.current = character;

            let time = 0;
            app.ticker.add((ticker) => {
                // Slower time for relaxed wind
                time += ticker.deltaTime * 0.01;

                if (particleSystem) {
                    particleSystem.update(ticker.deltaTime);
                }

                if (character) {
                    character.update(ticker.deltaTime);

                    // Use logical iso coords
                    const gridPos = isoToGrid(character.isoX, character.isoY, tileSize);
                    const gx = Math.max(0, Math.min(villageMap.width - 1, Math.floor(gridPos.x)));
                    const gy = Math.max(0, Math.min(villageMap.height - 1, Math.floor(gridPos.y)));

                    const currentLevel = villageMap.elevation[gy][gx] || 0;

                    // Visually offset character based on current level
                    character.sprite.y = character.isoY - (currentLevel * 24);
                    character.sprite.zIndex = getDepth(gridPos.x, gridPos.y, currentLevel);

                    // Update particle biome
                    const biome = getBiomeAt(gridPos.x, gridPos.y);
                    if (particleSystem) {
                        if (biome === 'forest') particleSystem.setType('leaves');
                        else if (biome === 'plaza') particleSystem.setType('petals');
                        else particleSystem.setType('default');
                    }
                }

                objectsContainer.children.forEach((child) => {
                    const sprite = child as Sprite;
                    const animData = (child as any).animData as PropData | undefined;
                    // Skip character container or non-anim data
                    if (!animData) return;

                    if (animData.animated) {
                        if (animData.animationType === 'sway') {
                            const baseRot = (child as any).baseRotation || 0;

                            // Wind paramters based on type
                            let speed = 2.0;
                            let mag = 0.05;

                            if (animData.id.includes('tree')) { speed = 1.5; mag = 0.03; } // Slow heave
                            else if (animData.id.includes('flower') || animData.id.includes('grass')) { speed = 4.0; mag = 0.08; } // Flutter
                            else if (animData.id.includes('bush')) { speed = 2.5; mag = 0.04; }

                            // Combine overarching wind (time) with local variance (x/y)
                            const wind = Math.sin(time * speed + (animData.x * 0.5) + (animData.y * 0.3));
                            sprite.rotation = baseRot + wind * mag;

                        } else if (animData.animationType === 'flicker') {
                            sprite.alpha = 0.85 + Math.sin(time * 4 + animData.x) * 0.15;
                        }
                    }
                });
            });

            setIsLoading(false);
        };

        init();

        return () => {
            mounted = false;
            // Cleanup Resize Listener
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }

            if (particleSystem) particleSystem.destroy();
            if (character) character.destroy();
            if (app) {
                app.destroy(true, { children: true, texture: true });
            }
        };
    }, []); // Removed [width, height] dependency since we use window now.

    const handleJoystickMove = (x: number, y: number) => {
        if (characterRef.current) {
            characterRef.current.setInput(x, y);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#1a111a] overflow-hidden select-none touch-none">
            <AudioController src="/village/ambience.mp3" />
            <div ref={containerRef} className="w-full h-full cursor-move" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#2a1f2b] pointer-events-none z-50">
                    <div className="text-white/60 font-mono text-sm animate-pulse">
                        Loading Village...
                    </div>
                </div>
            )}
            <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono select-none pointer-events-none z-10">
                Drag to Pan • Scroll to Zoom • Arrow Keys to Move
            </div>

            {/* Joystick Overlay - Fixed to Viewport */}
            <div className="fixed bottom-12 right-12 z-50 md:hidden touch-none">
                <VirtualJoystick onMove={handleJoystickMove} />
            </div>
            {/* Desktop Joystick for testing */}
            <div className="fixed bottom-12 right-12 z-50 hidden md:block opacity-50 hover:opacity-100 transition-opacity">
                <VirtualJoystick onMove={handleJoystickMove} />
            </div>

            {/* Interactions */}
            <TavernModal isOpen={activeInteraction === 'chat'} onClose={() => setActiveInteraction(null)}>
                {chatData ? (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-[#5d4037]/20 bg-[#5d4037]/5">
                            <button
                                onClick={() => setChatData(null)}
                                className="text-[#5d4037] hover:text-[#3e2723] font-serif underline decoration-dotted"
                            >
                                ← Back to Archives
                            </button>
                            <span className="font-serif text-[#5d4037] font-bold">{chatData.fileName}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatList messages={chatData.messages} />
                        </div>
                    </div>
                ) : (
                    <PlatformSelector onLoadComplete={setChatData} />
                )}
            </TavernModal>

            <CatRoomModal isOpen={activeInteraction === 'cat_room'} onClose={() => setActiveInteraction(null)} />
            <GameRoomModal isOpen={activeInteraction === 'game_room'} onClose={() => setActiveInteraction(null)} />
            <GalleryModal isOpen={activeInteraction === 'gallery'} onClose={() => setActiveInteraction(null)} />

        </div>
    );
}
