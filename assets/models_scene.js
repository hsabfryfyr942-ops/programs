/* ============================================================
   HWM · المشاهد التركيبية: منصة الطرفيات + صالة العرض الرئيسية
   ============================================================ */
(function () {
  "use strict";
  const T = THREE, H = HWM, M = HWM.M, u = HWM.ui;
  const box = u.box, rbox = u.rbox, cyl = u.cyl, sphere = u.sphere, torus = u.torus,
    plane = u.plane, add = u.add, decal = u.decal, fan = u.fan, cable = u.cable;
  const tag = H.hotspot;
  const pc = H.pc, net = H.net, ph = H.ph;

  /* ---------- نسيج أرضية صالة العرض ---------- */
  function showFloorTex() {
    if (H.tex.showfloor) return H.tex.showfloor;
    const S = 2048, c = H.canvas(S, S), x = c.getContext("2d");
    const cx = S / 2, cy = S / 2;
    const g = x.createRadialGradient(cx, cy, S * 0.04, cx, cy, S * 0.52);
    g.addColorStop(0, "#151c26");
    g.addColorStop(0.32, "#0c1118");
    g.addColorStop(0.7, "#070a0f");
    g.addColorStop(1, "#040608");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.translate(cx, cy);
    // حلقات مضيئة خفيفة
    for (let r = 130; r < S * 0.5; r += 74) {
      const a = r % 296 === 130 ? 0.20 : 0.085;
      x.strokeStyle = "rgba(108,168,196," + a + ")";
      x.lineWidth = r % 296 === 130 ? 2.4 : 1.1;
      x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.stroke();
    }
    // علامات قياس
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const r0 = S * 0.46, r1 = S * 0.47 + (i % 6 === 0 ? 14 : 5);
      x.strokeStyle = i % 6 === 0 ? "rgba(120,190,215,.30)" : "rgba(110,160,180,.12)";
      x.lineWidth = i % 6 === 0 ? 2 : 1;
      x.beginPath();
      x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      x.stroke();
    }
    // خطوط قطرية رقيقة
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.13;
      const lg = x.createLinearGradient(0, 0, Math.cos(a) * S * 0.5, Math.sin(a) * S * 0.5);
      lg.addColorStop(0, "rgba(110,170,195,.10)");
      lg.addColorStop(1, "rgba(110,170,195,0)");
      x.strokeStyle = lg; x.lineWidth = 1;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * S * 0.5, Math.sin(a) * S * 0.5); x.stroke();
    }
    // دوائر تقنية صغيرة
    x.strokeStyle = "rgba(90,200,230,.22)";
    x.lineWidth = 1.4;
    [0.135, 0.175].forEach(function (rr) {
      x.beginPath(); x.arc(0, 0, S * rr, 0, 6.283); x.stroke();
    });
    H.tex.showfloor = H.finishTex(c, { srgb: true });
    return H.tex.showfloor;
  }

  /* ---------- خلفية قاعة المعرض (جدار أسطواني داخلي) ---------- */
  function hallTex() {
    if (H.tex.hallwall) return H.tex.hallwall;
    const W = 2048, Hh = 512, c = H.canvas(W, Hh), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, "#020407");
    g.addColorStop(0.42, "#050a10");
    g.addColorStop(0.78, "#08121a");
    g.addColorStop(1, "#0b1822");
    x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    const pw = W / 32;
    for (let i = 0; i < 32; i++) {
      const px = i * pw;
      x.fillStyle = i % 2 ? "rgba(18,36,48,.18)" : "rgba(6,12,18,.30)";
      x.fillRect(px + 2, 46, pw - 4, Hh - 46);
      if (i % 4 === 0) {
        const lg = x.createLinearGradient(0, 70, 0, Hh - 20);
        lg.addColorStop(0, "rgba(43,217,255,0)");
        lg.addColorStop(0.42, "rgba(43,217,255,.22)");
        lg.addColorStop(1, "rgba(43,217,255,.04)");
        x.fillStyle = lg; x.fillRect(px + 1, 70, 2, Hh - 90);
      }
      if (i % 8 === 4) {
        x.fillStyle = "rgba(120,200,230,.10)";
        x.fillRect(px + pw * 0.5 - 1, 84, 2, 150);
      }
    }
    x.fillStyle = "rgba(43,217,255,.18)"; x.fillRect(0, 42, W, 2);
    x.fillStyle = "rgba(43,217,255,.07)"; x.fillRect(0, Hh - 24, W, 1);
    const fg = x.createLinearGradient(0, Hh - 120, 0, Hh);
    fg.addColorStop(0, "rgba(20,60,78,0)");
    fg.addColorStop(1, "rgba(28,82,104,.20)");
    x.fillStyle = fg; x.fillRect(0, Hh - 120, W, 120);
    H.tex.hallwall = H.finishTex(c, { srgb: true, repeat: [3, 1] });
    return H.tex.hallwall;
  }

  function stageStrip(g, w, d, y, color, opacity) {
    const mat = new T.MeshStandardMaterial({
      color: 0x05080c, emissive: color, emissiveIntensity: 2.0,
      roughness: 0.4, metalness: 0.2, transparent: opacity != null, opacity: opacity == null ? 1 : opacity
    });
    const t = 0.035, inset = 0.18;
    box(g, w - inset * 2, 0.012, t, mat, 0, y, d / 2 - inset, { cast: false, receive: false });
    box(g, w - inset * 2, 0.012, t, mat, 0, y, -d / 2 + inset, { cast: false, receive: false });
    box(g, t, 0.012, d - inset * 2, mat, w / 2 - inset, y, 0, { cast: false, receive: false });
    box(g, t, 0.012, d - inset * 2, mat, -w / 2 + inset, y, 0, { cast: false, receive: false });
    return mat;
  }

  function zonePlatform(w, d, h, color, label, index, descr) {
    const g = new T.Group();
    // bevelSize يضيف 0.05 فوق h؛ نُنزل الجسم ليبقى السطح العلوي عند h ويظهر لوح الكربون
    rbox(g, w, h, d, 0.1, M.stage, 0, h / 2 - 0.05, 0);
    box(g, w - 0.08, 0.022, d - 0.08, M.deck, 0, h + 0.001, 0, { cast: false });
    box(g, w, 0.024, d, M.metalDark, 0, 0.012, 0, { cast: false });
    const strip = stageStrip(g, w, d, h + 0.018, color);
    const glowMat = new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.10, side: T.DoubleSide, depthWrite: false });
    plane(g, w * 0.96, d * 0.96, glowMat, 0, h + 0.024, 0, { rx: -Math.PI / 2, cast: false, receive: false });
    // لوحة الاسم الأمامية
    decal(g, label, Math.min(3.6, w * 0.42), 0.12, 0, h * 0.56, d / 2 + 0.012, { fontSize: 38, color: "#cfe3ee" });
    decal(g, "0" + index + "  ·  NOVA LAB", 0.9, 0.05, -w / 2 + 1.1, h * 0.24, d / 2 + 0.012, { fontSize: 22, color: "#647683" });
    if (descr) decal(g, descr, Math.min(2.6, w * 0.3), 0.05, w / 2 - 1.5, h * 0.24, d / 2 + 0.012, { fontSize: 20, color: "#4e5d68" });
    // توهج أرضي
    const ringMat = new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.32, side: T.DoubleSide, depthWrite: false });
    const ring = new T.Mesh(new T.RingGeometry(Math.max(w, d) * 0.6, Math.max(w, d) * 0.615, 64), ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; g.add(ring);
    ring.userData.noFit = true;
    const pulse = { t: 0.0 };
    g.userData.tick = function (t) {
      pulse.t = 0.65 + 0.35 * Math.sin(t * 1.4 + index);
      strip.emissiveIntensity = 1.5 + pulse.t;
      ringMat.opacity = 0.16 + pulse.t * 0.12;
    };
    return g;
  }

  function tagItem(obj, label, desc, href) {
    H.stripHotspots(obj);
    tag(obj, label, desc, href ? { href: href } : null);
    return obj;
  }

  /* ============================================================
     منصة الطرفيات — صفحة الطرفيات
     ============================================================ */
  function buildPeripheralsPage() {
    const root = new T.Group(); root.name = "peripheralsStage";
    const W = 17, D = 11, TOP = 0.16;
    // منصة رئيسية
    rbox(root, W, TOP, D, 0.12, M.stage, 0, TOP / 2 - 0.06, 0);
    box(root, W + 0.12, 0.05, D + 0.12, M.metalDark, 0, 0.025, 0, { cast: false });
    box(root, W - 0.16, 0.018, D - 0.16, M.deck, 0, TOP + 0.002, 0, { cast: false });
    stageStrip(root, W, D, TOP + 0.02, 0xb98cff);
    decal(root, "NOVA  ·  PERIPHERAL LAB", 1.9, 0.1, 0, 0.085, D / 2 + 0.035, { fontSize: 34, color: "#8e9fae", emissive: "#b98cff", emissiveIntensity: 0.25 });
    decal(root, "09 DEVICES  ·  USB-C / WIRELESS", 1.4, 0.06, 0, 0.045, D / 2 + 0.035, { fontSize: 22, color: "#5c6a76" });

    const mon = ph.monitor(); mon.position.set(0, TOP, -2.7); mon.rotation.y = 0.1; mon.scale.set(0.95, 0.95, 0.95); root.add(mon);
    const kb = ph.keyboard(); kb.position.set(0, TOP, 1.35); kb.rotation.y = 0.02; kb.scale.set(0.95, 0.95, 0.95); root.add(kb);
    const ms = ph.mouse(); ms.position.set(2.65, TOP, 1.55); ms.rotation.y = -0.45; ms.scale.set(1.0, 1.0, 1.0); root.add(ms);
    const hs = ph.headset(); hs.position.set(-4.35, TOP, 1.0); hs.rotation.y = 0.32; root.add(hs);
    const spL = ph.speaker(0.35); spL.position.set(-5.25, TOP, -1.55); spL.scale.set(0.9, 0.9, 0.9); root.add(spL);
    const spR = ph.speaker(-0.35); spR.position.set(5.25, TOP, -1.55); spR.scale.set(0.9, 0.9, 0.9); root.add(spR);
    const wc = ph.webcam(); wc.position.set(3.95, TOP, -0.95); wc.rotation.y = -0.28; wc.scale.set(0.82, 0.82, 0.82); root.add(wc);
    const pr = ph.printer(); pr.position.set(5.65, TOP, -3.95); pr.rotation.y = -0.3; pr.scale.set(0.85, 0.85, 0.85); root.add(pr);
    const sc = ph.scanner(); sc.position.set(-5.35, TOP, -3.95); sc.rotation.y = 0.3; sc.scale.set(0.87, 0.87, 0.87); root.add(sc);
    const ups = ph.ups(); ups.position.set(6.55, TOP, 2.95); ups.rotation.y = -0.35; ups.scale.set(0.82, 0.82, 0.82); root.add(ups);

    tagItem(mon, "شاشة 27\" 4K", "لوحة IPS/OLED بدقة 4K و144Hz، منافذ USB-C وHDMI وDisplayPort.", "monitor.html");
    tagItem(kb, "لوحة مفاتيح ميكانيكية", "87 مفتاحاً بهيكل ألمنيوم ومفاتيح PBT وإضاءة لكل مفتاح.", "keyboard.html");
    tagItem(ms, "ماوس احترافي", "مستشعر 30K DPI و7 أزرار قابلة للبرمجة ووزن خفيف.", "mouse.html");
    tagItem(hs, "هيدست ألعاب", "صوت محيطي وميكروفون عازل للضجيج ووسائد مريحة.", "headset.html");
    tagItem(spL, "سماعة مكتبية", "ووفر 5.25\" وتويتير؛ الصوت يملأ الغرفة بتفاصيل واضحة.", "speakers.html");
    tagItem(spR, "سماعة مكتبية", "زوج ستيريو بفتحة باس وقرص صوت؛ ضعهما على جانبي الشاشة.", "speakers.html");
    tagItem(wc, "ويب كام 4K", "عدسة 90° وميكروفونان وحلقة إضاءة وغطاء خصوصية.", "webcam.html");
    tagItem(pr, "طابعة ليزر", "طباعة سريعة بتونر عالي السعة، وواي فاي وEthernet.", "printer.html");
    tagItem(sc, "ماسح ضوئي مسطح", "مسح حتى 4800dpi مع تحويل مباشر إلى PDF أو بريد.", "scanner.html");
    tagItem(ups, "مزود طاقة UPS", "بطارية 1500VA تحمي الأجهزة من الانقطاع وتنقّل الجهد.", "ups.html");
    root.userData.refs = { monitor: mon, keyboard: kb, mouse: ms, headset: hs, speakers: [spL, spR], webcam: wc, printer: pr, scanner: sc, ups: ups };
    return H.ticks(root);
  }
  H.register("peripherals", buildPeripheralsPage);
  ph.buildPeripheralsPage = buildPeripheralsPage;

  /* ============================================================
     صالة العرض الرئيسية — الكيس + الشبكات + التيرمنلات + الطرفيات
     ============================================================ */
  function buildShowroom() {
    const root = new T.Group(); root.name = "showroom";

    /* ---------- الأرضية ---------- */
    const floorMat = new T.MeshStandardMaterial({
      color: 0x3b444d, map: showFloorTex(), roughness: 1, metalness: 0, envMapIntensity: 0.03
    });
    const floor = new T.Mesh(new T.CircleGeometry(34, 128), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    floor.receiveShadow = true;
    floor.userData.noFit = true;
    root.add(floor);
    const outerRing = torus(root, 20.5, 0.035, M.ledBlue, 0, 0.02, 0, { rx: Math.PI / 2, seg: 100, cast: false, receive: false });
    outerRing.userData.noFit = true;
    const outerRing2 = torus(root, 24.6, 0.02, M.ledCyan, 0, 0.02, 0, { rx: Math.PI / 2, seg: 100, cast: false, receive: false });
    outerRing2.userData.noFit = true;

    /* ---------- جدار القاعة الخلفي ---------- */
    const hallMat = new T.MeshBasicMaterial({ map: hallTex(), side: T.BackSide, fog: true });
    const hallWall = new T.Mesh(new T.CylinderGeometry(33.4, 33.4, 17, 96, 1, true), hallMat);
    hallWall.position.y = 8.5;
    hallWall.userData.noFit = true;
    root.add(hallWall);

    /* ---------- جزيئات غبار مضيئة ---------- */
    const dustCount = 420;
    const dustPos = new Float32Array(dustCount * 3);
    const dRng = H.makeRng(77);
    for (let i = 0; i < dustCount; i++) {
      const a = dRng() * Math.PI * 2, r = 4 + dRng() * 18;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = 0.5 + dRng() * 8;
      dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = new T.BufferGeometry();
    dustGeo.setAttribute("position", new T.BufferAttribute(dustPos, 3));
    const dust = new T.Points(dustGeo, new T.PointsMaterial({ color: 0x9fdcff, size: 0.045, transparent: true, opacity: 0.45, depthWrite: false, blending: T.AdditiveBlending }));
    dust.userData.noFit = true;
    root.add(dust);
    dust.userData.tick = function (t) {
      dust.rotation.y = t * 0.01;
      dust.position.y = Math.sin(t * 0.25) * 0.15;
    };

    /* ---------- ضوء موضعي لكل جزيرة ---------- */
    function zoneLight(color, x, y, z, intensity, dist) {
      const l = new T.PointLight(color, intensity, dist, 2);
      l.position.set(x, y, z);
      l.userData.noFit = true;
      root.add(l);
      return l;
    }
    zoneLight(0xbde9ff, 0, 9, 5.5, 6, 18);
    zoneLight(0x7dffcb, -8.4, 6.5, 2.0, 4, 12);
    zoneLight(0xffd39a, 9.0, 6.0, -2.5, 3.6, 12);
    zoneLight(0xd9b8ff, 10.5, 5.0, 7.5, 4.5, 13);
    zoneLight(0xdff4ff, 0.7, 6.0, 3.2, 2.5, 8);
    zoneLight(0xcfe9ff, 0.4, 2.6, 2.6, 1.5, 4.2);

    /* ---------- جزيرة الكيس (قلب الصالة) ---------- */
    const caseZone = new T.Group();
    root.add(caseZone);
    const caseStage = new T.Group(); caseStage.position.set(0, 0, 1.0); caseZone.add(caseStage);
    cyl(caseStage, 3.45, 3.75, 0.42, 72, M.stage, 0, 0.21, 0);
    cyl(caseStage, 3.28, 3.34, 0.16, 72, M.metalDark, 0, 0.46, 0);
    const caseTop = cyl(caseStage, 3.22, 3.22, 0.03, 72, M.deck, 0, 0.55, 0, { cast: false });
    const caseRingMat = new T.MeshStandardMaterial({ color: 0x04070b, emissive: 0x2bd9ff, emissiveIntensity: 2.3, roughness: 0.35 });
    const caseRing = torus(caseStage, 3.16, 0.028, caseRingMat, 0, 0.565, 0, { rx: -Math.PI / 2, seg: 96, cast: false, receive: false });
    torus(caseStage, 3.66, 0.02, M.steelDark, 0, 0.42, 0, { rx: -Math.PI / 2, seg: 96, cast: false, receive: false });
    caseRing.userData.tick = function (t) { caseRingMat.emissiveIntensity = 1.9 + Math.sin(t * 1.6) * 0.5; };
    // حروف/علامات على المنصة
    decal(caseStage, "NOVA  ·  01", 1.2, 0.1, 0, 0.575, 2.55, { rx: -Math.PI / 2, fontSize: 38, color: "#7e97a8", emissive: "#2bd9ff", emissiveIntensity: 0.5 });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      box(caseStage, 0.14, 0.006, 0.02, M.metalMid, Math.cos(a) * 2.98, 0.567, Math.sin(a) * 2.98, { ry: -a, cast: false, receive: false });
    }
    decal(caseStage, "FLAGSHIP BUILD  ·  ATX", 1.4, 0.06, 0, 0.31, 3.72, { fontSize: 26, color: "#64808f" });

    const caseObj = pc.casePage({});
    H.stripHotspots(caseObj);
    caseObj.position.set(0, 0.55, 1.0);
    caseObj.scale.set(1.13, 1.13, 1.13);
    caseObj.rotation.y = -0.42;
    caseZone.add(caseObj);
    tag(caseObj, "كيس الحاسوب الكامل", "كل القطع مثبتة ومربوطة: اللوحة الأم، المعالج، كرت الشاشة، الذاكرة، التخزين، التبريد، والطاقة — جاهز للإقلاع.", { href: "case.html" });

    /* ---------- جزيرة الشبكات ---------- */
    const netZone = new T.Group();
    root.add(netZone);
    const netPlat = zonePlatform(7.2, 5.4, 0.32, 0x35f28c, "أجهزة الشبكات", 2, "NETWORK RACK · 12U");
    netPlat.position.set(-8.4, 0, -0.8);
    netZone.add(netPlat);
    const rackObj = net.rack();
    H.stripHotspots(rackObj);
    rackObj.position.set(-8.4, 0.32, -0.8);
    rackObj.rotation.y = 0.34;
    netZone.add(rackObj);
    tag(rackObj, "راك الشبكات 12U", "راوتر وسويتش 24 منفذاً وجدار ناري وNAS وباتش بانل وUPS في هيكل واحد منظم.", { href: "network.html" });
    const upsObj = ph.ups();
    H.stripHotspots(upsObj);
    upsObj.position.set(-4.3, 0, 3.15);
    upsObj.rotation.y = 0.4;
    upsObj.scale.set(0.92, 0.92, 0.92);
    netZone.add(upsObj);
    tag(upsObj, "مزود طاقة UPS", "يُبقي الراوتر والسويتش يعملان عند انقطاع الكهرباء؛ البطارية تُغلق الأجهزة بأمان.", { href: "ups.html" });

    /* ---------- جزيرة التيرمنلات ---------- */
    const termZone = new T.Group();
    root.add(termZone);
    const termPlat = zonePlatform(10.0, 6.4, 0.32, 0xffb12e, "التيرمنلات", 3, "TERMINALS · SELF SERVICE");
    termPlat.position.set(9.2, 0, -4.9);
    termZone.add(termPlat);
    const kioskObj = net.kiosk();
    H.stripHotspots(kioskObj);
    kioskObj.position.set(9.9, 0.32, -6.15);
    kioskObj.rotation.y = 0.06;
    kioskObj.scale.set(0.94, 0.94, 0.94);
    termZone.add(kioskObj);
    tag(kioskObj, "كشك خدمة ذاتية", "شاشة لمس عمودية وطابعة وماسح باركود؛ يخدم الزوار على مدار الساعة.", { href: "kiosk.html" });
    const posObj = net.pos();
    H.stripHotspots(posObj);
    posObj.position.set(11.6, 0.32, -3.65);
    posObj.rotation.y = 0.42;
    posObj.scale.set(0.82, 0.82, 0.82);
    termZone.add(posObj);
    tag(posObj, "نقطة بيع POS", "كاونتر متكامل: شاشة لمس، درج نقود، طابعة إيصالات، قارئ بطاقات وماسح باركود.", { href: "pos-terminal.html" });
    const thinObj = net.thinClient();
    H.stripHotspots(thinObj);
    thinObj.position.set(6.55, 0.32, -5.7);
    thinObj.rotation.y = 0.5;
    thinObj.scale.set(0.92, 0.92, 0.92);
    termZone.add(thinObj);
    tag(thinObj, "جهاز Thin Client", "حاسوب صغير يعتمد على سيرفر مركزي؛ رخيص وآمن وسهل الإدارة للمكاتب.", { href: "thin-client.html" });

    /* ---------- جزيرة الطرفيات ---------- */
    const periphZone = new T.Group();
    periphZone.position.set(1.7, 0, 0.2);
    root.add(periphZone);
    const periphPlat = zonePlatform(9.8, 9.0, 0.32, 0xb98cff, "الأجهزة الطرفية", 4, "PERIPHERALS · USB-C");
    periphPlat.position.set(8.8, 0, 4.6);
    periphZone.add(periphPlat);
    const TOP = 0.32;
    const mon = ph.monitor(); H.stripHotspots(mon);
    mon.position.set(8.6, TOP, 2.6); mon.rotation.y = 0.52; mon.scale.set(0.88, 0.88, 0.88); periphZone.add(mon);
    tag(mon, "شاشة 4K", "27 بوصة IPS/OLED بدقة 4K و144Hz، منافذ USB-C وHDMI وDisplayPort.", { href: "monitor.html" });
    const kb = ph.keyboard(); H.stripHotspots(kb);
    kb.position.set(8.6, TOP, 6.15); kb.rotation.y = 0.03; kb.scale.set(0.88, 0.88, 0.88); periphZone.add(kb);
    tag(kb, "لوحة المفاتيح", "87 مفتاحاً ميكانيكياً بهيكل ألمنيوم ومفاتيح PBT وإضاءة لكل مفتاح.", { href: "keyboard.html" });
    const ms = ph.mouse(); H.stripHotspots(ms);
    ms.position.set(11.15, TOP, 6.3); ms.rotation.y = -0.4; ms.scale.set(0.94, 0.94, 0.94); periphZone.add(ms);
    tag(ms, "ماوس احترافي", "مستشعر 30K DPI و7 أزرار قابلة للبرمجة؛ خفيف ودقيق.", { href: "mouse.html" });
    const hs = ph.headset(); H.stripHotspots(hs);
    hs.position.set(5.3, TOP, 5.1); hs.rotation.y = 0.3; hs.scale.set(0.9, 0.9, 0.9); periphZone.add(hs);
    tag(hs, "هيدست ألعاب", "صوت محيطي وميكروفون عازل للضجيج ووسائد جلدية.", { href: "headset.html" });
    const spL = ph.speaker(0.38); H.stripHotspots(spL);
    spL.position.set(4.9, TOP, 3.1); spL.scale.set(0.86, 0.86, 0.86); periphZone.add(spL);
    tag(spL, "سماعة مكتبية", "ووفر 5.25\" وتويتير؛ تفاصيل صوتية واضحة تملأ الغرفة.", { href: "speakers.html" });
    const spR = ph.speaker(-0.38); H.stripHotspots(spR);
    spR.position.set(12.2, TOP, 3.1); spR.scale.set(0.86, 0.86, 0.86); periphZone.add(spR);
    tag(spR, "سماعة مكتبية", "السماعة الثانية للستيريو؛ ضعها على مسافة متساوية من الشاشة.", { href: "speakers.html" });
    const wc = ph.webcam(); H.stripHotspots(wc);
    wc.position.set(12.75, TOP, 4.65); wc.rotation.y = -0.3; wc.scale.set(0.72, 0.72, 0.72); periphZone.add(wc);
    tag(wc, "ويب كام 4K", "عدسة زجاجية 90° وميكروفونان وحلقة إضاءة وغطاء خصوصية.", { href: "webcam.html" });
    const pr = ph.printer(); H.stripHotspots(pr);
    pr.position.set(5.0, TOP, 0.9); pr.rotation.y = 0.28; pr.scale.set(0.62, 0.62, 0.62); periphZone.add(pr);
    tag(pr, "طابعة ليزر", "تونر عالي السعة وطباعة واي فاي؛ جودة حادة وسريعة.", { href: "printer.html" });

    /* ---------- بيانات العارض ---------- */
    root.userData.zones = [
      { label: "الكل", all: true, color: "#e8f2f8" },
      { label: "الكيس", obj: caseZone, color: "#2bd9ff" },
      { label: "الشبكات", obj: netZone, color: "#35f28c" },
      { label: "التيرمنلات", obj: termZone, color: "#ffb12e" },
      { label: "الطرفيات", obj: periphZone, color: "#b98cff" }
    ];
    root.userData.refs = {
      case: caseObj, rack: rackObj, ups: upsObj, kiosk: kioskObj, pos: posObj, thin: thinObj,
      monitor: mon, keyboard: kb, mouse: ms, headset: hs, speakers: [spL, spR], webcam: wc, printer: pr,
      zones: { case: caseZone, network: netZone, terminals: termZone, peripherals: periphZone }
    };
    root.userData.glass = caseObj.userData.glass;
    root.userData.hero = true;
    return H.ticks(root);
  }
  H.register("showroom", buildShowroom);
  HWM.scene = { buildShowroom: buildShowroom, buildPeripheralsPage: buildPeripheralsPage };

  /* ============================================================
     نسخ عرض محسّنة للصفحات المستقلة (قاعدة + خلفية)
     ============================================================ */
  function displayBase(w, d, accent, label) {
    const g = new T.Group();
    rbox(g, w, 0.14, d, 0.05, M.stage, 0, 0.07 - 0.025, 0);
    box(g, w - 0.1, 0.012, d - 0.1, M.deck, 0, 0.145, 0, { cast: false });
    stageStrip(g, w, d, 0.155, accent);
    if (label) decal(g, label, Math.min(1.8, w * 0.35), 0.06, 0, 0.08, d / 2 + 0.012, { fontSize: 28, color: "#7e93a2" });
    return g;
  }

  HWM.displayBase = displayBase;
})();
