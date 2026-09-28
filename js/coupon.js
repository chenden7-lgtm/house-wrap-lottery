// Coupon and Voucher Certificate Manager (好室多膜 Edition)
class CouponManager {
    constructor() {
        this.currentPrize = null;
        this.couponCode = '';
        this.expiryDate = '';
    }

    generateVoucher(colorItem) {
        this.currentPrize = colorItem;
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timestampPart = Date.now().toString(36).slice(-4).toUpperCase();
        this.couponCode = `HSDM90-${randomHex}-${timestampPart}`;

        // 14 days expiry
        const now = new Date();
        const exp = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        this.expiryDate = `${exp.getFullYear()}/${(exp.getMonth() + 1).toString().padStart(2, '0')}/${exp.getDate().toString().padStart(2, '0')}`;

        // Save to localStorage for persistence
        const historyItem = {
            code: this.couponCode,
            color: colorItem,
            expiry: this.expiryDate,
            date: new Date().toLocaleDateString('zh-TW')
        };

        try {
            const list = JSON.parse(localStorage.getItem('ax_vouchers') || '[]');
            list.unshift(historyItem);
            localStorage.setItem('ax_vouchers', JSON.stringify(list.slice(0, 10)));
        } catch (e) {}

        return {
            code: this.couponCode,
            expiry: this.expiryDate,
            color: colorItem
        };
    }

    copyVoucherCode() {
        if (!this.couponCode) return;
        navigator.clipboard.writeText(this.couponCode).then(() => {
            if (window.showToast) {
                window.showToast('✅ 9折優惠代碼已複製到剪貼簿！');
            } else {
                alert('優惠代碼已複製：' + this.couponCode);
            }
        }).catch(() => {
            prompt('請手動複製優惠代碼：', this.couponCode);
        });
    }

    getLineBookingUrl() {
        if (!this.currentPrize) return '#';
        const msg = encodeURIComponent(
            `【好室多膜 改色膜抽色 9 折預約】\n` +
            `您好！我剛剛在好室多膜活動頁面抽中了專屬 9 折顏色：\n` +
            `🎨 抽選顏色：${this.currentPrize.colorName} (${this.currentPrize.englishName})\n` +
            `🔖 色號編號：${this.currentPrize.code} (${this.currentPrize.series})\n` +
            `🎁 專屬優惠：施工指定中獎顏色享 9 折（已附上中獎畫面截圖）\n` +
            `請問可以預約安排到店諮詢/評估施工時間嗎？`
        );
        return `https://line.me/R/msg/text/?${msg}`;
    }

    downloadVoucherImage() {
        if (!this.currentPrize) return;

        // Render high-res light theme voucher card to canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = 920;
        const h = 580;
        canvas.width = w;
        canvas.height = h;

        // Clean ivory/white background
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Elegant orange border glow
        ctx.strokeStyle = '#ff6b00';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        // Inner dashed line
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 36, w - 72, h - 72);
        ctx.setLineDash([]);

        // Brand header
        ctx.fillStyle = '#ff6b00';
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('好室多膜 house wrapper ｜ 專屬車色狂歡節', 60, 85);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('9 折改色膜施工禮遇憑證', 60, 140);

        // Orange badge
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.roundRect(w - 230, 60, 170, 44, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('限時 9 折特惠', w - 145, 89);
        ctx.textAlign = 'left';

        // Color preview box
        const colorGrad = ctx.createLinearGradient(60, 180, 290, 410);
        colorGrad.addColorStop(0, this.currentPrize.hex || '#ff6b00');
        colorGrad.addColorStop(1, '#e05300');
        ctx.fillStyle = colorGrad;
        ctx.beginPath();
        ctx.roundRect(60, 180, 230, 230, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Color gloss sheen
        const sheen = ctx.createLinearGradient(60, 180, 290, 295);
        sheen.addColorStop(0, 'rgba(255,255,255,0.45)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheen;
        ctx.beginPath();
        ctx.roundRect(60, 180, 230, 115, [20, 20, 0, 0]);
        ctx.fill();

        // Color info text
        ctx.fillStyle = '#64748b';
        ctx.font = '18px sans-serif';
        ctx.fillText('中獎改色膜顏色：', 325, 215);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 36px sans-serif';
        ctx.fillText(this.currentPrize.colorName, 325, 260);

        ctx.fillStyle = '#ff6b00';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(this.currentPrize.englishName, 325, 300);

        ctx.fillStyle = '#475569';
        ctx.font = '17px sans-serif';
        ctx.fillText(`色號編號：${this.currentPrize.code} ｜ 系列：${this.currentPrize.series} ｜ 官方質保2年`, 325, 338);

        // Voucher Code banner
        ctx.fillStyle = '#fff5ee';
        ctx.beginPath();
        ctx.roundRect(325, 360, 520, 54, 10);
        ctx.fill();
        ctx.strokeStyle = '#ff6b00';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ff6b00';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`憑證代碼：${this.couponCode}`, 345, 396);

        // Footer / Terms
        ctx.fillStyle = '#64748b';
        ctx.font = '15px sans-serif';
        ctx.fillText(`※ 條款須知：限指定抽選之顏色施工享有9折優惠，不得與其他折價促銷活動並用。`, 60, 465);
        ctx.fillText(`※ 預約評估：憑此中獎畫面截圖至好室多膜門市出示或透過官方 LINE 預約登記確認`, 60, 498);
        ctx.fillText(`好室多膜 house wrapper ｜ AX Film 官方原廠膜料・專業無塵施工`, 60, 530);

        // Trigger download
        const link = document.createElement('a');
        link.download = `好室多膜-9折施工憑證-${this.currentPrize.code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (window.showToast) {
            window.showToast('📥 9折憑證圖片已開始下載！');
        }
    }
}

window.couponManager = new CouponManager();
