/* ============================================================
   HWM · الشبكات والتيرمنلات
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const net = (H.net = H.net || {});
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, screw = u.screw, decal = u.decal, fan = u.fan, cable = u.cable;
  const tag = H.hotspot;

  function ledTick(led, speed, base) {
    base = base == null ? 1.5 : base;
    led.userData.tick = function (t) { led.material.emissiveIntensity = base + 0.6 * Math.abs(Math.sin(t * (speed || 2) + led.position.x * 5)); };
    return led;
  }
  function rj45(parent, x, y, z, scale, opts) {
    opts = opts || {};
    const s = scale || 1;
    const g = new T.Group(); g.position.set(x, y, z); parent.add(g);
    box(g, 0.15 * s, 0.135 * s, 0.05 * s, M.plasticBlack, 0, 0, 0);
    box(g, 0.1 * s, 0.075 * s, 0.02 * s, M.gold, 0, -0.015 * s, 0.032 * s, { cast: false });
    for (let i = 0; i < 8; i++) box(g, 0.007 * s, 0.045 * s, 0.008 * s, M.gold, (-0.042 + i * 0.012) * s, -0.005 * s, 0.045 * s, { cast: false });
    const led = sphere(g, 0.012 * s, opts.active ? M.ledGreen : M.ledAmber, 0.055 * s, 0.055 * s, 0.04 * s, { seg: 8, seg2: 6, cast: false, receive: false });
    if (opts.active) ledTick(led, 3 + Math.random() * 3);
    return g;
  }
  function ethernetCable(parent, pts, colorMat) {
    const m = cable(parent, pts, 0.018, colorMat || M.cableBlue, { seg: 26, radial: 5 });
    return m;
  }

  /* ============================================================
     الراك الشبكي 12U
     ============================================================ */
  function buildRack(opts) {
    opts = opts || {};
    const g = new T.Group(); g.name = "rack";
    const W = 4.8, Ht = 6.0, D = 3.0;
    const y0 = 0.16;
    // أرجل
    [[-1.9, -1.1], [1.9, -1.1], [-1.9, 1.1], [1.9, 1.1]].forEach(function (p) {
      box(g, 0.28, 0.14, 0.28, M.rubber, p[0], 0.07, p[1]);
      box(g, 0.12, 0.1, 0.12, M.metalDark, p[0], 0.16, p[1]);
    });
    // قاعدة وسقف
    box(g, W, 0.12, D, M.metalDark, 0, y0 + 0.02, 0);
    box(g, W, 0.12, D, M.metalDark, 0, Ht - 0.06, 0);
    // أعمدة
    [[-2.25, -1.32], [2.25, -1.32], [-2.25, 1.32], [2.25, 1.32]].forEach(function (p) {
      box(g, 0.14, Ht - 0.2, 0.14, M.metalDark, p[0], Ht / 2, p[1]);
      for (let i = 0; i < 22; i++) cyl(g, 0.022, 0.022, 0.03, 8, M.steelDark, p[0], 0.55 + i * 0.235, p[1] + 0.08, { rx: Math.PI / 2, cast: false });
    });
    // جوانب مثقبة
    [-2.3, 2.3].forEach(function (sx) {
      box(g, 0.04, Ht - 0.4, D - 0.2, M.aluminumBlack, sx, Ht / 2, 0);
      for (let i = 0; i < 14; i++) box(g, 0.02, 0.035, 1.8, M.plasticBlack, sx + (sx > 0 ? 0.03 : -0.03), 0.9 + i * 0.32, 0, { cast: false });
      decal(g, "NOVA\nNET", 0.5, 0.3, sx + (sx > 0 ? 0.035 : -0.035), 5.25, 0.2, { fontSize: 68, color: "#dbe8ef", ry: sx > 0 ? Math.PI / 2 : -Math.PI / 2, emissive: "#2bd9ff", emissiveIntensity: 0.4 });
      // مروحة جانبية
      const f = fan({ size: 1.05, depth: 0.16, blades: 7, rgb: true, speed: 1.3, ringColor: 0x2bd9ff });
      f.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      f.position.set(sx + (sx > 0 ? 0.08 : -0.08), 4.5, 0);
      g.add(f);
    });
    // سقف شبكي + مراوح
    const topm = new T.Mesh(new T.PlaneGeometry(W - 0.2, D - 0.2), M.mesh);
    topm.rotation.x = -Math.PI / 2; topm.position.y = Ht + 0.005; g.add(topm);
    for (let i = 0; i < 2; i++) {
      const f = fan({ size: 0.9, depth: 0.18, blades: 7, rgb: false, speed: 1.2, frameMat: M.plasticBlack });
      f.rotation.x = -Math.PI / 2; f.position.set(-0.9 + i * 1.8, Ht - 0.15, 0); g.add(f);
    }
    // قضبان تركيب
    [-1.95, 1.95].forEach(function (sx) {
      box(g, 0.08, Ht - 0.4, 0.1, M.steelDark, sx, Ht / 2, 1.2);
      for (let i = 0; i < 26; i++) cyl(g, 0.018, 0.018, 0.02, 8, M.plasticBlack, sx, 0.5 + i * 0.2, 1.26, { rx: Math.PI / 2, cast: false });
    });

    const deco = new T.Group(); g.add(deco);
    // 1. UPS 2U
    const ups = new T.Group(); deco.add(ups);
    box(ups, 4.3, 0.85, 2.2, M.metalDark, 0, 1.03, 0.1);
    box(ups, 4.32, 0.82, 0.04, M.aluminumBlack, 0, 1.03, 1.21);
    const upsScr = new T.Group(); upsScr.position.set(0.75, 1.06, 1.235); ups.add(upsScr);
    box(upsScr, 0.95, 0.46, 0.02, M.screen, 0, 0, 0);
    decal(upsScr, "NOVA  UPS  1500VA", 0.85, 0.08, 0, 0.16, 0.015, { fontSize: 36, color: "#8fe3ff", emissive: "#2bd9ff", emissiveIntensity: 0.9 });
    decal(upsScr, "BATTERY 92%   LOAD 34%", 0.85, 0.07, 0, 0.02, 0.015, { fontSize: 30, color: "#cfe4ec" });
    for (let i = 0; i < 6; i++) box(upsScr, 0.08, 0.11, 0.01, M.ledGreen, -0.36 + i * 0.14, -0.14, 0.015, { cast: false });
    const pbtn = cyl(ups, 0.08, 0.08, 0.03, 24, M.metalDark, -1.55, 1.06, 1.24, { rx: Math.PI / 2 });
    torus(ups, 0.07, 0.009, M.ledCyan, -1.55, 1.06, 1.255, { seg: 28, cast: false, receive: false });
    for (let i = 0; i < 13; i++) box(ups, 0.12, 0.025, 0.01, M.plasticBlack, -1.25 + i * 0.14, 0.78, 1.235, { cast: false });
    tag(ups, "UPS — مزود طاقة غير منقطع", "بطارية 1500VA تحمي السويتش والراوتر من انقطاع الكهرباء وتنظّم الجهد.");
    // 2. PDU
    const pdu = new T.Group(); deco.add(pdu);
    box(pdu, 4.3, 0.4, 2.0, M.metalDark, 0, 1.66, 0.1);
    box(pdu, 4.32, 0.38, 0.03, M.aluminumBlack, 0, 1.66, 1.1);
    for (let i = 0; i < 8; i++) {
      const so = new T.Group(); so.position.set(-1.65 + i * 0.44, 1.66, 1.115); pdu.add(so);
      box(so, 0.28, 0.24, 0.03, M.plasticBlack, 0, 0, 0);
      box(so, 0.2, 0.15, 0.01, M.plasticCharcoal, 0, 0, 0.02);
    }
    box(pdu, 0.18, 0.1, 0.03, M.ledRed, 1.95, 1.75, 1.12, { cast: false });
    const pduDis = new T.Group(); pduDis.position.set(-2.05, 1.66, 1.13); pdu.add(pduDis);
    box(pduDis, 0.28, 0.16, 0.02, M.screen, 0, 0, 0);
    decal(pduDis, "16A", 0.2, 0.07, 0, 0, 0.015, { fontSize: 38, color: "#77e8ff", emissive: "#2bd9ff", emissiveIntensity: 0.7 });
    tag(pdu, "وحدة توزيع الطاقة PDU", "توزّع الكهرباء على 8 أجهزة، مع حماية من الحمل الزائد ومؤشر استهلاك.");
    // 3. NAS 2U
    const nas = new T.Group(); deco.add(nas);
    box(nas, 4.3, 0.85, 2.3, M.metalDark, 0, 2.26, 0.05);
    box(nas, 4.32, 0.82, 0.04, M.aluminumBlack, 0, 2.26, 1.2);
    for (let i = 0; i < 4; i++) {
      const bay = new T.Group(); bay.position.set(-1.55 + i * 0.9, 2.26, 1.23); nas.add(bay);
      box(bay, 0.8, 0.52, 0.04, M.metalDark, 0, 0, 0);
      box(bay, 0.09, 0.4, 0.035, M.aluminum, 0.3, 0, 0.03);
      box(bay, 0.22, 0.035, 0.016, M.ledGreen, -0.12, 0.12, 0.03, { cast: false });
      for (let s = 0; s < 4; s++) box(bay, 0.5, 0.018, 0.016, M.plasticBlack, 0, -0.08 + s * 0.035, 0.028, { cast: false });
      decal(bay, "BAY " + (i + 1), 0.24, 0.04, -0.12, -0.18, 0.03, { fontSize: 26, color: "#8e9aa5" });
    }
    decal(nas, "NOVA  NAS  ·  4×12TB", 0.9, 0.09, 1.4, 2.55, 1.225, { fontSize: 34, color: "#d7e3eb" });
    tag(nas, "خادم التخزين NAS", "أربعة أقراص بمساحة 48TB للنسخ الاحتياطي ومشاركة الملفات داخل الشبكة.");
    // 4. Patch panel
    const patch = new T.Group(); deco.add(patch);
    box(patch, 4.3, 0.4, 0.3, M.metalDark, 0, 2.83, 1.05);
    box(patch, 4.35, 0.38, 0.03, M.aluminumBlack, 0, 2.83, 1.22);
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        const px = -1.7 + i * 0.3;
        const py = 2.83 + (row ? -0.09 : 0.09);
        rj45(patch, px, py, 1.245, 0.75, { active: false });
        decal(patch, String(row * 12 + i + 1), 0.1, 0.03, px, py + 0.13, 1.245, { fontSize: 24, color: "#7f8b96" });
      }
    }
    decal(patch, "PATCH  PANEL  ·  24P  CAT6A", 0.85, 0.05, 0, 2.7, 1.245, { fontSize: 24, color: "#b9c6d0" });
    tag(patch, "لوحة التوصيل Patch Panel", "نقاط نهاية كابلات المباني الـ24؛ تنظيم يسهّل تحديد الأعطال وإعادة التوصيل.");
    // 5. Switch 24 port
    const sw = new T.Group(); deco.add(sw);
    box(sw, 4.3, 0.42, 2.4, M.metalDark, 0, 3.27, 0.05);
    box(sw, 4.35, 0.4, 0.04, M.aluminumBlack, 0, 3.27, 1.24);
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        const px = -1.85 + i * 0.235;
        const py = 3.27 + (row ? -0.09 : 0.09);
        rj45(sw, px, py, 1.265, 0.62, { active: (i + row) % 3 !== 0 });
      }
    }
    // منافذ SFP
    for (let i = 0; i < 2; i++) {
      const sf = new T.Group(); sf.position.set(1.15 + i * 0.24, 3.27, 1.265); sw.add(sf);
      box(sf, 0.19, 0.13, 0.03, M.steelDark, 0, 0, 0);
      box(sf, 0.12, 0.07, 0.01, M.plasticBlack, 0, 0, 0.02);
    }
    for (let i = 0; i < 6; i++) box(sw, 0.03, 0.02, 0.015, M.ledGreen, 1.6 - i * 0.06, 3.43, 1.27, { cast: false });
    decal(sw, "NOVA  SW-24P  ·  GIGABIT  ·  PoE+", 0.9, 0.055, 0, 3.27, 1.275, { fontSize: 24, color: "#a8e8ff", emissive: "#2bd9ff", emissiveIntensity: 0.5 });
    tag(sw, "السويتش Switch — 24 منفذاً", "يوزّع الشبكة على 24 جهازاً بسرعة 1Gbps، ويغذي كاميرات المراقبة بنظام PoE.");
    // 6. Router 1U
    const rt = new T.Group(); deco.add(rt);
    box(rt, 4.3, 0.42, 2.0, M.metalDark, 0, 3.71, 0.1);
    box(rt, 4.35, 0.4, 0.04, M.aluminumBlack, 0, 3.71, 1.1);
    box(rt, 1.1, 0.24, 0.02, M.screen, -1.0, 3.71, 1.125);
    decal(rt, "ROUTER  ·  10G  WAN", 1.0, 0.06, -1.0, 3.74, 1.14, { fontSize: 30, color: "#8fe3ff", emissive: "#2bd9ff", emissiveIntensity: .7 });
    for (let i = 0; i < 4; i++) rj45(rt, 0.15 + i * 0.28, 3.71, 1.13, 0.7, { active: i < 3 });
    rj45(rt, 1.4, 3.71, 1.13, 0.7, { active: true });
    box(rt, 0.28, 0.13, 0.02, M.ledBlue, 1.4, 3.9, 1.14, { cast: false });
    box(rt, 0.18, 0.09, 0.01, M.ledGreen, -1.7, 3.72, 1.13, { cast: false });
    tag(rt, "الراوتر Router", "يوجّه حزم البيانات بين الشبكة المحلية والإنترنت، ويدير الاتصال بـ10G وVPN.");
    // 7. Firewall 1U
    const fw = new T.Group(); deco.add(fw);
    box(fw, 4.3, 0.42, 2.1, M.metalDark, 0, 4.15, 0.1);
    box(fw, 4.35, 0.4, 0.04, M.aluminumBlack, 0, 4.15, 1.15);
    box(fw, 1.15, 0.27, 0.02, M.screen, -0.9, 4.15, 1.175);
    decal(fw, "NOVA  SG-1000  FIREWALL", 1.1, 0.05, -0.9, 4.2, 1.19, { fontSize: 26, color: "#a9f0dc", emissive: "#2bffb0", emissiveIntensity: .7 });
    decal(fw, "THREATS  0   ·   VPN 12", 0.9, 0.04, -0.9, 4.1, 1.19, { fontSize: 22, color: "#c7d9d5" });
    for (let i = 0; i < 8; i++) rj45(fw, 0.6 + (i % 4) * 0.26, 4.06 + Math.floor(i / 4) * 0.17, 1.18, 0.6, { active: i < 5 });
    for (let i = 0; i < 2; i++) {
      box(fw, 0.19, 0.12, 0.02, M.steelDark, 1.85 + i * 0.22, 4.15, 1.185);
    }
    for (let i = 0; i < 4; i++) box(fw, 0.08, 0.012, 0.01, M.ledGreen, -1.75 + i * 0.12, 4.28, 1.18, { cast: false });
    tag(fw, "الجدار الناري Firewall", "يفحص كل حزمة قبل دخولها: قواعد، فلترة، منع اختراق، وVPN مركزي.");
    // 8. Cable manager + blank
    const cm = new T.Group(); deco.add(cm);
    box(cm, 4.3, 0.4, 0.5, M.metalDark, 0, 5.03, 0.95);
    for (let i = 0; i < 18; i++) box(cm, 0.02, 0.28, 0.18, M.plasticBlack, -2.0 + i * 0.23, 5.03, 1.1, { cast: false });
    for (let i = 0; i < 4; i++) torus(cm, 0.09, 0.012, M.plasticBlack, -1.7 + i * 0.38, 5.03, 1.2, { seg: 20, arc: Math.PI });
    const blank = new T.Group(); deco.add(blank);
    box(blank, 4.3, 0.42, 0.06, M.metalDark, 0, 5.47, 1.22);
    for (let i = 0; i < 20; i++) box(blank, 0.06, 0.03, 0.02, M.plasticBlack, -1.8 + i * 0.19, 5.47, 1.25, { cast: false });
    decal(blank, "RESERVED  ·  FUTURE UPGRADE", 0.9, 0.05, 0, 5.57, 1.245, { fontSize: 22, color: "#6f7c87" });
    // 9. Modem
    const md = new T.Group(); deco.add(md);
    box(md, 4.3, 0.42, 1.8, M.metalDark, 0, 4.59, 0.15);
    box(md, 4.35, 0.4, 0.04, M.aluminumBlack, 0, 4.59, 1.07);
    const coax = new T.Group(); coax.position.set(-1.4, 4.59, 1.09); md.add(coax);
    cyl(coax, 0.06, 0.06, 0.07, 16, M.gold, 0, 0, 0, { rx: Math.PI / 2 });
    box(md, 0.2, 0.13, 0.03, M.steelDark, -1.1, 4.59, 1.09);
    for (let i = 0; i < 4; i++) rj45(md, 0.3 + i * 0.28, 4.59, 1.09, 0.7, { active: i < 2 });
    for (let i = 0; i < 5; i++) ledTick(sphere(md, 0.018, i === 2 ? M.ledRed : M.ledGreen, -1.75 + i * 0.1, 4.75, 1.1, { seg: 8, seg2: 6, cast: false, receive: false }), 2.2);
    decal(md, "CABLE  MODEM  ·  DOCSIS 3.1", 0.9, 0.05, 0.6, 4.75, 1.1, { fontSize: 24, color: "#b7c3cd" });
    // كابلات التوصيل بين الباتش والسويتش
    const cableColors = [M.cableBlue, M.cableYellow, M.cableGrey, M.wireGreen, M.wireOrange, M.cableBlue, M.cableYellow, M.cableGrey];
    for (let i = 0; i < 8; i++) {
      const px = -1.7 + i * 0.42;
      const path = [
        [px, 2.92, 1.27], [px + 0.2, 3.0, 1.4], [px + 0.15, 3.3, 1.48], [px + 0.02, 3.36, 1.4], [px + 0.02, 3.36, 1.29]
      ];
      cable(deco, path, 0.017, cableColors[i], { seg: 20, radial: 5 });
    }
    // كابلات طاقة خلفية
    for (let i = 0; i < 5; i++) {
      cable(deco, [[-1.7 + i * 0.1, 1.66, 1.0], [-2.0, 1.6, 0.8], [-2.15, 1.2 + i * 0.7, 0.6], [-2.1, 1.1 + i * 0.7, 0.2]], 0.022, M.sleeve, { seg: 18 });
    }
    // باب زجاجي
    const door = new T.Group(); door.position.set(0, 3.0, 1.58); g.add(door);
    box(door, 4.5, 0.06, 0.04, M.aluminumBlack, 0, 2.75, 0);
    box(door, 4.5, 0.06, 0.04, M.aluminumBlack, 0, -2.75, 0);
    box(door, 0.06, 5.5, 0.04, M.aluminumBlack, -2.22, 0, 0);
    box(door, 0.06, 5.5, 0.04, M.aluminumBlack, 2.22, 0, 0);
    const dg = new T.Mesh(new T.BoxGeometry(4.38, 5.44, 0.025), M.glass);
    dg.position.z = 0; door.add(dg);
    dg.renderOrder = 8;
    box(door, 0.05, 0.9, 0.06, M.steel, 1.95, 0, 0.06);
    box(door, 0.2, 0.05, 0.05, M.metalDark, 1.95, 0.3, 0.07);
    decal(door, "NOVA NET", 0.65, 0.12, 0, 2.3, 0.02, { fontSize: 50, color: "#a9d9ea", emissive: "#2bd9ff", emissiveIntensity: .25 });
    tag(g, "الراك الشبكي", "هيكل 19 إنش بـ12 وحدة (12U) يجمع أجهزة الشبكة في مكان واحد منظم وآمن.");
    H.explode(g, door, 0, 0, 1.3);
    return H.ticks(g);
  }
  net.rack = buildRack;
  H.register("rack", function () { return buildRack(); });

  /* ============================================================
     راوتر مكتبي بأربعة هوائيات
     ============================================================ */
  function buildRouter() {
    const g = new T.Group(); g.name = "router";
    // قاعدة/جسم
    rbox(g, 2.4, 0.38, 1.5, 0.09, M.plasticBlack, 0, 0.3, 0);
    rbox(g, 2.28, 0.08, 1.4, 0.06, M.plasticCharcoal, 0, 0.51, 0);
    // فتحات السقف
    for (let i = 0; i < 9; i++) box(g, 1.7, 0.012, 0.045, M.plasticBlack, 0, 0.555, -0.45 + i * 0.11, { cast: false });
    // شعار مضيء
    decal(g, "NOVA", 0.5, 0.14, 0, 0.558, 0.46, { rx: -Math.PI / 2, fontSize: 60, color: "#e7f2f8", emissive: "#bcecff", emissiveIntensity: 0.4 });
    decal(g, "AX6600  ·  WiFi 6E", 0.5, 0.08, 0, 0.558, 0.2, { rx: -Math.PI / 2, fontSize: 34, color: "#8ca0ac" });
    // مصابيح أمامية
    for (let i = 0; i < 6; i++) {
      const l = ledTick(sphere(g, 0.022, [M.ledCyan, M.ledCyan, M.ledGreen, M.ledGreen, M.ledWhite, M.ledAmber][i], -0.8 + i * 0.18, 0.37, 0.765, { seg: 10, seg2: 8, cast: false, receive: false }), 1.5 + i * 0.4);
    }
    decal(g, "POWER   INTERNET   2.4G   5G   LAN   USB", 1.2, 0.045, 0, 0.27, 0.766, { fontSize: 20, color: "#5f6b76" });
    // هوائيات
    for (let i = 0; i < 4; i++) {
      const ant = new T.Group(); ant.position.set(-0.9 + i * 0.6, 0.46, -0.66); g.add(ant);
      sphere(ant, 0.09, M.plasticBlack, 0, 0, 0, { seg: 14, seg2: 10 });
      const rod = new T.Group(); ant.add(rod);
      rod.rotation.x = -0.28; rod.rotation.z = (i - 1.5) * 0.13;
      cyl(rod, 0.055, 0.075, 0.9, 16, M.plasticCharcoal, 0, 0.45, 0);
      box(rod, 0.08, 0.7, 0.012, M.metalDark, 0, 0.42, 0.045, { cast: false });
      for (let s = 0; s < 4; s++) box(rod, 0.07, 0.02, 0.014, M.ledCyan, 0, 0.25 + s * 0.12, 0.046, { cast: false });
      cyl(rod, 0.06, 0.06, 0.04, 16, M.metalDark, 0, 0.9, 0);
    }
    tag(g, "هوائيات عالية الكسب", "4 هوائيات قابلة للتوجيه تدعم 6GHz؛ كل هوائي يرسل ويستقبل عدة تدفقات MIMO معاً.");
    // منافذ خلفية
    const back = new T.Group(); back.position.set(0, 0.31, -0.755); g.add(back);
    box(back, 2.1, 0.24, 0.03, M.plasticCharcoal, 0, 0, 0);
    rj45(back, -0.7, 0, 0.02, 1.0, { active: true });
    const wan = new T.Group(); wan.position.set(-0.7, 0, 0.03); back.add(wan);
    box(wan, 0.17, 0.14, 0.02, M.ledBlue, 0, 0, 0.01, { cast: false });
    decal(back, "WAN", 0.14, 0.04, -0.7, -0.16, 0.02, { fontSize: 24, color: "#8fa3b3" });
    for (let i = 0; i < 4; i++) rj45(back, -0.35 + i * 0.24, 0, 0.02, 0.85, { active: i < 2 });
    for (let i = 0; i < 4; i++) decal(back, "LAN" + (i + 1), 0.12, 0.03, -0.35 + i * 0.24, -0.16, 0.02, { fontSize: 20, color: "#6f7d88" });
    box(back, 0.16, 0.08, 0.02, M.plasticBlack, 0.8, -0.02, 0.02);
    decal(back, "USB", 0.12, 0.03, 0.8, -0.16, 0.02, { fontSize: 20, color: "#6f7d88" });
    box(back, 0.1, 0.1, 0.02, M.ledRed, 1.0, 0.02, 0.02);
    decal(back, "RESET", 0.13, 0.03, 1.0, -0.16, 0.02, { fontSize: 18, color: "#6f7d88" });
    cyl(back, 0.05, 0.05, 0.05, 12, M.plasticBlack, 1.0, 0.05, -0.01, { rx: Math.PI / 2 });
    tag(back, "منافذ الراوتر", "WAN للإنترنت، 4 LAN للأجهزة، USB للمشاركة، وزر إعادة الضبط. لاحظ لون WAN الأزرق.");
    // فتحات جانبية
    for (let i = 0; i < 6; i++) {
      box(g, 0.012, 0.09, 0.5, M.plasticBlack, -1.205, 0.38, -0.35 + i * 0.13, { cast: false });
      box(g, 0.012, 0.09, 0.5, M.plasticBlack, 1.205, 0.38, -0.35 + i * 0.13, { cast: false });
    }
    // أرجل مطاطية
    [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]].forEach(function (p) {
      box(g, 0.12, 0.07, 0.12, M.rubber, p[0], 0.045, p[1]);
    });
    H.explode(g, g.children[1], 0, 0.4, 0);
    return H.ticks(g);
  }
  net.router = buildRouter;
  H.register("router", function () { return buildRouter(); });

  /* ============================================================
     سويتش 24 منفذاً
     ============================================================ */
  function buildSwitch() {
    const g = new T.Group(); g.name = "switch";
    const W = 4.4, D = 2.2, Hh = 0.44;
    box(g, W, Hh, D, M.metalDark, 0, 0.3, 0);
    box(g, W + 0.02, Hh - 0.03, 0.04, M.aluminumBlack, 0, 0.3, D / 2 + 0.01);
    // أذنا التركيب
    [-1, 1].forEach(function (s) {
      box(g, 0.2, 0.42, 0.05, M.metalDark, s * (W / 2 + 0.1), 0.3, D / 2 - 0.15);
      screw(g, s * (W / 2 + 0.1), 0.37, D / 2 - 0.12, 0.03, null, M.steel);
      screw(g, s * (W / 2 + 0.1), 0.23, D / 2 - 0.12, 0.03, null, M.steel);
    });
    // 24 منفذاً
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        const px = -1.9 + i * 0.24;
        const py = 0.38 - row * 0.16;
        rj45(g, px, py, D / 2 + 0.035, 0.64, { active: (i * (row + 2)) % 4 !== 0 });
        decal(g, String(row * 12 + i + 1), 0.08, 0.028, px, py + 0.105, D / 2 + 0.04, { fontSize: 22, color: "#7d8a95" });
      }
    }
    for (let i = 0; i < 2; i++) {
      const sf = new T.Group(); sf.position.set(1.25 + i * 0.26, 0.3, D / 2 + 0.04); g.add(sf);
      box(sf, 0.21, 0.14, 0.04, M.steel, 0, 0, 0);
      box(sf, 0.13, 0.08, 0.02, M.plasticBlack, 0, 0, 0.025);
    }
    box(g, 0.25, 0.15, 0.03, M.plasticBlack, 1.85, 0.3, D / 2 + 0.04);
    for (let i = 0; i < 4; i++) box(g, 0.025, 0.025, 0.02, M.ledGreen, 1.75 + i * 0.06, 0.24, D / 2 + 0.06, { cast: false });
    decal(g, "NOVA  SW-24P", 0.65, 0.09, -1.3, 0.2, D / 2 + 0.035, { fontSize: 34, color: "#dfeaf1" });
    decal(g, "24× GIGABIT  ·  2× SFP+  ·  PoE+ 370W", 0.9, 0.045, -1.05, 0.135, D / 2 + 0.035, { fontSize: 22, color: "#8fd8ea" });
    for (let i = 0; i < 7; i++) box(g, 0.02, 0.015, 0.012, M.ledGreen, 1.35 + i * 0.04, 0.47, D / 2 + 0.035, { cast: false });
    // فتحات جانبية وخلفية
    for (let i = 0; i < 8; i++) box(g, 0.02, 0.27, 0.05, M.plasticBlack, -2.205, 0.3, -0.8 + i * 0.22, { cast: false });
    const f = fan({ size: 0.3, depth: 0.08, blades: 7, rgb: false, speed: 4, frameMat: M.plasticBlack, screws: false });
    f.rotation.y = Math.PI / 2; f.position.set(-2.21, 0.3, 0.6); g.add(f);
    // كابلات موصولة
    [3, 7, 11, 16].forEach(function (n, idx) {
      const i = n % 12, row = n > 12 ? 1 : 0;
      const px = -1.9 + i * 0.24, py = 0.38 - row * 0.16;
      cable(g, [[px, py, D / 2 + 0.06], [px + 0.1, py - 0.12, 1.32], [px + 0.15, py - 0.35, 1.1], [px + 0.1, 0.06, 1.45]], 0.019, [M.cableBlue, M.cableYellow, M.cableGrey, M.wireGreen][idx], { seg: 18 });
      cyl(g, 0.045, 0.05, 0.12, 10, M.plasticBlack, px, py, D / 2 + 0.08, { rx: Math.PI / 2, cast: false });
    });
    tag(g, "السويتش", "يبدو صندوقاً بسيطاً لكنه يبني جسراً كاملاً: يتعلم عناوين MAC ويوجه كل إطار إلى منفذه الصحيح.");
    tag(g, "منافذ PoE+", "منافذ الشبكة نفسها ترسل الكهرباء (حتى 30W للمنفذ) لتشغيل الكاميرات ونقاط الوصول بلا محول.");
    return H.ticks(g);
  }
  net.switch = buildSwitch;
  H.register("switch", function () { return buildSwitch(); });

  /* ============================================================
     نقطة وصول لاسلكية سقفية
     ============================================================ */
  function buildAP() {
    const g = new T.Group(); g.name = "accesspoint";
    // قاعدة عرض وميل
    const stand = new T.Group(); g.add(stand);
    cyl(stand, 0.9, 1.0, 0.08, 40, M.metalDark, 0, 0.04, 0);
    cyl(stand, 0.1, 0.13, 0.9, 20, M.steelDark, 0, 0.5, 0);
    // جسم AP
    const ap = new T.Group(); ap.position.set(0, 1.05, 0); ap.rotation.x = -0.28; ap.rotation.z = 0.08; stand.add(ap);
    cyl(ap, 1.0, 1.0, 0.18, 64, M.plasticOffWhite, 0, 0, 0);
    torus(ap, 0.85, 0.03, M.plasticGrey, 0, 0.08, 0, { rx: -Math.PI / 2, seg: 64, tseg: 6 });
    cyl(ap, 0.28, 0.34, 0.08, 32, M.plasticOffWhite, 0, 0.12, 0);
    // حلقات تهوية
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const slot = box(ap, 0.28, 0.02, 0.04, M.plasticGrey, Math.cos(a) * 0.62, 0.085, Math.sin(a) * 0.62, { cast: false });
      slot.rotation.y = -a;
    }
    const ring = torus(ap, 0.55, 0.012, M.ledCyan, 0, 0.095, 0, { rx: -Math.PI / 2, seg: 64, tseg: 6, cast: false, receive: false });
    ledTick(ring, 1.1, 1.7);
    decal(ap, "NOVA", 0.32, 0.1, 0, 0.17, 0, { rx: -Math.PI / 2, fontSize: 54, color: "#8f9aa2" });
    decal(ap, "WiFi 7  ·  BE13000", 0.4, 0.06, 0, 0.17, 0.28, { rx: -Math.PI / 2, fontSize: 28, color: "#a7b1b9" });
    // قاعدة سفلية + منفذ PoE
    cyl(ap, 0.9, 0.9, 0.04, 48, M.plasticGrey, 0, -0.11, 0);
    box(ap, 0.32, 0.06, 0.2, M.plasticBlack, 0, -0.15, 0.1, { cast: false });
    rj45(ap, 0, -0.17, 0.05, 0.9, { active: true });
    tag(ap, "نقطة الوصول AP", "هوائي WiFi مركزي يغطي الطابق بسرعة تصل 13Gbps؛ يثبّت في السقف ويغذى عبر كابل شبكة واحد.");
    tag(ring, "حلقة الحالة", "ألوان LED تخبرك فوراً: أزرق ثابت = متصل، وامض = جاري الإقلاع، برتقالي = لا اتصال.");
    return H.ticks(g);
  }
  net.ap = buildAP;
  H.register("access-point", function () { return buildAP(); });

  /* ============================================================
     جدار ناري 1U
     ============================================================ */
  function buildFirewall() {
    const g = new T.Group(); g.name = "firewall";
    const W = 4.4, D = 2.0, Hh = 0.44;
    box(g, W, Hh, D, M.metalDark, 0, 0.3, 0);
    box(g, W + 0.02, Hh - 0.03, 0.04, M.aluminumBlack, 0, 0.3, D / 2 + 0.01);
    [-1, 1].forEach(function (s) {
      box(g, 0.2, 0.42, 0.05, M.metalDark, s * (W / 2 + 0.1), 0.3, D / 2 - 0.2);
      screw(g, s * (W / 2 + 0.1), 0.37, D / 2 - 0.17, 0.03, null, M.steel);
      screw(g, s * (W / 2 + 0.1), 0.23, D / 2 - 0.17, 0.03, null, M.steel);
    });
    // شاشة الحالة
    const scr = new T.Group(); scr.position.set(-1.2, 0.3, D / 2 + 0.035); g.add(scr);
    box(scr, 1.4, 0.28, 0.02, M.screen, 0, 0, 0);
    decal(scr, "NOVA  SG-1000", 1.2, 0.05, 0, 0.09, 0.015, { fontSize: 28, color: "#69f0d0", emissive: "#2bffb0", emissiveIntensity: .8 });
    // رسم بياني
    for (let i = 0; i < 16; i++) {
      const h = 0.03 + Math.abs(Math.sin(i * 1.7)) * 0.09;
      box(scr, 0.035, h, 0.005, M.ledCyan, -0.55 + i * 0.07, -0.03 + h / 2, 0.015, { cast: false, receive: false });
    }
    decal(scr, "THROUGHPUT 2.4 Gbps   ·   VPN 12", 0.9, 0.035, 0.15, -0.12, 0.015, { fontSize: 18, color: "#a9c7c0" });
    // منافذ
    for (let i = 0; i < 8; i++) {
      rj45(g, 0.4 + (i % 4) * 0.24, 0.36 - Math.floor(i / 4) * 0.16, D / 2 + 0.035, 0.6, { active: i < 3 });
    }
    for (let i = 0; i < 2; i++) {
      const sf = new T.Group(); sf.position.set(1.55 + i * 0.24, 0.3, D / 2 + 0.04); g.add(sf);
      box(sf, 0.2, 0.14, 0.04, M.steel, 0, 0, 0);
      box(sf, 0.12, 0.08, 0.02, M.plasticBlack, 0, 0, 0.025);
    }
    for (let i = 0; i < 5; i++) ledTick(sphere(g, 0.018, i === 0 ? M.ledAmber : M.ledGreen, -0.35 + i * 0.08, 0.15, D / 2 + 0.05, { seg: 8, seg2: 6, cast: false, receive: false }), 2.4);
    decal(g, "CONSOLE", 0.16, 0.03, -2.0, 0.18, D / 2 + 0.04, { fontSize: 20, color: "#7e8a94" });
    for (let i = 0; i < 9; i++) box(g, 0.015, 0.25, 0.04, M.plasticBlack, -2.18, 0.3, -0.8 + i * 0.19, { cast: false });
    tag(g, "الجدار الناري", "جهاز أمني متخصص: يفحص الجلسات، يمنع الهجمات، ويبني أنفاق VPN بين الفروع.");
    return H.ticks(g);
  }
  net.firewall = buildFirewall;
  H.register("firewall", function () { return buildFirewall(); });

  /* ============================================================
     الكابلات والمنافذ — معرض تعليمي
     ============================================================ */
  function buildCabling() {
    const root = new T.Group(); root.name = "cabling";
    rbox(root, 5.4, 0.12, 3.6, 0.04, M.stage, 0, 0.04, 0);
    H.stageDeck(root, 5.1, 3.3, 0.125);
    // موصل RJ45 مكبر بمقطع
    const plug = new T.Group(); plug.position.set(-1.35, 1.1, 0.2); plug.rotation.set(0.1, -0.5, 0.03); root.add(plug);
    // غلاف شفاف
    const shell = new T.Mesh(new T.BoxGeometry(0.95, 0.72, 1.5), M.glass);
    shell.position.z = 0.2; plug.add(shell);
    box(plug, 0.9, 0.06, 1.45, M.plasticBlack, 0, -0.33, 0.2, { cast: false });
    box(plug, 0.88, 0.7, 0.06, M.plasticBlack, 0, 0, 0.95);
    // فتحة القفل
    box(plug, 0.2, 0.14, 0.5, M.plasticBlack, 0, -0.4, 0.35);
    // 8 أسلاك ملونة داخل الموصل
    const wireMats = [M.wireOrange, M.wireBlue, M.wireGreen, M.cableGrey, M.cableGrey, M.wireGreen, M.wireBlue, M.wireOrange];
    for (let i = 0; i < 8; i++) {
      const wx = -0.27 + i * 0.077;
      cable(plug, [[wx, -0.02, -0.75], [wx, -0.02, 0.1], [wx * 0.9, 0.0, 0.55], [wx * 0.9, -0.04, 0.95]], 0.022, wireMats[i], { seg: 8, radial: 5 });
      box(plug, 0.035, 0.05, 0.3, M.gold, wx, 0.18, 0.72, { cast: false });
    }
    // كابل واقٍ
    cable(plug, [[0, 0, -1.9], [0, 0.02, -1.2], [0, 0, -0.7]], 0.22, M.cableBlue, { seg: 14, radial: 12 });
    cable(plug, [[0, 0, -1.2], [0, 0.02, -0.7]], 0.19, M.sleeve, { seg: 8 });
    // ظهر الموصل
    box(plug, 0.24, 0.2, 0.3, M.plasticBlue, 0, -0.28, -0.62);
    decal(plug, "RJ45  ·  CAT6A", 0.6, 0.08, 0, 0.14, 1.0, { fontSize: 30, color: "#cfe9f4" });
    tag(plug, "موصل RJ45", "8 أطراف ذهبية و8 أسلاك ملونة مرتبة بمعيار T568B؛ تثبيت صحيح = سرعة كاملة وأقل تداخل.");
    // كابل Cat6 مقطوع لعرض الطبقات
    const cbl = new T.Group(); cbl.position.set(0.9, 0.55, 0.7); cbl.rotation.y = 0.4; root.add(cbl);
    cable(cbl, [[-1.6, 0, 0], [-0.7, 0.02, 0]], 0.19, M.cableBlue, { seg: 14, radial: 12 });
    // غلاف مقشور
    for (let i = 0; i < 4; i++) {
      const colors = [[M.wireOrange, M.wireGreen], [M.wireBlue, M.cableYellow], [M.wireGreen, M.wireOrange], [M.steel, M.wireBlue]];
      for (let j = 0; j < 2; j++) {
        const pts = [];
        for (let s = 0; s <= 10; s++) {
          const a = s * 0.7 + i;
          pts.push([-0.65 + s * 0.16, Math.sin(a) * 0.07 + (i - 1.5) * 0.08, Math.cos(a) * 0.07 + (j - 0.5) * 0.13]);
        }
        cable(cbl, pts, 0.017, colors[i][j], { seg: 22, radial: 5 });
      }
    }
    // داخلي + قابس طرفي
    cable(cbl, [[0.95, 0, 0], [1.4, 0.01, 0]], 0.19, M.cableBlue, { seg: 6, radial: 12 });
    const cplug = new T.Group(); cplug.position.set(1.7, 0, 0); cbl.add(cplug);
    box(cplug, 0.42, 0.36, 0.7, M.plasticBlue, 0, 0, 0);
    box(cplug, 0.3, 0.26, 0.2, M.glass, 0, 0, 0.45);
    decal(cplug, "CAT6A  ·  10G", 0.46, 0.07, 0, 0.12, 0.36, { fontSize: 26, color: "#dceff7" });
    tag(cbl, "كابل Cat6A", "4 أزواج مجدولة ومغطاة بطبقة عزل، يحمل 10Gbps حتى 100 متر مع تقليل التشويش.");
    // كيستون جاك
    const key = new T.Group(); key.position.set(1.65, 0.75, -0.9); key.rotation.set(-0.1, -0.5, 0); root.add(key);
    rbox(key, 1.05, 0.9, 0.28, 0.05, M.plasticOffWhite, 0, 0, 0);
    box(key, 0.62, 0.4, 0.05, M.plasticGrey, 0, -0.08, 0.15);
    for (let i = 0; i < 8; i++) {
      box(key, 0.06, 0.1, 0.04, [M.wireOrange, M.wireBlue, M.wireGreen, M.cableYellow, M.wireGreen, M.wireBlue, M.wireOrange, M.cableGrey][i], -0.21 + i * 0.06, 0.31, 0.15, { cast: false });
      decal(key, String(i + 1), 0.04, 0.025, -0.21 + i * 0.06, 0.24, 0.157, { fontSize: 20, color: "#6d7a84" });
    }
    decal(key, "T568B", 0.35, 0.06, 0.32, 0.31, 0.157, { fontSize: 26, color: "#8b96a0" });
    tag(key, "كيستون Jack", "المقبس الأنثى داخل الجدار: يستقبل RJ45 من جهة، وأسلاك التمديد من الخلف بأطراف قابلة للضغط.");
    // كابل ألياف ضوئية
    const fib = new T.Group(); fib.position.set(-1.4, 0.6, -1.05); fib.rotation.y = -0.35; root.add(fib);
    const coilPts = [];
    for (let i = 0; i <= 48; i++) {
      const a = i * 0.38, r = 0.75 + Math.sin(i * 0.2) * 0.03;
      coilPts.push([Math.cos(a) * r, 0.05 + Math.sin(i * 0.7) * 0.01, Math.sin(a) * r]);
    }
    cable(fib, coilPts, 0.036, new T.MeshStandardMaterial({ color: 0xc9b23a, roughness: 0.5 }), { seg: 90, radial: 6 });
    [-1, 1].forEach(function (s, idx) {
      const lc = new T.Group(); lc.position.set(s * 0.9, 0.06, 0.55); fib.add(lc);
      box(lc, 0.14, 0.24, 0.55, M.plasticBlue, 0, 0, 0);
      box(lc, 0.09, 0.16, 0.3, M.plasticOffWhite, 0, 0, 0.38);
      box(lc, 0.16, 0.16, 0.06, M.steel, 0, 0, -0.3);
    });
    tag(fib, "كابل ألياف LC", "ينقل الضوء عبر زجاج رفيع: مسافات كيلومترات وسرعات هائلة، مع منع التداخل الكهرومغناطيسي تماماً.");
    // لوحة حائط
    const wall = new T.Group(); wall.position.set(-0.2, 0.7, -1.0); wall.rotation.set(0, 0.3, 0); root.add(wall);
    rbox(wall, 1.4, 1.0, 0.12, 0.05, M.plasticOffWhite, 0, 0, 0);
    rj45(wall, -0.32, 0.0, 0.08, 1.1, { active: false });
    rj45(wall, 0.32, 0.0, 0.08, 1.1, { active: false });
    decal(wall, "NETWORK", 0.6, 0.06, 0, 0.33, 0.065, { fontSize: 26, color: "#75818a" });
    tag(wall, "لوحة الحائط", "مخرجان في مكتب أو غرفة: كابل التمديد يمر داخل الجدار، والواجهة نظيفة وآمنة.");
    // تسميات صغيرة
    decal(root, "01  RJ45", 0.5, 0.07, -1.4, 0.16, 1.5, { fontSize: 30, color: "#7b8c96" });
    decal(root, "02  CAT6A", 0.5, 0.07, 1.0, 0.16, 1.5, { fontSize: 30, color: "#7b8c96" });
    decal(root, "03  KEYSTONE", 0.5, 0.07, 1.65, 0.16, -1.45, { fontSize: 30, color: "#7b8c96" });
    decal(root, "04  FIBER", 0.5, 0.07, -1.4, 0.16, -1.65, { fontSize: 30, color: "#7b8c96" });
    return H.ticks(root);
  }
  H.register("cabling", buildCabling);
  net.cabling = buildCabling;

  /* ============================================================
     شاشات وواجهات (POS / كيوسك)
     ============================================================ */
  function posUI() {
    const W = 900, Hh = 600, c = H.canvas(W, Hh), x = c.getContext("2d");
    x.fillStyle = "#070d15"; x.fillRect(0, 0, W, Hh);
    x.fillStyle = "#0d1a27"; x.fillRect(0, 0, W, 74);
    x.fillStyle = "#dff3ff"; x.font = "700 30px 'Segoe UI', Arial"; x.textAlign = "left";
    x.fillText("NOVA POS", 28, 47);
    x.font = "500 18px 'Segoe UI', Arial"; x.fillStyle = "#6e8b9f";
    x.fillText("نقطة بيع · فرع المركز", 230, 47);
    x.fillStyle = "#101f2d";
    for (let i = 0; i < 9; i++) {
      const gx = 30 + (i % 3) * 210, gy = 105 + Math.floor(i / 3) * 140;
      x.fillStyle = "#122435"; x.fillRect(gx, gy, 190, 118);
      x.strokeStyle = "#1d3a4f"; x.strokeRect(gx, gy, 190, 118);
      x.fillStyle = i % 2 ? "#2bd9ff" : "#ffb12e"; x.fillRect(gx + 14, gy + 14, 36, 36);
      x.fillStyle = "#cfe8f4"; x.font = "600 17px 'Segoe UI', Arial"; x.textAlign = "right";
      x.fillText(["قهوة مختصة", "شاي أخضر", "عصير برتقال", "كرواسون", "ساندويتش", "سلطة", "كيك", "مياه", "حلوى"][i], gx + 175, gy + 40);
      x.fillStyle = "#7ea0b3"; x.font = "500 14px 'Segoe UI', Arial"; x.textAlign = "left";
      x.fillText("SAR " + (7 + i * 3), gx + 16, gy + 88);
    }
    x.fillStyle = "#0c1722"; x.fillRect(680, 94, 195, 480);
    x.fillStyle = "#dff3ff"; x.font = "700 20px 'Segoe UI', Arial"; x.textAlign = "right";
    x.fillText("الفاتورة", 850, 130);
    x.font = "500 15px 'Segoe UI', Arial"; x.fillStyle = "#a4bdcd";
    const lines = ["لاتيه متوسط ×2", "كرواسون ×1", "مياه ×1", "", "المجموع   SAR 46.00", "الضريبة   SAR 6.90"];
    lines.forEach(function (l, i) { x.fillText(l, 850, 175 + i * 30); });
    x.fillStyle = "#2bd9ff"; x.fillRect(690, 370, 170, 56);
    x.fillStyle = "#04121a"; x.font = "800 22px 'Segoe UI', Arial"; x.textAlign = "center";
    x.fillText("دفع", 775, 407);
    x.fillStyle = "#123244"; x.fillRect(690, 445, 170, 46);
    x.fillStyle = "#8fcfe8"; x.font = "600 17px 'Segoe UI', Arial"; x.fillText("طباعة الإيصال", 775, 474);
    x.fillStyle = "#0e2130"; x.fillRect(0, Hh - 42, W, 42);
    x.fillStyle = "#76a6bf"; x.font = "500 15px 'Segoe UI', Arial"; x.textAlign = "right"; x.fillText("الصندوق مفتوح · الموظف: أحمد", W - 24, Hh - 15);
    return H.finishTex(c, { srgb: true });
  }
  function kioskUI() {
    const W = 600, Hh = 1000, c = H.canvas(W, Hh), x = c.getContext("2d");
    const bg = x.createLinearGradient(0, 0, W, Hh);
    bg.addColorStop(0, "#04121e"); bg.addColorStop(0.6, "#0a2436"); bg.addColorStop(1, "#050b12");
    x.fillStyle = bg; x.fillRect(0, 0, W, Hh);
    x.strokeStyle = "rgba(43,217,255,.18)";
    for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(W * 0.7, 260, 60 + i * 32, 0, 6.283); x.stroke(); }
    x.fillStyle = "#2bd9ff"; x.font = "700 22px 'Segoe UI', Arial"; x.textAlign = "right"; x.fillText("NOVA", W - 34, 58);
    x.fillStyle = "#eef8ff"; x.font = "800 46px 'Segoe UI', Arial"; x.fillText("مرحباً بك", W - 34, 200);
    x.fillStyle = "#9db8c9"; x.font = "500 22px 'Segoe UI', Arial"; x.fillText("كيف يمكننا خدمتك اليوم؟", W - 34, 242);
    // بحث
    x.fillStyle = "rgba(255,255,255,.07)"; x.fillRect(34, 300, W - 68, 74);
    x.strokeStyle = "rgba(43,217,255,.5)"; x.lineWidth = 2; x.strokeRect(34, 300, W - 68, 74);
    x.fillStyle = "#a9c2d1"; x.font = "500 20px 'Segoe UI', Arial"; x.textAlign = "right"; x.fillText("ابحث عن منتج، خدمة، أو رقم طلب…", W - 70, 344);
    // أزرار
    const items = [["المنتجات", "تصفح الأقسام والأسعار", "#2bd9ff"], ["تتبع الطلب", "أدخل رقم الفاتورة", "#ffb12e"], ["الخدمات", "حجز موعد أو دعم", "#35f28c"]];
    items.forEach(function (it, i) {
      const y = 420 + i * 150;
      x.fillStyle = "rgba(12,35,50,.9)"; x.fillRect(34, y, W - 68, 122);
      x.strokeStyle = "rgba(255,255,255,.12)"; x.strokeRect(34, y, W - 68, 122);
      x.fillStyle = it[2]; x.globalAlpha = .18; x.fillRect(34, y, 10, 122); x.globalAlpha = 1;
      x.fillStyle = "#eaf7ff"; x.font = "700 26px 'Segoe UI', Arial"; x.textAlign = "right"; x.fillText(it[0], W - 70, y + 50);
      x.fillStyle = "#8fb1c4"; x.font = "500 17px 'Segoe UI', Arial"; x.fillText(it[1], W - 70, y + 84);
      x.fillStyle = it[2]; x.beginPath(); x.moveTo(60, y + 50); x.lineTo(78, y + 61); x.lineTo(60, y + 72); x.fill();
    });
    x.fillStyle = "rgba(4,10,15,.8)"; x.fillRect(0, Hh - 90, W, 90);
    x.fillStyle = "#7fa7bd"; x.font = "500 18px 'Segoe UI', Arial"; x.textAlign = "center"; x.fillText("امسح بطاقتك أو استخدم شاشة اللمس", W / 2, Hh - 40);
    return H.finishTex(c, { srgb: true });
  }
  function receiptTexture() {
    const W = 380, Hh = 620, c = H.canvas(W, Hh), x = c.getContext("2d");
    x.fillStyle = "#f4f1e8"; x.fillRect(0, 0, W, Hh);
    x.fillStyle = "#22252a"; x.textAlign = "center";
    x.font = "800 30px 'Segoe UI', Arial"; x.fillText("NOVA STORE", W / 2, 60);
    x.font = "500 16px 'Segoe UI', Arial"; x.fillText("المركز الرئيسي · الرياض", W / 2, 90);
    x.strokeStyle = "#8d8c86"; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(30, 118); x.lineTo(W - 30, 118); x.stroke(); x.setLineDash([]);
    x.font = "500 17px 'Segoe UI', Arial";
    const rows = [["لاتيه متوسط ×2", "26.00"], ["كرواسون ×1", "12.00"], ["مياه ×1", "8.00"]];
    x.textAlign = "right";
    rows.forEach(function (r, i) { x.fillText(r[0], W - 36, 165 + i * 40); x.fillText(r[1], 70, 165 + i * 40); });
    x.beginPath(); x.moveTo(30, 310); x.lineTo(W - 30, 310); x.stroke();
    x.textAlign = "right"; x.font = "700 20px 'Segoe UI', Arial"; x.fillText("المجموع", W - 36, 352); x.fillText("46.00", 90, 352);
    x.font = "500 16px 'Segoe UI', Arial"; x.fillText("الضريبة (15%)", W - 36, 386); x.fillText("6.90", 90, 386);
    x.textAlign = "center"; x.font = "800 26px 'Segoe UI', Arial"; x.fillText("شكراً لزيارتكم", W / 2, 460);
    // باركود
    for (let i = 0; i < 38; i++) {
      const w = 2 + Math.random() * 5;
      x.fillStyle = "#202327"; x.fillRect(60 + i * 7, 500, w, 70);
    }
    x.font = "500 14px 'Segoe UI', Arial"; x.fillStyle = "#55595e"; x.fillText("رقم الفاتورة: A-10492", W / 2, 600);
    return H.finishTex(c, { srgb: true });
  }

  /* ============================================================
     كشك معلومات تفاعلي
     ============================================================ */
  function buildKiosk(opts) {
    opts = opts || {};
    const g = new T.Group(); g.name = "kiosk";
    // قاعدة
    rbox(g, 1.8, 0.22, 1.35, 0.06, M.metalDark, 0, 0.11, 0);
    box(g, 1.6, 0.05, 1.2, M.steelDark, 0, 0.24, 0);
    // الجسم
    rbox(g, 1.6, 4.5, 1.0, 0.1, M.metalDark, 0, 2.4, 0);
    box(g, 1.5, 4.2, 0.04, M.aluminumBlack, 0, 2.5, -0.51);
    // شاشة كبيرة
    const scr = new T.Group(); scr.position.set(0, 3.15, 0.51); g.add(scr);
    box(scr, 1.36, 2.15, 0.06, M.plasticBlack, 0, 0, 0);
    const disp = add(scr, new T.PlaneGeometry(1.22, 2.03), new T.MeshStandardMaterial({ map: kioskUI(), emissive: 0xffffff, emissiveMap: kioskUI(), emissiveIntensity: 0.55, roughness: 0.18 }), 0, 0, 0.035, { cast: false, receive: false });
    // استخدام نفس نسيج الشاشة للإضاءة
    disp.material.emissiveMap = disp.material.map;
    add(scr, new T.PlaneGeometry(1.3, 2.1), M.screenGlare, 0, 0, 0.045, { cast: false, receive: false });
    // حواف وحواف مضيئة
    box(scr, 1.5, 0.035, 0.06, M.ledCyan, 0, 1.11, 0.045, { cast: false, receive: false });
    box(scr, 1.5, 0.035, 0.06, M.ledCyan, 0, -1.11, 0.045, { cast: false, receive: false });
    decal(scr, "TOUCH", 0.3, 0.04, 0.5, -1.05, 0.08, { fontSize: 24, color: "#7fcfe5" });
    tag(scr, "شاشة اللمس", "شاشة 27 بوصة بإطار معدني: مقاومة للخدوش وتعمل بالقفاز، تعرض دليل المنتجات والخرائط.");
    // كاميرا
    const cam = sphere(g, 0.045, M.ledWhite, 0, 4.53, 0.42, { seg: 12, seg2: 8 });
    cyl(g, 0.055, 0.055, 0.04, 14, M.plasticBlack, 0, 4.53, 0.47, { rx: Math.PI / 2 });
    tag(cam, "كاميرا ومستشعرات", "كاميرا صغيرة للتحليلات ومستشعر ضوء؛ تخفي بيانات مجهولة عن عدد الزوار.");
    // قارئ بطاقة وباركود
    const reader = new T.Group(); reader.position.set(0.55, 1.8, 0.55); g.add(reader);
    box(reader, 0.3, 0.5, 0.1, M.plasticBlack, 0, 0, 0);
    box(reader, 0.22, 0.14, 0.02, M.screen, 0, 0.12, 0.06);
    decal(reader, "NFC", 0.18, 0.04, 0, 0.12, 0.075, { fontSize: 26, color: "#78e2ff", emissive: "#2bd9ff", emissiveIntensity: .7 });
    for (let i = 0; i < 3; i++) box(reader, 0.2, 0.02, 0.015, M.ledCyan, 0, -0.06 - i * 0.06, 0.06, { cast: false });
    // ماسح باركود
    const scan = new T.Group(); scan.position.set(-0.55, 1.85, 0.56); g.add(scan);
    box(scan, 0.34, 0.22, 0.12, M.plasticBlack, 0, 0, 0);
    box(scan, 0.24, 0.05, 0.05, M.glassDark, 0, 0.06, 0.07);
    box(scan, 0.2, 0.012, 0.02, M.ledRed, 0, 0.02, 0.1, { cast: false });
    tag(scan, "ماسح الباركود", "يقرأ رموز QR والباركود بسرعة؛ يساعد الزائر على تتبع طلبه أو حجز موعد فوراً.");
    // فتحات تهوية أسفل
    for (let i = 0; i < 12; i++) box(g, 0.04, 0.02, 0.02, M.plasticBlack, -0.5 + i * 0.09, 0.64, 0.505, { cast: false });
    for (let i = 0; i < 8; i++) box(g, 0.02, 0.03, 0.8, M.plasticBlack, 0.805, 0.75 + i * 0.06, 0, { cast: false });
    // شعار مضيء
    decal(g, "NOVA", 0.6, 0.16, 0, 4.32, 0.51, { fontSize: 60, color: "#dff7ff", emissive: "#bcecff", emissiveIntensity: 0.55 });
    tag(g, "كشك الخدمة الذاتية", "يخدم الزوار 24/7: بحث، دفع، حجز، وطباعة — يخفف الضغط على الموظفين ويقلل الانتظار.");
    return H.ticks(g);
  }
  net.kiosk = buildKiosk;
  H.register("kiosk", function () { return buildKiosk(); });

  /* ============================================================
     نقطة بيع POS كاملة
     ============================================================ */
  function buildPOS() {
    const root = new T.Group(); root.name = "pos";
    // منصة/كاونتر
    rbox(root, 4.6, 0.12, 3.2, 0.04, M.stage, 0, 0.04, 0);
    H.stageDeck(root, 4.3, 2.9, 0.13);
    // كاونتر
    const counter = new T.Group(); counter.position.y = 0.13; root.add(counter);
    rbox(counter, 4.2, 0.9, 2.2, 0.03, M.metalDark, 0, 0.45, 0.15);
    rbox(counter, 4.3, 0.08, 2.3, 0.02, M.carbon, 0, 0.93, 0.15);
    box(counter, 2.1, 0.2, 0.04, M.aluminumBlack, -0.4, 0.44, 1.26);
    for (let i = 0; i < 9; i++) box(counter, 0.9, 0.02, 0.03, M.plasticBlack, -0.4, 0.17 + i * 0.07, 1.27, { cast: false });
    // درج النقود
    const drawer = new T.Group(); drawer.position.set(-0.4, 0.4, 1.3); counter.add(drawer);
    box(drawer, 2.1, 0.36, 0.06, M.metalDark, 0, 0, 0);
    box(drawer, 1.5, 0.05, 0.03, M.steelDark, 0, 0.1, 0.04);
    cyl(drawer, 0.035, 0.035, 0.05, 14, M.gold, 0.75, -0.06, 0.05, { rx: Math.PI / 2 });
    box(drawer, 0.25, 0.1, 0.03, M.ledGreen, -0.75, 0.05, 0.045, { cast: false });
    tag(drawer, "درج النقود", "يفتح تلقائياً عند إتمام البيع، وفيه خانات مرتبة للعملات والفواتير.");
    // الشاشة
    const term = new T.Group(); term.position.set(-0.5, 0.97, -0.3); counter.add(term);
    cyl(term, 0.16, 0.22, 0.08, 24, M.metalDark, 0, 0.04, 0);
    cyl(term, 0.06, 0.08, 0.75, 16, M.steelDark, 0, 0.35, 0);
    const head = new T.Group(); head.position.set(0, 0.88, 0.0); head.rotation.x = -0.18; term.add(head);
    box(head, 0.35, 0.25, 0.3, M.metalDark, 0, -0.1, -0.1);
    rbox(head, 1.9, 1.3, 0.14, 0.04, M.plasticBlack, 0, 0.5, 0.1);
    box(head, 1.72, 1.14, 0.03, M.screen, 0, 0.5, 0.18);
    const uiTex = posUI();
    add(head, new T.PlaneGeometry(1.64, 1.08), new T.MeshStandardMaterial({ map: uiTex, emissive: 0xffffff, emissiveMap: uiTex, emissiveIntensity: 0.45, roughness: 0.16 }), 0, 0.5, 0.202, { cast: false, receive: false });
    add(head, new T.PlaneGeometry(1.76, 1.18), M.screenGlare, 0, 0.5, 0.21, { cast: false, receive: false });
    decal(head, "NOVA", 0.22, 0.05, -0.7, 1.17, 0.19, { fontSize: 40, color: "#8b9ba6" });
    tag(head, "شاشة نقطة البيع", "شاشة لمس 15.6 بوصة تعرض المنتجات والفاتورة وطرق الدفع؛ يستطيع الموظف العمل دون لوحة مفاتيح.");
    tag(term, "ذراع وحامل", "حامل معدني يرفع الشاشة لمستوى نظر الموظف، ويخفي أسلاكها في العمود.");
    // طابعة إيصالات
    const printer = new T.Group(); printer.position.set(1.3, 1.0, 0.1); counter.add(printer);
    rbox(printer, 0.9, 0.48, 0.75, 0.04, M.plasticOffWhite, 0, 0.24, 0);
    rbox(printer, 0.84, 0.1, 0.68, 0.03, M.plasticCharcoal, 0, 0.48, -0.02);
    box(printer, 0.55, 0.025, 0.12, M.plasticBlack, 0, 0.51, 0.12);
    const rcpt = new T.Group(); rcpt.position.set(0, 0.55, 0.18); printer.add(rcpt);
    const rTex = receiptTexture();
    const paper = add(rcpt, new T.PlaneGeometry(0.5, 0.8), new T.MeshStandardMaterial({ map: rTex, roughness: 0.9, side: T.DoubleSide }), 0, 0.38, 0.06, { rx: -0.35, cast: false, receive: false });
    box(rcpt, 0.16, 0.02, 0.1, M.ledGreen, -0.32, 0.02, 0.02, { cast: false });
    tag(printer, "طابعة الإيصالات", "طابعة حرارية بلا حبر: تطبع الفاتورة في ثانية، وتوفر نسخة رقمية عبر NFC أو رسالة.");
    // قارئ بطاقات
    const card = new T.Group(); card.position.set(0.8, 1.1, 0.95); counter.add(card);
    box(card, 0.5, 0.15, 0.35, M.plasticBlack, 0, 0, 0);
    box(card, 0.45, 0.05, 0.3, M.metalDark, 0, 0.1, 0);
    box(card, 0.3, 0.14, 0.02, M.screen, 0.1, 0.3, 0);
    decal(card, "SAR 46.00", 0.26, 0.05, 0.1, 0.3, 0.012, { fontSize: 28, color: "#8fe3ff", emissive: "#2bd9ff", emissiveIntensity: .6 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) box(card, 0.08, 0.025, 0.06, M.plasticCharcoal, -0.15 + c * 0.11, 0.2 - r * 0.045, 0.16, { cast: false });
    tag(card, "قارئ البطاقات", "يدعم الشبكة واللمس وApple Pay؛ يحوّل الهاتف إلى ماكينة دفع ويقلل الطوابير.");
    // ماسح باركود
    const scan = new T.Group(); scan.position.set(-1.55, 1.05, 0.8); counter.add(scan);
    const gun = new T.Group(); gun.rotation.set(-0.2, 0.4, 0.2); scan.add(gun);
    box(gun, 0.24, 0.3, 0.5, M.plasticBlack, 0, 0.25, 0.1);
    box(gun, 0.2, 0.18, 0.24, M.glassDark, 0, 0.3, 0.4);
    box(gun, 0.19, 0.12, 0.03, M.ledRed, 0, 0.28, 0.53, { cast: false });
    box(gun, 0.16, 0.5, 0.17, M.plasticCharcoal, 0, 0.02, -0.02, { rz: 0.16 });
    box(gun, 0.17, 0.05, 0.2, M.ledGreen, 0, -0.2, -0.03, { cast: false });
    tag(scan, "ماسح الباركود", "يقرأ رمز المنتج بالليزر في أجزاء من الثانية ويرسله مباشرة إلى الفاتورة.");
    // علبة/بطاقة
    box(counter, 0.4, 0.02, 0.3, M.plasticBlack, -1.5, 0.97, -0.7, { cast: false });
    // ملصقات الكاونتر
    decal(counter, "NOVA  CHECKOUT", 0.9, 0.08, 1.25, 0.72, 1.27, { fontSize: 30, color: "#93cddf" });
    tag(root, "محطة نقطة البيع POS", "كل ما يحتاجه الكاشير في متر مربع: شاشة لمس، درج نقود، طابعة، ماسح، وقارئ بطاقات.");
    H.ticks(root);
    return root;
  }
  net.pos = buildPOS;
  H.register("pos-terminal", function () { return buildPOS(); });

  /* ============================================================
     Thin Client
     ============================================================ */
  function buildThinClient() {
    const g = new T.Group(); g.name = "thinclient";
    // قاعدة عرض
    rbox(g, 2.4, 0.1, 2.0, 0.03, M.stage, 0, 0.035, 0);
    H.stageDeck(g, 2.2, 1.8, 0.11);
    // الحامل
    const stand = new T.Group(); stand.position.y = 0.12; stand.rotation.x = -0.18; g.add(stand);
    cyl(stand, 0.4, 0.44, 0.04, 32, M.metalDark, 0, 0.04, 0);
    box(stand, 0.08, 0.5, 0.08, M.steelDark, 0, 0.28, -0.2);
    // الجهاز
    const body = new T.Group(); body.position.set(0, 0.62, 0.02); body.rotation.x = -0.2; stand.add(body);
    rbox(body, 1.7, 0.4, 1.4, 0.05, M.metalDark, 0, 0, 0);
    rbox(body, 1.6, 0.05, 1.3, 0.03, M.aluminumBlack, 0, 0.2, 0);
    for (let i = 0; i < 10; i++) box(body, 1.3, 0.012, 0.035, M.plasticBlack, 0, 0.23, -0.4 + i * 0.08, { cast: false });
    decal(body, "NOVA", 0.36, 0.11, 0, 0.205, 0.3, { rx: -Math.PI / 2, fontSize: 58, color: "#e4edf4" });
    decal(body, "ThinClient T4", 0.4, 0.06, 0, 0.205, 0.05, { rx: -Math.PI / 2, fontSize: 28, color: "#8fa0ad" });
    // الواجهة الأمامية
    const front = new T.Group(); front.position.set(0, 0, 0.71); body.add(front);
    box(front, 0.1, 0.1, 0.03, M.metalDark, -0.65, 0, 0);
    torus(front, 0.03, 0.008, M.ledCyan, -0.65, 0, 0.025, { seg: 24, cast: false, receive: false });
    for (let i = 0; i < 2; i++) box(front, 0.13, 0.06, 0.03, M.plasticBlack, -0.3 + i * 0.2, 0.0, 0);
    cyl(front, 0.03, 0.03, 0.01, 14, M.ledGreen, 0.35, -0.02, 0.03, { cast: false });
    cyl(front, 0.03, 0.03, 0.01, 14, M.ledGreen, 0.43, -0.3, 0.03, { cast: false });
    decal(front, "USB-C   USB 3.2   AUDIO", 0.7, 0.035, 0, -0.12, 0.03, { fontSize: 18, color: "#65727d" });
    // الواجهة الخلفية
    const back = new T.Group(); back.position.set(0, 0, -0.71); body.add(back);
    rj45(back, -0.5, 0, -0.02, 0.85, { active: true });
    for (let i = 0; i < 4; i++) box(back, 0.11, 0.06, 0.03, M.plasticBlack, -0.05 + i * 0.15, 0.02, -0.02);
    for (let i = 0; i < 2; i++) box(back, 0.12, 0.07, 0.03, M.plasticBlack, 0.6, 0.04 - i * 0.1, -0.02);
    cyl(back, 0.03, 0.03, 0.01, 12, M.ledGreen, 0.72, 0.14, -0.04, { cast: false });
    tag(body, "جهاز Thin Client", "حاسوب صغير بلا قرص تقريباً: يعرض سطح مكتب افتراضي من السيرفر؛ آمن ورخيص وسهل الإدارة.");
    // كابل شبكة وكابل طاقة
    cable(g, [[-0.36, 0.6, -0.7], [-0.5, 0.35, -1.05], [-0.9, 0.16, -1.1]], 0.026, M.cableBlue, { seg: 16 });
    cable(g, [[0.6, 0.63, -0.68], [0.8, 0.3, -0.95], [1.0, 0.16, -0.8]], 0.025, M.sleeve, { seg: 16 });
    // محول طاقة صغير
    rbox(g, 0.55, 0.17, 0.4, 0.03, M.plasticBlack, 1.0, 0.22, -0.8);
    tag(front, "الواجهة الأمامية", "زر تشغيل مضيء ومنفذا USB-C/USB-A للسماعات والفلاش؛ مصابيح صغيرة للحالة.");
    return H.ticks(g);
  }
  net.thinClient = buildThinClient;
  H.register("thin-client", function () { return buildThinClient(); });

  /* ============================================================
     معرض التيرمنلات
     ============================================================ */
  function buildTerminalsScene() {
    const root = new T.Group();
    rbox(root, 6.6, 0.14, 4.2, 0.05, M.stage, 0, 0.045, 0);
    H.stageDeck(root, 6.2, 3.8, 0.145);
    const pos = buildPOS(); H.stripHotspots(pos); tag(pos, "نقطة بيع POS", "محطة كاشير كاملة: شاشة لمس ودفع وطابعة ودرج نقود."); pos.scale.set(0.75, 0.75, 0.75); pos.position.set(-1.5, 0.15, 0.8); pos.rotation.y = 0.25; root.add(pos);
    const kiosk = buildKiosk(); H.stripHotspots(kiosk); tag(kiosk, "كشك خدمة ذاتية", "شاشة لمس عمودية تخدم الزائر وتطبع وتدفع دون موظف."); kiosk.scale.set(0.78, 0.78, 0.78); kiosk.position.set(1.9, 0.15, -0.7); kiosk.rotation.y = -0.3; root.add(kiosk);
    const thin = buildThinClient(); H.stripHotspots(thin); tag(thin, "Thin Client", "حاسوب رفيع يعتمد على سيرفر مركزي؛ إدارة وترقية مركزية."); thin.scale.set(0.9, 0.9, 0.9); thin.position.set(-2.3, 0.15, -1.2); thin.rotation.y = 0.4; root.add(thin);
    return H.ticks(root);
  }
  H.register("terminals", buildTerminalsScene);
  net.terminalsScene = buildTerminalsScene;
})();
