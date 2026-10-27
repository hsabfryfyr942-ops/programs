/* ============================================================
   HWM · التخزين والتبريد والكيس الكامل المفتوح
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const pc = (H.pc = H.pc || {});
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, screw = u.screw, decal = u.decal, fan = u.fan, cable = u.cable;
  const tag = H.hotspot;

  /* ============================================================
     التخزين: HDD مفتوح + SSD مفتوح + NVMe
     ============================================================ */
  function platterTexture() {
    if (H.tex.platter) return H.tex.platter;
    const S = 512, c = H.canvas(S, S), x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S / 2);
    g.addColorStop(0, "#c9d2dc"); g.addColorStop(0.2, "#8f9ba8"); g.addColorStop(0.5, "#c3ccd6");
    g.addColorStop(0.75, "#7c8895"); g.addColorStop(1, "#a8b2bd");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.strokeStyle = "rgba(255,255,255,.18)";
    for (let r = 24; r < 250; r += 2) {
      x.beginPath(); x.arc(S / 2, S / 2, r, 0, 6.283); x.lineWidth = r % 6 < 2 ? 0.8 : 0.3; x.stroke();
    }
    x.strokeStyle = "rgba(20,30,40,.4)"; x.lineWidth = 1;
    for (let i = 0; i < 8; i++) { const a = i * 0.5; x.beginPath(); x.moveTo(S / 2, S / 2); x.lineTo(S / 2 + Math.cos(a) * 250, S / 2 + Math.sin(a) * 250); x.stroke(); }
    H.tex.platter = H.finishTex(c, { srgb: true });
    return H.tex.platter;
  }
  function buildHDD() {
    const g = new T.Group(); g.name = "hdd";
    const W = 1.46, D = 1.02, Hh = 0.26;
    // علبة سفلية
    rbox(g, W, Hh, D, 0.02, M.metalDark, 0, Hh / 2, 0);
    box(g, W - 0.04, Hh - 0.04, D - 0.04, M.aluminum, 0, Hh / 2, 0);
    box(g, W - 0.02, 0.03, D - 0.02, M.metalMid, 0, Hh - 0.02, 0);
    // أقراص
    const platMat = new T.MeshStandardMaterial({ color: 0xffffff, map: platterTexture(), metalness: 1, roughness: 0.08 });
    const p1 = cyl(g, 0.44, 0.44, 0.012, 64, platMat, 0, 0.12, 0.02, { cast: false });
    const ring = new T.Mesh(new T.CylinderGeometry(0.455, 0.455, 0.014, 64), [M.steelDark, platMat, platMat]);
    ring.position.set(0, 0.12, 0.02); g.add(ring);
    cyl(g, 0.44, 0.44, 0.008, 64, M.steelDark, 0, 0.155, 0.02, { cast: false });
    // محرك المغزل
    cyl(g, 0.13, 0.14, 0.1, 28, M.aluminum, 0, 0.17, 0.02);
    cyl(g, 0.03, 0.03, 0.15, 12, M.steel, 0, 0.2, 0.02);
    // الذراع
    const armG = new T.Group(); armG.position.set(0.56, 0.17, 0.28); g.add(armG);
    cyl(armG, 0.07, 0.07, 0.05, 20, M.steel, 0, 0, 0);
    const arm = new T.Group(); arm.rotation.y = 2.35; armG.add(arm);
    box(arm, 0.6, 0.018, 0.055, M.aluminum, -0.3, 0, 0);
    box(arm, 0.12, 0.01, 0.08, M.steelDark, -0.63, 0.005, 0);
    box(arm, 0.025, 0.002, 0.03, M.gold, -0.68, 0.02, 0.0, { cast: false });
    // مغناطيس وموصل
    box(g, 0.2, 0.12, 0.16, M.metalDark, 0.58, 0.19, -0.18);
    box(g, 0.55, 0.02, 0.18, M.steelDark, 0.3, 0.16, 0.0, { cast: false });
    // منافذ SATA والطاقة
    const conn = new T.Group(); conn.position.x = W / 2 + 0.01; g.add(conn);
    box(conn, 0.06, 0.09, 0.2, M.plasticBlack, 0, 0.11, 0.28);
    box(conn, 0.06, 0.08, 0.14, M.plasticBlack, 0, 0.11, 0.03);
    for (let i = 0; i < 8; i++) box(conn, 0.03, 0.02, 0.015, M.gold, 0.035, 0.08 + i * 0.02, 0.28, { cast: false });
    // الغطاء مفتوح لأعلى + الملصق
    const cover = new T.Group(); cover.position.set(0, 0.75, 0); g.add(cover);
    rbox(cover, W - 0.02, 0.06, D - 0.02, 0.02, M.metalMid, 0, 0, 0);
    const ltex = H.labelTex("NOVA  HDD\n4 TB  ·  7200 RPM  ·  256MB CACHE", { fontSize: 48, color: "#3b424a", bg: "#c9ced3", align: "left" });
    const lbl = add(cover, new T.PlaneGeometry(1.15, 1.15 * ltex.h / ltex.w), new T.MeshStandardMaterial({ map: ltex.tex, roughness: 0.75 }), -0.05, 0.033, 0, { rx: -Math.PI / 2, cast: false, receive: false });
    decal(cover, "SATA 6Gb/s  ·  MADE FOR 24/7", 0.8, 0.06, 0.05, 0.032, 0.3, { rx: -Math.PI / 2, fontSize: 26, color: "#4b535c" });
    screw(cover, -0.6, 0.02, 0.38, 0.035, "y", M.steel);
    screw(cover, 0.6, 0.02, 0.38, 0.035, "y", M.steel);
    tag(armG, "ذراع القراءة/الكتابة", "يحرّك رأساً مغناطيسياً فوق القرص بدقة ميكرونية، على ارتفاع 3 نانومتر من السطح.");
    tag(p1, "الأقراص الممغنطة", "أقراص تدور 7200 دورة/دقيقة؛ تتسع لآلاف الساعات من الفيديو. أبطأ من SSD لكن أرخص للتخزين الضخم.");
    tag(cover, "غطاء محكم", "يمنع ذرة غبار واحدة من إتلاف القرص؛ لا تفتح قرصاً حقيقياً خارج غرفة نظيفة.");
    H.explode(g, cover, 0, 0.6, 0);
    return g;
  }
  function buildSSD(opts) {
    opts = opts || {};
    const g = new T.Group(); g.name = "ssd";
    const W = 1.0, D = 0.7;
    rbox(g, W, 0.075, D, 0.02, M.aluminumBlack, 0, 0.06, 0);
    // قاعدة
    box(g, W - 0.06, 0.01, D - 0.06, M.steelDark, 0, 0.098, 0, { cast: false });
    // لوحة داخلية
    const pcb = new T.Group(); pcb.position.y = 0.105; g.add(pcb);
    box(pcb, W - 0.08, 0.012, D - 0.08, M.greenPCB, 0, 0, 0);
    box(pcb, 0.18, 0.028, 0.18, M.plasticBlack, -0.22, 0.02, -0.1);
    decal(pcb, "NOVA", 0.13, 0.035, -0.22, 0.036, -0.1, { rx: -Math.PI / 2, fontSize: 34, color: "#b9c3cc" });
    box(pcb, 0.16, 0.025, 0.13, M.plasticBlack, 0.08, 0.018, -0.12);
    box(pcb, 0.16, 0.025, 0.13, M.plasticBlack, 0.28, 0.018, -0.12);
    box(pcb, 0.1, 0.02, 0.08, M.plasticBlack, 0.05, 0.016, 0.15);
    for (let i = 0; i < 5; i++) cap(pcb, -0.35 + i * 0.07, 0.01, 0.18, 0.025, 0.06, M.capAlu);
    // منفذ SATA+Power
    box(g, 0.06, 0.09, 0.24, M.plasticBlack, W / 2 - 0.03, 0.06, 0.12);
    box(g, 0.06, 0.08, 0.17, M.plasticBlack, W / 2 - 0.03, 0.06, -0.15);
    for (let i = 0; i < 6; i++) box(g, 0.02, 0.01, 0.03, M.gold, W / 2 - 0.001, 0.075 + i * 0.012, 0.12, { cast: false });
    // غطاء علوي مفتوح
    const cover = new T.Group(); cover.position.set(0, opts.open ? 0.48 : 0.112, 0); g.add(cover);
    rbox(cover, W, 0.06, D, 0.02, M.aluminumBlack, 0, 0, 0);
    const ltex = H.labelTex("NOVA  SSD\n2TB  ·  SATA III  ·  560/530 MB/s", { fontSize: 46, color: "#cfd7de", bg: "#22262c", align: "left" });
    add(cover, new T.PlaneGeometry(0.86, 0.86 * ltex.h / ltex.w), new T.MeshStandardMaterial({ map: ltex.tex, roughness: 0.65 }), -0.02, 0.032, 0, { rx: -Math.PI / 2, cast: false, receive: false });
    tag(pcb, "لوحة SSD الداخلية", "ذاكرة NAND ووحدة تحكم ذكية تدير الخلايا وتبقي السرعة مستقرة لسنوات.");
    tag(cover, "هيكل SSD 2.5\"", "حجم كلاسيكي لمكان 3.5\" في الحواسيب القديمة؛ لا أجزاء متحركة = صمت ومتانة.");
    if (opts.open) H.explode(g, cover, 0, 0.45, 0);
    return g;
  }
  function cap(parent, x, y, z, r, h, mat) {
    const g = new T.Group(); g.position.set(x, y, z);
    cyl(g, r, r, h, 14, mat || M.capAlu, 0, 0, 0);
    parent.add(g); return g;
  }
  function buildNVMe() {
    const g = new T.Group(); g.name = "nvme";
    const L = 0.82, W = 0.22;
    // PCB أفقي
    box(g, L, 0.018, W, M.blackPCB, 0, 0.02, 0);
    box(g, 0.06, 0.022, W - 0.02, M.gold, -L / 2 + 0.03, 0.018, 0, { cast: false });
    for (let i = 0; i < 9; i++) box(g, 0.045, 0.006, 0.014, M.gold, -L / 2 + 0.04 - 0.005, 0.033, -0.07 + i * 0.018, { cast: false });
    // رقائق
    box(g, 0.15, 0.04, 0.15, M.plasticBlack, -0.2, 0.05, 0);
    box(g, 0.14, 0.035, 0.14, M.plasticBlack, 0.06, 0.045, 0);
    box(g, 0.1, 0.025, 0.1, M.plasticBlack, 0.24, 0.04, 0);
    box(g, 0.06, 0.02, 0.06, M.plasticBlack, -0.03, 0.035, 0.02);
    decal(g, "NOVA", 0.2, 0.055, 0.18, 0.058, 0.075, { rx: -Math.PI / 2, fontSize: 38, color: "#aeb8c2" });
    // ملصق
    const ltex = H.labelTex("NVMe Gen5 ×4  ·  14,000 MB/s  ·  2TB", { fontSize: 40, color: "#dce4ea", align: "left" });
    add(g, new T.PlaneGeometry(0.7, 0.7 * ltex.h / ltex.w), new T.MeshStandardMaterial({ map: ltex.tex, transparent: true, roughness: 0.6 }), 0.02, 0.035, 0.06, { rx: -Math.PI / 2, cast: false, receive: false });
    // مشتت مفتوح
    const hs = new T.Group(); hs.position.set(0.02, 0.5, 0); g.add(hs);
    rbox(hs, L, 0.05, W + 0.02, 0.02, M.steel, 0, 0, 0);
    for (let i = 0; i < 7; i++) box(hs, 0.018, 0.03, W, M.steelDark, -0.32 + i * 0.1, 0.035, 0, { cast: false });
    tag(g, "قرص NVMe", "قرص M.2 ملتصق مباشرة بمسارات PCIe: سرعات تصل 14GB/s وزمن وصول شبه معدوم.");
    tag(hs, "مشتت حرارة M.2", "قطعة ألمنيوم تمنع خفض السرعة (Throttling) أثناء النقل الكبير المتواصل.");
    H.explode(g, hs, 0, 0.4, 0);
    return g;
  }
  function buildStoragePage() {
    const root = new T.Group();
    // منصة عرض
    rbox(root, 4.7, 0.12, 3.4, 0.04, M.stage, 0, 0.04, 0);
    H.stageDeck(root, 4.5, 3.2, 0.125);
    const hdd = buildHDD(); hdd.position.set(-1.25, 0.13, 0.2); hdd.rotation.y = 0.18; root.add(hdd);
    const ssd = buildSSD({open:true}); ssd.position.set(0.7, 0.10, 0.95); ssd.rotation.y = -0.35; root.add(ssd);
    const nvme = buildNVMe(); nvme.position.set(0.6, 0.74, -0.65); nvme.rotation.y = 0.55; nvme.rotation.z = 0.12; root.add(nvme);
    return H.ticks(root);
  }
  H.register("storage", buildStoragePage);
  pc.hdd = buildHDD; pc.ssd = buildSSD; pc.nvme = buildNVMe;

  /* ============================================================
     تبريد: مبرد هوائي + AIO + مروحة
     ============================================================ */
  function heatsinkFins(parent, count, w, h, d, gap, mat, x, y, z) {
    const g = new T.Group(); g.position.set(x, y, z);
    for (let i = 0; i < count; i++) box(g, w, h, gap, mat, 0, i * (d / count), 0, { cast: false });
    parent.add(g); return g;
  }
  function buildAirCooler() {
    const g = new T.Group(); g.name = "aircooler";
    // قاعدة نحاسية
    box(g, 0.9, 0.08, 0.7, M.copper, 0, 0.05, 0);
    box(g, 1.0, 0.025, 0.8, M.steelDark, 0, 0.1, 0);
    // أنابيب حرارية
    for (let i = 0; i < 6; i++) {
      const px = -0.35 + i * 0.14;
      cyl(g, 0.028, 0.028, 1.35, 10, M.copper, px, 0.78, 0.18, {});
      cyl(g, 0.028, 0.028, 0.28, 10, M.copper, px, 0.15, 0.05, { rx: Math.PI / 2 });
      cyl(g, 0.03, 0.03, 0.06, 10, M.steelDark, px, 1.48, 0.18, {});
    }
    // زعانف المبرد
    const fins = new T.Group(); fins.position.set(0, 0.3, 0.2); g.add(fins);
    for (let i = 0; i < 42; i++) box(fins, 1.24, 0.012, 0.62, M.steel, 0, i * 0.028, 0, { cast: false });
    // غطاء علوي
    rbox(g, 1.28, 0.05, 0.66, 0.02, M.aluminumBlack, 0, 1.48, 0.2);
    decal(g, "NOVA  D15", 0.6, 0.16, 0, 1.51, 0.2, { rx: -Math.PI / 2, fontSize: 46, color: "#c6d1da" });
    const f = fan({ size: 1.18, depth: 0.24, blades: 7, speed: 2.4, ringColor: 0x2bd9ff, frameMat: M.plasticBlack, bladeMat: M.fanBladeLight });
    f.position.set(0.04, 0.83, 0.66); g.add(f);
    // أسلاك التثبيت
    box(g, 0.03, 0.72, 0.02, M.steelDark, -0.56, 0.82, 0.55, { cast: false });
    box(g, 0.03, 0.72, 0.02, M.steelDark, 0.64, 0.82, 0.55, { cast: false });
    tag(g, "مبرد هوائي برجي", "6 أنابيب حرارية و42 زعنفة ألمنيوم مع مروحة 120mm؛ هادئ وقوي وبلا خطر تسريب.");
    return H.ticks(g);
  }
  function buildAIOStandalone() {
    const g = new T.Group(); g.name = "aio";
    // مشعاع واقف
    const rad = buildRadiator(2.9, 1.2, 0.28, { fittings: true, fans: false });
    rad.position.set(0.45, 1.4, -1.15); g.add(rad);
    // قواعد
    box(g, 0.9, 0.3, 0.5, M.metalDark, 0.45, 0.2, -1.0, { cast: false });
    // مروحتان خلف المشعاع
    for (let i = 0; i < 2; i++) {
      const f = fan({ size: 1.16, depth: 0.23, blades: 7, speed: 2.1, ringColor: 0x2bd9ff, frameMat: M.plasticBlack, hubLabel: "NOVA" });
      f.position.set(-0.27 + i * 1.2, 1.4, -1.35); g.add(f);
    }
    // مضخة
    const pump = buildPump(); pump.position.set(-1.55, 0.55, 0.25); pump.rotation.x = -0.08; g.add(pump);
    // قاعدة المضخة
    box(g, 0.7, 0.24, 0.5, M.aluminumBlack, -1.55, 0.12, 0.25);
    // أنابيب
    const tubePts1 = [[-1.45, 0.85, 0.05], [-1.2, 1.3, -0.35], [-0.4, 1.9, -0.85], [0.4, 2.05, -1.1], [0.8, 1.85, -1.18]];
    const tubePts2 = [[-1.35, 0.85, 0.1], [-1.05, 1.35, -0.28], [-0.2, 1.85, -0.8], [0.55, 1.95, -1.05], [0.95, 1.8, -1.14]];
    cable(g, tubePts1, 0.055, M.sleeve, { seg: 40 });
    cable(g, tubePts2, 0.055, M.sleeve, { seg: 40 });
    // وصلات كروم
    cyl(g, 0.075, 0.075, 0.18, 16, M.steel, -1.4, 0.9, 0.05, { rx: 0.4, rz: 0.2 });
    cyl(g, 0.075, 0.075, 0.18, 16, M.steel, -1.3, 0.9, 0.1, { rx: 0.4, rz: 0.1 });
    tag(rad, "مشعاع AIO 240mm", "زعانف ألمنيوم كثيفة ومروحتان تصرفان حرارة المعالج إلى خارج الكيس.");
    tag(pump, "مضخة التبريد السائل", "مضخة صغيرة تدير سائل التبريد في حلقة مغلقة؛ رأس المضخة نفسه يبرد عبر السائل.");
    return H.ticks(g);
  }
  function buildRadiator(w, h, d, opts) {
    opts = opts || {};
    const g = new T.Group();
    // إطار
    const frameMat = M.plasticBlack;
    box(g, w, 0.08, d, frameMat, 0, h / 2 - 0.04, 0);
    box(g, w, 0.08, d, frameMat, 0, -h / 2 + 0.04, 0);
    box(g, 0.08, h, d, frameMat, -w / 2 + 0.04, 0, 0);
    box(g, 0.08, h, d, frameMat, w / 2 - 0.04, 0, 0);
    // زعانف
    for (let i = 0; i < 46; i++) box(g, 0.012, h - 0.12, d - 0.05, M.steelDark, -w / 2 + 0.12 + i * ((w - 0.24) / 45), 0, 0, { cast: false });
    // أنابيب أفقية
    for (let i = 0; i < 7; i++) box(g, w - 0.16, 0.015, 0.045, M.steel, 0, -h / 2 + 0.15 + i * ((h - 0.3) / 6), d * 0.28, { cast: false });
    // خزانات الأطراف
    rbox(g, 0.2, h, d, 0.03, M.metalDark, -w / 2 + 0.1, 0, 0);
    rbox(g, 0.2, h, d, 0.03, M.metalDark, w / 2 - 0.1, 0, 0);
    decal(g, "NOVA  LIQUID 240", 0.7, 0.11, 0, h / 2 - 0.14, d / 2 + 0.001, { fontSize: 36, color: "#b9c6d0" });
    if (opts.fans) {
      for (let i = 0; i < 2; i++) {
        const f = fan({ size: 1.16, depth: 0.22, blades: 7, speed: 2.0, ringColor: 0x2bd9ff });
        f.position.set(-w / 4 + i * (w / 2), 0, d / 2 + 0.14);
        g.add(f);
      }
    }
    if (opts.fittings) {
      [-0.06, 0.06].forEach(function (zoff, idx) {
        const fit = new T.Group(); fit.position.set(-w / 2 + 0.12, -h / 2 + 0.25, zoff); g.add(fit);
        cyl(fit, 0.065, 0.065, 0.16, 16, M.steel, 0, 0, 0, { rz: Math.PI / 2 });
        cyl(fit, 0.06, 0.06, 0.18, 16, M.steel, 0.06, 0.1, 0, { rz: Math.PI / 2, rx: 0.4 });
      });
    }
    return H.ticks(g);
  }
  function buildPump() {
    const g = new T.Group();
    cyl(g, 0.3, 0.32, 0.22, 32, M.metalDark, 0, 0, 0.11, { rx: Math.PI / 2 });
    const face = new T.Group(); face.position.z = 0.23; g.add(face);
    cyl(face, 0.3, 0.3, 0.02, 32, M.aluminumBlack, 0, 0, 0, { rx: Math.PI / 2 });
    torus(face, 0.25, 0.018, M.ledCyan, 0, 0, 0.015, { seg: 44, tseg: 6, cast: false, receive: false });
    cyl(face, 0.17, 0.17, 0.012, 28, new T.MeshStandardMaterial({ color: 0x0c1014, roughness: 0.15, metalness: 0.6 }), 0, 0, 0.02, { rx: Math.PI / 2 });
    decal(face, "NOVA", 0.17, 0.05, 0, 0, 0.032, { fontSize: 50, color: "#eaf6fb", emissive: "#aeeaff", emissiveIntensity: 1.1 });
    // منافذ خرطوم
    cyl(g, 0.06, 0.06, 0.18, 16, M.steel, 0.16, 0.28, 0.06, { rx: 0.4, rz: -0.2 });
    cyl(g, 0.06, 0.06, 0.18, 16, M.steel, -0.05, 0.3, 0.06, { rx: 0.4, rz: 0.2 });
    return H.ticks(g);
  }
  function buildCoolingPage() {
    const root = new T.Group();
    rbox(root, 5.4, 0.12, 3.5, 0.04, M.stage, 0, 0.04, 0);
    H.stageDeck(root, 5.1, 3.2, 0.125);
    const air = buildAirCooler(); air.position.set(-1.85, 0.13, 0.15); air.rotation.y = 0.32; root.add(air);
    const aio = buildAIOStandalone(); aio.position.set(0.9, 0.13, 0.25); aio.rotation.y = -0.25; root.add(aio);
    const f = fan({ size: 1.2, depth: 0.26, blades: 7, speed: 2.4, ringColor: 0x2bd9ff });
    f.position.set(1.95, 0.85, 1.0); f.rotation.set(-0.12, -0.6, 0.04); root.add(f);
    const stand = new T.Group(); root.add(stand);
    box(stand, 0.5, 0.07, 0.5, M.stage, 1.95, 0.17, 1.0);
    box(stand, 0.08, 0.55, 0.08, M.metalDark, 1.95, 0.43, 1.0, { rz: 0.06 });
    tag(aio, "تبريد سائل AIO", "حلقة سائل مغلقة + مشعاع 240mm: أفضل للكسرات الحرارية وأشكال أنظف داخل الكيس.");
    return H.ticks(root);
  }
  H.register("cooling", buildCoolingPage);
  pc.aio = buildAIOStandalone; pc.radiator = buildRadiator; pc.pump = buildPump; pc.airCooler = buildAirCooler;

  /* ============================================================
     الكيس المكتبي المفتوح — القطعة الرئيسية
     ============================================================ */
  function buildCasePage(opts) {
    opts = opts || {};
    const root = new T.Group(); root.name = "pcCase";
    const X = 4.6, Y = 4.6, Z = 2.1;
    const xr = -X / 2, xf = X / 2, zb = -Z / 2, zg = Z / 2;
    const yTop = 4.55;

    /* ---------- أرجل ---------- */
    [-1.75, 1.75].forEach(function (fx) {
      box(root, 0.7, 0.14, 1.7, M.aluminumBlack, fx, 0.07, 0);
      box(root, 0.72, 0.03, 1.72, M.rubber, fx, 0.02, 0);
      box(root, 0.08, 0.02, 1.2, M.ledCyan, fx, 0.04, 0, { cast: false, receive: false });
    });

    /* ---------- الهيكل ---------- */
    // قاع
    box(root, X, 0.06, Z, M.metalDark, 0, 0.17, 0);
    // سقف (إطار)
    box(root, X, 0.08, 0.08, M.metalDark, 0, yTop, zb);
    box(root, X, 0.08, 0.08, M.metalDark, 0, yTop, zg);
    box(root, 0.08, 0.08, Z, M.metalDark, xr, yTop, 0);
    box(root, 0.08, 0.08, Z, M.metalDark, xf, yTop, 0);
    // شبك السقف
    const topMesh = new T.Mesh(new T.PlaneGeometry(X - 0.28, Z - 0.26), M.mesh);
    topMesh.rotation.x = -Math.PI / 2; topMesh.position.y = yTop - 0.005; root.add(topMesh);
    // إطار داخلي علوي
    box(root, X - 0.1, 0.05, 0.04, M.aluminumBlack, 0, yTop - 0.12, zb + 0.05, { cast: false });
    box(root, X - 0.1, 0.05, 0.04, M.aluminumBlack, 0, yTop - 0.12, zg - 0.05, { cast: false });
    // قضبان الحافة الزجاجية
    box(root, X, 0.05, 0.05, M.aluminumBlack, 0, 0.25, zg + 0.01);
    box(root, X, 0.05, 0.05, M.aluminumBlack, 0, yTop - 0.18, zg + 0.01);
    box(root, 0.05, Y - 0.3, 0.07, M.aluminumBlack, xf - 0.02, Y / 2, zg + 0.01);
    box(root, 0.05, Y - 0.3, 0.07, M.aluminumBlack, xr + 0.02, Y / 2, zg + 0.01);
    // لوحة الظهر مع قطع لمنافذ اللوحة
    // شرائح حول فتحة I/O
    box(root, 0.06, 0.55, Z, M.metalDark, xr, 4.15, 0);
    box(root, 0.06, 0.5, Z, M.metalDark, xr, 0.45, 0);
    box(root, 0.06, 1.15, Z, M.metalDark, xr, 1.4, 0);
    box(root, 0.06, 2.0, 0.55, M.metalDark, xr, 3.1, -0.77);
    box(root, 0.06, 2.0, 0.62, M.metalDark, xr, 3.1, 0.74);
    // شبك خلفي للمروحة
    const rearMesh = new T.Mesh(new T.CircleGeometry(0.58, 40), M.mesh);
    rearMesh.rotation.y = -Math.PI / 2; rearMesh.position.set(xr - 0.035, 2.98, 0.45); root.add(rearMesh);
    torus(root, 0.6, 0.022, M.aluminumBlack, xr - 0.04, 2.98, 0.45, { ry: Math.PI / 2, seg: 40 });
    // بطاقات التوسعة الخارجية
    for (let i = 0; i < 6; i++) {
      box(root, 0.03, 0.15, 0.9, M.metalDark, xr - 0.025, 1.15 + i * 0.21, 0.1);
      for (let s = 0; s < 5; s++) box(root, 0.012, 0.1, 0.07, M.plasticBlack, xr - 0.05, 1.15 + i * 0.21, -0.28 + s * 0.18, { cast: false });
    }
    // مقبس الطاقة على الظهر (غطاء خارجي)
    const psuBack = new T.Group(); psuBack.position.set(xr - 0.04, 0.62, 0.12); root.add(psuBack);
    box(psuBack, 0.05, 0.72, 0.95, M.metalDark, 0, 0, 0);
    box(psuBack, 0.03, 0.26, 0.4, M.plasticBlack, -0.03, 0.0, 0.12);
    box(psuBack, 0.04, 0.12, 0.14, M.plasticRed, -0.04, 0.0, 0.42);
    for (let i = 0; i < 6; i++) box(psuBack, 0.02, 0.02, 0.5, M.steelDark, -0.03, -0.3 + i * 0.04, 0.0, { cast: false });
    // منافذ اللوحة الخلفية تظهر من الفتحة
    // ستارة غبار أسفل
    plane(root, X - 0.5, 0.5, M.dust, 0, 0.42, 0.0, { rx: -Math.PI / 2, ry: 0, cast: false });
    // شريط RGB علوي
    box(root, X - 0.5, 0.015, 0.02, M.ledCyan, 0, yTop - 0.13, zg + 0.04, { cast: false, receive: false });

    /* ---------- علبة مزود الطاقة والكابلات ---------- */
    const shroud = new T.Group(); root.add(shroud);
    box(shroud, 4.25, 0.05, 1.95, M.metalDark, -0.05, 1.02, 0);
    // واجهة زجاجية مع نافذة
    box(shroud, 4.25, 0.05, 0.04, M.metalDark, -0.05, 0.65, zg - 0.06);
    box(shroud, 4.25, 0.04, 0.04, M.metalDark, -0.05, 0.25, zg - 0.06);
    box(shroud, 0.5, 0.8, 0.04, M.metalDark, 1.9, 0.65, zg - 0.06);
    box(shroud, 1.2, 0.8, 0.04, M.metalDark, -1.85, 0.65, zg - 0.06);
    // نافذة مطموسة
    box(shroud, 2.5, 0.55, 0.015, M.glassDark, 0.4, 0.63, zg - 0.05, { cast: false });
    box(shroud, 2.55, 0.03, 0.03, M.ledCyan, 0.4, 0.92, zg - 0.04, { cast: false, receive: false });
    decal(shroud, "NOVA  POWER", 0.5, 0.06, 0.5, 0.63, zg - 0.035, { fontSize: 30, color: "#7d8e9e" });
    // فتحات تهوية علوية
    for (let i = 0; i < 11; i++) box(shroud, 0.12, 0.006, 0.55, M.plasticBlack, -1.5 + i * 0.22, 1.047, -0.35, { cast: false });
    tag(shroud, "علبة الطاقة", "تخفي مزود الطاقة والكابلات وتمنح الكيس مظهراً نظيفاً مع نافذة زجاجية للعرض.");

    // PSU
    const psu = pc.psu({ cables: false });
    psu.position.set(-1.45, 0.6, 0);
    psu.rotation.y = Math.PI / 2;
    shroud.add(psu);
    // واجهة PSU تظهر في النافذة
    decal(shroud, "GX-850  ·  80+ GOLD", 0.7, 0.12, 0.4, 0.62, zg - 0.032, { fontSize: 34, color: "#c8b06a", emissive: "#b9963f", emissiveIntensity: 0.25 });
    // أقراص SSD على العلبة
    const ssd1 = pc.ssd({open:false}); H.stripHotspots(ssd1); ssd1.scale.set(0.85, 0.85, 0.85); ssd1.position.set(1.25, 1.06, 0.25); ssd1.rotation.y = 0.2; shroud.add(ssd1);
    const ssd2 = pc.ssd({open:false}); H.stripHotspots(ssd2); ssd2.scale.set(0.85, 0.85, 0.85); ssd2.position.set(1.35, 1.06, -0.35); ssd2.rotation.y = -0.1; ssd2.rotation.z = 0.02; shroud.add(ssd2);
    tag(ssd1, "أقراص SSD", "مثبتة على علبة الطاقة: وصول سريع وسهل للترقية دون فك الكيس بالكامل.");

    /* ---------- اللوحة الأم ومكوناتها ---------- */
    const mobo = pc.buildMotherboard({}); H.stripHotspots(mobo);
    mobo.position.set(-0.78, 2.6, -0.62);
    root.add(mobo);
    const refs = mobo.userData.refs || {};
    tag(mobo, "اللوحة الأم", "ATX كاملة: تربط المعالج والذاكرة والتخزين والطاقة في شبكة واحدة.");
    tag(refs.ram, "الذاكرة RAM", "64GB DDR5 بأربع شرائح — تتسع لمئات التبويبات وبرامج المونتاج الثقيلة.");
    const cpuCoolerPump = buildPump();
    cpuCoolerPump.position.set(-1.1, 3.36, -0.42);
    root.add(cpuCoolerPump);
    // قاعدة نحاسية
    cyl(root, 0.24, 0.24, 0.06, 28, M.copper, -1.1, 3.36, -0.55, { rx: Math.PI / 2 });
    tag(cpuCoolerPump, "مضخة التبريد السائل", "تلامس المعالج بقاعدة نحاسية وتمرر الحرارة بسائل إلى المشعاع العلوي.");

    // مشعاع أعلى الكيس + مراوح
    const aio = new T.Group(); root.add(aio);
    const radG = buildRadiator(2.85, 1.2, 0.27, { fittings: true, fans: false });
    radG.rotation.x = -Math.PI / 2;
    radG.position.set(-0.55, 4.32, -0.15);
    aio.add(radG);
    for (let i = 0; i < 2; i++) {
      const f = fan({ size: 1.17, depth: 0.22, blades: 7, speed: 2.2, ringColor: 0x2bd9ff, frameMat: M.plasticBlack, hubLabel: "NOVA" });
      f.rotation.x = -Math.PI / 2;
      f.position.set(-1.28 + i * 1.2, 4.47, -0.15);
      aio.add(f);
    }
    // أنابيب
    cable(root, [[-1.06, 3.62, -0.36], [-1.2, 3.95, -0.3], [-1.5, 4.12, -0.22], [-1.68, 4.22, -0.28], [-1.5, 4.3, -0.5]], 0.052, M.sleeve, { seg: 28 });
    cable(root, [[-0.98, 3.6, -0.32], [-1.05, 3.98, -0.2], [-1.35, 4.14, -0.12], [-1.55, 4.22, -0.18]], 0.052, M.sleeve, { seg: 26 });
    tag(aio, "تبريد المعالج AIO", "مشعاع 240mm في الأعلى ومضخة على المعالج: حرارة أقل وضوضاء أخفض تحت الضغط.");

    /* ---------- كرت الشاشة ---------- */
    const gpu = pc.buildGPU({}); H.stripHotspots(gpu);
    gpu.position.set(-0.58, 1.98, -0.28);
    root.add(gpu);
    tag(gpu, "كرت الشاشة", "وحش الألعاب: 16GB GDDR7 وثلاث مراوح؛ يعالج ملايين المثلثات والذكاء الاصطناعي.");
    // دعامة مكافحة الترهل
    const brace = new T.Group(); brace.position.set(0.6, 1.15, 0.02); root.add(brace);
    box(brace, 0.08, 0.82, 0.08, M.metalDark, 0, 0.42, 0);
    box(brace, 0.42, 0.06, 0.26, M.steelDark, 0, 0.84, 0.02);
    box(brace, 0.34, 0.04, 0.22, M.rubber, 0, 0.88, 0.02);
    tag(brace, "دعامة كرت الشاشة", "تدعم وزن البطاقة الطويلة وتمنع انحناء فتحة PCIe مع مرور الوقت.");

    /* ---------- مراوح أمامية ---------- */
    const frontFans = new T.Group(); root.add(frontFans);
    for (let i = 0; i < 3; i++) {
      const f = fan({ size: 1.18, depth: 0.25, blades: 7, speed: 2.7, ringColor: 0x2bd9ff, frameMat: M.plasticBlack, hubLabel: "NOVA" });
      f.rotation.y = Math.PI / 2;
      f.position.set(2.07, 1.55 + i * 1.2, 0);
      frontFans.add(f);
    }
    tag(frontFans, "مراوح السحب الأمامية", "ثلاث مراوح ARGB تسحب الهواء البارد عبر الشبك والفلتر وتدفعه نحو المعالج وكرت الشاشة.");
    // ذراع حمل الكابلات
    box(root, 0.06, 0.06, 1.5, M.metalDark, 0.8, 3.9, -0.5, { cast: false });
    // مروحة خلفية
    const rearFan = fan({ size: 1.18, depth: 0.24, blades: 7, speed: 2.2, ringColor: 0xffb12e, frameMat: M.plasticBlack, hubLabel: "NOVA" });
    rearFan.rotation.y = -Math.PI / 2;
    rearFan.position.set(-2.05, 2.98, 0.45);
    root.add(rearFan);
    tag(rearFan, "مروحة العادم الخلفية", "تطرد الهواء الساخن خارج الكيس وتكمل مسار التبريد من الأمام إلى الخلف.");

    /* ---------- الواجهة الأمامية ---------- */
    const front = new T.Group(); root.add(front);
    // إطار
    box(front, 0.08, Y - 0.25, Z, M.metalDark, xf, Y / 2 + 0.05, 0);
    // شبك أمامي
    const fm = new T.Mesh(new T.PlaneGeometry(Z - 0.18, Y - 0.5), M.mesh);
    fm.rotation.y = Math.PI / 2; fm.position.set(xf + 0.045, 2.32, 0); front.add(fm);
    plane(front, Z - 0.22, Y - 0.55, M.dust, xf + 0.02, 2.32, 0, { ry: Math.PI / 2, cast: false });
    // إطار شبكي زاوي
    for (let i = 0; i < 5; i++) {
      box(front, 0.06, 0.05, Z - 0.1, M.aluminumBlack, xf + 0.06, 0.55 + i * 0.9, 0);
    }
    // شريط RGB أمامي عمودي
    box(front, 0.02, 3.2, 0.03, M.ledCyan, xf + 0.075, 2.35, 0.9, { cast: false, receive: false });
    // شعار
    decal(front, "NOVA", 0.55, 0.18, xf + 0.085, 0.58, 0.65, { fontSize: 70, color: "#e8f4fb", ry: Math.PI / 2, emissive: "#bdeeff", emissiveIntensity: 0.35 });
    decal(front, "AIRFLOW  ·  ATX  ·  TG", 0.5, 0.05, xf + 0.085, 0.45, -0.4, { fontSize: 26, color: "#7b8a96", ry: Math.PI / 2 });
    // منافذ أمامية علوية
    const fio = new T.Group(); fio.position.set(2.05, yTop + 0.005, 0.0); root.add(fio);
    box(fio, 0.55, 0.06, 0.9, M.metalDark, 0, 0, 0);
    const pbtn = cyl(fio, 0.06, 0.06, 0.025, 24, M.metalDark, -0.15, 0.04, -0.28, {});
    torus(fio, 0.055, 0.008, M.ledCyan, -0.15, 0.05, -0.28, { rx: -Math.PI / 2, seg: 32, cast: false, receive: false });
    box(fio, 0.13, 0.03, 0.08, M.plasticBlack, 0.05, 0.04, -0.28);
    box(fio, 0.13, 0.03, 0.08, M.plasticBlack, 0.05, 0.04, -0.14);
    box(fio, 0.09, 0.03, 0.06, M.plasticBlack, 0.05, 0.04, 0.0);
    cyl(fio, 0.025, 0.025, 0.01, 14, M.ledGreen, -0.13, 0.055, 0.2, { cast: false });
    cyl(fio, 0.025, 0.025, 0.01, 14, M.ledGreen, -0.13, 0.055, 0.3, { cast: false });
    tag(front, "الواجهة الأمامية", "شبك هواء عالي التدفق + فلتر غبار + شعار مضيء + منافذ USB أمامية سريعة الوصول.");

    /* ---------- الزجاج الجانبي (اختياري) ---------- */
    const glass = new T.Group(); glass.position.set(0, 2.35, zg + 0.045); root.add(glass);
    const gp = new T.Mesh(new T.BoxGeometry(X - 0.12, 4.18, 0.03), M.glass);
    gp.castShadow = false; gp.receiveShadow = false; glass.add(gp);
    box(glass, X - 0.1, 0.04, 0.035, M.aluminumBlack, 0, 2.1, 0.01, { cast: false });
    box(glass, X - 0.1, 0.04, 0.035, M.aluminumBlack, 0, -2.1, 0.01, { cast: false });
    [[-2.15, 1.95], [2.15, 1.95], [-2.15, -1.95], [2.15, -1.95]].forEach(function (p) { screw(glass, p[0], p[1], 0.03, 0.04, null, M.steel); });
    decal(glass, "TEMPERED GLASS", 0.4, 0.05, 1.7, -1.95, 0.035, { fontSize: 28, color: "#8fa9b6", transparent: true });
    glass.visible = false;
    root.userData.glass = glass;
    tag(glass, "اللوحة الزجاجية", "زجاج مقوّى ملوّن يعرض القطع ويعزل الغبار؛ افتحها بحذر من الحواف.");

    /* ---------- الكابلات ---------- */
    const cableGrp = new T.Group(); root.add(cableGrp);
    // 24-pin
    cable(cableGrp, [[-0.8, 1.05, -0.35], [-0.55, 1.25, -0.7], [0.0, 1.8, -0.78], [0.32, 2.5, -0.66], [0.32, 2.72, -0.48]], 0.048, M.sleeve, { seg: 32, radial: 6 });
    cable(cableGrp, [[-0.72, 1.05, -0.28], [-0.45, 1.28, -0.65], [0.08, 1.84, -0.74], [0.4, 2.52, -0.62], [0.38, 2.72, -0.47]], 0.032, M.sleeveRed, { seg: 30 });
    // GPU power
    cable(cableGrp, [[-0.9, 1.05, -0.2], [-0.2, 1.3, -0.55], [0.2, 2.1, -0.68], [0.1, 2.58, -0.42], [-0.05, 2.69, -0.25]], 0.036, M.sleeve, { seg: 30 });
    cable(cableGrp, [[-0.85, 1.05, -0.1], [-0.05, 1.25, -0.48], [0.35, 2.12, -0.6], [0.28, 2.6, -0.36], [0.12, 2.69, -0.2]], 0.036, M.sleeveRed, { seg: 30 });
    // EPS 8-pin
    cable(cableGrp, [[-1.25, 1.05, -0.45], [-1.55, 2.2, -0.9], [-1.4, 3.8, -0.85], [-1.33, 3.98, -0.56]], 0.04, M.sleeve, { seg: 30 });
    // كابلات المراوح و RGB
    cable(cableGrp, [[1.4, 1.08, -0.35], [1.1, 1.7, -0.85], [0.6, 2.3, -0.9], [0.5, 2.7, -0.75]], 0.018, M.cableGrey, { seg: 24 });
    cable(cableGrp, [[1.6, 1.08, -0.2], [1.3, 1.9, -0.9], [0.8, 2.6, -0.88], [0.6, 3.0, -0.75]], 0.016, M.sleeve, { seg: 24 });
    // أمشاط الكابلات
    for (let i = 0; i < 2; i++) {
      box(cableGrp, 0.26, 0.03, 0.09, M.aluminumBlack, 0.18, 2.32 + i * 0.17, -0.67, { rz: 0.3, cast: false });
    }
    // كابل SATA / طاقة SSD
    cable(cableGrp, [[1.05, 1.08, -0.1], [1.6, 1.25, -0.25], [1.55, 1.16, 0.25]], 0.02, M.cableBlue, { seg: 18 });
    // شريط RGB علوي داخلي
    box(cableGrp, 3.9, 0.015, 0.02, M.ledAmber, 0, 1.08, zg - 0.09, { cast: false, receive: false });

    // بطاقة الشرائح/المنافذ الخلفية للعرض
    // صناديق RGB
    [[-1.9, zg - 0.06], [1.9, zg - 0.06]].forEach(function (p) {
      box(root, 0.05, 0.05, 0.03, M.ledCyan, p[0], 1.07, p[1], { cast: false, receive: false });
    });

    /* ---------- تفكيك ---------- */
    const explode = [
      [gpu, 0, 0.15, 1.45],
      [refs.ram, 0, 0.1, 1.5],
      [aio, 0, 1.25, 0],
      [frontFans, 1.15, 0, 0],
      [shroud, 0, -0.35, 0.65],
      [ssd1, 0, 0.3, 0.9],
      [front, 0.85, 0, 0],
      [rearFan, -0.9, 0, 0]
    ];
    explode.forEach(function (e) { H.explode(root, e[0], e[1], e[2], e[3]); });

    root.userData.refs = {
      mobo: mobo, gpu: gpu, ram: refs.ram, aio: aio, frontFans: frontFans, rearFan: rearFan,
      psuShroud: shroud, ssd: ssd1, front: front, glass: glass, pump: cpuCoolerPump, psus: psu
    };
    root.userData.meta = { size: [X, Y, Z], parts: 9 };
    return H.ticks(root);
  }
  pc.casePage = buildCasePage;
  H.register("case", function () { return buildCasePage({}); });
  H.register("assembly", function () { return buildCasePage({}); });
  pc.buildRadiator = buildRadiator;
  pc.buildPump = buildPump;
  pc.buildStoragePage = buildStoragePage;
  pc.buildCoolingPage = buildCoolingPage;
})();
