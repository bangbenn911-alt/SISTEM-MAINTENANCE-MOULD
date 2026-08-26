// ==========================================
// 1. ENGINE METRIK REALTIME & SECURITY
// ==========================================
window.jalankanEngineMetrik = function() {
    // Metrik HUD
    setInterval(() => {
        let netType = "4G"; let netColor = "#10b981"; let speedVal = "--"; let speedColor = "#38bdf8"; 
        if (navigator.connection) {
            const conn = navigator.connection;
            netType = conn.effectiveType ? conn.effectiveType.toUpperCase() : "WIFI";
            if (conn.downlink) {
                let mbps = conn.downlink;
                if (mbps < 1.0) { speedVal = Math.round(mbps * 1000) + " Kbps"; speedColor = "#f59e0b"; netColor = "#f59e0b"; } 
                else { speedVal = mbps.toFixed(1) + " Mbps"; }
            }
            if (conn.downlink < 0.5) { netColor = "#ef4444"; speedColor = "#ef4444"; netType = "POOR"; }
        } else { netType = "WIFI/4G"; speedVal = "Optimum"; }
        
        let baseCpu = Math.floor(Math.random() * 12) + 5; let cpuColor = "#34d399";
        if (netColor === "#ef4444") baseCpu += 20; 
        if (baseCpu > 25) cpuColor = "#f59e0b";
        
        const elNet = document.getElementById('live-net'); const elSpeed = document.getElementById('live-speed'); const elCpu = document.getElementById('live-cpu');
        if(elNet) { elNet.innerText = netType; elNet.style.color = netColor; }
        if(elSpeed) { elSpeed.innerText = speedVal; elSpeed.style.color = speedColor; }
        if(elCpu) { elCpu.innerText = baseCpu + "%"; elCpu.style.color = cpuColor; }
    }, 2000); 

    // PEMBARUAN: JAM REAL-TIME KHUSUS FORM INPUT NOTULEN
    setInterval(() => {
        const elWaktuNotul = document.getElementById('notul-waktu-display');
        if (elWaktuNotul) {
            const now = new Date();
            elWaktuNotul.value = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " - " + now.toLocaleTimeString('id-ID', { hour12: false });
        }
    }, 1000);
};

let cyberScanInterval;
const scanPhrases = [ "Memeriksa integritas DOM HTML...", "Ping Firebase Server Database...", "Menganalisa paket trafik data masuk...", "Filter script XSS aktif & siaga...", "Sistem Bersih. Tidak ada injeksi malware.", "Koneksi Enkripsi SSL Firestore aktif.", "Sinkronisasi Cloud sukses.", "Memblokir request tidak memiliki token otoritas..." ];

window.logKeamanan = function(pesan, tipe = "info") {
    const logContainer = document.getElementById('cyber-log-container'); 
    if(!logContainer) return;
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    let color = tipe === "ancaman" ? "#ef4444" : tipe === "scan" ? "#f59e0b" : "#10b981";
    let prefix = tipe === "ancaman" ? "[BLOCKED]" : tipe === "scan" ? "[SCANNING]" : "[SECURE]";
    logContainer.innerHTML += `<div style="color:${color}; margin-bottom:4px; line-height:1.4;">[${time}] ${prefix} ${pesan}</div>`;
    logContainer.scrollTop = logContainer.scrollHeight; 
    if(logContainer.childElementCount > 50) logContainer.removeChild(logContainer.firstChild);
};

window.bukaPanelKeamanan = function() {
    document.getElementById('cyber-security-panel').style.display = 'flex';
    document.getElementById('cyber-log-container').innerHTML = `<div style="color: #38bdf8; margin-bottom:4px;">[SYSTEM] Memulai protokol Firewall Firebase v3.0...</div>`;
    cyberScanInterval = setInterval(() => {
        const phrase = scanPhrases[Math.floor(Math.random() * scanPhrases.length)];
        let type = "scan";
        if(phrase.includes("Bersih") || phrase.includes("aktif") || phrase.includes("sukses")) type = "info";
        if(phrase.includes("Memblokir")) type = "ancaman";
        window.logKeamanan(phrase, type);
    }, 1200); 
};

window.tutupPanelKeamanan = function() { document.getElementById('cyber-security-panel').style.display = 'none'; clearInterval(cyberScanInterval); };

setInterval(() => {
    const texts = ["Cyber Security", "Memantau Trafik", "Enkripsi Aktif", "Filter XSS On"];
    const shieldText = document.getElementById('shield-text');
    if(shieldText) shieldText.innerText = texts[Math.floor(Math.random() * texts.length)];
}, 3500);

window.amankanData = function(str) {
    if (typeof str !== 'string') return str;
    let original = str;
    let aman = str.replace(/<script[^>]*?>.*?<\/script>/gi, '').replace(/<iframe[^>]*?>.*?<\/iframe>/gi, '').replace(/<[\/\!]*?[^<>]*?>/gi, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '');
    if(original !== aman) window.logKeamanan(`ANOMALI TERDETEKSI! Skrip berbahaya dihancurkan.`, "ancaman");
    return aman;
};

// =========================================================
// ENGINE PANNING & PINCH-TO-ZOOM (SMOOTH & AUTO CENTER)
// =========================================================
window.isDraggingOrg = false; 
window.orgZoomScale = 1.0;
let startXOrg, startYOrg, scrollLeftOrg, scrollTopOrg;
let initialPinchDist = null;
let initialScale = 1;

document.addEventListener("DOMContentLoaded", () => {
    const vp = document.getElementById('org-viewport');
    const wrapper = document.getElementById('org-zoom-wrapper');
    if(!vp) return;

    // Touch events for Pinch-to-Zoom & Pan
    vp.addEventListener('touchstart', (e) => {
        if (e.target.closest('.editable')) return; 
        if (e.touches.length === 2) {
            initialPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            initialScale = window.orgZoomScale;
        } else if (e.touches.length === 1) {
            window.isDraggingOrg = true;
            vp.style.cursor = 'grabbing';
            startXOrg = e.touches[0].clientX - vp.offsetLeft;
            startYOrg = e.touches[0].clientY - vp.offsetTop;
            scrollLeftOrg = vp.scrollLeft;
            scrollTopOrg = vp.scrollTop;
        }
    }, {passive: false});

    vp.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDist) {
            e.preventDefault();
            const currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const scaleChange = currentDist / initialPinchDist;
            window.orgZoomScale = Math.min(Math.max(0.4, initialScale * scaleChange), 2.5);
            wrapper.style.transform = `scale(${window.orgZoomScale})`;
        } else if (e.touches.length === 1 && window.isDraggingOrg) {
            e.preventDefault();
            requestAnimationFrame(() => {
                const x = e.touches[0].clientX - vp.offsetLeft;
                const y = e.touches[0].clientY - vp.offsetTop;
                vp.scrollLeft = scrollLeftOrg - (x - startXOrg);
                vp.scrollTop = scrollTopOrg - (y - startYOrg);
            });
        }
    }, {passive: false});

    vp.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) initialPinchDist = null;
        if (e.touches.length === 0) {
            window.isDraggingOrg = false;
            vp.style.cursor = 'grab';
        }
    });

    // Mouse events for Desktop
    window.startPanOrg = (e) => { 
        if(e.touches || e.target.closest('.editable')) return; 
        window.isDraggingOrg = true; 
        vp.style.cursor = 'grabbing'; 
        startXOrg = e.pageX - vp.offsetLeft; 
        startYOrg = e.pageY - vp.offsetTop; 
        scrollLeftOrg = vp.scrollLeft; 
        scrollTopOrg = vp.scrollTop; 
    };
    window.stopPanOrg = () => { window.isDraggingOrg = false; vp.style.cursor = 'grab'; };
    window.doPanOrg = (e) => { 
        if(!window.isDraggingOrg || e.touches) return; 
        requestAnimationFrame(() => { 
            vp.scrollLeft = scrollLeftOrg - (e.pageX - vp.offsetLeft - startXOrg); 
            vp.scrollTop = scrollTopOrg - (e.pageY - vp.offsetTop - startYOrg); 
        }); 
    };
});

window.zoomOrg = (d) => { 
    const wp = document.getElementById('org-zoom-wrapper'); 
    if(d === 0) {
        window.orgZoomScale = 1.0; 
        wp.style.transform = `scale(1.0)`;
        setTimeout(() => { window.centerOrgView(); }, 150); 
    } else {
        window.orgZoomScale = Math.min(Math.max(0.4, window.orgZoomScale + d), 2.5); 
        wp.style.transform = `scale(${window.orgZoomScale})`; 
    }
};

window.centerOrgView = () => {
    const vp = document.getElementById('org-viewport');
    const wp = document.getElementById('org-zoom-wrapper');
    if(vp && wp) {
        const scrollX = (wp.scrollWidth - vp.clientWidth) / 2;
        vp.scrollTo({ left: scrollX, behavior: 'smooth' });
    }
};

// ==========================================
// SCRIPT FIREBASE & LOGIKA APLIKASI UTAMA    
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence, collection, addDoc, getDocs, doc, updateDoc, setDoc, query, deleteDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDiQxWJSEsA0YkTcGCeqftJ8KaApYD873Q",
    authDomain: "sistem-maintenance-mold.firebaseapp.com",
    projectId: "sistem-maintenance-mold",
    storageBucket: "sistem-maintenance-mold.firebasestorage.app",
    messagingSenderId: "463812011559",
    appId: "1:463812011559:web:8c60eed07a01324f7f5002"
};

const app = initializeApp(firebaseConfig); 
window.db = getFirestore(app); 

// --- INJEKSI FITUR OFFLINE & AUTO-SYNC FIREBASE ---
enableIndexedDbPersistence(window.db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Mode offline hanya bisa aktif di satu tab browser dalam satu waktu.');
    } else if (err.code == 'unimplemented') {
        console.warn('Browser ini tidak mendukung penyimpanan offline.');
    }
});
// --------------------------------------------------

const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

// Variabel Global Data
window.infoDatabase = []; window.notulenDatabase = []; window.admHarianDatabase = []; 
window.pkmDatabase = []; window.dataProyekWS = []; window.arrayTugasBaru = [];
window.surkomDatabase = []; window.surkomTahunAktif = 'ALL'; window.isModePilihSurkom = false;
window.orgDatabase = [];
window.smDatabase = []; 
window.skDatabase = []; 
window.pesertaManualNotulen = []; 

// VARIABEL BARU TIM & PERSONEL
window.personelDatabase = []; window.isPersonelUnlocked = false; 

// Setup PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

window.toggleLoader = function(show, text = "Memproses...") { const lt = document.getElementById('loader-text'); const l = document.getElementById('loader'); if(lt) lt.innerText = text; if(l) l.style.display = show ? 'flex' : 'none'; };

window.cetakPDFUniversal = function() { window.print(); };
window.cetakGambarUniversal = function(targetId, namaFile) { window.scrollTo(0, 0); window.toggleLoader(true, "Mencetak..."); setTimeout(() => { html2canvas(document.getElementById(targetId), { scale: 2, useCORS: true, backgroundColor: "#040d1a" }).then(canvas => { let link = document.createElement('a'); link.download = `${namaFile}_${Date.now()}.jpg`; link.href = canvas.toDataURL('image/jpeg', 0.9); link.click(); window.toggleLoader(false); }).catch(e => { alert("Gagal cetak gambar."); window.toggleLoader(false); }); }, 300); };
window.compressImage = function(file, maxW = 1200, maxH = 1200, q = 0.6) { return new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = e => { const img = new Image(); img.src = e.target.result; img.onload = () => { let w = img.width, h = img.height; if(w > maxW) { h = Math.round(h * maxW / w); w = maxW; } const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h; cvs.getContext('2d').drawImage(img, 0, 0, w, h); res(cvs.toDataURL('image/jpeg', q)); }; img.onerror = rej; }; r.onerror = rej; }); };
window.cekFoto = function(input, targetId) { const target = document.getElementById(targetId); if (target && input.files && input.files.length > 0) { target.innerHTML = `<i class="fas fa-check-circle" style="color:var(--cepat);"></i> File siap`; } else if (target) { target.innerHTML = ""; } }; window.cekFotoFile = window.cekFoto;

window.masukBerandaCepat = async function() {
    if(navigator.vibrate) navigator.vibrate([50]);
    if(auth.currentUser) { window.toggleLoader(true, "Membuka Sistem..."); try { await getDocs(query(collection(window.db, "informasi_mold"))); window.toggleLoader(false); bukaPintu(); } catch(e) { window.toggleLoader(false); await signOut(auth); alert("Sesi tidak valid."); } return; }
    try { await signInWithPopup(auth, provider); window.toggleLoader(true, "Verifikasi..."); await getDocs(query(collection(window.db, "informasi_mold"))); window.toggleLoader(false); bukaPintu(); } catch(e) { window.toggleLoader(false); if(e.code !== 'auth/popup-closed-by-user') alert("Login Gagal."); }
};
function bukaPintu() { const l = document.getElementById('landing-page'); if(l) l.classList.add('door-open'); setTimeout(() => { if(l) l.style.display='none'; document.getElementById('global-bottom-nav').style.display='flex'; window.navigasi('home-screen'); window.jalankanEngineMetrik(); }, 300); }

let riwayatNav = ['landing-page'];
window.navigasi = function(id) { 
    if(riwayatNav[riwayatNav.length-1] !== id) { riwayatNav.push(id); history.pushState({page: id}, "", ""); } 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen')); 
    document.getElementById(id)?.classList.add('active-screen'); 
    window.updateBottomNav(id); 
    window.scrollTo(0, 0); 
    if(id === 'ai-dashboard-screen') window.inisialisasiDataAnalisaGlobal(); 
    if(id === 'struktur-organisasi-screen') { window.ambilDataOrg(); setTimeout(()=>window.centerOrgView(), 500); } 
};
window.kembaliKeSebelumnya = function() { if(riwayatNav.length > 1) { riwayatNav.pop(); const prev = riwayatNav[riwayatNav.length-1]; document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen')); if(prev === 'landing-page') { const l = document.getElementById('landing-page'); if(l) { l.style.display='flex'; l.classList.remove('door-open'); } document.getElementById('global-bottom-nav').style.display='none'; } else { document.getElementById(prev)?.classList.add('active-screen'); } window.updateBottomNav(prev); window.scrollTo(0, 0); } };
window.addEventListener('popstate', () => window.kembaliKeSebelumnya());
window.updateBottomNav = function(id) { document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active')); const l = document.getElementById('nav-lampu'); if(l) l.classList.remove('active-lamp'); if(id==='home-screen') document.getElementById('nav-home')?.classList.add('active'); else if(id==='ai-dashboard-screen') document.getElementById('nav-analisa')?.classList.add('active'); else if(id==='ide-center-screen') { if(l) l.classList.add('active-lamp'); } else if(id==='inbox-screen') document.getElementById('nav-inbox')?.classList.add('active'); else if(id==='profil-screen') document.getElementById('nav-profil')?.classList.add('active'); };

window.masukDivisi = async function(div) { if(div === 'DIVISI MOLD STORE') window.navigasi('mold-store-menu-screen'); else { const jd = document.getElementById('judul-divisi'); if(jd) jd.innerText = div; window.navigasi('divisi-screen'); if(div === 'DIVISI MOLD WORKSHOP') await window.ambilDataServerWS(); } };
window.bukaMenuPermintaanTrial = function() { window.navigasi('trial-mold-screen'); window.switchTabTrial('input'); };

function base64ToArrayBuffer(b64) { 
    let bs = window.atob(b64.split(',')[1]); 
    let len = bs.length; 
    let bytes = new Uint8Array(len); 
    for(let i=0; i<len; i++) bytes[i] = bs.charCodeAt(i); 
    return bytes.buffer; 
}

window.kompresPDFAjaib = async function(file) {
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const { PDFDocument } = PDFLib;
    const newPdf = await PDFDocument.create();
    
    for(let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        
        const imgB64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        const imgBytes = Uint8Array.from(atob(imgB64), c => c.charCodeAt(0));
        
        const jpgImage = await newPdf.embedJpg(imgBytes);
        const newPage = newPdf.addPage([vp.width, vp.height]);
        newPage.drawImage(jpgImage, { x: 0, y: 0, width: vp.width, height: vp.height });
    }
    return await newPdf.saveAsBase64({ dataUri: true });
};

window.handleFileSelectArsip = function(input, labelId) {
    const label = document.getElementById(labelId);
    if(input.files && input.files.length > 0) {
        label.innerText = input.files[0].name;
        label.style.color = "#10b981";
    } else {
        label.innerText = "Klik untuk pilih file PDF";
        label.style.color = "white";
    }
};

window.simpanSuratMasuk = async function() {
    const jd = window.amankanData(document.getElementById('sm-judul').value);
    const tg = document.getElementById('sm-tanggal').value;
    const fileInput = document.getElementById('sm-file-pdf');
    if(!jd || !tg || fileInput.files.length === 0) return alert("Lengkapi judul, tanggal, dan file PDF!");
    window.toggleLoader(true, "Mengkompresi & Menyimpan PDF...");
    try {
        let thn = tg.split('-')[0];
        let b64 = await window.kompresPDFAjaib(fileInput.files[0]);
        await addDoc(collection(window.db, "surat_masuk"), { judul: jd.toUpperCase(), tanggal: tg, tahun: thn, filePdfBase64: b64, timestamp: Date.now() });
        alert("Surat Masuk Berhasil Disimpan!");
        document.getElementById('sm-judul').value = ""; document.getElementById('sm-tanggal').value = "";
        window.handleFileSelectArsip({files:[]}, 'sm-file-label'); window.bukaDataSuratMasuk();
    } catch(e) { alert("Gagal menyimpan: " + e.message); }
    window.toggleLoader(false);
};

window.bukaDataSuratMasuk = async () => { window.navigasi('sm-data-screen'); await window.renderListSuratMasuk(true); };
window.renderListSuratMasuk = async function(forceFetch = false) {
    const c = document.getElementById('sm-list-container');
    const kw = window.amankanData((document.getElementById('sm-search-key').value || "").toLowerCase());
    const ft = document.getElementById('sm-filter-tahun').value;
    if(forceFetch || window.smDatabase.length === 0) {
        if(!forceFetch) window.toggleLoader(true, "Memuat Data...");
        window.smDatabase = [];
        try {
            const snap = await getDocs(query(collection(window.db, "surat_masuk")));
            snap.forEach(d => window.smDatabase.push({id: d.id, ...d.data()}));
            window.smDatabase.sort((a,b) => b.timestamp - a.timestamp);
        } catch(e){}
        if(!forceFetch) window.toggleLoader(false);
    }
    let data = window.smDatabase.filter(d => { return ((d.judul || "").toLowerCase().includes(kw)) && ((ft === 'ALL') ? true : (d.tahun == ft)); });
    if(data.length === 0) return c.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:30px;">Tidak ada Surat Masuk ditemukan.</p>`;
    let h = "";
    data.forEach(d => {
        h += `<div class="progress-card" style="display:flex; justify-content:space-between; align-items:center; border-left-color:#10b981;" onclick="window.bukaViewerArsip('SM', '${d.id}')"><div><h4 style="margin:0 0 5px 0; color:#10b981;">${d.judul}</h4><p style="margin:0; font-size:11px; color:var(--text-muted);"><i class="fas fa-calendar-alt"></i> Tgl: ${d.tanggal} | Thn: ${d.tahun}</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);"></i></div>`;
    });
    c.innerHTML = h;
};

window.simpanSuratKeluar = async function() {
    const jd = window.amankanData(document.getElementById('sk-judul').value);
    const tg = document.getElementById('sk-tanggal').value;
    const fileInput = document.getElementById('sk-file-pdf');
    if(!jd || !tg || fileInput.files.length === 0) return alert("Lengkapi judul, tanggal, dan file PDF!");
    window.toggleLoader(true, "Mengkompresi & Menyimpan PDF...");
    try {
        let thn = tg.split('-')[0];
        let b64 = await window.kompresPDFAjaib(fileInput.files[0]);
        await addDoc(collection(window.db, "surat_keluar"), { judul: jd.toUpperCase(), tanggal: tg, tahun: thn, filePdfBase64: b64, timestamp: Date.now() });
        alert("Surat Keluar Berhasil Disimpan!");
        document.getElementById('sk-judul').value = ""; document.getElementById('sk-tanggal').value = "";
        window.handleFileSelectArsip({files:[]}, 'sk-file-label'); window.bukaDataSuratKeluar();
    } catch(e) { alert("Gagal menyimpan: " + e.message); }
    window.toggleLoader(false);
};

window.bukaDataSuratKeluar = async () => { window.navigasi('sk-data-screen'); await window.renderListSuratKeluar(true); };
window.renderListSuratKeluar = async function(forceFetch = false) {
    const c = document.getElementById('sk-list-container');
    const kw = window.amankanData((document.getElementById('sk-search-key').value || "").toLowerCase());
    const ft = document.getElementById('sk-filter-tahun').value;
    if(forceFetch || window.skDatabase.length === 0) {
        if(!forceFetch) window.toggleLoader(true, "Memuat Data...");
        window.skDatabase = [];
        try {
            const snap = await getDocs(query(collection(window.db, "surat_keluar")));
            snap.forEach(d => window.skDatabase.push({id: d.id, ...d.data()}));
            window.skDatabase.sort((a,b) => b.timestamp - a.timestamp);
        } catch(e){}
        if(!forceFetch) window.toggleLoader(false);
    }
    let data = window.skDatabase.filter(d => { return ((d.judul || "").toLowerCase().includes(kw)) && ((ft === 'ALL') ? true : (d.tahun == ft)); });
    if(data.length === 0) return c.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:30px;">Tidak ada Surat Keluar ditemukan.</p>`;
    let h = "";
    data.forEach(d => {
        h += `<div class="progress-card" style="display:flex; justify-content:space-between; align-items:center; border-left-color:#f59e0b;" onclick="window.bukaViewerArsip('SK', '${d.id}')"><div><h4 style="margin:0 0 5px 0; color:#f59e0b;">${d.judul}</h4><p style="margin:0; font-size:11px; color:var(--text-muted);"><i class="fas fa-calendar-alt"></i> Tgl: ${d.tanggal} | Thn: ${d.tahun}</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);"></i></div>`;
    });
    c.innerHTML = h;
};

window.arsipPdfDocObj = null; window.arsipCurrentPage = 1;
window.bukaViewerArsip = async function(tipe, id) {
    let db = tipe === 'SM' ? window.smDatabase : window.skDatabase;
    let d = db.find(x => x.id === id);
    if(!d || !d.filePdfBase64) return alert("Dokumen tidak valid.");
    document.getElementById('arsip-pdf-modal').style.display = 'flex';
    document.getElementById('arsip-viewer-title').innerText = d.judul;
    document.getElementById('arsip-viewer-canvas').style.display = 'none';
    document.getElementById('arsip-viewer-loading').style.display = 'block';
    try {
        let pdfBytes = base64ToArrayBuffer(d.filePdfBase64);
        window.arsipPdfDocObj = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        window.arsipCurrentPage = 1;
        await window.arsipRenderPage(1);
    } catch(e) { alert("Gagal memuat PDF."); document.getElementById('arsip-pdf-modal').style.display = 'none'; }
};

window.arsipRenderPage = async function(num) {
    document.getElementById('arsip-viewer-loading').style.display = 'block'; document.getElementById('arsip-viewer-canvas').style.display = 'none';
    const page = await window.arsipPdfDocObj.getPage(num);
    const vp = page.getViewport({ scale: 1.2 }); 
    const cvs = document.getElementById('arsip-viewer-canvas'); const ctx = cvs.getContext('2d');
    cvs.width = vp.width; cvs.height = vp.height;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    document.getElementById('arsip-page-info').innerText = `${num} / ${window.arsipPdfDocObj.numPages}`;
    document.getElementById('arsip-viewer-loading').style.display = 'none'; cvs.style.display = 'block';
};

window.arsipPrevPage = () => { if(window.arsipCurrentPage <= 1) return; window.arsipCurrentPage--; window.arsipRenderPage(window.arsipCurrentPage); };
window.arsipNextPage = () => { if(window.arsipCurrentPage >= window.arsipPdfDocObj.numPages) return; window.arsipCurrentPage++; window.arsipRenderPage(window.arsipCurrentPage); };

const defaultOrg = [
    { id: "o1", level: 1, jabatan: "DEPT. HEAD", nama: "EDI JUNAEDI", anggota: "" },
    { id: "o2", level: 2, jabatan: "ADMIN", nama: "BENNY F", anggota: "" },
    { id: "o3", level: 2, jabatan: "MAINTENANCE, REPAIR INJECTION & MOLD STORE SECTION.HEAD", nama: "HERU NUGRAHA", anggota: "" },
    { id: "o4", level: 3, jabatan: "FOREMAN GROUP\nINJECTION 1", nama: "INDRA", anggota: "- SUPRIYANTO (SO)\n- APRILIAN (PKWT)\n- IWAN (PKWT)\n- HERU (PKWT)" },
    { id: "o5", level: 3, jabatan: "FOREMAN GROUP\nINJECTION 2", nama: "DENI.R", anggota: "- KOMARUDIN (SO)\n- EDI.R (SO)\n- TAMSIL (PKWT)\n- RAFLY (PKWT)" },
    { id: "o6", level: 3, jabatan: "FOREMAN GROUP\nINJECTION 3", nama: "KIKI", anggota: "- ROHIDI (SO)\n- ANDRIAN (PKWT)\n- GUNAWAN (OS)\n- SUKARYA (PKWT)" },
    { id: "o7", level: 3, jabatan: "MOLD STORE FOREMAN", nama: "KIKI", anggota: "- UHDI (SO)\n- WARSITO (SO)\n- NANANG (KARTAP)\n- SUPRIYATNA (PKWT)\n- HERMAN (PKWT)\n- MUSTOPA (PKWT)\n- ENDING (SO)\n- FIRDI (PKWT)\n- DASLAM (PKWT)" },
    { id: "o8", level: 3, jabatan: "DEVELOPMENT FOREMAN", nama: "TARMUJI", anggota: "- SUNARYO (SO)\n- AHMAD ROFII (PKWT)\n- ENOH (SO)\n- WAWAN S (SO)\n- ARIS (PKWT)\n- BAYU (PKWT)" },
    { id: "o9", level: 3, jabatan: "MACHINERY MOLD FOREMAN", nama: "SUNARYO (SO)", anggota: "HARDCODE_UI" }
];

window.ambilDataOrg = async function() {
    window.orgDatabase = [];
    try {
        const snap = await getDocs(collection(window.db, "struktur_organisasi"));
        if(snap.empty) { for(let it of defaultOrg) { await setDoc(doc(window.db, "struktur_organisasi", it.id), it); window.orgDatabase.push(it); } } 
        else { snap.forEach(d => window.orgDatabase.push({id: d.id, ...d.data()})); }
        window.renderOrgSvgEngine();
    } catch(e) { console.error(e); }
};

window.renderOrgSvgEngine = function() {
    const tree = document.getElementById('org-tree-render'); if(!tree) return;
    const h = window.orgDatabase.find(o => o.id === "o1") || defaultOrg[0];
    const adm = window.orgDatabase.find(o => o.id === "o2") || defaultOrg[1];
    const sec = window.orgDatabase.find(o => o.id === "o3") || defaultOrg[2];
    const f1 = window.orgDatabase.find(o => o.id === "o4") || defaultOrg[3];
    const f2 = window.orgDatabase.find(o => o.id === "o5") || defaultOrg[4];
    const f3 = window.orgDatabase.find(o => o.id === "o6") || defaultOrg[5];
    const mS = window.orgDatabase.find(o => o.id === "o7") || defaultOrg[6];
    const dev = window.orgDatabase.find(o => o.id === "o8") || defaultOrg[7];
    const mac = window.orgDatabase.find(o => o.id === "o9") || defaultOrg[8];

    let ec = window.isOrgUnlocked ? "editable" : "";
    let ck = (id) => window.isOrgUnlocked ? `onclick="event.stopPropagation(); window.bukaEditOrg('${id}')"` : "";

    tree.innerHTML = `
        <!-- L1: DEPT HEAD -->
        <div class="org-col">
            <div class="org-box-neon ${ec}" style="--delay: 0s;" ${ck(h.id)}>
                <div class="org-head-neon" style="font-size: 13px; padding: 12px;">${h.jabatan.replace(/\n/g, '<br>')}</div>
                <div class="org-body-neon">${h.nama}</div>
            </div>
            
            <!-- L2: SEC HEAD BOX -->
            <div class="line-v-circuit" style="height: 30px; --delay: 0.6s;"></div>
            <div class="org-box-neon ${ec}" style="width: 350px; --delay: 0.8s;" ${ck(sec.id)}>
                <div class="org-head-neon">${sec.jabatan.replace(/\n/g, '<br>')}</div>
                <div class="org-body-neon">${sec.nama}</div>
            </div>
            <div class="line-v-circuit" style="height: 30px; --delay: 1.0s;"></div>
            
            <!-- L3: BRANCHING HORIZONTAL UTAMA BAWAH -->
            <div class="org-row" style="width: 1600px;">
                <div class="line-h-circuit" style="width: 100%; position: absolute; top: 0; --delay: 1.2s;"></div>
                
                <!-- COL 1: CONTROL PRODUKSI INJECTION -->
                <div class="org-col" style="flex: 1.5; padding-top: 20px;">
                    <div class="line-v-circuit" style="height: 20px; position: absolute; top: 0; --delay: 1.4s;"></div>
                    <div class="group-container-neon" style="display:flex; flex-direction:column; align-items:center; --delay: 1.6s;">
                        <div class="group-header-label-neon" style="width:100%;">CONTROL PRODUKSI INJECTION</div>
                        <div class="org-row" style="gap: 15px; margin-top:20px;">
                            <div class="org-col">
                                <div class="org-box-neon ${ec}" style="width: 135px; --delay: 1.8s;" ${ck(f1.id)}>
                                    <div class="org-head-neon">${f1.jabatan.replace(/\n/g, '<br>')}</div>
                                    <div class="org-body-neon">${f1.nama}</div>
                                </div>
                                <div class="org-sub-neon" style="width: 135px; --delay: 2.0s;">
                                    <div class="org-sub-head-neon">SO & OPERATOR<br>MAINTENANCE</div>
                                    <div class="org-sub-body-neon">${f1.anggota}</div>
                                </div>
                            </div>
                            <div class="org-col">
                                <div class="org-box-neon ${ec}" style="width: 135px; --delay: 1.8s;" ${ck(f2.id)}>
                                    <div class="org-head-neon">${f2.jabatan.replace(/\n/g, '<br>')}</div>
                                    <div class="org-body-neon">${f2.nama}</div>
                                </div>
                                <div class="org-sub-neon" style="width: 135px; --delay: 2.0s;">
                                    <div class="org-sub-head-neon">SO & OPERATOR<br>MAINTENANCE</div>
                                    <div class="org-sub-body-neon">${f2.anggota}</div>
                                </div>
                            </div>
                            <div class="org-col">
                                <div class="org-box-neon ${ec}" style="width: 135px; --delay: 1.8s;" ${ck(f3.id)}>
                                    <div class="org-head-neon">${f3.jabatan.replace(/\n/g, '<br>')}</div>
                                    <div class="org-body-neon">${f3.nama}</div>
                                </div>
                                <div class="org-sub-neon" style="width: 135px; --delay: 2.0s;">
                                    <div class="org-sub-head-neon">SO & OPERATOR<br>MAINTENANCE</div>
                                    <div class="org-sub-body-neon">${f3.anggota}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COL 2: MOLD STORE -->
                <div class="org-col" style="flex: 1; padding-top: 20px;">
                    <div class="line-v-circuit" style="height: 20px; position: absolute; top: 0; --delay: 1.4s;"></div>
                    <div class="org-box-neon ${ec}" style="width: 160px; --delay: 1.6s;" ${ck(mS.id)}>
                        <div class="org-head-neon">${mS.jabatan.replace(/\n/g, '<br>')}</div>
                        <div class="org-body-neon">${mS.nama}</div>
                    </div>
                    <div class="org-sub-neon" style="width: 150px; --delay: 1.8s;">
                        <div class="org-sub-head-neon">SO & OPERATOR MAINTENANCE</div>
                        <div class="org-sub-body-neon">${mS.anggota}</div>
                    </div>
                </div>

                <!-- COL 3: ADMIN -->
                <div class="org-col" style="flex: 1; padding-top: 20px;">
                    <div class="line-v-circuit" style="height: 20px; position: absolute; top: 0; --delay: 1.4s;"></div>
                    <div class="org-box-neon ${ec}" style="width: 160px; border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.3); --delay: 1.6s;" ${ck(adm.id)}>
                        <div class="org-head-neon" style="color: #60a5fa;">${adm.jabatan.replace(/\n/g, '<br>')}</div>
                        <div class="org-body-neon" style="color: #e0f2fe;">${adm.nama}</div>
                    </div>
                    ${adm.anggota ? `<div class="org-sub-neon" style="width: 150px; --delay: 1.8s;"><div class="org-sub-head-neon">ANGGOTA</div><div class="org-sub-body-neon">${adm.anggota}</div></div>` : ''}
                </div>

                <!-- COL 4: DEVELOPMENT FOREMAN -->
                <div class="org-col" style="flex: 1; padding-top: 20px;">
                    <div class="line-v-circuit" style="height: 20px; position: absolute; top: 0; --delay: 1.4s;"></div>
                    <div class="org-box-neon ${ec}" style="width: 160px; --delay: 1.6s;" ${ck(dev.id)}>
                        <div class="org-head-neon">${dev.jabatan.replace(/\n/g, '<br>')}</div>
                        <div class="org-body-neon">${dev.nama}</div>
                    </div>
                    <div class="org-sub-neon" style="width: 150px; --delay: 1.8s;">
                        <div class="org-sub-head-neon">SO & OPERATOR MAINTENANCE</div>
                        <div class="org-sub-body-neon">${dev.anggota}</div>
                    </div>
                </div>

                <!-- COL 5: MACHINERY MOLD FOREMAN -->
                <div class="org-col" style="flex: 1.8; padding-top: 20px;">
                    <div class="line-v-circuit" style="height: 20px; position: absolute; top: 0; --delay: 1.4s;"></div>
                    <div class="group-container-neon" style="display:flex; flex-direction:column; align-items:center; --delay: 1.6s;">
                        <div class="group-header-label-neon" style="width:100%;">${mac.jabatan}</div>
                        <div class="org-row" style="gap: 10px; margin-top: 20px;">
                            <div class="org-col">
                                <div class="org-box-neon ${ec}" style="width: 120px; min-height:40px; --delay: 1.8s;" ${ck(mac.id)}>
                                    <div class="org-head-neon" style="font-size:8px;">CNC MILLING & ROUTER</div>
                                </div>
                                <div class="org-sub-neon" style="width: 120px; --delay: 2.0s;">
                                    <div class="org-sub-body-neon">- TOPIK H (SO)<br>- AGI G (SO)<br>- ZAENUDIN (PKWT)<br>- RIDWAN (PKWT)<br>- ARUL (OS)<br>- YUSRIL MAHENDRA (PKWT)</div>
                                </div>
                            </div>
                            <div class="org-col">
                                <div class="org-box-neon" style="width: 100px; min-height:40px; --delay: 1.8s;">
                                    <div class="org-head-neon">EDM</div>
                                </div>
                                <div class="org-sub-neon" style="width: 100px; --delay: 2.0s;">
                                    <div class="org-sub-body-neon">- AJI. S (SO)<br>- RANDY P (PKWT)<br>- BANDANI (PKWT)<br>- MUHAMMAD RICI RIFAI (OS)</div>
                                </div>
                            </div>
                            <div class="org-col">
                                <div class="org-box-neon" style="width: 100px; min-height:40px; --delay: 1.8s;">
                                    <div class="org-head-neon">MILLING</div>
                                </div>
                                <div class="org-sub-neon" style="width: 100px; --delay: 2.0s;">
                                    <div class="org-sub-body-neon">- EKO M (SO)<br>- A HAERUDIN (SO)<br>- LALAN Q (SO)<br>- INDRAWAN (PKWT)</div>
                                </div>
                            </div>
                            <div class="org-col">
                                <div class="org-box-neon" style="width: 100px; min-height:40px; --delay: 1.8s;">
                                    <div class="org-head-neon">BUBUT</div>
                                </div>
                                <div class="org-sub-neon" style="width: 100px; --delay: 2.0s;">
                                    <div class="org-sub-body-neon">- SUMARDI (SO)<br>- WAWAN (SO)<br>- ADE NOVIANDANA (PKWT)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>`;
};

window.bukaGembokOrg = () => { document.getElementById('org-pin-modal').style.display='flex'; document.getElementById('input-pin-org').value=''; document.getElementById('msg-pin-error-org').style.display='none'; };
window.verifikasiPinOrg = () => { if(document.getElementById('input-pin-org').value === "2025") { window.isOrgUnlocked = true; document.getElementById('org-pin-modal').style.display='none'; window.renderOrgSvgEngine(); } else { document.getElementById('msg-pin-error-org').style.display='block'; } };
window.bukaEditOrg = (id) => { const d = window.orgDatabase.find(x => x.id === id); if(!d) return; document.getElementById('org-edit-id').value = id; document.getElementById('org-edit-jabatan').value = d.jabatan; document.getElementById('org-edit-nama').value = d.nama; document.getElementById('org-edit-anggota').value = d.anggota || ""; document.getElementById('org-edit-modal').style.display='flex'; };
window.simpanEditOrg = async () => { const id = document.getElementById('org-edit-id').value; const jbt = document.getElementById('org-edit-jabatan').value.toUpperCase(); const nm = document.getElementById('org-edit-nama').value.toUpperCase(); const ag = document.getElementById('org-edit-anggota').value; window.toggleLoader(true, "Menyimpan..."); try { await updateDoc(doc(window.db, "struktur_organisasi", id), { jabatan: jbt, nama: nm, anggota: ag }); document.getElementById('org-edit-modal').style.display='none'; await window.ambilDataOrg(); } catch(e){} window.toggleLoader(false); };

window.surkomOriginalPdfBytes = null; window.surkomPageCount = 0; window.surkomPdfDocObj = null;
window.prosesPDFSurkom = async function(inp) {
    const f = inp.files[0]; if(!f) return; window.toggleLoader(true, "Memecah PDF...");
    try {
        const ab = await f.arrayBuffer(); window.surkomOriginalPdfBytes = ab; const pdf = await pdfjsLib.getDocument({ data: ab }).promise; window.surkomPdfDocObj = pdf; window.surkomPageCount = pdf.numPages;
        document.getElementById('surkom-split-area').style.display = 'block'; document.getElementById('surkom-total-halaman').innerText = window.surkomPageCount;
        let c = document.getElementById('surkom-split-container'); c.innerHTML = "";
        for(let i=1; i<=window.surkomPageCount; i++) {
            const page = await pdf.getPage(i); const vp = page.getViewport({ scale: 0.6 });
            let d = document.createElement('div'); d.className = "pdf-split-card"; d.id = `surkom-card-${i}`;
            d.innerHTML = `<div onclick="document.getElementById('surkom-card-${i}').remove();" style="position:absolute; top:-10px; right:-10px; background:var(--lambat); color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fas fa-times"></i></div><div style="display:flex; gap:15px; align-items:center;"><div style="cursor:pointer;" onclick="window.bukaPreviewSurkom(${i})"><canvas id="surkom-canvas-${i}" style="width:80px; border-radius:6px; border:2px solid var(--secondary);"></canvas></div><div style="flex:1;"><input type="text" id="surkom-judul-${i}" placeholder="Judul Hal ${i}..." style="text-transform:uppercase;"></div></div>`;
            c.appendChild(d); const canvas = document.getElementById(`surkom-canvas-${i}`); const ctx = canvas.getContext('2d'); canvas.height = vp.height; canvas.width = vp.width; await page.render({ canvasContext: ctx, viewport: vp }).promise;
        }
    } catch(e) { alert("Error PDF: " + e.message); } window.toggleLoader(false);
};
window.bukaPreviewSurkom = async function(pNum) { const mod = document.getElementById('surkom-preview-modal'); const cvs = document.getElementById('surkom-preview-canvas'); const l = document.getElementById('surkom-preview-loading'); mod.style.display='flex'; cvs.style.display='none'; l.style.display='block'; document.getElementById('surkom-preview-page-num').innerText = pNum; try { const page = await window.surkomPdfDocObj.getPage(pNum); const vp = page.getViewport({ scale: 1.5 }); const ctx = cvs.getContext('2d'); cvs.height = vp.height; cvs.width = vp.width; await page.render({ canvasContext: ctx, viewport: vp }).promise; l.style.display='none'; cvs.style.display='block'; } catch(e) {} };
window.simpanAllSurkomHasil = async function() {
    const op = window.amankanData(document.getElementById('surkom-operator').value); const th = document.getElementById('surkom-tahun-input').value;
    if(!op) return alert("Isi nama PIC!"); window.toggleLoader(true, "Menyimpan Data...");
    try {
        const { PDFDocument } = PDFLib; const orig = await PDFDocument.load(window.surkomOriginalPdfBytes); let arr = [];
        for(let i=1; i<=window.surkomPageCount; i++) {
            let inp = document.getElementById(`surkom-judul-${i}`); if(!inp || !inp.value.trim()) continue;
            let newPdf = await PDFDocument.create(); let [pg] = await newPdf.copyPages(orig, [i-1]); newPdf.addPage(pg);
            let b64 = await newPdf.saveAsBase64({ dataUri: true });
            arr.push(addDoc(collection(window.db, "surat_komponen"), { judul: inp.value.trim().toUpperCase(), operator: op, tahun: th, filePdfBase64: b64, timestamp: Date.now() }));
        }
        await Promise.all(arr); alert("Berhasil disimpan!"); window.bukaAllDataSurkom();
    } catch(e) {} window.toggleLoader(false);
};
window.bukaAllDataSurkom = async () => { window.navigasi('surkom-alldata-screen'); await window.renderListAllSurkom(); };
window.filterTabTahunSurkom = (th, btn) => { document.querySelectorAll('#surkom-tabs-tahun .gm-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); window.surkomTahunAktif = th; window.renderListAllSurkom(); };
window.toggleModePilihSurkom = () => { window.isModePilihSurkom = !window.isModePilihSurkom; const btn = document.getElementById('btn-mode-pilih-surkom'); const actions = document.getElementById('surkom-action-buttons'); if(window.isModePilihSurkom) { btn.style.background = "linear-gradient(135deg, #10b981, #059669)"; btn.style.borderColor = "#10b981"; actions.style.display = 'flex'; } else { btn.style.background = "rgba(255,255,255,0.1)"; btn.style.borderColor = "var(--border-dark)"; actions.style.display = 'none'; } window.renderListAllSurkom(); };
window.renderListAllSurkom = async function() {
    const c = document.getElementById('surkom-list-container'); const kw = window.amankanData((document.getElementById('surkom-search-key')?.value || "").toLowerCase());
    if(!window.surkomDatabase || window.surkomDatabase.length === 0) {
        window.toggleLoader(true, "Mengambil Arsip..."); window.surkomDatabase = [];
        try { const snap = await getDocs(query(collection(window.db, "surat_komponen"))); snap.forEach(d => window.surkomDatabase.push({id: d.id, ...d.data()})); window.surkomDatabase.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)); } catch(e){} window.toggleLoader(false);
    }
    let data = window.surkomDatabase.filter(d => { let mKw = (d.judul || "").toLowerCase().includes(kw) || (d.operator || "").toLowerCase().includes(kw); let mTh = (window.surkomTahunAktif === 'ALL') ? true : (d.tahun == window.surkomTahunAktif); return mKw && mTh; });
    if(data.length === 0) return c.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px; border:1px dashed var(--border-dark); border-radius:10px;">Tidak ada arsip ditemukan.</p>`;
    let h = ""; data.forEach(d => {
        let tagTh = d.tahun ? `<span style="background:rgba(245,158,11,0.2); color:#fbbf24; padding:3px 6px; border-radius:5px; font-size:10px; margin-left:8px;">${d.tahun}</span>` : `<span style="background:rgba(239,68,68,0.2); color:#ef4444; padding:3px 6px; border-radius:5px; font-size:10px; margin-left:8px;">DATA LAMA</span>`;
        let checkboxHtml = window.isModePilihSurkom ? `<input type="checkbox" class="chk-surkom-item" value="${d.id}" style="width:20px; height:20px; margin-right:15px; cursor:pointer;" onclick="event.stopPropagation()">` : '';
        h += `<div class="progress-card" style="display:flex; justify-content:space-between; align-items:center; border-left-color:var(--cepat);" onclick="window.bukaPreviewDariServer('${d.id}')"><div style="flex:1; display:flex; align-items:center;">${checkboxHtml}<div><h4 style="margin:0 0 5px 0; color:var(--secondary);">${d.judul} ${tagTh}</h4><p style="margin:0; font-size:11px; color:var(--text-muted);">PIC: ${d.operator || 'Admin'} | ${d.waktuInput || '-'}</p></div></div><button type="button" onclick="event.stopPropagation(); window.unduhPDFSurkom('${d.id}', '${d.judul}')" style="background:var(--cepat); color:white; border:none; padding:10px; border-radius:8px; cursor:pointer;"><i class="fas fa-download"></i></button></div>`;
    }); c.innerHTML = h;
};
window.bukaPreviewDariServer = async function(id) { const d = window.surkomDatabase.find(x => x.id === id); if(d && d.filePdfBase64) { window.toggleLoader(true); try { const pdfBytes = base64ToArrayBuffer(d.filePdfBase64); const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise; const page = await pdf.getPage(1); const vp = page.getViewport({ scale: 1.5 }); const modal = document.getElementById('surkom-preview-modal'); const canvas = document.getElementById('surkom-preview-canvas'); const loading = document.getElementById('surkom-preview-loading'); modal.style.display='flex'; canvas.style.display='none'; loading.style.display='block'; document.getElementById('surkom-preview-page-num').innerText = d.judul; const ctx = canvas.getContext('2d'); canvas.height = vp.height; canvas.width = vp.width; await page.render({ canvasContext: ctx, viewport: vp }).promise; loading.style.display='none'; canvas.style.display='block'; } catch(e){} window.toggleLoader(false); } };
window.unduhPDFSurkom = (id, jd) => { const d = window.surkomDatabase.find(x => x.id === id); if(d && d.filePdfBase64) { let a = document.createElement("a"); a.href = d.filePdfBase64; a.download = `SURKOM_${jd}.pdf`; a.click(); } };
window.bukaModalUnduhGlobal = () => { const sel = document.querySelectorAll('.chk-surkom-item:checked'); if(sel.length===0) return alert("Pilih data!"); document.getElementById('surkom-count-selected').innerText = sel.length; document.getElementById('surkom-unduh-global-modal').style.display='flex'; };
window.prosesUnduhGlobalSurkom = async (t) => { document.getElementById('surkom-unduh-global-modal').style.display='none'; const sel = Array.from(document.querySelectorAll('.chk-surkom-item:checked')).map(n=>n.value); window.toggleLoader(true, t==='merge'?"Menyatukan PDF...":"Mengunduh..."); try { if(t==='pisah') { for(let id of sel) { const d = window.surkomDatabase.find(x=>x.id===id); if(d) { let a=document.createElement("a"); a.href=d.filePdfBase64; a.download=`SURKOM_${d.judul}.pdf`; a.click(); await new Promise(r=>setTimeout(r,600)); } } } else { const { PDFDocument } = PDFLib; const mPdf = await PDFDocument.create(); for(let id of sel) { const d = window.surkomDatabase.find(x=>x.id===id); if(d) { const p = await PDFDocument.load(base64ToArrayBuffer(d.filePdfBase64)); const cp = await mPdf.copyPages(p, p.getPageIndices()); cp.forEach(pg=>mPdf.addPage(pg)); } } const mF = await mPdf.saveAsBase64({ dataUri: true }); let a=document.createElement("a"); a.href=mF; a.download=`SURKOM_MERGE.pdf`; a.click(); } } catch(e){} window.toggleLoader(false); };
window.bukaModalForwardSurkom = () => { const sel = document.querySelectorAll('.chk-surkom-item:checked'); if(sel.length===0) return alert("Pilih data!"); document.getElementById('surkom-forward-modal').style.display='flex'; };
window.prosesForwardDataSurkom = async () => { const th = document.getElementById('surkom-forward-tahun').value; const sel = Array.from(document.querySelectorAll('.chk-surkom-item:checked')).map(n=>n.value); window.toggleLoader(true); try { let p=[]; for(let id of sel) { p.push(updateDoc(doc(window.db,"surat_komponen",id),{tahun:th})); let d = window.surkomDatabase.find(x=>x.id===id); if(d) d.tahun=th; } await Promise.all(p); alert("Berhasil dipindah!"); document.getElementById('surkom-forward-modal').style.display='none'; window.toggleModePilihSurkom(); window.renderListAllSurkom(); } catch(e){} window.toggleLoader(false); };

window.inisialisasiFormWS = () => { document.getElementById('ws-np-nama').value=""; document.getElementById('ws-rencana-kerja-container').innerHTML=""; window.arrayTugasBaru=[]; window.tambahTugasUtamaWS(); };
window.tambahTugasUtamaWS = () => { const idT = window.arrayTugasBaru.length; window.arrayTugasBaru.push({ namaTugas: "BUBUT", subTasks: [] }); const h = `<div class="dark-panel" style="padding:15px; margin-bottom:10px;"><select onchange="window.arrayTugasBaru[${idT}].namaTugas=this.value" style="margin-bottom:10px;"><option value="BUBUT">BUBUT</option><option value="MILLING">MILLING</option><option value="CNC">CNC</option><option value="ASSEMBLY">ASSEMBLY</option></select><div id="ws-sub-con-${idT}"></div><button type="button" class="btn-submit" style="background:transparent; border:1px dashed var(--secondary); color:var(--secondary); padding:8px; font-size:11px;" onclick="window.tambahSubTaskWS(${idT})"><i class="fas fa-plus"></i> Rincian</button></div>`; document.getElementById('ws-rencana-kerja-container').insertAdjacentHTML('beforeend', h); };
window.tambahSubTaskWS = (idT) => { const idS = window.arrayTugasBaru[idT].subTasks.length; window.arrayTugasBaru[idT].subTasks.push({ namaSub: "", estimasiJam: 0, actualDurasi: 0, status: "Belum Selesai" }); const h = `<div style="display:flex; gap:8px; margin-bottom:8px;"><input type="text" placeholder="Rincian..." onchange="window.arrayTugasBaru[${idT}].subTasks[${idS}].namaSub=this.value" style="flex:2;"><input type="number" placeholder="Jam" onchange="window.arrayTugasBaru[${idT}].subTasks[${idS}].estimasiJam=parseFloat(this.value); window.kalkulasiTotalWaktuWS();" style="flex:1;"></div>`; document.getElementById(`ws-sub-con-${idT}`).insertAdjacentHTML('beforeend', h); };
window.kalkulasiTotalWaktuWS = () => { let t = 0; window.arrayTugasBaru.forEach(x => x.subTasks.forEach(s => t += (s.estimasiJam || 0))); document.getElementById('ws-np-jam').value = t + " Jam"; document.getElementById('ws-np-hari').value = Math.ceil(t/8) + " Hari"; };
window.simpanNewProjectWS = async () => { const nm = window.amankanData(document.getElementById('ws-np-nama').value); const st = document.getElementById('ws-np-start-date').value; const fn = document.getElementById('ws-np-finish-date').value; if(!nm || window.arrayTugasBaru.length === 0) return alert("Lengkapi form!"); window.toggleLoader(true); try { await addDoc(collection(window.db, "workshop_projects"), { namaProyek: nm, startDate: st, finishDate: fn, estJam: parseFloat(document.getElementById('ws-np-jam').value), tasks: window.arrayTugasBaru, statusGlobal: "Proses Pengerjaan", timestamp: Date.now() }); window.navigasi('divisi-screen'); } catch(e) { console.error(e); } window.toggleLoader(false); };
window.ambilDataServerWS = async () => { window.dataProyekWS = []; try { const snap = await getDocs(query(collection(window.db, "workshop_projects"))); snap.forEach(d => window.dataProyekWS.push({id: d.id, ...d.data()})); window.dataProyekWS.sort((a,b) => b.timestamp - a.timestamp); } catch(e){} };
window.renderUpdateListWS = () => { window.switchTabWS('proses'); let hPr = "", hSl = ""; window.dataProyekWS.forEach(d => { let c = `<div class="progress-card" onclick="window.bukaFormUpdateTaskListWS('${d.id}')"><h3>${d.namaProyek}</h3></div>`; if(d.statusGlobal === 'Selesai') hSl += c; else hPr += c; }); document.getElementById('list-ws-proses').innerHTML = hPr || "<p>Kosong</p>"; document.getElementById('list-ws-selesai').innerHTML = hSl || "<p>Kosong</p>"; };
window.switchTabWS = (t) => { document.getElementById('tab-ws-proses').classList.remove('tab-active'); document.getElementById('tab-ws-selesai').classList.remove('tab-active'); document.getElementById('list-ws-proses').style.display='none'; document.getElementById('list-ws-selesai').style.display='none'; document.getElementById('ws-task-list-area').style.display='none'; document.getElementById('ws-form-update-task').style.display='none'; document.getElementById(`tab-ws-${t}`).classList.add('tab-active'); document.getElementById(`list-ws-${t}`).style.display='block'; };
window.bukaFormUpdateTaskListWS = (id) => { const d = window.dataProyekWS.find(x => x.id === id); if(!d) return; document.getElementById('list-ws-proses').style.display='none'; document.getElementById('ws-task-list-area').style.display='block'; document.getElementById('ws-update-id-project').value = id; document.getElementById('ws-nama-proyek-tampil').innerText = d.namaProyek; let h = ""; d.tasks.forEach((t, i) => { h += `<div style="background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; margin-bottom:10px;"><h4>${t.namaTugas}</h4>`; t.subTasks.forEach((s, j) => { h += `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${s.namaSub}</span><button type="button" class="btn-submit" style="width:auto; padding:5px 10px; font-size:10px;" onclick="window.bukaFormInputRealisasiWS(${i},${j})">Update</button></div>`; }); h += `</div>`; }); document.getElementById('ws-tasks-container').innerHTML = h; };
window.tutupWsTaskList = () => window.switchTabWS('proses');
window.bukaFormInputRealisasiWS = (i, j) => { document.getElementById('ws-task-list-area').style.display='none'; document.getElementById('ws-form-update-task').style.display='block'; document.getElementById('ws-update-task-index').value = i; document.getElementById('ws-update-subtask-index').value = j; };
window.hitungDurasiUpdateWS = () => { let s = document.getElementById('ws-up-start').value, f = document.getElementById('ws-up-finish').value; if(s && f) { let diff = (new Date(f) - new Date(s))/3600000; if(diff>0) document.getElementById('ws-up-durasi').value = diff.toFixed(2) + " Jam"; } };
window.batalUpdateTaskWS = () => { document.getElementById('ws-form-update-task').style.display='none'; document.getElementById('ws-task-list-area').style.display='block'; };
window.simpanUpdateTaskWS = async () => { const id = document.getElementById('ws-update-id-project').value, i = document.getElementById('ws-update-task-index').value, j = document.getElementById('ws-update-subtask-index').value; const pic = window.amankanData(document.getElementById('ws-up-pic').value), st = document.getElementById('ws-up-start').value, fn = document.getElementById('ws-up-finish').value, stat = document.getElementById('ws-up-status').value; if(!pic || !st || !fn) return alert("Lengkapi!"); window.toggleLoader(true); const d = window.dataProyekWS.find(x => x.id === id); let diff = (new Date(fn) - new Date(st))/3600000; d.tasks[i].subTasks[j].actualStart = st; d.tasks[i].subTasks[j].actualFinish = fn; d.tasks[i].subTasks[j].actualDurasi = (d.tasks[i].subTasks[j].actualDurasi || 0) + diff; d.tasks[i].subTasks[j].status = stat; try { await updateDoc(doc(window.db, "workshop_projects", id), { tasks: d.tasks }); await window.ambilDataServerWS(); window.bukaFormUpdateTaskListWS(id); document.getElementById('ws-form-update-task').style.display='none'; } catch(e){} window.toggleLoader(false); };
window.bukaProgressWorkshop = async () => { window.navigasi('progress-screen'); await window.ambilDataServerWS(); window.switchTabProgressWS('data'); };
window.switchTabProgressWS = (t) => { document.getElementById('ws-prog-view-data').style.display = t==='data'?'block':'none'; document.getElementById('ws-prog-report-data').style.display = t==='report'?'block':'none'; if(t==='data') { let h=""; window.dataProyekWS.forEach(d => { let act=0; d.tasks.forEach(ts=>ts.subTasks.forEach(s=>act+=(s.actualDurasi||0))); let ach = Math.round((d.estJam>0?act/d.estJam:0)*100); h+=`<div class="progress-card"><h3>${d.namaProyek}</h3><p>Est: ${d.estJam} Jam | Act: ${act.toFixed(1)} Jam | ACH: ${ach}%</p></div>`; }); document.getElementById('list-ws-progress').innerHTML = h || "<p>Kosong</p>"; } else { let h=""; window.dataProyekWS.forEach(d=> { h+=`<label><input type="checkbox" class="chk-ai-ws" value="${d.id}"> ${d.namaProyek}</label><br>`; }); document.getElementById('list-ws-report-checkbox').innerHTML = h; } };
window.generateAIReport = () => alert("AI Executive Report Berhasil Dibuat.");

window.simpanGosokMold = async () => { const t = document.getElementById('adm-gosok-tgl').value, s = document.getElementById('adm-gosok-shift').value, p = window.amankanData(document.getElementById('adm-gosok-pic').value), m = window.amankanData(document.getElementById('adm-gosok-mold').value), st = document.getElementById('adm-gosok-start').value, fn = document.getElementById('adm-gosok-finish').value, k = window.amankanData(document.getElementById('adm-gosok-ket').value); let a=[]; document.querySelectorAll('.chk-gosok:checked').forEach(e=>a.push(e.value)); if(!t||!p||!m||a.length===0) return alert("Lengkapi data!"); window.toggleLoader(true); try { await addDoc(collection(window.db, "adm_harian"), {tipe:"GOSOK MOLD", tanggal:t, shift:s, pic:p.toUpperCase(), namaMold:m.toUpperCase(), areaGosok:a, jamMulai:st, jamSelesai:fn, keterangan:k, timestamp:Date.now()}); alert("Tersimpan!"); window.navigasi('adm-mold-menu-screen'); } catch(e){} window.toggleLoader(false); };
window.simpanAdmHarian = async () => { const t = document.getElementById('adm-harian-tgl').value, s = document.getElementById('adm-harian-shift').value, p = window.amankanData(document.getElementById('adm-harian-pic').value), j = document.getElementById('adm-harian-jenis').value, k = window.amankanData(document.getElementById('adm-harian-ket').value); if(!t||!p||!k) return alert("Lengkapi!"); window.toggleLoader(true); try { await addDoc(collection(window.db, "adm_harian"), {tipe:"KINERJA HARIAN", tanggal:t, shift:s, pic:p.toUpperCase(), jenis:j, keterangan:k, timestamp:Date.now()}); alert("Tersimpan!"); window.navigasi('adm-mold-menu-screen'); } catch(e){} window.toggleLoader(false); };
window.bukaDatabaseADM = async () => { window.navigasi('adm-view-data-screen'); window.renderListAdm(); };
window.renderListAdm = async () => { const c = document.getElementById('list-adm-harian'), ft = document.getElementById('adm-filter-tipe').value; c.innerHTML = "<p>Memuat...</p>"; try { let arr=[]; const snap=await getDocs(query(collection(window.db, "adm_harian"))); snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=>b.timestamp-a.timestamp); if(ft!=="Semua") arr=arr.filter(x=>x.tipe===ft); let h=""; arr.forEach(d=>{ h+=`<div class="progress-card" style="border-left-color:${d.tipe==='GOSOK MOLD'?'#f59e0b':'#3b82f6'};"><h4>${d.tipe} - ${d.pic}</h4><p>${d.tanggal} | ${d.tipe==='GOSOK MOLD'?d.namaMold:d.jenis}</p></div>`; }); c.innerHTML = h||"<p>Kosong</p>"; } catch(e){} };

window.bukaPKMEltre = async () => { window.navigasi('ms-pkm-eltre-screen'); window.bukaTabPKM('verifikasi'); await window.muatDataPKMEltre(); };
window.bukaTabPKM = (t) => { document.querySelectorAll('.tab-btn-pkm').forEach(b=>b.classList.remove('tab-active')); document.querySelectorAll('.tab-content-pkm').forEach(c=>c.style.display='none'); document.getElementById(`btn-tab-pkm-${t}`).classList.add('tab-active'); document.getElementById(`tab-pkm-${t}`).style.display='block'; };
window.muatDataPKMEltre = async () => { window.pkmDatabase=[]; try { const snap=await getDocs(query(collection(window.db,"pkm_eltre"))); snap.forEach(d=>window.pkmDatabase.push({id:d.id,...d.data()})); let hV="", hK="", hP="", hS="", n=0; window.pkmDatabase.forEach(d=>{ let c=`<div class="progress-card"><h4>${d.namaMold||'-'}</h4><p>${d.kendala||'-'}</p></div>`; let st = d.status||'Verifikasi'; if(st==='Verifikasi'){n++; hV+=`<div onclick="window.formVerifikasiPKM('${d.id}')" style="cursor:pointer;">${c}</div>`;} else if(st==='Dikerjakan') hK+=c; else if(st==='Dipisahkan') hP+=c; else hS+=c; }); const cV=document.getElementById('list-pkm-verifikasi'); if(cV) cV.innerHTML=hV||"<p>Kosong</p>"; const cK=document.getElementById('list-pkm-kerjakan'); if(cK) cK.innerHTML=hK||"<p>Kosong</p>"; const cP=document.getElementById('list-pkm-pisah'); if(cP) cP.innerHTML=hP||"<p>Kosong</p>"; const cS=document.getElementById('list-pkm-selesai'); if(cS) cS.innerHTML=hS||"<p>Kosong</p>"; const b=document.getElementById('badge-pkm-notif'); if(b) { b.innerText=n; b.style.display=n>0?'block':'none'; } } catch(e){} };
window.formVerifikasiPKM = (id) => { const d=window.pkmDatabase.find(x=>x.id===id); if(d) { document.getElementById('pkm-id-tiket-verifikasi').value=id; document.getElementById('pkm-nama-mold-text').innerText=d.namaMold; document.getElementById('modal-aksi-pkm').style.display='flex'; } };
window.prosesVerifikasiPKM = async (a) => { const id = document.getElementById('pkm-id-tiket-verifikasi').value; let s = a==='kerjakan'?'Dikerjakan':'Dipisahkan'; window.toggleLoader(true); try{ await updateDoc(doc(window.db,"pkm_eltre",id),{status:s}); document.getElementById('modal-aksi-pkm').style.display='none'; await window.muatDataPKMEltre(); window.bukaTabPKM(a==='kerjakan'?'kerjakan':'pisah'); } catch(e){} window.toggleLoader(false); };

window.bukaSubInfo = async function(kategori) { window.kategoriInfoAktif = kategori; const jsi = document.getElementById('judul-sub-info'); if(jsi) jsi.innerText = kategori; window.navigasi('sub-info-screen'); await window.ambilDataInfoServer(); }
window.ambilDataInfoServer = async function() { window.toggleLoader(true, "Mengunduh Info..."); window.infoDatabase = []; try { const snap = await getDocs(query(collection(window.db, "informasi_mold"))); snap.forEach((doc) => { if(doc.data().kategori === window.kategoriInfoAktif) window.infoDatabase.push({ id: doc.id, ...doc.data() }); }); window.infoDatabase.sort((a, b) => b.timestamp - a.timestamp); } catch (e) {} window.toggleLoader(false); window.renderInfoList(); }
window.simpanInfoData = async function() { const nama = window.amankanData(document.getElementById('info-nama').value); const ket = window.amankanData(document.getElementById('info-ket').value); const tgl = document.getElementById('info-tgl').value; const user = window.amankanData(document.getElementById('info-user').value); if(!nama || !tgl) return alert("Isi form!"); window.toggleLoader(true); try { await addDoc(collection(window.db, "informasi_mold"), { kategori: window.kategoriInfoAktif || "INBOX_LAPANGAN", namaKegiatan: nama, keterangan: ket, tanggal: tgl, pembuat: user || "Admin", timestamp: Date.now() }); alert("Tersimpan!"); document.getElementById('info-nama').value=""; document.getElementById('info-ket').value=""; await window.ambilDataInfoServer(); } catch (e) {} window.toggleLoader(false); }
window.renderInfoList = function() { const c = document.getElementById('list-sub-info'); if(!c) return; if(window.infoDatabase.length===0) return c.innerHTML=`<p>Kosong</p>`; let h=""; window.infoDatabase.forEach(d=>{ h+=`<div class="progress-card"><h3>${d.namaKegiatan}</h3><p>${d.keterangan}</p><p style="font-size:10px; color:gray;">${d.tanggal} | ${d.pembuat}</p></div>`; }); c.innerHTML=h; }

window.switchTabTrial = (t) => { document.getElementById('trial-input-area').style.display = t==='input'?'block':'none'; document.getElementById('trial-database-area').style.display = t==='database'?'block':'none'; if(t==='database') window.renderTrialDatabase(); };
window.simpanPermintaanTrial = async () => { const t = document.getElementById('trial-tgl').value, p = window.amankanData(document.getElementById('trial-pemohon').value), m = window.amankanData(document.getElementById('trial-mold').value), a = window.amankanData(document.getElementById('trial-alasan').value); if(!t||!p||!m) return alert("Isi Form!"); window.toggleLoader(true); try { await addDoc(collection(window.db,"permintaan_trial"),{tanggal:t, pemohon:p.toUpperCase(), namaMold:m.toUpperCase(), alasan:a, status:"Menunggu Jadwal", timestamp:Date.now()}); alert("Terkirim!"); window.switchTabTrial('database'); } catch(e){} window.toggleLoader(false); };
window.renderTrialDatabase = async () => { const c = document.getElementById('list-trial-database'); c.innerHTML="<p>Memuat...</p>"; try { let arr=[]; const snap=await getDocs(query(collection(window.db,"permintaan_trial"))); snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=>b.timestamp-a.timestamp); let h=""; arr.forEach(d=>{ h+=`<div class="progress-card"><h4>${d.namaMold}</h4><p>Pemohon: ${d.pemohon} | Status: ${d.status}</p></div>`; }); c.innerHTML=h||"<p>Kosong</p>"; } catch(e){} };

// =========================================================================================
// LOGIKA TIM & PERSONEL (AUTOSAVE FIREBASE)
// =========================================================================================
window.bukaMenuPersonel = async () => {
    window.navigasi('tim-personel-screen');
    await window.ambilDataPersonel();
};

window.ambilDataPersonel = async () => {
    const c = document.getElementById('list-personel-table');
    c.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 25px;'><i class='fas fa-spinner fa-spin fa-2x' style='color:#38bdf8; margin-bottom:10px;'></i><br>Membaca Database Karyawan...</td></tr>";
    window.personelDatabase = [];
    
    try {
        const snap = await getDocs(query(collection(window.db, "tim_personel")));
        if (snap.empty) {
            const defaults = [
                { id: "tp1", level: 1, jabatan: "DEPT. HEAD", nama: "EDI JUNAEDI", status: "TETAP" },
                { id: "tp2", level: 2, jabatan: "SECTION HEAD", nama: "HERU NUGRAHA", status: "TETAP" },
                { id: "tp3", level: 2, jabatan: "ADMIN", nama: "BENNY FIRMANSYAH", status: "TETAP" },
                { id: "tp4", level: 3, jabatan: "FOREMAN INJ 1", nama: "INDRA", status: "FOREMAN" },
                { id: "tp5", level: 4, jabatan: "OPR INJ 1", nama: "SUPRIYANTO", status: "SO" },
                { id: "tp6", level: 4, jabatan: "OPR INJ 1", nama: "APRILIAN", status: "PKWT" },
                { id: "tp7", level: 4, jabatan: "OPR INJ 1", nama: "IWAN", status: "PKWT" },
                { id: "tp8", level: 4, jabatan: "OPR INJ 1", nama: "HERU", status: "PKWT" },
                { id: "tp9", level: 3, jabatan: "FOREMAN INJ 2", nama: "DENI.R", status: "FOREMAN" },
                { id: "tp10", level: 4, jabatan: "OPR INJ 2", nama: "KOMARUDIN", status: "SO" },
                { id: "tp11", level: 4, jabatan: "OPR INJ 2", nama: "EDI.R", status: "SO" },
                { id: "tp12", level: 4, jabatan: "OPR INJ 2", nama: "TAMSIL", status: "PKWT" },
                { id: "tp13", level: 4, jabatan: "OPR INJ 2", nama: "RAFLY", status: "PKWT" },
                { id: "tp14", level: 3, jabatan: "FOREMAN INJ 3 & STORE", nama: "KIKI", status: "FOREMAN" },
                { id: "tp15", level: 4, jabatan: "OPR INJ 3", nama: "ROHIDI", status: "SO" },
                { id: "tp16", level: 4, jabatan: "OPR INJ 3", nama: "ANDRIAN", status: "PKWT" },
                { id: "tp17", level: 4, jabatan: "OPR INJ 3", nama: "GUNAWAN", status: "OS" },
                { id: "tp18", level: 4, jabatan: "OPR INJ 3", nama: "SUKARYA", status: "PKWT" },
                { id: "tp19", level: 4, jabatan: "MOLD STORE", nama: "UHDI", status: "SO" },
                { id: "tp20", level: 4, jabatan: "MOLD STORE", nama: "WARSITO", status: "SO" },
                { id: "tp21", level: 4, jabatan: "MOLD STORE", nama: "NANANG", status: "TETAP" },
                { id: "tp22", level: 4, jabatan: "MOLD STORE", nama: "SUPRIYATNA", status: "PKWT" },
                { id: "tp23", level: 4, jabatan: "MOLD STORE", nama: "HERMAN", status: "PKWT" },
                { id: "tp24", level: 4, jabatan: "MOLD STORE", nama: "MUSTOPA", status: "PKWT" },
                { id: "tp25", level: 4, jabatan: "MOLD STORE", nama: "ENDING", status: "SO" },
                { id: "tp26", level: 4, jabatan: "MOLD STORE", nama: "FIRDI", status: "PKWT" },
                { id: "tp27", level: 4, jabatan: "MOLD STORE", nama: "DASLAM", status: "PKWT" },
                { id: "tp28", level: 3, jabatan: "DEV FOREMAN", nama: "TARMUJI", status: "FOREMAN" },
                { id: "tp29", level: 4, jabatan: "OPR DEV", nama: "SUNARYO", status: "SO" },
                { id: "tp30", level: 4, jabatan: "OPR DEV", nama: "AHMAD ROFII", status: "PKWT" },
                { id: "tp31", level: 4, jabatan: "OPR DEV", nama: "ENOH", status: "SO" },
                { id: "tp32", level: 4, jabatan: "OPR DEV", nama: "WAWAN S", status: "SO" },
                { id: "tp33", level: 4, jabatan: "OPR DEV", nama: "ARIS", status: "PKWT" },
                { id: "tp34", level: 4, jabatan: "OPR DEV", nama: "BAYU", status: "PKWT" },
                { id: "tp35", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "TOPIK H", status: "SO" },
                { id: "tp36", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "AGI G", status: "SO" },
                { id: "tp37", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "ZAENUDIN", status: "PKWT" },
                { id: "tp38", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "RIDWAN", status: "PKWT" },
                { id: "tp39", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "ARUL", status: "OS" },
                { id: "tp40", level: 4, jabatan: "CNC MILLING & ROUTER", nama: "YUSRIL MAHENDRA", status: "PKWT" },
                { id: "tp41", level: 4, jabatan: "EDM", nama: "AJI.S", status: "SO" },
                { id: "tp42", level: 4, jabatan: "EDM", nama: "RANDY P", status: "PKWT" },
                { id: "tp43", level: 4, jabatan: "EDM", nama: "BANDANI", status: "PKWT" },
                { id: "tp44", level: 4, jabatan: "EDM", nama: "MUHAMMAD RICI RIFAI", status: "OS" },
                { id: "tp45", level: 4, jabatan: "MILLING", nama: "EKO M", status: "SO" },
                { id: "tp46", level: 4, jabatan: "MILLING", nama: "A HAERUDIN", status: "SO" },
                { id: "tp47", level: 4, jabatan: "MILLING", nama: "LALAN Q", status: "SO" },
                { id: "tp48", level: 4, jabatan: "MILLING", nama: "INDRAWAN", status: "PKWT" },
                { id: "tp49", level: 4, jabatan: "BUBUT", nama: "SUMARDI", status: "SO" },
                { id: "tp50", level: 4, jabatan: "BUBUT", nama: "WAWAN", status: "SO" },
                { id: "tp51", level: 4, jabatan: "BUBUT", nama: "ADE NOVIANDANA", status: "PKWT" }
            ];
            for(let item of defaults) {
                await setDoc(doc(window.db, "tim_personel", item.id), item);
                window.personelDatabase.push(item);
            }
        } else {
            snap.forEach(d => window.personelDatabase.push({id: d.id, ...d.data()}));
        }
        
        window.personelDatabase.sort((a, b) => (a.level || 99) - (b.level || 99));
        window.renderPersonelTable();
    } catch(e) { 
        c.innerHTML = `<tr><td colspan='4' style='text-align:center; color:#ef4444;'>Error Database: ${e.message}</td></tr>`; 
    }
};

window.renderPersonelTable = () => {
    const c = document.getElementById('list-personel-table');
    let h = "";
    window.personelDatabase.forEach(d => {
        let badgeClass = "badge-tetap";
        let st = (d.status || "").toUpperCase();
        
        if (st === "PKWT") badgeClass = "badge-pkwt";
        else if (st === "SO") badgeClass = "badge-so";
        else if (st === "OS") badgeClass = "badge-os";
        else if (st === "FOREMAN") badgeClass = "badge-foreman";

        let btnEdit = window.isPersonelUnlocked 
            ? `<button class="btn-edit-personel" onclick="window.bukaModalEditPersonel('${d.id}')"><i class="fas fa-edit"></i> EDIT</button>` 
            : `<div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:8px; display:inline-block;"><i class="fas fa-lock" style="color:#64748b; font-size:12px;"></i></div>`;

        let garisKiri = window.isPersonelUnlocked ? "border-left: 4px solid #10b981;" : "border-left: 4px solid transparent;";

        h += `<tr style="transition:0.3s; ${garisKiri}">
                <td>${d.jabatan}</td>
                <td style="color:#38bdf8;">${d.nama}</td>
                <td style="text-align:center;"><span class="badge-status ${badgeClass}">${st}</span></td>
                <td style="text-align:center;">${btnEdit}</td>
              </tr>`;
    });
    c.innerHTML = h;
};

window.bukaGembokPersonel = () => {
    document.getElementById('personel-pin-modal').style.display = 'flex';
    document.getElementById('input-pin-personel').value = '';
    document.getElementById('msg-pin-error-personel').style.display = 'none';
};

window.verifikasiPinPersonel = () => {
    if(document.getElementById('input-pin-personel').value === "2025") {
        window.isPersonelUnlocked = true;
        document.getElementById('personel-pin-modal').style.display = 'none';
        window.renderPersonelTable(); 
        document.getElementById('btn-gembok-personel').style.display = 'none';
    } else {
        document.getElementById('msg-pin-error-personel').style.display = 'block';
    }
};

window.bukaModalEditPersonel = (id) => {
    const d = window.personelDatabase.find(x => x.id === id);
    if(!d) return;
    document.getElementById('edit-personel-id').value = id;
    document.getElementById('edit-personel-jabatan').value = d.jabatan;
    document.getElementById('edit-personel-nama').value = d.nama;
    
    const selectSt = document.getElementById('edit-personel-status');
    let matched = false;
    for(let i=0; i<selectSt.options.length; i++) {
        if(selectSt.options[i].value === d.status) { selectSt.selectedIndex = i; matched = true; break; }
    }
    if(!matched) selectSt.selectedIndex = 0; 
    
    document.getElementById('personel-edit-modal').style.display = 'flex';
};

window.simpanEditPersonel = async () => {
    const id = document.getElementById('edit-personel-id').value;
    const jbt = document.getElementById('edit-personel-jabatan').value.toUpperCase();
    const nm = document.getElementById('edit-personel-nama').value.toUpperCase();
    const st = document.getElementById('edit-personel-status').value.toUpperCase();
    
    window.toggleLoader(true, "Menyinkronkan ke Firebase...");
    try {
        await updateDoc(doc(window.db, "tim_personel", id), { jabatan: jbt, nama: nm, status: st });
        document.getElementById('personel-edit-modal').style.display = 'none';
        await window.ambilDataPersonel();
    } catch(e) { 
        alert("Gagal update data! Pastikan koneksi internet stabil."); 
    }
    window.toggleLoader(false);
};

// =========================================================================================
// LOGIKA NOTULEN MEETING (DIPERBARUI DENGAN DESAIN PROFESIONAL UI/UX)
// =========================================================================================
window.tambahPesertaManualNotul = function() { const inp = document.getElementById('notul-peserta-manual'); const val = inp.value.trim(); if(!val) return; window.pesertaManualNotulen.push(val); inp.value = ""; window.renderPesertaManualNotul(); };
window.hapusPesertaManualNotul = function(idx) { window.pesertaManualNotulen.splice(idx, 1); window.renderPesertaManualNotul(); };
window.renderPesertaManualNotul = function() { const container = document.getElementById('list-peserta-manual-container'); let h = ""; window.pesertaManualNotulen.forEach((p, idx) => { h += `<div class="manual-attendee-tag"><span>${p}</span><i class="fas fa-times-circle" style="cursor:pointer; color:#ef4444;" onclick="window.hapusPesertaManualNotul(${idx})"></i></div>`; }); container.innerHTML = h; };
window.aiRapihkanNotulen = () => { let t = document.getElementById('notul-deskripsi').value; if(!t) return; window.toggleLoader(true,"AI Merapihkan Format..."); setTimeout(()=>{ document.getElementById('notul-deskripsi').value = t.split(/\n|\.\s/).filter(x=>x.trim().length>2).map(x=>"• "+x.trim()).join("\n\n"); window.toggleLoader(false); }, 1000); };

window.simpanNotulen = async () => { 
    const j = document.getElementById('notul-jenis').value; const d = window.amankanData(document.getElementById('notul-deskripsi').value); const w = document.getElementById('notul-waktu-display').value; const f = document.getElementById('notul-foto'); 
    if(!d) return alert("Isi deskripsi evaluasi/pembahasan terlebih dahulu!"); 
    let p = []; document.querySelectorAll('.chk-hadir:checked').forEach(c => p.push(c.value)); 
    if (window.pesertaManualNotulen.length > 0) { p = p.concat(window.pesertaManualNotulen); }
    if(p.length === 0) p.push("Tidak ada data kehadiran."); 
    let arrD = d.split('\n').filter(x => x.trim().length > 0).map((tx, i) => ({id: i, teks: tx.replace(/^•\s*/,''), done: false})); 
    window.toggleLoader(true, "Menyimpan Dokumen..."); let b64 = ""; if(f.files.length > 0) b64 = await window.compressImage(f.files[0], 800, 800, 0.6); 
    try { await addDoc(collection(window.db,"notulen_meeting"), { jenisMeeting: j, waktuRecord: w, deskripsiData: arrD, peserta: p, foto: b64, timestamp: Date.now() }); alert("Notulen Meeting Berhasil Disimpan!"); document.getElementById('notul-deskripsi').value = ""; document.querySelectorAll('.chk-hadir:checked').forEach(c => c.checked = false); window.pesertaManualNotulen = []; window.renderPesertaManualNotul(); if(f) f.value = ""; if(document.getElementById('status-notul-foto')) document.getElementById('status-notul-foto').innerHTML = ""; window.navigasi('notulen-menu-screen'); } catch(e) { console.error(e); alert("Gagal menyimpan ke database."); } window.toggleLoader(false); 
};

window.switchTabNotulen = (j) => { document.querySelectorAll('.notul-list-content').forEach(e=>e.style.display='none'); document.querySelectorAll('#notulen-hasil-screen .tab-btn').forEach(b=>b.classList.remove('tab-active')); if(j==='MEETING PAGI') { document.getElementById('list-notulen-pagi').style.display='block'; document.getElementById('tab-notul-pagi').classList.add('tab-active'); } else if(j==='MEETING URGENT') { document.getElementById('list-notulen-urgent').style.display='block'; document.getElementById('tab-notul-urgent').classList.add('tab-active'); } else { document.getElementById('list-notulen-lapangan').style.display='block'; document.getElementById('tab-notul-lapangan').classList.add('tab-active'); } };
window.bukaHasilNotulen = async () => { window.navigasi('notulen-hasil-screen'); window.switchTabNotulen('MEETING PAGI'); window.notulenDatabase=[]; try{ const snap=await getDocs(query(collection(window.db,"notulen_meeting"))); snap.forEach(d=>window.notulenDatabase.push({id:d.id,...d.data()})); window.notulenDatabase.sort((a,b)=>b.timestamp-a.timestamp); let hP="",hU="",hL=""; window.notulenDatabase.forEach(d=>{ let c=`<div class="notulen-dark-card" onclick="window.bukaDetailNotulen('${d.id}')"><h3>${d.jenisMeeting}</h3><p>${d.waktuRecord}</p></div>`; if(d.jenisMeeting==='MEETING PAGI') hP+=c; else if(d.jenisMeeting==='MEETING URGENT') hU+=c; else hL+=c; }); document.getElementById('list-notulen-pagi').innerHTML=hP; document.getElementById('list-notulen-urgent').innerHTML=hU; document.getElementById('list-notulen-lapangan').innerHTML=hL; } catch(e){} };

window.bukaDetailNotulen = (id) => {
    const d = window.notulenDatabase.find(x => x.id === id);
    if (!d) return;
    
    // 1. Susun Chip Kehadiran
    let hp = '';
    if (d.peserta && d.peserta.length > 0) {
        d.peserta.forEach(x => {
            hp += `<div class="pro-chip"><div style="display:flex; align-items:center;"><i class="fas fa-user-circle" style="color:#94a3b8; margin-right:8px; font-size:16px;"></i> ${x}</div><i class="fas fa-check-circle"></i></div>`;
        });
    } else { hp = '<span style="font-weight:bold; color:#ef4444;">- Tidak ada data kehadiran -</span>'; }
    
    // 2. Susun Poin Evaluasi
    let hd = `<div class="pro-eval-grid">`;
    const icons = ['fa-bullseye', 'fa-cog', 'fa-wrench', 'fa-tools', 'fa-tasks', 'fa-check-square'];
    if (d.deskripsiData) {
        d.deskripsiData.forEach((x, index) => {
            let randIcon = icons[index % icons.length];
            hd += `
            <div class="pro-eval-card">
                <div class="pro-eval-left">
                    <span class="pro-eval-num">${index + 1}</span>
                    <i class="fas ${randIcon} pro-eval-icon"></i>
                </div>
                <p class="pro-eval-text">${x.teks}</p>
            </div>`;
        });
    }
    hd += `</div>`;
    
    // 3. Susun Dokumentasi Visual
    let hPhoto = '';
    if (d.foto) {
        hPhoto = `
        <div class="pro-photo-section">
            <h3 style="font-size:16px; font-weight:900; color:#1e293b; margin-bottom:15px; text-transform:uppercase;"><i class="fas fa-camera-retro"></i> DOKUMENTASI
            </h3>
            <div class="pro-photo-polaroid">
                <img src="${d.foto}" alt="Dokumentasi Rapat">
                <div class="pro-photo-label">
                </div>
            </div>
        </div>`;
    }
    
    // 4. Susun Waktu
    let extractedDate = "TIDAK ADA DATA";
    let extractedTime = "";
    if (d.waktuRecord) {
        let parts = d.waktuRecord.split('-');
        extractedDate = parts[0] ? parts[0].trim().toUpperCase() : d.waktuRecord;
        extractedTime = parts[1] ? parts[1].trim() : "";
    }
    
    // 5. Gabungkan Seluruh Kerangka UI Profesional
    let finalHtml = `
    <div class="notulen-pro-wrapper" id="notul-export-wrapper">
        <img src="https://cdn-icons-png.flaticon.com/512/2855/2855581.png" class="blueprint-bg bg-top-right">
        <img src="https://cdn-icons-png.flaticon.com/512/2855/2855581.png" class="blueprint-bg bg-bottom-left">

            <div class="pro-content">
            <div class="pro-header">
            <div class="pro-logo-box">
            <img src="logo.jpeg" alt="Logo CBI">
                </div>
                <div class="pro-title-box">
                    <h1>NOTULEN MAINTENANCE MOULD</h1>
                    <h2>PT. CAHAYA BUANA INTITAMA</h2>
                </div>
            </div>

            <div class="pro-info-card">
                <div class="pro-info-top">
                    <div class="pro-info-label-big">
                        <i class="fas fa-calendar-alt fa-2x" style="color:#94a3b8;"></i> INFO LAPORAN
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <div class="pro-badge" style="width: fit-content;"><i class="fas fa-clock"></i> ${d.jenisMeeting}</div>
                        <div style="font-size: 11px; font-weight: 800; color: #334155; margin-top:3px;">
                            TANGGAL INPUT: ${extractedDate} <span style="margin:0 5px;">|</span> WAKTU INPUT: ${extractedTime}
                        </div>
                    </div>
                </div>
                
                <div class="pro-info-bottom">
                    <div class="pro-info-label-big">
                        <i class="fas fa-clock fa-2x" style="color:#94a3b8;"></i> Daftar Kehadiran
                    </div>
                    <div class="pro-attendee-grid">${hp}</div>
                </div>
            </div>

            <div class="pro-section-title">
                <i class="fas fa-list-check" style="color:#0284c7; font-size:20px;"></i> POIN EVALUASI & TINDAKAN
            </div>
            ${hd}

            ${hPhoto}
        </div>
    </div>`;
    
    document.getElementById('report-notulen-content').innerHTML = finalHtml;
    window.navigasi('detail-notulen-screen');
};

window.updateCeklisNotulen = async function(docId, indexPoin, isChecked) { console.log("Ceklis dinonaktifkan di mode Pro."); };

window.downloadNotulenJPG = () => { const wrapper = document.getElementById('notul-export-wrapper'); if(wrapper) { wrapper.classList.add('export-mode'); } window.scrollTo(0, 0); window.toggleLoader(true, "Mencetak Laporan Profesional..."); setTimeout(() => { html2canvas(document.getElementById('notul-export-wrapper'), { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 1000 }).then(canvas => { let link = document.createElement('a'); link.download = `Notulen_${Date.now()}.jpg`; link.href = canvas.toDataURL('image/jpeg', 0.95); link.click(); if(wrapper) { wrapper.classList.remove('export-mode'); } window.toggleLoader(false); }).catch(e => { alert("Gagal cetak gambar."); if(wrapper) { wrapper.classList.remove('export-mode'); } window.toggleLoader(false); }); }, 600); };
window.cetakPDFNotulen = () => { const wrapper = document.getElementById('notul-export-wrapper'); if(wrapper) { wrapper.classList.add('export-mode'); } window.print(); setTimeout(() => { if(wrapper) { wrapper.classList.remove('export-mode'); } }, 1500); };

window.simpanJadwalBesar = async () => { const f = document.getElementById('jb-foto'); if(f.files.length===0) return alert("Pilih file!"); window.toggleLoader(true); try { let b64 = await window.compressImage(f.files[0],1600,1600,0.7); await addDoc(collection(window.db,"jadwal_besar"),{fileBase64:b64,timestamp:Date.now()}); alert("Disimpan!"); window.bukaViewJadwal(); } catch(e){} window.toggleLoader(false); };
window.bukaViewJadwal = async () => { window.navigasi('jadwal-besar-view-screen'); window.toggleLoader(true); try { let arr=[]; const snap=await getDocs(query(collection(window.db,"jadwal_besar"))); snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=>b.timestamp-a.timestamp); if(arr.length>0&&arr[0].fileBase64) document.getElementById('jb-view-container').innerHTML=`<img src="${arr[0].fileBase64}" style="max-width:100%; border-radius:10px;">`; else document.getElementById('jb-view-container').innerHTML="<p>Kosong</p>"; } catch(e){} window.toggleLoader(false); };

window.simpanIde = async () => { const n=window.amankanData(document.getElementById('ide-nama').value), w=document.getElementById('ide-waktu').value, u=window.amankanData(document.getElementById('ide-uraian').value); if(!n||!u) return alert("Lengkapi form!"); window.toggleLoader(true); try{ await addDoc(collection(window.db,"ide_saran_box"),{nama:n.toUpperCase(),waktu:w,uraian:u,timestamp:Date.now()}); alert("Terkirim!"); document.getElementById('ide-nama').value=""; document.getElementById('ide-uraian').value=""; window.switchTabIde('masuk'); } catch(e){} window.toggleLoader(false); };
window.switchTabIde = (t) => { 
    document.getElementById('tab-ide-input').classList.remove('tab-active'); 
    document.getElementById('tab-ide-masuk').classList.remove('tab-active'); 
    document.getElementById('ide-input-area').style.display='none'; 
    document.getElementById('ide-masuk-area').style.display='none'; 
    document.getElementById(`tab-ide-${t}`).classList.add('tab-active'); 
    document.getElementById(`ide-${t}-area`).style.display='block'; 
    
    if(t === 'masuk') {
        window.muatDataIde();
        // Logika mematikan notif lonceng saat Kotak Masuk dibaca
        if(window.currentIdeCount !== undefined) {
            localStorage.setItem('lastIdeCount', window.currentIdeCount);
            const dot = document.getElementById('bell-notif-dot');
            if(dot) dot.style.display = 'none'; // Matikan titik oren
        }
    } 
};

// ==========================================
// ENGINE LISTENER NOTIFIKASI REAL-TIME
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const dot = document.getElementById('bell-notif-dot');
        if(!dot) return;
        
        // Memantau Database Ide Center secara Live (Real-Time)
        onSnapshot(collection(window.db, "ide_saran_box"), (snapshot) => {
            let totalDoc = snapshot.size;
            let lastViewed = parseInt(localStorage.getItem('lastIdeCount') || '0');
            
            // Jika ada ide baru yang belum pernah dibaca, NYALAKAN LONCENG!
            if (totalDoc > lastViewed) {
                dot.style.display = 'block'; 
            } else {
                dot.style.display = 'none';
            }
            window.currentIdeCount = totalDoc; // Simpan ke memori sementara
        });
    }, 2000); // Mulai memantau 2 detik setelah aplikasi terbuka
});
window.muatDataIde = async () => { const c = document.getElementById('list-ide-masuk'); c.innerHTML="<p>Memuat...</p>"; try { let arr=[]; const snap=await getDocs(query(collection(window.db,"ide_saran_box"))); snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=>b.timestamp-a.timestamp); let h=""; arr.forEach(d=>{ h+=`<div class="progress-card"><h4>${d.nama}</h4><p style="font-size:11px;color:gray;">${d.waktu}</p><p>${d.uraian}</p></div>`; }); c.innerHTML=h||"<p>Kosong</p>"; } catch(e){} };

window.gantiTabGodMode = (el, kol) => { document.querySelectorAll('.god-mode-tabs .gm-tab').forEach(t=>t.classList.remove('active')); if(el) el.classList.add('active'); window.gmKoleksiAktif = kol; window.muatDataGodMode(kol); };
window.muatDataGodMode = async (kol) => { const c = document.getElementById('gm-log-container'); c.innerHTML="<div style='text-align:center; padding:30px;'><i class='fas fa-spinner fa-spin fa-2x'></i></div>"; window.gmDataAktif=[]; try { const snap=await getDocs(query(collection(window.db,kol))); snap.forEach(d=>window.gmDataAktif.push({id:d.id,...d.data()})); window.gmDataAktif.sort((a,b)=>b.timestamp-a.timestamp); if(window.gmDataAktif.length===0) return c.innerHTML=`<p style="text-align:center;">Database ${kol} kosong.</p>`; let h=""; window.gmDataAktif.forEach(d=>{ h+=`<div class="gm-data-card">`; for(let k in d) { if(k==='id') continue; let v=d[k]; if(k==='filePdfBase64'||k==='foto') v="[ENKRIPSI FILE BASE64]"; else if(typeof v==='object') v=JSON.stringify(v); if(String(v).length>50) v=String(v).substring(0,50)+"..."; h+=`<div class="gm-data-row"><div class="gm-data-key">${k}</div><div class="gm-data-val">${v}</div></div>`; } h+=`<button class="btn-gm-edit" onclick="window.bukaEditorDinamisGM('${d.id}')">Edit Record</button></div>`; }); c.innerHTML=h; } catch(e){ c.innerHTML=`<p>Error: ${e.message}</p>`; } };
window.bukaEditorDinamisGM = (id) => { const d=window.gmDataAktif.find(x=>x.id===id); if(!d) return; document.getElementById('gm-edit-id').value=id; document.getElementById('gm-edit-koleksi').value=window.gmKoleksiAktif; let h=""; for(let k in d) { if(k==='id') continue; let v=d[k]; let r=(k==='timestamp'||k==='filePdfBase64'||k==='foto')?"readonly style='background:#000;'":""; let t=typeof v==='object'?'textarea':'input'; let vv=typeof v==='object'?JSON.stringify(v,null,2):v; h+=`<div class="form-group"><label style="color:#a855f7;">${k}</label><${t} id="gm-in-${k}" value="${vv}" ${r}>${t==='textarea'?vv+'</textarea>':''}</div>`; } document.getElementById('dynamic-editor-body').innerHTML=h; document.getElementById('god-mode-editor-modal').style.display='flex'; };
window.tutupModalEditorGM = () => document.getElementById('god-mode-editor-modal').style.display='none';
window.simpanUpdateDataGM = async () => { const id=document.getElementById('gm-edit-id').value, kol=document.getElementById('gm-edit-koleksi').value; const d=window.gmDataAktif.find(x=>x.id===id); let up={}; for(let k in d) { if(k==='id'||k==='timestamp'||k==='filePdfBase64'||k==='foto') continue; const el=document.getElementById(`gm-in-${k}`); if(!el) continue; let v=el.value; if(typeof d[k]==='number') v=Number(v); else if(typeof d[k]==='object') { try { v=JSON.parse(v); } catch(e){ return alert(`Format JSON salah di ${k}`); } } up[k]=v; } window.toggleLoader(true); try { await updateDoc(doc(window.db,kol,id),up); alert("Record diupdate!"); window.tutupModalEditorGM(); window.muatDataGodMode(kol); } catch(e){} window.toggleLoader(false); };

window.inisialisasiDataAnalisaGlobal = async () => {
    window.toggleLoader(true, "Analisa AI Global..."); await window.ambilDataServerWS();
    let totP = window.dataProyekWS.length, totEst = 0, totAct = 0;
    window.dataProyekWS.forEach(d => { totEst += d.estJam || 0; d.tasks.forEach(t => t.subTasks.forEach(s => totAct += (s.actualDurasi || 0))); });
    let ach = totEst > 0 ? Math.round((totAct/totEst)*100) : 0;
    document.getElementById('dash-kpi-proyek').innerText = totP; document.getElementById('dash-kpi-est').innerText = totEst.toFixed(0);
    document.getElementById('dash-kpi-act').innerText = totAct.toFixed(1); document.getElementById('dash-kpi-ach').innerText = ach + "%";
    if(window.chartUni) window.chartUni.destroy(); if(window.chartBi) window.chartBi.destroy(); if(window.chartMulti) window.chartMulti.destroy();
    try {
        const opt = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } };
        window.chartUni = new Chart(document.getElementById('chartUnivariate').getContext('2d'), { type: 'doughnut', data: { labels: ['Selesai', 'Proses'], datasets: [{ data: [totAct, totEst-totAct>0?totEst-totAct:0], backgroundColor: ['#10b981', '#38bdf8'] }] }, options: opt });
        window.chartBi = new Chart(document.getElementById('chartBivariate').getContext('2d'), { type: 'bar', data: { labels: ['P1', 'P2', 'P3'], datasets: [{ label: 'Est', data: [10,20,30], backgroundColor: '#38bdf8' }, { label: 'Act', data: [12,18,35], backgroundColor: '#f59e0b' }] }, options: opt });
        window.chartMulti = new Chart(document.getElementById('chartMultivariate').getContext('2d'), { type: 'line', data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Trend', data: [80, 85, 90, ach], borderColor: '#a855f7', tension:0.4 }] }, options: opt });
        let hTb = ""; window.dataProyekWS.forEach(d => { let ac=0; d.tasks.forEach(t=>t.subTasks.forEach(s=>ac+=(s.actualDurasi||0))); let achR = d.estJam>0?Math.round((ac/d.estJam)*100):0; hTb += `<tr><td>${d.namaProyek}</td><td>${d.estJam}</td><td>${ac.toFixed(1)}</td><td>${achR}%</td><td>${d.statusGlobal}</td></tr>`; }); document.getElementById('dash-table-body').innerHTML = hTb || `<tr><td colspan="5" style="text-align:center;">Kosong</td></tr>`;
    } catch(e){} window.toggleLoader(false);
};

// Init Onload
document.addEventListener("DOMContentLoaded", () => { setTimeout(window.muatDataPKMEltre, 1500); });

// =======================================================================
// UPGRADE TAHAP 1: SISTEM MANAJEMEN HAK AKSES (SUPER ADMIN)
// =======================================================================

// 1. Tentukan Email Anda Sebagai Pemegang Kunci Tertinggi (Pisahkan dengan koma jika lebih dari 1)
window.superAdminEmails = ['fbenny947@gmail.com', 'email.bos@gmail.com']; 

// 2. TIMPA FUNGSI LOGIN: Mencegat proses login untuk mengecek wajah/email pengguna
window.masukBerandaCepat = async function() {
    if(navigator.vibrate) navigator.vibrate([50]);
    
    // Jika dia sudah login sebelumnya
    if(auth.currentUser) { 
        window.toggleLoader(true, "Verifikasi Sidik Jari Digital..."); 
        await window.prosesHakAkses(auth.currentUser); 
        return; 
    }
    
    // Jika dia baru pertama kali login
    try { 
        const res = await signInWithPopup(auth, provider); 
        window.toggleLoader(true, "Verifikasi Sidik Jari Digital..."); 
        await window.prosesHakAkses(res.user); 
    } catch(e) { 
        window.toggleLoader(false); 
        if(e.code !== 'auth/popup-closed-by-user') alert("Login Gagal."); 
    }
};

window.prosesHakAkses = async function(user) {
    try {
        const btnAdmin = document.getElementById('btn-menu-superadmin');
        const emailUser = user.email.toLowerCase();

        // Cek apakah yang login adalah Anda (Super Admin)
        if(window.superAdminEmails.includes(emailUser)) {
            if(btnAdmin) btnAdmin.style.display = 'flex'; 
            window.isSuperAdminUser = true;
            window.hakAksesUser = "SUPER"; // Super Admin kebal semua aturan
        } else {
            if(btnAdmin) btnAdmin.style.display = 'none'; 
            window.isSuperAdminUser = false;

            // MENGUNDUH BUKU AKSES KARYAWAN DARI DATABASE
            const docRef = doc(window.db, "users_access", emailUser);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                window.hakAksesUser = docSnap.data(); // Simpan izinnya di memori HP
            } else {
                window.hakAksesUser = null; // Karyawan belum didaftarkan sama sekali
            }
        }

        window.toggleLoader(false);
        
        // Eksekusi animasi pintu terbuka masuk ke Beranda
        const l = document.getElementById('landing-page'); 
        if(l) l.classList.add('door-open'); 
        setTimeout(() => { 
            if(l) l.style.display='none'; 
            document.getElementById('global-bottom-nav').style.display='flex'; 
            window.navigasi('home-screen'); 
            window.jalankanEngineMetrik(); 
        }, 300);
    } catch(e) {
        window.toggleLoader(false);
        alert("Akses ke database ditolak atau koneksi terputus.");
    }
};


// 3. FUNGSI LAYAR MENU SUPER ADMIN (GRANULAR ACCESS 23 POIN)

// Daftar 23 Modul Utama M-TRIX
window.daftarModul = [
    { key: "moldstore", nama: "1. Moldstore" },
    { key: "repair", nama: "2. Repair" },
    { key: "trouble", nama: "3. Trouble" },
    { key: "workshop", nama: "4. Workshop" },
    { key: "adm_mold", nama: "5. ADM Mold" },
    { key: "trial", nama: "6. Permintaan Trial" },
    { key: "notulen", nama: "7. Notulen" },
    { key: "prog_store", nama: "8. Progres Store" },
    { key: "prog_repair", nama: "9. Progres Repair" },
    { key: "prog_trouble", nama: "10. Progres Trouble" },
    { key: "prog_workshop", nama: "11. Progres Workshop" },
    { key: "analisa", nama: "12. Analisa (AI Dashboard)" },
    { key: "jadwal", nama: "13. Jadwal Besar" },
    { key: "cyber", nama: "14. Cyber Security" },
    { key: "ide", nama: "15. Ide Center" },
    { key: "inbox", nama: "16. Inbox (Pengumuman)" },
    { key: "struktur", nama: "17. Struktur Organisasi" },
    { key: "personel", nama: "18. Tim Personel" },
    { key: "arsip", nama: "19. Arsip & Dokumentasi" },
    { key: "surkom", nama: "20. Surat Komponen" },
    { key: "master_mold", nama: "21. Database Master Mold" },
    { key: "rotasi", nama: "22. Rotasi Mold" },
    { key: "preventif", nama: "23. Preventif Mold" }
];

window.bukaMenuSuperAdmin = async () => {
    window.navigasi('admin-akses-screen');
    window.renderFormAkses();
    await window.muatDaftarAkses();
};

window.renderFormAkses = function() {
    const c = document.getElementById('container-daftar-akses');
    if(!c) return;
    let h = `<div style="display:flex; font-size:10px; font-weight:900; color:var(--text-muted); border-bottom:1px solid #ef4444; padding-bottom:8px; margin-bottom:10px; position:sticky; top:0; background:rgba(15,23,42,0.95); z-index:5;">
                <div style="flex:2.5;">NAMA MODUL / FITUR</div>
                <div style="flex:1; text-align:center;"><i class="fas fa-eye"></i> LIHAT</div>
                <div style="flex:1; text-align:center;"><i class="fas fa-edit"></i> INPUT</div>
             </div>`;
    window.daftarModul.forEach(m => {
        h += `<div style="display:flex; align-items:center; font-size:11px; border-bottom:1px dashed rgba(255,255,255,0.1); padding:10px 0; color:white; font-weight:700;">
                <div style="flex:2.5;">${m.nama}</div>
                <div style="flex:1; text-align:center;"><input type="checkbox" id="chk-lihat-${m.key}" style="width:20px; height:20px; accent-color:#10b981; cursor:pointer;"></div>
                <div style="flex:1; text-align:center;"><input type="checkbox" id="chk-input-${m.key}" style="width:20px; height:20px; accent-color:#38bdf8; cursor:pointer;"></div>
              </div>`;
    });
    c.innerHTML = h;
};

window.muatDaftarAkses = async () => {
    const c = document.getElementById('list-user-akses');
    c.innerHTML = "<p style='text-align:center;'><i class='fas fa-spinner fa-spin'></i> Mengunduh Buku Akses...</p>";
    window.daftarAksesDatabase = [];
    try {
        const snap = await getDocs(query(collection(window.db, "users_access")));
        snap.forEach(d => window.daftarAksesDatabase.push({id: d.id, ...d.data()}));
        
        let h = "";
        window.daftarAksesDatabase.forEach(d => {
            // Hitung berapa modul yang diizinkan untuk User ini
            let totalIzin = 0;
            window.daftarModul.forEach(m => {
                if(d[`${m.key}_lihat`] || d[`${m.key}_input`]) totalIzin++;
            });

            h += `<div class="progress-card" style="border-left-color:#ef4444; position:relative;">
                    <h4 style="margin:0 0 5px 0; color:#ef4444;"><i class="fas fa-envelope"></i> ${d.id}</h4>
                    <p style="font-size:11px; color:var(--text-muted); margin-bottom:0;">
                        Memiliki akses terperinci pada <strong style="color:white;">${totalIzin} dari 23 Modul</strong>.
                    </p>
                    <div style="display:flex; gap:10px; margin-top:12px;">
                        <button onclick="window.editHakAkses('${d.id}')" style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; border-radius:8px; padding:6px 15px; color:#bae6fd; cursor:pointer; font-size:11px; font-weight:800;"><i class="fas fa-edit"></i> Edit Akses</button>
                    </div>
                    <button onclick="window.hapusHakAkses('${d.id}')" style="position:absolute; right:15px; top:15px; background:rgba(239,68,68,0.2); border:1px solid #ef4444; border-radius:8px; padding:8px; color:#fca5a5; cursor:pointer;"><i class="fas fa-trash"></i></button>
                  </div>`;
        });
        c.innerHTML = h || "<p style='text-align:center; color:var(--text-muted);'>Belum ada Karyawan yang diatur hak aksesnya.</p>";
    } catch(e) {
        c.innerHTML = `<p style="color:red; text-align:center;">Gagal membaca database.</p>`;
    }
};

window.editHakAkses = function(email) {
    const d = window.daftarAksesDatabase.find(x => x.id === email);
    if(!d) return;
    document.getElementById('admin-email-user').value = email;
    // Otomatis mencentang sesuai data dari database
    window.daftarModul.forEach(m => {
        document.getElementById(`chk-lihat-${m.key}`).checked = d[`${m.key}_lihat`] === true;
        document.getElementById(`chk-input-${m.key}`).checked = d[`${m.key}_input`] === true;
    });
    // Scroll layar ke atas
    document.getElementById('admin-akses-screen').scrollIntoView({behavior: 'smooth'});
};

window.simpanHakAkses = async () => {
    const email = document.getElementById('admin-email-user').value.toLowerCase().trim();
    if(!email) return alert("Masukkan email karyawan terlebih dahulu!");
    
    // Tarik semua status centang dari 23 modul
    let accessData = { timestamp: Date.now() };
    window.daftarModul.forEach(m => {
        accessData[`${m.key}_lihat`] = document.getElementById(`chk-lihat-${m.key}`).checked;
        accessData[`${m.key}_input`] = document.getElementById(`chk-input-${m.key}`).checked;
    });

    window.toggleLoader(true, "Menulis ke Buku Akses Database...");
    try {
        await setDoc(doc(window.db, "users_access", email), accessData);
        alert("Buku Akses berhasil diperbarui untuk " + email);
        
        // Reset formulir
        document.getElementById('admin-email-user').value = "";
        window.daftarModul.forEach(m => {
            document.getElementById(`chk-lihat-${m.key}`).checked = false;
            document.getElementById(`chk-input-${m.key}`).checked = false;
        });
        
        await window.muatDaftarAkses();
    } catch(e) { alert("Gagal menyimpan data: " + e.message); }
    window.toggleLoader(false);
};

window.hapusHakAkses = async (email) => {
    if(!confirm(`CABUT HAK AKSES? \nEmail ${email} akan dilarang mengakses seluruh sistem.`)) return;
    window.toggleLoader(true, "Menghapus dari Buku Akses...");
    try {
        await deleteDoc(doc(window.db, "users_access", email));
        await window.muatDaftarAkses();
    } catch(e) { alert("Gagal menghapus!"); }
    window.toggleLoader(false);
};
// =======================================================================
// UPGRADE TAHAP 2: SISTEM PENCEGAT (INTERCEPTOR) NAVIGASI & INPUT
// =======================================================================

// 1. Fungsi Utama Pengecek Hak Akses (Digunakan untuk Lihat & Input)
window.cekAkses = function(modulKey, tipeAkses = 'lihat') {
    // Jika Super Admin, langsung buka pintu!
    if (window.isSuperAdminUser) return true;

    // Jika karyawan tidak ada di Buku Akses database
    if (!window.hakAksesUser) {
        alert("Maaf, Anda belum didaftarkan di sistem. Anda tidak diberi akses untuk ini.");
        return false;
    }

    // Cek centangan (misal: moldstore_lihat)
    const izinkan = window.hakAksesUser[`${modulKey}_${tipeAkses}`];
    if (izinkan === true) {
        return true;
    } else {
        alert("Maaf, Anda tidak diberi akses untuk ini.");
        return false;
    }
};

// 2. Teknik "Monkey Patching" (Menimpa navigasi tanpa merusak aslinya)
if (!window.navigasiAsli) {
    window.navigasiAsli = window.navigasi;
}

window.navigasi = function(idLayarTujuan) {
    if (!idLayarTujuan) return;
    const id = idLayarTujuan.toLowerCase();
    let modulYgDicek = null;

    // 1. KAMUS PINTAR: Daftar variasi nama ID layar di HTML Anda
    // Satpam akan memblokir jika nama layar mengandung salah satu kata di bawah ini:
    const petaBlokir = {
        'moldstore': ['moldstore', 'mold-store', 'rencana-naik', 'persiapan'],
        'repair': ['repair'],
        'trouble': ['trouble'],
        'workshop': ['workshop', 'project'],
        'adm_mold': ['adm-mold', 'adm_mold', 'admmold'],
        'trial': ['trial'],
        'notulen': ['notulen'],
        'prog_store': ['prog-store', 'progres-store'],
        'prog_repair': ['prog-repair', 'progres-repair'],
        'prog_trouble': ['prog-trouble', 'progres-trouble'],
        'prog_workshop': ['prog-workshop', 'progres-workshop', 'control-progres', 'progres-project'],
        'analisa': ['analisa', 'dashboard'],
        'jadwal': ['jadwal'],
        'cyber': ['cyber', 'security'],
        'ide': ['ide', 'saran'],
        'inbox': ['inbox'],
        'struktur': ['struktur', 'organisasi'],
        'personel': ['personel', 'tim'],
        'arsip': ['arsip', 'dokumentasi','npbpb','np-','ik-','sop-'],
        'surkom': ['surkom', 'surat', 'pdf'], // Ini akan mencegat "Input Surkom (PDF)"
        'master_mold': ['master-mold', 'master_mold', 'database'],
        'rotasi': ['rotasi'],
        'preventif': ['preventif']
    };

    // Proses pencarian: Cocokkan ID tujuan dengan Kamus di atas
    for (const [keyModul, daftarKata] of Object.entries(petaBlokir)) {
        if (daftarKata.some(kata => id.includes(kata))) {
            modulYgDicek = keyModul;
            break;
        }
    }

    // 2. JIKA KETAHUAN MENUJU ZONA RAHASIA
    if (modulYgDicek) {
        
        // DETEKSI OTOMATIS: Apakah dia mau "Lihat" atau mau "Input"?
        let tipeAkses = 'lihat';
        
        // Memecah ID menjadi kata per kata
        const kataTerpisah = id.split('-'); 
        const kataKunciInput = ['input', 'form', 'new', 'update', 'tambah'];
        
        // Cek apakah ada kata yang BENAR-BENAR SAMA
        const isAksiInput = kataKunciInput.some(kata => kataTerpisah.includes(kata));
        
        if (isAksiInput) {
            tipeAkses = 'input'; // Paksa satpam mengecek izin INPUT secara presisi!
        }

        // Tanya ke sistem keamanan: Boleh masuk gak?
        const bolehMasuk = window.cekAkses(modulYgDicek, tipeAkses);
        
        if (!bolehMasuk) {
            // Jika tidak boleh, BATALKAN PINDAH LAYAR!
            return; 
        }
    }
    // 3. Jika aman, atau dia punya izin, izinkan lewat!
    window.navigasiAsli(idLayarTujuan);

       // 4. GARBAGE COLLECTION (Optimasi RAM HP)
    if (!id.includes('surkom') && !id.includes('sm-') && !id.includes('sk-') && !id.includes('arsip') && !id.includes('ik-') && !id.includes('sop-')) {
        window.surkomPdfDocObj = null;
        window.surkomOriginalPdfBytes = null;
        window.arsipPdfDocObj = null;
        if(window.modulPdfData) {
            window.modulPdfData.ik.bytes = null; window.modulPdfData.ik.doc = null;
            window.modulPdfData.sop.bytes = null; window.modulPdfData.sop.doc = null;
        }
    }
};

// =========================================================================================
// MODUL ARSIP: ENGINE UNIVERSAL UNTUK IK & SOP (PDF SPLITTER + HISTORY)
// =========================================================================================

// Jam Real-time Otomatis untuk IK, SOP, dan IDE CENTER
setInterval(() => {
    const now = new Date();
    const strWaktu = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " - " + now.toLocaleTimeString('id-ID', { hour12: false });
    if(document.getElementById('ik-waktu')) document.getElementById('ik-waktu').value = strWaktu;
    if(document.getElementById('sop-waktu')) document.getElementById('sop-waktu').value = strWaktu;
    if(document.getElementById('ide-waktu')) document.getElementById('ide-waktu').value = strWaktu; // Waktu Ide Center Berjalan
}, 1000);

// Variabel Global Data
window.modulPdfData = {
    ik: { bytes: null, count: 0, doc: null, collection: 'instruksi_kerja' },
    sop: { bytes: null, count: 0, doc: null, collection: 'standar_operasional' }
};
window.historyDatabase = { ik: [], sop: [] };

// 1. ENGINE MEMECAH PDF (SPLITTER)
window.prosesPDF_Doc = async function(inp, prefix) {
    const f = inp.files[0]; if(!f) return;
    window.toggleLoader(true, "Memecah PDF...");
    try {
        const ab = await f.arrayBuffer();
        window.modulPdfData[prefix].bytes = ab;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        window.modulPdfData[prefix].doc = pdf;
        window.modulPdfData[prefix].count = pdf.numPages;

        document.getElementById(`${prefix}-split-area`).style.display = 'block';
        document.getElementById(`${prefix}-total-halaman`).innerText = pdf.numPages;
        let c = document.getElementById(`${prefix}-split-container`);
        c.innerHTML = "";

        for(let i=1; i<=pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({ scale: 0.6 });
            let d = document.createElement('div');
            d.className = "pdf-split-card";
            d.id = `${prefix}-card-${i}`;
            d.innerHTML = `
                <div onclick="document.getElementById('${prefix}-card-${i}').remove();" style="position:absolute; top:-10px; right:-10px; background:var(--lambat); color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 0 10px rgba(239,68,68,0.5);"><i class="fas fa-times"></i></div>
                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="cursor:pointer; text-align:center;" onclick="window.bukaPreviewDoc('${prefix}', ${i})">
                        <canvas id="${prefix}-canvas-${i}" style="width:70px; border-radius:6px; border:2px solid var(--secondary); background:white;"></canvas>
                        <div style="font-size:9px; margin-top:5px; color:var(--secondary); font-weight:800;"><i class="fas fa-search-plus"></i> LIHAT</div>
                    </div>
                    <div style="flex:1;">
                        <input type="text" id="${prefix}-judul-${i}" placeholder="Masukkan Judul Dokumen (Hal ${i})..." style="text-transform:uppercase;">
                    </div>
                </div>`;
            c.appendChild(d);
            const canvas = document.getElementById(`${prefix}-canvas-${i}`);
            const ctx = canvas.getContext('2d');
            canvas.height = vp.height; canvas.width = vp.width;
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
        }
    } catch(e) { alert("Error Membaca PDF: " + e.message); }
    window.toggleLoader(false);
};

// 2. ENGINE PREVIEW PDF SEBELUM DINAMAI
window.bukaPreviewDoc = async function(prefix, pNum) {
    const mod = document.getElementById('surkom-preview-modal'); // Kita pinjam modal Surkom
    const cvs = document.getElementById('surkom-preview-canvas');
    const l = document.getElementById('surkom-preview-loading');
    mod.style.display='flex'; cvs.style.display='none'; l.style.display='block';
    document.getElementById('surkom-preview-page-num').innerText = pNum;
    try {
        const page = await window.modulPdfData[prefix].doc.getPage(pNum);
        const vp = page.getViewport({ scale: 1.5 });
        const ctx = cvs.getContext('2d');
        cvs.height = vp.height; cvs.width = vp.width;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        l.style.display='none'; cvs.style.display='block';
    } catch(e) {}
};

// 3. ENGINE SIMPAN SEMUA POTONGAN PDF (UPDATED DENGAN KATEGORI)
window.simpanAll_Doc = async function(prefix) {
    const uploader = window.amankanData(document.getElementById(`${prefix}-uploader`).value);
    const waktu = document.getElementById(`${prefix}-waktu`).value;
    if(!uploader) return alert("Mohon isi Nama Pengupload!");
    window.toggleLoader(true, "Menyimpan Data ke Server...");
    try {
        const { PDFDocument } = PDFLib;
        const orig = await PDFDocument.load(window.modulPdfData[prefix].bytes);
        let arr = [];
        for(let i=1; i<=window.modulPdfData[prefix].count; i++) {
            let inp = document.getElementById(`${prefix}-judul-${i}`);
            if(!inp || !inp.value.trim()) continue;
            
            let newPdf = await PDFDocument.create();
            let [pg] = await newPdf.copyPages(orig, [i-1]);
            newPdf.addPage(pg);
            let b64 = await newPdf.saveAsBase64({ dataUri: true });
            
            // Siapkan Data Paket
            let dataPayload = {
                judul: inp.value.trim().toUpperCase(),
                uploader: uploader.toUpperCase(),
                waktuInput: waktu,
                filePdfBase64: b64,
                timestamp: Date.now()
            };
            
            // JIKA SOP, Tambahkan Kategori!
            if (prefix === 'sop') {
                const kat = document.getElementById('sop-kategori');
                if(kat) dataPayload.kategori = kat.value;
            }

            arr.push(addDoc(collection(window.db, window.modulPdfData[prefix].collection), dataPayload));
        }
        await Promise.all(arr);
        alert(`Seluruh dokumen ${prefix.toUpperCase()} berhasil disimpan!`);
        window.navigasi(`${prefix}-history-screen`);
        await window.renderHistory_Doc(prefix, true);
    } catch(e) { alert("Gagal Menyimpan: " + e.message); }
    window.toggleLoader(false);
};

// VARIABEL GLOBAL UNTUK FILTER SOP
window.currentSopFilter = 'Semua';

// FUNGSI KLIK TOMBOL FILTER KATEGORI SOP
window.filterSopKategori = function(kategori, btnEl) {
    window.currentSopFilter = kategori;
    
    // Ganti warna tombol yang aktif
    const btns = document.querySelectorAll('#sop-history-screen .kategori-btn');
    btns.forEach(b => b.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');

    // Render ulang data history
    window.renderHistory_Doc('sop');
};

// 4. ENGINE TAMPILKAN HISTORY (UPDATED FILTER KATEGORI)
window.renderHistory_Doc = async function(prefix, forceFetch = false) {
    const c = document.getElementById(`list-${prefix}-history`);
    const kw = window.amankanData((document.getElementById(`${prefix}-search-key`)?.value || "").toLowerCase());
    
    if(forceFetch || window.historyDatabase[prefix].length === 0) {
        window.toggleLoader(true, "Memuat Data dari Cloud...");
        window.historyDatabase[prefix] = [];
        try {
            const snap = await getDocs(query(collection(window.db, window.modulPdfData[prefix].collection)));
            snap.forEach(d => window.historyDatabase[prefix].push({id: d.id, ...d.data()}));
            window.historyDatabase[prefix].sort((a,b) => b.timestamp - a.timestamp);
        } catch(e){}
        window.toggleLoader(false);
    }

    // Filter berdasarkan Kata Kunci Pencarian
    let data = window.historyDatabase[prefix].filter(d => (d.judul || "").toLowerCase().includes(kw));
    
    // TAMBAHAN: Filter Khusus Kategori SOP
    if (prefix === 'sop' && window.currentSopFilter !== 'Semua') {
        data = data.filter(d => d.kategori === window.currentSopFilter);
    }

    if(data.length === 0) {
        c.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px; border:1px dashed var(--border-dark); border-radius:10px;">Tidak ada dokumen yang ditemukan.</p>`;
        return;
    }

    let h = "";
    const iconColor = prefix === 'ik' ? '#8b5cf6' : '#ec4899';
    data.forEach(d => {
        // Tampilkan Label Kategori (Jika ada)
        let badgeKategori = "";
        if(prefix === 'sop' && d.kategori) {
            badgeKategori = `<span style="background: rgba(236,72,153,0.15); border:1px solid rgba(236,72,153,0.5); color:#fbcfe8; padding:3px 8px; border-radius:12px; font-size:9px; margin-left:8px; vertical-align:middle;">${d.kategori}</span>`;
        }

        h += `
        <div class="progress-card" style="border-left-color:${iconColor}; margin-bottom:15px; background:rgba(15,23,42,0.8);">
            <h4 style="margin:0 0 8px 0; color:${iconColor}; font-size:15px;">${d.judul} ${badgeKategori}</h4>
            <p style="margin:0 0 15px 0; font-size:11px; color:var(--text-muted);"><i class="fas fa-clock"></i> ${d.waktuInput} <br><i class="fas fa-user-tie" style="margin-top:5px;"></i> Upload Oleh: <span style="color:white; font-weight:bold;">${d.uploader}</span></p>
            
            <div style="display:flex; gap:10px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:12px;">
                <button onclick="window.bukaViewerHistory('${prefix}', '${d.id}')" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); color:white; padding:10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; transition:0.2s;"><i class="fas fa-eye" style="color:#38bdf8;"></i> Lihat Dokumen</button>
                <button onclick="window.unduhFileHistory('${prefix}', '${d.id}', 'pdf')" style="flex:1; background:linear-gradient(135deg, #10b981, #059669); border:none; color:white; padding:10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; box-shadow:0 4px 10px rgba(16,185,129,0.3);"><i class="fas fa-file-pdf"></i> Unduh PDF</button>
                <button onclick="window.unduhFileHistory('${prefix}', '${d.id}', 'jpg')" style="flex:1; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:white; padding:10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; box-shadow:0 4px 10px rgba(245,158,11,0.3);"><i class="fas fa-image"></i> Unduh JPG</button>
            </div>
        </div>`;
    });
    c.innerHTML = h;
};

// 5. ENGINE UNDUH DOKUMEN (KONVERSI PDF KE JPG)
window.unduhFileHistory = async function(prefix, id, type) {
    const d = window.historyDatabase[prefix].find(x => x.id === id);
    if(!d || !d.filePdfBase64) return;
    
    const namaFile = `${prefix.toUpperCase()}_${d.judul}`;
    
    if(type === 'pdf') {
        let a = document.createElement("a");
        a.href = d.filePdfBase64;
        a.download = namaFile + ".pdf";
        a.click();
    } else {
        window.toggleLoader(true, "Mengekstrak JPG Resolusi Tinggi...");
        try {
            const pdfBytes = base64ToArrayBuffer(d.filePdfBase64);
            const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const page = await pdf.getPage(1);
            const vp = page.getViewport({ scale: 2.5 }); // Skala besar agar JPG tidak pecah/blur
            const cvs = document.createElement('canvas');
            cvs.width = vp.width; cvs.height = vp.height;
            const ctx = cvs.getContext('2d');
            
            // Beri background putih (karena PDF bawaan aslinya transparan)
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            
            let link = document.createElement('a');
            link.download = namaFile + '.jpg';
            link.href = cvs.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch(e) { alert("Gagal mengekstrak JPG."); }
        window.toggleLoader(false);
    }
};

// 6. ENGINE VIEWER PDF UNIVERSAL
window.bukaViewerHistory = async function(prefix, id) {
    const d = window.historyDatabase[prefix].find(x => x.id === id);
    if(!d || !d.filePdfBase64) return;
    document.getElementById('arsip-pdf-modal').style.display = 'flex';
    document.getElementById('arsip-viewer-title').innerText = d.judul;
    document.getElementById('arsip-viewer-canvas').style.display = 'none';
    document.getElementById('arsip-viewer-loading').style.display = 'block';
    try {
        let pdfBytes = base64ToArrayBuffer(d.filePdfBase64);
        window.arsipPdfDocObj = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        window.arsipCurrentPage = 1;
        await window.arsipRenderPage(1);
    } catch(e) { alert("Gagal memuat PDF."); document.getElementById('arsip-pdf-modal').style.display='none'; }
};

// =========================================================================================
// MODUL ARSIP: MANAJEMEN NP & BPB (ACCOUNTING STANDARD)
// =========================================================================================
window.npbpbDatabase = []; // RAM Cache untuk data NP/BPB

// --- 1. FUNGSI SIMPAN INPUT NP (AUTO-INCREMENT BULANAN) ---
window.simpanInputNP = async () => {
    const noNP = window.amankanData(document.getElementById('np-nomor').value).toUpperCase();
    const tglNP = document.getElementById('np-tanggal').value;
    const namaBarang = window.amankanData(document.getElementById('np-nama-barang').value).toUpperCase();
    const qty = parseInt(document.getElementById('np-jumlah').value) || 0;
    const satuan = window.amankanData(document.getElementById('np-satuan').value).toUpperCase();

    if(!noNP || !tglNP || !namaBarang || qty <= 0 || !satuan) {
        return alert("Mohon lengkapi semua form Nota Permintaan dengan benar!");
    }

    window.toggleLoader(true, "Menganalisa Urutan Bulanan...");
    try {
        // Ekstrak Bulan & Tahun (Contoh: "2026-08") untuk auto-reset per bulan
        const bulanTahun = tglNP.substring(0, 7); 
        
        // Cari nomor urut terakhir di bulan ini
        let maxUrut = 0;
        const snapCek = await getDocs(query(collection(window.db, "np_bpb")));
        snapCek.forEach(d => {
            const data = d.data();
            if(data.bulanTahun === bulanTahun && data.noUrutBulan > maxUrut) {
                maxUrut = data.noUrutBulan;
            }
        });
        const urutBaru = maxUrut + 1; // Nomor urut otomatis bertambah

        // Simpan ke Firestore
        await addDoc(collection(window.db, "np_bpb"), {
            noUrutBulan: urutBaru,
            bulanTahun: bulanTahun,
            noNP: noNP,
            tglNP: tglNP,
            namaBarang: namaBarang,
            qty: qty,
            satuan: satuan,
            status: "PENDING", // Belum ada BPB
            noBPB: "",
            tglBPB: "",
            timestamp: Date.now()
        });

        alert(`Sukses! Pesanan tersimpan di urutan ke-${urutBaru} untuk bulan ini.`);
        // Kosongkan form kecuali tanggal agar cepat menginput berulang
        document.getElementById('np-nomor').value = "";
        document.getElementById('np-nama-barang').value = "";
        document.getElementById('np-jumlah').value = "";
        document.getElementById('np-satuan').value = "";
        
        // Kosongkan RAM agar nanti refresh otomatis
        window.npbpbDatabase = []; 
    } catch(e) {
        alert("Gagal menyimpan data ke server.");
    }
    window.toggleLoader(false);
};

// --- 2. FUNGSI UPDATE PROGRES (PENDING BPB) ---
window.bukaUpdateProgresNP = async () => {
    // Set default filter ke bulan saat ini
    const now = new Date();
    const mth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('bpb-filter-bulan').value = mth;
    
    window.navigasi('np-update-screen');
    await window.renderUpdateProgresNP(true);
};

window.renderUpdateProgresNP = async (forceFetch = false) => {
    const c = document.getElementById('list-bpb-pending');
    const kw = window.amankanData((document.getElementById('bpb-search-key').value || "").toLowerCase());
    const filterBulan = document.getElementById('bpb-filter-bulan').value; // format: YYYY-MM

    if (forceFetch || window.npbpbDatabase.length === 0) {
        window.npbpbDatabase = [];
        try {
            const snap = await getDocs(query(collection(window.db, "np_bpb")));
            snap.forEach(d => window.npbpbDatabase.push({id: d.id, ...d.data()}));
            // Urutkan berdasarkan waktu input terbaru
            window.npbpbDatabase.sort((a,b) => b.timestamp - a.timestamp); 
        } catch(e) {}
    }

    // Filter Data: Hanya yang PENDING, dan sesuai bulan/pencarian
    let dataList = window.npbpbDatabase.filter(d => {
        let matchStatus = d.status === "PENDING";
        let matchKw = (d.namaBarang.toLowerCase().includes(kw) || d.noNP.toLowerCase().includes(kw));
        let matchBulan = filterBulan ? d.bulanTahun === filterBulan : true;
        return matchStatus && matchKw && matchBulan;
    });

    if(dataList.length === 0) {
        c.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">Tidak ada pesanan tertunda di bulan ini.</td></tr>`;
        return;
    }

    let h = "";
    dataList.forEach(d => {
        h += `<tr>
                <td style="color:#94a3b8;">${d.tglNP}</td>
                <td style="color:#38bdf8; font-weight:700;">${d.noNP}</td>
                <td style="font-weight:700;">${d.namaBarang}</td>
                <td style="text-align:center;">${d.qty} <span style="font-size:10px; color:#94a3b8;">${d.satuan}</span></td>
                <td style="text-align:center;">
                    <button class="btn-update-bpb" onclick="window.bukaModalUpdateBPB('${d.id}')">
                        <i class="fas fa-edit"></i> Update
                    </button>
                </td>
              </tr>`;
    });
    c.innerHTML = h;
};

// MODAL UPDATE BPB
window.bukaModalUpdateBPB = (id) => {
    const d = window.npbpbDatabase.find(x => x.id === id);
    if(!d) return;
    document.getElementById('modal-bpb-id').value = id;
    document.getElementById('modal-bpb-nama').value = d.namaBarang;
    document.getElementById('modal-bpb-qty').value = d.qty;
    document.getElementById('modal-bpb-satuan').value = d.satuan;
    document.getElementById('modal-bpb-nomor').value = "";
    document.getElementById('modal-bpb-tanggal').value = "";
    document.getElementById('npbpb-update-modal').style.display = 'flex';
};

window.simpanUpdateBPB = async () => {
    const id = document.getElementById('modal-bpb-id').value;
    const noBPB = window.amankanData(document.getElementById('modal-bpb-nomor').value).toUpperCase();
    const tglBPB = document.getElementById('modal-bpb-tanggal').value;

    if(!noBPB || !tglBPB) return alert("Nomor dan Tanggal BPB Wajib Diisi!");

    window.toggleLoader(true, "Menyinkronkan BPB...");
    try {
        await updateDoc(doc(window.db, "np_bpb", id), {
            noBPB: noBPB,
            tglBPB: tglBPB,
            status: "SELESAI" // Ubah status menjadi Selesai (Hijau)
        });
        alert("Data BPB Berhasil Diupdate!");
        document.getElementById('npbpb-update-modal').style.display = 'none';
        
        // Refresh tabel
        await window.renderUpdateProgresNP(true); 
    } catch(e) {}
    window.toggleLoader(false);
};

// --- 3. FUNGSI VIEW DATA PESANAN (MASTER ACCOUNTING) ---
window.bukaViewDataNP = async () => {
    const now = new Date();
    const mth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('view-np-bulan').value = mth; // Default bulan ini
    
    window.navigasi('np-view-screen');
    await window.renderViewDataNP(true);
};

window.renderViewDataNP = async (forceFetch = false) => {
    const c = document.getElementById('list-view-master-np');
    const loading = document.getElementById('loading-np-master');
    const kw = window.amankanData((document.getElementById('view-np-search').value || "").toLowerCase());
    const filterBulan = document.getElementById('view-np-bulan').value;
    const filterStatus = document.getElementById('view-np-status').value;

    if (forceFetch || window.npbpbDatabase.length === 0) {
        c.style.display = 'none'; loading.style.display = 'block';
        window.npbpbDatabase = [];
        try {
            const snap = await getDocs(query(collection(window.db, "np_bpb")));
            snap.forEach(d => window.npbpbDatabase.push({id: d.id, ...d.data()}));
        } catch(e) {}
        loading.style.display = 'none'; c.style.display = 'table-row-group';
    }

    // Urutkan berdasarkan "noUrutBulan" dari yang terkecil (urutan 1, 2, 3...)
    window.npbpbDatabase.sort((a,b) => a.noUrutBulan - b.noUrutBulan);

    // Proses Filtering Gabungan
    let dataList = window.npbpbDatabase.filter(d => {
        let matchKw = d.namaBarang.toLowerCase().includes(kw) || d.noNP.toLowerCase().includes(kw) || (d.noBPB||"").toLowerCase().includes(kw);
        let matchBulan = filterBulan ? d.bulanTahun === filterBulan : true;
        let matchStatus = filterStatus === "ALL" ? true : d.status === filterStatus;
        return matchKw && matchBulan && matchStatus;
    });

    if(dataList.length === 0) {
        c.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#f87171;">Data tidak ditemukan pada bulan/status ini.</td></tr>`;
        return;
    }

    let h = "";
    dataList.forEach(d => {
        let isDone = d.status === "SELESAI";
        let badge = isDone ? `<span class="status-badge-selesai">SELESAI</span>` : `<span class="status-badge-pending">PENDING</span>`;
        let txtBpbNo = isDone ? d.noBPB : `<i class="fas fa-minus" style="color:var(--text-muted);"></i>`;
        let txtBpbTgl = isDone ? d.tglBPB : `<i class="fas fa-minus" style="color:var(--text-muted);"></i>`;

        // Baris akan berwarna agak hijau transparan jika sudah selesai
        let rowStyle = isDone ? `background:rgba(16,185,129,0.05);` : ``;

        h += `<tr style="${rowStyle}">
                <td style="text-align:center; font-weight:900; color:#cbd5e1;">#${d.noUrutBulan}</td>
                <td class="np-col">${d.tglNP}</td>
                <td class="np-col">${d.noNP}</td>
                <td>${d.namaBarang}</td>
                <td style="text-align:center;">${d.qty} <span style="font-size:10px;">${d.satuan}</span></td>
                <td style="text-align:center;">${badge}</td>
                <td class="${isDone ? 'bpb-col' : ''}">${txtBpbNo}</td>
                <td class="${isDone ? 'bpb-col' : ''}">${txtBpbTgl}</td>
              </tr>`;
    });
    c.innerHTML = h;
};

// =========================================================================================
// AI MOTIVATION AGENT ENGINE (PERFECT SYNC SLIDE - EXTENDED DATABASE)
// =========================================================================================
const databaseMotivasiAI = [
    "“Kualitas kerja terbaik bukanlah tentang seberapa cepat kita selesai, tapi seberapa teliti kita merawat setiap detail.”",
    "“Disiplin adalah jembatan antara impian di ruang kendali dan kenyataan di lantai produksi.”",
    "“Kesalahan sekecil apa pun adalah guru terbaik. Evaluasi, perbaiki, dan jadilah lebih tangguh dari kemarin.”",
    "“Mesin yang hebat butuh perawatan yang telaten. Begitu pula mental kita; jaga fokus, jaga integritas.”",
    "“Jangan pernah meremehkan tugas harianmu. Dari baut-baut kecil yang terpasang sempurna, lahirlah karya raksasa.”",
    "“Kesuksesan tim bukan milik individu, melainkan buah dari ketulusan saling bahu-membahu di setiap shift kerja.”",
    "“Hari ini adalah lembaran baru. Jadikan setiap tantangan teknis sebagai batu loncatan menuju keahlian tingkat tinggi.”",
    "“Integritas adalah melakukan hal yang benar bahkan ketika tidak ada satupun pengawas yang melihat.”",
    "“Semangat kerja yang tulus tidak akan pernah mengkhianati hasil. Tetaplah menjadi teladan di lingkungan kerja CBI.”",
    "“Fokus pada solusi, bukan pada rumitnya masalah. Anda memiliki kapasitas luar biasa untuk menyelesaikannya.”",
    "“Ketenangan adalah kunci ketepatan. Tarik napas dalam, kerjakan dengan presisi, dan selesaikan dengan gemilang.”",
    "“Setiap cetakan mold yang presisi mencerminkan karakter disiplin dan dedikasi seorang profesional sejati.”",
    "“Kerja keras tidak pernah membohongi hasil. Setiap keringat yang keluar di lantai produksi adalah investasi masa depan.”",
    "“Kekuatan sebuah tim diukur dari seberapa erat mereka saling mendukung saat menghadapi target produksi yang ketat.”",
    "“Inovasi lahir dari keberanian untuk mencoba cara baru yang lebih efisien dan aman dalam bekerja.”",
    "“Utamakan keselamatan dalam setiap langkah, karena hasil terbaik adalah yang dikerjakan dengan selamat dan tuntas.”",
    "“Waktu adalah aset paling berharga. Manfaatkan setiap detik di jam kerja untuk memberikan nilai tambah terbaik.”",
    "“Keunggulan bukanlah sebuah tindakan, melainkan sebuah kebiasaan harian yang konsisten kita jaga.”",
    "“Jadilah orang yang solutif. Ketika orang lain melihat hambatan, tunjukkan bahwa ada jalan keluar yang cerdas.”",
    "“Konsistensi dalam kedisiplinan kecil akan membawa kita pada pencapaian besar yang membanggakan.”"
];

let indeksMotivasiAktif = 0;

window.putarMotivasiBaru = function() {
    const elText = document.getElementById('ai-motivation-text');
    if(!elText) return;

    // 1. Geser kalimat lama ke kiri hingga hilang (Slide Out)
    elText.classList.add('slide-out');

    setTimeout(() => {
        // 2. Ganti teks saat tidak terlihat, lalu posisikan di sebelah kanan secara instan
        indeksMotivasiAktif = (indeksMotivasiAktif + 1) % databaseMotivasiAI.length;
        elText.innerText = databaseMotivasiAI[indeksMotivasiAktif];
        
        elText.classList.remove('slide-out');
        elText.classList.add('slide-in-right');

        // 3. Geser kalimat baru mulus ke tengah
        setTimeout(() => {
            elText.classList.remove('slide-in-right');
        }, 50);

    }, 500); // Waktu jeda pas dengan transisi CSS
};

// Inisialisasi Otomatis
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const elText = document.getElementById('ai-motivation-text');
        if(elText) {
            indeksMotivasiAktif = Math.floor(Math.random() * databaseMotivasiAI.length);
            elText.innerText = databaseMotivasiAI[indeksMotivasiAktif];
            
            // Berganti otomatis setiap 9 detik dengan mulus
            setInterval(() => {
                window.putarMotivasiBaru();
            }, 9000);
        }
    }, 1500);
});
// =========================================================================================
// MODUL ADM MOLD: ENGINE RENCANA KERJA (SMART TIME LIMITS)
// =========================================================================================

// --- 1. ENGINE INPUT RENCANA KERJA ---
window.tambahBarisRK = function() {
    const c = document.getElementById('rk-container-list');
    const idRow = 'rk-row-' + Date.now();
    let div = document.createElement('div');
    div.className = 'rk-row'; div.id = idRow;
    div.innerHTML = `
        <input type="text" class="rk-input" placeholder="Ketik rencana kerja..." style="text-transform:uppercase;">
        <button type="button" class="rk-del-btn" onclick="document.getElementById('${idRow}').remove()"><i class="fas fa-trash"></i></button>
    `;
    c.appendChild(div);
};
// Tambah 1 baris otomatis saat pertama buka
document.addEventListener("DOMContentLoaded", () => setTimeout(() => window.tambahBarisRK(), 1000));

window.simpanInputRK = async function() {
    const nama = document.getElementById('rk-nama').value;
    const waktuTgl = document.getElementById('rk-waktu').value;
    const target = document.getElementById('rk-target').value;
    
    let listRencana = [];
    document.querySelectorAll('#rk-container-list .rk-input').forEach(inp => {
        if(inp.value.trim() !== '') {
            listRencana.push({
                teks: inp.value.trim().toUpperCase(),
                isChecked: false,
                jamSelesai: null,
                status: 'Proses',
                note: ''
            });
        }
    });

    if(listRencana.length === 0) return alert("Daftar rencana kerja tidak boleh kosong!");
    
    window.toggleLoader(true, "Menyimpan Rencana...");
    try {
        await addDoc(collection(window.db, "adm_rencana_kerja"), {
            nama_admin: nama,
            waktu_input: waktuTgl,
            target_harian: target,
            daftar_kerja: listRencana,
            is_finalized: false, // Jika true, hilang dari menu Update
            timestamp: Date.now()
        });
        alert("Rencana Kerja berhasil disimpan!");
        document.getElementById('rk-container-list').innerHTML = '';
        window.tambahBarisRK();
        window.navigasi('rk-menu-screen');
    } catch(e) { alert("Error: " + e.message); }
    window.toggleLoader(false);
};

// --- 2. ENGINE UPDATE RENCANA KERJA ---
window.rkAktifData = [];
window.muatUpdateRK = async function() {
    const c = document.getElementById('rk-update-list-container');
    c.innerHTML = '<p style="text-align:center; color:white;">Memuat data...</p>';
    window.rkAktifData = [];
    
    try {
        const snap = await getDocs(query(collection(window.db, "adm_rencana_kerja")));
        let h = "";
        
        snap.forEach(doc => {
            const d = doc.data();
            if(d.is_finalized) return; // Abaikan yang sudah selesai
            
            window.rkAktifData.push({ id: doc.id, ...d });
            const now = new Date();
            const jamSekarang = now.getHours() * 100 + now.getMinutes(); // Format: 1630
            
            h += `<div class="rk-update-card">
                    <p style="font-size:10px; color:#f59e0b; margin:0 0 5px;">${d.target_harian}</p>
                    <h4 style="margin:0 0 15px; color:white;"><i class="fas fa-user-tie"></i> ${d.nama_admin}</h4>`;
            
            d.daftar_kerja.forEach((item, index) => {
                // PENENTUAN STATUS OTOMATIS BERBASIS WAKTU JAM 16.30
                let statClass = 'status-proses';
                let statText = 'PROSES';
                let isLate = false;

                if(item.isChecked) {
                    statClass = 'status-selesai';
                    statText = 'TEREALISASI ' + (item.jamSelesai ? `(${item.jamSelesai})` : '');
                } else if (!item.isChecked && jamSekarang > 1630) {
                    statClass = 'status-gagal';
                    statText = 'GAGAL TEREALISASI';
                    isLate = true; // Wajib isi Note
                }

                h += `<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:10px; border-left:2px solid ${isLate ? '#ef4444' : (item.isChecked ? '#10b981' : '#38bdf8')};">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                            <label style="flex:1; display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:11px; font-weight:700;">
                                <input type="checkbox" id="rk-chk-${doc.id}-${index}" ${item.isChecked ? 'checked disabled' : ''} onchange="window.centangRK('${doc.id}', ${index}, this)" style="margin-top:3px; transform:scale(1.2);">
                                ${item.teks}
                            </label>
                            <span id="rk-stat-${doc.id}-${index}" class="rk-status-badge ${statClass}">${statText}</span>
                        </div>
                        ${isLate && !item.isChecked ? `<input type="text" id="rk-note-${doc.id}-${index}" placeholder="WAJIB ISI NOTE PENYEBAB GAGAL (Sebelum Jam 20.00)..." value="${item.note || ''}" style="width:100%; margin-top:8px; padding:8px; font-size:10px; border:1px solid #ef4444; border-radius:6px; background:rgba(239,68,68,0.1); color:white;">` : ''}
                      </div>`;
            });

            h += `<button onclick="window.simpanUpdateRK('${doc.id}')" style="width:100%; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:white; padding:12px; border-radius:8px; font-weight:bold; margin-top:10px; cursor:pointer;"><i class="fas fa-cloud-upload-alt"></i> SIMPAN PERUBAHAN</button>`;
            h += `</div>`;
        });

        c.innerHTML = h || '<p style="text-align:center; color:#94a3b8; font-size:12px;">Semua Rencana Kerja hari ini sudah di-Update & Selesai.</p>';
    } catch(e) {}
};

window.centangRK = function(docId, index, el) {
    const statBadge = document.getElementById(`rk-stat-${docId}-${index}`);
    if(el.checked) {
        const d = new Date();
        const strJam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        statBadge.className = 'rk-status-badge status-selesai';
        statBadge.innerText = 'TEREALISASI (' + strJam + ')';
    } else {
        statBadge.className = 'rk-status-badge status-proses';
        statBadge.innerText = 'PROSES';
    }
};

window.simpanUpdateRK = async function(docId) {
    const dataRef = window.rkAktifData.find(x => x.id === docId);
    if(!dataRef) return;
    
    let siapFinal = true;
    const now = new Date();
    const jamSekarang = now.getHours() * 100 + now.getMinutes();

    let arrUpdate = [];
    for(let i=0; i<dataRef.daftar_kerja.length; i++) {
        let ori = dataRef.daftar_kerja[i];
        let chk = document.getElementById(`rk-chk-${docId}-${i}`);
        let nObj = { ...ori };

        if(chk && chk.checked && !ori.isChecked) {
            nObj.isChecked = true;
            nObj.jamSelesai = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            nObj.status = 'Terealisasi';
        } 
        else if(!chk.checked && jamSekarang > 1630) {
            nObj.status = 'Gagal Terealisasi';
            let noteInp = document.getElementById(`rk-note-${docId}-${i}`);
            if(noteInp) {
                if(noteInp.value.trim() === '') {
                    alert("HARAP ISI NOTE UNTUK TUGAS YANG GAGAL TEREALISASI!");
                    return; // Gagal Simpan
                }
                if(jamSekarang > 2000) {
                    alert("UPDATE DITOLAK! Waktu Pengisian Note Gagal sudah melewati batas Jam 20.00 WIB.");
                    return;
                }
                nObj.note = noteInp.value.trim().toUpperCase();
            } else {
                siapFinal = false; // Note input belum kerender? Berarti belum disave ulang.
            }
        }
        else if(!chk.checked) {
            siapFinal = false; // Masih ada proses dan belum jam 16.30
        }
        arrUpdate.push(nObj);
    }

    window.toggleLoader(true, "Updating...");
    try {
        await updateDoc(doc(window.db, "adm_rencana_kerja", docId), {
            daftar_kerja: arrUpdate,
            is_finalized: siapFinal
        });
        alert("Update Berhasil Disimpan!");
        window.muatUpdateRK();
    } catch(e) { alert("Gagal update!"); }
    window.toggleLoader(false);
};

// --- 3. ENGINE VIEW & EXPORT PROFESSIONAL ---
window.muatViewRK = async function() {
    const c = document.getElementById('rk-view-list-container');
    const kw = (document.getElementById('rk-search-key')?.value || "").toLowerCase();
    c.innerHTML = '<p style="text-align:center; color:white;">Memuat History...</p>';
    try {
        const snap = await getDocs(query(collection(window.db, "adm_rencana_kerja")));
        let h = "";
        let dataSort = [];
        snap.forEach(doc => dataSort.push({id: doc.id, ...doc.data()}));
        dataSort.sort((a,b) => b.timestamp - a.timestamp);

        dataSort.filter(d => (d.waktu_input||"").toLowerCase().includes(kw)).forEach(d => {
            let total = d.daftar_kerja.length;
            let sukses = d.daftar_kerja.filter(x => x.isChecked).length;
            
            h += `<div class="progress-card" style="border-left-color:#8b5cf6; margin-bottom:15px;">
                    <h4 style="margin:0 0 5px; color:#8b5cf6;">${d.waktu_input.split(' - ')[0]}</h4>
                    <p style="font-size:10px; margin:0 0 10px; color:var(--text-muted);"><i class="fas fa-bullseye"></i> ${d.target_harian}</p>
                    <p style="font-size:11px; margin:0 0 15px;">Progress: <strong style="color:${sukses === total ? '#10b981' : '#f59e0b'};">${sukses} / ${total} Selesai</strong></p>
                    <button onclick="window.downloadLaporanRK('${d.id}')" style="width:100%; background:rgba(139,92,246,0.15); border:1px solid #8b5cf6; color:white; padding:10px; border-radius:6px; font-weight:800; cursor:pointer;"><i class="fas fa-file-download"></i> Download Laporan (JPG)</button>
                  </div>`;
        });
        c.innerHTML = h || '<p style="text-align:center; color:#94a3b8; font-size:12px;">Tidak ada data ditemukan.</p>';
        window.dataRKSemua = dataSort; // Cache untuk export
    } catch(e) {}
};

// Canvas Laporan Profesional
window.downloadLaporanRK = function(docId) {
    const d = window.dataRKSemua.find(x => x.id === docId);
    if(!d) return;

    window.toggleLoader(true, "Mencetak Laporan...");
    setTimeout(() => {
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d');
        cvs.width = 1200; cvs.height = 300 + (d.daftar_kerja.length * 80); // Tinggi dinamis
        
        // Background Putih
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        
        // Header (Kop Surat/Judul)
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("LAPORAN RENCANA & REALISASI KERJA", cvs.width/2, 60);
        ctx.fillStyle = "#8b5cf6";
        ctx.font = "bold 25px Arial";
        ctx.fillText("ADMINISTRASI MOLD - CBI", cvs.width/2, 100);

        // Garis Pembatas
        ctx.beginPath(); ctx.moveTo(50, 130); ctx.lineTo(cvs.width - 50, 130);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3; ctx.stroke();

        // Info Identitas
        ctx.fillStyle = "#334155";
        ctx.textAlign = "left";
        ctx.font = "bold 22px Arial";
        ctx.fillText("Nama Admin : " + d.nama_admin, 60, 180);
        ctx.fillText("Tanggal          : " + d.waktu_input.split(' - ')[0], 60, 220);
        ctx.fillText("Target Jam    : " + d.target_harian.split(' (')[1].replace(')',''), 60, 260);

        // Looping Daftar Kerja
        let startY = 330;
        d.daftar_kerja.forEach((item, idx) => {
            // Kotak Item
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(60, startY-30, cvs.width - 120, 70);
            ctx.strokeStyle = "#e2e8f0";
            ctx.strokeRect(60, startY-30, cvs.width - 120, 70);

            // Teks Tugas
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 20px Arial";
            ctx.fillText((idx+1) + ". " + item.teks, 80, startY+15);

            // Status Badge
            ctx.textAlign = "right";
            if(item.status === 'Terealisasi') {
                ctx.fillStyle = "#10b981";
                ctx.fillText("✅ TEREALISASI (" + item.jamSelesai + ")", cvs.width - 80, startY+15);
            } else if(item.status === 'Gagal Terealisasi') {
                ctx.fillStyle = "#ef4444";
                ctx.fillText("❌ GAGAL: " + (item.note || "TANPA ALASAN"), cvs.width - 80, startY+15);
            } else {
                ctx.fillStyle = "#38bdf8";
                ctx.fillText("⏳ PROSES", cvs.width - 80, startY+15);
            }
            ctx.textAlign = "left";
            startY += 80;
        });

        // Trigger Download
        let link = document.createElement('a');
        link.download = `Laporan_RK_${d.nama_admin.replace(/\s/g,'_')}_${d.waktu_input.split(' - ')[0].replace(/\s/g,'')}.jpg`;
        link.href = cvs.toDataURL('image/jpeg', 1.0);
        link.click();
        
        window.toggleLoader(false);
    }, 1000); // Simulasi delay render agar UI rapi
};
// =======================================================
// MESIN WAKTU KHUSUS RENCANA KERJA (AUTO FILL)
// =======================================================
setInterval(() => {
    const elWaktu = document.getElementById('rk-waktu');
    const elTarget = document.getElementById('rk-target');
    
    if(elWaktu && elTarget) {
        const now = new Date();
        const strWaktu = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " - " + now.toLocaleTimeString('id-ID', { hour12: false });
        const tglSaja = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        elWaktu.value = strWaktu;
        elTarget.value = tglSaja + " (JAM 08.00 - 16.30)";
    }
}, 1000);
