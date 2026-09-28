// Main Application Controller & UI Orchestrator
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core systems
    if (window.lotterySystem) window.lotterySystem.init();
    if (window.caseGallery) window.caseGallery.init();

    // 2. Turbo Draw Button Listener
    const turboDrawBtn = document.getElementById('turbo-draw-btn');
    if (turboDrawBtn) {
        turboDrawBtn.addEventListener('click', () => {
            if (window.lotterySystem) window.lotterySystem.startDraw();
        });
    }

    // 3. Sound toggle
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            if (window.soundFx) {
                const muted = window.soundFx.toggleMute();
                soundToggleBtn.textContent = muted ? '🔇 靜音' : '🔊 音效';
                soundToggleBtn.classList.toggle('muted', muted);
                window.showToast(muted ? '已開啟靜音' : '已開啟音效');
            }
        });
    }

    // 4. Mobile Navigation Drawer
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });
    }
    if (mobileCloseBtn && mobileNav) {
        mobileCloseBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    }
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav) mobileNav.classList.remove('active');
        });
    });

    // 5. Floating Draw FAB on mobile
    const floatingDrawBtn = document.getElementById('floating-draw-fab');
    if (floatingDrawBtn) {
        floatingDrawBtn.addEventListener('click', () => {
            const sec = document.getElementById('lottery-section');
            if (sec) {
                sec.scrollIntoView({ behavior: 'smooth' });
                if (turboDrawBtn) {
                    turboDrawBtn.focus();
                }
            }
        });
    }
});

// Toast notification helper
window.showToast = function(msg, duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');

    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, duration);
};
