/* ============================================================
   HWM · الأجهزة الطرفية — نماذج تفصيلية
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const ph = (H.ph = H.ph || {});
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, screw = u.screw, decal = u.decal, fan = u.fan, cable = u.cable;
  const tag = H.hotspot;

  function woodTex() {
    if (H.tex.woodgrain) return H.tex.woodgrain;
    const W = 512, Hh = 512, c = H.canvas(W, Hh), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#3a2a1e"); g.addColorStop(0.5, "#5b4230"); g.addColorStop(1, "#33251a");
    x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 70; i++) {
      x.strokeStyle = "rgba(25,15,8," + (0.05 + Math.random() * 0.16).toFixed(3) + ")";
      x.lineWidth = 1 + Math.random() * 4;
      x.beginPath();
      const y0 = Math.random() * Hh;
      x.moveTo(0, y0);
      for (let px = 0; px <= W; px += 32) x.lineTo(px, y0 + Math.sin(px * 0.02 + i) * 8 + (Math.random() - .5) * 5);
      x.stroke();
    }
    H.tex.woodgrain = H.finishTex(c, { srgb: true, repeat: [1, 1] });
    return H.tex.woodgrain;
  }

  /* ============================================================
     الشاشة 27 بوصة
     ============================================================ */
  function buildMonitor(opts) {
    opts = opts || {};
    const g = new T.Group(); g.name = "monitor";
    const W = 6.15, Hh = 3.55;
    // قاعدة
    rbox(g, 2.35, 0.07, 1.45, 0.03, M.aluminumBlack, 0, 0.035, 0.28);
    box(g, 2.1, 0.02, 1.2, M.steelDark, 0, 0.073, 0.28, { cast: false });
    // عمود
    const neck = new T.Group(); neck.position.set(0, 0.08, 0.18); neck.rotation.x = -0.05; g.add(neck);
    box(neck, 0.3, 1.5, 0.14, M.aluminum, 0, 0.75, 0);
    box(neck, 0.18, 1.2, 0.17, M.metalDark, 0, 0.7, 0.02);
    for (let i = 0; i < 7; i++) box(neck, 0.22, 0.025, 0.02, M.plasticBlack, 0, 0.3 + i * 0.09, 0.11, { cast: false });
    tag(neck, "حامل الشاشة", "حامل معدني قابل لضبط الارتفاع والميل؛ مرّر الكابلات داخل العمود لإخفائها.");
    // اللوحة
    const panel = new T.Group(); panel.position.set(0, 3.45, 0); g.add(panel);
    rbox(panel, W + 0.1, Hh + 0.08, 0.16, 0.05, M.plasticBlack, 0, 0, 0);
    // حافة معدنية رقيقة
    box(panel, W + 0.12, 0.025, 0.17, M.steel, 0, Hh / 2 + 0.03, 0.005, { cast: false });
    box(panel, W + 0.12, 0.025, 0.17, M.steel, 0, -Hh / 2 - 0.03, 0.005, { cast: false });
    // الشاشة
    const screenTex = H.screenWallpaper(17, "NOVA VIEW  ·  27\" 4K  ·  144Hz");
    const scr = add(panel, new T.PlaneGeometry(W - 0.12, Hh - 0.14), new T.MeshBasicMaterial({ map: screenTex, toneMapped: false }), 0, 0, 0.107, { cast: false, receive: false });
    add(panel, new T.PlaneGeometry(W - 0.1, Hh - 0.12), M.screenGlare, 0, 0, 0.113, { cast: false, receive: false });
    // ظهر اللوحة وتفاصيل
    rbox(panel, W - 0.5, Hh - 0.5, 0.18, 0.06, M.metalDark, 0, 0, -0.15);
    for (let i = 0; i < 11; i++) box(panel, W - 1.1, 0.02, 0.02, M.plasticBlack, 0, Hh / 2 - 0.3 - i * 0.12, -0.25, { cast: false });
    const joystick = new T.Group(); joystick.position.set(0.9, -Hh / 2 + 0.15, 0.09); panel.add(joystick);
    cyl(joystick, 0.035, 0.035, 0.03, 12, M.steelDark, 0, 0, 0, { rx: Math.PI / 2 });
    // منافذ خلفية
    const ports = new T.Group(); ports.position.set(-1.7, -0.55, -0.2); panel.add(ports);
    box(ports, 0.6, 0.18, 0.12, M.plasticBlack, 0, 0, 0);
    box(ports, 0.16, 0.07, 0.1, M.steelDark, -0.16, 0.03, -0.05);
    box(ports, 0.13, 0.06, 0.1, M.plasticBlack, 0.05, 0.03, -0.05);
    box(ports, 0.1, 0.05, 0.1, M.plasticBlack, 0.22, 0.03, -0.05);
    decal(ports, "DP 1.4  ·  HDMI 2.1  ·  USB-C 90W", 0.5, 0.035, 0, -0.06, -0.11, { fontSize: 16, color: "#7d8a95", ry: Math.PI });
    tag(panel, "لوحة IPS/OLED", "27 بوصة بدقة 4K ومعدل 144Hz؛ تغطي 99% من sRGB وتناسب التصميم والألعاب.");
    tag(ports, "منافذ الشاشة", "DisplayPort وHDMI وUSB-C بشحن 90W؛ USB-C واحد ينقل الصورة والبيانات والكهرباء للابتوب.");
    // شعار
    decal(panel, "NOVA", 0.4, 0.1, 0, -Hh / 2 + 0.035, 0.108, { fontSize: 46, color: "#68737d" });
    // كابلات
    cable(g, [[-1.7, 2.9, -0.26], [-2.0, 2.3, -0.1], [-2.35, 1.0, 0.2], [-2.2, 0.1, 0.6]], 0.032, M.sleeve, { seg: 22 });
    cable(g, [[-1.55, 2.9, -0.26], [-1.75, 2.0, -0.05], [-2.0, 0.9, 0.25], [-1.9, 0.08, 0.5]], 0.028, M.cableBlue, { seg: 22 });
    H.ticks(g);
    return g;
  }
  ph.monitor = buildMonitor;
  H.register("monitor", buildMonitor);

  /* ============================================================
     لوحة مفاتيح ميكانيكية TKL — مفاتيح فردية
     ============================================================ */
  function keyLegend(main, sub, accent) {
    const key = "key_" + main + "_" + (sub || "") + (accent ? "_a" : "");
    if (H.tex[key]) return H.tex[key];
    const W = 256, Hh = 128, c = H.canvas(W, Hh), x = c.getContext("2d");
    x.clearRect(0, 0, W, Hh);
    x.textAlign = "center"; x.textBaseline = "middle";
    const col = accent ? "#1a0e04" : "#e4ebf3";
    x.fillStyle = col;
    const isLong = main.length > 2;
    x.font = "700 " + (isLong ? 38 : 52) + "px 'Segoe UI', Arial";
    x.fillText(main, W / 2, sub ? 48 : 66);
    if (sub) {
      x.fillStyle = accent ? "rgba(40,20,4,.8)" : "#9db3c2";
      x.font = "500 32px 'Segoe UI', Tahoma, Arial";
      x.fillText(sub, W / 2, 92);
    }
    H.tex[key] = H.finishTex(c, { srgb: true });
    return H.tex[key];
  }
  function buildKeyboard(opts) {
    opts = opts || {};
    const g = new T.Group(); g.name = "keyboard";
    const U = 0.22, GAP = 0.025, baseTop = 0.2;
    // قاعدة ألمنيوم
    rbox(g, 4.85, 0.16, 1.78, 0.045, M.aluminumBlack, 0, 0.09, 0);
    box(g, 4.75, 0.025, 1.68, M.plate, 0, 0.177, 0, { cast: false });
    // شريط RGB
    box(g, 4.65, 0.018, 0.02, M.ledCyan, 0, 0.13, 0.865, { cast: false, receive: false });
    box(g, 0.02, 0.018, 1.6, M.ledCyan, -2.35, 0.13, 0, { cast: false, receive: false });
    box(g, 0.02, 0.018, 1.6, M.ledCyan, 2.35, 0.13, 0, { cast: false, receive: false });
    decal(g, "NOVA  TKL  ·  87", 0.55, 0.05, 1.7, 0.14, 0.9, { fontSize: 26, color: "#82909c" });
    // أرجل
    [[-2.1, -0.7], [2.1, -0.7], [-2.1, 0.7], [2.1, 0.7]].forEach(function (p) {
      box(g, 0.2, 0.04, 0.14, M.rubber, p[0], 0.02, p[1]);
    });
    // موصل USB-C
    const usb = new T.Group(); usb.position.set(0, 0.12, -0.93); g.add(usb);
    box(usb, 0.18, 0.08, 0.08, M.plasticBlack, 0, 0, 0);
    box(usb, 0.12, 0.03, 0.02, M.gold, 0, 0, 0.045, { cast: false });
    cable(g, [[0, 0.12, -0.98], [-0.35, 0.06, -1.35], [-1.2, 0.03, -1.5], [-2.2, 0.03, -1.2]], 0.035, M.sleeve, { seg: 20 });
    tag(usb, "كابل USB-C", "كابل مجدول قابل للفصل؛ معدل استجابة 1000Hz يحتاج منفذاً مباشراً لا Hub رخيص.");
    // المفاتيح
    const keys = [];
    let escCap = null, escPos = null;
    function makeKey(x, z, wUnits, main, sub, accent, isEsc) {
      const kw = Math.max(0.12, wUnits * U - GAP);
      const cap = new T.Group(); cap.position.set(x, baseTop + 0.045, z); g.add(cap);
      const geo = u.boxGeo(kw, 0.13, U - GAP);
      // مكعب بحواف مشطوفة عبر مكعبين
      rbox(cap, kw, 0.12, U - GAP, 0.028, accent ? M.ledAmber : M.keycap, 0, 0.06, 0);
      box(cap, kw * 0.92, 0.005, 0.14, M.plasticCharcoal, 0, 0.122, 0, { cast: false });
      const tex = keyLegend(main, sub, accent);
      const lm = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: 0xffffff });
      add(cap, new T.PlaneGeometry(kw * 0.96, 0.2), lm, 0, 0.124, 0, { rx: -Math.PI / 2, cast: false, receive: false });
      keys.push(cap);
      if (isEsc) { escCap = cap; escPos = { x: x, z: z }; }
      return cap;
    }
    const rows = [
      { z: -0.55, keys: [["Esc", 1, "", true], ["F1", 1, ""], ["F2", 1, ""], ["F3", 1, ""], ["F4", 1, ""], ["F5", 1, ""], ["F6", 1, ""], ["F7", 1, ""], ["F8", 1, ""], ["F9", 1, ""], ["F10", 1, ""], ["F11", 1, ""], ["F12", 1, ""], ["PrtSc", 1, ""], ["Del", 1, ""]] },
      { z: -0.32, keys: [["~", 1, ""], ["1", 1, "!"], ["2", 1, "@"], ["3", 1, "#"], ["4", 1, "$"], ["5", 1, "%"], ["6", 1, "^"], ["7", 1, "&"], ["8", 1, "*"], ["9", 1, "("], ["0", 1, ")"], ["-", 1, "_"], ["=", 1, "+"], ["Backspace", 2, ""]] },
      { z: -0.09, keys: [["Tab", 1.5, ""], ["Q", 1, "ض"], ["W", 1, "ص"], ["E", 1, "ث"], ["R", 1, "ق"], ["T", 1, "ف"], ["Y", 1, "غ"], ["U", 1, "ع"], ["I", 1, "ه"], ["O", 1, "خ"], ["P", 1, "ح"], ["[", 1, "{"], ["]", 1, "}"], ["\\", 1.5, "|"]] },
      { z: 0.14, keys: [["Caps", 1.75, ""], ["A", 1, "ش"], ["S", 1, "س"], ["D", 1, "ي"], ["F", 1, "ب"], ["G", 1, "ل"], ["H", 1, "ا"], ["J", 1, "ت"], ["K", 1, "ن"], ["L", 1, "م"], [";", 1, ":"], ["'", 1, "\""], ["Enter", 2.25, ""]] },
      { z: 0.37, keys: [["Shift", 2.25, ""], ["Z", 1, "ئ"], ["X", 1, "ء"], ["C", 1, "ؤ"], ["V", 1, "ر"], ["B", 1, "لا"], ["N", 1, "ى"], ["M", 1, "ة"], [",", 1, "<"], [".", 1, ">"], ["/", 1, "؟"], ["Shift", 2.75, ""]] },
      { z: 0.6, keys: [["Ctrl", 1.25, ""], ["Win", 1.25, ""], ["Alt", 1.25, ""], ["", 6.25, ""], ["Alt", 1.25, ""], ["Fn", 1.25, ""], ["Menu", 1.25, ""], ["Ctrl", 1.25, ""]] }
    ];
    rows.forEach(function (row, ri) {
      let cx = -2.2;
      row.keys.forEach(function (k) {
        const main = k[0], w = k[1], sub = k[2];
        const accent = main === "Esc";
        if (main === "") {
          // مسافة
          makeKey(cx + (w * U) / 2 - U / 2 + GAP / 2, row.z, w, "SPACE", "", false);
        } else {
          makeKey(cx + (w * U) / 2 - U / 2 + GAP / 2, row.z, w, main, sub, accent, main === "Esc");
        }
        cx += w * U;
      });
    });
    // مجموعة التنقل والأسهم
    const nav = [
      ["Ins", 1.5, -0.32], ["Home", 1.8, -0.32], ["PgUp", 2.1, -0.32],
      ["Del", 1.5, -0.09], ["End", 1.8, -0.09], ["PgDn", 2.1, -0.09],
      ["↑", 1.8, 0.37], ["←", 1.5, 0.6], ["↓", 1.8, 0.6], ["→", 2.1, 0.6]
    ];
    nav.forEach(function (k) {
      makeKey(k[1], k[2], 1, k[0], "", false);
    });
    // مفتاح Esc مرفوع قليلاً + مفتاح ميكانيكي تحته
    if (escCap) {
      const sw = new T.Group(); sw.position.set(escPos.x, 0.13, escPos.z); g.add(sw);
      box(sw, 0.15, 0.1, 0.15, M.plasticCharcoal, 0, 0, 0);
      box(sw, 0.13, 0.02, 0.13, M.glassDark, 0, 0.07, 0, { cast: false });
      box(sw, 0.04, 0.09, 0.04, M.steelDark, 0, 0.1, 0, { cast: false });
      box(sw, 0.1, 0.025, 0.035, M.gold, 0, 0.13, 0, { cast: false });
      H.explode(g, escCap, 0, 0.32, 0);
      tag(sw, "مفتاح ميكانيكي", "سويتش ميكانيكي تحت كل مفتاح: نابض معدني ونقطتا تلامس؛ عمر 50-100 مليون ضغطة.");
      tag(escCap, "غطاء المفتاح", "غطاء PBT مزدوج الحقن لا يبهت؛ شكل محدب ومسافة 4mm لضغطة مريحة.");
    }
    tag(g, "لوحة المفاتيح الميكانيكية", "87 مفتاحاً، هيكل ألمنيوم، وإضاءة لكل مفتاح؛ كل ضغطة تُسجل قبل أن يكمل المفتاح نزوله.");
    // مفاتيح إضافية/زخرفة
    decal(g, "MECHANICAL", 0.55, 0.04, -1.4, 0.14, 0.9, { fontSize: 24, color: "#7e8b96" });
    H.ticks(g);
    return g;
  }
  ph.keyboard = buildKeyboard;
  H.register("keyboard", buildKeyboard);

  /* ============================================================
     ماوس ألعاب — جسم منحني مخصص
     ============================================================ */
  function mouseDome() {
    const N = 26, SEG = 64, rx = 0.58, rz = 1.0, hh = 0.52;
    const pos = [], idx = [];
    pos.push(0, hh * 1.02, -0.1);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      for (let j = 0; j < SEG; j++) {
        const a = (j / SEG) * Math.PI * 2;
        const x = Math.cos(a) * rx * t;
        const z = Math.sin(a) * rz * t - 0.06;
        const profile = Math.pow(Math.max(0, Math.cos(t * Math.PI / 2)), 0.72);
        const rear = 0.78 + 0.34 * (0.5 - z / (rz * 2));
        let y = hh * profile * rear + 0.06;
        if (z > 0.55) y -= (z - 0.55) * 0.16;
        pos.push(x, y, z);
      }
    }
    const ringStart = 1;
    for (let j = 0; j < SEG; j++) {
      idx.push(0, ringStart + ((j + 1) % SEG), ringStart + j);
    }
    for (let i = 0; i < N - 1; i++) {
      const a = ringStart + i * SEG, b = a + SEG;
      for (let j = 0; j < SEG; j++) {
        const j2 = (j + 1) % SEG;
        idx.push(a + j, a + j2, b + j2);
        idx.push(a + j, b + j2, b + j);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }
  function buildMouse() {
    const g = new T.Group(); g.name = "mouse";
    // مسند/سطح
    rbox(g, 1.7, 0.05, 2.3, 0.06, M.stage, 0, 0.025, 0);
    box(g, 1.5, 0.008, 2.0, M.ledCyan, 0, 0.052, 0, { cast: false });
    // جسم
    const body = new T.Group(); body.position.set(0, 0.07, 0); g.add(body);
    const dome = add(body, mouseDome(), new T.MeshStandardMaterial({ color: 0x171b21, roughness: 0.42, metalness: 0.12, bumpMap: M.noise, bumpScale: 0.004 }), 0, 0, 0, { cast: true });
    tag(dome, "هيكل ماوس إيرغونوميك", "شكل منحني يدعم راحة اليد ويقلل إجهاد الرسغ؛ الطبقة الخارجية مقاومة للعرق.");
    // قاعدة
    rbox(body, 0.98, 0.08, 1.86, 0.08, M.plasticBlack, 0, 0.035, -0.02);
    // أزرار رئيسية
    [-1, 1].forEach(function (s) {
      const b = rbox(body, 0.42, 0.07, 0.62, 0.05, M.plasticCharcoal, s * 0.22, 0.35, 0.46);
      b.rotation.x = -0.36; b.rotation.z = s * -0.05;
      box(body, 0.4, 0.018, 0.02, M.ledCyan, s * 0.22, 0.39, 0.16, { cast: false, receive: false }).rotation.x = -0.36;
    });
    // عجلة التمرير
    const wheel = new T.Group(); wheel.position.set(0, 0.43, 0.36); body.add(wheel);
    const wheelMesh = cyl(wheel, 0.11, 0.11, 0.11, 24, M.rubber, 0, 0, 0, { rz: Math.PI / 2 });
    for (let i = 0; i < 9; i++) box(wheel, 0.13, 0.012, 0.014, M.plasticBlack, 0, 0, -0.09 + i * 0.022, { cast: false });
    tag(wheel, "عجلة التمرير", "عجلة مطاطية بترميز بصري دقيق؛ تدور بلا تلامس تقريباً وتدوم ملايين الدورات.");
    // زر DPI
    box(body, 0.13, 0.05, 0.1, M.plasticBlack, 0, 0.47, 0.05);
    // أزرار جانبية
    const side = new T.Group(); side.position.set(-0.58, 0.33, 0.28); side.rotation.z = -0.3; body.add(side);
    box(side, 0.06, 0.09, 0.22, M.plasticCharcoal, 0, 0, 0);
    box(side, 0.06, 0.09, 0.22, M.plasticCharcoal, 0, -0.11, 0.02);
    tag(side, "أزرار جانبية", "زران للإبهام قابلان للبرمجة (أوامر، ماكرو، تنقل)؛ توجد مسندة إبهام مطاطية أسفلهما.");
    // شعار RGB
    decal(body, "NOVA", 0.3, 0.1, 0, 0.46, -0.55, { rx: -Math.PI / 2, fontSize: 50, color: "#dff7ff", emissive: "#2bd9ff", emissiveIntensity: 1.2 });
    // كابل مجدول
    cable(g, [[0, 0.23, 0.95], [0, 0.1, 1.25], [-0.35, 0.06, 1.55], [-1.0, 0.05, 1.6]], 0.045, M.sleeve, { seg: 24 });
    box(g, 0.1, 0.07, 0.2, M.plasticBlack, 0, 0.18, 1.02);
    // وسادة قدم
    rbox(g, 1.6, 0.03, 2.2, 0.07, M.rubber, 0, 0.04, 0, { cast: false });
    tag(g, "ماوس احترافي", "مستشعر بصري 30K DPI، استجابة 0.125ms، و7 أزرار قابلة للبرمجة — سلاح اللاعبين.");
    return H.ticks(g);
  }
  ph.mouse = buildMouse;
  H.register("mouse", buildMouse);

  /* ============================================================
     طابعة ليزر + خرطوشة تونر
     ============================================================ */
  function documentTexture() {
    if (H.tex.doc) return H.tex.doc;
    const W = 512, Hh = 700, c = H.canvas(W, Hh), x = c.getContext("2d");
    x.fillStyle = "#f7f6f1"; x.fillRect(0, 0, W, Hh);
    x.fillStyle = "#1b1f24"; x.font = "700 28px 'Segoe UI', Arial"; x.fillText("NOVA LABS", 34, 58);
    x.font = "500 15px 'Segoe UI', Arial"; x.fillStyle = "#58616a";
    x.fillText("Computer Hardware / Field Report", 34, 84);
    x.fillStyle = "#0b6f8a"; x.fillRect(34, 110, 444, 4);
    x.fillStyle = "#2b3138"; x.font = "700 34px 'Segoe UI', Arial"; x.fillText("تشخيص أداء الجهاز", 34, 162);
    x.font = "500 16px 'Segoe UI', Tahoma, Arial"; x.direction = "rtl"; x.textAlign = "right"; x.fillStyle = "#4d555e";
    const lines = ["تم فحص المعالج والذاكرة وكرت الشاشة.", "درجة حرارة المعالج مستقرة عند 62 مئوية.", "سرعة القرص NVMe تتجاوز 12,000 ميجابايت/ث.", "لا توجد أخطاء في سجل النظام."];
    lines.forEach(function (l, i) { x.fillText(l, 478, 208 + i * 30); });
    x.textAlign = "left"; x.direction = "ltr";
    // جدول
    x.fillStyle = "#e3e7e9"; x.fillRect(34, 360, 444, 36);
    x.fillStyle = "#2b3138"; x.font = "700 15px 'Segoe UI', Arial";
    x.fillText("Component", 46, 384); x.fillText("Result", 250, 384); x.fillText("Status", 390, 384);
    const data = [["CPU  ·  16 Core", "4.9 GHz", "PASS"], ["Memory  ·  64GB", "6000 MT/s", "PASS"], ["GPU  ·  16GB", "62°C", "PASS"], ["Storage  ·  2TB", "12.4 GB/s", "PASS"]];
    data.forEach(function (r, i) {
      x.fillStyle = i % 2 ? "#f2f2ee" : "#ffffff"; x.fillRect(34, 400 + i * 34, 444, 34);
      x.fillStyle = "#3c444c"; x.font = "500 15px 'Segoe UI', Arial";
      x.fillText(r[0], 46, 423 + i * 34); x.fillText(r[1], 250, 423 + i * 34);
      x.fillStyle = "#0f8a5b"; x.fillText(r[2], 400, 423 + i * 34);
    });
    // مخطط بسيط
    x.strokeStyle = "#0b6f8a"; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i < 40; i++) {
      const px = 40 + i * 10, py = 650 - Math.sin(i * 0.4) * 34 - Math.cos(i * 0.13) * 18;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
    x.fillStyle = "#8c969e"; x.font = "500 13px 'Segoe UI', Arial"; x.fillText("Performance over 24h", 34, 680);
    H.tex.doc = H.finishTex(c, { srgb: true });
    return H.tex.doc;
  }
  function buildPrinter() {
    const g = new T.Group(); g.name = "printer";
    const W = 3.0, Hh = 1.6, D = 2.45;
    rbox(g, W, Hh, D, 0.07, M.plasticOffWhite, 0, Hh / 2 + 0.06, 0);
    rbox(g, W - 0.12, 0.08, D - 0.16, 0.04, M.plasticOffWhite, 0, Hh + 0.06, -0.02);
    // فتحة الخروج + درج الورق
    const out = new T.Group(); out.position.set(0, Hh + 0.03, 0.55); g.add(out);
    rbox(out, 2.1, 0.05, 0.9, 0.03, M.plasticGrey, 0, 0, 0);
    box(out, 1.9, 0.02, 0.7, M.plasticBlack, 0, 0.035, 0.02);
    // ورقة مطبوعة
    const paper = add(g, new T.PlaneGeometry(0.95, 1.25), new T.MeshStandardMaterial({ map: documentTexture(), roughness: 0.92, side: T.DoubleSide }), 0, Hh + 0.14, 0.72, { rx: -Math.PI / 2 + 0.5, cast: false, receive: false });
    tag(paper, "ورق مطبوع", "حبر التونر يُثبّت بالحرارة على الورق؛ أول ورقة بعد التشغيل قد تحتاج معايرة.");
    // درج الورق
    const tray = new T.Group(); tray.position.set(0, 0.32, 1.18); g.add(tray);
    box(tray, 2.1, 0.42, 0.2, M.plasticOffWhite, 0, 0, 0);
    box(tray, 1.9, 0.3, 0.02, M.plasticGrey, 0, 0, 0.11);
    for (let i = 0; i < 12; i++) box(tray, 1.5, 0.012, 0.12, M.paper, 0, 0.05 + i * 0.014, -0.02, { cast: false });
    box(tray, 0.4, 0.04, 0.04, M.plasticGrey, 0, 0.02, 0.14);
    tag(tray, "درج الورق", "يتسع 250 ورقة A4؛ اضبط أدلة العرض لمنع انحشار الورق.");
    // لوحة التحكم
    const ctrl = new T.Group(); ctrl.position.set(0.85, Hh + 0.13, 0.78); g.add(ctrl);
    rbox(ctrl, 0.85, 0.08, 0.35, 0.03, M.plasticCharcoal, 0, 0, 0);
    box(ctrl, 0.35, 0.02, 0.18, M.screen, -0.12, 0.05, 0);
    decal(ctrl, "READY", 0.3, 0.04, -0.12, 0.06, 0.095, { fontSize: 26, color: "#8fe3ff", emissive: "#2bd9ff", emissiveIntensity: 0.7 });
    const b = cyl(ctrl, 0.045, 0.045, 0.02, 16, M.ledGreen, 0.25, 0.05, 0.02, { cast: false });
    decal(ctrl, "NOVA  LASER 2400", 0.5, 0.04, -0.1, -0.01, 0.115, { fontSize: 21, color: "#8d98a2" });
    tag(ctrl, "لوحة التحكم", "شاشة صغيرة وأزرار للطباعة المزدوجة والواي فاي؛ كل الإعدادات اليومية من هنا.");
    // مفصلات وغلاف
    box(g, W - 0.1, 0.03, 0.04, M.plasticGrey, 0, 1.1, -1.2, { cast: false });
    for (let i = 0; i < 9; i++) box(g, 0.04, 0.12, 0.02, M.plasticGrey, -1.2 + i * 0.3, 0.5, D / 2 + 0.005, { cast: false });
    // فتحة خرطوشة
    const tdoor = new T.Group(); tdoor.position.set(0, 0.95, 1.23); g.add(tdoor);
    box(tdoor, 2.6, 0.55, 0.03, M.plasticOffWhite, 0, 0, 0);
    box(tdoor, 0.5, 0.04, 0.04, M.plasticGrey, 0, 0.18, 0.05);
    decal(tdoor, "TONER ACCESS", 0.6, 0.05, 0, 0.05, 0.03, { fontSize: 24, color: "#8e99a3" });
    const toner = new T.Group(); toner.position.set(0, 1.0, 0.55); g.add(toner);
    rbox(toner, 2.1, 0.38, 0.55, 0.08, M.plasticBlack, 0, 0, 0);
    cyl(toner, 0.2, 0.2, 0.3, 24, M.plasticCharcoal, 0.85, 0, 0, { rz: Math.PI / 2 });
    box(toner, 0.5, 0.18, 0.2, M.plasticGrey, -0.55, 0.05, 0.1);
    decal(toner, "NOVA  TONER  ·  BLACK  ·  6K", 0.9, 0.06, 0, 0.13, 0.28, { fontSize: 24, color: "#c2ccd4" });
    tag(toner, "خرطوشة التونر", "مسحوق حبر ناعم مع أسطوانة حساسة؛ تطبع ~6000 صفحة. لا تلمس الأسطوانة الخضراء.");
    H.explode(g, toner, 0, 0.2, 0.95);
    H.explode(g, tray, 0, 0, 0.35);
    // شبكة/USB خلفية
    const back = new T.Group(); back.position.set(0, 0.8, -1.24); g.add(back);
    box(back, 0.5, 0.2, 0.02, M.plasticCharcoal, 0, 0, 0);
    box(back, 0.16, 0.08, 0.02, M.plasticBlack, -0.12, 0, -0.02);
    box(back, 0.16, 0.08, 0.02, M.plasticBlack, 0.1, 0, -0.02);
    tag(back, "منافذ الطابعة", "USB-B وEthernet وWi-Fi؛ Ethernet أفضل للطباعة المشتركة في المكتب.");
    tag(g, "طابعة ليزر", "ليزر + تونر: أسرع وأرخص لكل صفحة من الحبر النفاث، والجودة حادة للنصوص.");
    H.ticks(g);
    return g;
  }
  ph.printer = buildPrinter;
  H.register("printer", buildPrinter);

  /* ============================================================
     ماسح ضوئي مسطح
     ============================================================ */
  function buildScanner() {
    const g = new T.Group(); g.name = "scanner";
    const W = 3.4, D = 2.35, Hh = 0.42;
    rbox(g, W, Hh, D, 0.05, M.plasticOffWhite, 0, Hh / 2 + 0.05, 0);
    // زجاج
    box(g, W - 0.35, 0.02, D - 0.35, M.screen, 0, 0.27, 0);
    box(g, W - 0.3, 0.012, D - 0.3, M.glass, 0, 0.29, 0, { cast: false });
    // ورقة على الزجاج
    const doc = add(g, new T.PlaneGeometry(1.3, 1.7), new T.MeshStandardMaterial({ map: documentTexture(), roughness: 0.9, side: T.DoubleSide }), 0.15, 0.3, 0, { rx: -Math.PI / 2, cast: false, receive: false });
    // شريط المسح الضوئي
    box(g, 0.08, 0.02, D - 0.45, M.ledCyan, -1.2, 0.295, 0, { cast: false, receive: false });
    tag(doc, "المستند", "يُوضع وجهه للأسفل على الزجاج، مع محاذاة الحواف لتقليل القص.");
    // رأس المسح
    const head = new T.Group(); head.position.set(-1.2, 0.18, 0); g.add(head);
    box(head, 0.18, 0.08, D - 0.5, M.metalDark, 0, 0, 0);
    box(head, 0.06, 0.015, 0.3, M.ledWhite, 0, 0.045, 0, { cast: false });
    tag(head, "رأس المسح CIS", "شريط LED يتحرك تحت الزجاج ويلتقط آلاف النقاط في الثانية بدقة تصل 4800dpi.");
    // غطاء مفتوح
    const lid = new T.Group(); lid.position.set(0, 0.32, -D / 2 + 0.1); lid.rotation.x = -1.0; g.add(lid);
    rbox(lid, W, 0.12, D, 0.04, M.plasticOffWhite, 0, 0, D / 2 - 0.05);
    box(lid, W - 0.3, 0.02, D - 0.3, M.paper, 0, -0.073, D / 2 - 0.05, { cast: false });
    box(lid, W, 0.02, 0.06, M.plasticGrey, 0, 0.06, D / 2 - 0.05, { cast: false });
    tag(lid, "الغطاء", "يضغط المستند على الزجاج ويحجب الضوء الخارجي؛ الضوء الزائد يسبب خطوطاً في الصورة.");
    // لوحة تحكم
    const ctrl = new T.Group(); ctrl.position.set(0.65, 0.28, 0.86); g.add(ctrl);
    rbox(ctrl, 1.2, 0.05, 0.3, 0.03, M.plasticCharcoal, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const b = cyl(ctrl, 0.055, 0.055, 0.02, 16, M.plasticBlack, -0.4 + i * 0.26, 0.035, 0, { cast: false });
      decal(ctrl, ["SCAN", "COPY", "PDF", "WIFI"][i], 0.16, 0.025, -0.4 + i * 0.26, 0.035, 0.035, { fontSize: 16, color: "#8d99a3" });
    }
    box(ctrl, 0.28, 0.015, 0.12, M.screen, 0.35, 0.035, 0);
    decal(ctrl, "READY", 0.22, 0.03, 0.35, 0.045, 0.063, { fontSize: 20, color: "#7fe2ff", emissive: "#2bd9ff", emissiveIntensity: .7 });
    tag(ctrl, "أزرار المسح", "اختصارات للمسح إلى PDF أو البريد أو الطباعة مباشرة دون فتح برنامج.");
    tag(g, "ماسح ضوئي مسطح", "حوّل الورق إلى ملفات: زجاج سطحي وعمق مجال واسع للمستندات والكتب والصور.");
    H.ticks(g);
    return g;
  }
  ph.scanner = buildScanner;
  H.register("scanner", buildScanner);

  /* ============================================================
     ويب كام
     ============================================================ */
  function buildWebcam() {
    const g = new T.Group(); g.name = "webcam";
    // حامل ثلاثي
    const base = new T.Group(); base.position.y = 0.06; g.add(base);
    cyl(base, 0.6, 0.68, 0.06, 40, M.metalDark, 0, 0, 0);
    cyl(base, 0.07, 0.09, 0.9, 16, M.steelDark, 0, 0.45, 0);
    sphere(base, 0.11, M.steelDark, 0, 0.93, 0, { seg: 16, seg2: 12 });
    // جسم الكاميرا
    const cam = new T.Group(); cam.position.set(0, 1.45, 0); g.add(cam);
    rbox(cam, 1.25, 0.55, 0.45, 0.16, M.plasticBlack, 0, 0, 0);
    // عدسة
    const lens = new T.Group(); lens.position.set(0, 0, 0.24); cam.add(lens);
    cyl(lens, 0.24, 0.26, 0.1, 40, M.metalDark, 0, 0, 0, { rx: Math.PI / 2 });
    cyl(lens, 0.17, 0.2, 0.08, 32, M.plasticBlack, 0, 0, 0.06, { rx: Math.PI / 2 });
    cyl(lens, 0.14, 0.16, 0.04, 32, M.glassDark, 0, 0, 0.11, { rx: Math.PI / 2 });
    const iris = cyl(lens, 0.07, 0.07, 0.02, 24, new T.MeshPhysicalMaterial({ color: 0x041018, roughness: 0.02, metalness: 0.2, clearcoat: 1 }), 0, 0, 0.135, { rx: Math.PI / 2, cast: false });
    torus(lens, 0.11, 0.008, M.glass, 0, 0, 0.14, { seg: 40, cast: false, receive: false });
    tag(lens, "عدسة 4K", "عدسة زجاجية بزاوية 90° ومستشعر 4K؛ ترى وجهك واضحاً حتى في إضاءة ضعيفة.");
    // حلقة إضاءة
    torus(cam, 0.34, 0.012, M.ledWhite, 0, 0, 0.245, { seg: 52, tseg: 6, cast: false, receive: false });
    // ميكروفونات
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) sphere(cam, 0.012, M.plasticCharcoal, -0.4 + i * 0.05, -0.18 + j * 0.035, 0.235, { seg: 6, seg2: 5, cast: false });
    }
    decal(cam, "NOVA  VISION 4K", 0.6, 0.06, 0.25, 0.1, 0.23, { fontSize: 24, color: "#7e8a94" });
    tag(cam, "مصفوفة ميكروفون", "ميكروفونان يلغيان الصدى والضجيج؛ تسمعك بوضوح حتى على بعد 3 أمتار.");
    // غطاء الخصوصية
    const shutter = new T.Group(); shutter.position.set(0.37, 0.0, 0.26); cam.add(shutter);
    box(shutter, 0.28, 0.08, 0.02, M.aluminumBlack, 0, 0, 0);
    box(shutter, 0.07, 0.045, 0.025, M.ledRed, 0.1, 0.0, 0.02, { cast: false });
    tag(shutter, "غطاء الخصوصية", "شريحة تنزلق فوق العدسة ميكانيكياً — أضمن من إطفاء الكاميرا برمجياً.");
    // مؤشر الحالة
    const led = sphere(cam, 0.018, M.ledWhite, -0.48, 0.16, 0.24, { seg: 8, seg2: 6, cast: false, receive: false });
    tag(led, "مؤشر التسجيل", "ضوء أبيض/أحمر يخبرك أن الكاميرا تعمل؛ لا يمكن تعطيله برمجياً.");
    // كابل
    cable(g, [[0, 1.45, -0.24], [0, 1.1, -0.4], [0.3, 0.2, -0.5], [0.8, 0.06, -0.6]], 0.038, M.sleeve, { seg: 22 });
    // مشبك الشاشة
    const clip = new T.Group(); clip.position.set(-0.75, 0.35, -0.15); clip.rotation.z = 0.2; g.add(clip);
    box(clip, 0.08, 0.5, 0.4, M.plasticBlack, 0, 0, 0);
    box(clip, 0.08, 0.3, 0.4, M.plasticBlack, 0, -0.35, 0.08, { rz: 0.7 });
    tag(g, "ويب كام", "كاميرا 4K بميكروفونين وحلقة إضاءة؛ تجمع كل ما تحتاجه للاجتماعات والبث.");
    H.ticks(g);
    return g;
  }
  ph.webcam = buildWebcam;
  H.register("webcam", buildWebcam);

  /* ============================================================
     هيدست ألعاب
     ============================================================ */
  function buildHeadset() {
    const g = new T.Group(); g.name = "headset";
    // حامل
    cyl(g, 0.85, 0.95, 0.08, 40, M.metalDark, 0, 0.04, 0);
    cyl(g, 0.1, 0.13, 2.3, 16, M.steelDark, 0, 1.2, 0);
    const hook = new T.Group(); hook.position.set(0, 2.3, 0); g.add(hook);
    box(hook, 0.9, 0.09, 0.16, M.aluminumBlack, 0.2, 0.05, 0);
    box(hook, 0.09, 0.1, 0.7, M.aluminumBlack, 0.62, 0.05, 0.25);
    // الهيدست
    const hs = new T.Group(); hs.position.set(0.2, 2.12, 0.16); hs.rotation.z = 0.04; g.add(hs);
    // شريط الرأس
    const bandPts = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI * (i / 24);
      bandPts.push([Math.cos(a) * 0.82, Math.sin(a) * 0.65 + 0.25, 0]);
    }
    cable(hs, bandPts, 0.095, M.rubber, { seg: 40, radial: 12 });
    cable(hs, bandPts.map(function (p, i) { return [p[0], p[1] + 0.07, p[2]]; }), 0.08, M.plasticBlack, { seg: 40, radial: 12 });
    // وسادة الرأس
    for (let i = 7; i <= 17; i++) {
      const a = Math.PI * (i / 24);
      box(hs, 0.1, 0.035, 0.26, M.rubber, Math.cos(a) * 0.82, Math.sin(a) * 0.65 + 0.32, 0, { rz: a - Math.PI / 2, cast: false });
    }
    tag(hs, "شريط الرأس", "إطار معدني مرن مع وسادة جلدية توزع الوزن وتقلل الضغط على قمة الرأس.");
    // أذنيات
    [-1, 1].forEach(function (s) {
      const ear = new T.Group(); ear.position.set(s * 0.82, 0.25, 0); ear.rotation.z = -s * 0.12; hs.add(ear);
      cyl(ear, 0.36, 0.4, 0.16, 32, M.plasticCharcoal, 0, 0, 0, { rz: Math.PI / 2 });
      cyl(ear, 0.38, 0.38, 0.1, 32, M.rubber, s * -0.11, 0, 0, { rz: Math.PI / 2 });
      torus(ear, 0.3, 0.035, M.rubber, s * -0.17, 0, 0, { rz: Math.PI / 2, ry: Math.PI / 2, seg: 40 });
      // شبك
      for (let i = 0; i < 12; i++) {
        const a = i * 0.52;
        box(ear, 0.01, 0.035, 0.28, M.metalDark, s * 0.09, Math.sin(a) * 0.22, Math.cos(a) * 0.22, { rx: a, cast: false });
      }
      const ring = torus(ear, 0.34, 0.016, M.ledCyan, s * 0.09, 0, 0, { rz: Math.PI / 2, seg: 48, cast: false, receive: false });
      if (s === 1) tag(ear, "أذنية 50mm", "مشغل 50mm مع حلقات RGB؛ صوت محيطي يحدد اتجاه الأعداء بدقة.");
      // ذراع الميكروفون
      if (s === -1) {
        const mic = new T.Group(); mic.position.set(-0.32, -0.05, 0.3); ear.add(mic);
        const pts = [[0, 0, 0], [-0.25, -0.12, 0.35], [-0.35, -0.18, 0.7], [-0.25, -0.2, 0.92]];
        cable(mic, pts, 0.035, M.plasticBlack, { seg: 18 });
        sphere(mic, 0.09, M.rubber, -0.23, -0.2, 0.94, { seg: 16, seg2: 12 });
        box(mic, 0.08, 0.05, 0.08, M.ledRed, -0.23, -0.18, 0.88, { cast: false });
        tag(mic, "ميكروفون قابل للسحب", "ميكروفون عازل للضجيج في طرف ذراع مرنة؛ اسحبه قرب فمك للوضوح وأبعده عند عدم الحاجة.");
      }
    });
    // كابل
    cable(g, [[0.55, 2.4, 0.0], [1.1, 1.8, 0.3], [0.9, 0.3, 0.7], [1.5, 0.06, 1.0]], 0.03, M.sleeve, { seg: 22 });
    tag(g, "هيدست ألعاب", "صوت محيطي + ميكروفون + إضاءة؛ الفرق بين سماع خطوة وسماعها بدقة الاتجاه.");
    H.ticks(g);
    return g;
  }
  ph.headset = buildHeadset;
  H.register("headset", buildHeadset);

  /* ============================================================
     سماعات مكتبية
     ============================================================ */
  function buildSpeaker(rot) {
    const g = new T.Group(); g.name = "speaker";
    const W = 1.15, Hh = 1.85, D = 1.05;
    // صندوق
    rbox(g, W, Hh, D, 0.035, new T.MeshStandardMaterial({ color: 0xffffff, map: woodTex(), roughness: 0.5, metalness: 0.05 }), 0, 0.94 + 0.05, 0);
    box(g, W - 0.04, Hh - 0.04, 0.03, M.plasticBlack, 0, 0.99, D / 2 + 0.002);
    // ووفر
    const woofer = new T.Group(); woofer.position.set(0, 0.78, D / 2 + 0.05); g.add(woofer);
    cyl(woofer, 0.38, 0.4, 0.08, 40, M.plasticCharcoal, 0, 0, 0, { rx: Math.PI / 2 });
    torus(woofer, 0.35, 0.06, M.rubber, 0, 0, 0.055, { seg: 48, tseg: 10 });
    const cone = new T.Mesh(new T.CylinderGeometry(0.32, 0.08, 0.14, 40, 1, true), new T.MeshStandardMaterial({ color: 0x242a31, roughness: 0.72, metalness: 0.1, side: T.DoubleSide }));
    cone.rotation.x = Math.PI / 2; cone.position.z = 0.05; woofer.add(cone);
    sphere(woofer, 0.1, M.plasticBlack, 0, 0, 0.09, { seg: 24, seg2: 16 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      screw(woofer, Math.cos(a) * 0.37, Math.sin(a) * 0.37, 0.06, 0.022, null, M.steelDark);
    }
    tag(woofer, "مشغل الصوت 5.25\"", "ووفر بمغناطيس قوي يحرك الهواء بسرعة؛ الصوت منخفض التردد هو ما تشعر به أكثر مما تسمعه.");
    // تويتير
    const tw = new T.Group(); tw.position.set(0, 1.5, D / 2 + 0.04); g.add(tw);
    cyl(tw, 0.15, 0.17, 0.06, 32, M.metalDark, 0, 0, 0, { rx: Math.PI / 2 });
    sphere(tw, 0.09, new T.MeshStandardMaterial({ color: 0x1b2026, roughness: 0.35, metalness: 0.3 }), 0, 0, 0.05, { seg: 24, seg2: 16 });
    tag(tw, "تويتير", "مشغل صغير مسؤول عن الترددات العالية: التفاصيل، حفيف السنير، ووضوح الأصوات.");
    // فتحة باس
    const port = new T.Group(); port.position.set(0, 0.3, D / 2 + 0.02); g.add(port);
    cyl(port, 0.12, 0.12, 0.12, 24, M.rubber, 0, 0, 0, { rx: Math.PI / 2 });
    cyl(port, 0.09, 0.09, 0.1, 24, M.plasticBlack, 0, 0, 0.03, { rx: Math.PI / 2, cast: false });
    // شعار + قرص الصوت
    decal(g, "NOVA", 0.25, 0.06, 0, 1.84, D / 2 + 0.035, { fontSize: 38, color: "#8e9aa4" });
    const vol = cyl(g, 0.07, 0.07, 0.04, 18, M.aluminum, -0.38, 1.7, D / 2 + 0.02, { rx: Math.PI / 2 });
    decal(g, "−  +", 0.12, 0.03, -0.38, 1.59, D / 2 + 0.045, { fontSize: 20, color: "#7a8691" });
    // أرجل
    [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]].forEach(function (p) {
      cyl(g, 0.05, 0.06, 0.06, 12, M.rubber, p[0], 0.03, p[1]);
    });
    tag(g, "سماعة مكتبية", "مكبر صوت بسعة 50 واط وفتحة باس خلفية؛ تصميم بسيط لكن الصوت يملأ غرفة كاملة.");
    // كابل
    cable(g, [[0.4, 0.15, -0.45], [0.8, 0.08, -0.8], [1.1, 0.05, -1.0]], 0.025, M.sleeve, { seg: 14 });
    if (rot) g.rotation.y = rot;
    H.ticks(g);
    return g;
  }
  ph.speaker = buildSpeaker;
  H.register("speakers", function () {
    const g = new T.Group();
    const a = buildSpeaker(0.18); a.position.set(-1.3, 0, 0); g.add(a);
    const b = buildSpeaker(-0.18); b.position.set(1.3, 0, 0); g.add(b);
    // قاعدة عرض
    rbox(g, 4.0, 0.08, 1.8, 0.03, M.stage, 0, -0.04, 0);
    box(g, 3.7, 0.01, 1.5, M.ledCyan, 0, 0.01, 0, { cast: false });
    g.traverse(function (o) { if (o.position.y === 0) o.position.y += 0.06; });
    return H.ticks(g);
  });

  /* ============================================================
     UPS برجي
     ============================================================ */
  function buildUPS() {
    const g = new T.Group(); g.name = "ups";
    const W = 1.35, Hh = 3.0, D = 1.8;
    rbox(g, W, Hh, D, 0.06, M.plasticBlack, 0, Hh / 2 + 0.05, 0);
    box(g, W - 0.15, Hh - 0.3, D - 0.1, M.plasticCharcoal, 0, Hh / 2 + 0.05, 0);
    // شاشة LCD
    const scr = new T.Group(); scr.position.set(0, 2.35, D / 2 + 0.016); g.add(scr);
    box(scr, 0.85, 0.48, 0.02, M.screen, 0, 0, 0);
    decal(scr, "NOVA  UPS", 0.7, 0.06, 0, 0.15, 0.015, { fontSize: 26, color: "#8fe3ff", emissive: "#2bd9ff", emissiveIntensity: .8 });
    decal(scr, "1500VA / 900W", 0.6, 0.05, 0, 0.04, 0.015, { fontSize: 22, color: "#cfe5ef" });
    for (let i = 0; i < 5; i++) box(scr, 0.09, 0.11, 0.01, [M.ledGreen, M.ledGreen, M.ledGreen, M.ledGreen, M.ledAmber][i], -0.25 + i * 0.12, -0.13, 0.015, { cast: false });
    decal(scr, "BATTERY 86%   LOAD 42%", 0.7, 0.035, 0, 0.22, 0.015, { fontSize: 18, color: "#a6c2ce" });
    // زر تشغيل
    const b = cyl(g, 0.13, 0.13, 0.06, 28, M.metalDark, 0, 1.85, D / 2 + 0.03, { rx: Math.PI / 2 });
    torus(g, 0.11, 0.012, M.ledCyan, 0, 1.85, D / 2 + 0.065, { seg: 32, cast: false, receive: false });
    tag(scr, "شاشة UPS", "تعرض نسبة البطارية والحمل والجهد؛ إنها «صحة» جهازك وقت انقطاع الكهرباء.");
    // فتحات تهوية
    for (let i = 0; i < 14; i++) box(g, 0.75, 0.018, 0.02, M.plasticBlack, 0, 0.3 + i * 0.06, D / 2 + 0.012, { cast: false });
    for (let i = 0; i < 9; i++) {
      box(g, 0.02, 0.16, 0.5, M.plasticBlack, W / 2 + 0.005, 0.45 + i * 0.22, 0, { cast: false });
      box(g, 0.02, 0.16, 0.5, M.plasticBlack, -W / 2 - 0.005, 0.45 + i * 0.22, 0, { cast: false });
    }
    // منافذ الظهر
    const back = new T.Group(); back.position.set(0, 0.6, -D / 2 - 0.03); g.add(back);
    box(back, 1.1, 0.8, 0.06, M.plasticCharcoal, 0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const so = new T.Group(); so.position.set(-0.4 + (i % 3) * 0.4, 0.2 - Math.floor(i / 3) * 0.35, 0.04); back.add(so);
      box(so, 0.25, 0.2, 0.03, M.plasticBlack, 0, 0, 0);
      box(so, 0.18, 0.13, 0.01, M.plasticGrey, 0, 0, 0.02);
    }
    tag(back, "منافذ البطارية", "6 مقابس محمية + USB؛ توصيل الراوتر والسويتش هنا يضمن بقاء الشبكة أثناء الانقطاع.");
    // كابل طاقة
    cable(g, [[-0.4, 0.4, -0.9], [-0.8, 0.2, -1.3], [-1.3, 0.06, -1.0]], 0.04, M.sleeve, { seg: 18 });
    tag(g, "مزود طاقة غير منقطع UPS", "يبقي جهازك ثوانٍ إلى دقائق بعد انقطاع الكهرباء، وينقله لإغلاق آمن بدل فقدان الملفات.");
    H.ticks(g);
    return g;
  }
  ph.ups = buildUPS;
  H.register("ups", buildUPS);
})();
