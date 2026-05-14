// Starry background canvas
(function () {
    const canvas = document.getElementById("stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = innerWidth);
    let h = (canvas.height = innerHeight);

    const stars = [];
    const STAR_COUNT = Math.floor((w * h) / 9000); // density

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(0.3, 1.3),
            phase: Math.random() * Math.PI * 2,
            twinkle: rand(0.01, 0.04),
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        // soft gradient vignette
        const g = ctx.createRadialGradient(w * 0.15, h * 0.05, 0, w * 0.15, h * 0.05, Math.max(w, h));
        g.addColorStop(0, "rgba(0,230,118,0.02)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        for (let s of stars) {
            s.phase += s.twinkle;
            const a = 0.4 + Math.sin(s.phase) * 0.6;
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
        // recreate stars density on resize
        stars.length = 0;
        const count = Math.floor((w * h) / 9000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(0.3, 1.3),
                phase: Math.random() * Math.PI * 2,
                twinkle: rand(0.01, 0.04),
            });
        }
    });

    draw();
})();

// --- Small autonomous battlefield: spaceship chases a bug, both throw/avoid projectiles ---
(function () {
    const canvas = document.getElementById("battlefield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = innerWidth);
    let h = (canvas.height = innerHeight);
    ctx.imageSmoothingEnabled = false;

    // --- helpers ---
    function length(x, y) {
        return Math.hypot(x, y);
    }
    function normalize(x, y) {
        const l = length(x, y) || 1;
        return [x / l, y / l];
    }
    function clamp(v, n) {
        return Math.max(-n, Math.min(n, v));
    }

    // entities
    const ship = {
        x: w * 0.2,
        y: h * 0.5,
        vx: 0,
        vy: 0,
        size: 8,
        color: "rgba(0,230,118,1)",
        fireCooldown: 0,
    };

    const bug = {
        x: w * 0.8,
        y: h * 0.5,
        vx: 0,
        vy: 0,
        size: 10,
        color: "rgba(255,120,80,1)",
        throwCooldown: 0,
    };

    const projectiles = []; // {x,y,vx,vy,size,owner,life}
    const explosions = []; // {x, y, particles}

    function createExplosion(x, y, color) {
        const particles = [];
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 120 + 40;
            particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.4,
                size: Math.random() * 3 + 1,
                color: color
            });
        }
        explosions.push({ x, y, particles });
    }

    function respawn(ent) {
        const edge = Math.floor(Math.random() * 4);
        const margin = 80;
        const startOffset = 80;
        const targetX = Math.random() * (w - margin * 2) + margin;
        const targetY = Math.random() * (h - margin * 2) + margin;
        ent.entering = true;
        ent.enterTimer = 0;
        ent.enterDuration = 700 + Math.random() * 300;
        ent.enterTargetX = targetX;
        ent.enterTargetY = targetY;
        ent.vx = ent.vy = 0;

        if (edge === 0) {
            ent.x = targetX;
            ent.y = -startOffset;
        } else if (edge === 1) {
            ent.x = w + startOffset;
            ent.y = targetY;
        } else if (edge === 2) {
            ent.x = targetX;
            ent.y = h + startOffset;
        } else {
            ent.x = -startOffset;
            ent.y = targetY;
        }
    }

    function shoot(x, y, tx, ty, speed, owner) {
        const [dx, dy] = normalize(tx - x, ty - y);
        projectiles.push({
            x: x + dx * 12,
            y: y + dy * 12,
            vx: dx * speed,
            vy: dy * speed,
            size: owner === "ship" ? 2 : 3,
            owner,
            life: 3000,
            born: performance.now(),
        });
    }

    let last = performance.now();
    function update(now) {
        const dt = Math.min(60, now - last) / 1000;
        last = now;

        (function shipAI() {
            const desired = [bug.x - ship.x, bug.y - ship.y];
            const [dx, dy] = normalize(desired[0], desired[1]);
            let avoidX = 0,
                avoidY = 0;
            for (const p of projectiles) {
                if (p.owner === "ship") continue;
                const px = p.x - ship.x,
                    py = p.y - ship.y;
                const dist = length(px, py);
                if (dist < 120) {
                    avoidX -= px / (dist * dist);
                    avoidY -= py / (dist * dist);
                }
            }
            const [ax, ay] = normalize(avoidX, avoidY);
            ship.vx += (dx * 60 + ax * 120) * dt;
            ship.vy += (dy * 60 + ay * 120) * dt;
            ship.vx = clamp(ship.vx, 180);
            ship.vy = clamp(ship.vy, 180);
            ship.x += ship.vx * dt;
            ship.y += ship.vy * dt;

            ship.x = Math.max(10, Math.min(w - 10, ship.x));
            ship.y = Math.max(10, Math.min(h - 10, ship.y));

            const dToBug = length(bug.x - ship.x, bug.y - ship.y);
            ship.fireCooldown -= dt;
            if (!ship.entering && ship.fireCooldown <= 0 && dToBug < 400) {
                shoot(ship.x, ship.y, bug.x + (Math.random() - 0.5) * 30, bug.y + (Math.random() - 0.5) * 30, 320, "ship");
                ship.fireCooldown = 0.8 + Math.random() * 1.2;
            }
        })();

        (function bugAI() {
            let bx = bug.x - ship.x,
                by = bug.y - ship.y;
            const dist = length(bx, by) || 1;
            const [nx, ny] = normalize(bx, by);

            let avoidX = 0,
                avoidY = 0;
            for (const p of projectiles) {
                if (p.owner === "bug") continue;
                const px = p.x - bug.x,
                    py = p.y - bug.y;
                const d = length(px, py);
                if (d < 180) {
                    avoidX -= px / (d * d);
                    avoidY -= py / (d * d);
                }
            }
            const [ax, ay] = normalize(avoidX, avoidY || 0);
            const panicMult = Math.max(1, 450 / (dist + 50)); // Panic increases as ship gets closer
            
            const keepDistance = 180;
            if (dist < keepDistance) {
                const fleeStrength = 220 * ((keepDistance - dist) / keepDistance + 0.2);
                bug.vx += (nx * fleeStrength + ax * 300 * panicMult) * dt;
                bug.vy += (ny * fleeStrength + ay * 300 * panicMult) * dt;
            } else {
                bug.vx *= 0.985;
                bug.vy *= 0.985;
                bug.vx += (Math.random() - 0.5) * 40 * dt;
                bug.vy += (Math.random() - 0.5) * 40 * dt;
                bug.vx += ax * 150 * panicMult * dt;
                bug.vy += ay * 150 * panicMult * dt;
            }

            bug.vx = clamp(bug.vx, 320);
            bug.vy = clamp(bug.vy, 320);
            bug.x += bug.vx * dt;
            bug.y += bug.vy * dt;

            if (bug.x < 20 || bug.x > w - 20 || bug.y < 20 || bug.y > h - 20) {
                bug.x = Math.max(20, Math.min(w - 20, bug.x));
                bug.y = Math.max(20, Math.min(h - 20, bug.y));
                bug.vx *= -0.3;
                bug.vy *= -0.3;
            }

            bug.throwCooldown -= dt;
            if (!bug.entering && bug.throwCooldown <= 0) {
                if (dist < 380) {
                    shoot(bug.x, bug.y, ship.x + (Math.random() - 0.5) * 20, ship.y + (Math.random() - 0.5) * 20, 220, "bug");
                    bug.throwCooldown = 0.6 + Math.random() * 1.0;
                } else {
                    bug.throwCooldown = 1.2 + Math.random() * 2.0;
                }
            }
        })();

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 1000;
            if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
                projectiles.splice(i, 1);
                continue;
            }

            if (p.owner === "ship") {
                if (!bug.entering) {
                    const dx = p.x - bug.x,
                        dy = p.y - bug.y;
                    if (length(dx, dy) < bug.size + p.size) {
                        createExplosion(bug.x, bug.y, "rgba(255, 100, 50, 0.8)");
                        projectiles.splice(i, 1);
                        respawn(bug);
                        continue;
                    }
                }
            } else if (p.owner === "bug") {
                if (!ship.entering) {
                    const dx = p.x - ship.x,
                        dy = p.y - ship.y;
                    if (length(dx, dy) < ship.size + p.size) {
                        createExplosion(ship.x, ship.y, "rgba(0, 255, 163, 0.8)");
                        projectiles.splice(i, 1);
                        respawn(ship);
                        continue;
                    }
                }
            }
        }

        for (let i = explosions.length - 1; i >= 0; i--) {
            const ex = explosions[i];
            for (let j = ex.particles.length - 1; j >= 0; j--) {
                const part = ex.particles[j];
                part.x += part.vx * dt;
                part.y += part.vy * dt;
                part.life -= dt * 1.5;
                if (part.life <= 0) ex.particles.splice(j, 1);
            }
            if (ex.particles.length === 0) explosions.splice(i, 1);
        }
    }

    let prevDraw = performance.now();
    function drawLoop(now) {
        const dtMs = Math.min(60, Math.max(0, now - prevDraw));
        prevDraw = now;

        function processEntering(ent, dtMs) {
            if (!ent.entering) return;
            ent.enterTimer += dtMs;
            const t = Math.min(1, ent.enterTimer / (ent.enterDuration || 600));
            const ease = 1 - Math.pow(1 - t, 3);
            ent.x = ent.x + (ent.enterTargetX - ent.x) * Math.min(1, ease);
            ent.y = ent.y + (ent.enterTargetY - ent.y) * Math.min(1, ease);
            if (t >= 1) {
                ent.entering = false;
                ent.enterTimer = 0;
                ent.enterDuration = 0;
            }
        }
        processEntering(ship, dtMs);
        processEntering(bug, dtMs);

        update(now);
        ctx.clearRect(0, 0, w, h);

        for (const p of projectiles) {
            if (p.owner === "ship") {
                const angle = Math.atan2(p.vy, p.vx);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.shadowBlur = 8;
                ctx.shadowColor = "rgba(0, 255, 163, 1)";
                ctx.fillStyle = "rgba(0, 255, 163, 0.8)";
                ctx.fillRect(-5, -1, 10, 2);
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(255, 255, 255, 1)";
                ctx.fillRect(-2, -0.5, 4, 1);
                ctx.restore();
            } else {
                const pulse = Math.sin(now * 0.01) * 2;
                ctx.beginPath();
                ctx.fillStyle = "rgba(255, 80, 40, 0.3)";
                ctx.arc(p.x, p.y, p.size + 3 + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = "rgba(255, 150, 100, 0.9)";
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (const ex of explosions) {
            for (const part of ex.particles) {
                ctx.fillStyle = part.color.replace("0.8", part.life.toString());
                ctx.fillRect(ex.x + part.x, ex.y + part.y, part.size, part.size);
            }
        }

        ctx.save();
        ctx.translate(ship.x, ship.y);
        const angle = Math.atan2(ship.vy, ship.vx) + Math.PI / 2;
        ctx.rotate(angle);
        const s = Math.max(4, Math.round(ship.size * 0.5));
        ctx.fillStyle = "rgba(0,180,100,1)";
        ctx.fillRect(-s, -Math.floor(s * 0.6), s * 2, Math.floor(s * 1.2));
        ctx.fillStyle = "rgba(160,255,200,1)";
        ctx.fillRect(-1, -Math.floor(s * 0.9) - 1, 2, 2);
        ctx.fillStyle = "rgba(0,220,130,1)";
        ctx.fillRect(-s - 1, 1, 1, Math.max(1, Math.floor(s * 0.8)));
        ctx.fillRect(s, 1, 1, Math.max(1, Math.floor(s * 0.8)));
        ctx.fillStyle = "rgba(120,240,180,1)";
        ctx.fillRect(-1, -Math.floor(s * 0.9) - 3, 2, 2);
        const speedMagnitude = Math.min(1.6, Math.hypot(ship.vx, ship.vy) / 160);
        if (speedMagnitude > 0.03) {
            const flameLen = 1 + Math.round(speedMagnitude * 4);
            ctx.fillStyle = "rgba(255,200,100," + (0.5 + speedMagnitude * 0.4) + ")";
            for (let i = 0; i < flameLen; i++) {
                ctx.fillRect(-1 + (i % 2), Math.floor(s * 0.8) + i, 1, 1 + (i % 2));
            }
        }
        ctx.restore();

        const bs = Math.max(8, bug.size);
        ctx.fillStyle = "rgba(255,110,60,1)";
        ctx.fillRect(bug.x - bs, bug.y - Math.floor(bs / 2), bs * 2, Math.floor(bs / 1.3));
        ctx.fillStyle = "rgba(200,70,40,1)";
        ctx.fillRect(bug.x - 2, bug.y - 3, 2, 2);
        ctx.fillRect(bug.x + 4, bug.y - 2, 2, 2);
        ctx.fillStyle = "rgba(30,10,10,1)";
        ctx.fillRect(bug.x - 3, bug.y - 4, 2, 2);
        ctx.fillRect(bug.x + 1, bug.y - 4, 2, 2);
        ctx.fillStyle = "rgba(255,160,120,1)";
        ctx.fillRect(bug.x - 4, bug.y - 8, 1, 3);
        ctx.fillRect(bug.x + 6, bug.y - 8, 1, 3);
        ctx.fillStyle = "rgba(180,70,40,1)";
        ctx.fillRect(bug.x - bs, bug.y + Math.floor(bs / 2), 1, 2);
        ctx.fillRect(bug.x - bs + 4, bug.y + Math.floor(bs / 2), 1, 2);
        ctx.fillRect(bug.x + bs - 1, bug.y + Math.floor(bs / 2), 1, 2);

        requestAnimationFrame(drawLoop);
    }

    respawn(ship);
    respawn(bug);

    for (let i = 0; i < 3; i++) {
        shoot(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, 140 + Math.random() * 120, Math.random() < 0.5 ? "ship" : "bug");
    }

    window.addEventListener("resize", () => {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
    });

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) requestAnimationFrame(drawLoop);
})();
