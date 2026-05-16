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

// Space Sim Logic Moved to space-sim.js

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
            'project.dms.desc1': 'ERP built from scratch in PHP to augment an industrial L3 system for a steel-processing plant. DMS centralizes production data and gives operations and planners fast access to the KPIs they need to act.<br/><br/>Features such as <strong>Daily Report</strong>, <strong>Quality Control</strong>, <strong>Capacity Planning</strong>, <strong>Manufacture Planning List</strong>, <strong>Energy Consumption</strong>, <strong>OEE Report</strong>, and <strong>Statistic Process Control</strong> convert raw production signals into actionable insights — reducing downtime, improving yield and quality, optimizing energy use, and enabling data-driven scheduling.',

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
            'project.dms.desc1': 'ERP yang dibangun dari awal menggunakan PHP untuk melengkapi sistem L3 industri pada pabrik pengolahan baja. DMS memusatkan data produksi dan memberi akses cepat kepada operasional dan perencana terhadap KPI yang diperlukan untuk bertindak.<br/><br/>Fitur seperti <strong>Daily Report</strong>, <strong>Quality Control</strong>, <strong>Capacity Planning</strong>, <strong>Manufacture Planning List</strong>, <strong>Energy Consumption</strong>, <strong>OEE Report</strong>, dan <strong>Statistic Process Control</strong> mengubah sinyal produksi mentah menjadi wawasan yang dapat ditindaklanjuti — mengurangi downtime, meningkatkan hasil dan kualitas, mengoptimalkan penggunaan energi, dan memungkinkan penjadwalan berbasis data.',

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
