/* ============================================================
   HWM · قطع الحاسوب الداخلية (1): اللوحة الأم، الذاكرة، GPU، PSU
   الإحداثيات: سنتيمتر واحد = 0.1 وحدة — اتجاه القطع +Z
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const pc = (H.pc = H.pc || {});
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, screw = u.screw, decal = u.decal, fan = u.fan, cable = u.cable;

  function tag(obj, label, desc) { return H.hotspot(obj, label, desc); }

  /* ============================================================
     اللوحة الأم — ATX 24.4 × 30.5 سم
     ============================================================ */
  function cap(parent, x, y, z, r, hgt, topMat, o) {
    o = o || {};
    const g = new T.Group(); g.position.set(x, y, z);
    cyl(g, r, r, hgt, 18, M.capAlu, 0, 0, hgt / 2, { rx: Math.PI / 2, rz: 0 });
    cyl(g, r * 0.94, r * 0.94, 0.012, 18, topMat || M.plasticBlack, 0, 0, hgt + 0.006, { rx: Math.PI / 2 });
    box(g, r * 1.1, 0.012, 0.02, M.metalDark, 0, 0, hgt + 0.014, { cast: false });
    box(g, 0.012, r * 1.1, 0.02, M.metalDark, 0, 0, hgt + 0.014, { cast: false });
    parent.add(g);
    return g;
  }
  function choke(parent, x, y, z, w) {
    const g = new T.Group(); g.position.set(x, y, z);
    rbox(g, w || 0.19, 0.16, 0.14, 0.03, M.plasticCharcoal, 0, 0, 0.07);
    box(g, (w || 0.19) * 0.62, 0.09, 0.005, M.metalDark, 0, 0, 0.142, { cast: false });
    decal(g, "R22", 0.1, 0.04, 0, 0.02, 0.146, { fontSize: 44, color: "#c9cfd6" });
    parent.add(g);
    return g;
  }
  function pinHeader(parent, x, y, z, w, h, rows, cols, vertical) {
    const g = new T.Group(); g.position.set(x, y, z);
    box(g, w, h, 0.10, M.plasticBlack, 0, 0, 0.05);
    const pw = w / (cols * 2 + 1), ph = h / (rows * 2 + 1);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      box(g, pw * 0.65, ph * 0.65, 0.025, M.gold, -w / 2 + pw * (c * 2 + 1.5), h / 2 - ph * (r * 2 + 1.5), 0.11, { cast: false });
    }
    parent.add(g);
    return g;
  }

  function buildMotherboard(opts) {
    opts = opts || {};
    const root = new T.Group(); root.name = "motherboard";
    const W = 2.44, Ht = 3.05, TH = 0.062;

    const topMat = new T.MeshStandardMaterial({
      color: 0xffffff, map: H.pcbTex(opts.seed || 31, true), roughness: 0.5, metalness: 0.26
    });
    const sideMat = M.plasticBlack;
    const bm = new T.Mesh(new T.BoxGeometry(W, Ht, TH), [sideMat, sideMat, sideMat, sideMat, topMat, sideMat]);
    bm.position.z = 0; bm.castShadow = true; bm.receiveShadow = true;
    root.add(bm);
    // إطار معدني خلفي / حواف
    box(root, W + 0.02, 0.02, TH + 0.01, M.metalDark, 0, Ht / 2, 0, { cast: false });

    // ثقوب براغي وستاند أوف
    const screwPts = [[-1.03, 1.31], [-1.03, 0.0], [-1.03, -1.31], [0.0, 1.31], [0.0, -1.31], [1.03, 1.31], [1.03, 0.0], [1.03, -1.31], [-0.2, -1.31]];
    screwPts.forEach(function (p) {
      cyl(root, 0.045, 0.045, 0.025, 10, M.steel, p[0], p[1], 0.045, { rx: Math.PI / 2, cast: false });
      screw(root, p[0], p[1], 0.058, 0.032, null, M.metalDark);
    });

    /* ---------- مقبس المعالج ---------- */
    const socket = new T.Group(); socket.position.set(-0.32, 0.78, 0.035); root.add(socket);
    box(socket, 0.67, 0.67, 0.06, M.metalDark, 0, 0, 0.03);
    box(socket, 0.58, 0.58, 0.03, M.plasticBlack, 0, 0, 0.065);
    box(socket, 0.5, 0.5, 0.02, M.gold, 0, 0, 0.078, { cast: false });
    // ذراع التثبيت
    cyl(socket, 0.012, 0.012, 0.66, 8, M.steel, -0.34, 0.02, 0.11, { rz: Math.PI / 2, cast: false });
    const lever = new T.Group(); lever.position.set(-0.36, 0.33, 0.10); lever.rotation.z = -0.5; socket.add(lever);
    cyl(lever, 0.012, 0.012, 0.22, 8, M.steel, 0, 0, 0, { rz: Math.PI / 2 });
    torus(lever, 0.06, 0.012, M.steel, 0.12, 0, 0, { arc: Math.PI * 1.2, rz: Math.PI / 2 });
    tag(socket, "مقبس المعالج", "حاضنة LGA بآلاف الإبر الدقيقة، تثبّت المعالج وتوصل بياناته باللوحة.");

    // المعالج المركّب
    const cpu = new T.Group(); cpu.position.set(0, 0, 0.09); socket.add(cpu);
    box(cpu, 0.48, 0.48, 0.025, M.greenPCB, 0, 0, 0);
    // IHS
    rbox(cpu, 0.4, 0.4, 0.075, 0.035, M.steel, 0, 0, 0.05);
    decal(cpu, "NOVA\nRYZEN 9", 0.24, 0.16, 0, 0.015, 0.089, { fontSize: 46, color: "#c7ced6", font: "700 46px 'Segoe UI', Arial" });
    decal(cpu, "9 9950X  ·  16C/32T", 0.28, 0.035, 0, -0.11, 0.089, { fontSize: 34, color: "#9aa3ad" });
    tag(cpu, "المعالج CPU", "الدماغ: 16 نواة و32 خيطاً، ينفّذ مليارات التعليمات في الثانية.");
    tag(socket, "المقبس LGA", "أرضية معدنية بآلاف الأسنان الذهبية، حساسة جداً — لا تلمسها أبداً بإصبعك.");

    /* ---------- مراحل الطاقة VRM ---------- */
    const vrmTop = new T.Group(); vrmTop.position.set(-0.28, 1.2, 0.14); root.add(vrmTop);
    box(vrmTop, 0.95, 0.3, 0.18, M.metalDark, 0, 0, 0);
    for (let i = 0; i < 11; i++) box(vrmTop, 0.012, 0.27, 0.2, M.steelDark, -0.42 + i * 0.085, 0, 0.02, { cast: false });
    decal(vrmTop, "16+2+2 PHASE", 0.4, 0.06, 0, 0.02, 0.145, { fontSize: 44, color: "#8f9aa5" });
    const vrmLeft = new T.Group(); vrmLeft.position.set(-1.02, 0.6, 0.14); root.add(vrmLeft);
    box(vrmLeft, 0.3, 0.85, 0.18, M.metalDark, 0, 0, 0);
    for (let i = 0; i < 9; i++) box(vrmLeft, 0.32, 0.012, 0.2, M.steelDark, 0, -0.38 + i * 0.095, 0.02, { cast: false });
    // أنابيب حرارية
    cyl(root, 0.03, 0.03, 0.7, 10, M.copper, -0.75, 1.05, 0.2, { rz: Math.PI / 2, cast: false });
    cyl(root, 0.03, 0.03, 0.5, 10, M.copper, -0.95, 0.82, 0.2, { rx: Math.PI / 2, cast: false });
    for (let i = 0; i < 6; i++) choke(root, -0.02 + i * 0.14, 1.02, 0.07);
    for (let i = 0; i < 5; i++) choke(root, -0.92, 0.35 + i * 0.14, 0.07, 0.17);
    tag(vrmTop, "مراحل الطاقة VRM", "تنظّم جهد المعالج بدقة عالية؛ التبريد القوي هنا يعني كسر سرعة مستقراً.");
    tag(vrmTop, "VRM", "مكثفات وصلات ومحاثات تتحمل تياراً هائلاً — حمايتها مفتاح عمر اللوحة.");

    /* ---------- الرام DIMM ---------- */
    const slots = new T.Group(); root.add(slots);
    const slotXs = [0.17, 0.35, 0.53, 0.71];
    slotXs.forEach(function (sx, i) {
      const sg = new T.Group(); sg.position.set(sx, 0.66, 0.085); slots.add(sg);
      box(sg, 0.09, 1.5, 0.09, i % 2 ? M.plasticCharcoal : M.plasticBlack, 0, 0, 0);
      box(sg, 0.055, 1.36, 0.012, M.gold, 0, 0, 0.052, { cast: false });
      // لاقطا التثبيت
      box(sg, 0.1, 0.12, 0.12, M.plasticGrey, 0, 0.78, 0.02);
      box(sg, 0.1, 0.12, 0.12, M.plasticGrey, 0, -0.78, 0.02);
    });
    tag(slots, "شرائح الذاكرة DIMM", "4 فتحات DDR5 بقفل جانبي؛ تثبيت الزوج الأول في A2/B2 يمنح أفضل سرعة.");
    const ram = new T.Group(); ram.position.set(0.02, 0, 0.03); slots.add(ram);
    function stick(parent, sx) {
      const g = new T.Group(); g.position.set(sx, 0.68, 0.16);
      box(g, 0.075, 1.36, 0.03, M.greenPCB, 0, 0, 0);
      box(g, 0.012, 1.34, 0.4, M.gold, 0, -0.015, 0.01, { cast: false });
      const hs = new T.Group(); parent.add(hs);
      rbox(g, 0.115, 1.28, 0.36, 0.03, M.metalDark, 0, 0.02, 0);
      for (let i = 0; i < 7; i++) box(g, 0.125, 0.02, 0.3, M.steelDark, 0, 0.48 + i * 0.035, 0.01, { cast: false });
      decal(g, "NOVA", 0.2, 0.09, 0, 0.26, 0.187, { fontSize: 58, color: "#e7edf4", font: "800 58px 'Segoe UI', Arial" });
      decal(g, "DDR5 6000  CL30", 0.25, 0.035, 0, 0.12, 0.187, { fontSize: 30, color: "#9fd7e8" });
      const diff = box(g, 0.12, 0.075, 0.4, M.ledCyan, 0, 0.665, 0, { cast: false });
      // غطاء علوي معدني
      box(g, 0.125, 0.03, 0.41, M.aluminumBlack, 0, 0.71, 0, { cast: false });
      g.userData.rgbBar = diff;
      parent.add(g);
      return g;
    }
    stick(ram, slotXs[0] - 0.02);
    stick(ram, slotXs[1] - 0.02);
    stick(ram, slotXs[2] - 0.02);
    stick(ram, slotXs[3] - 0.02);
    tag(ram, "الذاكرة RAM", "4 شرائح DDR5 بسعة إجمالية 64GB — مساحة العمل اللحظية للمعالج.");

    /* ---------- فتحات PCIe ---------- */
    const pcie = new T.Group(); root.add(pcie);
    // x16 الأساسي مع تدعيم معدني
    const p1 = new T.Group(); p1.position.set(-0.3, -0.62, 0.1); pcie.add(p1);
    box(p1, 1.12, 0.11, 0.15, M.metalDark, 0, 0, 0);
    box(p1, 1.0, 0.055, 0.12, M.plasticBlack, 0, 0, 0.03);
    box(p1, 0.98, 0.018, 0.012, M.gold, 0, 0.02, 0.095, { cast: false });
    box(p1, 0.1, 0.14, 0.16, M.metalMid, 0.55, 0, 0.01);
    box(p1, 0.1, 0.14, 0.16, M.metalMid, -0.55, 0, 0.01);
    tag(p1, "فتحة PCIe 5.0 ×16", "أقوى فتحة توسعة: 16 مساراً للبيانات، مخصصة لكرت الشاشة وتدعم التثبيت الثقيل.");
    // x16 ثانوي
    const p2 = new T.Group(); p2.position.set(-0.3, -1.12, 0.1); pcie.add(p2);
    box(p2, 1.0, 0.1, 0.13, M.plasticBlack, 0, 0, 0);
    box(p2, 0.88, 0.016, 0.012, M.gold, 0, 0.02, 0.08, { cast: false });
    // x1 صغيرة
    box(pcie, 0.28, 0.09, 0.12, M.plasticBlack, 0.55, -0.38, 0.1);
    box(pcie, 0.2, 0.015, 0.01, M.gold, 0.55, -0.36, 0.17, { cast: false });
    tag(pcie, "فتحات التوسعة", "PCIe ×16 للشاشة، ×4 لكرت صوت أو شبكة، ×1 لبطاقات إضافية.");

    /* ---------- M.2 ورقاقة الشريحة ---------- */
    function m2(x, y, label) {
      const g = new T.Group(); g.position.set(x, y, 0.08); root.add(g);
      box(g, 0.95, 0.26, 0.03, M.plasticBlack, 0, 0, 0);
      box(g, 0.98, 0.29, 0.05, M.metalDark, 0, 0, 0.025);
      for (let i = 0; i < 7; i++) box(g, 0.9, 0.012, 0.052, M.steelDark, 0, -0.1 + i * 0.033, 0.035, { cast: false });
      decal(g, label, 0.5, 0.06, 0, 0.02, 0.056, { fontSize: 44, color: "#aeb8c4" });
      screw(g, -0.43, 0, 0.06, 0.03, null, M.metalDark);
      return g;
    }
    const m2a = m2(-0.22, -0.13, "M.2_1  PCIe 5.0 ×4");
    const m2b = m2(-0.22, -1.3, "M.2_2  PCIe 4.0 ×4");
    tag(m2a, "فتحة M.2", "منفذ أقراص NVMe سريع جداً (حتى 14GB/s) بلا كابلات ولا حجرة أقراص.");
    tag(m2b, "منفذ M.2 الإضافي", "يفتح مساحة تخزين فائقة السرعة بدون كابلات، لكن قد يقاسم سرعته منفذ SATA.");
    const chipset = new T.Group(); chipset.position.set(0.58, -0.72, 0.12); root.add(chipset);
    box(chipset, 0.55, 0.42, 0.12, M.metalDark, 0, 0, 0);
    box(chipset, 0.45, 0.32, 0.07, M.aluminumBlack, 0, 0, 0.08);
    for (let i = 0; i < 6; i++) box(chipset, 0.4, 0.012, 0.02, M.steelDark, 0, -0.12 + i * 0.05, 0.12, { cast: false });
    decal(chipset, "NOVA X670E", 0.4, 0.07, 0, 0, 0.135, { fontSize: 40, color: "#8fb4c2" });
    tag(chipset, "شريحة PCH", "جسر التحكم: تدير USB وSATA وM.2 والشبكة وتوزّع المسارات حول المعالج.");

    /* ---------- منافذ SATA و24-pin ---------- */
    const sata = new T.Group(); sata.position.set(1.16, -0.5, 0.06); root.add(sata);
    for (let i = 0; i < 4; i++) {
      const g = new T.Group(); g.position.y = -i * 0.14; sata.add(g);
      box(g, 0.14, 0.1, 0.12, M.plasticCharcoal, 0, 0, 0);
      box(g, 0.1, 0.045, 0.02, M.gold, -0.02, 0, 0.07, { cast: false });
      decal(g, "SATA" + (i + 1), 0.11, 0.028, 0.055, 0.01, 0.065, { fontSize: 32, color: "#8a95a1", align: "left" });
    }
    tag(sata, "منافذ SATA", "4 منافذ لأقراص SSD/HDD الكلاسيكية بسرعة 6Gbps لكل منفذ.");
    const atx24 = new T.Group(); atx24.position.set(1.1, 0.14, 0.11); root.add(atx24);
    box(atx24, 0.24, 0.52, 0.13, M.plasticBlack, 0, 0, 0);
    for (let r = 0; r < 12; r++) for (let c = 0; c < 2; c++) box(atx24, 0.03, 0.03, 0.02, M.gold, -0.06 + c * 0.12, 0.21 - r * 0.038, 0.075, { cast: false });
    tag(atx24, "منفذ 24-pin", "الرئيسي لتغذية اللوحة: 24 سلكاً تنقل 3.3V و5V و12V، ويقفل بخطاف.");
    // 8-pin EPS
    const eps = new T.Group(); eps.position.set(-0.55, 1.39, 0.1); root.add(eps);
    box(eps, 0.42, 0.18, 0.12, M.plasticBlack, 0, 0, 0);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) box(eps, 0.035, 0.035, 0.02, M.gold, -0.15 + c * 0.1, 0.04 - r * 0.08, 0.07, { cast: false });
    decal(eps, "CPU_PWR1", 0.22, 0.03, 0, -0.13, 0.08, { fontSize: 30, color: "#8a95a1" });

    /* ---------- الرقاقة الصوتية والمكثفات والبطارية ---------- */
    for (let i = 0; i < 5; i++) cap(root, -0.72 + i * 0.16, -0.35, 0.1, 0.06, 0.14, M.gold);
    for (let i = 0; i < 4; i++) cap(root, -0.98, -0.55 - i * 0.15, 0.1, 0.05, 0.11, M.gold);
    for (let i = 0; i < 6; i++) cap(root, -1.05 + i * 0.12, 1.02, 0.24, 0.032, 0.09, M.capAlu, {});
    for (let i = 0; i < 5; i++) cap(root, 0.85, -0.25 - i * 0.13, 0.1, 0.035, 0.07, M.capAlu);
    const audioChip = new T.Group(); audioChip.position.set(-0.9, -0.95, 0.09); root.add(audioChip);
    box(audioChip, 0.2, 0.2, 0.03, M.plasticBlack, 0, 0, 0);
    decal(audioChip, "NOVA\nAUDIO", 0.14, 0.08, 0, 0, 0.02, { fontSize: 40, color: "#b7c4ce" });
    tag(audioChip, "قسم الصوت", "رقاقة صوت معزولة بعوازل معدنية، تدعم 7.1 قنوات وصوتاً عالي الدقة.");
    // بطارية CMOS
    const batt = new T.Group(); batt.position.set(0.55, 0.0, 0.1); root.add(batt);
    cyl(batt, 0.11, 0.11, 0.035, 24, M.steel, 0, 0, 0, { rx: Math.PI / 2 });
    decal(batt, "CR2032", 0.13, 0.05, 0, 0, 0.022, { fontSize: 38, color: "#33383f" });
    tag(batt, "بطارية CMOS", "تحفظ إعدادات BIOS والوقت عند فصل الكهرباء؛ تُغيّر كل 5 سنوات تقريباً.");

    /* ---------- إضاءة تشخيص + زر BIOS ---------- */
    const dbg = new T.Group(); dbg.position.set(1.0, 1.05, 0.1); root.add(dbg);
    ["CPU", "DRAM", "VGA", "BOOT"].forEach(function (lbl, i) {
      const led = sphere(dbg, 0.022, [M.ledRed, M.ledAmber, M.ledWhite, M.ledGreen][i], 0, -i * 0.075, 0, { seg: 10, seg2: 8, cast: false, receive: false });
      led.userData.tick = function (t) { led.material.emissiveIntensity = 0.3 + 0.25 * Math.abs(Math.sin(t * 2 + i)); };
      decal(dbg, lbl, 0.14, 0.035, -0.15, -i * 0.075, 0.005, { fontSize: 28, color: "#8f99a4" });
    });
    tag(dbg, "مصابيح التشخيص", "4 مصابيح تكشف سبب توقف الإقلاع: المعالج، الذاكرة، الشاشة، أو قرص النظام.");
    // مراوح headers
    [[-0.7, 1.32], [0.2, 1.32], [0.95, -0.1], [0.7, -1.4]].forEach(function (p) {
      const g = new T.Group(); g.position.set(p[0], p[1], 0.08); root.add(g);
      box(g, 0.12, 0.08, 0.07, M.plasticBlack, 0, 0, 0);
      for (let i = 0; i < 4; i++) box(g, 0.014, 0.014, 0.02, M.gold, -0.035 + i * 0.023, 0.025, 0.04, { cast: false });
    });
    // منافذ RGB
    const argb = new T.Group(); argb.position.set(0.9, 1.25, 0.09); root.add(argb);
    box(argb, 0.15, 0.08, 0.08, M.plasticOffWhite, 0, 0, 0);
    for (let i = 0; i < 3; i++) box(argb, 0.012, 0.012, 0.02, M.gold, -0.03 + i * 0.03, 0.03, 0.045, { cast: false });
    decal(argb, "ARGB", 0.12, 0.03, 0, -0.02, 0.045, { fontSize: 30, color: "#7d8894" });

    /* ---------- دروع المنافذ الخلفية ---------- */
    const io = new T.Group(); io.position.set(-1.13, 1.15, 0.34); root.add(io);
    box(io, 0.42, 0.95, 0.5, M.plasticBlack, 0, 0, 0);
    box(io, 0.44, 0.1, 0.52, M.metalDark, 0, 0.48, 0.0);
    for (let i = 0; i < 5; i++) box(io, 0.02, 0.03, 0.52, M.ledCyan, 0.22, 0.4 - i * 0.05, 0, { cast: false });
    decal(io, "NOVA", 0.26, 0.09, 0.222, 0.82, 0.0, { fontSize: 54, color: "#dbe6ee", ry: Math.PI / 2, emissive: "#2bd9ff", emissiveIntensity: 0.4 });
    // منافذ على الوجه الخلفي -X
    const ports = new T.Group(); ports.position.set(-1.36, 1.15, 0.25); root.add(ports);
    function port(y, z, w, h, type) {
      const g = new T.Group(); g.position.set(0, y, z); ports.add(g);
      box(g, 0.07, h, w, M.steelDark, 0, 0, 0);
      box(g, 0.02, h * 0.7, w * 0.8, M.plasticBlack, -0.04, 0, 0);
      if (type === "usb") box(g, 0.012, h * 0.4, w * 0.55, M.ledBlue, -0.05, 0, 0, { cast: false });
      if (type === "audio") { torus(g, w * 0.3, 0.015, M.gold, -0.05, 0, 0, { ry: Math.PI / 2 }); }
    }
    port(0.32, 0.55, 0.13, 0.06, "usb");
    port(0.24, 0.55, 0.13, 0.06, "usb");
    port(0.32, 0.38, 0.11, 0.05, "usb");
    port(0.32, 0.2, 0.16, 0.08, "usb");
    port(0.22, 0.2, 0.16, 0.08, "usb");
    port(0.34, 0.0, 0.22, 0.12, "net");
    box(ports, 0.08, 0.11, 0.2, M.plasticBlack, 0.0, 0.34, -0.02);
    box(ports, 0.06, 0.07, 0.17, M.metalDark, 0.0, 0.34, -0.02);
    port(0.12, -0.3, 0.06, 0.06, "audio");
    port(0.22, -0.3, 0.06, 0.06, "audio");
    port(0.32, -0.3, 0.06, 0.06, "audio");
    port(0.05, 0.05, 0.16, 0.1, "usb");
    // موصلات الهوائي
    cyl(ports, 0.03, 0.03, 0.08, 12, M.gold, 0.03, 0.46, -0.23, { rz: Math.PI / 2 });
    cyl(ports, 0.03, 0.03, 0.08, 12, M.gold, 0.03, 0.35, -0.23, { rz: Math.PI / 2 });
    tag(ports, "منافذ الإدخال/الإخراج", "USB-C وUSB-A وشبكة 2.5G وصوت 7.1 ومنافذ هوائي Wi-Fi — واجهة الجهاز مع العالم.");

    /* ---------- كابلات/وصلات إضافية وملصقات ---------- */
    // شعار اللوحة
    decal(root, "NOVA  X670E  //  PCIe 5.0  DDR5", 0.8, 0.06, -0.2, 1.44, 0.04, { fontSize: 32, color: "#7f8f9b" });
    // خطوط PCB مضيئة
    box(root, 0.01, 0.6, 0.005, M.ledCyan, 0.9, 0.3, 0.038, { cast: false });

    root.userData.refs = { cpuSocket: socket, cpu: cpu, ram: ram, pcie: p1, m2: m2a, chipset: chipset, io: ports, vrm: vrmTop, sata: sata, atx24: atx24 };
    if (opts.explode) {
      H.explode(root, cpu, 0, 0.35, 0.55);
      H.explode(root, ram, 0, 0.05, 0.75);
      H.explode(root, m2a, 0, 0.15, 0.5);
    }
    return H.ticks(root);
  }
  pc.motherboard = buildMotherboard;
  H.register("motherboard", function () { return buildMotherboard({ explode: true }); });

  /* ============================================================
     شريحة ذاكرة DDR5 مستقلة + تفكيك
     ============================================================ */
  function buildRamStick(opts) {
    opts = opts || {};
    const g = new T.Group();
    // PCB
    const pcb = box(g, 0.09, 1.36, 0.03, M.greenPCB, 0, 0, 0);
    box(g, 0.1, 1.32, 0.012, M.gold, 0, -0.015, 0.0, { cast: false });
    // رقائق ذاكرة
    for (let i = 0; i < 8; i++) {
      box(g, 0.095, 0.11, 0.045, M.plasticBlack, 0, -0.55 + i * 0.15, 0.04, { cast: false });
      box(g, 0.09, 0.1, 0.04, M.plasticBlack, 0, -0.55 + i * 0.15, -0.04, { cast: false });
    }
    // مشتت أمامي وخلفي
    const hsF = new T.Group(); g.add(hsF);
    rbox(hsF, 0.16, 1.26, 0.19, 0.03, M.metalDark, 0, 0.02, 0.145);
    for (let i = 0; i < 8; i++) box(hsF, 0.17, 0.018, 0.02, M.steelDark, 0, 0.42 + i * 0.036, 0.23, { cast: false });
    decal(hsF, "NOVA", 0.45, 0.2, 0, 0.28, 0.242, { fontSize: 66, color: "#e8eef5", font: "800 66px 'Segoe UI', Arial" });
    decal(hsF, "DDR5  ·  6000 MT/s  ·  CL30", 0.5, 0.07, 0, 0.1, 0.242, { fontSize: 28, color: "#9fd7e8" });
    const hsB = new T.Group(); g.add(hsB);
    rbox(hsB, 0.16, 1.26, 0.19, 0.03, M.metalDark, 0, 0.02, -0.145);
    for (let i = 0; i < 8; i++) box(hsB, 0.17, 0.018, 0.02, M.steelDark, 0, 0.42 + i * 0.036, -0.23, { cast: false });
    // ناشر ضوء علوي
    const diff = box(g, 0.18, 0.09, 0.4, new T.MeshStandardMaterial({ color: 0x9fefff, emissive: 0x21d9ff, emissiveIntensity: 1.8, roughness: 0.2, transparent: true, opacity: 0.94 }), 0, 0.7, 0, { cast: false, receive: false });
    box(g, 0.2, 0.03, 0.42, M.aluminumBlack, 0, 0.755, 0, { cast: false });
    // أسنان ذهبية
    for (let i = 0; i < 13; i++) box(g, 0.012, 0.15, 0.01, M.gold, -0.04 + i * 0.0066, -0.75, 0.028, { cast: false });
    H.hotspot(diff, "ناشر الإضاءة RGB", "شريط ضوئي علوي موصول بـ ARGB؛ يضيء الذاكرة بألوان متناسقة مع بقية القطع.");
    H.hotspot(hsF, "مشتت الحرارة", "ألواح ألمنيوم تغلف الرقائق وتشتت حرارتها — تسمح بسرعات أعلى وثبات أكبر.");
    H.hotspot(pcb, "لوحة الدوائر PCB", "تحمل رقائق DRAM ووحدة إدارة الطاقة PMIC؛ طبقات نحاسية دقيقة تنقل الإشارات.");
    H.explode(g, hsF, 0, 0, 0.55);
    H.explode(g, hsB, 0, 0, -0.55);
    H.explode(g, diff, 0, 0.4, 0);
    return H.ticks(g);
  }
  pc.ramStick = buildRamStick;
  H.register("ram", function () {
    const g = new T.Group();
    const a = buildRamStick(); a.position.set(-0.28, 0, 0.05); a.rotation.y = 0.55; g.add(a);
    const b = buildRamStick(); b.position.set(0.24, 0.01, 0.12); b.rotation.y = 0.34; g.add(b);
    // قاعدة عرض
    const base = new T.Group(); base.position.y = -0.82; g.add(base);
    rbox(base, 0.95, 0.05, 0.75, 0.02, M.stage, 0, 0, 0);
    H.stageDeck(base, 0.85, 0.65, 0.038);
    box(base, 0.55, 0.006, 0.02, M.ledCyan, 0, 0.046, -0.27, { cast: false, receive: false });
    return H.ticks(g);
  });

  /* ============================================================
     كرت الشاشة — ثلاث مراوح، 3.2 سم طويلة
     ============================================================ */
  function buildGPU(opts) {
    opts = opts || {};
    const root = new T.Group(); root.name = "gpu";
    const L = 3.2, Hh = 1.34, Tk = 0.5;
    // لوحة PCB
    const pcb = box(root, L - 0.06, 1.12, 0.055, M.blackPCB, 0, 0, 0);
    // أصابع PCIe
    box(root, 0.06, 0.09, 0.56, M.gold, -0.1, -0.69, 0.0, { cast: false });
    for (let i = 0; i < 26; i++) box(root, 0.045, 0.04, 0.012, M.gold, -1.2 + i * 0.065, -0.69, 0.03, { cast: false });
    // قاعدة نحاسية + أنابيب حرارية
    box(root, 1.0, 0.55, 0.06, M.copper, -0.2, 0.05, 0.05);
    for (let i = 0; i < 4; i++) {
      const pipe = cyl(root, 0.028, 0.028, L - 0.5, 12, M.copper, 0.05, 0.45 - i * 0.12, 0.16, { rz: Math.PI / 2 });
      cyl(root, 0.028, 0.028, 0.28, 12, M.copper, -1.5, 0.3 - i * 0.12, 0.1, { rx: Math.PI / 2 });
    }
    // زعانف التبريد
    for (let i = 0; i < 34; i++) {
      box(root, 2.65, 0.014, 0.26, M.steelDark, 0.0, -0.6 + i * 0.035, 0.11, { cast: false });
    }
    // غطاء خلفي
    const back = new T.Group(); root.add(back);
    rbox(back, L - 0.02, Hh, 0.07, 0.03, M.aluminumBlack, 0, 0, -0.27);
    for (let i = 0; i < 12; i++) box(back, 0.06, 0.24, 0.02, M.metalDark, -1.3 + i * 0.24, 0.45, -0.31, { cast: false });
    for (let i = 0; i < 6; i++) box(back, 0.03, 0.03, 0.02, M.gold, -1.35 + i * 0.5, -0.55, -0.31, { cast: false });
    decal(back, "NOVA", 0.55, 0.2, -0.9, 0.2, -0.315, { fontSize: 66, color: "#aab6c0", ry: Math.PI });
    decal(back, "GX 5080  ·  16GB GDDR7", 0.7, 0.08, -0.85, 0.05, -0.315, { fontSize: 28, color: "#6f7b86", ry: Math.PI });
    tag(back, "الغطاء الخلفي", "لوح ألمنيوم صلب يقوّي البطاقة ويشتت الحرارة، ويحمي المكونات من اللمس.");
    // هيكل المراوح
    const shroud = new T.Group(); root.add(shroud);
    box(shroud, L, 0.08, 0.2, M.metalDark, 0, 0.625, 0.17);
    box(shroud, L, 0.1, 0.2, M.metalDark, 0, -0.63, 0.17);
    for (let i = 0; i < 4; i++) {
      const x = -1.58 + i * 1.03;
      box(shroud, 0.07, 1.26, 0.2, M.metalDark, x, 0, 0.17);
    }
    // زوايا حادة سوداء
    for (let i = 0; i < 3; i++) {
      const x = -1.03 + i * 1.03;
      torus(shroud, 0.44, 0.03, M.steelDark, x, 0, 0.26, { seg: 40, tseg: 6 });
      // مروحة
      const f = fan({ size: 0.92, depth: 0.18, blades: 9, rgb: false, speed: 2.2, hubLabel: "NOVA", frameMat: M.metalDark, bladeMat: M.fanBlade, hubMat: M.aluminumBlack, screws: false });
      f.position.set(x, 0, 0.22);
      shroud.add(f);
    }
    // شعار جانبي مضيء
    const strip = box(root, 1.5, 0.035, 0.02, M.ledCyan, 0.45, 0.6, 0.29, { cast: false, receive: false });
    decal(root, "NOVA  RTX", 0.55, 0.13, -0.85, 0.6, 0.295, { fontSize: 52, color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.6 });
    tag(shroud, "المراوح والتبريد", "3 مراوح 100mm مع غرفة بخارية و4 أنابيب حرارية؛ تصرف أكثر من 400 واط من الحرارة.");
    // موصلات الطاقة
    const pwr = new T.Group(); pwr.position.set(0.55, 0.69, -0.03); root.add(pwr);
    for (let k = 0; k < 2; k++) {
      box(pwr, 0.36, 0.1, 0.22, M.plasticBlack, k * 0.4, 0, 0);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) box(pwr, 0.026, 0.026, 0.02, M.gold, k * 0.4 - 0.14 + c * 0.055, 0.025 - r * 0.05, 0.12, { cast: false });
    }
    tag(pwr, "منافذ الطاقة 12VHPWR", "12+4 pin تغذي البطاقة حتى 600W؛ يجب إدخال الموصل حتى النهاية لتجنّب الانصهار.");
    // حامل المنافذ الخلفي
    const bracket = new T.Group(); bracket.position.set(-1.63, 0, 0.0); root.add(bracket);
    box(bracket, 0.035, Hh, 0.62, M.steel, 0, 0, 0);
    for (let i = 0; i < 7; i++) box(bracket, 0.02, 0.09, 0.46, M.plasticBlack, -0.03, -0.58 + i * 0.05, 0, { cast: false });
    function displayPort(y, z, hdmi) {
      const g = new T.Group(); g.position.set(-0.055, y, z); root.add(g);
      box(g, 0.06, 0.11, hdmi ? 0.16 : 0.13, M.steelDark, 0, 0, 0);
      box(g, 0.03, 0.075, hdmi ? 0.13 : 0.1, M.plasticBlack, -0.02, 0, 0);
      box(g, 0.015, 0.02, 0.04, M.gold, -0.04, -0.02, 0, { cast: false });
    }
    displayPort(0.35, -0.22, false);
    displayPort(0.17, -0.22, false);
    displayPort(-0.01, -0.22, false);
    displayPort(0.38, 0.13, true);
    decal(bracket, "NOVA", 0.2, 0.05, -0.06, 0.6, 0.0, { fontSize: 36, color: "#dbe3ea", ry: -Math.PI / 2 });
    tag(bracket, "منافذ العرض", "3× DisplayPort 2.1 + HDMI 2.1؛ تدعم 8K وشاشات متعددة ومعدل تحديث عالٍ.");
    tag(root, "كرت الشاشة GPU", "قلب الألعاب والذكاء الاصطناعي: 16GB ذاكرة فيديو ومسرّعات RT وTensor.");
    if (opts.explode) {
      H.explode(root, back, 0, 0, -0.65);
      H.explode(root, shroud, 0, 0, 0.8);
    }
    return H.ticks(root);
  }
  pc.gpu = buildGPU;
  H.register("gpu", function () { return buildGPU({ explode: true }); });

  /* ============================================================
     مزود الطاقة PSU — 850W
     ============================================================ */
  function buildPSU(opts) {
    opts = opts || {};
    const root = new T.Group();
    const W = 1.5, Hh = 0.86, D = 1.6;
    // جسم
    const bodyMat = new T.MeshStandardMaterial({ color: 0x2b333c, metalness: 0.55, roughness: 0.38, roughnessMap: M.brushedDark || null, envMapIntensity: 0.9 });
    rbox(root, W, Hh, D, 0.03, bodyMat, 0, 0, 0);
    // غطاء علوي بحدود معدنية بارزة
    rbox(root, W + 0.03, 0.025, D + 0.03, 0.012, M.metalDark, 0, Hh / 2 + 0.002, 0);
    box(root, W * 0.72, 0.006, 0.015, M.steelDark, 0, Hh / 2 + 0.016, D / 2 + 0.004, { cast: false });
    // فتحة المروحة السفلية + شبك
    const fanG = new T.Group(); fanG.position.set(0, -Hh / 2 - 0.004, 0.15); root.add(fanG);
    const grille = new T.Mesh(new T.CircleGeometry(0.37, 42), new T.MeshStandardMaterial({ color: 0xffffff, map: H.tex.mesh || null, metalness: 0.7, roughness: 0.4, alphaTest: 0.3, side: T.DoubleSide }));
    grille.rotation.x = -Math.PI / 2; fanG.add(grille);
    const innerFan = fan({ size: 0.66, depth: 0.16, blades: 7, rgb: false, speed: 1.4, hubLabel: "NOVA", frameMat: M.plasticBlack, bladeMat: M.fanBlade, screws: false });
    innerFan.rotation.x = Math.PI / 2; innerFan.position.set(0, 0.08, 0.05); fanG.add(innerFan);
    // غطاء + ملصق
    const labelG = new T.Group(); labelG.position.set(0.0, 0.03, D / 2 + 0.006); root.add(labelG);
    const lt = H.labelTex("NOVA\nGX-850", { fontSize: 72, color: "#e8edf4", font: "800 72px 'Segoe UI', Arial", align: "left", bg: "#14181d" });
    const lbl = add(labelG, new T.PlaneGeometry(0.9, 0.9 * lt.h / lt.w), new T.MeshStandardMaterial({ map: lt.tex, roughness: 0.55 }), -0.15, 0.08, 0.006, { cast: false, receive: false });
    decal(labelG, "80 PLUS GOLD  ·  850W  ·  FULL MODULAR", 0.9, 0.1, -0.1, -0.2, 0.012, { fontSize: 30, color: "#d8b24a" });
    decal(labelG, "ATX 3.1  ·  PCIe 5.1  ·  12VHPWR", 0.8, 0.07, -0.1, -0.3, 0.012, { fontSize: 28, color: "#7f8b96" });
    tag(labelG, "ملصق الطاقة", "850 واط ذهبية الكفاءة، تعطي 850W مستمرة وتتحمل قمم 1700W لثانية — كافية لكرت شاشة ضخم.");
    // sockets modular
    const mod = new T.Group(); mod.position.set(-W / 2 - 0.01, 0.02, 0); root.add(mod);
    const sockets = [["24 PIN", 0.28, 0.26, 0.5], ["CPU", 0.22, -0.02, 0.33], ["PCIE", 0.22, -0.24, 0.4], ["SATA", 0.16, 0.08, 0.24]];
    sockets.forEach(function (s) {
      const g = new T.Group(); g.position.set(0, s[1], s[2]); mod.add(g);
      box(g, 0.045, 0.16, s[3], M.plasticBlack, 0, 0, 0);
      for (let i = 0; i < 4; i++) box(g, 0.016, 0.03, 0.02, M.gold, -0.03, -0.05 + i * 0.033, s[3] * 0.3, { cast: false });
      decal(g, s[0], 0.2, 0.045, -0.03, 0, 0.0, { fontSize: 30, color: "#aab4be", ry: -Math.PI / 2 });
    });
    tag(mod, "منافذ الكابلات المعيارية", "توصيل فقط الكابلات التي تحتاجها؛ تقلل الفوضى وتحسّن تدفق الهواء.");
    // rear
    const rear = new T.Group(); rear.position.set(-W / 2 - 0.03, 0.0, D / 2 - 0.2); root.add(rear);
    box(rear, 0.05, Hh * 0.75, 0.66, M.plasticBlack, 0, 0, 0);
    for (let i = 0; i < 7; i++) box(rear, 0.02, 0.02, 0.5, M.steelDark, -0.035, -0.15 + i * 0.04, 0, { cast: false });
    const iec = box(rear, 0.05, 0.2, 0.28, M.plasticBlack, -0.03, 0.08, 0.15);
    const sw = box(rear, 0.06, 0.1, 0.1, M.plasticRed, -0.04, 0.02, 0.32);
    decal(rear, "I/O", 0.12, 0.04, -0.06, -0.3, 0.0, { fontSize: 30, color: "#7f8a95" });
    // كابلات اختيارية للعرض المستقل
    if (opts.cables !== false) {
      const cm = M.sleeve;
      cable(root, [[-1.1, -0.35, 1.0], [-1.4, -0.2, 1.35], [-1.5, 0.35, 1.55], [-1.3, 0.9, 1.35]], 0.045, cm);
      cable(root, [[-1.1, -0.3, 0.8], [-1.5, -0.1, 1.2], [-1.7, 0.45, 1.25], [-1.5, 0.95, 1.0]], 0.04, M.sleeveRed);
      cable(root, [[-1.1, -0.2, 0.45], [-1.5, 0.0, 0.7], [-1.8, 0.5, 0.65], [-1.65, 1.0, 0.35]], 0.035, M.sleeve);
      // أمشاط
      for (let i = 0; i < 2; i++) box(root, 0.42, 0.02, 0.11, M.plasticBlack, -1.32 - i * 0.18, 0.45 + i * 0.05, 1.35 + i * 0.1, { rx: 0.2, ry: 0.35, cast: false });
    }
    tag(root, "مزود الطاقة PSU", "يحوّل 220V متردد إلى 12V و5V و3.3V مستمرة ونظيفة — القلب الذي يغذي كل القطع.");
    return H.ticks(root);
  }
  pc.psu = buildPSU;
  H.register("psu", function () {
    const g = new T.Group();
    rbox(g, 4.2, 0.12, 3.2, 0.05, M.stage, 0, 0.04, 0);
    H.stageDeck(g, 4.0, 3.0, 0.125);
    const psu = buildPSU({ cables: true });
    psu.rotation.set(0.02, 0.52, 0.01);
    psu.position.set(0.22, 0.63, 0.04);
    g.add(psu);
    return g;
  });

  H.pc.buildMotherboard = buildMotherboard;
  H.pc.buildGPU = buildGPU;
  H.pc.buildPSU = buildPSU;
  H.pc.tag = tag;
})();
