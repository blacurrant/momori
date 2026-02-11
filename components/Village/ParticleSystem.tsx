import { Container, Graphics } from 'pixi.js';

interface Particle {
    sprite: Graphics;
    x: number;
    y: number;
    speed: number;
    spin: number;
    wobble: number;
}

export function createParticleSystem(parent: Container, width: number, height: number) {
    const particleCount = 50;
    const particles: Particle[] = [];
    const container = new Container();

    // Add to parent
    parent.addChild(container);

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const g = new Graphics();
        // Draw a simple leaf shape
        g.ellipse(0, 0, 4, 8); // Simple ellipse
        g.fill(0xBA5C12); // Autumn orange/brown

        // Random start position
        const x = Math.random() * width;
        const y = Math.random() * height;

        g.x = x;
        g.y = y;
        g.alpha = 0.6 + Math.random() * 0.4;
        g.rotation = Math.random() * Math.PI * 2;

        container.addChild(g);

        particles.push({
            sprite: g,
            x,
            y,
            speed: 0.5 + Math.random() * 1.5,
            spin: (Math.random() - 0.5) * 0.1,
            wobble: Math.random() * Math.PI * 2
        });
    }

    // Current type tracking
    let currentType = 'default';

    const setType = (type: string) => {
        if (type === currentType) return;
        currentType = type;

        particles.forEach(p => {
            p.sprite.clear();
            if (type === 'petals') {
                // Soft pink petals
                p.sprite.ellipse(0, 0, 3, 5);
                p.sprite.fill(0xffd1dc);
                p.sprite.alpha = 0.8;
            } else if (type === 'leaves') {
                // Autumn leaves
                p.sprite.ellipse(0, 0, 4, 8);
                p.sprite.fill(0xBA5C12);
                p.sprite.alpha = 0.7;
            } else {
                // Default: small light seeds or dust
                p.sprite.circle(0, 0, 1.5);
                p.sprite.fill(0xf5f5f5);
                p.sprite.alpha = 0.4;
            }
        });
    };

    // Initialize with default
    setType('default');

    // Update function to be called every frame
    const update = (delta: number) => {
        particles.forEach(p => {
            const verticalSpeed = currentType === 'petals' ? p.speed * 0.7 : p.speed;
            p.y += verticalSpeed * delta;
            p.x += Math.sin(p.wobble) * 0.5;
            p.sprite.rotation += p.spin;
            p.wobble += 0.05 * delta;

            // Reset check
            if (p.y > height + 10) {
                p.y = -10;
                p.x = Math.random() * width;
            }
            // Wrap X
            if (p.x > width + 10) p.x = -10;
            if (p.x < -10) p.x = width + 10;

            p.sprite.x = p.x;
            p.sprite.y = p.y;
        });
    };

    const destroy = () => {
        container.destroy({ children: true });
    };

    return { update, destroy, setType, container };
}
