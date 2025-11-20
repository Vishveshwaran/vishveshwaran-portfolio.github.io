document.addEventListener('DOMContentLoaded', () => {

    // --- Typewriter Effect ---
    const typewriterElement = document.querySelector('.typewriter');
    const phrases = ["Embedded Systems", "VLSI", "Power Electronics"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before new phrase
        }

        setTimeout(type, typeSpeed);
    }

    if (typewriterElement) type();

    // --- Mobile Menu ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
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
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // --- Modals ---
    const modal = document.getElementById('project-modal');
    const closeModal = document.querySelector('.close-modal');
    const projectCards = document.querySelectorAll('.project-card');

    const projectData = {
        'ADAS': {
            title: 'ADAS Prototype',
            challenge: 'Real-time object detection with low latency on edge hardware.',
            solution: [
                'Implemented YOLOv4-tiny on NVIDIA Jetson Nano.',
                'Optimized inference time by 40% using TensorRT.',
                'Integrated CAN bus for vehicle communication simulation.'
            ]
        },
        'BMS': {
            title: 'Battery Management System',
            challenge: 'Accurate SOC/SOH estimation for Li-ion packs under varying loads.',
            solution: [
                'Designed master-slave architecture using STM32 MCUs.',
                'Implemented Kalman Filter for precise SOC estimation.',
                'Developed active cell balancing circuitry.'
            ]
        },
        'EV': {
            title: 'EV Propulsion Control',
            challenge: 'Efficient torque control for BLDC motor in electric vehicle context.',
            solution: [
                'Implemented FOC (Field Oriented Control) algorithm.',
                'Designed 3-phase inverter stage with IGBTs.',
                'Achieved 92% efficiency at nominal load.'
            ]
        },
        'PMSM': {
            title: 'PMSM Motor Drive',
            challenge: 'Reducing torque ripple in high-speed permanent magnet motors.',
            solution: [
                'Utilized Space Vector Pulse Width Modulation (SVPWM).',
                'Implemented sensorless control using back-EMF observer.',
                'Validated via Hardware-in-the-Loop (HIL) testing.'
            ]
        }
    };

    if (modal && projectCards) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project');
                const data = projectData[projectId];

                if (data) {
                    document.getElementById('modal-title').textContent = data.title;
                    document.getElementById('modal-challenge').textContent = data.challenge;

                    const solutionList = document.getElementById('modal-solution');
                    solutionList.innerHTML = '';
                    data.solution.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        solutionList.appendChild(li);
                    });

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });

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
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.pulse = 0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                this.pulse += 0.05;
            }

            draw() {
                ctx.fillStyle = '#00f3ff';
                ctx.beginPath();
                const currentSize = this.size + Math.sin(this.pulse) * 0.5;
                ctx.arc(this.x, this.y, Math.max(0, currentSize), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initNodes() {
            nodes = [];
            for (let i = 0; i < 60; i++) {
                nodes.push(new Node());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw connections (Circuit Traces)
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                for (let j = i; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        initNodes();
        animate();
    }

    // --- 3D Tilt Effect for Cards ---
    const tiltCards = document.querySelectorAll('.project-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

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
});
