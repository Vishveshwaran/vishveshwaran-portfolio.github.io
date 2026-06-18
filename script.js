// =========================================================
//  INSIDE THE WEARABLE — interaction layer
// =========================================================

// Global mouse position (shared by cursor + hero canvas)
let globalMouseX = window.innerWidth / 2;
let globalMouseY = window.innerHeight / 2;
let lastActivity = Date.now();
document.addEventListener('mousemove', (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
    lastActivity = Date.now();
});
window.addEventListener('scroll', () => { lastActivity = Date.now(); }, { passive: true });

// Shared ECG morphology — one cardiac cycle, t in [0,1)
function ecgWave(t) {
    let v = 0;
    v += 0.10 * Math.exp(-Math.pow((t - 0.18) / 0.030, 2)); // P
    v += -0.13 * Math.exp(-Math.pow((t - 0.37) / 0.012, 2)); // Q
    v += 1.00 * Math.exp(-Math.pow((t - 0.40) / 0.012, 2)); // R
    v += -0.25 * Math.exp(-Math.pow((t - 0.44) / 0.014, 2)); // S
    v += 0.22 * Math.exp(-Math.pow((t - 0.62) / 0.045, 2)); // T
    return v;
}

document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----- Footer year -----
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // =========================================================
    //  BOOT LOADER
    // =========================================================
    const bootLoader = document.getElementById('boot-loader');
    const bootText = document.getElementById('boot-text');
    if (bootLoader && bootText) {
        const lines = [
            'Initializing peripherals...',
            'BLE  ............ OK',
            'SPI  ............ OK',
            'I2C  ............ OK',
            'ECG AFE ........ OK',
            'Sensors ........ OK',
            'Starting Zephyr RTOS...',
            'Mounting portfolio...',
            'READY.'
        ];
        const dismiss = () => {
            bootLoader.classList.add('done');
            document.body.style.overflow = '';
            setTimeout(() => bootLoader.remove(), 700);
        };

        if (reduceMotion) {
            bootText.textContent = lines.join('\n');
            setTimeout(dismiss, 400);
        } else {
            document.body.style.overflow = 'hidden';
            let i = 0;
            const step = () => {
                if (i < lines.length) {
                    bootText.textContent += lines[i] + '\n';
                    i++;
                    setTimeout(step, i === 1 ? 280 : 170);
                } else {
                    setTimeout(dismiss, 450);
                }
            };
            step();
        }
        bootLoader.addEventListener('click', dismiss);
    }

    // =========================================================
    //  PROBE CURSOR
    // =========================================================
    const cursor = document.getElementById('probe-cursor');
    const readout = document.getElementById('probe-readout');
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (cursor && isPointerFine) {
        cursor.style.display = 'block';
        let hovering = false;

        document.addEventListener('mousemove', (e) => {
            // hotspot of the probe tip is at svg (3,3)
            cursor.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
            if (readout) {
                readout.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 16}px)`;
            }
        });

        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
        document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
        document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

        const interactive = 'a, button, .project-card, .skill-item, .pcb-chip, .pub-card, .tl-card, .ide-tab, .social-icon, input';
        document.querySelectorAll(interactive).forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                if (readout) readout.classList.add('show');
                hovering = true;
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                if (readout) readout.classList.remove('show');
                hovering = false;
            });
        });
    }

    // =========================================================
    //  TYPEWRITER
    // =========================================================
    const typewriter = document.querySelector('.typewriter');
    if (typewriter) {
        const phrases = [
            'Embedded Firmware',
            'Biosignal Processing',
            'BLE & Wi-Fi Systems',
            'Medical Wearables',
            'OTA / DFU (MCUboot)',
            'TensorFlow Lite Inference',
            'Altium PCB Design'
        ];
        let pi = 0, ci = 0, deleting = false;
        const tick = () => {
            const p = phrases[pi];
            typewriter.textContent = '> ' + (deleting
                ? p.substring(0, ci - 1)
                : p.substring(0, ci + 1)) + '_';
            ci += deleting ? -1 : 1;
            let speed = deleting ? 40 : 85;
            if (!deleting && ci === p.length) { deleting = true; speed = 1800; }
            else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; speed = 350; }
            setTimeout(tick, speed);
        };
        tick();
    }

    // =========================================================
    //  GLITCH ON NAME
    // =========================================================
    const nameEl = document.querySelector('.highlight-name');
    if (nameEl) {
        nameEl.addEventListener('mouseenter', () => {
            if (nameEl.classList.contains('glitching')) return;
            nameEl.classList.add('glitching');
            nameEl.addEventListener('animationend',
                () => nameEl.classList.remove('glitching'), { once: true });
        });
    }

    // =========================================================
    //  MOBILE MENU
    // =========================================================
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', open);
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        });
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }));
    }

    // =========================================================
    //  FIRMWARE — fake IDE
    // =========================================================
    const ideFiles = {
        'main.c': {
            code: `<span class="cm">// ezLife — application entry</span>
<span class="kw">#include</span> <span class="str">&lt;zephyr/kernel.h&gt;</span>

<span class="type">K_THREAD_DEFINE</span>(ecg_tid, <span class="num">2048</span>,
    ecg_thread, <span class="kw">NULL</span>, <span class="kw">NULL</span>, <span class="kw">NULL</span>,
    PRIO_HIGH, <span class="num">0</span>, <span class="num">0</span>);

<span class="kw">int</span> <span class="fn">main</span>(<span class="kw">void</span>) {
    <span class="fn">sensors_init</span>();
    <span class="fn">ble_start</span>();
    <span class="fn">ring_buffer_init</span>(&amp;ecg_rb);
    <span class="kw">return</span> <span class="num">0</span>;
}`,
            explain: '// main.c — boots peripherals, spins up the ECG thread, starts BLE.'
        },
        'ecg.c': {
            code: `<span class="cm">// ECG acquisition → lock-free ring buffer</span>
<span class="kw">void</span> <span class="fn">ecg_thread</span>(<span class="kw">void</span>) {
    <span class="kw">while</span> (<span class="num">1</span>) {
        <span class="type">int16_t</span> s = <span class="fn">afe_read_sample</span>();
        <span class="kw">if</span> (<span class="fn">qos_check</span>(s) == QOS_GOOD)
            <span class="fn">rb_push</span>(&amp;ecg_rb, s);
        <span class="fn">k_sleep</span>(<span class="type">K_USEC</span>(<span class="num">2000</span>));
    }
}`,
            explain: '// ecg.c — reads the AFE, scores signal quality, pushes samples without blocking.'
        },
        'ble.c': {
            code: `<span class="cm">// BLE consumer — gap-free notify stream</span>
<span class="kw">void</span> <span class="fn">ble_notify_work</span>(<span class="kw">struct</span> k_work *w) {
    <span class="type">int16_t</span> buf[PKT];
    <span class="fn">rb_pop_n</span>(&amp;ecg_rb, buf, PKT);
    <span class="fn">bt_gatt_notify</span>(conn, &amp;ecg_attr,
        buf, <span class="kw">sizeof</span>(buf));
}`,
            explain: '// ble.c — drains the ring buffer and streams ECG over a GATT notification.'
        },
        'power.c': {
            code: `<span class="cm">// Multi-state power model</span>
<span class="kw">void</span> <span class="fn">power_tick</span>(<span class="kw">void</span>) {
    <span class="kw">if</span> (<span class="fn">lead_off</span>())        <span class="fn">enter</span>(DEEP_STANDBY);
    <span class="kw">else if</span> (idle_ms &gt; T)  <span class="fn">enter</span>(SLEEP);
    <span class="kw">else</span>                  <span class="fn">enter</span>(ACTIVE);
}`,
            explain: '// power.c — active / sleep / deep-standby to extend wearable battery life.'
        }
    };
    const ideCode = document.getElementById('ide-code');
    const ideExplain = document.getElementById('ide-explain');
    const ideTabs = document.querySelectorAll('.ide-tab');
    const setIdeFile = (name) => {
        const f = ideFiles[name];
        if (!f || !ideCode) return;
        ideCode.style.opacity = '0';
        setTimeout(() => {
            ideCode.innerHTML = f.code + '<span class="ide-caret">▋</span>';
            if (ideExplain) ideExplain.textContent = f.explain;
            ideCode.style.opacity = '1';
        }, 120);
    };
    if (ideCode) {
        ideCode.style.transition = 'opacity 0.12s';
        setIdeFile('main.c');
        ideTabs.forEach(tab => tab.addEventListener('click', () => {
            ideTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            setIdeFile(tab.dataset.file);
        }));
    }

    // =========================================================
    //  HARDWARE — interactive PCB skills
    // =========================================================
    const chipData = {
        mcu: {
            title: 'MCU / RTOS', desc: '// Cortex-M firmware on a real-time kernel',
            skills: ['Embedded C', 'Python', 'Zephyr RTOS', 'Threads / Semaphores', 'Mutexes / Work Queues', 'Real-time / ISR Design']
        },
        radio: {
            title: 'RADIO / Connectivity', desc: '// wireless telemetry & in-field updates',
            skills: ['nRF54L15 (nRF Connect SDK)', 'STM32 / STM32WB55', 'ESP32', 'BLE GATT / Notifications', 'OTA / DFU (MCUboot)', 'Wi-Fi · SPI · I²C · UART']
        },
        afe: {
            title: 'AFE / DSP & ML', desc: '// on-device biosignal processing',
            skills: ['ECG / Respiration / SpO₂', 'Peak & Lead-off Detection', 'Signal-quality Scoring', 'BioZ Processing', 'TensorFlow Lite Inference']
        },
        tools: {
            title: 'Hardware / Tools', desc: '// schematic, PCB, and bring-up',
            skills: ['Altium Designer', 'Schematic & Multi-layer PCB', 'AFE / Sensor Integration', 'Mixed-signal Bring-up', 'MATLAB / Simulink', 'ANSYS MotorCAD', 'IEC 62304 / FDA 510(k)', 'Git · HIL Testing']
        }
    };
    const chips = document.querySelectorAll('.pcb-chip');
    const chipTitle = document.getElementById('chip-title');
    const chipDesc = document.getElementById('chip-desc');
    const chipSkills = document.getElementById('chip-skills');
    const selectChip = (key) => {
        const d = chipData[key];
        if (!d) return;
        chips.forEach(c => c.classList.toggle('active', c.dataset.chip === key));
        if (chipTitle) chipTitle.textContent = d.title;
        if (chipDesc) chipDesc.textContent = d.desc;
        if (chipSkills) {
            chipSkills.innerHTML = '';
            d.skills.forEach((s, idx) => {
                const span = document.createElement('span');
                span.className = 'skill-item';
                span.textContent = s;
                span.style.animationDelay = (idx * 0.04) + 's';
                chipSkills.appendChild(span);
            });
        }
    };
    chips.forEach(c => c.addEventListener('click', () => selectChip(c.dataset.chip)));
    if (chips.length) selectChip('mcu');

    // =========================================================
    //  PROJECT MODAL
    // =========================================================
    const projectData = {
        ECG_PATCH: {
            title: 'ezLife — Continuous ECG Monitoring Patch',
            challenge: 'Build production firmware for a continuous ECG monitoring patch on nRF54L15 with Zephyr RTOS, coordinating ECG acquisition, BLE streaming, and housekeeping under hard real-time constraints without data gaps.',
            solution: [
                'Owned core device firmware using a multithreaded producer/consumer architecture with semaphores and mutexes to coordinate ECG acquisition, BLE streaming, and housekeeping.',
                'Implemented a lock-free ring buffer to hand ECG samples from the acquisition path to the BLE consumer without blocking, enabling gap-free streaming at clinical sample rates.',
                'Developed on-device signal-processing: a signal-quality (QoS) engine assessing ECG lead integrity per analysis window, and a respiration-rate detector using peak detection on the BioZ channel.',
                'Built lead-off detection and a multi-state power model (active / sleep / deep-standby) to extend battery life on a wearable form factor.',
                'Delivered BLE notification streaming and OTA/DFU firmware updates over MCUboot; integrated the ECG/BioZ analog front-end and peripheral sensors over SPI and I²C.'
            ],
            impact: 'Production firmware for a medical ECG patch on Zephyr RTOS with gap-free BLE streaming at clinical sample rates and in-field OTA/DFU update capability.'
        },
        NISO_WATCH: {
            title: 'STM32WB55 Health Watch — BP Estimation & On-Device Inference',
            challenge: 'Port a blood-pressure estimation algorithm to TensorFlow Lite and deploy it for on-device inference on an STM32WB55 (Cortex-M4F + BLE), while contributing to SpO₂ acquisition and BLE/Wi-Fi telemetry.',
            solution: [
                'Collaborated across teams to port a blood-pressure estimation algorithm to a TensorFlow Lite model and deploy it for on-device inference on STM32WB55, achieving validated, working outputs.',
                'Contributed to watch firmware acquiring SpO₂ from an analog front-end with BLE and Wi-Fi telemetry via an ESP32 link.',
                'Validated BP estimation outputs against patient-monitor readings to confirm algorithm correctness on-device.'
            ],
            impact: 'Validated on-device BP estimation running on STM32WB55 (Cortex-M4F) with real-time SpO₂ monitoring and dual-radio telemetry.'
        },
        BLE_GATEWAY: {
            title: 'BLE-to-Wi-Fi Gateway — Proof of Concept',
            challenge: 'Prototype a dual-MCU gateway pairing a Nordic host with an ESP32 Wi-Fi bridge to evaluate connection handling and power/throughput efficiency for multi-device medical data aggregation.',
            solution: [
                'Prototyped a dual-MCU gateway pairing a Nordic host with an ESP32 Wi-Fi bridge to evaluate connection handling and power/throughput efficiency.',
                'Through design review of the gateway backend, developed a working understanding of networked service architecture, containerization with Docker, and orchestration of multiple concurrent services.'
            ],
            impact: 'Functional PoC demonstrating BLE-to-Wi-Fi bridging architecture for aggregating data from multiple medical wearable devices.'
        },
        BMS: {
            title: 'Battery Management System — Fault Detection & IoT Monitoring',
            challenge: 'Build a reliable embedded BMS capable of real-time battery state estimation, proactive ML-based fault prediction, and remote IoT monitoring on ESP32.',
            solution: [
                'Implemented real-time voltage and temperature monitoring using analog sensor integration on ESP32.',
                'Developed SOC (State of Charge) and SOH (State of Health) estimation algorithms to track battery condition under varying load profiles.',
                'Integrated an ML-based fault detection model to predict anomalies — overvoltage, thermal-runaway risk, cell imbalance — before failure occurs.',
                'Built cloud-connected IoT dashboards accessible via mobile and browser for remote battery health monitoring and alerting.'
            ],
            impact: 'Full-stack embedded BMS with predictive fault detection and remote IoT monitoring for proactive battery management.'
        }
    };
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-modal');
    if (modal) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const d = projectData[card.dataset.project];
                if (!d) return;
                document.getElementById('modal-title').textContent = d.title;
                document.getElementById('modal-challenge').textContent = d.challenge;
                const ul = document.getElementById('modal-solution');
                ul.innerHTML = '';
                d.solution.forEach(s => {
                    const li = document.createElement('li');
                    li.textContent = s;
                    ul.appendChild(li);
                });
                document.getElementById('modal-impact').textContent = d.impact;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        const close = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    // =========================================================
    //  SCROLL REVEAL + NAV ACTIVE + BACK TO TOP
    // =========================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(l => l.classList.toggle('active',
                    l.getAttribute('href') === '#' + e.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObserver.observe(s));

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // =========================================================
    //  DEVICE HUD — battery drain/charge + BPM flicker
    // =========================================================
    const battFill = document.getElementById('batt-fill');
    const battPct = document.getElementById('batt-pct');
    const hudBpm = document.getElementById('hud-bpm');
    let battery = 100;
    if (battFill && battPct) {
        setInterval(() => {
            const active = (Date.now() - lastActivity) < 4000;
            battery += active ? -0.4 : 0.6;
            battery = Math.max(18, Math.min(100, battery));
            battFill.style.width = battery + '%';
            battPct.textContent = Math.round(battery) + '%';
            battFill.style.background = battery > 50 ? 'var(--success)'
                : battery > 30 ? 'var(--copper)' : '#ff5f56';
        }, 1500);
    }
    if (hudBpm) {
        setInterval(() => {
            hudBpm.textContent = Math.round(70 + Math.sin(Date.now() / 900) * 4 + (Math.random() * 3 - 1.5));
        }, 1400);
    }

    // =========================================================
    //  CONTACT — UART connect animation
    // =========================================================
    const cliBoot = document.getElementById('cli-boot');
    const contactSection = document.getElementById('contact');
    if (cliBoot && contactSection) {
        let booted = false;
        new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting && !booted) {
                    booted = true;
                    const seq = ['> connect', 'Connecting...', 'Link established @ 115200 baud.', 'Type your message ↓'];
                    let k = 0;
                    const run = () => {
                        if (k < seq.length) {
                            cliBoot.textContent += seq[k] + '\n';
                            k++;
                            setTimeout(run, 420);
                        }
                    };
                    run();
                }
            });
        }, { threshold: 0.4 }).observe(contactSection);
    }

    // =========================================================
    //  SIGNALS — live ECG scope + pipeline flow
    // =========================================================
    const ecgCanvas = document.getElementById('ecg-canvas');
    const scopeBpm = document.getElementById('scope-bpm');
    const scopeQos = document.getElementById('scope-qos');
    const pipeStages = document.querySelectorAll('.pipe-stage');
    if (ecgCanvas && !reduceMotion) {
        const ctx = ecgCanvas.getContext('2d');
        let w, h;
        const fit = () => {
            const r = ecgCanvas.getBoundingClientRect();
            ecgCanvas.width = r.width * devicePixelRatio;
            ecgCanvas.height = r.height * devicePixelRatio;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            w = r.width; h = r.height;
        };
        fit();
        window.addEventListener('resize', fit);

        const trace = [];          // recent y values
        let phase = 0;
        const beatLen = 1.0;       // cycles per ~beat
        let lastBeat = 0;
        let scanning = false;
        const speed = 0.006;

        // pipeline cycling
        let stageIdx = 0;
        setInterval(() => {
            pipeStages.forEach((s, i) => s.classList.toggle('active', i === stageIdx));
            stageIdx = (stageIdx + 1) % pipeStages.length;
        }, 520);

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // scope grid
            ctx.strokeStyle = 'rgba(0,229,255,0.06)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 28) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += 28) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // advance + push new sample
            phase += speed;
            if (phase >= 1) { phase -= 1; }
            const mid = h * 0.55;
            const amp = h * 0.34;
            const y = mid - ecgWave(phase) * amp;
            trace.push({ y, beat: phase });
            const maxPts = Math.floor(w);
            while (trace.length > maxPts) trace.shift();

            // draw trace
            ctx.strokeStyle = '#00FF84';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0,255,132,0.5)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            const startX = w - trace.length;
            trace.forEach((pt, i) => {
                const px = startX + i;
                if (i === 0) ctx.moveTo(px, pt.y);
                else ctx.lineTo(px, pt.y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // mark R-peak as it passes ~0.40 of the cycle
            if (phase > 0.38 && phase < 0.42 && !scanning) {
                scanning = true;
                const px = w - 1;
                const py = mid - ecgWave(0.40) * amp;
                ctx.fillStyle = '#00E5FF';
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            if (phase > 0.45) scanning = false;

            requestAnimationFrame(draw);
        };
        draw();

        // scope BPM + QoS readouts
        if (scopeBpm) setInterval(() => {
            scopeBpm.textContent = Math.round(72 + Math.sin(Date.now() / 1100) * 5);
        }, 1100);
        if (scopeQos) {
            const states = ['QoS GOOD', 'QoS GOOD', 'QoS GOOD', 'QoS FAIR'];
            setInterval(() => {
                scopeQos.textContent = states[Math.floor(Math.random() * states.length)];
            }, 3200);
        }
    }

    // =========================================================
    //  HERO CANVAS — the wearable + sensor nodes + BLE packets
    // =========================================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        let W, H, nodes = [], packets = [];

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // device anchor (right-of-center, behind text on desktop)
        const dev = () => ({ x: W * 0.72, y: H * 0.5 });

        class Node {
            constructor() { this.reset(true); }
            reset(init) {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.bvx = (Math.random() - 0.5) * 0.4;
                this.bvy = (Math.random() - 0.5) * 0.4;
                this.vx = this.bvx; this.vy = this.bvy;
                this.r = Math.random() * 1.6 + 0.6;
            }
            update() {
                const dx = this.x - globalMouseX, dy = this.y - globalMouseY;
                const dist = Math.hypot(dx, dy);
                const R = 130;
                if (dist < R && dist > 0) {
                    const f = (R - dist) / R * 1.1;
                    this.vx += (dx / dist) * f;
                    this.vy += (dy / dist) * f;
                }
                this.vx += (this.bvx - this.vx) * 0.04;
                this.vy += (this.bvy - this.vy) * 0.04;
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
                if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
            }
            draw() {
                ctx.fillStyle = 'rgba(11,138,110,0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const count = Math.min(70, Math.floor(W * H / 16000));
        for (let i = 0; i < count; i++) nodes.push(new Node());

        // BLE packets radiate from the device
        class Packet {
            constructor() {
                const d = dev();
                this.x = d.x; this.y = d.y;
                const a = Math.random() * Math.PI * 2;
                const sp = Math.random() * 1.2 + 0.8;
                this.vx = Math.cos(a) * sp;
                this.vy = Math.sin(a) * sp;
                this.life = 1;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.life -= 0.012;
            }
            draw() {
                ctx.fillStyle = `rgba(0,229,255,${this.life * 0.8})`;
                ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3);
            }
        }

        let pktTimer = 0;
        let devPhase = 0;

        const drawDevice = () => {
            const d = dev();
            const dw = Math.min(150, W * 0.14), dh = dw * 1.35;
            // body
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.strokeStyle = 'rgba(154,166,162,0.35)';
            ctx.lineWidth = 1.5;
            ctx.fillStyle = 'rgba(17,17,17,0.55)';
            const rx = -dw / 2, ry = -dh / 2, rr = 16;
            ctx.beginPath();
            ctx.moveTo(rx + rr, ry);
            ctx.arcTo(rx + dw, ry, rx + dw, ry + dh, rr);
            ctx.arcTo(rx + dw, ry + dh, rx, ry + dh, rr);
            ctx.arcTo(rx, ry + dh, rx, ry, rr);
            ctx.arcTo(rx, ry, rx + dw, ry, rr);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // mini screen with scrolling ECG
            const sw = dw * 0.74, sh = dh * 0.42;
            const sx = -sw / 2, sy = -sh / 2;
            ctx.fillStyle = 'rgba(3,10,8,0.9)';
            ctx.fillRect(sx, sy, sw, sh);
            ctx.strokeStyle = 'rgba(0,229,255,0.25)';
            ctx.strokeRect(sx, sy, sw, sh);

            ctx.save();
            ctx.beginPath();
            ctx.rect(sx, sy, sw, sh);
            ctx.clip();
            ctx.strokeStyle = '#00FF84';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let i = 0; i <= sw; i++) {
                const t = ((i / sw) + devPhase) % 1;
                const yy = sy + sh / 2 - ecgWave(t) * sh * 0.4;
                if (i === 0) ctx.moveTo(sx + i, yy);
                else ctx.lineTo(sx + i, yy);
            }
            ctx.stroke();
            ctx.restore();

            // status LED
            ctx.fillStyle = '#00FF84';
            ctx.beginPath();
            ctx.arc(0, ry + dh - 16, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const loop = () => {
            ctx.clearRect(0, 0, W, H);

            // node links
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 110) {
                        ctx.strokeStyle = `rgba(11,138,110,${(1 - dist / 110) * 0.18})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            nodes.forEach(n => { n.update(); n.draw(); });

            // device
            devPhase = (devPhase + 0.004) % 1;
            drawDevice();

            // packets
            pktTimer++;
            if (pktTimer > 28) { packets.push(new Packet()); pktTimer = 0; }
            packets = packets.filter(p => p.life > 0);
            packets.forEach(p => { p.update(); p.draw(); });

            requestAnimationFrame(loop);
        };
        loop();
    }
});
