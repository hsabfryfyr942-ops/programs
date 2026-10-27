/* ============================================================
   HWM · مواد ونسيج وأدوات بناء المجسّمات (Three.js r128)
   كل شيء يعمل محلياً بدون إنترنت — نسيج إجرائي بالكامل
   ============================================================ */
(function () {
  "use strict";
  const T = THREE;
  const HWM = (window.HWM = window.HWM || {});
  HWM.models = HWM.models || {};
  HWM.register = function (name, fn) { HWM.models[name] = fn; return fn; };

  /* ---------- عشوائية ثابتة (كي تبدو التفاصيل متطابقة في كل تشغيل) ---------- */
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  let R = makeRng(0x9e3779b9);
  const rr = (a, b) => a + (b - a) * R();
  const ri = (a, b) => Math.floor(rr(a, b + 1));
  const pick = (arr) => arr[Math.floor(R() * arr.length) % arr.length];

  /* ---------- كانفس ---------- */
  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  function finishTex(c, opts) {
    opts = opts || {};
    const tx = new T.CanvasTexture(c);
    if (opts.srgb !== false) tx.encoding = T.sRGBEncoding;
    if (opts.repeat) {
      tx.wrapS = tx.wrapT = T.RepeatWrapping;
      tx.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
    tx.anisotropy = HWM.__aniso || 4;
    if (opts.nearest) { tx.magFilter = T.NearestFilter; }
    return tx;
  }
  HWM.applyAnisotropy = function (n) {
    HWM.__aniso = Math.min(8, n || 4);
    Object.keys(HWM.tex || {}).forEach(function (k) {
      const t = HWM.tex[k]; if (t && t.isTexture) t.anisotropy = HWM.__aniso;
    });
  };
  HWM.tex = {};

  /* ---------- نسيج PCB واقعي ---------- */
  function pcbTex(seed, dark) {
    const key = "pcb" + seed + (dark ? "d" : "g");
    if (HWM.tex[key]) return HWM.tex[key];
    const S = 1024, c = canvas(S, S), x = c.getContext("2d");
    R = makeRng(seed || 7);
    const base = dark ? "#0b0d10" : "#0a241d";
    x.fillStyle = base; x.fillRect(0, 0, S, S);
    // تدرّج خفيف
    const g = x.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "rgba(255,255,255,.035)");
    g.addColorStop(0.5, "rgba(0,0,0,.10)");
    g.addColorStop(1, "rgba(255,255,255,.02)");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    // مسارات النحاس بزوايا 45
    for (let i = 0; i < 260; i++) {
      let px = rr(20, S - 20), py = rr(20, S - 20);
      const steps = ri(2, 7);
      x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < steps; s++) {
        const len = rr(18, 130);
        const dir = pick([[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]);
        px += dir[0] * len; py += dir[1] * len;
        x.lineTo(px, py);
      }
      x.strokeStyle = R() > 0.55 ? "rgba(154,113,46,.34)" : "rgba(38,92,70,.55)";
      x.lineWidth = rr(0.7, 2.6);
      x.stroke();
      if (R() > 0.5) {
        x.fillStyle = "rgba(203,162,80,.5)";
        x.beginPath(); x.arc(px, py, rr(1.4, 3.4), 0, 6.283); x.fill();
      }
    }
    // نقاط لحام / vias
    for (let i = 0; i < 460; i++) {
      const px = rr(0, S), py = rr(0, S), rad = rr(1.2, 4.2);
      x.beginPath(); x.arc(px, py, rad, 0, 6.283);
      x.fillStyle = "rgba(206,172,94,.55)"; x.fill();
      x.beginPath(); x.arc(px, py, rad * 0.42, 0, 6.283);
      x.fillStyle = "rgba(8,10,10,.9)"; x.fill();
    }
    // كتابة سلك سكرين
    x.textAlign = "left";
    const labels = ["DIMM_A1", "DIMM_B1", "CPU_FAN", "AIOPUMP", "SATA6G_1", "PCIE_1", "M.2_1", "JFP1", "ATX_12V", "DDR5", "USB3_12", "DEBUG", "SYS_FAN2", "ARGB_1", "CLR_CMOS", "B550", "AUDIO", "LAN"];
    for (let i = 0; i < 26; i++) {
      x.save();
      x.translate(rr(30, S - 200), rr(30, S - 20));
      x.rotate(R() > 0.75 ? -Math.PI / 2 : 0);
      x.fillStyle = "rgba(210,219,200,.42)";
      x.font = "600 " + ri(10, 16) + "px 'Segoe UI', Arial";
      x.fillText(pick(labels), 0, 0);
      x.restore();
    }
    // مربعات رقائق مطبوعة صغيرة
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = "rgba(200,215,195,.16)";
      x.lineWidth = 1;
      x.strokeRect(rr(20, S - 90), rr(20, S - 90), rr(20, 70), rr(14, 44));
    }
    HWM.tex[key] = finishTex(c, { srgb: true, repeat: [1, 1] });
    return HWM.tex[key];
  }
  HWM.pcbTex = pcbTex;

  /* ---------- نسيج لمسات معدنية / بلاستيك ---------- */
  function brushedTex(seed, light) {
    const key = "brush" + (light ? "l" : "d");
    if (HWM.tex[key]) return HWM.tex[key];
    const W = 512, Hh = 512, c = canvas(W, Hh), x = c.getContext("2d");
    R = makeRng(seed || 33);
    x.fillStyle = light ? "#8d9298" : "#2a2e33"; x.fillRect(0, 0, W, Hh);
    for (let y = 0; y < Hh; y += 2) {
      const v = 0.30 + R() * 0.55;
      x.fillStyle = "rgba(255,255,255," + (0.03 + R() * 0.11).toFixed(3) + ")";
      x.fillRect(0, y, W, 1);
      x.fillStyle = "rgba(0,0,0," + (R() * 0.09).toFixed(3) + ")";
      x.fillRect(0, y + 1, W, 1);
    }
    for (let i = 0; i < 26; i++) {
      x.strokeStyle = "rgba(255,255,255," + rr(0.02, 0.06).toFixed(3) + ")";
      x.lineWidth = rr(0.4, 1.4);
      x.beginPath(); x.moveTo(rr(0, W), rr(0, Hh)); x.lineTo(rr(0, W), rr(0, Hh)); x.stroke();
    }
    HWM.tex[key] = finishTex(c, { srgb: false, repeat: [2, 2] });
    return HWM.tex[key];
  }

  function noiseTex(seed) {
    if (HWM.tex.noise) return HWM.tex.noise;
    const S = 256, c = canvas(S, S), x = c.getContext("2d");
    R = makeRng(seed || 99);
    const img = x.createImageData(S, S);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + Math.floor((R() - 0.5) * 90);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    HWM.tex.noise = finishTex(c, { srgb: false, repeat: [3, 3] });
    return HWM.tex.noise;
  }

  function carbonTex() {
    if (HWM.tex.carbon) return HWM.tex.carbon;
    const S = 128, c = canvas(S, S), x = c.getContext("2d");
    x.fillStyle = "#14161a"; x.fillRect(0, 0, S, S);
    for (let i = -S; i < S * 2; i += 16) {
      x.strokeStyle = "rgba(255,255,255,.055)"; x.lineWidth = 7;
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + S, S); x.stroke();
      x.strokeStyle = "rgba(0,0,0,.28)"; x.lineWidth = 7;
      x.beginPath(); x.moveTo(i + 8, 0); x.lineTo(i + 8 + S, S); x.stroke();
    }
    HWM.tex.carbon = finishTex(c, { srgb: true, repeat: [4, 4] });
    return HWM.tex.carbon;
  }

  /* ---------- شبك تهوية (شفاف) وفلتر غبار ---------- */
  function meshTex(dust) {
    const key = dust ? "dust" : "mesh";
    if (HWM.tex[key]) return HWM.tex[key];
    const S = 256, c = canvas(S, S), x = c.getContext("2d");
    x.clearRect(0, 0, S, S);
    if (dust) {
      x.fillStyle = "rgba(18,20,24,.55)"; x.fillRect(0, 0, S, S);
      x.strokeStyle = "rgba(120,130,140,.32)"; x.lineWidth = 1;
      for (let i = 0; i <= S; i += 8) {
        x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke();
        x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke();
      }
      HWM.tex[key] = finishTex(c, { srgb: true, repeat: [5, 5] });
    } else {
      x.fillStyle = "#1c2026"; x.fillRect(0, 0, S, S);
      x.fillStyle = "#07090c";
      for (let gy = 0; gy < 16; gy++) {
        for (let gx = 0; gx < 16; gx++) {
          x.beginPath();
          x.arc(gx * 16 + 8 + (gy % 2) * 8, gy * 16 + 8, 5.1, 0, 6.283);
          x.fill();
        }
      }
      HWM.tex[key] = finishTex(c, { srgb: true, repeat: [8, 8] });
    }
    return HWM.tex[key];
  }

  /* ---------- لوحة نص / ملصق ---------- */
  function labelTex(text, opts) {
    opts = opts || {};
    const fs = opts.fontSize || 64;
    const pad = opts.pad == null ? 26 : opts.pad;
    const fam = opts.font || "'Segoe UI', Arial, sans-serif";
    const fullFont = /\d+px/.test(fam) ? fam : (opts.weight || "700") + " " + fs + "px " + fam;
    const c = canvas(16, 16), x = c.getContext("2d");
    x.font = fullFont;
    const lines = String(text).split("\n");
    let w = 16;
    lines.forEach(function (l) { w = Math.max(w, x.measureText(l).width + pad * 2); });
    const h = lines.length * fs * 1.25 + pad * 1.3;
    const c2 = canvas(Math.ceil(w), Math.ceil(h));
    const g = c2.getContext("2d");
    if (opts.bg) { g.fillStyle = opts.bg; g.fillRect(0, 0, c2.width, c2.height); }
    if (opts.border) {
      g.strokeStyle = opts.border; g.lineWidth = 4;
      g.strokeRect(3, 3, c2.width - 6, c2.height - 6);
    }
    g.font = fullFont;
    g.textAlign = opts.align || "center";
    g.textBaseline = "middle";
    g.fillStyle = opts.color || "#e9eef5";
    const gx = opts.align === "left" ? pad : c2.width / 2;
    lines.forEach(function (l, i) {
      g.fillText(l, gx, pad * 0.65 + fs * 0.62 + i * fs * 1.25);
    });
    return { tex: finishTex(c2, { srgb: true }), w: c2.width, h: c2.height };
  }
  HWM.labelTex = labelTex;

  /* ---------- مواد ---------- */
  const M = {};
  const std = (o) => new T.MeshStandardMaterial(o);
  function initMaterials() {
    M.noise = noiseTex();
    M.brushedDark = brushedTex(4, false);
    M.brushedLight = brushedTex(5, true);

    M.plasticBlack = std({ color: 0x0f1216, roughness: 0.48, metalness: 0.06, bumpMap: M.noise, bumpScale: 0.005 });
    M.plasticCharcoal = std({ color: 0x191d23, roughness: 0.6, metalness: 0.05, bumpMap: M.noise, bumpScale: 0.004 });
    M.plasticGrey = std({ color: 0x5a626c, roughness: 0.55, metalness: 0.08 });
    M.plasticOffWhite = std({ color: 0xd8d5cd, roughness: 0.48, metalness: 0.02, bumpMap: M.noise, bumpScale: 0.003 });
    M.plasticBlue = std({ color: 0x233a55, roughness: 0.45, metalness: 0.12 });
    M.plasticRed = std({ color: 0x8f2027, roughness: 0.5, metalness: 0.05 });
    M.rubber = std({ color: 0x08090b, roughness: 0.92, metalness: 0.0, bumpMap: M.noise, bumpScale: 0.01 });
    M.metalDark = std({ color: 0x2b3037, metalness: 0.92, roughness: 0.42, roughnessMap: M.brushedDark, bumpMap: M.brushedDark, bumpScale: 0.004 });
    M.metalMid = std({ color: 0x6d7580, metalness: 0.95, roughness: 0.33, roughnessMap: M.brushedLight });
    M.steel = std({ color: 0xc4cad2, metalness: 1.0, roughness: 0.26, roughnessMap: M.brushedLight, envMapIntensity: 1.25 });
    M.steelDark = std({ color: 0x8a919a, metalness: 1.0, roughness: 0.35, roughnessMap: M.brushedDark });
    M.aluminum = std({ color: 0x9aa1a9, metalness: 0.92, roughness: 0.31, roughnessMap: M.brushedLight });
    M.aluminumBlack = std({ color: 0x23272d, metalness: 0.9, roughness: 0.4, roughnessMap: M.brushedDark });
    M.copper = std({ color: 0xb46b3f, metalness: 1.0, roughness: 0.3, roughnessMap: M.brushedLight });
    M.gold = std({ color: 0xd7a949, metalness: 1.0, roughness: 0.24 });
    M.solder = std({ color: 0xb9bfc7, metalness: 0.9, roughness: 0.35 });
    M.ceramic = std({ color: 0x6c5a45, roughness: 0.55, metalness: 0.05 });
    M.capAlu = std({ color: 0x2b3641, metalness: 0.75, roughness: 0.35 });
    M.blackPCB = std({ color: 0xffffff, map: pcbTex(11, true), roughness: 0.5, metalness: 0.28 });
    M.greenPCB = std({ color: 0xffffff, map: pcbTex(21, false), roughness: 0.5, metalness: 0.25 });
    M.carbon = std({ color: 0xffffff, map: carbonTex(), metalness: 0.45, roughness: 0.37 });
    M.deck = std({ color: 0x232c34, map: carbonTex(), metalness: 0, roughness: 1, envMapIntensity: 0 });
    M.mesh = new T.MeshStandardMaterial({ color: 0xffffff, map: meshTex(false), metalness: 0.55, roughness: 0.5, alphaTest: 0.35, side: T.DoubleSide });
    M.dust = new T.MeshStandardMaterial({ color: 0xffffff, map: meshTex(true), transparent: true, opacity: 0.9, roughness: 0.85, side: T.DoubleSide, depthWrite: false });
    M.glass = new T.MeshPhysicalMaterial({
      color: 0xa9cfdb, metalness: 0.0, roughness: 0.035, transparent: true, opacity: 0.16,
      clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 2.0, side: T.DoubleSide,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2
    });
    M.glassDark = new T.MeshPhysicalMaterial({
      color: 0x14191e, metalness: 0.1, roughness: 0.06, transparent: true, opacity: 0.5,
      clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.6, side: T.DoubleSide
    });
    M.screen = std({ color: 0x05070a, roughness: 0.22, metalness: 0.1 });
    M.screenGlare = new T.MeshPhysicalMaterial({ color: 0x0a0c10, roughness: 0.28, metalness: 0.02, clearcoat: 0.35, clearcoatRoughness: 0.28, envMapIntensity: 0.18, transparent: true, opacity: 0.14, depthWrite: false });
    M.led = function (color, intensity) {
      return new T.MeshStandardMaterial({ color: 0x050505, emissive: color, emissiveIntensity: intensity == null ? 2.4 : intensity, roughness: 0.32, metalness: 0.05 });
    };
    M.ledCyan = M.led(0x2bd9ff, 2.6);
    M.ledBlue = M.led(0x2a6bff, 2.1);
    M.ledGreen = M.led(0x35f28c, 1.9);
    M.ledAmber = M.led(0xffb12e, 2.1);
    M.ledRed = M.led(0xff3344, 2.2);
    M.ledWhite = M.led(0xe8f3ff, 2.6);
    M.fanBlade = std({ color: 0x171a1f, roughness: 0.42, metalness: 0.05, side: T.DoubleSide });
    M.fanBladeLight = std({ color: 0xd6dbe2, roughness: 0.42, metalness: 0.04, side: T.DoubleSide });
    M.sleeve = std({ color: 0x111216, roughness: 0.85, metalness: 0.02, bumpMap: M.noise, bumpScale: 0.01 });
    M.sleeveRed = std({ color: 0x5c1418, roughness: 0.8, metalness: 0.04 });
    M.cableGrey = std({ color: 0x2a2d33, roughness: 0.7 });
    M.cableBlue = std({ color: 0x1e4f7a, roughness: 0.55 });
    M.cableYellow = std({ color: 0xb58b28, roughness: 0.55 });
    M.wireCopper = std({ color: 0xb8763f, metalness: 0.95, roughness: 0.35 });
    M.wireBlue = std({ color: 0x2f6fd0, roughness: 0.6 });
    M.wireGreen = std({ color: 0x2c9b60, roughness: 0.6 });
    M.wireOrange = std({ color: 0xd2742f, roughness: 0.6 });
    M.paper = std({ color: 0xe8e6e0, roughness: 0.9, metalness: 0.0 });
    M.paperDark = std({ color: 0xd3d0c7, roughness: 0.9 });
    M.keycap = std({ color: 0x24272d, roughness: 0.44, metalness: 0.03, bumpMap: M.noise, bumpScale: 0.004 });
    M.keycapAccent = std({ color: 0x3c424c, roughness: 0.42, metalness: 0.05 });
    M.keycapLight = std({ color: 0xd9d8d2, roughness: 0.5, metalness: 0.02 });
    M.plate = std({ color: 0x9ba3ad, metalness: 0.95, roughness: 0.3 });
    M.deskWood = std({ color: 0x4a3527, roughness: 0.5, metalness: 0.05, map: HWM.tex.wood || null });
    M.floor = std({ color: 0x0b0e13, roughness: 0.42, metalness: 0.42 });
    M.stage = new T.MeshLambertMaterial({ color: 0x05080b });
    M.stageDeck = std({ color: 0x2b343d, map: carbonTex(), metalness: 0.08, roughness: 0.9, envMapIntensity: 0.04 });
  }
  initMaterials();
  HWM.M = M;
  Object.assign(HWM, { canvas, finishTex, makeRng, rr, ri, pick });

  /* ---------- أدوات إنشاء ---------- */
  const geoCache = new Map();
  function boxGeo(w, h, d) {
    const k = "b" + w.toFixed(3) + "_" + h.toFixed(3) + "_" + d.toFixed(3);
    if (!geoCache.has(k)) geoCache.set(k, new T.BoxGeometry(w, h, d));
    return geoCache.get(k);
  }
  function cylGeo(rt, rb, h, seg, open) {
    const k = "c" + rt.toFixed(3) + "_" + rb.toFixed(3) + "_" + h.toFixed(3) + "_" + seg + (open ? "o" : "");
    if (!geoCache.has(k)) geoCache.set(k, new T.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open));
    return geoCache.get(k);
  }
  function roundedRectShape(w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    const s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }
  function roundedBoxGeo(w, h, d, r) {
    const k = "rb" + [w, h, d, r].map((n) => n.toFixed(3)).join("_");
    if (!geoCache.has(k)) {
      const shape = roundedRectShape(w, h, r);
      const g = new T.ExtrudeGeometry(shape, {
        depth: d - r * 0.4, bevelEnabled: true, bevelSize: r * 0.5, bevelThickness: r * 0.5,
        bevelSegments: 2, curveSegments: 5, steps: 1
      });
      g.center();
      geoCache.set(k, g);
    }
    return geoCache.get(k);
  }

  function add(parent, geo, material, x, y, z, o) {
    o = o || {};
    const m = new T.Mesh(geo, material);
    m.position.set(x || 0, y || 0, z || 0);
    if (o.rx || o.ry || o.rz) m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    if (o.name) m.name = o.name;
    if (o.scale) m.scale.set(o.scale, o.scale, o.scale);
    parent.add(m);
    return m;
  }
  function box(parent, w, h, d, material, x, y, z, o) {
    return add(parent, boxGeo(w, h, d), material, x, y, z, o);
  }
  function rbox(parent, w, h, d, r, material, x, y, z, o) {
    return add(parent, roundedBoxGeo(w, h, d, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), material, x, y, z, o);
  }
  function cyl(parent, rt, rb, h, seg, material, x, y, z, o) {
    return add(parent, cylGeo(rt, rb, h, seg || 24), material, x, y, z, o);
  }
  function sphere(parent, rad, material, x, y, z, o) {
    o = o || {};
    const k = "s" + rad.toFixed(3);
    if (!geoCache.has(k)) geoCache.set(k, new T.SphereGeometry(rad, o.seg || 18, o.seg2 || 12));
    return add(parent, geoCache.get(k), material, x, y, z, o);
  }
  function torus(parent, rad, tube, material, x, y, z, o) {
    o = o || {};
    const k = "t" + rad.toFixed(3) + "_" + tube.toFixed(3) + "_" + (o.arc || 6.283);
    if (!geoCache.has(k)) geoCache.set(k, new T.TorusGeometry(rad, tube, o.tseg || 8, o.seg || 40, o.arc || Math.PI * 2));
    return add(parent, geoCache.get(k), material, x, y, z, o);
  }
  function plane(parent, w, h, material, x, y, z, o) {
    o = o || {};
    const k = "p" + w.toFixed(3) + "_" + h.toFixed(3);
    if (!geoCache.has(k)) geoCache.set(k, new T.PlaneGeometry(w, h));
    return add(parent, geoCache.get(k), material, x, y, z, o);
  }

  /* ---------- براغي ---------- */
  function screw(parent, x, y, z, size, axis, material) {
    size = size || 0.035;
    const g = new T.Group(); g.position.set(x, y, z);
    const head = cyl(g, size, size, size * 0.4, 14, material || M.steel, 0, 0, 0, { rx: Math.PI / 2, cast: false });
    const slotMat = M.metalDark;
    box(g, size * 1.3, size * 0.14, size * 0.06, slotMat, 0, 0, size * 0.21, { cast: false });
    box(g, size * 0.14, size * 1.3, size * 0.06, slotMat, 0, 0, size * 0.21, { cast: false });
    if (axis === "x") g.rotation.y = Math.PI / 2;
    if (axis === "y") g.rotation.x = -Math.PI / 2;
    parent.add(g);
    return g;
  }

  /* ---------- مروحة واقعية ---------- */
  function fan(opts) {
    opts = opts || {};
    const size = opts.size || 1.2;
    const depth = opts.depth == null ? 0.25 : opts.depth;
    const g = new T.Group();
    const frameMat = opts.frameMat || M.plasticBlack;
    const bladeMat = opts.bladeMat || M.fanBlade;
    const innerR = size * 0.455;
    // إطار مربع بفتحة دائرية
    const shape = roundedRectShape(size, size, size * 0.1);
    const hole = new T.Path();
    hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const fg = new T.ExtrudeGeometry(shape, { depth: depth * 0.72, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1, curveSegments: 24, steps: 1 });
    fg.center();
    add(g, fg, frameMat, 0, 0, 0, { cast: true });
    // حلقة داخلية
    torus(g, innerR + 0.005, depth * 0.11, frameMat, 0, 0, depth * 0.34, { seg: 44, tseg: 8 });
    // محور
    const hub = cyl(g, size * 0.155, size * 0.155, depth * 0.72, 26, opts.hubMat || M.plasticCharcoal, 0, 0, 0, { rx: Math.PI / 2 });
    // شفرات
    const blades = new T.Group();
    blades.position.z = 0.005;
    const bladeGeo = (function () {
      const s = new T.Shape();
      const r0 = size * 0.14, r1 = innerR * 0.98;
      s.moveTo(r0, 0.015 * size);
      s.bezierCurveTo(size * 0.22, size * 0.06, size * 0.34, size * 0.15, r1, size * 0.33);
      s.bezierCurveTo(innerR * 0.97, size * 0.4, innerR * 0.8, size * 0.35, innerR * 0.76, size * 0.19);
      s.bezierCurveTo(size * 0.27, size * 0.06, size * 0.19, -size * 0.02, r0, -size * 0.02);
      s.lineTo(r0, 0.015 * size);
      const e = new T.ExtrudeGeometry(s, { depth: size * 0.018, bevelEnabled: false, curveSegments: 14, steps: 1 });
      e.center();
      return e;
    })();
    const bladeCount = opts.blades || 7;
    for (let i = 0; i < bladeCount; i++) {
      const pivot = new T.Group();
      pivot.rotation.z = (i / bladeCount) * Math.PI * 2;
      const b = add(pivot, bladeGeo, bladeMat, innerR * 0.53, size * 0.02, 0, { cast: true });
      b.rotation.x = 0.62;
      b.rotation.z = -0.06;
      blades.add(pivot);
    }
    g.add(blades);
    // غطاء المحور + ملصق
    cyl(g, size * 0.148, size * 0.148, depth * 0.03, 26, M.metalDark, 0, 0, depth * 0.36, { rx: Math.PI / 2 });
    const lt = labelTex(opts.hubLabel || "NOVA", { fontSize: 60, font: "800 60px 'Segoe UI', Arial", color: "#c8d6e2", bg: "rgba(10,12,15,.0)" });
    const lm = add(g, new T.PlaneGeometry(size * 0.24, size * 0.24 * (lt.h / lt.w)), new T.MeshBasicMaterial({ map: lt.tex, transparent: true, depthWrite: false }), 0, 0, depth * 0.38, { cast: false, receive: false });
    // حلقة RGB
    if (opts.rgb !== false) {
      const ringMat = M.led(opts.ringColor == null ? 0x2bd9ff : opts.ringColor, opts.ringIntensity || 2.3);
      torus(g, innerR - 0.012, 0.014, ringMat, 0, 0, depth * 0.36, { seg: 54, tseg: 8, cast: false, receive: false });
      const ledMat2 = M.led(opts.ringColor == null ? 0x2bd9ff : opts.ringColor, 1.8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        sphere(g, 0.012, ledMat2, Math.cos(a) * size * 0.19, Math.sin(a) * size * 0.19, depth * 0.38, { seg: 8, seg2: 6, cast: false, receive: false });
      }
    }
    // براغي الأطراف
    if (opts.screws !== false) {
      const off = size * 0.43;
      [[-off, -off], [off, -off], [-off, off], [off, off]].forEach(function (p) {
        screw(g, p[0], p[1], depth * 0.37, size * 0.032, null, M.metalDark);
      });
    }
    if (opts.speed !== 0) {
      g.userData.tick = function (t, dt) {
        blades.rotation.z -= (opts.speed || 2.6) * dt;
      };
    }
    return g;
  }

  /* ---------- كابل منحنٍ ---------- */
  function cable(parent, points, radius, material, opts) {
    opts = opts || {};
    const curve = new T.CatmullRomCurve3(points.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
    const geo = new T.TubeGeometry(curve, opts.seg || 28, radius, opts.radial || 6, false);
    const m = add(parent, geo, material, 0, 0, 0, { cast: opts.cast !== false, receive: false });
    return m;
  }

  /* ---------- ملصق (نص مطبوع على سطح) ---------- */
  function decal(parent, text, w, h, x, y, z, opts) {
    opts = opts || {};
    const lt = labelTex(text, opts);
    const aspect = lt.h / lt.w;
    const mat = new T.MeshStandardMaterial({
      map: lt.tex, transparent: true, roughness: opts.roughness == null ? 0.6 : opts.roughness,
      metalness: 0.0, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3
    });
    if (opts.emissive) {
      mat.emissive = new T.Color(opts.emissive);
      mat.emissiveMap = lt.tex;
      mat.emissiveIntensity = opts.emissiveIntensity || 1;
    }
    const m = add(parent, new T.PlaneGeometry(w, w * aspect), mat, x, y, z, { rx: opts.rx, ry: opts.ry, rz: opts.rz, cast: false, receive: false });
    return m;
  }

  /* ---------- أضلاع تبريد ---------- */
  function finStack(parent, count, w, h, d, gap, material, x, y, z, axis) {
    const g = new T.Group();
    const step = d / count;
    for (let i = 0; i < count; i++) {
      const o = i * step;
      if (axis === "x") box(g, gap, h, w, material, o, 0, 0, { cast: true });
      else box(g, w, h, gap, material, 0, 0, o, { cast: true });
    }
    g.position.set(x, y, z);
    g.position[axis === "x" ? "x" : "z"] -= d / 2;
    parent.add(g);
    return g;
  }

  /* ---------- تسمية ثلاثية الأبعاد على المجسّم ---------- */
  HWM.stripHotspots = function (obj) {
    obj.traverse(function (o) { if (o.userData) delete o.userData.hotspot; });
    return obj;
  };
  HWM.hotspot = function (obj, label, desc, extra) {
    obj.userData.hotspot = Object.assign({ label: label, desc: desc }, extra || {});
    return obj;
  };
  HWM.explode = function (root, obj, x, y, z) {
    root.userData.explodeParts = root.userData.explodeParts || [];
    root.userData.explodeParts.push({ obj: obj, dir: new T.Vector3(x, y, z) });
    return obj;
  };
  HWM.ticks = function (root) {
    const list = [];
    root.traverse(function (o) { if (o.userData.tick) list.push(o); });
    root.userData.ticks = list;
    return root;
  };

  /* ---------- نسيج شاشة (خلفية مكتب/واجهات) ---------- */
  HWM.screenWallpaper = function (seed, label) {
    const W = 1024, H = 576, c = canvas(W, H), x = c.getContext("2d");
    R = makeRng(seed || 3);
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#071422"); g.addColorStop(0.5, "#0d2436"); g.addColorStop(1, "#050a12");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      const cx = rr(100, W - 100), cy = rr(80, H - 80), rad = rr(160, 420);
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      rg.addColorStop(0, i % 2 ? "rgba(37,211,255,.22)" : "rgba(255,170,70,.14)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg; x.beginPath(); x.arc(cx, cy, rad, 0, 6.283); x.fill();
    }
    x.strokeStyle = "rgba(120,230,255,.18)";
    for (let i = 0; i < 12; i++) {
      x.beginPath();
      const y0 = rr(60, H - 60);
      x.moveTo(-50, y0);
      x.bezierCurveTo(W * 0.3, y0 + rr(-160, 160), W * 0.7, y0 + rr(-160, 160), W + 50, y0 + rr(-120, 120));
      x.lineWidth = rr(0.5, 1.6);
      x.stroke();
    }
    x.strokeStyle = "rgba(160,240,255,.35)";
    x.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      x.beginPath(); x.arc(W * 0.62, H * 0.45, 90 + i * 40, 0, 6.283); x.stroke();
    }
    // شريط مهام
    x.fillStyle = "rgba(5,10,16,.78)"; x.fillRect(0, H - 44, W, 44);
    x.fillStyle = "rgba(255,255,255,.65)"; x.font = "600 18px 'Segoe UI', Arial";
    x.fillText(label || "NOVA Workstation", 24, H - 16);
    x.fillStyle = "rgba(43,217,255,.9)";
    for (let i = 0; i < 5; i++) x.fillRect(W - 220 + i * 32, H - 30, 18, 18);
    x.font = "500 16px 'Segoe UI', Arial"; x.fillStyle = "rgba(255,255,255,.8)";
    x.fillText("14:32  •  25/10", W - 140, H - 16);
    return finishTex(c, { srgb: true });
  };

  HWM.stageDeck = function (parent, w, d, y) {
    const th = 0.018;
    box(parent, w, th, d, M.stageDeck, 0, y, 0, { cast: false });
    const yy = y + th / 2 + 0.004, t = 0.03;
    box(parent, w, 0.008, t, M.ledCyan, 0, yy, d / 2 - t / 2, { cast: false, receive: false });
    box(parent, w, 0.008, t, M.ledCyan, 0, yy, -d / 2 + t / 2, { cast: false, receive: false });
    box(parent, t, 0.008, d, M.ledCyan, w / 2 - t / 2, yy, 0, { cast: false, receive: false });
    box(parent, t, 0.008, d, M.ledCyan, -w / 2 + t / 2, yy, 0, { cast: false, receive: false });
  };
  HWM.ui = {
    box: box, rbox: rbox, cyl: cyl, sphere: sphere, torus: torus, plane: plane, add: add,
    mesh: add, screw: screw, fan: fan, cable: cable, decal: decal, finStack: finStack,
    roundedRectShape: roundedRectShape, labelTex: labelTex, boxGeo: boxGeo, geoCache: geoCache
  };
})();
