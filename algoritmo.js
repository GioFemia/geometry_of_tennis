/* ==========================================================================
   Geometry of Tennis — modalità Algoritmo

   Rischio del colpo mostrato nel campo principale, calcolato in tempo reale
   dalla sua geometria (colpitore, linea gialla, direzioni del colpitore) e
   dalle direzioni di risposta dell'avversario (window.__computeResponseGeometry__
   in app.js).

   Il motore (RiskAlgo) è quello del progetto got_algo (algoritmo.html, v1.7):
   stesse variabili, stesse normalizzazioni, stessi pesi adattivi. Qui la scheda
   mostra solo il risultato: Rischio colpo, Rischio tecnico e Rischio tattico.
   Il vantaggio tattico (Spostamento Avversario) non fa parte del rischio e non
   viene calcolato.

   Vista sul campo:
   - Direzioni: le direzioni del colpitore; passando sopra la fine del colpo
     (o trascinandola) si vedono in arancione le direzioni di risposta
     dell'avversario e il suo midpoint pesato.
   - Mappa del rischio: il cuneo fino alla profondità della fine del colpo è
     diviso in spicchi, colorati con il rischio del colpo giocato in quella
     direzione (Colpo, Tecnico o Tattico).
   ========================================================================== */
(function () {
    'use strict';

    const svg = document.getElementById('tennisCourt');
    const panel = document.getElementById('algoPanel');
    if (!svg || !panel) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const NET_Y = 486;
    const SVG_W = 600;

    // ======================================================================
    // Motore del rischio (funzione pura della geometria)
    //
    // Geometria `g` in coordinate SVG, con il colpitore nella metà in basso
    // (Campo A) e il colpo verso il Campo B; ogni linea è { x1, y1, x2, y2 }:
    //   dot     colpitore { x, y }
    //   yellow  traiettoria del colpo, dal colpitore alla fine del colpo
    //   sec     risposta dell'avversario dalla fine del colpo:
    //           { dot (colpitore), bis (midpoint pesato), left, right }
    // ======================================================================
    const RiskAlgo = (function () {
        const FIELD_B_ORIGIN_X = 300;
        const FIELD_B_ORIGIN_Y = 150;
        const FIELD_A_ORIGIN_Y = 822;

        // Rettangolo di Spazio Colpo: Campo B, X ±117 e Y 0–250
        const X_MIN_SVG = FIELD_B_ORIGIN_X - 117;
        const X_MAX_SVG = FIELD_B_ORIGIN_X + 117;
        const Y_MIN_SVG = FIELD_B_ORIGIN_Y;
        const Y_MAX_SVG_250 = FIELD_B_ORIGIN_Y + 250;

        const RANGES = {
            posizioneColpitore: { min: -180, max: 180 },
            altezzaRete: { min: 0, max: 100 },
            distanzaMidPoint: { min: 0, max: 200 },
            campoDaCoprire: { min: 250, max: 400 }
        };

        // Pesi adattivi: il peso di una feature cresce solo se il suo rischio è alto
        // (sopra 0.5). λ = intensità del boost, γ = quanto deve essere alto per contare.
        const WEIGHT_LAMBDA = 2;
        const WEIGHT_GAMMA = 2;

        // Cohen-Sutherland: clipping di un segmento in un rettangolo
        function clipLine(x1, y1, x2, y2, xMin, xMax, yMin, yMax) {
            const INSIDE = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
            function computeCode(x, y) {
                let code = INSIDE;
                if (x < xMin) code |= LEFT;
                else if (x > xMax) code |= RIGHT;
                if (y < yMin) code |= TOP;
                else if (y > yMax) code |= BOTTOM;
                return code;
            }
            let code1 = computeCode(x1, y1);
            let code2 = computeCode(x2, y2);
            while (true) {
                if (!(code1 | code2)) return { x1, y1, x2, y2, valid: true };
                if (code1 & code2) return { valid: false };
                let x, y;
                const codeOut = code1 ? code1 : code2;
                if (codeOut & BOTTOM) {
                    x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1);
                    y = yMax;
                } else if (codeOut & TOP) {
                    x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1);
                    y = yMin;
                } else if (codeOut & RIGHT) {
                    y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1);
                    x = xMax;
                } else {
                    y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1);
                    x = xMin;
                }
                if (codeOut === code1) {
                    x1 = x; y1 = y;
                    code1 = computeCode(x1, y1);
                } else {
                    x2 = x; y2 = y;
                    code2 = computeCode(x2, y2);
                }
            }
        }

        // X di una linea a una data Y (x1 se la linea è orizzontale)
        function xAtY(line, y) {
            if (Math.abs(line.y2 - line.y1) <= 0.001) return line.x1;
            const t = (y - line.y1) / (line.y2 - line.y1);
            return line.x1 + t * (line.x2 - line.x1);
        }

        // Traiettoria prolungata oltre la fine del colpo fino al bordo dell'SVG:
        // Spazio Colpo ed Errore Laterale misurano tutta la zona Y 0–250 del Campo B
        function extendToBorder(line) {
            let { x1, y1, x2, y2 } = line;
            if (Math.abs(y2 - y1) > 0.001) {
                const END_Y = (y1 > NET_Y) ? 0 : 1006;
                const t = (END_Y - y1) / (y2 - y1);
                x2 = x1 + t * (x2 - x1);
                y2 = END_Y;
            }
            return { x1, y1, x2, y2 };
        }

        function clipToSpazioColpo(x1, y1, x2, y2) {
            return clipLine(x1, y1, x2, y2, X_MIN_SVG, X_MAX_SVG, Y_MIN_SVG, Y_MAX_SVG_250);
        }

        function spazioColpoLength(x1, y1, x2, y2) {
            const c = clipToSpazioColpo(x1, y1, x2, y2);
            if (!c.valid) return 0;
            return Math.hypot(c.x2 - c.x1, c.y2 - c.y1);
        }

        // Min/Max dinamici di Spazio Colpo: 101 direzioni tra la linea sinistra e la destra
        // del colpitore. Dipende solo dal colpitore: vale per tutte le direzioni della mappa.
        function spazioColpoRange(dot, left, right) {
            const NUM_SAMPLES = 100;
            let min = Infinity, max = -Infinity;
            for (let i = 0; i <= NUM_SAMPLES; i++) {
                const t = i / NUM_SAMPLES;
                const targetX = left.x2 + t * (right.x2 - left.x2);
                const targetY = left.y2 + t * (right.y2 - left.y2);
                const spazio = spazioColpoLength(dot.x, dot.y, targetX, targetY);
                if (spazio > 0) {
                    if (spazio < min) min = spazio;
                    if (spazio > max) max = spazio;
                }
            }
            if (min === Infinity || max === -Infinity) return { min: 0, max: 0 };
            return { min, max };
        }

        function normalizeLinear(value, min, max) {
            if (max === min) return 0.5;
            return Math.max(0, Math.min(1, (value - min) / (max - min)));
        }

        // Concava (esponente 0.5): crescita rapida all'inizio
        function normalizeConcave(value, min, max) {
            if (max === min) return 0.5;
            if (value >= max) return 1;
            if (value <= min) return 0;
            return Math.pow((value - min) / (max - min), 0.5);
        }

        // Convessa (esponente 3): le variazioni vicino al massimo contano molto di più
        function normalizeSpazioColpo(value, min, max) {
            if (max === min) return 0.5;
            if (value >= max) return 1;
            if (value <= min) return 0;
            return Math.pow((value - min) / (max - min), 3);
        }

        // Smoothstep (3t² − 2t³): quasi zero se in posizione, ripida tra 50 e 150
        function normalizeDistanzaMidPoint(value, min, max) {
            if (max === min) return 0.5;
            if (value >= max) return 1;
            if (value <= min) return 0;
            const t = (value - min) / (max - min);
            return t * t * (3 - 2 * t);
        }

        function extremity(x) {
            return Math.max(0, 2 * x - 1);
        }

        function adaptiveWeightedMean(values, baseWeights) {
            const raw = values.map((x, i) => baseWeights[i] * (1 + WEIGHT_LAMBDA * Math.pow(extremity(x), WEIGHT_GAMMA)));
            const sum = raw.reduce((acc, w) => acc + w, 0);
            return values.reduce((acc, x, i) => acc + (raw[i] / sum) * x, 0);
        }

        // Rischio di un colpo, valori in [0, 1]. `spazioRange` viene da spazioColpoRange.
        function computeRisk(g, spazioRange) {
            // Posizione Colpitore: profondità nel Campo A (Y positiva verso la rete)
            const posizioneColpitore = FIELD_A_ORIGIN_Y - g.dot.y;

            // Spazio Colpo ed Errore Laterale: traiettoria clippata nel Campo B
            const ext = extendToBorder(g.yellow);
            const clipped = clipToSpazioColpo(ext.x1, ext.y1, ext.x2, ext.y2);
            let spazioColpo = 0;
            let erroreLaterale = 0;
            if (clipped.valid) {
                spazioColpo = Math.hypot(clipped.x2 - clipped.x1, clipped.y2 - clipped.y1);
                erroreLaterale = xAtY(clipped, (clipped.y1 + clipped.y2) / 2) - FIELD_B_ORIGIN_X;
            }

            // Altezza Rete: |X| in cui la traiettoria attraversa la rete
            const altezzaRete = Math.abs(xAtY(g.yellow, NET_Y) - FIELD_B_ORIGIN_X);

            // Distanza Mid Point: scostamento orizzontale del colpitore dalla linea del
            // midpoint pesato dell'avversario, alla Y del colpitore
            const distanzaMidPoint = Math.abs(g.sec.dot.x - xAtY(g.sec.bis, g.sec.dot.y));

            // Campo da Coprire: ampiezza tra le direzioni estreme dell'avversario, misurata a
            // Y = -30 se il colpitore è più avanti, a Y = -100 se è più indietro, altrimenti
            // alla Y del colpitore
            const dotYFieldA = FIELD_A_ORIGIN_Y - g.sec.dot.y;
            const targetYCampoA = dotYFieldA > -30 ? -30 : (dotYFieldA > -100 ? dotYFieldA : -100);
            const targetYSvg = FIELD_A_ORIGIN_Y - targetYCampoA;
            const campoDaCoprire = Math.abs(xAtY(g.sec.right, targetYSvg) - xAtY(g.sec.left, targetYSvg));

            const posizioneNorm = normalizeConcave(posizioneColpitore, RANGES.posizioneColpitore.min, RANGES.posizioneColpitore.max);
            const spazioNorm = normalizeSpazioColpo(spazioColpo, spazioRange.min, spazioRange.max);
            const lateraleNorm = normalizeLinear(Math.abs(erroreLaterale), 0, 117);
            const reteNorm = normalizeLinear(altezzaRete, RANGES.altezzaRete.min, RANGES.altezzaRete.max);
            const midPointNorm = normalizeDistanzaMidPoint(distanzaMidPoint, RANGES.distanzaMidPoint.min, RANGES.distanzaMidPoint.max);
            const campoNorm = normalizeConcave(campoDaCoprire, RANGES.campoDaCoprire.min, RANGES.campoDaCoprire.max);

            // Rischio Tecnico: pesi base 0.3 / 0.3 / 0.3 / 0.1 (contributi allineati:
            // 1 − x dove un valore alto della variabile è vantaggioso)
            const tecnico = adaptiveWeightedMean(
                [1 - posizioneNorm, 1 - spazioNorm, lateraleNorm, reteNorm],
                [0.3, 0.3, 0.3, 0.1]
            );
            // Rischio Tattico: esposizione del colpitore dopo il colpo, pesi base 0.4 / 0.3
            const tattico = adaptiveWeightedMean([midPointNorm, campoNorm], [0.4, 0.3]);
            // Rischio Colpo: tecnico e tattico, pesi base 0.5 / 0.5 modulati dall'estremità
            const colpo = adaptiveWeightedMean([tecnico, tattico], [0.5, 0.5]);

            return { colpo, tecnico, tattico };
        }

        return { computeRisk, spazioColpoRange, xAtY };
    })();
    window.__gotRiskAlgo__ = RiskAlgo;

    // ======================================================================
    // Geometria dal campo principale
    // ======================================================================
    const els = {
        dot: document.getElementById('cursorDot'),
        yellow: document.getElementById('yellowLine'),
        left: document.getElementById('leftLine'),
        right: document.getElementById('rightLine'),
        bis: document.getElementById('bisectorLine'),
        wedge: document.getElementById('wedgeFill'),
        shotEnd: document.getElementById('shotEndHandle')
    };

    function num(el, a) { return el ? parseFloat(el.getAttribute(a)) : NaN; }
    function dotOf(el) { return { x: num(el, 'cx'), y: num(el, 'cy') }; }
    function lineOf(el) { return { x1: num(el, 'x1'), y1: num(el, 'y1'), x2: num(el, 'x2'), y2: num(el, 'y2') }; }
    function finite(o) { return Object.values(o).every(Number.isFinite); }

    // Il motore lavora con il colpitore in basso. Se colpisce l'avversario (metà in alto),
    // la geometria si ruota di 180° attorno al centro del campo: è un'isometria che porta
    // il campo in sé, quindi distanze e valori assoluti non cambiano.
    function rotP(p) { return { x: SVG_W - p.x, y: 2 * NET_Y - p.y }; }
    function rotL(l) { return { x1: SVG_W - l.x1, y1: 2 * NET_Y - l.y1, x2: SVG_W - l.x2, y2: 2 * NET_Y - l.y2 }; }

    // Stato del colpo letto dall'SVG; null se manca qualcosa
    function readCourt() {
        const missing = [];
        const dot = dotOf(els.dot);
        const yellow = lineOf(els.yellow);
        const left = lineOf(els.left);
        const right = lineOf(els.right);
        if (!finite(dot)) missing.push('colpitore');
        if (!finite(yellow)) missing.push('traiettoria del colpo');
        if (!finite(left)) missing.push('direzione sinistra');
        if (!finite(right)) missing.push('direzione destra');
        if (typeof window.__computeResponseGeometry__ !== 'function') missing.push('direzioni dell\'avversario');
        if (missing.length) return { missing };
        if (Math.abs(yellow.y2 - dot.y) < 1) return { missing: ['traiettoria del colpo'] };
        const flip = dot.y < NET_Y;
        const base = flip
            ? { dot: rotP(dot), left: rotL(left), right: rotL(right) }
            : { dot, left, right };
        return {
            dot, yellow, left, right, flip,
            spazioRange: RiskAlgo.spazioColpoRange(base.dot, base.left, base.right)
        };
    }

    // Geometria del colpo verso (endX, endY), con la risposta dell'avversario da lì
    function shotGeometry(court, endX, endY) {
        const resp = window.__computeResponseGeometry__(endX, endY);
        const from = (x) => ({ x1: endX, y1: endY, x2: x, y2: resp.endY });
        const g = {
            dot: court.dot,
            yellow: { x1: court.dot.x, y1: court.dot.y, x2: endX, y2: endY },
            sec: { dot: court.dot, bis: from(resp.bisEndX), left: from(resp.leftEndX), right: from(resp.rightEndX) }
        };
        if (!court.flip) return { g, resp };
        return {
            g: {
                dot: rotP(g.dot),
                yellow: rotL(g.yellow),
                sec: { dot: rotP(g.sec.dot), bis: rotL(g.sec.bis), left: rotL(g.sec.left), right: rotL(g.sec.right) }
            },
            resp
        };
    }

    function riskAt(court, endX, endY) {
        return RiskAlgo.computeRisk(shotGeometry(court, endX, endY).g, court.spazioRange);
    }

    // ======================================================================
    // Elementi SVG della modalità (creati qui per non toccare il campo negli altri modi).
    // La visibilità usa stili inline: court3d.js li rispetta e ridisegna la vista 3D.
    // ======================================================================
    function svgEl(tag, attrs) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
        return el;
    }

    const OPP_COLOR = '#ff9100';
    const oppG = svgEl('g', { id: 'algoOppView', 'pointer-events': 'none' });
    const oppWedge = svgEl('polygon', { fill: OPP_COLOR, 'fill-opacity': '0.2' });
    const oppLeft = svgEl('line', { stroke: OPP_COLOR, 'stroke-width': '3', 'stroke-linecap': 'round' });
    const oppRight = svgEl('line', { stroke: OPP_COLOR, 'stroke-width': '3', 'stroke-linecap': 'round' });
    const oppBis = svgEl('line', { stroke: OPP_COLOR, 'stroke-width': '2', 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' });
    [oppWedge, oppLeft, oppRight, oppBis].forEach((el) => oppG.appendChild(el));
    oppG.style.display = 'none';

    const mapG = svgEl('g', { id: 'algoRiskMap', 'pointer-events': 'none' });
    const slicesG = svgEl('g', { opacity: '0.96' });
    // Contorno scuro sotto la linea gialla, che sul chiaro della mappa si perderebbe
    const shotOutline = svgEl('line', { stroke: '#0f1b2d', 'stroke-width': '7', 'stroke-linecap': 'round', opacity: '0.75' });
    mapG.appendChild(slicesG);
    mapG.appendChild(shotOutline);
    mapG.style.display = 'none';

    // Ordine: direzioni avversario e mappa sotto le linee del colpitore e la linea gialla
    const anchor = els.left || els.wedge;
    if (els.wedge && els.wedge.parentNode === svg) svg.insertBefore(oppG, els.wedge);
    else svg.insertBefore(oppG, anchor);
    svg.insertBefore(mapG, anchor);

    // ======================================================================
    // Scheda
    // ======================================================================
    const ui = {
        error: document.getElementById('algoError'),
        results: document.getElementById('algoResults'),
        score: document.getElementById('algoScore'),
        colpo: document.getElementById('algoColpo'),
        arc: document.getElementById('algoGaugeArc'),
        colpoMeter: document.getElementById('algoColpoMeter'),
        level: document.getElementById('algoLevel'),
        tecnicoCard: document.getElementById('algoTecnicoCard'),
        tecnico: document.getElementById('algoTecnico'),
        tecnicoMeter: document.getElementById('algoTecnicoMeter'),
        tatticoCard: document.getElementById('algoTatticoCard'),
        tattico: document.getElementById('algoTattico'),
        tatticoMeter: document.getElementById('algoTatticoMeter'),
        viewSeg: document.getElementById('algoViewSeg'),
        metricSeg: document.getElementById('algoMetricSeg'),
        legend: document.getElementById('algoMapLegend'),
        mapMin: document.getElementById('algoMapMin'),
        mapMax: document.getElementById('algoMapMax'),
        mapShot: document.getElementById('algoMapShot'),
        scaleMark: document.getElementById('algoScaleMark')
    };

    const LEVEL_LABEL = { basso: 'Rischio basso', medio: 'Rischio medio', alto: 'Rischio alto' };
    function levelOf(v10) { return v10 < 3.5 ? 'basso' : (v10 < 6.5 ? 'medio' : 'alto'); }
    function fmt(v) { return (Math.max(0, Math.min(1, v)) * 10).toFixed(1); }

    function setText(el, text) { if (el && el.textContent !== text) el.textContent = text; }

    function showError(missing) {
        if (ui.error) {
            ui.error.textContent = 'Impossibile calcolare il rischio: mancano dati per ' + missing.join(', ') + '.';
            ui.error.hidden = false;
        }
        if (ui.results) ui.results.hidden = true;
    }

    function renderResult(r) {
        if (ui.error) ui.error.hidden = true;
        if (ui.results) ui.results.hidden = false;
        const colpo10 = Math.max(0, Math.min(10, r.colpo * 10));
        const lv = levelOf(colpo10);
        setText(ui.colpo, fmt(r.colpo));
        if (ui.arc) ui.arc.setAttribute('stroke-dashoffset', String(100 - colpo10 * 10));
        if (ui.colpoMeter) ui.colpoMeter.style.width = (colpo10 * 10) + '%';
        if (ui.score) ui.score.dataset.level = lv;
        setText(ui.level, LEVEL_LABEL[lv]);
        [[r.tecnico, ui.tecnico, ui.tecnicoMeter, ui.tecnicoCard],
         [r.tattico, ui.tattico, ui.tatticoMeter, ui.tatticoCard]].forEach(([v, valueEl, meterEl, card]) => {
            const v10 = Math.max(0, Math.min(10, v * 10));
            setText(valueEl, fmt(v));
            if (meterEl) meterEl.style.width = (v10 * 10) + '%';
            if (card) card.dataset.level = levelOf(v10);
        });
    }

    // ======================================================================
    // Mappa del rischio
    // ======================================================================
    const SLICES = 80;
    // Scala assoluta 0–10 su un solo colore: rosa chiaro (0) → bordeaux (10).
    // Stessi valori del gradiente .algo-scale-bar in algoritmo.css.
    const STOPS = [
        [0, [255, 236, 232]],
        [0.35, [248, 164, 154]],
        [0.65, [222, 62, 66]],
        [1, [105, 10, 30]]
    ];
    function riskColor(v) {
        const x = Math.max(0, Math.min(1, v));
        let i = 1;
        while (i < STOPS.length - 1 && x > STOPS[i][0]) i++;
        const a = STOPS[i - 1], b = STOPS[i];
        const t = (x - a[0]) / (b[0] - a[0]);
        return 'rgb(' + a[1].map((ch, k) => Math.round(ch + t * (b[1][k] - ch))).join(',') + ')';
    }

    const polys = [];
    function drawMap(court) {
        const recvY = court.yellow.y2;
        const xA = RiskAlgo.xAtY(court.left, recvY);
        const xB = RiskAlgo.xAtY(court.right, recvY);
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < SLICES; i++) {
            const x0 = xA + (xB - xA) * i / SLICES;
            const x1 = xA + (xB - xA) * (i + 1) / SLICES;
            const v = riskAt(court, (x0 + x1) / 2, recvY)[state.metric];
            if (v < min) min = v;
            if (v > max) max = v;
            if (!polys[i]) {
                polys[i] = svgEl('polygon', { 'stroke-width': '0.8', 'stroke-linejoin': 'round' });
                slicesG.appendChild(polys[i]);
            }
            const color = riskColor(v);
            polys[i].setAttribute('points', `${court.dot.x},${court.dot.y} ${x0},${recvY} ${x1},${recvY}`);
            polys[i].setAttribute('fill', color);
            polys[i].setAttribute('stroke', color);
        }
        ['x1', 'y1', 'x2', 'y2'].forEach((a) => shotOutline.setAttribute(a, String(court.yellow[a])));
        // In 3D la linea gialla diventa un arco: il contorno a terra non serve
        shotOutline.style.display = document.body.classList.contains('vista-3d') ? 'none' : '';

        const shot = riskAt(court, court.yellow.x2, recvY)[state.metric];
        setText(ui.mapMin, fmt(min));
        setText(ui.mapMax, fmt(max));
        setText(ui.mapShot, fmt(shot));
        if (ui.scaleMark) ui.scaleMark.style.left = (Math.max(0, Math.min(1, shot)) * 100) + '%';
    }

    // ======================================================================
    // Direzioni di risposta dell'avversario (dalla fine del colpo)
    // ======================================================================
    function drawOppView(court) {
        const x = court.yellow.x2, y = court.yellow.y2;
        const resp = window.__computeResponseGeometry__(x, y);
        const set = (el, x2) => {
            el.setAttribute('x1', String(x)); el.setAttribute('y1', String(y));
            el.setAttribute('x2', String(x2)); el.setAttribute('y2', String(resp.endY));
        };
        set(oppLeft, resp.leftEndX);
        set(oppRight, resp.rightEndX);
        set(oppBis, resp.bisEndX);
        oppWedge.setAttribute('points', `${x},${y} ${resp.leftEndX},${resp.endY} ${resp.rightEndX},${resp.endY}`);
    }

    // ======================================================================
    // Stato, visibilità e aggiornamento
    // ======================================================================
    const STORAGE_VIEW = 'got_algo_vista';
    const STORAGE_METRIC = 'got_algo_metrica';
    function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ok */ } }

    const METRICS = ['colpo', 'tecnico', 'tattico'];
    const state = {
        active: false,
        view: storageGet(STORAGE_VIEW) === 'mappa' ? 'mappa' : 'direzioni',
        metric: METRICS.indexOf(storageGet(STORAGE_METRIC)) >= 0 ? storageGet(STORAGE_METRIC) : 'colpo',
        hoverShotEnd: false
    };

    function isAlgoMode() {
        return window.__modalita__ === 'algoritmo' && document.body.classList.contains('mobile-algoritmo');
    }

    function bridgeDraggingShotEnd() {
        const b = window.__gotDragBridge__;
        return !!(b && typeof b.isDraggingShotEnd === 'function' && b.isDraggingShotEnd());
    }

    // Stili inline applicati agli elementi del campo: si annullano uscendo dalla modalità
    function setVis(el, hidden) {
        if (!el) return;
        const v = hidden ? 'hidden' : '';
        if (el.style.visibility !== v) el.style.visibility = v;
    }

    function applyVisibility() {
        const mapOn = state.active && state.view === 'mappa';
        const oppOn = state.active && state.view === 'direzioni' && (state.hoverShotEnd || bridgeDraggingShotEnd());
        const mapDisplay = mapOn ? '' : 'none';
        if (mapG.style.display !== mapDisplay) mapG.style.display = mapDisplay;
        const oppDisplay = oppOn ? '' : 'none';
        if (oppG.style.display !== oppDisplay) oppG.style.display = oppDisplay;
        setVis(els.wedge, mapOn || oppOn);
        [els.left, els.right, els.bis, els.yellow].forEach((el) => setVis(el, oppOn));
        panel.classList.toggle('is-opp-view', oppOn);
        return { mapOn, oppOn };
    }

    let lastKey = '';
    function update() {
        frame = null;
        const vis = applyVisibility();
        if (!state.active) return;
        const court = readCourt();
        if (court.missing) {
            lastKey = '';
            showError(court.missing);
            return;
        }
        // Salta il ricalcolo se nulla è cambiato (app.js riscrive gli attributi a ogni mousemove)
        const key = [
            court.dot.x, court.dot.y, court.yellow.x2, court.yellow.y2,
            court.left.x2, court.left.y2, court.right.x2, court.right.y2,
            window.__shotType2IsPassante__ ? 1 : 0, state.metric,
            vis.mapOn ? 1 : 0, vis.oppOn ? 1 : 0,
            document.body.classList.contains('vista-3d') ? 1 : 0
        ].map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)).join('|');
        if (key === lastKey) return;
        lastKey = key;

        renderResult(riskAt(court, court.yellow.x2, court.yellow.y2));
        if (vis.mapOn) drawMap(court);
        if (vis.oppOn) drawOppView(court);
    }

    let frame = null;
    function schedule() {
        if (frame !== null) return;
        frame = requestAnimationFrame(update);
    }
    function forceUpdate() {
        lastKey = '';
        schedule();
    }

    function setPressed(seg, attr, value) {
        if (!seg) return;
        seg.querySelectorAll('button').forEach((b) => {
            b.setAttribute('aria-pressed', String(b.dataset[attr] === value));
        });
    }

    function setView(view, persist) {
        state.view = view === 'mappa' ? 'mappa' : 'direzioni';
        setPressed(ui.viewSeg, 'view', state.view);
        const map = state.view === 'mappa';
        if (ui.metricSeg) ui.metricSeg.hidden = !map;
        if (ui.legend) ui.legend.hidden = !map;
        panel.classList.toggle('is-map', map);
        if (persist) storageSet(STORAGE_VIEW, state.view);
        forceUpdate();
    }

    function setMetric(metric, persist) {
        state.metric = METRICS.indexOf(metric) >= 0 ? metric : 'colpo';
        setPressed(ui.metricSeg, 'metric', state.metric);
        if (persist) storageSet(STORAGE_METRIC, state.metric);
        forceUpdate();
    }

    if (ui.viewSeg) {
        ui.viewSeg.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-view]');
            if (b) setView(b.dataset.view, true);
        });
    }
    if (ui.metricSeg) {
        ui.metricSeg.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-metric]');
            if (b) setMetric(b.dataset.metric, true);
        });
    }

    // Attivazione: segue la classe della modalità sul body (cambio modalità, guida, doppio)
    function syncActive() {
        const on = isAlgoMode();
        if (on === state.active) return;
        state.active = on;
        if (!on) state.hoverShotEnd = false;
        panel.setAttribute('aria-hidden', on ? 'false' : 'true');
        forceUpdate();
    }

    // Il campo cambia: colpitore, traiettoria, direzioni
    const geomObserver = new MutationObserver(() => { if (state.active) schedule(); });
    [els.dot, els.yellow, els.left, els.right].forEach((el) => {
        if (el) geomObserver.observe(el, { attributes: true, attributeFilter: ['cx', 'cy', 'x1', 'y1', 'x2', 'y2'] });
    });
    // Modalità (classe sul body) e vista 2D/3D
    new MutationObserver(() => { syncActive(); if (state.active) schedule(); })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // Tipologia (Attacco cambia la risposta dell'avversario), colpitore, modalità
    document.addEventListener('change', () => { syncActive(); if (state.active) forceUpdate(); });

    // Direzioni dell'avversario: passaggio sulla fine del colpo o trascinamento (anche in 3D)
    if (els.shotEnd) {
        els.shotEnd.addEventListener('pointerenter', () => { state.hoverShotEnd = true; if (state.active) schedule(); });
        els.shotEnd.addEventListener('pointerleave', () => { state.hoverShotEnd = false; if (state.active) schedule(); });
        els.shotEnd.addEventListener('pointerdown', () => { if (state.active) schedule(); });
    }
    window.addEventListener('pointermove', () => {
        if (state.active && (bridgeDraggingShotEnd() || panel.classList.contains('is-opp-view'))) schedule();
    }, { passive: true });
    window.addEventListener('pointerup', () => { if (state.active) schedule(); });
    window.addEventListener('pointercancel', () => { if (state.active) schedule(); });

    setView(state.view, false);
    setMetric(state.metric, false);
    syncActive();
    if (document.readyState !== 'complete') window.addEventListener('load', () => { syncActive(); forceUpdate(); });
})();
