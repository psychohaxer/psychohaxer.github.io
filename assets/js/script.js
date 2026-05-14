// Small helper: preview uploaded profile image
const input = document.getElementById("imageUpload");
const img = document.getElementById("profileImage");
if (input) {
    input.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        img.src = url;
    });
}

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
            size: 3,
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

            ship.fireCooldown -= dt;
            if (!ship.entering && ship.fireCooldown <= 0) {
                shoot(ship.x, ship.y, bug.x + (Math.random() - 0.5) * 30, bug.y + (Math.random() - 0.5) * 30, 260, "ship");
                ship.fireCooldown = 0.6 + Math.random() * 0.6;
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
                if (d < 140) {
                    avoidX -= px / (d * d);
                    avoidY -= py / (d * d);
                }
            }
            const [ax, ay] = normalize(avoidX, avoidY || 0);
            const keepDistance = 180;
            if (dist < keepDistance) {
                const fleeStrength = 220 * ((keepDistance - dist) / keepDistance + 0.2);
                bug.vx += (nx * fleeStrength + ax * 240) * dt;
                bug.vy += (ny * fleeStrength + ay * 240) * dt;
            } else {
                bug.vx *= 0.985;
                bug.vy *= 0.985;
                bug.vx += (Math.random() - 0.5) * 18 * dt;
                bug.vy += (Math.random() - 0.5) * 18 * dt;
                bug.vx += ax * 100 * dt;
                bug.vy += ay * 100 * dt;
            }

            bug.vx = clamp(bug.vx, 240);
            bug.vy = clamp(bug.vy, 240);
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
                        projectiles.splice(i, 1);
                        respawn(ship);
                        continue;
                    }
                }
            }
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
            ctx.fillStyle = p.owner === "ship" ? "rgba(150,255,200,0.95)" : "rgba(255,180,140,0.95)";
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
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

// --- Carousel controls + image modal handlers (support multiple carousels) ---
(function () {
    const modalRoot = document.getElementById("image-modal");
    const modalBackdrop = document.getElementById("img-modal-backdrop");
    const modalImg = document.getElementById("img-modal-img");
    const modalTitle = document.getElementById("img-modal-title");
    const modalClose = document.getElementById("img-modal-close");
    const modalPrev = document.getElementById("img-modal-prev");
    const modalNext = document.getElementById("img-modal-next");

    const modalController = {
        items: [],
        currentIndex: 0,
        open(items, index) {
            if (!items || !items.length) return;
            this.items = items;
            this.currentIndex = index || 0;
            const it = this.items[this.currentIndex];
            modalImg.src = it.src;
            modalImg.alt = it.alt || "";
            if (modalTitle) modalTitle.textContent = it.alt || "";
            modalRoot.classList.remove("hidden");
            modalRoot.setAttribute("aria-hidden", "false");
            if (modalClose) modalClose.focus();
        },
        close() {
            modalRoot.classList.add("hidden");
            modalRoot.setAttribute("aria-hidden", "true");
            modalImg.src = "";
            if (modalTitle) modalTitle.textContent = "";
        },
        prev() {
            if (!this.items.length) return;
            this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
            this.open(this.items, this.currentIndex);
        },
        next() {
            if (!this.items.length) return;
            this.currentIndex = (this.currentIndex + 1) % this.items.length;
            this.open(this.items, this.currentIndex);
        },
    };

    if (modalClose) modalClose.addEventListener("click", () => modalController.close());
    if (modalBackdrop)
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) modalController.close();
        });
    if (modalPrev)
        modalPrev.addEventListener("click", (e) => {
            e.stopPropagation();
            modalController.prev();
        });
    if (modalNext)
        modalNext.addEventListener("click", (e) => {
            e.stopPropagation();
            modalController.next();
        });

    document.addEventListener("keydown", (e) => {
        if (!modalRoot || modalRoot.classList.contains("hidden")) return;
        if (e.key === "Escape") modalController.close();
        if (e.key === "ArrowLeft") modalController.prev();
        if (e.key === "ArrowRight") modalController.next();
    });

    const containers = Array.from(document.querySelectorAll(".carousel-container"));
    containers.forEach((container) => {
        const viewport = container.querySelector(".carousel-viewport");
        if (!viewport) return;
        const inner = viewport.querySelector(".flex");
        const items = Array.from(viewport.querySelectorAll(".carousel-item"));

        function computeItemWidth() {
            if (!items.length) return 260;
            const w = items[0].getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(inner).gap) || parseFloat(getComputedStyle(inner).columnGap) || 12;
            return w + gap;
        }

        let itemWidth = computeItemWidth();
        window.addEventListener("resize", () => {
            itemWidth = computeItemWidth();
        });

        const prev = container.querySelector(".carousel-btn.left");
        const next = container.querySelector(".carousel-btn.right");
        if (prev) prev.addEventListener("click", () => viewport.scrollBy({ left: -itemWidth, behavior: "smooth" }));
        if (next) next.addEventListener("click", () => viewport.scrollBy({ left: itemWidth, behavior: "smooth" }));

        items.forEach((it, idx) => {
            it.addEventListener("click", () => {
                modalController.open(items, idx);
            });
        });
    });
})();

// --- Localization / Translation system ---
(function () {
    const translations = {
        en: {
            'page.title': 'Firman Adi Nur Fatin, S.Kom. - Profile',
            'headline': 'Full Stack Developer | Game Developer | Educator',
            'about.title': 'About Me',
            'about.bio': "I'm a passionate developer with experience in building web applications and games. I love learning new technologies and applying them to solve real-world problems. In addition to coding, I enjoy teaching and sharing knowledge with others.",
            'contact.github': 'GitHub',
            'contact.linkedin': 'LinkedIn',
            'contact.itch': 'Itch.io',
            'contact.email': 'Email',
            'contact.wa': 'WhatsApp',
            'skills.title': 'Technical Skills',
            'skills.item1': 'Backend & full-stack web apps.',
            'skills.item2': 'Analysis, ML basics, and visualization.',
            'skills.item3': 'Schema design and reliable storage.',
            'skills.item4': 'Visual novels & interactive experiences.',
            'skills.item5': 'Process mapping and practical understanding.',
            'skills.item6': 'Course design, mentoring, and workshops.',
            'skills.item7': 'Retouching & web assets.',
            'skills.item8': 'Promo edits and motion basics.',
            'skills.item9': 'Study design, stats, and paper writing.',

            'project.flagship': 'Flagship Project',
            'project.work': 'Work Experience',
            'project.research': 'Research Published',
            'project.academic': 'Academic Background',

            'project.dms.title': 'Digital Manufacturing System (DMS) 👑',
            'project.dms.desc1': 'ERP built from scratch in PHP to augment an industrial L3 system for a steel-processing plant. DMS centralizes production data and gives operations and planners fast access to the KPIs they need to act.',
            'project.dms.desc2': 'Features such as <strong>Daily Report</strong>, <strong>Quality Control</strong>, <strong>Capacity Planning</strong>, <strong>Manufacture Planning List</strong>, <strong>Energy Consumption</strong>, <strong>OEE Report</strong>, and <strong>Statistic Process Control</strong> convert raw production signals into actionable insights — reducing downtime, improving yield and quality, optimizing energy use, and enabling data-driven scheduling.',

            'project.fb.title': 'Fiscal Bridge',
            'project.fb.desc1': 'Web-based accounting software that streamlines commercial workflows — from quotations and invoicing to transaction recording and purchase orders. Stores customer and vendor data and generates financial reports for bookkeeping and tax purposes.',

            'project.ad.title': 'Auto Dosing',
            'project.ad.desc1': 'Web application integrated with SCADA to monitor and control animal feed production. Clear visualizations and tabulated reports turn SCADA signals into operator-ready information, helping maintain dosing accuracy and production traceability.',

            'project.client_nd': 'Client name withheld due to NDA.',
            'ui.click_image': 'Click an image to open a larger view.',

            'work.job1.title': 'Full Stack Programmer — LMask',
            'work.job1.desc': 'Joined as an early team member at a pioneering startup focused on industrial monitoring and control systems. Designed and implemented web dashboards, backend services that ingest SCADA/MES signals, and integrations for alerts and reporting. Drove prototype-to-production deliveries and collaborated closely with operations for field validation.',

            'work.job2.title': 'Teacher — SMKS Tamansiswa Kudus',
            'work.job2.desc': 'Instructor for Broadcasting & Film departments and informatics topics. Teach coding and practical AI introductions, create curricula and assessments, and act as Moodle LMS administrator — supporting course delivery, student mentoring, and project supervision.',

            'work.job3.title': 'Academic Mentor & Lab Assistant — Universitas Muria Kudus',
            'work.job3.desc': 'Served as teaching assistant during laboratory practicals, mentored students in theory sessions, and assisted lecturers with research tasks including data processing and translating papers into English.',

            'work.job4.title': 'Field Admin — UD. Dadi Makmur',
            'work.job4.desc': 'Implemented automation for fertilizer redemption administration documents, reducing manual entry and improving processing speed and accuracy through lightweight web tools and process templates.',

            'work.job5.title': 'Software Engineer & Mentor — Digital Wings Code Solution',
            'work.job5.desc': 'At a small software house (<10 people), I build web applications ranging from agency/profile sites to thesis-level systems, mentor students working on their theses, and take on project coordination duties. Roles include programmer, mentor, and project manager depending on the engagement.',

            'work.job6.title': 'Full Stack Programmer — PT. Tawang Nuswantoro Nugroho',
            'work.job6.desc': 'Developing and maintaining web applications for industrial clients, including dashboards, ERP modules, and custom tools. Responsibilities include full stack development, client communication, and project coordination to ensure timely delivery of solutions that meet operational needs.',

            'research.pub1.title': 'Implementation of A Wireless Sensor Network for Monitoring Air Pollutants in Urban and Industrial Areas',
            'research.pub1.journal': '— Environmental Engineering & Management Journal (EEMJ), 2024, Vol 23, Issue 7, p1391',
            'research.pub1.desc': 'A prototype and field evaluation of a wireless sensor network for continuous air pollutant monitoring in mixed urban-industrial environments.',

            'research.pub2.title': 'Real-Time Monitoring of Gas Fields: Prototype at PT Gamma Energi Pratama Bogor',
            'research.pub2.journal': '— Jurnal Teknik Informatika (JTI), 2023, Vol. 16, Issue 1',
            'research.pub2.desc': 'Design and implementation of a real-time monitoring prototype for gas field operations with data visualization and alerting.',

            'academic.edu1.title': 'Universitas Muria Kudus — Bachelor, Informatics Engineering',
            'academic.edu1.desc': 'Graduated with a GPA of <strong>3.69 / 4.00</strong>. Focus on software development, data processing, and applied computing.',

            'academic.edu2.title': 'SMKN 1 Wonosobo — Vocational, Software Engineering',
            'academic.edu2.desc': 'Vocational training focused on software engineering practices and practical application development.'
        },
        id: {
            'page.title': 'Firman Adi Nur Fatin, S.Kom. - Profil Saya',
            'headline': 'Full Stack Developer | Game Developer | Educator',
            'about.title': 'Tentang Saya',
            'about.bio': "Saya seorang programmer yang bersemangat dengan pengalaman membangun aplikasi web dan game. Saya suka mempelajari teknologi baru dan menerapkannya untuk menyelesaikan masalah nyata. Selain coding, saya menikmati mengajar dan berbagi pengetahuan dengan orang lain.",
            'contact.github': 'GitHub',
            'contact.linkedin': 'LinkedIn',
            'contact.itch': 'Itch.io',
            'contact.email': 'Email',
            'contact.wa': 'WhatsApp',
            'skills.title': 'Keahlian Teknis',
            'skills.item1': 'Backend & aplikasi web full-stack.',
            'skills.item2': 'Analisis, dasar ML, dan visualisasi.',
            'skills.item3': 'Desain skema dan penyimpanan andal.',
            'skills.item4': 'Visual novel & pengalaman interaktif.',
            'skills.item5': 'Pemetaan proses dan pemahaman praktis.',
            'skills.item6': 'Desain kursus, mentoring, dan workshop.',
            'skills.item7': 'Retouching & aset web.',
            'skills.item8': 'Edit promo dan dasar motion.',
            'skills.item9': 'Desain studi, statistik, dan penulisan makalah.',

            'project.flagship': 'Proyek Unggulan',
            'project.work': 'Pengalaman Kerja',
            'project.research': 'Penelitian yang Diterbitkan',
            'project.academic': 'Latar Belakang Akademik',

            'project.dms.title': 'Digital Manufacturing System (DMS) 👑',
            'project.dms.desc1': 'ERP yang dibangun dari awal menggunakan PHP untuk melengkapi sistem L3 industri pada pabrik pengolahan baja. DMS memusatkan data produksi dan memberi akses cepat kepada operasional dan perencana terhadap KPI yang diperlukan untuk bertindak.',
            'project.dms.desc2': 'Fitur seperti <strong>Daily Report</strong>, <strong>Quality Control</strong>, <strong>Capacity Planning</strong>, <strong>Manufacture Planning List</strong>, <strong>Energy Consumption</strong>, <strong>OEE Report</strong>, dan <strong>Statistic Process Control</strong> mengubah sinyal produksi mentah menjadi wawasan yang dapat ditindaklanjuti — mengurangi downtime, meningkatkan hasil dan kualitas, mengoptimalkan penggunaan energi, dan memungkinkan penjadwalan berbasis data.',

            'project.fb.title': 'Fiscal Bridge',
            'project.fb.desc1': 'Perangkat lunak akuntansi berbasis web yang menyederhanakan alur kerja komersial — dari penawaran dan penagihan hingga pencatatan transaksi dan purchase order. Menyimpan data pelanggan dan vendor serta menghasilkan laporan keuangan untuk pembukuan dan pajak.',

            'project.ad.title': 'Auto Dosing',
            'project.ad.desc1': 'Aplikasi web yang terintegrasi dengan SCADA untuk memantau dan mengendalikan produksi pakan ternak. Visualisasi yang jelas dan laporan berbentuk tabel mengubah sinyal SCADA menjadi informasi siap-operator, membantu menjaga akurasi dosis dan keterlacakan produksi.',

            'project.client_nd': 'Nama klien disembunyikan karena NDA.',
            'ui.click_image': 'Klik gambar untuk membuka tampilan lebih besar.',

            'work.job1.title': 'Full Stack Programmer — LMask',
            'work.job1.desc': 'Bergabung sebagai anggota awal di startup yang berfokus pada monitoring industri dan sistem kontrol. Merancang dan mengimplementasikan dashboard web, layanan backend yang mengonsumsi sinyal SCADA/MES, serta integrasi untuk notifikasi dan pelaporan. Mengelola pengiriman dari prototipe ke produksi dan berkolaborasi erat dengan tim operasional untuk validasi lapangan.',

            'work.job2.title': 'Guru — SMKS Tamansiswa Kudus',
            'work.job2.desc': 'Instruktur untuk jurusan Broadcasting & Film serta topik informatika. Mengajar coding dan pengenalan AI praktis, menyusun kurikulum dan asesmen, serta menjadi administrator Moodle LMS — mendukung penyampaian materi, pembimbingan siswa, dan supervisi proyek.',

            'work.job3.title': 'Mentor Akademik dan Asisten Lab — Universitas Muria Kudus',
            'work.job3.desc': 'Bertugas sebagai asisten pengajar selama praktikum laboratorium, membimbing mahasiswa pada sesi teori, dan membantu dosen dalam tugas penelitian termasuk pengolahan data dan menerjemahkan makalah ke Bahasa Inggris.',

            'work.job4.title': 'Administrator Lapangan — UD. Dadi Makmur',
            'work.job4.desc': 'Mengimplementasikan otomatisasi pada dokumen administrasi penebusan pupuk, mengurangi entri manual dan meningkatkan kecepatan serta akurasi proses melalui alat web ringan dan template proses.',

            'work.job5.title': 'Insinyur Perangkat Lunak & Mentor — Digital Wings Code Solution',
            'work.job5.desc': 'Di sebuah software house kecil (<10 orang), saya membuat aplikasi web mulai dari situs agency/profil hingga sistem setingkat tugas akhir, membimbing mahasiswa yang mengerjakan skripsi, dan mengambil peran koordinasi proyek. Peran meliputi programmer, mentor, dan manajer proyek tergantung keterlibatan.',

            'work.job6.title': 'Full Stack Programmer — PT. Tawang Nuswantoro Nugroho',
            'work.job6.desc': 'Mengembangkan dan memelihara aplikasi web untuk klien industri, termasuk dashboard, modul ERP, dan alat kustom. Tanggung jawab meliputi pengembangan full stack, komunikasi klien, dan koordinasi proyek untuk memastikan pengiriman solusi tepat waktu yang memenuhi kebutuhan operasional.',

            'research.pub1.title': 'Implementation of A Wireless Sensor Network for Monitoring Air Pollutants in Urban and Industrial Areas',
            'research.pub1.journal': '— Environmental Engineering & Management Journal (EEMJ), 2024, Vol 23, Issue 7, p1391',
            'research.pub1.desc': 'Sebuah prototipe dan evaluasi lapangan jaringan sensor nirkabel untuk pemantauan polutan udara berkelanjutan di lingkungan perkotaan-industri campuran.',

            'research.pub2.title': 'Real-Time Monitoring of Gas Fields: Prototype at PT Gamma Energi Pratama Bogor',
            'research.pub2.journal': '— Jurnal Teknik Informatika (JTI), 2023, Vol. 16, Issue 1',
            'research.pub2.desc': 'Perancangan dan implementasi prototipe pemantauan real-time untuk operasi lapangan gas dengan visualisasi data dan sistem peringatan.',

            'academic.edu1.title': 'Universitas Muria Kudus — Sarjana, Teknik Informatika',
            'academic.edu1.desc': 'Lulus dengan IPK <strong>3.69 / 4.00</strong>. Fokus pada pengembangan perangkat lunak, pengolahan data, dan komputasi terapan.',

            'academic.edu2.title': 'SMKN 1 Wonosobo — Kejuruan, Rekayasa Perangkat Lunak',
            'academic.edu2.desc': 'Pelatihan vokasi yang fokus pada praktik rekayasa perangkat lunak dan pengembangan aplikasi praktis.'
        }
    };

    const saved = localStorage.getItem('lang');
    let lang = saved || (document.documentElement.lang || 'id');

    function applyLang(l) {
        if (!translations[l]) return;
        lang = l;
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key && translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
        const btn = document.getElementById('langToggle');
        if (btn) {
            btn.textContent = lang.toUpperCase();
            btn.setAttribute('aria-label', lang === 'id' ? 'Bahasa' : 'Language');
        }
        localStorage.setItem('lang', lang);
    }

    document.addEventListener('DOMContentLoaded', function () {
        let btn = document.getElementById('langToggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'langToggle';
            btn.className = 'lang-toggle';
            btn.type = 'button';
            document.body.appendChild(btn);
        }

        btn.addEventListener('click', function () {
            const next = lang === 'id' ? 'en' : 'id';
            applyLang(next);
        });

        applyLang(lang);

        // Reveal animation observer
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    });
})();
