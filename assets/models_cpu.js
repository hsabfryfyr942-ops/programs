/* ============================================================
   HWM · المعالج CPU — عرض تفصيلي: المعالج، النسخة المفكوكة، المقبس
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, decal = u.decal, screw = u.screw;
  const tag = H.hotspot;

  /* نسيج أسنان المقبس LGA */
  function lgaTex() {
    if (H.tex.lga) return H.tex.lga;
    const S = 512, c = H.canvas(S, S), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#7c5f2c"); g.addColorStop(0.5, "#d8b365"); g.addColorStop(1, "#8a6a32");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    const step = 10;
    for (let gy = 0; gy < S / step; gy++) {
      for (let gx = 0; gx < S / step; gx++) {
        const px = gx * step + 5, py = gy * step + 5;
        x.fillStyle = "rgba(30,22,8,.78)";
        x.beginPath(); x.arc(px, py, 2.25, 0, 6.283); x.fill();
        x.fillStyle = "rgba(255,236,190,.85)";
        x.beginPath(); x.arc(px - 0.7, py - 0.7, 1.1, 0, 6.283); x.fill();
      }
    }
    x.strokeStyle = "rgba(40,28,10,.25)";
    for (let i = 0; i < S; i += 64) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke();
      x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke();
    }
    H.tex.lga = H.finishTex(c, { srgb: true, repeat: [1, 1] });
    return H.tex.lga;
  }

  /* لوحة معالج: قاعدة + IHS + مكثفات + حواف ذهبية */
  function cpuChip(opts) {
    opts = opts || {};
    const g = new T.Group();
    const S = opts.size || 1.6;
    const th = 0.1;
    // قاعدة PCB
    const sub = box(g, S, th, S, new T.MeshStandardMaterial({
      color: 0xffffff, map: H.pcbTex(52, true), roughness: 0.52, metalness: 0.24
    }), 0, 0, 0);
    // حواف ذهبية دقيقة
    for (let i = 0; i < 4; i++) {
      const horiz = i < 2;
      const sign = i % 2 ? 1 : -1;
      box(g, horiz ? S * 0.94 : 0.024, 0.008, horiz ? 0.024 : S * 0.94,
        M.gold, 0, th / 2 + 0.003, horiz ? sign * S * 0.46 : 0, { cast: false });
      if (horiz) box(g, S * 0.94, 0.008, 0.024, M.gold, 0, th / 2 + 0.003, sign * S * 0.46, { cast: false });
      else box(g, 0.024, 0.008, S * 0.94, M.gold, sign * S * 0.46, th / 2 + 0.003, 0, { cast: false });
    }
    // صفوف لمسات ذهبية حول IHS
    for (let c = 0; c < 2; c++) {
      for (let i = 0; i < 22; i++) {
        const off = -S * 0.45 + i * (S * 0.9 / 21);
        box(g, 0.035, 0.008, 0.05, M.gold, off, th / 2 + 0.004, (c ? 1 : -1) * S * 0.385, { cast: false });
        box(g, 0.05, 0.008, 0.035, M.gold, (c ? 1 : -1) * S * 0.385, th / 2 + 0.004, off, { cast: false });
      }
    }
    // مكثفات SMD
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const r = S * 0.36;
      box(g, 0.07, 0.022, 0.045, i % 3 ? M.ceramic : M.plasticBlack,
        Math.cos(a) * r, th / 2 + 0.014, Math.sin(a) * r, { ry: -a, cast: false });
    }
    // IHS
    const ihs = new T.Group(); g.add(ihs);
    const ihsMat = new T.MeshStandardMaterial({ color: 0xb9c0c8, metalness: 0.98, roughness: 0.28, roughnessMap: H.tex.brushl || null });
    rbox(ihs, S * 0.7, 0.1, S * 0.7, 0.02, M.steel, 0, th / 2 + 0.055, 0);
    // حافة مشطوفة
    rbox(ihs, S * 0.64, 0.02, S * 0.64, 0.02, new T.MeshStandardMaterial({ color: 0x8f979f, metalness: 0.98, roughness: 0.34 }), 0, th / 2 + 0.108, 0);
    // حفر الاسم
    decal(ihs, "NOVA", 0.3, 0.07, 0, 0.27, S * 0.455, { fontSize: 64, color: "#e4e9ee", font: "800 64px 'Segoe UI', Arial", emissive: "#aeb9c2", emissiveIntensity: 0.12 });
    decal(ihs, "CORE X16  ·  4.9 GHz", 0.66, 0.06, 0, 0.16, S * 0.455, { fontSize: 30, color: "#aab3bc" });
    decal(ihs, "24 THREADS  ·  LGA", 0.58, 0.05, 0, 0.06, S * 0.455, { fontSize: 24, color: "#7e8891" });
    const tri = new T.Mesh(new T.CircleGeometry(0.075, 3), M.gold);
    tri.position.set(-S * 0.42, th / 2 + 0.006, -S * 0.42);
    tri.rotation.x = -Math.PI / 2;
    g.add(tri);
    // شقوق الحواف
    box(g, 0.12, th * 1.1, 0.02, M.plasticBlack, S * 0.44, 0, -S * 0.2, { cast: false });
    box(g, 0.02, th * 1.1, 0.1, M.plasticBlack, -S * 0.3, 0, -S * 0.49, { cast: false });
    return { g: g, ihs: ihs, substrate: sub, tri: tri };
  }

  function buildCPUPage() {
    const root = new T.Group(); root.name = "cpuScene";
    // منصة
    rbox(root, 6.6, 0.16, 4.8, 0.07, M.stage, 0, 0.045, 0);
    H.stageDeck(root, 6.25, 4.45, 0.172);
    for (let i = 0; i < 4; i++) {
      const sx = i < 2 ? -1 : 1, sz = i % 2 ? 1 : -1;
      box(root, 0.5, 0.01, 0.03, M.ledCyan, sx * 2.9, 0.19, sz * 2.15, { cast: false, receive: false });
    }
    // قاعدة عرض المعالج الرئيسي
    const ped = new T.Group(); ped.position.set(-0.55, 0.18, 0.35); root.add(ped);
    cyl(ped, 1.22, 1.36, 0.34, 56, M.aluminumBlack, 0, 0.17, 0);
    torus(ped, 1.16, 0.016, M.ledCyan, 0, 0.345, 0, { rx: -Math.PI / 2, seg: 60, cast: false, receive: false });
    const ledRing = new T.Mesh(new T.RingGeometry(1.16, 1.34, 60), new T.MeshStandardMaterial({ color: 0x05080b, emissive: 0x2bd9ff, emissiveIntensity: 0.5, roughness: 0.3, transparent: true, opacity: 0.35 }));
    ledRing.rotation.x = -Math.PI / 2; ledRing.position.y = 0.35; ped.add(ledRing);
    // المعالج الرئيسي
    const main = cpuChip({ size: 1.66 });
    main.g.position.set(-0.55, 0.38, 0.35);
    main.g.rotation.y = 0.42;
    root.add(main.g);
    tag(main.ihs, "الغطاء المعدني IHS", "غطاء نحاسي مطلي بالنيكل ينشر حرارة الأنوية على مساحة أكبر؛ سطحه المصقول يلامس المعجون الحراري.");
    tag(main.substrate, "قاعدة المعالج", "لوحة PCB دقيقة تحمل الأنوية والذاكرة والمنظمات، وحوافها الذهبية تنقل الطاقة والإشارات.");
    tag(main.tri, "علامة التوجيه", "مثلث صغير في الزاوية يحدد الاتجاه الصحيح عند التثبيت؛ عكسه قد يتلف الأسنان.");
    // نسخة مفكوكة
    const naked = new T.Group(); naked.position.set(2.25, 0.18, 0.55); root.add(naked);
    cyl(naked, 0.95, 1.05, 0.26, 48, M.metalDark, 0, 0.13, 0);
    torus(naked, 0.9, 0.014, M.ledAmber, 0, 0.265, 0, { rx: -Math.PI / 2, seg: 52, cast: false, receive: false });
    const chip2 = cpuChip({ size: 1.24 });
    // نزيل IHS من النسخة الثانية
    chip2.ihs.visible = false;
    chip2.g.position.set(2.25, 0.42, 0.55);
    chip2.g.rotation.y = -0.28;
    naked.add(new T.Group());
    root.add(chip2.g);
    // قالب الأنوية (die) فوق القاعدة
    const die = new T.Group(); die.position.set(2.25, 0.47, 0.55); die.rotation.y = -0.28; root.add(die);
    box(die, 0.62, 0.045, 0.76, new T.MeshPhysicalMaterial({ color: 0x101a26, metalness: 0.45, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), 0, 0, 0);
    // مناطق الأنوية مضيئة قليلاً
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        box(die, 0.11, 0.004, 0.26, new T.MeshStandardMaterial({ color: 0x1b2a3a, metalness: 0.6, roughness: 0.18 }), -0.23 + c * 0.15, 0.026, -0.2 + r * 0.4, { cast: false });
      }
    }
    decal(die, "16 CORES", 0.42, 0.03, 0, 0.033, 0.29, { rx: -Math.PI / 2, fontSize: 26, color: "#9fe3ff", emissive: "#2bd9ff", emissiveIntensity: 0.6 });
    tag(die, "قالب الأنوية Die", "شريحة السيليكون التي تحوي 16 نواة وذاكرة مخبأ؛ بحجم طابع بريد تقريباً، وهي أغلى جزء في المعالج.");
    // معجون حراري غير منتظم
    const paste = new T.Group(); paste.position.set(2.25, 0.49, 0.55); root.add(paste);
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      sphere(paste, 0.045 + (i % 5) * 0.012, new T.MeshStandardMaterial({ color: 0x8d9298, roughness: 0.85, metalness: 0.1 }),
        Math.cos(a) * (0.2 + (i % 4) * 0.05), 0.005, Math.sin(a) * (0.28 + (i % 3) * 0.05), { seg: 8, seg2: 6, cast: false });
    }
    tag(paste, "المعجون الحراري", "طبقة رقيقة تسدّ الفجوات المجهرية بين القالب والغطاء؛ معجون جاف أو سميك يرفع الحرارة فوراً.");
    // IHS مرفوع ومائل خلف النسخة المفكوكة
    const ihs2 = new T.Group(); ihs2.position.set(3.35, 0.64, -0.2); ihs2.rotation.set(-1.12, 0.45, 0.15); root.add(ihs2);
    rbox(ihs2, 0.9, 0.08, 0.9, 0.02, M.steel, 0, 0, 0);
    decal(ihs2, "LIQUID METAL", 0.5, 0.05, 0, 0.043, 0, { rx: -Math.PI / 2, fontSize: 28, color: "#b7c2cc" });
    tag(ihs2, "غطاء مرفوع (Delidded)", "إزالة الغطاء بحذر تكشف القالب؛ يستخدمها المحترفون بمعادن سائلة، وتُفقد الضمان.");
    // دعامة صغيرة تحمل الغطاء
    box(root, 0.08, 0.7, 0.08, M.metalDark, 3.35, 0.45, -0.55, { cast: false });
    // المقبس LGA
    const sock = new T.Group(); sock.position.set(-2.25, 0.18, -1.35); sock.rotation.y = 0.25; root.add(sock);
    box(sock, 1.56, 0.14, 1.56, M.metalDark, 0, 0.07, 0);
    box(sock, 1.34, 0.06, 1.34, M.metalDark, 0, 0.16, 0);
    const pinField = add(sock, new T.PlaneGeometry(1.18, 1.18), new T.MeshStandardMaterial({ map: lgaTex(), roughness: 0.32, metalness: 0.9, bumpMap: lgaTex(), bumpScale: 0.006 }), 0, 0.195, 0, { rx: -Math.PI / 2, cast: false });
    // إطار معدني
    [-1, 1].forEach(function (s) {
      box(sock, 1.64, 0.08, 0.09, M.steelDark, 0, 0.22, s * 0.75);
      box(sock, 0.09, 0.08, 1.58, M.steelDark, s * 0.75, 0.22, 0);
    });
    // ذراع القفل
    cyl(sock, 0.018, 0.018, 1.5, 10, M.steel, -0.83, 0.26, 0, { rx: Math.PI / 2, cast: false });
    const lever = new T.Group(); lever.position.set(-0.83, 0.26, 0.8); lever.rotation.x = 0.6; sock.add(lever);
    cyl(lever, 0.022, 0.022, 0.34, 10, M.steel, 0, 0.15, 0, {});
    torus(lever, 0.06, 0.012, M.steelDark, 0, 0.3, 0, { seg: 24 });
    decal(sock, "LGA · 1718", 0.7, 0.08, 0, 0.065, 0.82, { fontSize: 34, color: "#9fb3c0" });
    tag(pinField, "أسنان المقبس", "1718 نقطة تلامس ذهبية تنقل الطاقة والبيانات؛ أي انحناء فيها قد يمنع الإقلاع.");
    tag(lever, "ذراع التثبيت", "يضغط الإطار المعدني على المعالج بقوة متساوية؛ أغلقه بعد تثبيت المعالج فقط.");
    // لوحة تكبير الأسنان
    const mag = new T.Group(); mag.position.set(-2.3, 1.55, -1.3); mag.rotation.y = 0.28; root.add(mag);
    box(mag, 0.92, 0.92, 0.05, M.metalDark, 0, 0, 0);
    add(mag, new T.PlaneGeometry(0.82, 0.82), new T.MeshStandardMaterial({ map: lgaTex(), roughness: 0.35, metalness: 0.85, emissive: 0x2bd9ff, emissiveIntensity: 0.06, emissiveMap: lgaTex() }), 0, 0, 0.035, { cast: false });
    decal(mag, "LGA PINS  ·  ×12", 0.7, 0.05, 0, -0.39, 0.04, { fontSize: 26, color: "#9fb6c4", emissive: "#2bd9ff", emissiveIntensity: 0.3 });
    box(root, 0.08, 1.0, 0.08, M.metalDark, -2.3, 0.6, -1.52, { cast: false });
    // ملصق المنصة
    decal(root, "SILICON LAB  ·  CPU", 1.2, 0.1, 0, 0.1, 2.39, { fontSize: 34, color: "#7292a4" });
    // تفكيك الغطاء الرئيسي
    H.explode(root, main.ihs, 0, 0.95, 0);
    root.userData.refs = { main: main.g, ihs: main.ihs, naked: chip2.g, die: die, socket: sock, lever: lever };
    return H.ticks(root);
  }

  H.register("cpu", buildCPUPage);
  HWM.cpu = { buildCPUPage: buildCPUPage, cpuChip: cpuChip, lgaTex: lgaTex };
})();
