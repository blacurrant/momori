"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Sprite, Texture, Assets, Rectangle, Graphics } from 'pixi.js';
import { parseTextureAtlas } from '@/lib/atlasLoader';



// Reuse constants from Village.tsx
const TILE_SIZE = 64;
const TERRAIN_CELL = 256;

const gridToIso = (x: number, y: number) => {
    return {
        x: (x - y) * TILE_SIZE,
        y: (x + y) * (TILE_SIZE / 2)
    };
};

export function CatRoomCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let app: Application | null = null;
        let mounted = true;

        const init = async () => {
            // Create App
            const _app = new Application();
            await _app.init({
                resizeTo: containerRef.current!, // Resize to parent container
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (!mounted || !containerRef.current) {
                _app.destroy({ removeView: true });
                return;
            }

            containerRef.current.appendChild(_app.canvas);
            app = _app;

            // Load Assets
            const villageSprites = await Assets.load('/village/village-sprites.png');
            const catRoomTexture = await Assets.load('/village/cat room.png');

            let catTextures: Record<string, Texture> = {};
            try {
                const catRoomJson = await fetch('/village/cat room.json').then(res => res.json());
                catTextures = parseTextureAtlas(catRoomTexture, catRoomJson);
            } catch (e) {
                console.error("Failed to load cat room atlas", e);
            }

            if (!mounted) return;

            // --- 0. STARFIELD BACKGROUND (Depth) ---
            const starContainer = new Container();
            app.stage.addChild(starContainer);

            // Create 3 layers of stars
            const LAYERS = 3;
            const starLayers: Graphics[] = [];

            for (let i = 0; i < LAYERS; i++) {
                const layer = new Graphics();
                const starCount = 50 + (i * 50);
                const alpha = 1 - (i * 0.2);

                // Draw stars on a large area to cover resize
                // Use a reasonable max size or regenerate on resize?
                // For simplicity, let's just make them verifyable on resize or use a TilingSprite?
                // Graphics is fine, let's just scatter them based on initial size + buffer
                // Actually, let's redraw stars on resize for perfect coverage

                starLayers.push(layer);
                starContainer.addChild(layer);
            }

            // Function to draw stars
            const drawStars = (w: number, h: number) => {
                starLayers.forEach((layer, i) => {
                    layer.clear();
                    const starCount = 50 + (i * 50);
                    const alpha = 1 - (i * 0.2);
                    const scale = 1 - (i * 0.2);

                    for (let s = 0; s < starCount; s++) {
                        const x = Math.random() * w;
                        const y = Math.random() * h;
                        const size = Math.random() * 2 * scale + 1;

                        layer.fill({ color: 0xffffff, alpha: Math.random() * alpha });
                        layer.circle(x, y, size);
                        layer.fill();
                    }
                });
            };
            drawStars(app.screen.width, app.screen.height);


            // --- ROOM CONTAINER ---
            const roomContainer = new Container();
            app.stage.addChild(roomContainer);

            // Function to center room
            const centerRoom = () => {
                if (!app) return;
                const w = app.screen.width;
                const h = app.screen.height;
                const ROOM_SCALE = 0.6; // Keep scale consistent or adjust for mobile?
                // Maybe scale down slightly on very small screens?
                const isMobile = w < 600;
                const actualScale = isMobile ? 0.45 : 0.6;

                // Center the grid: (0,0) is top corner. Center is at (6,6)
                // gridToIso(6,6).y is height/2 of the isometric diamond (approx)
                // y = (x+y) * (TILE_SIZE/2) = (6+6)*32 = 384
                const isoCenterY = 384 * actualScale;

                roomContainer.x = w / 2;
                roomContainer.y = (h / 2) - isoCenterY;
                roomContainer.scale.set(actualScale);
            };
            centerRoom();

            // Handle Resize
            // Pixi's resizeTo automatically handles the canvas size, but we need to recenter content
            app.renderer.on('resize', () => {
                if (!app) return;
                centerRoom();
                drawStars(app.screen.width, app.screen.height);
            });

            // --- 1. FLOOR (12x12 Grass) ---
            const floorContainer = new Container();
            roomContainer.addChild(floorContainer);

            const FLOOR_CELL_W = 256;
            const floorTex = new Texture({
                source: villageSprites.source,
                frame: new Rectangle(0, 0, FLOOR_CELL_W, FLOOR_CELL_W)
            });

            const ROOM_SIZE = 12;

            for (let y = 0; y < ROOM_SIZE; y++) {
                for (let x = 0; x < ROOM_SIZE; x++) {
                    const iso = gridToIso(x, y);
                    const tile = new Sprite(floorTex);

                    tile.anchor.set(0.5, 0.75);
                    tile.x = iso.x;
                    tile.y = iso.y;
                    tile.scale.set(0.52);
                    floorContainer.addChild(tile);
                }
            }

            // --- 3. FURNITURE ---
            const objectsContainer = new Container();
            roomContainer.addChild(objectsContainer);
            objectsContainer.sortableChildren = true;

            if (catTextures["Furnitures.png"]) {
                const furnituresBase = catTextures["Furnitures.png"];
                const TILE_W = 32;

                const createFurniture = (srcCol: number, srcRow: number, w: number, h: number) => {
                    const container = new Container();
                    for (let r = 0; r < h; r++) {
                        for (let c = 0; c < w; c++) {
                            const frameX = furnituresBase.frame.x + ((srcCol + c) * TILE_W);
                            const frameY = furnituresBase.frame.y + ((srcRow + r) * TILE_W);
                            if (frameX + TILE_W > catRoomTexture.width || frameY + TILE_W > catRoomTexture.height) continue;
                            const tex = new Texture({
                                source: catRoomTexture.source,
                                frame: new Rectangle(frameX, frameY, TILE_W, TILE_W)
                            });
                            const spr = new Sprite(tex);
                            spr.x = c * TILE_W;
                            spr.y = r * TILE_W;
                            container.addChild(spr);
                        }
                    }
                    container.pivot.set(0, h * TILE_W);
                    return container;
                };

                // WINDOW / SHELF (Col 0, Row 9) - 4x5
                const windowSprite = createFurniture(0, 9, 4, 5);
                windowSprite.scale.set(1.5);
                const winPos1 = gridToIso(0, 3);
                windowSprite.position.set(winPos1.x, winPos1.y);
                windowSprite.zIndex = 1000 + winPos1.y;
                objectsContainer.addChild(windowSprite);

                const winPos2 = gridToIso(8, 0);
                const windowSprite2 = createFurniture(0, 9, 4, 5);
                windowSprite2.scale.set(1.5);
                windowSprite2.position.set(winPos2.x, winPos2.y);
                windowSprite2.zIndex = 1000 + winPos2.y;
                windowSprite2.scale.x = -1.5;
                objectsContainer.addChild(windowSprite2);
            }

            // --- 4. CATS ---
            if (catTextures["Idle.png"]) {
                const idleBase = catTextures["Idle.png"];
                const catFrames: Texture[] = [];
                for (let i = 0; i < 10; i++) {
                    const frameX = idleBase.frame.x + (i * 32);
                    const frameY = idleBase.frame.y;
                    const frame = new Texture({
                        source: catRoomTexture.source,
                        frame: new Rectangle(frameX, frameY, 32, 32)
                    });
                    catFrames.push(frame);
                }

                const catConfig = [
                    { x: 5, y: 5 }, { x: 2, y: 2 }, { x: 9, y: 8 }, { x: 3, y: 10 },
                ];

                const cats: { sprite: Sprite, offset: number }[] = [];

                catConfig.forEach((cfg, idx) => {
                    const cat = new Sprite(catFrames[0]);
                    cat.anchor.set(0.5, 0.9);
                    cat.scale.set(2.0);
                    if (idx % 2 === 0) cat.scale.x = -2.0;

                    const pos = gridToIso(cfg.x, cfg.y);
                    cat.x = pos.x;
                    cat.y = pos.y;
                    cat.zIndex = 1000 + pos.y;
                    objectsContainer.addChild(cat);
                    cats.push({ sprite: cat, offset: idx * 2 });
                });

                let time = 0;
                app.ticker.add((ticker) => {
                    time += ticker.deltaTime;
                    const frameTime = Math.floor(time * 0.2);
                    cats.forEach(c => {
                        const frame = (frameTime + c.offset) % 10;
                        c.sprite.texture = catFrames[frame];
                    });
                });
            }

            // --- BOX KITTENS ---
            if (catTextures["Box3.png"]) {
                const boxBase = catTextures["Box3.png"];
                const boxFrames = [];
                for (let i = 0; i < 4; i++) {
                    const frameX = boxBase.frame.x + (i * 32);
                    const frameY = boxBase.frame.y;
                    const frame = new Texture({
                        source: catRoomTexture.source,
                        frame: new Rectangle(frameX, frameY, 32, 32)
                    });
                    boxFrames.push(frame);
                }

                const boxConfig = [
                    { x: 8, y: 3 }, { x: 4, y: 7 }, { x: 10, y: 5 },
                ];

                const boxes: { sprite: Sprite, offset: number }[] = [];

                boxConfig.forEach((cfg, idx) => {
                    const box = new Sprite(boxFrames[0]);
                    box.anchor.set(0.5, 0.9);
                    box.scale.set(2.0);
                    const pos = gridToIso(cfg.x, cfg.y);
                    box.x = pos.x;
                    box.y = pos.y;
                    box.zIndex = 1000 + pos.y;
                    objectsContainer.addChild(box);
                    boxes.push({ sprite: box, offset: idx * 3 });
                });

                let boxTime = 0;
                app.ticker.add((ticker) => {
                    boxTime += ticker.deltaTime;
                    const baseFrame = Math.floor(boxTime * 0.1);
                    boxes.forEach(b => {
                        const frame = (baseFrame + b.offset) % 4;
                        b.sprite.texture = boxFrames[frame];
                    });
                });
            }
        };

        init();

        return () => {
            mounted = false;
            if (app) {
                app.destroy({ removeView: true });
                app = null;
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}
