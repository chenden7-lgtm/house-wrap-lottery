// AX 2000EV Color Swatch Catalog Explorer (463 Colors)
class ColorCatalog {
    constructor() {
        this.allColors = [];
        this.filtered = [];
        this.currentBook = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.pageSize = 24;
        this.currentPage = 1;
    }

    init() {
        this.allColors = window.AX_COLORS || [];
        this.filtered = [...this.allColors];
        this.renderBookTabs();
        this.renderCategoryFilters();
        this.renderColors();
        this.setupSearch();
    }

    renderBookTabs() {
        const container = document.getElementById('catalog-book-tabs');
        if (!container) return;

        const books = [
            { key: 'all', label: '全部色卡 (463色)' },
            { key: '1號色卡', label: '1號色卡 (E/漸變/特調)' },
            { key: '2號色卡', label: '2號色卡 (V系列經典)' },
            { key: '3號色卡', label: '3號色卡 (保時捷/雙B/奧迪)' },
            { key: '4號色卡', label: '4號色卡 (特斯拉/小米/新勢力)' }
        ];

        container.innerHTML = books.map(b => `
            <button class="book-tab-btn ${b.key === this.currentBook ? 'active' : ''}" data-book="${b.key}">
                ${b.label}
            </button>
        `).join('');

        container.querySelectorAll('.book-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.book-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBook = btn.dataset.book;
                this.currentPage = 1;
                this.applyFilters();
            });
        });
    }

    renderCategoryFilters() {
        const container = document.getElementById('catalog-color-categories');
        if (!container) return;

        const cats = [
            '全部色系', '粉紅/浪漫系', '深邃藍色系', '清新綠色系', '活力橙黃系',
            '熱情紅色系', '高貴紫色系', '科技銀灰系', '沉穩黑曜系', '漸變/幻彩系'
        ];

        container.innerHTML = cats.map(c => `
            <button class="filter-pill ${c === this.currentCategory ? 'active' : ''}" data-cat="${c}">
                ${c}
            </button>
        `).join('');

        container.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.currentPage = 1;
                this.applyFilters();
            });
        });
    }

    setupSearch() {
        const input = document.getElementById('catalog-search-input');
        if (!input) return;
        input.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
        });
    }

    applyFilters() {
        this.filtered = this.allColors.filter(c => {
            const bookMatch = this.currentBook === 'all' || c.book.includes(this.currentBook);
            const catMatch = this.currentCategory === '全部色系' || this.currentCategory === 'all' || c.category === this.currentCategory;

            let searchMatch = true;
            if (this.searchQuery) {
                const text = `${c.colorName} ${c.englishName} ${c.code} ${c.series}`.toLowerCase();
                searchMatch = text.includes(this.searchQuery);
            }

            return bookMatch && catMatch && searchMatch;
        });

        this.renderColors();
    }

    renderColors() {
        const grid = document.getElementById('catalog-grid');
        const countBadge = document.getElementById('catalog-count-badge');
        const loadMoreBtn = document.getElementById('catalog-load-more');
        if (!grid) return;

        if (countBadge) {
            countBadge.textContent = `共 ${this.filtered.length} 款原廠膜色`;
        }

        const itemsToShow = this.filtered.slice(0, this.currentPage * this.pageSize);

        if (itemsToShow.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎨</div>
                    <div class="empty-text">未找到符合條件的改色膜</div>
                    <p class="empty-sub">試試其他搜尋關鍵字或清除篩選條件</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        grid.innerHTML = itemsToShow.map(c => `
            <div class="color-card" onclick="window.colorCatalog.openDetail('${c.code}')">
                <div class="swatch-wrap" style="background: ${c.gradient};">
                    <div class="swatch-highlight"></div>
                    <span class="swatch-series-tag">${c.series}</span>
                    <span class="swatch-warranty">2年保固</span>
                </div>
                <div class="swatch-meta">
                    <div class="swatch-name-row">
                        <h4 class="swatch-name">${c.colorName}</h4>
                        <span class="swatch-code">${c.code}</span>
                    </div>
                    <div class="swatch-eng">${c.englishName}</div>
                    <div class="swatch-footer">
                        <span class="swatch-finish">${c.finish.split(' ')[0]}</span>
                        <span class="swatch-draw-hint">點擊查看 ↗</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (loadMoreBtn) {
            loadMoreBtn.style.display = itemsToShow.length < this.filtered.length ? 'inline-block' : 'none';
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderColors();
    }

    openDetail(code) {
        const item = this.allColors.find(c => c.code === code);
        if (!item) return;

        const modal = document.getElementById('color-detail-modal');
        if (!modal) return;

        document.getElementById('color-modal-swatch').style.background = item.gradient;
        document.getElementById('color-modal-name').textContent = item.colorName;
        document.getElementById('color-modal-eng').textContent = item.englishName;
        document.getElementById('color-modal-code').textContent = item.code;
        document.getElementById('color-modal-book').textContent = item.book;
        document.getElementById('color-modal-series').textContent = item.series;
        document.getElementById('color-modal-finish').textContent = item.finish;
        document.getElementById('color-modal-spec').textContent = item.spec || '1.524 x 16.8米';

        // Add to wheel / draw action
        const drawBtn = document.getElementById('color-modal-draw-btn');
        if (drawBtn) {
            drawBtn.onclick = () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                // Inject into wheel
                if (window.lotterySystem) {
                    window.lotterySystem.wheelSlices[0] = item;
                    window.lotterySystem.drawWheel();
                    window.location.hash = '#lottery-section';
                    if (window.showToast) {
                        window.showToast(`🎯 已將【${item.colorName}】載入幸運輪盤，祝您抽中9折！`);
                    }
                }
            };
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeDetail() {
        const modal = document.getElementById('color-detail-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

window.colorCatalog = new ColorCatalog();
