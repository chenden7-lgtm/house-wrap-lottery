// AX Film Turbo Instant Random Draw Engine (Full 463 Colors)
class TurboLottery {
    constructor() {
        this.isDrawing = false;
        this.allColors = [];
        this.selectedWinner = null;
        this.idleInterval = null;
    }

    init() {
        this.allColors = window.AX_COLORS || [];
        this.setupInitialDisplay();
        this.startIdleAnimation();
    }

    setupInitialDisplay() {
        const pool = this.allColors;
        if (!pool.length) return;

        // Pick a cool initial color to showcase
        const initial = pool.find(c => c.colorName.includes('櫻花粉') || c.colorName.includes('冰川藍')) || pool[0];
        this.updateDisplay(initial, false);
    }

    startIdleAnimation() {
        if (this.idleInterval) clearInterval(this.idleInterval);
        
        // Gentle preview rotation every 3.5 seconds when idle
        this.idleInterval = setInterval(() => {
            if (this.isDrawing) return;
            const randomPick = this.allColors[Math.floor(Math.random() * this.allColors.length)];
            this.updateDisplay(randomPick, true);
        }, 3500);
    }

    updateDisplay(item, isSoft = false) {
        const swatch = document.getElementById('turbo-display-swatch');
        const nameElem = document.getElementById('turbo-display-name');
        const engElem = document.getElementById('turbo-display-eng');
        const codeElem = document.getElementById('turbo-display-code');
        const seriesElem = document.getElementById('turbo-display-series');

        if (swatch) {
            swatch.style.background = item.gradient || item.hex;
            swatch.style.borderColor = item.hex || '#f59e0b';
            swatch.style.boxShadow = `0 12px 35px ${item.hex}55, 0 0 50px rgba(0,0,0,0.8)`;
        }
        if (nameElem) nameElem.textContent = item.colorName;
        if (engElem) engElem.textContent = item.englishName || '';
        if (codeElem) codeElem.textContent = `色號：${item.code}`;
        if (seriesElem) seriesElem.textContent = `${item.series} ｜ 質保2年`;
    }

    startDraw() {
        if (this.isDrawing) return;
        this.isDrawing = true;

        if (this.idleInterval) clearInterval(this.idleInterval);
        if (window.soundFx) window.soundFx.init();

        const btn = document.getElementById('turbo-draw-btn');
        if (btn) {
            btn.disabled = true;
            btn.classList.add('drawing');
            btn.innerHTML = `<span>隨機抽選中...</span><span class="spin-loader">⚡</span>`;
        }

        const pool = this.allColors;
        // Select final winner randomly from ALL 463 colors
        const winner = pool[Math.floor(Math.random() * pool.length)];
        this.selectedWinner = winner;

        // Deceleration slot machine physics
        const totalDuration = 3800; // 3.8 seconds total
        const startTime = performance.now();
        let lastFrameTime = startTime;
        let currentInterval = 35; // start fast (35ms per tick)

        const cycle = () => {
            const now = performance.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);

            // Exponential slowdown
            currentInterval = 35 + Math.pow(progress, 3.2) * 350;

            if (now - lastFrameTime >= currentInterval) {
                lastFrameTime = now;

                if (progress < 0.95) {
                    const temp = pool[Math.floor(Math.random() * pool.length)];
                    this.updateDisplay(temp);
                } else {
                    // Lock to winner near the end
                    this.updateDisplay(winner);
                }

                // Audio tick with pitch variation
                if (window.soundFx) {
                    const pitch = 1.3 - progress * 0.6;
                    window.soundFx.playTick(pitch);
                }
            }

            if (progress < 1) {
                requestAnimationFrame(cycle);
            } else {
                // Done!
                this.updateDisplay(winner);
                this.onWinnerRevealed(winner);

                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('drawing');
                    btn.innerHTML = `<span>再次極速抽取 9 折</span><span style="font-size: 1.4rem;">⚡</span>`;
                }
                this.isDrawing = false;
                this.startIdleAnimation();
            }
        };

        requestAnimationFrame(cycle);
    }

    onWinnerRevealed(winner) {
        if (window.soundFx) window.soundFx.playWin();
        if (window.confettiEffect) window.confettiEffect.burst(window.innerWidth / 2, window.innerHeight / 2, 140);

        const voucher = window.couponManager.generateVoucher(winner);
        this.showPrizeModal(voucher);
    }

    showPrizeModal(voucher) {
        const modal = document.getElementById('prize-modal');
        if (!modal) return;

        const item = voucher.color;
        document.getElementById('modal-color-name').textContent = item.colorName;
        document.getElementById('modal-color-eng').textContent = item.englishName;
        document.getElementById('modal-color-code').textContent = item.code;
        document.getElementById('modal-color-series').textContent = `${item.book} ｜ ${item.series}`;
        document.getElementById('modal-color-spec').textContent = item.spec || '1.524 x 16.8米';
        document.getElementById('modal-color-finish').textContent = item.finish;
        document.getElementById('modal-voucher-code').textContent = voucher.code;
        document.getElementById('modal-voucher-expiry').textContent = voucher.expiry;

        const swatch = document.getElementById('modal-color-swatch');
        if (swatch) {
            swatch.style.background = item.gradient;
        }

        // Matching case photo from AX Film
        const caseImg = document.getElementById('modal-case-img');
        const caseTitle = document.getElementById('modal-case-title');
        const caseBox = document.getElementById('modal-case-box');

        if (item.exampleCase && item.exampleCase.img) {
            caseBox.style.display = 'block';
            caseImg.src = item.exampleCase.img;
            caseTitle.textContent = `實裝範例：${item.exampleCase.car} (${item.exampleCase.color})`;
        } else {
            const fallbackCase = (window.AX_CASES || [])[Math.floor(Math.random() * (window.AX_CASES ? window.AX_CASES.length : 1))];
            if (fallbackCase) {
                caseBox.style.display = 'block';
                caseImg.src = fallbackCase.img;
                caseTitle.textContent = `AX Film 經典施工實裝：${fallbackCase.car} (${fallbackCase.color})`;
            } else {
                caseBox.style.display = 'none';
            }
        }

        // Update LINE link
        const lineBtn = document.getElementById('modal-line-btn');
        if (lineBtn) {
            lineBtn.href = window.couponManager.getLineBookingUrl();
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePrizeModal() {
        const modal = document.getElementById('prize-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

window.lotterySystem = new TurboLottery();
