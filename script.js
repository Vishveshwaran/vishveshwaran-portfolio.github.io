document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic Footer Year ---
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // --- Typewriter Effect ---
    const typewriterElement = document.querySelector('.typewriter');
    const phrases = [
        "Embedded Firmware",
        "BLE & IoT Systems",
        "Medical Devices",
        "Sensor Integration",
        "Edge AI on Microcontrollers"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterElement.textContent = '> ' + currentPhrase.substring(0, charIndex - 1) + '_';
            charIndex--;
            typeSpeed = 40;
        } else {
            typewriterElement.textContent = '> ' + currentPhrase.substring(0, charIndex + 1) + '_';
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }

    if (typewriterElement) type();

    // --- Mobile Menu ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            hamburger.setAttribute('aria-expanded', isOpen);

            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // --- Project Modal Data ---
    const projectData = {
        'ECG_PATCH': {
            title: 'ECG Patch Firmware',
            image: 'project_ecg.png',
            challenge: 'Develop a medical-grade wearable ECG patch that reliably acquires, processes, and streams real-time ECG data over BLE — while simultaneously performing fall detection and maintaining ultra-low power consumption on a resource-constrained ARM Cortex-M4 platform.',
            solution: [
                'Integrated MAX30001 analog front-end via SPI on nRF52DK, correcting the HR derivation formula directly in the driver to match the datasheet specification.',
                'Implemented Zephyr RTOS threading with priority-based scheduling — high priority for MAX30001 data acquisition, lower priority for BLE transmission — optimizing CPU usage and eliminating data loss.',
                'Built a custom LIS2DUX12 accelerometer driver via I2C with 6D-axis posture detection and configurable fall detection thresholds (±2G to ±16G range).',
                'Designed asynchronous BLE GATT protocol separating fast waveform packets from slow metrics packets, with CRC8 error checking for data integrity.',
                'Added lead-off detection, 2-electrode configuration support, and a signal noise checker using zero-crossing point analysis.',
                'Migrated firmware across nRF52DK → nRF54DK → nRF54L15U (flex patch), adapting overlay files and pin configurations for each platform.'
            ],
            impact: 'Production-ready firmware running on 3 generations of Nordic SoCs with validated ECG waveform quality, real-time fall detection, and optimized BLE throughput for continuous medical monitoring.'
        },
        'BLE_GATEWAY': {
            title: 'BLE Multi-Device Gateway',
            image: 'project_gateway.png',
            challenge: 'Build a centralized BLE gateway capable of simultaneously connecting, streaming, and managing data from multiple medical ECG belt devices — replacing the expensive Cassia E1000 gateway with a cost-effective custom solution.',
            solution: [
                'Architected a dual-chip gateway using nRF54DK as the BLE central controller and ESP32-S3 Mini as the MQTT bridge and command interface.',
                'Optimized nRF54DK stack memory, TX buffers, and event control parameters to support up to 7 concurrent BLE device connections with stable streaming.',
                'Built a Flask web server with a real-time dashboard displaying ECG waveforms from up to 8 devices simultaneously for debugging and monitoring.',
                'Implemented MQTT data pipeline via local Mosquitto broker, achieving 125 samples/second throughput with minimal data loss.',
                'Designed UART command protocol between ESP32-S3 and nRF54DK for SCAN, CONNECT, DISCONNECT, and QUIT operations, handling voltage level mismatch between the two chips.',
                'Ported the entire project from nRF54DK to nRF52DK by only modifying the overlay file, demonstrating the modular architecture.'
            ],
            impact: 'Streamed 7 BLE devices concurrently at 125 samples/sec, providing a cost-effective alternative to commercial gateways. Deployed with Flask + MQTT for real-time multi-patient monitoring.'
        },
        'NISO_WATCH': {
            title: 'NISO Medical Watch',
            image: 'project_niso.png',
            challenge: 'Deploy a machine learning blood pressure estimation model directly on an STM32-based smartwatch with only 184KB of available RAM — while simultaneously running SpO2 measurement, display rendering, and power management.',
            solution: [
                'Converted a Keras BP estimation model to TensorFlow Lite and deployed it on STM32WB using STM32CubeAI with CMSIS-DSP library for feature extraction (FFT, scaling).',
                'Resolved memory constraints by enabling external flash storage for the ML model weights, keeping inference code in internal RAM.',
                'Implemented SpO2 probe detection and measurement using MSP40 IC, debugging pulse trigger issues, LED driver circuits, and boost converter configurations across 5+ boards.',
                'Validated BP estimation against a patient monitor across multiple datasets by collecting 7200 raw samples and implementing noise reduction through valid-data filtering.',
                'Debugged deep sleep current draw (from 51mA target), identifying board-level power management issues and optimizing peripheral shutdown sequences.',
                'Built UART-based pleth and pralldata waveform viewer for real-time debugging of the analog signal pipeline during live measurements.'
            ],
            impact: 'Validated on-device BP estimation matching patient monitor readings within clinical tolerance. Shipped ML inference on a 184KB MCU with real-time SpO2 and display rendering.'
        },
        'TEMP_PATCH': {
            title: 'Flex Temperature Patch',
            image: 'project_temppatch.png',
            challenge: 'Design and bring up a miniaturized flex PCB medical patch on the nRF54L15U — a brand-new SoC with limited community support — integrating temperature sensing and fall detection for continuous patient monitoring.',
            solution: [
                'Designed flex PCB schematic and layout in Altium, including stiffener placement, thermistor integration, and LED indicator with current-limiting resistor.',
                'Migrated the primary power rail from 1.8V to 3.3V across the entire circuit, adding an LDO for stable generation and selecting a buck converter for fixed 1.8V rail derivation.',
                'Resolved NFC pin lock on nRF54L15U by configuring UICR registers to release P0.02/P0.03 for I2C accelerometer communication — debugging at the register level.',
                'Created a modular sensor driver abstraction layer separating accelerometer code from main.c, enabling easy sensor swapping without modifying core application logic.',
                'Integrated LIS2DUX12 accelerometer with configurable temperature offset parameter, fall detection via threshold configuration, and BLE advertising on the nRF54L15U.',
                'Identified and resolved a reversed accelerometer placement causing a short circuit and unexpected voltage drop from 2.83V to 0.73V during flex patch bring-up.'
            ],
            impact: 'First-of-its-kind firmware running on nRF54L15U flex patch with modular sensor abstraction, enabling rapid iteration on future medical patch variants.'
        }
    };

    // --- Modal Logic ---
    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const projectCards = document.querySelectorAll('.project-card');

    if (modal && projectCards) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project');
                const data = projectData[projectId];

                if (data) {
                    document.getElementById('modal-title').textContent = data.title;
                    document.getElementById('modal-challenge').textContent = data.challenge;

                    const modalImage = document.getElementById('modal-image');
                    if (modalImage && data.image) {
                        modalImage.src = data.image;
                        modalImage.alt = data.title + ' — detailed project view';
                    }

                    const solutionList = document.getElementById('modal-solution');
                    solutionList.innerHTML = '';
                    data.solution.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        solutionList.appendChild(li);
                    });

                    const impactEl = document.getElementById('modal-impact');
                    if (impactEl) {
                        impactEl.textContent = data.impact;
                    }

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Circuit Flow Background Animation ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let nodes = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Node {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 0.8;
                this.pulse = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                this.pulse += 0.04;
            }

            draw() {
                ctx.fillStyle = '#00e676';
                ctx.beginPath();
                const currentSize = this.size + Math.sin(this.pulse) * 0.4;
                ctx.arc(this.x, this.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initNodes() {
            nodes = [];
            const count = Math.min(80, Math.floor((width * height) / 15000));
            for (let i = 0; i < count; i++) {
                nodes.push(new Node());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 130) {
                        const opacity = 0.1 * (1 - distance / 130);
                        ctx.strokeStyle = `rgba(0, 230, 118, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            initNodes();
        });
        resize();
        initNodes();
        animate();
    }

    // --- 3D Tilt Effect for Cards ---
    const tiltCards = document.querySelectorAll('.project-card');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Active Nav Link Highlight ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--accent-cyan)';
            }
        });
    });
});
