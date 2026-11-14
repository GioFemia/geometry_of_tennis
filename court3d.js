/* ==========================================================================
   Geometry of Tennis — Vista 3D
   Porting della vista 3D schematica di got_atp/campo.html: camera fissa dietro
   la baseline del campo "Tu", proiezione prospettica metri -> canvas, rete ITF,
   giocatori a capsula. Canvas 2D, nessuna libreria.

   L'SVG 2D resta l'unica fonte di verità: questo modulo lo legge (linee,
   poligoni, cerchi, testi, disegni) e lo ridisegna in prospettiva su un canvas
   sovrapposto. Il trascinamento in 3D riusa gli handler di app.js tramite
   window.__gotDragBridge__ e toSvgPoint (che delega a clientToSvg).

   Mondo (come Hawk-Eye in got_atp): X lunghezza (rete 0, negativo = campo Tu,
   in basso nel 2D), Y larghezza (positivo = sinistra del 2D), Z quota.
   ========================================================================== */
(function () {
    'use strict';

    const primarySvg = document.getElementById('tennisCourt');
    if (!primarySvg) return;

    // ---- Geometria SVG (vedi app.js: COURT_X_MIN/MAX, COURT_Y_MIN/MAX, NET_Y) ----
    const NET_Y_SVG = 486;
    const ORIGIN_X_SVG = 300;
    const SCALE_LEN = 672 / 23.77;   // unità SVG per metro (lunghezza)
    const SCALE_WID = 308 / 10.97;   // unità SVG per metro (larghezza)
    const SCALE_AVG = (SCALE_LEN + SCALE_WID) / 2;

    // ---- Misure ITF (metri) ----
    const HALF_LEN_M = 11.885;
    const HALF_SINGLES_M = 4.115;
    const HALF_DOUBLES_M = 5.485;
    const SERVICE_FROM_NET_M = 6.40;
    const NET_POST_Y_M = HALF_DOUBLES_M + 0.914;
    const NET_POST_H_M = 1.07;
    const NET_CENTER_H_M = 0.914;
    const PLAYER_H_M = 1.8;
    const PLAYER_R_M = 0.24;
    const LINE_W_M = 0.1;

    // ---- Camera ----
    const CAM_BACK_M = 8;
    const CAM_LOOK_X_M = 1.5;
    const CAM_H_MIN = 3;
    const CAM_H_MAX = 20;
    const CAM_H_DEFAULT = 15;

    // ---- Colpo stilizzato ----
    const SHOT_HIT_H_M = 1.0;
    const SERVE_HIT_H_M = 2.7;
    const SHOT_END_H_M = 0.9;
    const NET_CLEARANCE_M = 0.5;
    const VOLLEY_H_M = 1.1;              // quota d'impatto della volée
    const BOUNCE_MARGIN_M = 0.15;        // il rimbalzo resta dentro le righe
    const BOUNCE_MIN_FROM_NET_M = 1.0;   // e non a ridosso della rete

    const STORAGE_KEY = 'got_vista_campo';
    const STORAGE_CAM_KEY = 'got_vista_camera_h';

    function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ok */ } }

    function svgToWorld(x, y) {
        return { x: (NET_Y_SVG - y) / SCALE_LEN, y: (ORIGIN_X_SVG - x) / SCALE_WID };
    }
    function worldToSvg(X, Y) {
        return { x: ORIGIN_X_SVG - Y * SCALE_WID, y: NET_Y_SVG - X * SCALE_LEN };
    }
    function netHeightAtY(yM) {
        const t = Math.min(1, Math.abs(yM) / NET_POST_Y_M);
        return NET_CENTER_H_M + (NET_POST_H_M - NET_CENTER_H_M) * t * t;
    }

    function vecSub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
    function vecCross(a, b) {
        return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
    }
    function vecNorm(a) {
        const l = Math.hypot(a.x, a.y, a.z) || 1;
        return { x: a.x / l, y: a.y / l, z: a.z / l };
    }

    function distToSegment(px, py, ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy;
        let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        return { d: Math.hypot(px - (ax + t * dx), py - (ay + t * dy)), t };
    }

    // Colore CSS -> rgba con alfa moltiplicato
    const colorCtx = document.createElement('canvas').getContext('2d');
    function withAlpha(color, alpha) {
        if (!color || color === 'none') return null;
        if (alpha >= 0.999) return color;
        colorCtx.fillStyle = '#000';
        colorCtx.fillStyle = color;
        const c = colorCtx.fillStyle; // #rrggbb o rgba(...)
        if (c[0] === '#') {
            const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return c;
        const p = m[1].split(',').map(s => parseFloat(s));
        const a = (p.length > 3 ? p[3] : 1) * alpha;
        return `rgba(${p[0]},${p[1]},${p[2]},${a})`;
    }

    const state = {
        vista: '2d',
        camHeight: CAM_H_DEFAULT,
        views: []
    };

    // ======================================================================
    // Vista: un canvas per SVG (campo primario e, in 2 colpi, secondario)
    // ======================================================================
    function createView(svg, wrap, interactive) {
        const layer = document.createElement('div');
        layer.className = 'court3d-layer';
        const canvas = document.createElement('canvas');
        canvas.className = 'court3d-canvas';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Campo da tennis, vista 3D');
        layer.appendChild(canvas);
        wrap.appendChild(layer);
        const ctx = canvas.getContext('2d');

        const view = {
            svg, wrap, layer, canvas, ctx, interactive,
            dpr: 1,
            cam: { pos: { x: 0, y: 0, z: 0 }, fwd: null, right: null, up: null },
            fit: { scale: 1, ox: 0, oy: 0 },
            pickables: [],
            dirty: true
        };

        function setupCamera() {
            const pos = { x: -(HALF_LEN_M + CAM_BACK_M), y: 0, z: state.camHeight };
            const look = { x: CAM_LOOK_X_M, y: 0, z: 0 };
            const fwd = vecNorm(vecSub(look, pos));
            const right = vecNorm(vecCross(fwd, { x: 0, y: 0, z: 1 }));
            const up = vecCross(right, fwd);
            view.cam = { pos, fwd, right, up };
        }

        function projectRaw(x, y, z) {
            const c = view.cam;
            const dx = x - c.pos.x, dy = y - c.pos.y, dz = z - c.pos.z;
            const cz = dx * c.fwd.x + dy * c.fwd.y + dz * c.fwd.z;
            if (cz < 0.2) return null;
            const cx = dx * c.right.x + dy * c.right.y + dz * c.right.z;
            const cy = dx * c.up.x + dy * c.up.y + dz * c.up.z;
            return { nx: cx / cz, ny: cy / cz, depth: cz };
        }

        function updateFit() {
            const L = HALF_LEN_M, D = HALF_DOUBLES_M;
            const pts = [
                [-L - 1.2, -D - 0.6, 0], [-L - 1.2, D + 0.6, 0],
                [L + 1.5, -D - 0.6, 0], [L + 1.5, D + 0.6, 0],
                [L + 1.5, 0, PLAYER_H_M],
                [0, -NET_POST_Y_M, NET_POST_H_M], [0, NET_POST_Y_M, NET_POST_H_M]
            ];
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            pts.forEach(p => {
                const r = projectRaw(p[0], p[1], p[2]);
                if (!r) return;
                minX = Math.min(minX, r.nx); maxX = Math.max(maxX, r.nx);
                minY = Math.min(minY, r.ny); maxY = Math.max(maxY, r.ny);
            });
            const w = canvas.width || 1, h = canvas.height || 1;
            const padX = 0.05, padTop = 0.09, padBottom = 0.12;
            const spanX = Math.max(1e-6, maxX - minX), spanY = Math.max(1e-6, maxY - minY);
            const scale = Math.min((w * (1 - 2 * padX)) / spanX, (h * (1 - padTop - padBottom)) / spanY);
            const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
            const cy = h * (padTop + (1 - padTop - padBottom) / 2);
            view.fit = { scale, ox: w / 2 - scale * midX, oy: cy + scale * midY };
        }

        function w2c(x, y, z) {
            const r = projectRaw(x, y, z || 0);
            if (!r) return null;
            return { x: view.fit.ox + view.fit.scale * r.nx, y: view.fit.oy - view.fit.scale * r.ny, depth: r.depth };
        }
        function mToPx(depth, m) { return view.fit.scale * m / Math.max(depth, 0.2); }

        // Punto SVG -> canvas a quota z
        function s2c(sx, sy, z) {
            const w = svgToWorld(sx, sy);
            return w2c(w.x, w.y, z || 0);
        }

        // Pixel canvas -> punto SVG sul piano z = planeZ
        function canvasToSvg(px, py, planeZ) {
            const c = view.cam;
            const nx = (px - view.fit.ox) / view.fit.scale;
            const ny = (view.fit.oy - py) / view.fit.scale;
            const dir = {
                x: c.fwd.x + nx * c.right.x + ny * c.up.x,
                y: c.fwd.y + nx * c.right.y + ny * c.up.y,
                z: c.fwd.z + nx * c.right.z + ny * c.up.z
            };
            let dz = (planeZ || 0) - c.pos.z;
            // Sopra l'orizzonte: punto lontanissimo nella stessa direzione
            if (dir.z > -1e-3) dir.z = -1e-3;
            let t = dz / dir.z;
            if (t < 0) t = 0;
            t = Math.min(t, 400);
            return worldToSvg(c.pos.x + dir.x * t, c.pos.y + dir.y * t);
        }

        function resize() {
            const wr = wrap.getBoundingClientRect();
            const sr = svg.getBoundingClientRect();
            if (!sr.width || !sr.height) return false;
            layer.style.left = (sr.left - wr.left) + 'px';
            layer.style.top = (sr.top - wr.top) + 'px';
            layer.style.width = sr.width + 'px';
            layer.style.height = sr.height + 'px';
            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            const W = Math.max(1, Math.round(sr.width * dpr));
            const H = Math.max(1, Math.round(sr.height * dpr));
            if (canvas.width !== W || canvas.height !== H) {
                canvas.width = W;
                canvas.height = H;
            }
            view.dpr = dpr;
            setupCamera();
            updateFit();
            return true;
        }

        Object.assign(view, { setupCamera, updateFit, w2c, s2c, mToPx, canvasToSvg, resize });
        return view;
    }

    // ======================================================================
    // Lettura della scena dall'SVG
    // ======================================================================
    function isHidden(el, svg) {
        for (let n = el; n && n !== svg; n = n.parentNode) {
            if (n.nodeType !== 1) continue;
            if (n.getAttribute('display') === 'none' || n.style.display === 'none') return true;
            if (n.getAttribute('visibility') === 'hidden' || n.style.visibility === 'hidden') return true;
            if (n !== el && n.getAttribute && n.getAttribute('data-3d') === 'base') return true;
        }
        const cs = window.getComputedStyle(el);
        return cs.display === 'none';
    }

    function chainOpacity(el, svg) {
        let o = 1;
        for (let n = el; n && n !== svg; n = n.parentNode) {
            if (n.nodeType !== 1) continue;
            const a = n.getAttribute('opacity');
            if (a != null && a !== '') o *= parseFloat(a);
            if (n.style && n.style.opacity !== '') o *= parseFloat(n.style.opacity);
        }
        return isFinite(o) ? o : 1;
    }

    function attrOrStyle(el, cs, name) {
        const v = el.getAttribute(name);
        if (v != null && v !== '') return v;
        return cs.getPropertyValue(name);
    }

    function elementMatrix(el, svg) {
        if (!el.getScreenCTM) return null;
        const a = el.getScreenCTM(), b = svg.getScreenCTM();
        if (!a || !b) return null;
        const m = b.inverse().multiply(a);
        // Identità (caso comune): niente trasformazione
        if (Math.abs(m.a - 1) < 1e-6 && Math.abs(m.d - 1) < 1e-6 && Math.abs(m.b) < 1e-6 &&
            Math.abs(m.c) < 1e-6 && Math.abs(m.e) < 1e-6 && Math.abs(m.f) < 1e-6) return null;
        return m;
    }
    function applyM(m, x, y) {
        if (!m) return [x, y];
        return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
    }

    function collectScene(svg) {
        const scene = { ground: [], players: [], labels: [], shots: [] };
        const nodes = svg.querySelectorAll('line, polyline, polygon, path, circle, ellipse, text');
        nodes.forEach(el => {
            if (el.getAttribute('data-3d') === 'base') return;
            if (el.closest('.court-logo, defs, clipPath, mask, marker')) return;
            if (isHidden(el, svg)) return;
            const cs = window.getComputedStyle(el);
            const opacity = chainOpacity(el, svg);
            if (opacity <= 0.01) return;
            const m = elementMatrix(el, svg);
            const sw = parseFloat(attrOrStyle(el, cs, 'stroke-width')) || 1;
            const stroke = attrOrStyle(el, cs, 'stroke');
            const fill = attrOrStyle(el, cs, 'fill');
            const strokeOp = parseFloat(attrOrStyle(el, cs, 'stroke-opacity'));
            const fillOp = parseFloat(attrOrStyle(el, cs, 'fill-opacity'));
            const dashAttr = attrOrStyle(el, cs, 'stroke-dasharray');
            const dash = dashAttr && dashAttr !== 'none'
                ? dashAttr.split(/[\s,]+/).map(parseFloat).filter(v => v > 0) : null;
            const scaleM = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1;
            const base = {
                el, opacity,
                stroke: stroke && stroke !== 'none' ? stroke : null,
                fill: fill && fill !== 'none' && fill !== 'transparent' ? fill : null,
                strokeAlpha: opacity * (isFinite(strokeOp) ? strokeOp : 1),
                fillAlpha: opacity * (isFinite(fillOp) ? fillOp : 1),
                width: sw * scaleM,
                dash: dash && dash.length ? dash.map(v => v * scaleM) : null
            };
            const tag = el.tagName.toLowerCase();

            if (tag === 'line') {
                const p1 = applyM(m, +el.getAttribute('x1') || 0, +el.getAttribute('y1') || 0);
                const p2 = applyM(m, +el.getAttribute('x2') || 0, +el.getAttribute('y2') || 0);
                if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.5) return;
                const item = Object.assign(base, { kind: 'poly', pts: [p1, p2], closed: false, fill: null });
                if (/^yellowLine/.test(el.id || '')) scene.shots.push(item);
                else scene.ground.push(item);
                return;
            }
            if (tag === 'polygon' || tag === 'polyline') {
                const pts = [];
                const list = el.points;
                for (let i = 0; i < list.numberOfItems; i++) {
                    const p = list.getItem(i);
                    pts.push(applyM(m, p.x, p.y));
                }
                if (pts.length < 2) return;
                scene.ground.push(Object.assign(base, { kind: 'poly', pts, closed: tag === 'polygon' }));
                return;
            }
            if (tag === 'path') {
                let total = 0;
                try { total = el.getTotalLength(); } catch (e) { return; }
                if (!total) return;
                const n = Math.max(2, Math.min(400, Math.ceil(total / 5)));
                const pts = [];
                for (let i = 0; i <= n; i++) {
                    const p = el.getPointAtLength(total * i / n);
                    pts.push(applyM(m, p.x, p.y));
                }
                const d = el.getAttribute('d') || '';
                scene.ground.push(Object.assign(base, { kind: 'poly', pts, closed: /z\s*$/i.test(d.trim()) }));
                return;
            }
            if (tag === 'circle' || tag === 'ellipse') {
                // la maniglia di fine colpo in 3D è la pallina all'arrivo dell'arco (vedi drawShotArc)
                if (el.id === 'shotEndHandle') return;
                const c = applyM(m, +el.getAttribute('cx') || 0, +el.getAttribute('cy') || 0);
                const r = (tag === 'circle' ? +el.getAttribute('r') : +el.getAttribute('rx')) * scaleM;
                if (!(r > 0)) return;
                if (r >= 7) scene.players.push(Object.assign(base, { kind: 'player', cx: c[0], cy: c[1], r }));
                else scene.ground.push(Object.assign(base, { kind: 'disc', cx: c[0], cy: c[1], r }));
                return;
            }
            if (tag === 'text') {
                const txt = (el.textContent || '').trim();
                if (!txt) return;
                let x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0;
                const p = applyM(m, x, y);
                const prev = el.previousElementSibling;
                const border = prev && prev.tagName.toLowerCase() === 'rect' ? prev.getAttribute('stroke') : null;
                const fs = (parseFloat(attrOrStyle(el, cs, 'font-size')) || 16) * scaleM;
                scene.labels.push(Object.assign(base, { kind: 'label', x: p[0], y: p[1], text: txt, border, fontSize: fs }));
            }
        });
        return scene;
    }

    // ======================================================================
    // Disegno
    // ======================================================================
    function fillPoly(view, pts, color) {
        const ctx = view.ctx;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < pts.length; i++) {
            const q = pts[i];
            if (!q) return;
            if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Nastro a terra tra due punti mondo (larghezza in metri): prospettiva reale
    function groundRibbonWorld(view, a, b, wM, color) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len < 1e-6) return;
        const nx = -dy / len * wM / 2, ny = dx / len * wM / 2;
        fillPoly(view, [
            view.w2c(a.x + nx, a.y + ny, 0), view.w2c(b.x + nx, b.y + ny, 0),
            view.w2c(b.x - nx, b.y - ny, 0), view.w2c(a.x - nx, a.y - ny, 0)
        ], color);
    }

    function groundDiscWorld(view, cx, cy, rM, color, z) {
        const pts = [];
        for (let i = 0; i < 28; i++) {
            const a = (i / 28) * Math.PI * 2;
            pts.push(view.w2c(cx + Math.cos(a) * rM, cy + Math.sin(a) * rM, z || 0));
        }
        fillPoly(view, pts, color);
    }

    // Polilinea SVG a terra, con tratteggio misurato in unità SVG come nel 2D
    function strokeGroundSvg(view, pts, closed, widthSvg, color, dash) {
        const wM = Math.max(0.035, widthSvg / SCALE_AVG);
        const seq = closed ? pts.concat([pts[0]]) : pts;
        const segs = [];
        for (let i = 0; i < seq.length - 1; i++) segs.push([seq[i], seq[i + 1]]);
        const emit = (p, q) => {
            groundRibbonWorld(view, svgToWorld(p[0], p[1]), svgToWorld(q[0], q[1]), wM, color);
        };
        if (!dash) {
            segs.forEach(s => emit(s[0], s[1]));
            // giunti arrotondati per polilinee fitte (disegni a mano)
            if (seq.length > 2) {
                for (let i = 1; i < seq.length - 1; i++) {
                    const w = svgToWorld(seq[i][0], seq[i][1]);
                    groundDiscWorld(view, w.x, w.y, wM / 2, color);
                }
            }
            return;
        }
        let di = 0, remain = dash[0], on = true;
        segs.forEach(([p, q]) => {
            const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
            let s = 0;
            while (s < L - 1e-6) {
                const step = Math.min(remain, L - s);
                if (on) {
                    const t0 = s / L, t1 = (s + step) / L;
                    emit([p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0],
                         [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1]);
                }
                s += step;
                remain -= step;
                if (remain <= 1e-6) {
                    di = (di + 1) % dash.length;
                    remain = dash[di];
                    on = !on;
                }
            }
        });
    }

    function drawGroundItem(view, it) {
        if (it.kind === 'disc') {
            const w = svgToWorld(it.cx, it.cy);
            const rM = it.r / SCALE_AVG;
            const f = it.fill ? withAlpha(it.fill, it.fillAlpha) : null;
            if (f) groundDiscWorld(view, w.x, w.y, rM, f);
            if (it.stroke) groundDiscWorld(view, w.x, w.y, rM * 0.35, withAlpha(it.stroke, it.strokeAlpha));
            return;
        }
        const svgPts = it.pts;
        if (it.fill && it.fillAlpha > 0.01 && svgPts.length >= 3) {
            fillPoly(view, svgPts.map(p => view.s2c(p[0], p[1], 0)), withAlpha(it.fill, it.fillAlpha));
        }
        if (it.stroke && it.strokeAlpha > 0.01) {
            strokeGroundSvg(view, svgPts, it.closed, it.width, withAlpha(it.stroke, it.strokeAlpha), it.dash);
        }
    }

    function drawBackground(view, colors) {
        const { ctx, canvas } = view;
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, shade(colors.background, -0.28));
        g.addColorStop(0.55, colors.background);
        g.addColorStop(1, shade(colors.background, 0.06));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Schiarisce (+) o scurisce (-) un colore #rrggbb
    function shade(hex, amt) {
        colorCtx.fillStyle = hex;
        const c = colorCtx.fillStyle;
        if (c[0] !== '#') return hex;
        const ch = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)).map(v => {
            const t = amt < 0 ? 0 : 255;
            return Math.round(v + (t - v) * Math.abs(amt));
        });
        return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
    }

    function drawCourtSurface(view, colors) {
        const L = HALF_LEN_M, S = HALF_SINGLES_M, D = HALF_DOUBLES_M, svc = SERVICE_FROM_NET_M;
        const P = (x, y) => view.w2c(x, y, 0);
        // fondo campo (runoff)
        fillPoly(view, [P(-L - 6.3, -10.7), P(L + 5.3, -10.7), P(L + 5.3, 10.7), P(-L - 6.3, 10.7)], colors.background);
        // superficie di gioco
        fillPoly(view, [P(-L, -D), P(L, -D), P(L, D), P(-L, D)], colors.court);
        const white = 'rgba(255,255,255,0.96)';
        const line = (x1, y1, x2, y2, w) => groundRibbonWorld(view, { x: x1, y: y1 }, { x: x2, y: y2 }, w || LINE_W_M, white);
        line(-L, -D, L, -D); line(-L, D, L, D);
        line(-L, -S, L, -S); line(-L, S, L, S);
        line(-L, -D, -L, D, LINE_W_M * 1.3); line(L, -D, L, D, LINE_W_M * 1.3);
        line(-svc, -S, -svc, S); line(svc, -S, svc, S);
        line(-svc, 0, svc, 0);
        line(-L, 0, -L + 0.35, 0); line(L, 0, L - 0.35, 0);
    }

    function drawNet(view) {
        const ctx = view.ctx;
        const steps = 24;
        const y0 = -NET_POST_Y_M, y1 = NET_POST_Y_M;
        // ombra della rete
        fillPoly(view, [view.w2c(0.05, y0, 0), view.w2c(0.05, y1, 0), view.w2c(0.55, y1, 0), view.w2c(0.55, y0, 0)], 'rgba(0,0,0,0.10)');
        for (let i = 0; i < steps; i++) {
            const ya = y0 + (y1 - y0) * (i / steps), yb = y0 + (y1 - y0) * ((i + 1) / steps);
            fillPoly(view, [view.w2c(0, ya, 0), view.w2c(0, yb, 0), view.w2c(0, yb, netHeightAtY(yb)), view.w2c(0, ya, netHeightAtY(ya))],
                'rgba(12, 24, 40, 0.42)');
        }
        // trama verticale leggera
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = Math.max(1, 0.8 * view.dpr);
        ctx.beginPath();
        for (let i = 1; i < 40; i++) {
            const y = y0 + (y1 - y0) * (i / 40);
            const a = view.w2c(0, y, 0), b = view.w2c(0, y, netHeightAtY(y));
            if (a && b) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        }
        ctx.stroke();
        // nastro
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const y = y0 + (y1 - y0) * (i / steps);
            const q = view.w2c(0, y, netHeightAtY(y));
            if (!q) continue;
            if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 2.6 * view.dpr);
        ctx.lineJoin = 'round';
        ctx.stroke();
        // pali
        ctx.lineCap = 'round';
        [y0, y1].forEach(y => {
            const a = view.w2c(0, y, 0), b = view.w2c(0, y, NET_POST_H_M);
            if (!a || !b) return;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#e8eef5';
            ctx.lineWidth = Math.max(2, view.mToPx(a.depth, 0.1));
            ctx.stroke();
        });
    }

    function drawPlayer(view, p) {
        const ctx = view.ctx;
        const w = svgToWorld(p.cx, p.cy);
        const feet = view.w2c(w.x, w.y, 0);
        const neck = view.w2c(w.x, w.y, PLAYER_H_M - 0.32);
        const head = view.w2c(w.x, w.y, PLAYER_H_M - 0.12);
        if (!feet || !neck || !head) return;
        const color = p.fill || '#ff5252';
        const alpha = p.fillAlpha;
        const r = Math.max(3 * view.dpr, view.mToPx(feet.depth, PLAYER_R_M));
        const headR = Math.max(2.6 * view.dpr, view.mToPx(head.depth, 0.15));
        // ombra a terra
        groundDiscWorld(view, w.x + 0.12, w.y - 0.08, 0.42, `rgba(0,0,0,${0.22 * alpha})`);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        // contorno bianco
        ctx.beginPath(); ctx.moveTo(feet.x, feet.y - r * 0.5); ctx.lineTo(neck.x, neck.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = r * 2 + 2.4 * view.dpr;
        ctx.stroke();
        // corpo
        ctx.beginPath(); ctx.moveTo(feet.x, feet.y - r * 0.5); ctx.lineTo(neck.x, neck.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = r * 2;
        ctx.stroke();
        // riflesso laterale
        ctx.beginPath(); ctx.moveTo(feet.x - r * 0.45, feet.y - r * 0.6); ctx.lineTo(neck.x - r * 0.45, neck.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = r * 0.45;
        ctx.stroke();
        // testa
        ctx.beginPath(); ctx.arc(head.x, head.y - headR * 0.3, headR, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1.2 * view.dpr; ctx.strokeStyle = '#ffffff'; ctx.stroke();
        ctx.restore();
        if (view.interactive) {
            view.pickables.push({ type: 'player', el: p.el, feet, top: { x: head.x, y: head.y - headR * 1.3 }, r: Math.max(r, headR), svgX: p.cx, svgY: p.cy });
        }
    }

    // Rettangolo (in metri, coordinate mondo) in cui deve cadere il rimbalzo:
    // la metà campo del ricevitore (sign = segno di X) entro le righe del
    // singolare o del doppio; nel servizio il quadrato di battuta.
    function bounceRect(a, b, sign, isServe) {
        const m = BOUNCE_MARGIN_M;
        const isDoppio = window.__gioco__ === 'doppio';
        if (isServe) {
            // lato del quadrato: dove la direzione del colpo attraversa metà quadrato
            const xMid = sign * SERVICE_FROM_NET_M / 2;
            const dx = b.x - a.x;
            const yMid = Math.abs(dx) > 1e-6 ? a.y + (b.y - a.y) * (xMid - a.x) / dx : b.y;
            const side = yMid >= 0 ? 1 : -1;
            const y0 = side > 0 ? m : -HALF_SINGLES_M + m;
            const y1 = side > 0 ? HALF_SINGLES_M - m : -m;
            return { x0: m, x1: SERVICE_FROM_NET_M - m, y0, y1 };
        }
        const half = isDoppio ? HALF_DOUBLES_M : HALF_SINGLES_M;
        return { x0: BOUNCE_MIN_FROM_NET_M, x1: HALF_LEN_M - m, y0: -half + m, y1: half - m };
    }

    // Intervallo di t in [lo, hi] per cui a + t(b-a) sta nel rettangolo
    // (X misurata con il segno del lato del ricevitore). null se vuoto.
    function segmentRectRange(a, b, sign, r, lo, hi) {
        const clip = (p0, d, min, max) => {
            if (Math.abs(d) < 1e-9) {
                if (p0 < min || p0 > max) hi = -Infinity;
                return;
            }
            let t0 = (min - p0) / d, t1 = (max - p0) / d;
            if (t0 > t1) { const s = t0; t0 = t1; t1 = s; }
            lo = Math.max(lo, t0);
            hi = Math.min(hi, t1);
        };
        clip(sign * a.x, sign * (b.x - a.x), r.x0, r.x1);
        clip(a.y, b.y - a.y, r.y0, r.y1);
        return lo <= hi ? { lo, hi } : null;
    }

    // Altezza di apice per una parabola da h0 a h1 che passi sopra la rete
    // alla frazione sn del tratto, attraversandola in yNet.
    function apexOverNet(h0, h1, sn, yNet, minApex) {
        if (!(sn > 0 && sn < 1)) return minApex;
        const need = netHeightAtY(yNet) + NET_CLEARANCE_M;
        const base = h0 * (1 - sn) + h1 * sn;
        return Math.max(minApex, (need - base) / (4 * sn * (1 - sn)));
    }

    // Arco stilizzato del Colpo: parabola sopra la rete, rimbalzo dentro le
    // righe, risalita. Se il ricevitore colpisce al volo (passante nel singolare,
    // giocatore a rete nel doppio) non c'è rimbalzo: un'unica parabola.
    function shotArc(it) {
        const [p1, p2] = it.pts;
        const a = svgToWorld(p1[0], p1[1]), b = svgToWorld(p2[0], p2[1]);
        const isServe = !!window.__shotTypeIsServizio__;
        const h0 = isServe ? SERVE_HIT_H_M : SHOT_HIT_H_M;
        const crosses = (a.x < 0) !== (b.x < 0) && Math.abs(b.x - a.x) > 1e-6;
        const tn = crosses ? (0 - a.x) / (b.x - a.x) : 0.5;
        const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
        const N = 64;
        const pts = [];

        const bridge = window.__gotDragBridge__;
        const volley = !!(bridge && bridge.shotIsVolley && bridge.shotIsVolley());
        if (volley) {
            // volée: nessun rimbalzo, la palla arriva al ricevitore in volo
            const yNet = a.y + (b.y - a.y) * tn;
            const apex = apexOverNet(h0, VOLLEY_H_M, crosses ? tn : 0, yNet, 0.3);
            for (let i = 0; i <= N; i++) {
                const t = i / N;
                const z = h0 * (1 - t) + VOLLEY_H_M * t + 4 * apex * t * (1 - t);
                const g = lerp(a, b, t);
                pts.push({ x: g.x, y: g.y, z: Math.max(0, z) });
            }
            return { pts, bounce: null, a, b };
        }

        // punto di rimbalzo "naturale" lungo la direzione del colpo
        let tb = crosses ? tn + (1 - tn) * 0.68 : 0.75;
        if (crosses && isServe) {
            // servizio: rimbalzo dentro il quadrato, poco prima della linea di servizio
            const xBounce = (b.x < 0 ? -1 : 1) * (SERVICE_FROM_NET_M - 0.9);
            const t = (xBounce - a.x) / (b.x - a.x);
            if (t > tn && t < 0.97) tb = t;
        }
        // il rimbalzo deve cadere dentro le righe: lo si fa scorrere lungo la
        // direzione del colpo; se la direzione non entra mai nel campo, si usa
        // il punto valido più vicino e la traiettoria piega nel rimbalzo.
        const sign = b.x >= 0 ? 1 : -1;
        const rect = bounceRect(a, b, sign, isServe);
        const range = segmentRectRange(a, b, sign, rect, crosses ? tn : 0, 0.97);
        let bounce;
        if (range) {
            tb = Math.max(range.lo, Math.min(range.hi, tb));
            bounce = lerp(a, b, tb);
        } else {
            const p = lerp(a, b, tb);
            const xs = Math.max(rect.x0, Math.min(rect.x1, sign * p.x));
            bounce = { x: sign * xs, y: Math.max(rect.y0, Math.min(rect.y1, p.y)) };
        }

        // tratto 1: dal colpitore al rimbalzo (sopra la rete)
        const d1x = bounce.x - a.x;
        const sn = (Math.abs(d1x) > 1e-6 && (a.x < 0) !== (bounce.x < 0)) ? (0 - a.x) / d1x : 0;
        const yNet = a.y + (bounce.y - a.y) * sn;
        const apex = sn > 0 ? apexOverNet(h0, 0, sn, yNet, 0.35) : 0.6;
        const len1 = Math.hypot(bounce.x - a.x, bounce.y - a.y);
        const len2 = Math.hypot(b.x - bounce.x, b.y - bounce.y);
        const n1 = Math.max(8, Math.round(N * len1 / ((len1 + len2) || 1)));
        const n2 = Math.max(4, N - n1);
        for (let i = 0; i <= n1; i++) {
            const s = i / n1;
            const g = lerp(a, bounce, s);
            pts.push({ x: g.x, y: g.y, z: Math.max(0, h0 * (1 - s) + 4 * apex * s * (1 - s)) });
        }
        // tratto 2: dal rimbalzo al punto in cui il ricevitore colpisce
        for (let i = 1; i <= n2; i++) {
            const u = i / n2;
            const g = lerp(bounce, b, u);
            pts.push({ x: g.x, y: g.y, z: SHOT_END_H_M * (2 * u - u * u) });
        }
        return { pts, bounce, a, b };
    }

    function drawShotArc(view, it) {
        const ctx = view.ctx;
        const arc = shotArc(it);
        const color = it.stroke || '#ffd600';
        // rimbalzo (assente nella volée)
        if (arc.bounce) {
            groundDiscWorld(view, arc.bounce.x, arc.bounce.y, 0.2, withAlpha(color, 0.9 * it.strokeAlpha));
            groundDiscWorld(view, arc.bounce.x, arc.bounce.y, 0.09, 'rgba(255,255,255,0.95)');
        }
        const scr = arc.pts.map(p => view.w2c(p.x, p.y, p.z)).filter(Boolean);
        if (scr.length < 2) return;
        ctx.save();
        ctx.globalAlpha = it.strokeAlpha;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        scr.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = Math.max(3, 4.6 * view.dpr);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, 3 * view.dpr);
        ctx.stroke();
        ctx.restore();
        // pallina all'arrivo
        const end = arc.pts[arc.pts.length - 1];
        const q = view.w2c(end.x, end.y, end.z);
        // la pallina all'arrivo fa da maniglia della fine del colpo (se visibile nel 2D)
        const handleEl = document.getElementById('shotEndHandle');
        const endDraggable = view.interactive && it.el && it.el.id === 'yellowLine' &&
            handleEl && handleEl.style.display !== 'none';
        if (q) {
            const r = Math.max(3 * view.dpr, view.mToPx(q.depth, 0.1));
            ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
            ctx.fillStyle = '#e6ff3a'; ctx.fill();
            ctx.lineWidth = 1.2 * view.dpr; ctx.strokeStyle = '#ffffff'; ctx.stroke();
            if (endDraggable) {
                // anello per indicare che la pallina si può trascinare
                ctx.beginPath(); ctx.arc(q.x, q.y, r + 3 * view.dpr, 0, Math.PI * 2);
                ctx.lineWidth = 1.5 * view.dpr; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke();
                const [svgX, svgY] = it.pts[it.pts.length - 1];
                view.pickables.push({ type: 'shotEnd', x: q.x, y: q.y, r: r + 3 * view.dpr, z: end.z, svgX, svgY });
            }
        }
        if (view.interactive) {
            const ground = it.pts.map(p => view.s2c(p[0], p[1], 0)).filter(Boolean);
            view.pickables.push({ type: 'shot', el: it.el, lines: [scr, ground] });
        }
    }

    function drawLabel(view, it) {
        const ctx = view.ctx;
        const q = view.s2c(it.x, it.y, 0);
        if (!q) return;
        const fs = Math.round(Math.max(11, Math.min(17, it.fontSize * 0.72)) * view.dpr);
        ctx.save();
        ctx.globalAlpha = it.opacity;
        ctx.font = `700 ${fs}px Roboto, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(it.text).width;
        const padX = 7 * view.dpr, h = fs + 8 * view.dpr;
        const x = q.x - tw / 2 - padX, y = q.y - h / 2, w = tw + padX * 2;
        const rad = h / 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.96)';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6 * view.dpr;
        ctx.shadowOffsetY = 1.5 * view.dpr;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        const border = it.border || it.fill;
        if (border && border !== 'none') {
            ctx.lineWidth = 1.4 * view.dpr;
            ctx.strokeStyle = border;
            ctx.stroke();
        }
        ctx.fillStyle = it.fill || '#ff6f00';
        ctx.fillText(it.text, q.x, q.y + 0.5 * view.dpr);
        ctx.restore();
        if (view.interactive && it.el && it.el.id === 'h-measure-label') {
            view.pickables.push({ type: 'measureLabel', box: { x, y, w, h } });
        }
    }

    function render(view) {
        view.dirty = false;
        if (!view.canvas.width || !view.canvas.height) return;
        const colors = (window.__gotDragBridge__ && window.__gotDragBridge__.courtColors()) ||
            { background: '#1565c0', court: '#42a5f5' };
        const ctx = view.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
        view.pickables = [];
        drawBackground(view, colors);
        drawCourtSurface(view, colors);

        const scene = collectScene(view.svg);
        scene.ground.forEach(it => {
            drawGroundItem(view, it);
            if (view.interactive && it.el && it.el.id === 'h-measure') {
                view.pickables.push({ type: 'measure', el: it.el, lines: [it.pts.map(p => view.s2c(p[0], p[1], 0)).filter(Boolean)] });
            }
        });

        const far = [], near = [];
        scene.players.forEach(p => (p.cy < NET_Y_SVG ? far : near).push(p));
        far.sort((a, b) => a.cy - b.cy);
        near.sort((a, b) => a.cy - b.cy);
        far.forEach(p => drawPlayer(view, p));
        drawNet(view);
        near.forEach(p => drawPlayer(view, p));
        scene.shots.forEach(it => drawShotArc(view, it));
        scene.labels.forEach(it => drawLabel(view, it));
    }

    // ======================================================================
    // Gestione viste, aggiornamenti e UI
    // ======================================================================
    let rafId = 0;
    function scheduleRender() {
        if (state.vista !== '3d' || rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            state.views.forEach(v => {
                if (!v.svg.isConnected) return;
                if (v.resize()) render(v);
            });
        });
    }

    function observeSvg(svg) {
        const mo = new MutationObserver(scheduleRender);
        mo.observe(svg, { attributes: true, childList: true, subtree: true, characterData: true });
    }

    const primaryWrap = primarySvg.closest('.svg-wrap') || primarySvg.parentNode;
    const primaryView = createView(primarySvg, primaryWrap, true);
    state.views.push(primaryView);
    observeSvg(primarySvg);

    // Campo secondario (2 colpi): creato in modo lazy da app.js
    const secondaryWrap = document.querySelector('.svg-wrap.secondary');
    let secondaryView = null;
    function ensureSecondary() {
        if (!secondaryWrap) return;
        const svg2 = secondaryWrap.querySelector(':scope > svg');
        if (!svg2) return;
        if (secondaryView && secondaryView.svg === svg2 && secondaryView.layer.isConnected) return;
        if (secondaryView) state.views = state.views.filter(v => v !== secondaryView);
        secondaryView = createView(svg2, secondaryWrap, false);
        state.views.push(secondaryView);
        observeSvg(svg2);
        scheduleRender();
    }
    if (secondaryWrap) {
        new MutationObserver(() => { ensureSecondary(); scheduleRender(); })
            .observe(secondaryWrap, { childList: true, attributes: true, attributeFilter: ['style', 'class'] });
        ensureSecondary();
    }

    // Ridisegno a cambio superficie / modalità / layout
    new MutationObserver(scheduleRender).observe(document.documentElement, { attributes: true, attributeFilter: ['data-surface'] });
    new MutationObserver(scheduleRender).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', scheduleRender);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(scheduleRender);
        ro.observe(primarySvg);
        if (secondaryWrap) ro.observe(secondaryWrap);
    }

    // ---- Controlli: toggle 2D/3D + altezza camera ----
    const controls = document.createElement('div');
    controls.className = 'court3d-toggle';
    controls.setAttribute('role', 'radiogroup');
    controls.setAttribute('aria-label', 'Vista del campo');
    controls.innerHTML =
        '<span class="court3d-toggle-thumb" aria-hidden="true"></span>' +
        '<button type="button" role="radio" data-vista="2d">2D</button>' +
        '<button type="button" role="radio" data-vista="3d">3D</button>';
    primaryWrap.appendChild(controls);

    const camCtl = document.createElement('div');
    camCtl.className = 'court3d-camera';
    camCtl.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6"/></svg>' +
        `<input type="range" min="${CAM_H_MIN}" max="${CAM_H_MAX}" step="0.5" aria-label="Altezza della camera">` +
        '<span class="court3d-camera-value"></span>';
    primaryView.layer.appendChild(camCtl);
    const camRange = camCtl.querySelector('input');
    const camValue = camCtl.querySelector('.court3d-camera-value');

    function positionControls() {
        const wr = primaryWrap.getBoundingClientRect();
        const sr = primarySvg.getBoundingClientRect();
        if (!sr.width) return;
        controls.style.top = (sr.top - wr.top + 12) + 'px';
        controls.style.right = (wr.right - sr.right + 12) + 'px';
    }
    window.addEventListener('resize', positionControls);
    if (window.ResizeObserver) new ResizeObserver(positionControls).observe(primarySvg);

    function setCamHeight(h, persist) {
        const z = Math.max(CAM_H_MIN, Math.min(CAM_H_MAX, Number(h) || CAM_H_DEFAULT));
        state.camHeight = z;
        camRange.value = String(z);
        camValue.textContent = (z % 1 ? z.toFixed(1) : String(z)) + ' m';
        if (persist) storageSet(STORAGE_CAM_KEY, String(z));
        scheduleRender();
    }
    camRange.addEventListener('input', () => setCamHeight(camRange.value, true));

    function setVista(v, persist) {
        const is3d = v === '3d';
        if (dragCtx) endDrag();
        state.vista = is3d ? '3d' : '2d';
        document.body.classList.toggle('vista-3d', is3d);
        controls.querySelectorAll('button').forEach(b => {
            const on = b.dataset.vista === state.vista;
            b.classList.toggle('active', on);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        controls.classList.toggle('is-3d', is3d);
        if (persist !== false) storageSet(STORAGE_KEY, state.vista);
        primarySvg.setAttribute('aria-hidden', is3d ? 'true' : 'false');
        if (is3d) {
            const label = window.__gotDragBridge__ && window.__gotDragBridge__.ariaLabel
                ? window.__gotDragBridge__.ariaLabel() : 'Campo da tennis';
            primaryView.canvas.setAttribute('aria-label', String(label).replace(/vista dall'alto/i, 'vista 3D'));
            ensureSecondary();
            positionControls();
            scheduleRender();
        } else if (window.__gotDragBridge__) {
            requestAnimationFrame(() => window.__gotDragBridge__.refresh2d());
        }
    }
    controls.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-vista]');
        if (b) setVista(b.dataset.vista);
    });

    // ======================================================================
    // Trascinamento in 3D
    // ======================================================================
    let dragCtx = null;  // { planeZ, offX, offY, pointerId }

    function clientToCanvas(view, clientX, clientY) {
        const r = view.canvas.getBoundingClientRect();
        return {
            x: (clientX - r.left) * (view.canvas.width / (r.width || 1)),
            y: (clientY - r.top) * (view.canvas.height / (r.height || 1))
        };
    }

    function clientToSvg(clientX, clientY) {
        const v = primaryView;
        if (!v.canvas.width) return null;
        const c = clientToCanvas(v, clientX, clientY);
        const p = v.canvasToSvg(c.x, c.y, dragCtx ? dragCtx.planeZ : 0);
        if (dragCtx) { p.x += dragCtx.offX; p.y += dragCtx.offY; }
        return p;
    }

    function polyDistance(lines, x, y) {
        let best = Infinity;
        lines.forEach(pts => {
            for (let i = 0; i < pts.length - 1; i++) {
                const d = distToSegment(x, y, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y).d;
                if (d < best) best = d;
            }
        });
        return best;
    }

    function pick(clientX, clientY, pointerType) {
        const v = primaryView;
        const c = clientToCanvas(v, clientX, clientY);
        const tol = (pointerType === 'mouse' ? 8 : 20) * v.dpr;
        let best = null;
        // giocatori: priorità come in handleTouchFriendlyPointerDown
        v.pickables.forEach(pk => {
            if (pk.type !== 'player') return;
            const hit = distToSegment(c.x, c.y, pk.feet.x, pk.feet.y, pk.top.x, pk.top.y);
            const d = hit.d - pk.r;
            if (d <= tol && (!best || best.kind !== 'player' || d < best.d)) {
                best = { kind: 'player', d, pk, t: hit.t };
            }
        });
        // fine del colpo: la pallina è disegnata sopra i giocatori, quindi vince se il
        // cursore è sopra di lei; altrimenti compete con i giocatori per distanza
        v.pickables.forEach(pk => {
            if (pk.type !== 'shotEnd') return;
            const d = Math.hypot(c.x - pk.x, c.y - pk.y) - pk.r;
            if (d <= tol && (!best || d <= 0 || d < best.d)) best = { kind: 'shotEnd', d, pk };
        });
        if (best) return { best, c };
        v.pickables.forEach(pk => {
            let d = Infinity;
            if (pk.type === 'shot' || pk.type === 'measure') d = polyDistance(pk.lines, c.x, c.y);
            else if (pk.type === 'measureLabel') {
                const b = pk.box;
                d = (c.x >= b.x && c.x <= b.x + b.w && c.y >= b.y && c.y <= b.y + b.h) ? 0 : Infinity;
            }
            if (d <= tol && (!best || d < best.d)) best = { kind: pk.type, d, pk };
        });
        return best ? { best, c } : null;
    }

    function dragActionFor(hit) {
        const bridge = window.__gotDragBridge__;
        if (!bridge || !hit) return null;
        const k = hit.best.kind;
        if (k === 'player') {
            const el = hit.best.pk.el;
            const id = el.id || '';
            if (id === 'cursorDot') return () => bridge.startDot();
            if (id === 'intersectionDot') return () => bridge.startIntersection();
            if (/^doppio[AB][12]$/.test(id)) return () => bridge.startDoppio(el);
            return null;
        }
        if (k === 'shotEnd') return bridge.startShotEnd ? () => bridge.startShotEnd() : null;
        if (k === 'shot') return () => bridge.startYellow();
        if (k === 'measure' || k === 'measureLabel') return () => bridge.startMeasure();
        return null;
    }

    function endDrag() {
        if (!dragCtx) return;
        try { primaryView.canvas.releasePointerCapture(dragCtx.pointerId); } catch (e) { /* ok */ }
        dragCtx = null;
        primaryView.canvas.classList.remove('is-grabbing');
    }

    primaryView.canvas.addEventListener('pointerdown', (evt) => {
        if (state.vista !== '3d' || window.drawingEnabled) return;
        if (evt.button !== undefined && evt.button > 0) return;
        const hit = pick(evt.clientX, evt.clientY, evt.pointerType);
        const action = dragActionFor(hit);
        if (!action) return;
        const v = primaryView;
        let planeZ = 0, offX = 0, offY = 0;
        if (hit.best.kind === 'player') {
            // il punto afferrato resta sotto il dito: piano alla quota di presa
            planeZ = Math.max(0, Math.min(PLAYER_H_M, hit.best.t * PLAYER_H_M));
            const g = v.canvasToSvg(hit.c.x, hit.c.y, planeZ);
            offX = hit.best.pk.svgX - g.x;
            offY = hit.best.pk.svgY - g.y;
        } else if (hit.best.kind === 'shotEnd') {
            // la pallina è sospesa sopra il punto di fine colpo: piano alla sua quota
            planeZ = hit.best.pk.z;
            const g = v.canvasToSvg(hit.c.x, hit.c.y, planeZ);
            offX = hit.best.pk.svgX - g.x;
            offY = hit.best.pk.svgY - g.y;
        } else if (hit.best.kind === 'measure' || hit.best.kind === 'measureLabel') {
            const el = document.getElementById('h-measure');
            const g = v.canvasToSvg(hit.c.x, hit.c.y, 0);
            if (el) offY = (parseFloat(el.getAttribute('y1')) || g.y) - g.y;
        }
        dragCtx = { planeZ, offX, offY, pointerId: evt.pointerId };
        try { v.canvas.setPointerCapture(evt.pointerId); } catch (e) { /* ok */ }
        v.canvas.classList.add('is-grabbing');
        action();
        evt.preventDefault();
        evt.stopPropagation();
    });
    window.addEventListener('pointerup', () => endDrag());
    window.addEventListener('pointercancel', () => endDrag());

    primaryView.canvas.addEventListener('pointermove', (evt) => {
        if (state.vista !== '3d' || dragCtx || evt.pointerType !== 'mouse') return;
        const hit = pick(evt.clientX, evt.clientY, 'mouse');
        primaryView.canvas.classList.toggle('is-grab', !!dragActionFor(hit));
    });

    // ======================================================================
    // Download (chiamato da app.js quando la vista 3D è attiva)
    // ======================================================================
    function download(downloadCanvas) {
        state.views.forEach(v => { if (v.resize()) render(v); });
        const mode = window.__modalita__;
        const sec = secondaryView && secondaryView.canvas.width && secondaryWrap &&
            secondaryWrap.offsetParent !== null ? secondaryView : null;
        const pickRadio = (names) => {
            for (const n of names) {
                const el = document.querySelector(`input[name="${n}"]:checked`);
                if (el) return el.value;
            }
            return null;
        };
        let which = 'primary';
        if (mode === '2colpi' && sec) {
            const type = pickRadio(['downloadType', 'downloadType_top']) || 'both';
            which = type === 'single' ? (pickRadio(['downloadCourt', 'downloadCourt_top']) || 'primary') : 'both';
        }
        const stamp = new Date().toISOString().slice(0, 10);
        if (which === 'both') {
            const a = primaryView.canvas, b = sec.canvas;
            const gap = Math.round(40 * primaryView.dpr);
            const out = document.createElement('canvas');
            out.width = a.width + b.width + gap;
            out.height = Math.max(a.height, b.height);
            const o = out.getContext('2d');
            o.fillStyle = '#ffffff';
            o.fillRect(0, 0, out.width, out.height);
            o.drawImage(a, 0, 0);
            o.drawImage(b, a.width + gap, 0);
            downloadCanvas(out, `geometry-of-tennis-3d-2colpi-${stamp}.png`);
            return;
        }
        const src = which === 'secondary' && sec ? sec.canvas : primaryView.canvas;
        downloadCanvas(src, `geometry-of-tennis-3d-${stamp}.png`);
    }

    // ---- API pubblica ----
    window.__court3d__ = {
        isActive: () => state.vista === '3d',
        setVista: (v) => setVista(v),
        clientToSvg,
        render: scheduleRender,
        download
    };

    setCamHeight(storageGet(STORAGE_CAM_KEY) || CAM_H_DEFAULT, false);
    positionControls();
    setVista(storageGet(STORAGE_KEY) === '3d' ? '3d' : '2d', false);
})();
