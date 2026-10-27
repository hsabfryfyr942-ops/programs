/* ============================================================
   HWM · العارض التفاعلي 3D (Three.js r128 — يعمل محلياً بالكامل)
   سحب للدوران · نقر على القطع · تسميات · تفكيك · تكبير · شاشة كاملة
   ============================================================ */
(function () {
  "use strict";
  if (!window.THREE || !window.HWM) {
    document.querySelectorAll(".model-viewer").forEach(function (el) {
      el.innerHTML = '<div class="mv-error"><strong>تعذّر تحميل محرك العرض.</strong><span>تأكد من وجود ملفات assets/three.min.js محلياً.</span></div>';
    });
    return;
  }
  const T = THREE, H = HWM;
  const QA = (window.__QA = window.__QA || { errors: [], viewers: {}, readyCount: 0 });
  const hasConsoleHook = QA._hooked;
  QA._hooked = true;
  if (!hasConsoleHook) {
    window.addEventListener("error", function (e) {
      QA.errors.push(String((e && (e.message || e.error)) || "unknown error"));
    });
    window.addEventListener("unhandledrejection", function (e) {
      QA.errors.push("promise: " + String(e.reason));
    });
    const oldError = console.error;
    console.error = function () {
      try { QA.errors.push(Array.prototype.map.call(arguments, function (a) { return String(a); }).join(" ")); } catch (err) {}
      oldError.apply(console, arguments);
    };
  }

  const SVG = {
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9A9 9 0 1 1 3 12"/><path d="M3 4v5h5"/></svg>',
    rotate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 9A8.5 8.5 0 0 0 5 6.4L3 8.5"/><path d="M3 4v5h5"/><path d="M3.5 15A8.5 8.5 0 0 0 19 17.6l2-2.1"/><path d="M21 20v-5h-5"/></svg>',
    explode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 7.5 12 12l9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></svg>',
    glass: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 21 18 5"/></svg>',
    labels: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5"/><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M16 21h5v-5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>'
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function makeEnvTexture() {
    const W = 1024, Hh = 512, c = H.canvas(W, Hh), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, "#24344a");
    g.addColorStop(0.32, "#101b28");
    g.addColorStop(0.58, "#070b10");
    g.addColorStop(1, "#030406");
    x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    function soft(cx, cy, r, col, a) {
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, "rgba(" + col + "," + a + ")");
      rg.addColorStop(1, "rgba(" + col + ",0)");
      x.fillStyle = rg; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
    }
    soft(180, 110, 230, "255,250,238", 0.95);
    soft(470, 80, 170, "201,236,255", 0.7);
    soft(790, 120, 250, "255,235,205", 0.68);
    soft(300, 250, 320, "75,170,220", 0.22);
    soft(860, 300, 250, "160,110,255", 0.16);
    const glowBand = x.createLinearGradient(0, 150, 0, 230);
    glowBand.addColorStop(0, "rgba(255,255,255,0)");
    glowBand.addColorStop(0.55, "rgba(255,250,240,.35)");
    glowBand.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = glowBand; x.fillRect(0, 150, W, 80);
    for (let i = 0; i < 7; i++) {
      const bx = 80 + i * 140;
      const rw = 34 + (i % 3) * 26;
      x.fillStyle = "rgba(255,255,255," + (0.16 + (i % 4) * 0.05) + ")";
      x.fillRect(bx, 40, rw, 120);
    }
    const tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.encoding = T.sRGBEncoding;
    return tex;
  }

  function softShadowTexture() {
    if (H.tex.softShadow) return H.tex.softShadow;
    const S = 256, c = H.canvas(S, S), x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(0,0,0,.55)");
    g.addColorStop(0.45, "rgba(0,0,0,.30)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    H.tex.softShadow = H.finishTex(c, { srgb: false });
    return H.tex.softShadow;
  }

  function Viewer(el, index) {
    this.el = el;
    this.index = index;
    this.modelName = el.getAttribute("data-model");
    this.isHero = el.getAttribute("data-hero") === "1";
    this.accent = el.getAttribute("data-accent") || (this.isHero ? "#2bd9ff" : "#2bd9ff");
    this.hotspots = [];
    this.explodeParts = [];
    this.explodeTarget = 0;
    this.explodeValue = 0;
    this.tween = null;
    this.visible = false;
    this.frame = 0;
    this.labelsOn = window.innerWidth >= 780 && !this.isHero;
    this.hasShadows = !this.isHero || (window.innerWidth >= 900 && !/Mobi|Android/i.test(navigator.userAgent));
    this.autoRotateOn = false;
    this.disposed = false;
    this.el.style.setProperty("--mv-accent", this.accent);
    this.buildChrome();
    this.init();
  }

  Viewer.prototype.buildChrome = function () {
    const el = this.el;
    const title = el.getAttribute("data-label") || "";
    const sub = el.getAttribute("data-sub") || "";
    const hint = el.getAttribute("data-hint") || (window.innerWidth < 780
      ? "اسحب للدوران · قرّب بإصبعين · انقر على النقاط المضيئة"
      : "اسحب للدوران · عجلة الفأرة للتكبير · انقر على النقاط المضيئة");
    el.classList.add("mv");
    el.classList.toggle("mv-labels-on", this.labelsOn);
    el.innerHTML =
      '<div class="mv-stage"></div>' +
      '<div class="mv-labels" aria-live="polite"></div>' +
      '<div class="mv-top">' +
        '<div class="mv-title">' +
          '<span class="mv-live"><i></i>3D مباشر</span>' +
          (title ? '<strong>' + escapeHtml(title) + '</strong>' : "") +
          (sub ? '<span class="mv-sub">' + escapeHtml(sub) + '</span>' : "") +
        '</div>' +
      '</div>' +
      '<div class="mv-zones"></div>' +
      '<div class="mv-panel" hidden></div>' +
      '<div class="mv-toolbar" role="toolbar" aria-label="أدوات العرض"></div>' +
      '<div class="mv-hint">' + escapeHtml(hint) + '</div>' +
      '<div class="mv-loading"><span class="mv-spinner"></span><span>جارٍ تجهيز المجسّم…</span></div>';
    this.stageEl = el.querySelector(".mv-stage");
    this.labelsEl = el.querySelector(".mv-labels");
    this.panelEl = el.querySelector(".mv-panel");
    this.toolbarEl = el.querySelector(".mv-toolbar");
    this.zoneEl = el.querySelector(".mv-zones");
    this.loadingEl = el.querySelector(".mv-loading");
    this.hintEl = el.querySelector(".mv-hint");
  };

  Viewer.prototype.fail = function (msg) {
    QA.errors.push(this.modelName + ": " + msg);
    if (this.loadingEl) this.loadingEl.remove();
    const box = document.createElement("div");
    box.className = "mv-error";
    box.innerHTML = '<strong>تعذّر عرض المجسّم</strong><span>' + escapeHtml(msg) + '</span><span class="mv-error-sub">جرّب تحديث الصفحة أو افتحها في متصفح حديث يدعم WebGL.</span>';
    this.el.appendChild(box);
  };

  Viewer.prototype.init = function () {
    const self = this;
    if (!HWM.models[this.modelName]) { this.fail("المجسّم «" + this.modelName + "» غير مسجّل."); return; }
    try {
      this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      this.fail("WebGL غير متاح في هذا المتصفح.");
      return;
    }
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 780 ? 1.5 : 1.8));
    r.outputEncoding = T.sRGBEncoding;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = this.isHero ? 0.96 : 1.08;
    r.shadowMap.enabled = this.hasShadows;
    r.shadowMap.type = T.PCFSoftShadowMap;
    this.stageEl.appendChild(r.domElement);
    r.domElement.setAttribute("aria-label", "عرض ثلاثي الأبعاد تفاعلي — اسحب للدوران وانقر على القطع");
    r.domElement.setAttribute("role", "img");

    this.scene = new T.Scene();
    if (this.isHero) this.scene.fog = new T.FogExp2(0x05080d, 0.0125);
    this.camera = new T.PerspectiveCamera(this.isHero ? 38 : 34, 1, 0.05, 240);
    this.controls = new T.OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.rotateSpeed = 0.62;
    this.controls.zoomSpeed = 0.85;
    this.controls.panSpeed = 0.6;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.minPolarAngle = 0.12;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.45;
    this.controls.target.set(0, 1, 0);

    // بيئة انعكاسات إجرائية
    try {
      const pmrem = new T.PMREMGenerator(r);
      const envSrc = makeEnvTexture();
      this.envRT = pmrem.fromEquirectangular(envSrc);
      this.scene.environment = this.envRT.texture;
      envSrc.dispose();
      pmrem.dispose();
    } catch (e) { QA.errors.push("env: " + e.message); }

    // إضاءة
    const hemi = new T.HemisphereLight(0xbcd8ff, 0x070a0f, 0.62);
    this.scene.add(hemi);
    const key = new T.DirectionalLight(0xfff6ea, this.isHero ? 1.35 : 1.5);
    key.castShadow = this.hasShadows;
    key.shadow.mapSize.set(this.isHero ? 2048 : 2048, this.isHero ? 2048 : 2048);
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.025;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 80;
    this.keyLight = key;
    this.scene.add(key);
    this.scene.add(key.target);
    const fill = new T.DirectionalLight(0x86b7ff, 0.42);
    fill.position.set(-9, 6, 8);
    this.scene.add(fill);
    const rim = new T.DirectionalLight(0x74d9ff, 0.9);
    rim.position.set(-7, 5.5, -9);
    this.scene.add(rim);
    if (this.isHero) {
      const warm = new T.DirectionalLight(0xffc98a, 0.35);
      warm.position.set(9, 3, -6);
      this.scene.add(warm);
    }

    // بناء المجسّم
    const t0 = performance.now();
    let built;
    try {
      built = HWM.models[this.modelName]();
    } catch (e) {
      this.fail("خطأ في بناء المجسّم: " + (e && e.message ? e.message : e));
      return;
    }
    this.buildMs = Math.round(performance.now() - t0);
    this.root = built;
    this.scene.add(this.root);
    this.root.updateMatrixWorld(true);

    if (this.isHero) this.optimizeHero();

    // الظلال
    this.root.traverse(function (o) {
      if (o.isMesh) {
        if (o.material && o.material.transparent && o.material.opacity < 0.4) { o.castShadow = false; return; }
        o.receiveShadow = true;
      }
    });
    if (this.isHero && this.hasShadows) {
      this.root.traverse(function (o) {
        if (o.isMesh) {
          if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
          const rad = o.geometry.boundingSphere ? o.geometry.boundingSphere.radius : 1;
          const s = Math.max(o.scale.x, o.scale.y, o.scale.z);
          if (rad * s < 0.45) o.castShadow = false;
        }
      });
    }

    // المربع الكلي
    this.wholeBox = this.computeBox(this.root);
    if (this.wholeBox.isEmpty()) this.wholeBox.set(new T.Vector3(-1, 0, -1), new T.Vector3(1, 2, 1));
    const sphere = this.wholeBox.getBoundingSphere(new T.Sphere());
    this.sceneRadius = Math.max(0.8, sphere.radius);
    this.controls.minDistance = this.sceneRadius * 0.35;
    this.controls.maxDistance = this.sceneRadius * 7 + 12;
    this.controls.target.copy(sphere.center);
    // ظلال الإضاءة
    this.keyLight.target.position.copy(sphere.center);
    const sc = this.keyLight.shadow.camera;
    const ext = Math.max(2.2, this.sceneRadius * 1.05);
    sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext;
    sc.updateProjectionMatrix();
    this.keyLight.position.copy(sphere.center).add(new T.Vector3(ext * 0.72, ext * 1.15, ext * 0.85));

    // ظل ناعم تحت الأجزاء غير القائمة على منصة
    if (!this.isHero) {
      const yMin = this.wholeBox.min.y;
      const size = Math.max(this.wholeBox.getSize(new T.Vector3()).x, this.wholeBox.getSize(new T.Vector3()).z) * 1.35;
      const shadow = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({
        map: softShadowTexture(), transparent: true, depthWrite: false, opacity: 0.9
      }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(sphere.center.x, yMin - 0.012, sphere.center.z);
      shadow.renderOrder = -1;
      this.scene.add(shadow);
      this.softShadow = shadow;
    }

    // بيانات التفكيك
    const parts = (this.root.userData.explodeParts || []).slice();
    this.explodeParts = parts.map(function (p) {
      return { obj: p.obj, dir: p.dir.clone(), base: p.obj.position.clone() };
    });
    this.glass = this.root.userData.glass || null;

    // مجسات
    this.collectHotspots();
    // التمركز
    this.fitAll(false);
    this.buildToolbar();
    this.buildZones();
    this.bindEvents();
    this.loadingEl.classList.add("is-done");
    setTimeout(function () { if (self.loadingEl) self.loadingEl.remove(); }, 450);
    this.clock = new T.Clock();
    this.fpsT = 0; this.fpsN = 0; this.fps = 0;
    this.resize();
    this.setupQA();
    this.animate();
    this.hintTimeout = setTimeout(function () { self.hintEl.classList.add("is-hidden"); }, 7000);
  };

  Viewer.prototype.optimizeHero = function () {
    // تقليل الأشياء الدقيقة جداً في مشهد المعرض البعيد (أسنان، براغي، نصوص صغيرة)
    const toRemove = [];
    this.root.traverse(function (o) {
      if (!o.isMesh) return;
      const ud = o.userData || {};
      if (ud.hotspot) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      const bs = o.geometry.boundingSphere;
      if (!bs) return;
      const s = Math.max(Math.abs(o.scale.x), Math.abs(o.scale.y), Math.abs(o.scale.z));
      if (bs.radius * s < 0.032) toRemove.push(o);
    });
    toRemove.forEach(function (o) {
      if (o.parent) o.parent.remove(o);
    });
  };

  Viewer.prototype.hasVisibleAncestor = function (obj) {
    let p = obj;
    while (p) {
      if (p.visible === false) return false;
      p = p.parent;
    }
    return true;
  };

  Viewer.prototype.computeBox = function (obj) {
    const box = new T.Box3();
    const tmp = new T.Box3();
    obj.updateMatrixWorld(true);
    obj.traverse(function (o) {
      const ud = o.userData || {};
      let p = o, hidden = false;
      while (p) {
        if (p.userData && p.userData.noFit) { hidden = true; break; }
        if (p === obj) break;
        p = p.parent;
      }
      if (hidden) return;
      if (o.isMesh) {
        if (!o.geometry) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        tmp.copy(o.geometry.boundingBox);
        tmp.applyMatrix4(o.matrixWorld);
        box.union(tmp);
      } else if (o.isSprite) {
        const p = new T.Vector3().setFromMatrixPosition(o.matrixWorld);
        box.expandByPoint(p);
      }
    });
    return box;
  };

  Viewer.prototype.fitMetrics = function (box, dir, fillOverride) {
    const boxCenter = box.getCenter(new T.Vector3());
    const size = box.getSize(new T.Vector3());
    const right = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), dir);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new T.Vector3().crossVectors(dir, right).normalize();
    const vFov = this.camera.fov * Math.PI / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const tanH = Math.tan(hFov / 2), tanV = Math.tan(vFov / 2);
    const corners = [];
    for (let i = 0; i < 8; i++) {
      const v = new T.Vector3(
        (i & 1) ? box.max.x : box.min.x,
        (i & 2) ? box.max.y : box.min.y,
        (i & 4) ? box.max.z : box.min.z
      ).sub(boxCenter);
      corners.push({ f: v.dot(dir), r: v.dot(right), u: v.dot(up) });
    }
    // إعادة مركزة الإسقاط رأسياً وأفقياً ثم ملاءمة دقيقة مع هامش للواجهة
    const fill = fillOverride || 0.84, biasY = 0.07;
    let a = 0, b = 0, dist = 8;
    for (let it = 0; it < 5; it++) {
      let minX = 9, maxX = -9, minY = 9, maxY = -9, fAvg = 0;
      corners.forEach(function (c) {
        const z = Math.max(0.4, dist - c.f);
        const x = (c.r - a) / (z * tanH);
        const y = (c.u - b) / (z * tanV);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        fAvg += c.f / 8;
      });
      const depth = Math.max(0.8, dist - fAvg);
      a += ((minX + maxX) / 2) * tanH * depth;
      b += (((minY + maxY) / 2) - biasY) * tanV * depth;
      let nd = 0.7;
      corners.forEach(function (c) {
        nd = Math.max(nd, c.f + Math.abs(c.r - a) / (fill * tanH), c.f + Math.abs(c.u - b) / (fill * tanV));
      });
      dist = nd;
    }
    const target = boxCenter.clone().addScaledVector(right, a).addScaledVector(up, b);
    return { center: target, size: size, dir: dir, distance: Math.max(0.7, dist), boxCenter: boxCenter };
  };

  Viewer.prototype.defaultDir = function () {
    if (this.isHero && this.camera && this.camera.aspect < 0.9) {
      return new T.Vector3(0.5, 0.5, 0.72).normalize();
    }
    return new T.Vector3(0.56, this.isHero ? 0.3 : 0.24, 0.76).normalize();
  };

  Viewer.prototype.composeShift = function (pos, target) {
    const shift = parseFloat(this.el.getAttribute("data-shift") || "0");
    if (!shift || window.innerWidth < 1020 || !this.camera) return;
    const dir = target.clone().sub(pos).normalize();
    const right = new T.Vector3().crossVectors(dir, this.camera.up).normalize();
    const dist = pos.distanceTo(target);
    const halfW = dist * Math.tan((this.camera.fov * Math.PI / 180) / 2) * this.camera.aspect;
    const off = right.multiplyScalar(shift * 2 * halfW);
    pos.add(off);
    target.add(off);
  };

  Viewer.prototype.fitAll = function (animate) {
    const dir = this.defaultDir();
    const portrait = this.isHero && this.camera.aspect < 0.9;
    const m = this.fitMetrics(this.wholeBox, dir, portrait ? 1.1 : null);
    const pos = m.center.clone().addScaledVector(dir, m.distance);
    if (pos.y < m.center.y + 0.15) pos.y = m.center.y + 0.15;
    this.composeShift(pos, m.center);
    this.initial = { pos: pos.clone(), target: m.center.clone() };
    if (animate) this.animateCamera(pos, m.center, 800);
    else {
      this.camera.position.copy(pos);
      this.controls.target.copy(m.center);
      this.controls.update();
    }
    this.setZoneActive(0);
  };

  Viewer.prototype.focusObject = function (obj, label, zoneIndex) {
    if (!obj) { this.fitAll(true); return; }
    const box = this.computeBox(obj);
    if (box.isEmpty()) return;
    const dir = new T.Vector3().subVectors(this.camera.position, this.controls.target);
    if (dir.lengthSq() < 1e-6) dir.copy(this.defaultDir());
    dir.normalize();
    if (dir.y < 0.06) dir.y = 0.06;
    dir.normalize();
    const m = this.fitMetrics(box, dir);
    const pos = m.center.clone().addScaledVector(dir, m.distance);
    if (pos.y < 0.9) pos.y = 0.9;
    this.animateCamera(pos, m.center, 900);
    if (zoneIndex != null) this.setZoneActive(zoneIndex);
    this.closePanel();
  };

  Viewer.prototype.animateCamera = function (toPos, toTarget, dur) {
    const fromPos = this.camera.position.clone();
    const fromTarget = this.controls.target.clone();
    if (fromPos.distanceTo(toPos) < 0.03 && fromTarget.distanceTo(toTarget) < 0.03) return;
    this.tween = {
      t0: performance.now(), dur: dur || 850,
      fromPos: fromPos, toPos: toPos.clone(),
      fromTarget: fromTarget, toTarget: toTarget.clone()
    };
    this.hideHint();
  };

  Viewer.prototype.updateTween = function (now) {
    if (!this.tween) return;
    const tw = this.tween;
    let k = (now - tw.t0) / tw.dur;
    if (k >= 1) k = 1;
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    this.camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
    this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
    if (k === 1) this.tween = null;
  };

  Viewer.prototype.buildToolbar = function () {
    const self = this;
    const btns = [];
    btns.push('<button type="button" class="mv-btn" data-action="reset" title="إعادة ضبط العرض">' + SVG.reset + '<span>إعادة الضبط</span></button>');
    btns.push('<button type="button" class="mv-btn" data-action="zoomout" title="تصغير">' + SVG.minus + '<span>تصغير</span></button>');
    btns.push('<button type="button" class="mv-btn" data-action="zoomin" title="تكبير">' + SVG.plus + '<span>تكبير</span></button>');
    if (this.explodeParts.length) {
      btns.push('<button type="button" class="mv-btn" data-action="explode" aria-pressed="false" title="تفكيك القطع">' + SVG.explode + '<span>تفكيك</span></button>');
    }
    if (this.glass) {
      btns.push('<button type="button" class="mv-btn" data-action="glass" aria-pressed="false" title="إظهار/إخفاء اللوحة الزجاجية">' + SVG.glass + '<span>الزجاج</span></button>');
    }
    btns.push('<button type="button" class="mv-btn' + (this.labelsOn ? " is-on" : "") + '" data-action="labels" aria-pressed="' + (this.labelsOn ? "true" : "false") + '" title="إظهار/إخفاء التسميات">' + SVG.labels + '<span>التسميات</span></button>');
    btns.push('<button type="button" class="mv-btn" data-action="rotate" aria-pressed="false" title="دوران تلقائي">' + SVG.rotate + '<span>دوران</span></button>');
    btns.push('<button type="button" class="mv-btn mv-btn-full" data-action="fullscreen" title="شاشة كاملة">' + SVG.full + '<span>شاشة كاملة</span></button>');
    this.toolbarEl.innerHTML = btns.join("");
    this.toolbarEl.addEventListener("click", function (e) {
      const b = e.target.closest("[data-action]");
      if (!b) return;
      const action = b.getAttribute("data-action");
      if (action === "reset") self.reset();
      else if (action === "explode") self.toggleExplode(b);
      else if (action === "glass") self.toggleGlass(b);
      else if (action === "labels") self.toggleLabels(b);
      else if (action === "rotate") self.toggleRotate(b);
      else if (action === "zoomin") self.zoom(0.8);
      else if (action === "zoomout") self.zoom(1.25);
      else if (action === "fullscreen") self.fullscreen();
      self.hideHint();
    });
  };

  Viewer.prototype.buildZones = function () {
    const zones = this.root.userData.zones;
    if (!zones || !zones.length) { this.zoneEl.style.display = "none"; return; }
    const self = this;
    this.zoneEl.style.display = "";
    this.zoneEl.innerHTML = zones.map(function (z, i) {
      return '<button type="button" class="mv-zone' + (i === 0 ? " is-active" : "") + '" data-zone="' + i + '" style="--z:' + (z.color || "#2bd9ff") + '">' +
        '<i></i>' + escapeHtml(z.label) + '</button>';
    }).join("");
    this.zoneEl.addEventListener("click", function (e) {
      const b = e.target.closest("[data-zone]");
      if (!b) return;
      const i = parseInt(b.getAttribute("data-zone"), 10);
      const z = zones[i];
      if (!z) return;
      if (z.all) self.focusObject(null, null, i);
      else self.focusObject(z.obj, z.label, i);
      self.hideHint();
    });
    this.zones = zones;
  };

  Viewer.prototype.setZoneActive = function (i) {
    if (!this.zoneEl) return;
    this.zoneEl.querySelectorAll(".mv-zone").forEach(function (b, j) {
      b.classList.toggle("is-active", j === i);
    });
  };

  Viewer.prototype.zoom = function (factor) {
    const off = new T.Vector3().subVectors(this.camera.position, this.controls.target);
    const len = off.length();
    const next = Math.min(this.controls.maxDistance, Math.max(this.controls.minDistance, len * factor));
    off.setLength(next);
    this.camera.position.copy(this.controls.target).add(off);
    this.controls.update();
  };

  Viewer.prototype.reset = function () {
    if (this.glass && this.glass.visible) {
      this.glass.visible = false;
      const b = this.toolbarEl.querySelector('[data-action="glass"]');
      if (b) { b.setAttribute("aria-pressed", "false"); b.classList.remove("is-on"); }
    }
    this.explodeTarget = 0;
    const be = this.toolbarEl.querySelector('[data-action="explode"]');
    if (be) { be.setAttribute("aria-pressed", "false"); be.classList.remove("is-on"); }
    this.controls.autoRotate = false;
    this.autoRotateOn = false;
    const br = this.toolbarEl.querySelector('[data-action="rotate"]');
    if (br) { br.setAttribute("aria-pressed", "false"); br.classList.remove("is-on"); }
    this.closePanel();
    this.fitAll(true);
  };

  Viewer.prototype.toggleExplode = function (btn) {
    this.explodeTarget = this.explodeTarget > 0.5 ? 0 : 1;
    btn.classList.toggle("is-on", this.explodeTarget > 0.5);
    btn.setAttribute("aria-pressed", this.explodeTarget > 0.5 ? "true" : "false");
    this.closePanel();
  };

  Viewer.prototype.toggleGlass = function (btn) {
    if (!this.glass) return;
    this.glass.visible = !this.glass.visible;
    btn.classList.toggle("is-on", this.glass.visible);
    btn.setAttribute("aria-pressed", this.glass.visible ? "true" : "false");
  };

  Viewer.prototype.toggleLabels = function (btn) {
    this.labelsOn = !this.labelsOn;
    this.el.classList.toggle("mv-labels-on", this.labelsOn);
    btn.classList.toggle("is-on", this.labelsOn);
    btn.setAttribute("aria-pressed", this.labelsOn ? "true" : "false");
    this.collideTick = 0;
  };

  Viewer.prototype.toggleRotate = function (btn) {
    this.autoRotateOn = !this.autoRotateOn;
    this.controls.autoRotate = this.autoRotateOn;
    btn.classList.toggle("is-on", this.autoRotateOn);
    btn.setAttribute("aria-pressed", this.autoRotateOn ? "true" : "false");
    if (this.autoRotateOn) this.hideHint();
  };

  Viewer.prototype.fullscreen = function () {
    const el = this.el;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  };

  Viewer.prototype.collectHotspots = function () {
    const self = this;
    const found = [];
    this.root.traverse(function (obj) {
      if (!obj.userData || !obj.userData.hotspot) return;
      const h = obj.userData.hotspot;
      const box = new T.Box3().setFromObject(obj);
      const world = box.isEmpty() ? obj.getWorldPosition(new T.Vector3()) : box.getCenter(new T.Vector3());
      const objPos = obj.getWorldPosition(new T.Vector3());
      const anchorLocal = world.clone().sub(objPos);
      found.push({ obj: obj, data: h, anchorLocal: anchorLocal });
    });
    this.labelsEl.innerHTML = "";
    const accent = this.accent;
    this.markerEls = found.map(function (h, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mv-hotspot";
      b.style.setProperty("--c", h.data.color || accent);
      b.innerHTML = '<span class="dot"></span><span class="chip">' + escapeHtml(h.data.label || "قطعة") + '</span>';
      b.setAttribute("aria-label", (h.data.label || "قطعة") + " — اعرض التفاصيل");
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        self.selectHotspot(i);
      });
      self.labelsEl.appendChild(b);
      return b;
    });
    this.hotspots = found;
    this.selectedIndex = -1;
    this.collideTick = 0;
  };

  Viewer.prototype.selectHotspot = function (i) {
    const h = this.hotspots[i];
    if (!h) return;
    this.selectedIndex = i;
    if (this.helper) {
      this.scene.remove(this.helper);
      if (this.helper.geometry) this.helper.geometry.dispose();
      this.helper.material.dispose();
      this.helper = null;
    }
    try {
      this.helper = new T.BoxHelper(h.obj, 0x59e6ff);
      this.helper.material.depthTest = false;
      this.helper.material.transparent = true;
      this.helper.material.opacity = 0.9;
      this.helper.renderOrder = 12;
      this.scene.add(this.helper);
    } catch (e) {}
    const link = h.data.href
      ? '<a class="mv-panel-link" href="' + escapeHtml(h.data.href) + '">افتح الشرح الكامل <span aria-hidden="true">←</span></a>'
      : "";
    this.panelEl.innerHTML =
      '<div class="mv-panel-in">' +
        '<button type="button" class="mv-panel-close" aria-label="إغلاق">×</button>' +
        '<span class="mv-kicker"><i></i>جزء من المجسّم</span>' +
        '<h3>' + escapeHtml(h.data.label || "") + '</h3>' +
        '<p>' + escapeHtml(h.data.desc || "") + '</p>' +
        link +
      '</div>';
    this.panelEl.hidden = false;
    this.panelEl.classList.add("is-open");
    const close = this.panelEl.querySelector(".mv-panel-close");
    close.addEventListener("click", this.closePanel.bind(this));
    this.markerEls.forEach(function (m, j) { m.classList.toggle("is-selected", j === i); });
    this.hideHint();
  };

  Viewer.prototype.closePanel = function () {
    this.panelEl.hidden = true;
    this.panelEl.classList.remove("is-open");
    this.panelEl.innerHTML = "";
    this.selectedIndex = -1;
    if (this.helper) {
      this.scene.remove(this.helper);
      if (this.helper.geometry) this.helper.geometry.dispose();
      this.helper.material.dispose();
      this.helper = null;
    }
    if (this.markerEls) this.markerEls.forEach(function (m) { m.classList.remove("is-selected"); });
  };

  Viewer.prototype.hideHint = function () {
    if (this.hintEl) this.hintEl.classList.add("is-hidden");
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
  };

  Viewer.prototype.bindEvents = function () {
    const self = this;
    const canvas = this.renderer.domElement;
    let downX = 0, downY = 0, downT = 0;
    canvas.addEventListener("pointerdown", function (e) {
      downX = e.clientX; downY = e.clientY; downT = performance.now();
      self.tween = null;
      if (self.controls.autoRotate) {
        self.controls.autoRotate = false;
        self.autoRotateOn = false;
        const btn = self.toolbarEl.querySelector('[data-action="rotate"]');
        if (btn) { btn.classList.remove("is-on"); btn.setAttribute("aria-pressed", "false"); }
      }
      self.hideHint();
    });
    canvas.addEventListener("pointerup", function (e) {
      if (Math.abs(e.clientX - downX) > 6 || Math.abs(e.clientY - downY) > 6) return;
      if (performance.now() - downT > 650) return;
      self.pick(e);
    });
    this.controls.addEventListener("start", function () { self.tween = null; });
    this._onResize = function () { self.resize(); };
    window.addEventListener("resize", this._onResize);
    this._onFs = function () { setTimeout(function () { self.resize(); }, 80); };
    document.addEventListener("fullscreenchange", this._onFs);
    if ("IntersectionObserver" in window) {
      this.io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { self.visible = en.isIntersecting; });
      }, { threshold: 0.02 });
      this.io.observe(this.el);
    } else this.visible = true;
    this._onDpr = function () { self.resize(); };
  };

  Viewer.prototype.pick = function (event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new T.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const ray = new T.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.root.children, true);
    for (let i = 0; i < hits.length; i++) {
      let p = hits[i].object;
      while (p && p !== this.root) {
        if (p.userData && p.userData.hotspot) {
          const idx = this.hotspots.findIndex(function (h) { return h.obj === p; });
          if (idx >= 0) { this.selectHotspot(idx); return; }
        }
        p = p.parent;
      }
    }
    this.closePanel();
  };

  Viewer.prototype.updateMarkers = function () {
    if (!this.hotspots.length) return;
    const w = this.el.clientWidth, h = this.el.clientHeight;
    const self = this;
    this.collideTick = (this.collideTick || 0) + 1;
    if (!this.xyCache) this.xyCache = [];
    this.hotspots.forEach(function (hsp, i) {
      const marker = self.markerEls[i];
      if (!marker) return;
      const visible = self.hasVisibleAncestor(hsp.obj);
      if (!visible) { marker.classList.add("is-hidden"); self.xyCache[i] = null; return; }
      const world = hsp.anchorLocal.clone().applyMatrix4(hsp.obj.matrixWorld);
      const v = world.clone().project(self.camera);
      if (v.z < -1 || v.z > 1) { marker.classList.add("is-hidden"); self.xyCache[i] = null; return; }
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) { marker.classList.add("is-hidden"); self.xyCache[i] = null; return; }
      marker.classList.remove("is-hidden");
      marker.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      const flip = x > w - 190;
      marker.classList.toggle("flip", flip);
      marker.classList.toggle("is-front", i === self.selectedIndex);
      self.xyCache[i] = { x: x, y: y, flip: flip };
    });
    // منع تراكم النصوص المتقاطعة (تبقى النقاط قابلة للنقر)
    if (!this.labelsOn) {
      this.markerEls.forEach(function (m) { m.classList.remove("is-overlap"); });
      return;
    }
    if (this.collideTick % 6 !== 0 && this.selectedIndex < 0) return;
    if (!this.chipW) this.chipW = [];
    const list = [];
    this.markerEls.forEach(function (m, i) {
      const xy = self.xyCache[i];
      if (!xy || m.classList.contains("is-hidden")) { m.classList.remove("is-overlap"); return; }
      let cw = self.chipW[i];
      if (!cw) {
        const chip = m.querySelector(".chip");
        cw = self.chipW[i] = chip ? (chip.offsetWidth || 140) : 140;
      }
      const ch = 25;
      const left = xy.flip ? xy.x - 16 - cw : xy.x + 16;
      const top = xy.y - ch / 2;
      list.push({
        m: m, sel: i === self.selectedIndex, cw: cw,
        rect: { l: left, t: top, r: left + cw, b: top + ch }
      });
    });
    list.sort(function (a, b) {
      if (a.sel) return -1;
      if (b.sel) return 1;
      return 0;
    });
    const used = [];
    list.forEach(function (it) {
      if (it.sel) { it.m.classList.remove("is-overlap"); used.push(it.rect); return; }
      let hit = false;
      for (let k = 0; k < used.length; k++) {
        const r = used[k];
        if (it.rect.l < r.r + 4 && it.rect.r > r.l - 4 && it.rect.t < r.b + 2 && it.rect.b > r.t - 2) { hit = true; break; }
      }
      it.m.classList.toggle("is-overlap", hit);
      if (!hit) used.push(it.rect);
    });
  };

  Viewer.prototype.resize = function () {
    if (!this.renderer) return;
    const w = Math.max(1, this.el.clientWidth), h = Math.max(1, this.el.clientHeight);
    if (w === this._w && h === this._h) return;
    this._w = w; this._h = h;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 780 ? 1.5 : 1.8));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this._fittedOnce && this.root) {
      this.fitAll(false);
      this._fittedOnce = true;
    } else if (this.root && !this.userMoved) {
      // أعد الملاءمة عند تغيّر المقاس قبل تفاعل المستخدم
      // (لا نعيدها هنا كي لا تقفز أثناء السحب)
    }
    this.controls.update();
  };

  Viewer.prototype.animate = function () {
    if (this.disposed) return;
    requestAnimationFrame(this.animate.bind(this));
    if (!this.visible || document.hidden) { this.clock.getDelta(); return; }
    const now = performance.now();
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;
    this.frame++;
    // حركات المجسّم (مراوح، LEDs)
    if (this.root.userData.ticks) {
      for (let i = 0; i < this.root.userData.ticks.length; i++) {
        const o = this.root.userData.ticks[i];
        if (o.userData && o.userData.tick) o.userData.tick(t, dt);
      }
    }
    // تفكيك
    if (Math.abs(this.explodeValue - this.explodeTarget) > 0.001) {
      const k = Math.min(1, dt * 4.2);
      this.explodeValue += (this.explodeTarget - this.explodeValue) * k;
      if (Math.abs(this.explodeValue - this.explodeTarget) < 0.002) this.explodeValue = this.explodeTarget;
      for (let i = 0; i < this.explodeParts.length; i++) {
        const p = this.explodeParts[i];
        p.obj.position.copy(p.base).addScaledVector(p.dir, this.explodeValue);
      }
    }
    this.updateTween(now);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateMarkers();
    if (this.helper) this.helper.update();
    // قياس FPS
    this.fpsN = (this.fpsN || 0) + 1; this.fpsT = (this.fpsT || 0) + dt;
    if (this.fpsT > 1) { this.fps = Math.round(this.fpsN / this.fpsT); this.fpsN = 0; this.fpsT = 0; }
    if (!this._ready) {
      this._ready = true;
      QA.readyCount++;
      QA.viewers[this.qaKey] && (QA.viewers[this.qaKey].ready = true);
    }
  };

  Viewer.prototype.setupQA = function () {
    const self = this;
    const key = this.modelName + (QA.viewers[this.modelName] ? "_" + this.index : "");
    this.qaKey = key;
    function findObj(name) {
      if (!name) return self.root;
      const refs = self.root.userData.refs;
      if (refs) {
        if (refs[name]) return Array.isArray(refs[name]) ? refs[name][0] : refs[name];
        for (let k in refs) {
          const v = refs[k];
          if (k === name) return Array.isArray(v) ? v[0] : v;
          if (v && v.isObject3D && v.name === name) return v;
          if (Array.isArray(v)) {
            for (let j = 0; j < v.length; j++) if (v[j] && v[j].name === name) return v[j];
          }
        }
      }
      let found = null;
      self.root.traverse(function (o) { if (!found && o.name === name) found = o; });
      return found;
    }
    const api = {};
    api.ready = !!this._ready;
    api.info = function () {
      let meshes = 0, tris = 0;
      self.root.traverse(function (o) {
        if (o.isMesh && o.geometry) {
          meshes++;
          const geo = o.geometry;
          if (geo.index) tris += geo.index.count / 3;
          else if (geo.attributes.position) tris += geo.attributes.position.count / 3;
        }
      });
      const info = self.renderer.info;
      const box = self.wholeBox;
      return {
        model: self.modelName, buildMs: self.buildMs, meshes: meshes, triangles: Math.round(tris),
        drawCalls: info.render.calls, hotspots: self.hotspots.length, explodeParts: self.explodeParts.length,
        hasGlass: !!self.glass, labelsOn: self.labelsOn, fps: self.fps,
        box: box ? { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new T.Vector3()).toArray(), center: box.getCenter(new T.Vector3()).toArray() } : null,
        camera: { pos: self.camera.position.toArray(), target: self.controls.target.toArray(), fov: self.camera.fov, aspect: self.camera.aspect },
        qaErrors: QA.errors.slice(0, 12)
      };
    };
    api.refs = function () {
      const r = self.root.userData.refs || {};
      return Object.keys(r);
    };
    api.boxOf = function (name) {
      const o = findObj(name);
      if (!o) return null;
      const b = self.computeBox(o);
      return { size: b.getSize(new T.Vector3()).toArray(), center: b.getCenter(new T.Vector3()).toArray(), min: b.min.toArray(), max: b.max.toArray() };
    };
    api.project = function (name) {
      const o = findObj(name);
      if (!o) return null;
      const b = self.computeBox(o);
      if (b.isEmpty()) return null;
      const c = b.getCenter(new T.Vector3());
      const v = c.clone().project(self.camera);
      const rect = self.renderer.domElement.getBoundingClientRect();
      return { x: Math.round((v.x * 0.5 + 0.5) * rect.width), y: Math.round((-v.y * 0.5 + 0.5) * rect.height), ndc: v.toArray(), box: { min: b.min.toArray(), max: b.max.toArray() } };
    };
    api.bounds = function (name) {
      const o = name ? findObj(name) : null;
      const b = o ? self.computeBox(o) : self.wholeBox;
      if (!b || b.isEmpty()) return null;
      const rect = self.renderer.domElement.getBoundingClientRect();
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (let i = 0; i < 8; i++) {
        const v = new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(self.camera);
        const x = (v.x * 0.5 + 0.5) * rect.width, y = (-v.y * 0.5 + 0.5) * rect.height;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      return { rect: { w: rect.width, h: rect.height }, screen: { minX: Math.round(minX), minY: Math.round(minY), maxX: Math.round(maxX), maxY: Math.round(maxY), w: Math.round(maxX - minX), h: Math.round(maxY - minY) }, cameraDist: Math.round(self.camera.position.distanceTo(self.controls.target) * 100) / 100 };
    };
    api.hotspotList = function () {
      return self.hotspots.map(function (h, i) {
        const w = h.anchorLocal.clone().applyMatrix4(h.obj.matrixWorld);
        const v = w.clone().project(self.camera);
        return {
          label: h.data.label, href: h.data.href || null,
          x: Math.round((v.x * 0.5 + 0.5) * self.el.clientWidth),
          y: Math.round((-v.y * 0.5 + 0.5) * self.el.clientHeight),
          onScreen: v.z > -1 && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1,
          markerHidden: self.markerEls[i] ? self.markerEls[i].classList.contains("is-hidden") : true
        };
      });
    };
    api.select = function (label) {
      const i = self.hotspots.findIndex(function (h) { return h.data.label === label; });
      if (i >= 0) self.selectHotspot(i);
      return i;
    };
    api.focus = function (name) {
      const o = findObj(name);
      if (o) self.focusObject(o, name, null);
      return !!o;
    };
    api.explode = function (on) {
      self.explodeTarget = on ? 1 : 0;
    };
    api.setCamera = function (pos, target) {
      self.tween = null;
      self.camera.position.fromArray(pos);
      self.controls.target.fromArray(target);
      self.controls.update();
    };
    api.glass = function (on) {
      if (!self.glass) return false;
      self.glass.visible = !!on;
      return true;
    };
    api.stageRect = function () {
      const r = self.renderer.domElement.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    api.canvas = function () { return self.renderer.domElement; };
    api.__viewer = self;
    api.colors = function () {
      const gl = self.renderer.getContext();
      return { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) };
    };
    this.qa = api;
    QA.viewers[key] = api;
  };

  Viewer.prototype.dispose = function () {
    this.disposed = true;
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("fullscreenchange", this._onFs);
  };

  function boot() {
    const nodes = Array.prototype.slice.call(document.querySelectorAll(".model-viewer"));
    nodes.forEach(function (el, i) {
      // تأخير البناء قليلاً كي تُرسم الصفحة أولاً
      setTimeout(function () {
        try { new Viewer(el, i); } catch (e) {
          QA.errors.push("viewer: " + (e && e.message ? e.message : e));
          const box = document.createElement("div");
          box.className = "mv-error";
          box.innerHTML = '<strong>تعذّر تشغيل العارض</strong><span>' + escapeHtml(e && e.message ? e.message : e) + '</span>';
          el.appendChild(box);
          const ld = el.querySelector(".mv-loading"); if (ld) ld.remove();
        }
      }, 40 + i * 30);
    });
    QA.viewerCount = nodes.length;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
