// AX Film Case Gallery System
class CaseGallery {
    constructor() {
        this.allCases = [];
        this.filteredCases = [];
        this.currentBrand = 'all';
        this.searchQuery = '';
        this.pageSize = 12;
        this.currentPage = 1;
    }

    init() {
        this.allCases = window.AX_CASES || [];
        this.filteredCases = [...this.allCases];
        this.renderBrandFilter();
        this.renderCases();
        this.setupSearch();
    }

    renderBrandFilter() {
        const container = document.getElementById('gallery-brand-filters');
        if (!container) return;

        const brands = [
            { key: 'all', label: '🔥 全部案例 (180+)' },
            { key: 'Tesla 特斯拉', label: '⚡ Tesla 特斯拉' },
            { key: '保時捷', label: '🏎️ 保時捷 Porsche' },
            { key: 'BMW 寶馬', label: '🏁 BMW 寶馬' },
            { key: 'Mercedes 賓士', label: '⭐ Mercedes 賓士' },
            { key: 'Audi 奧迪', label: '✨ Audi 奧迪' },
            { key: 'NIO 蔚來', label: '🔋 NIO 蔚來' },
            { key: '小米', label: '🚀 小米 SU7' },
            { key: 'supercar', label: '👑 頂級超跑/豪車' }
        ];

        container.innerHTML = brands.map(b => `
            <button class="filter-pill ${b.key === this.currentBrand ? 'active' : ''}" data-brand="${b.key}">
                ${b.label}
            </button>
        `).join('');

        container.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setBrand(btn.dataset.brand);
            });
        });
    }

    setupSearch() {
        const input = document.getElementById('gallery-search-input');
        if (!input) return;
        input.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
        });
    }

    setBrand(brand) {
        this.currentBrand = brand;
        this.currentPage = 1;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredCases = this.allCases.filter(c => {
            let brandMatch = true;
            if (this.currentBrand === 'supercar') {
                brandMatch = ['McLaren 邁凱倫', 'Rolls-Royce 勞斯萊斯', 'Bentley 賓利', '法拉利'].includes(c.brand);
            } else if (this.currentBrand !== 'all') {
                brandMatch = c.brand.includes(this.currentBrand) || c.car.includes(this.currentBrand);
            }

            let searchMatch = true;
            if (this.searchQuery) {
                const text = `${c.car} ${c.color} ${c.brand}`.toLowerCase();
                searchMatch = text.includes(this.searchQuery);
            }

            return brandMatch && searchMatch;
        });

        this.renderCases();
    }

    renderCases() {
        const grid = document.getElementById('gallery-grid');
        const countBadge = document.getElementById('gallery-count-badge');
        const loadMoreBtn = document.getElementById('gallery-load-more');
        if (!grid) return;

        if (countBadge) {
            countBadge.textContent = `共 ${this.filteredCases.length} 個實車案例`;
        }

        const itemsToShow = this.filteredCases.slice(0, this.currentPage * this.pageSize);

        if (itemsToShow.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">未找到符合條件的改色膜作品</div>
                    <p class="empty-sub">試試其他品牌關鍵字或查看全部案例</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        grid.innerHTML = itemsToShow.map(c => `
            <div class="case-card" onclick="window.caseGallery.openModal('${c.id}')">
                <div class="case-img-wrap">
                    <img src="${c.img}" alt="${c.car} - ${c.color}" loading="lazy" onerror="this.src='https://axfilm.oss-cn-shanghai.aliyuncs.com/uploads/20231011/d5ccc78d69f74f5483881f1c3f33d1f1.jpg'"/>
                    <span class="case-brand-tag">${c.brand}</span>
                    <div class="case-overlay">
                        <span class="view-btn">查看細節 ↗</span>
                    </div>
                </div>
                <div class="case-info">
                    <h4 class="case-car">${c.car}</h4>
                    <div class="case-color-row">
                        <span class="color-dot"></span>
                        <span class="case-color">${c.color}</span>
                    </div>
                    <div class="case-specs">
                        <span class="badge-tag">AX 原廠膜</span>
                        <span class="badge-tag">2年原廠質保</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (loadMoreBtn) {
            loadMoreBtn.style.display = itemsToShow.length < this.filteredCases.length ? 'inline-block' : 'none';
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderCases();
    }

    openModal(caseId) {
        const item = this.allCases.find(c => c.id === caseId);
        if (!item) return;

        const modal = document.getElementById('case-modal');
        if (!modal) return;

        document.getElementById('case-modal-img').src = item.img;
        document.getElementById('case-modal-car').textContent = item.car;
        document.getElementById('case-modal-color').textContent = item.color;
        document.getElementById('case-modal-brand').textContent = item.brand;
        document.getElementById('case-modal-source').href = item.url;

        // Button to lock this color for lottery or direct booking
        const applyBtn = document.getElementById('case-modal-apply-btn');
        if (applyBtn) {
            applyBtn.onclick = () => {
                modal.classList.remove('active');
                // Scroll to lottery and pick this color or trigger
                window.location.hash = '#lottery-section';
                if (window.showToast) {
                    window.showToast(`✨ 已鎖定【${item.color}】，快試試手氣抽選 9 折！`);
                }
            };
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('case-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

window.caseGallery = new CaseGallery();
