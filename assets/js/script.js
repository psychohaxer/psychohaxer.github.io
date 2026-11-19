// --- Image modal + galleries ---
(function () {
    const root = document.getElementById("image-modal");
    const backdrop = document.getElementById("img-modal-backdrop");
    const img = document.getElementById("img-modal-img");
    const title = document.getElementById("img-modal-title");
    const closeBtn = document.getElementById("img-modal-close");
    const prevBtn = document.getElementById("img-modal-prev");
    const nextBtn = document.getElementById("img-modal-next");
    if (!root) return;

    let items = [];
    let index = 0;
    let opener = null;

    function show() {
        const it = items[index];
        img.src = it.src;
        img.alt = it.alt || "";
        title.textContent = it.alt || "";
    }

    function open(list, i, trigger) {
        items = list;
        index = i;
        opener = trigger || null;
        show();
        root.classList.remove("hidden");
        root.setAttribute("aria-hidden", "false");
        closeBtn.focus();
    }

    function close() {
        root.classList.add("hidden");
        root.setAttribute("aria-hidden", "true");
        img.src = "";
        title.textContent = "";
        if (opener) opener.focus();
    }

    function step(d) {
        if (!items.length) return;
        index = (index + d + items.length) % items.length;
        show();
    }

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) close();
    });
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); step(1); });

    document.addEventListener("keydown", (e) => {
        if (root.classList.contains("hidden")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
    });

    document.querySelectorAll("[data-gallery]").forEach((gallery) => {
        const shots = Array.from(gallery.querySelectorAll(".shot"));
        const list = shots.map((s) => s.querySelector("img"));

        // Prev/next buttons for mouse users; hidden when everything already fits.
        const nav = document.createElement("div");
        nav.className = "shots-nav";
        [["‹", -1, "Previous"], ["›", 1, "Next"]].forEach(([label, dir, name]) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            b.setAttribute("aria-label", name);
            b.addEventListener("click", () =>
                gallery.scrollBy({ left: dir * gallery.clientWidth * 0.8, behavior: "smooth" })
            );
            nav.appendChild(b);
        });
        gallery.after(nav);
        const toggleNav = () => nav.classList.toggle("hidden", gallery.scrollWidth <= gallery.clientWidth + 1);
        toggleNav();
        window.addEventListener("resize", toggleNav);
        gallery.querySelectorAll("img").forEach((im) => im.addEventListener("load", toggleNav));

        shots.forEach((shot, i) => {
            shot.tabIndex = 0;
            shot.setAttribute("role", "button");
            shot.addEventListener("click", () => open(list, i, shot));
            shot.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open(list, i, shot);
                }
            });
        });
    });
})();

// --- Localization (ID default, EN alternative) ---
(function () {
    const T = {
        id: {
            'page.title': 'Firman Adi Nur Fatin — Software engineer untuk manufaktur & instrumentasi',
            'nav.projects': 'Proyek',
            'nav.research': 'Riset',
            'nav.experience': 'Pengalaman',
            'nav.skills': 'Keahlian',
            'nav.education': 'Pendidikan',
            'nav.beyond': 'Di luar kerja',
            'hero.role': 'Software engineer · Manufaktur & instrumentasi',
            'hero.lead': 'Saya menghubungkan sinyal SCADA dan MES ke dashboard, laporan, dan alat perencanaan yang dipakai orang di lantai produksi: dari ERP untuk pabrik pengolahan baja sampai kontrol dosing pakan ternak.',
            'hero.sub': 'Dua riset saya tentang monitoring berbasis sensor sudah terbit di jurnal, salah satunya jurnal internasional. Saya juga mengajar, jadi terbiasa menjelaskan sistem teknis ke orang non-teknis.',
            'projects.title': 'Proyek terpilih',
            'nda': 'Nama klien disembunyikan karena NDA.',
            'dms.meta': 'ERP · Pabrik pengolahan baja',
            'dms.p1': 'ERP yang dibangun dari nol dengan PHP untuk melengkapi sistem L3 industri di pabrik pengolahan baja. DMS memusatkan data produksi dan memberi bagian operasional serta perencana akses cepat ke KPI yang mereka butuhkan.',
            'dms.p2': 'Modulnya: Daily Report, Quality Control, Capacity Planning, Manufacture Planning List, Energy Consumption, OEE Report, dan Statistical Process Control. Semuanya mengubah sinyal produksi mentah menjadi informasi untuk menekan downtime, menjaga kualitas, mengatur energi, dan menjadwalkan produksi berbasis data.',
            'ad.meta': 'SCADA · Produksi pakan ternak',
            'ad.p1': 'Aplikasi web yang terintegrasi dengan SCADA untuk memantau dan mengendalikan produksi pakan ternak. Visualisasi dan laporan tabel mengubah sinyal SCADA menjadi informasi siap-operator, untuk menjaga akurasi dosis dan keterlacakan produksi.',
            'fb.meta': 'Akuntansi berbasis web',
            'fb.p1': 'Perangkat lunak akuntansi berbasis web yang menyederhanakan alur kerja komersial, dari penawaran dan penagihan sampai pencatatan transaksi dan purchase order. Menyimpan data pelanggan dan vendor serta menghasilkan laporan keuangan untuk pembukuan dan pajak.',
            'research.title': 'Riset terbit',
            'research.note': 'Keduanya tentang monitoring berbasis sensor, topik yang sama dengan pekerjaan saya sehari-hari.',
            'research.pub1.desc': 'Prototipe dan evaluasi lapangan jaringan sensor nirkabel untuk pemantauan polutan udara secara kontinu di lingkungan perkotaan dan industri.',
            'research.pub2.desc': 'Perancangan dan implementasi prototipe monitoring real-time untuk operasi lapangan gas, lengkap dengan visualisasi data dan peringatan.',
            'experience.title': 'Pengalaman',
            'experience.industry': 'Industri',
            'experience.teaching': 'Mengajar & akademik',
            'experience.teaching.note': 'Mengajar membuat saya terbiasa menjelaskan hal teknis ke orang non-teknis.',
            'date.present': 'sekarang',
            'job6.desc': 'Mengembangkan dan memelihara aplikasi web untuk klien industri: dashboard, modul ERP, dan alat kustom. Mencakup pengembangan full stack, komunikasi dengan klien, dan koordinasi proyek.',
            'job1.desc': 'Anggota awal di startup monitoring dan kontrol industri. Merancang dashboard web, layanan backend yang menerima sinyal SCADA/MES, serta integrasi notifikasi dan pelaporan. Membawa prototipe ke produksi dan memvalidasinya di lapangan bersama tim operasional.',
            'job5.desc': 'Software house kecil (kurang dari 10 orang): membangun aplikasi web dari situs profil sampai sistem setingkat skripsi, membimbing mahasiswa tugas akhir, dan mengoordinasi proyek sebagai programmer, mentor, atau manajer proyek sesuai kebutuhan.',
            'job4.desc': 'Mengotomatisasi dokumen administrasi penebusan pupuk dengan alat web ringan dan template proses, sehingga entri manual berkurang dan proses lebih cepat serta akurat.',
            'job2.title': 'Guru · SMKS Tamansiswa Kudus',
            'job2.desc': 'Mengajar jurusan Broadcasting & Film serta topik informatika: coding dan pengenalan AI praktis. Menyusun kurikulum dan asesmen, menjadi administrator Moodle LMS, membimbing siswa, dan mengawasi proyek.',
            'job3.title': 'Mentor Akademik & Asisten Lab · Universitas Muria Kudus',
            'job3.desc': 'Asisten pengajar di praktikum laboratorium, membimbing mahasiswa di sesi teori, dan membantu dosen dalam riset: pengolahan data dan penerjemahan makalah ke Bahasa Inggris.',
            'skills.title': 'Keahlian',
            'skills.web.k': 'Web & backend',
            'skills.web.v': 'PHP, SQL (desain skema dan penyimpanan data), aplikasi web full stack',
            'skills.industry.k': 'Industri',
            'skills.industry.v': 'Integrasi SCADA/MES, dashboard produksi, OEE dan SPC, pemetaan proses (draw.io)',
            'skills.data.k': 'Data',
            'skills.data.v': 'Python: analisis, dasar machine learning, visualisasi',
            'skills.research.k': 'Riset & tulisan',
            'skills.research.v': 'Desain studi, statistik, penulisan makalah (LaTeX)',
            'skills.other.k': 'Lainnya',
            'skills.other.v': "Ren'Py (visual novel), Photoshop, Filmora",
            'education.title': 'Pendidikan',
            'edu1.title': 'Universitas Muria Kudus · S1 Teknik Informatika',
            'edu1.desc': 'IPK <strong>3,69 / 4,00</strong>. Fokus pada pengembangan perangkat lunak, pengolahan data, dan komputasi terapan.',
            'edu2.title': 'SMKN 1 Wonosobo · SMK Rekayasa Perangkat Lunak',
            'edu2.desc': 'Pendidikan vokasi dengan fokus pada praktik rekayasa perangkat lunak dan pengembangan aplikasi.',
            'beyond.title': 'Di luar jam kerja',
            'beyond.note': "Saya membuat game, terutama visual novel dengan Ren'Py. Kotak di bawah adalah simulasi kecil buatan saya: pesawat melawan alien, keduanya dikendalikan AI sederhana.",
            'beyond.caption': 'Berjalan hanya saat terlihat di layar.'
        },
        en: {
            'page.title': 'Firman Adi Nur Fatin — Software engineer for manufacturing & instrumentation',
            'nav.projects': 'Projects',
            'nav.research': 'Research',
            'nav.experience': 'Experience',
            'nav.skills': 'Skills',
            'nav.education': 'Education',
            'nav.beyond': 'Off the clock',
            'hero.role': 'Software engineer · Manufacturing & instrumentation',
            'hero.lead': 'I connect SCADA and MES signals to the dashboards, reports, and planning tools that people on the production floor actually use: from an ERP for a steel-processing plant to dosing control for animal feed.',
            'hero.sub': 'Two of my studies on sensor-based monitoring are published in journals, one of them international. I also teach, so I am used to explaining technical systems to non-technical people.',
            'projects.title': 'Selected projects',
            'nda': 'Client name withheld due to NDA.',
            'dms.meta': 'ERP · Steel-processing plant',
            'dms.p1': 'An ERP built from scratch in PHP to complement an industrial L3 system at a steel-processing plant. DMS centralizes production data and gives operations and planners fast access to the KPIs they need.',
            'dms.p2': 'Modules: Daily Report, Quality Control, Capacity Planning, Manufacture Planning List, Energy Consumption, OEE Report, and Statistical Process Control. Together they turn raw production signals into information for reducing downtime, protecting quality, managing energy, and scheduling production from data.',
            'ad.meta': 'SCADA · Animal feed production',
            'ad.p1': 'A web application integrated with SCADA to monitor and control animal feed production. Visualizations and tabular reports turn SCADA signals into operator-ready information, to keep dosing accurate and production traceable.',
            'fb.meta': 'Web-based accounting',
            'fb.p1': 'Web-based accounting software that streamlines commercial workflows, from quotations and invoicing to transaction recording and purchase orders. It stores customer and vendor data and produces financial reports for bookkeeping and tax.',
            'research.title': 'Published research',
            'research.note': 'Both are about sensor-based monitoring, the same subject as my day-to-day work.',
            'research.pub1.desc': 'A prototype and field evaluation of a wireless sensor network for continuous air pollutant monitoring in urban and industrial environments.',
            'research.pub2.desc': 'Design and implementation of a real-time monitoring prototype for gas field operations, with data visualization and alerting.',
            'experience.title': 'Experience',
            'experience.industry': 'Industry',
            'experience.teaching': 'Teaching & academia',
            'experience.teaching.note': 'Teaching taught me to explain technical things to non-technical people.',
            'date.present': 'present',
            'job6.desc': 'Developing and maintaining web applications for industrial clients: dashboards, ERP modules, and custom tools. Covers full stack development, client communication, and project coordination.',
            'job1.desc': 'Early team member at an industrial monitoring and control startup. Designed web dashboards, backend services that ingest SCADA/MES signals, and integrations for alerts and reporting. Took prototypes to production and validated them in the field with the operations team.',
            'job5.desc': 'A small software house (fewer than 10 people): building web applications from agency sites to thesis-level systems, mentoring students on their final projects, and coordinating projects as programmer, mentor, or project manager as needed.',
            'job4.desc': 'Automated fertilizer redemption paperwork with lightweight web tools and process templates, cutting manual entry and making the process faster and more accurate.',
            'job2.title': 'Teacher · SMKS Tamansiswa Kudus',
            'job2.desc': 'Taught Broadcasting & Film departments and informatics topics: coding and practical AI introductions. Wrote curricula and assessments, administered the Moodle LMS, mentored students, and supervised projects.',
            'job3.title': 'Academic Mentor & Lab Assistant · Universitas Muria Kudus',
            'job3.desc': 'Teaching assistant for laboratory practicals, mentored students in theory sessions, and helped lecturers with research: data processing and translating papers into English.',
            'skills.title': 'Skills',
            'skills.web.k': 'Web & backend',
            'skills.web.v': 'PHP, SQL (schema design and data storage), full stack web applications',
            'skills.industry.k': 'Industry',
            'skills.industry.v': 'SCADA/MES integration, production dashboards, OEE and SPC, process mapping (draw.io)',
            'skills.data.k': 'Data',
            'skills.data.v': 'Python: analysis, machine learning basics, visualization',
            'skills.research.k': 'Research & writing',
            'skills.research.v': 'Study design, statistics, paper writing (LaTeX)',
            'skills.other.k': 'Other',
            'skills.other.v': "Ren'Py (visual novels), Photoshop, Filmora",
            'education.title': 'Education',
            'edu1.title': 'Universitas Muria Kudus · B.Sc. Informatics Engineering',
            'edu1.desc': 'GPA <strong>3.69 / 4.00</strong>. Focus on software development, data processing, and applied computing.',
            'edu2.title': 'SMKN 1 Wonosobo · Vocational, Software Engineering',
            'edu2.desc': 'Vocational education focused on software engineering practice and application development.',
            'beyond.title': 'Off the clock',
            'beyond.note': "I make games, mostly visual novels in Ren'Py. The box below is a small simulation I wrote: a spaceship versus an alien, both driven by simple AI.",
            'beyond.caption': 'Runs only while it is on screen.'
        }
    };

    function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    let lang = load('lang');
    if (!T[lang]) lang = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'id';

    function apply(l) {
        if (!T[l]) return;
        lang = l;
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const text = T[l][el.getAttribute('data-i18n')];
            if (text === undefined) return;
            if (el.tagName === 'TITLE') el.textContent = text;
            else el.innerHTML = text;
        });
        document.documentElement.lang = l;
        document.querySelectorAll('#langSwitcher .lang-btn').forEach((b) => {
            const on = b.getAttribute('data-lang') === l;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on);
        });
        store('lang', l);
    }

    document.querySelectorAll('#langSwitcher .lang-btn').forEach((b) => {
        b.addEventListener('click', () => apply(b.getAttribute('data-lang')));
    });
    apply(lang);

    // Highlight the nav link of the section in view
    const links = Array.from(document.querySelectorAll('.nav a'));
    const sections = links
        .map((a) => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);
    function highlight() {
        let current = '';
        sections.forEach((s) => {
            if (window.scrollY >= s.offsetTop - 140) current = s.id;
        });
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    }
    window.addEventListener('scroll', highlight, { passive: true });
    highlight();
})();
