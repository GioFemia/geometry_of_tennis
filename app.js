(function () {
            const svg = document.getElementById('tennisCourt');
            if (!svg) return;
            
            const dot = document.getElementById('cursorDot');
            const intersectionDot = document.getElementById('intersectionDot');
            const leftLine = document.getElementById('leftLine');
            const rightLine = document.getElementById('rightLine');
            const bisectorLine = document.getElementById('bisectorLine');
            const yellowLine = document.getElementById('yellowLine');
            const wedge = document.getElementById('wedgeFill');
            const hMeasure = document.getElementById('h-measure');
            const hMeasureLabel = document.getElementById('h-measure-label');
            const hMeasureBadge = document.getElementById('h-measure-badge');
            const arrowHtml = document.getElementById('measureArrowHtml');
            const chkDirections = document.getElementById('view_directions');
            const chkPlayer = document.getElementById('view_player');
            const chkShot = document.getElementById('view_shot');
            const chkResponder = document.getElementById('view_responder');
            const chkCover = document.getElementById('view_cover');
            const chkZones = document.getElementById('view_zones');
            const chkCenter = document.getElementById('view_center');
            const chkCoordinates = document.getElementById('view_coordinates');
            const tooltip = document.getElementById('coordinateTooltip');
            // Zone del Campo elements
            const zoneLine1 = document.getElementById('zone-line-1');
            const zoneLine2 = document.getElementById('zone-line-2');
            const zoneLine3 = document.getElementById('zone-line-3');
            const zoneCircleA = document.getElementById('zone-circle-a');
            const zoneLabelA = document.getElementById('zone-label-a');
            const zoneCircleB = document.getElementById('zone-circle-b');
            const zoneLabelB = document.getElementById('zone-label-b');
            const zoneCircleC = document.getElementById('zone-circle-c');
            const zoneLabelC = document.getElementById('zone-label-c');
            const zoneCircleD = document.getElementById('zone-circle-d');
            const zoneLabelD = document.getElementById('zone-label-d');
            const zoneLineA1 = document.getElementById('zone-line-a-1');
            const zoneLineA2 = document.getElementById('zone-line-a-2');
            const zoneLineA3 = document.getElementById('zone-line-a-3');
            const zoneCircleAFieldA = document.getElementById('zone-circle-a-field-a');
            const zoneLabelAFieldA = document.getElementById('zone-label-a-field-a');
            const zoneCircleBFieldA = document.getElementById('zone-circle-b-field-a');
            const zoneLabelBFieldA = document.getElementById('zone-label-b-field-a');
            const zoneCircleCFieldA = document.getElementById('zone-circle-c-field-a');
            const zoneLabelCFieldA = document.getElementById('zone-label-c-field-a');
            const zoneCircleDFieldA = document.getElementById('zone-circle-d-field-a');
            const zoneLabelDFieldA = document.getElementById('zone-label-d-field-a');
            const fieldBCoords = document.getElementById('fieldB-coords');
            const fieldACoords = document.getElementById('fieldA-coords');
            const tooltipFieldB = document.getElementById('tooltip-field-b');
            const tooltipFieldA = document.getElementById('tooltip-field-a');
            const courtLockOverlay = document.getElementById('courtLockOverlay');
            const doppioA1 = document.getElementById('doppioA1');
            const doppioA2 = document.getElementById('doppioA2');
            const doppioB1 = document.getElementById('doppioB1');
            const doppioB2 = document.getElementById('doppioB2');
            const doppioDots = [doppioA1, doppioA2, doppioB1, doppioB2];
            const dinamicoPanel = document.getElementById('dinamicoPanel');
            const numeroColpoInput = document.getElementById('numeroColpo');
            const colpoButton = document.getElementById('colpoButton');
            const prevColpoButton = document.getElementById('prevColpoButton');
            const nextColpoButton = document.getElementById('nextColpoButton');
            const ultimoColpoCheckbox = document.getElementById('ultimoColpoCheckbox');
            const visualizzaScambioButton = document.getElementById('visualizzaScambioButton');
            const pauseResumeButton = document.getElementById('pauseResumeButton');
            const nuovoScambioButton = document.getElementById('nuovoScambioButton');
            const colpitoreAlertContinue = document.getElementById('colpitoreAlertContinue');
            const controlsSidebar = document.querySelector('.controls-sidebar');
            const settingsTitleTrigger = document.querySelector('.settings-title');
            const mobilePanelToggle = document.getElementById('mobilePanelToggle');
            const dinamicoMobileToggle = document.getElementById('dinamicoMobileToggle');
            const bodyEl = document.body;
            const rootEl = document.documentElement;
            const primaryCourt = document.querySelector('.court-container.primary-court');

            const COURT_X_MIN = 146;
            const COURT_X_MAX = 454;
            const COURT_Y_MIN = 150;
            const COURT_Y_MAX = 822;
            const NET_Y = 486;
            const ORIGIN_X = 300;
            const ORIGIN_TOP_Y = 150;
            const ORIGIN_BOTTOM_Y = 822;
            const SVG_X_MIN = 0;
            const SVG_X_MAX = 600;
            const SVG_Y_MIN = 0;
            const SVG_Y_MAX = 1006;
            const LEFT_X_SVG = ORIGIN_X - 115;
            const RIGHT_X_SVG = ORIGIN_X + 115;
            const END_Y_TOP = 0;
            const END_Y_BOTTOM = SVG_Y_MAX;
            const COLOR_PALLEGGIO = '#1976d2';
            const COLOR_PASSANTE = '#d32f2f';
            const MOBILE_BREAKPOINT = 900;
            const TOUCH_PICK_RADIUS = 38;
            const TOUCH_LINE_THRESHOLD = 20;
            const MOBILE_DINAMICO_DESIRED_GAP = 12;
            const RECEIVER_DOT_RADIUS = 8;
            const COVER_BADGE_TEXT_HEIGHT = 22;
            const COVER_BADGE_VERTICAL_MARGIN = 6;
            
            // Coordinate system origins
            const FIELD_B_ORIGIN_X = 300; // Center of top horizontal line
            const FIELD_B_ORIGIN_Y = 150; // Top horizontal line
            const FIELD_A_ORIGIN_X = 300; // Center of bottom horizontal line  
            const FIELD_A_ORIGIN_Y = 822; // Bottom horizontal line

            // Doubles default positions (in field coordinates → SVG)
            const DOPPIO_A1_DEFAULT = { x: FIELD_A_ORIGIN_X + 80, y: FIELD_A_ORIGIN_Y + 20 };   // Campo A (80, -20)
            const DOPPIO_A2_DEFAULT = { x: FIELD_A_ORIGIN_X - 60, y: FIELD_A_ORIGIN_Y - 240 };   // Campo A (-60, 240)
            const DOPPIO_B1_DEFAULT = { x: FIELD_B_ORIGIN_X - 80, y: FIELD_B_ORIGIN_Y - 20 };    // Campo B (-80, -20)
            const DOPPIO_B2_DEFAULT = { x: FIELD_B_ORIGIN_X + 60, y: FIELD_B_ORIGIN_Y + 240 };   // Campo B (60, 240)

            let currentMeasureY = ORIGIN_TOP_Y - 50;
            let draggingArrow = false;
            let isPlayer = true;
            let draggingDot = false;
            let draggingYellow = false;
            let draggingIntersection = false;
            let yellowEndX = null;
            window.__shotTypeIsPassante__ = false;
            window.__shotType2IsPassante__ = false;
            window.__leftForceRed__ = false; // in modalità attacco: rosso solo come colore, non come logica
            window.__shotTypeIsServizio__ = false;
            window.__viewDirections__ = true;
            window.__viewPlayer__ = true;
            window.__viewShot__ = true;
            window.__viewResponder__ = true;
            window.__viewCover__ = false;
            window.__viewZones__ = false;
            window.__viewCenter__ = true;
            window.__viewCoordinates__ = false;
            window.__modalita__ = '2colpi';
            window.__gioco__ = 'singolare';
            window.__doppioColpitore__ = 'giocatore1';
            window.__numeroColpo__ = 1;
            let isMobileLayout = false;
            let mobileSettingsOpen = false;
            let isMobileSecondaryVisible = false;
            let isMobileDinamicoPanelOpen = false;
            let mobileCourtGapRaf = null;
            let dinamicoPanelResizeObserver = null;
            
            // Variabile per memorizzare il cerchietto del colpo precedente
            let previousShotDot = null;
            
            // Variabile per memorizzare la tipologia prima del cambio automatico
            let savedTipologiaBeforeServizio = 'palleggio';
            
            // Variabile per tracciare se il colpo precedente era attacco o passante
            let previousShotWasAttacco = false;
            let previousShotWasPassante = false;
            
            // Array per memorizzare tutte le sequenze di colpi per la visualizzazione
            let shotSequence = [];
            
            // Array per memorizzare lo stato completo di ogni colpo (per navigazione)
            let shotHistory = [];
            
            // Variabili per gestire l'ultimo colpo e la fine del punto
            let puntoFinito = false;
            let elementiVisibiliPrimaFinePunto = {};
            
            // Variabili per gestire la pausa durante VISUALIZZA PUNTO
            let animazionePausata = false;
            let animazioneInCorso = false;
            let riprendiAnimazione = null; // Funzione callback per riprendere l'animazione
            
            const COURT_COLORS = {
                cemento: { background: '#1565c0', court: '#42a5f5' },
                terra: { background: '#c62828', court: '#e57373' },
                erba: { background: '#2e7d32', court: '#66bb6a' }
            };
            window.__currentCourtType__ = 'cemento';

            // Coordinate calculation functions
            function calculateFieldBCoordinates(x, y) {
                // Campo B: origin at top horizontal line center (300, 150)
                // X: positive right, negative left
                // Y: positive down, negative up
                const fieldB_x = x - FIELD_B_ORIGIN_X;
                const fieldB_y = y - FIELD_B_ORIGIN_Y;
                return { x: fieldB_x, y: fieldB_y };
            }

            function calculateFieldACoordinates(x, y) {
                // Campo A: origin at bottom horizontal line center (300, 822)
                // X: positive right, negative left  
                // Y: positive up, negative down
                const fieldA_x = x - FIELD_A_ORIGIN_X;
                const fieldA_y = FIELD_A_ORIGIN_Y - y; // Inverted Y for Campo A
                return { x: fieldA_x, y: fieldA_y };
            }

            function updateCoordinateTooltip(x, y, clientX, clientY) {
                if (!tooltip || !fieldBCoords || !fieldACoords || !tooltipFieldB || !tooltipFieldA) return;
                
                // Check if coordinates should be shown
                if (!window.__viewCoordinates__) {
                    tooltip.style.display = 'none';
                    return;
                }
                
                // Determine which field the cursor is in based on position relative to net
                const isAboveNet = y < NET_Y;
                
                // Show only the relevant field row, hide the other
                if (isAboveNet) {
                    // Cursor is in Campo B (above net)
                    const fieldB = calculateFieldBCoordinates(x, y);
                    fieldBCoords.textContent = `X: ${Math.round(fieldB.x)}, Y: ${Math.round(fieldB.y)}`;
                    tooltipFieldB.style.display = 'flex';
                    tooltipFieldA.style.display = 'none';
                } else {
                    // Cursor is in Campo A (below net)
                    const fieldA = calculateFieldACoordinates(x, y);
                    fieldACoords.textContent = `X: ${Math.round(fieldA.x)}, Y: ${Math.round(fieldA.y)}`;
                    tooltipFieldB.style.display = 'none';
                    tooltipFieldA.style.display = 'flex';
                }
                
                // Smart positioning to avoid screen edges
                const tooltipRect = tooltip.getBoundingClientRect();
                const offset = 10;
                let left = clientX;
                let top = clientY - offset;
                
                // Adjust horizontal position if tooltip would go off screen
                if (left + tooltipRect.width > window.innerWidth) {
                    left = clientX - tooltipRect.width - offset;
                }
                
                // Adjust vertical position if tooltip would go off screen
                if (top < 0) {
                    top = clientY + offset;
                    tooltip.style.transform = 'translate(-50%, 0)';
                } else {
                    tooltip.style.transform = 'translate(-50%, -100%)';
                }
                
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
                tooltip.style.display = 'block';
            }

            function setLineToYEnd(lineEl, x0, y0, x1, y1, endYSvg) {
                if (!lineEl) return;
                const dx = x1 - x0;
                const dy = y1 - y0;
                const EPS = 1e-6;
                const denom = Math.abs(dy) < EPS ? (dy >= 0 ? EPS : -EPS) : dy;
                const t = (endYSvg - y0) / denom;
                const xEnd = x0 + t * dx;
                lineEl.setAttribute('x1', String(x0));
                lineEl.setAttribute('y1', String(y0));
                lineEl.setAttribute('x2', String(xEnd));
                lineEl.setAttribute('y2', String(endYSvg));
                return xEnd;
            }

            function setBisectorToYEnd(lineEl, x0, y0, passYSvg, endYSvg) {
                if (!lineEl) return;
                const EPS = 1e-6;
                const vLx = LEFT_X_SVG - x0;
                const vLy = passYSvg - y0;
                const vRx = RIGHT_X_SVG - x0;
                const vRy = passYSvg - y0;
                const lenL = Math.hypot(vLx, vLy) || EPS;
                const lenR = Math.hypot(vRx, vRy) || EPS;
                const ux = vLx / lenL + vRx / lenR;
                const uy = vLy / lenL + vRy / lenR;
                let xEnd;
                if (Math.abs(uy) < EPS) {
                    xEnd = x0;
                } else {
                    const t = (endYSvg - y0) / uy;
                    xEnd = x0 + t * ux;
                }
                lineEl.setAttribute('x1', String(x0));
                lineEl.setAttribute('y1', String(y0));
                lineEl.setAttribute('x2', String(xEnd));
                lineEl.setAttribute('y2', String(endYSvg));
            }

            function computeIntersectionX(x0, y0, xT, yT, yH) {
                const dx = xT - x0;
                const dy = yT - y0;
                const EPS = 1e-6;
                const denom = Math.abs(dy) < EPS ? (dy >= 0 ? EPS : -EPS) : dy;
                const t = (yH - y0) / denom;
                return x0 + t * dx;
            }

            function distancePointToSegment(px, py, x1, y1, x2, y2) {
                const dx = x2 - x1;
                const dy = y2 - y1;
                if (dx === 0 && dy === 0) {
                    return Math.hypot(px - x1, py - y1);
                }
                const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
                const clampedT = Math.max(0, Math.min(1, t));
                const projX = x1 + clampedT * dx;
                const projY = y1 + clampedT * dy;
                return Math.hypot(px - projX, py - projY);
            }

            function computeBisectorXAtY(x0, y0, passYSvg, yH, leftAnchorX, leftAnchorY, rightAnchorX, rightAnchorY) {
                const EPS = 1e-6;
                const lX = (leftAnchorX === undefined) ? LEFT_X_SVG : leftAnchorX;
                const lY = (leftAnchorY === undefined) ? passYSvg : leftAnchorY;
                const rX = (rightAnchorX === undefined) ? RIGHT_X_SVG : rightAnchorX;
                const rY = (rightAnchorY === undefined) ? passYSvg : rightAnchorY;
                const vLx = lX - x0;
                const vLy = lY - y0;
                const vRx = rX - x0;
                const vRy = rY - y0;
                const lenL = Math.hypot(vLx, vLy) || EPS;
                const lenR = Math.hypot(vRx, vRy) || EPS;
                const ux = vLx / lenL + vRx / lenR;
                const uy = vLy / lenL + vRy / lenR;
                if (Math.abs(uy) < EPS) return x0;
                const t = (yH - y0) / uy;
                return x0 + t * ux;
            }

            function updateHorizontalMeasure(dotX, dotY, targets, yH, leftPassX, leftPassY, rightPassX, rightPassY) {
                if (!hMeasure || !hMeasureLabel) return;
                
                // Use provided coordinates or defaults
                if (leftPassX === undefined) leftPassX = LEFT_X_SVG;
                if (leftPassY === undefined) leftPassY = targets.left;
                if (rightPassX === undefined) rightPassX = RIGHT_X_SVG;
                if (rightPassY === undefined) rightPassY = targets.right;
                
                let xLeft, xRight;
                if (window.__shotTypeIsServizio__) {
                    // Servizio mode: use the actual target points
                    xLeft = computeIntersectionX(dotX, dotY, targets.left.x, targets.left.y, yH);
                    xRight = computeIntersectionX(dotX, dotY, targets.right.x, targets.right.y, yH);
                } else {
                    // Normal mode: use provided coordinates (which may include passante adjustments)
                    xLeft = computeIntersectionX(dotX, dotY, leftPassX, leftPassY, yH);
                    xRight = computeIntersectionX(dotX, dotY, rightPassX, rightPassY, yH);
                }
                
                // Durante l'animazione "Visualizza Punto", nascondi sempre il campo da coprire
                const coverVisible = (window.__viewCover__ !== false) && !animazioneInCorso;
                const receiverVisible = window.__viewResponder__ !== false;
                
                const x1 = Math.min(xLeft, xRight);
                const x2 = Math.max(xLeft, xRight);
                hMeasure.setAttribute('x1', String(x1));
                hMeasure.setAttribute('y1', String(yH));
                hMeasure.setAttribute('x2', String(x2));
                hMeasure.setAttribute('y2', String(yH));
                hMeasure.style.display = coverVisible ? '' : 'none';
                
                // Calcola e mostra il valore della misura in metri
                const delta = Math.max(0, x2 - x1);
                const scale = 100 / 293;
                const scaled = delta * scale;
                const meters = scaled / 9.65;
                const lengthText = meters > 25.0 ? '25+m' : meters.toFixed(1) + 'm';
                hMeasureLabel.textContent = lengthText;
                
                // Posiziona il badge al centro della linea
                const bisectorTarget = window.__shotTypeIsServizio__ 
                    ? ((targets.left.y + targets.right.y) / 2)
                    : ((targets.left + targets.right) / 2);
                let xOnBisector;
                if (window.__shotTypeIsServizio__) {
                    xOnBisector = (targets.left.x + targets.right.x) / 2;
                } else {
                    xOnBisector = computeBisectorXAtY(dotX, dotY, bisectorTarget, yH, leftPassX, leftPassY, rightPassX, rightPassY);
                }
                const xClamped = Math.max(COURT_X_MIN, Math.min(COURT_X_MAX, xOnBisector));
                
                const textWidth = lengthText.length * 11;
                const textHeight = COVER_BADGE_TEXT_HEIGHT;
                const labelOffset = (coverVisible && receiverVisible)
                    ? RECEIVER_DOT_RADIUS + COVER_BADGE_VERTICAL_MARGIN + textHeight / 2 + 2
                    : 0;
                const labelY = yH - labelOffset;
                if (hMeasureLabel) {
                    hMeasureLabel.style.display = coverVisible ? '' : 'none';
                    hMeasureLabel.setAttribute('x', String(xClamped));
                    hMeasureLabel.setAttribute('y', String(labelY));
                }
                if (hMeasureBadge) {
                    const badgeY = labelY - textHeight / 2 - 2;
                    hMeasureBadge.style.display = coverVisible ? '' : 'none';
                    hMeasureBadge.setAttribute('x', String(xClamped - textWidth / 2 - 4));
                    hMeasureBadge.setAttribute('y', String(badgeY));
                    hMeasureBadge.setAttribute('width', String(textWidth + 8));
                    hMeasureBadge.setAttribute('height', String(textHeight + 4));
                }
                
                // Aggiorna l'highlight del tutorial se attivo
                if (typeof window.updateTutorialHighlight === 'function') {
                    window.updateTutorialHighlight();
                }
            }

            function svgYToClientY(ySvg) {
                const pt = svg.createSVGPoint();
                pt.x = 0; pt.y = ySvg;
                const ctm = svg.getScreenCTM();
                const p = pt.matrixTransform(ctm);
                return p.y;
            }

            function updateArrowHtmlPosition() {
                if (!arrowHtml) return;
                if (window.__viewCover__ === false) { arrowHtml.style.display = 'none'; return; }
                const wrap = svg.parentElement;
                if (!wrap) return;
                const wrapRect = wrap.getBoundingClientRect();
                const clientY = svgYToClientY(currentMeasureY);
                const top = clientY - wrapRect.top;
                arrowHtml.style.top = `${top}px`;
                if (arrowHtml.style.display !== 'block') arrowHtml.style.display = 'block';
                
                // Aggiorna l'highlight del tutorial se attivo
                if (typeof window.updateTutorialHighlight === 'function') {
                    window.updateTutorialHighlight();
                }
            }

            function setupSecondaryCourt() {
                const secondary = document.querySelector('.svg-wrap.secondary');
                const primary = document.querySelector('.svg-wrap.primary');
                if (!secondary || !primary) return;
                
                if (!secondary.querySelector('svg')) {
                    const currentColors = COURT_COLORS[window.__currentCourtType__] || COURT_COLORS.cemento;
                    const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg2.setAttribute('width', '100%');
                    svg2.setAttribute('height', 'auto');
                    svg2.setAttribute('viewBox', '0 0 600 1006');
                    svg2.setAttribute('style', `background:${currentColors.background}; border-radius:20px; display:block;`);
                    
                    const elems = [
                        ['rect', { x: '184', y: '150', width: '232', height: '672', fill: currentColors.court, stroke: '#fff', 'stroke-width': '5' }],
                        ['rect', { x: '146', y: '150', width: '38', height: '672', fill: currentColors.court, stroke: '#fff', 'stroke-width': '5' }],
                        ['rect', { x: '416', y: '150', width: '38', height: '672', fill: currentColors.court, stroke: '#fff', 'stroke-width': '5' }],
                        ['rect', { x: '146', y: '150', width: '308', height: '672', fill: 'none', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '300', y1: '318', x2: '300', y2: '654', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '184', y1: '318', x2: '416', y2: '318', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '184', y1: '654', x2: '416', y2: '654', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '146', y1: '150', x2: '454', y2: '150', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '146', y1: '822', x2: '454', y2: '822', stroke: '#fff', 'stroke-width': '5' }],
                        ['line', { x1: '106', y1: '486', x2: '494', y2: '486', stroke: '#fff', 'stroke-width': '10' }],
                        // Coordinate system indicators
                        ['line', { x1: '300', y1: '150', x2: '300', y2: '160', stroke: '#fff', 'stroke-width': '5'}],
                        ['line', { x1: '300', y1: '822', x2: '300', y2: '812', stroke: '#fff', 'stroke-width': '5'}]
                    ];
                    elems.forEach(([tag, attrs]) => {
                        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
                        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
                        svg2.appendChild(el);
                    });
                    
                    const left2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    left2.setAttribute('id', 'leftLine2');
                    left2.setAttribute('stroke', COLOR_PALLEGGIO);
                    left2.setAttribute('stroke-width', '3');
                    left2.setAttribute('stroke-linecap', 'round');
                    svg2.appendChild(left2);
                    
                    const right2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    right2.setAttribute('id', 'rightLine2');
                    right2.setAttribute('stroke', COLOR_PALLEGGIO);
                    right2.setAttribute('stroke-width', '3');
                    right2.setAttribute('stroke-linecap', 'round');
                    svg2.appendChild(right2);
                    
                    const bis2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    bis2.setAttribute('id', 'bisectorLine2');
                    bis2.setAttribute('stroke', COLOR_PALLEGGIO);
                    bis2.setAttribute('stroke-width', '2');
                    bis2.setAttribute('stroke-dasharray', '6 6');
                    bis2.setAttribute('stroke-linecap', 'round');
                    svg2.appendChild(bis2);
                    
                    const wedge2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    wedge2.setAttribute('id', 'wedgeFill2');
                    wedge2.setAttribute('fill', '#000');
                    wedge2.setAttribute('fill-opacity', '0.15');
                    svg2.appendChild(wedge2);
                    
                    const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot2.setAttribute('id', 'cursorDot2');
                    dot2.setAttribute('cx', '300');
                    dot2.setAttribute('cy', '822');
                    dot2.setAttribute('r', '12');
                    dot2.setAttribute('fill', '#ff5252');
                    dot2.setAttribute('stroke', '#fff');
                    dot2.setAttribute('stroke-width', '2');
                    svg2.appendChild(dot2);
                    
                    const dot2b = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot2b.setAttribute('id', 'cursorDotReplica2');
                    dot2b.setAttribute('cx', '300');
                    dot2b.setAttribute('cy', '822');
                    dot2b.setAttribute('r', '12');
                    dot2b.setAttribute('fill', '#ff5252');
                    dot2b.setAttribute('stroke', '#fff');
                    dot2b.setAttribute('stroke-width', '1.5');
                    svg2.appendChild(dot2b);
                    
                    secondary.innerHTML = '';
                    secondary.appendChild(svg2);
                }
                secondary.style.display = 'block';
            }

            function updateIntersectionDot() {
                if (!intersectionDot) return;
                
                if (window.__gioco__ === 'doppio') {
                    intersectionDot.style.display = 'none';
                    return;
                }

                // Show intersection dot in all modes (dinamico, 1colpo, 2colpi) and only when both shot and responder are visible
                const inValidMode = (window.__modalita__ === 'dinamico' || window.__modalita__ === '1colpo' || window.__modalita__ === '2colpi');
                const shouldDisplay = inValidMode && window.__viewResponder__ === true;
                
                if (shouldDisplay) {
                    intersectionDot.style.display = '';
                    
                    let receiverX = null;
                    let receiverY = null;
                    
                    if (yellowLine) {
                        const yellowX = parseFloat(yellowLine.getAttribute('x2'));
                        const yellowY = parseFloat(yellowLine.getAttribute('y2'));
                        if (!Number.isNaN(yellowX) && !Number.isNaN(yellowY)) {
                            receiverX = yellowX;
                            receiverY = yellowY;
                        }
                    }
                    
                    if (receiverX === null || receiverY === null) {
                        const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                        const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                        const targets = computePassYTargets(dotX, dotY);
                        const anchors = getDirectionalAnchorPoints(dotX, dotY, targets);
                        const { leftX, leftY, rightX, rightY } = anchors;
                        
                        const xLeftAtH = computeIntersectionX(dotX, dotY, leftX, leftY, currentMeasureY);
                        const xRightAtH = computeIntersectionX(dotX, dotY, rightX, rightY, currentMeasureY);
                        const minXAtH = Math.min(xLeftAtH, xRightAtH);
                        const maxXAtH = Math.max(xLeftAtH, xRightAtH);
                        const bisectorTarget = window.__shotTypeIsServizio__
                            ? ((targets.left.y + targets.right.y) / 2)
                            : ((targets.left + targets.right) / 2);
                        
                        let intersectionX;
                        if (yellowEndX == null) {
                            intersectionX = computeBisectorXAtY(
                                dotX,
                                dotY,
                                bisectorTarget,
                                currentMeasureY,
                                leftX,
                                leftY,
                                rightX,
                                rightY
                            );
                        } else {
                            intersectionX = yellowEndX;
                        }
                        
                        receiverX = Math.max(minXAtH, Math.min(maxXAtH, intersectionX));
                        receiverY = currentMeasureY;
                    }
                    
                    intersectionDot.setAttribute('cx', String(receiverX));
                    intersectionDot.setAttribute('cy', String(receiverY));
                } else {
                    intersectionDot.style.display = 'none';
                }
            }

            function updateThemeColors() {
                const color = window.__shotTypeIsPassante__ ? COLOR_PASSANTE : COLOR_PALLEGGIO;
                if (hMeasure) hMeasure.setAttribute('stroke', color);
                if (hMeasureLabel) hMeasureLabel.setAttribute('fill', '#000000');
                if (hMeasureBadge) hMeasureBadge.setAttribute('stroke', color);
                if (leftLine) leftLine.setAttribute('stroke', color);
                if (rightLine) rightLine.setAttribute('stroke', color);
                if (bisectorLine) bisectorLine.setAttribute('stroke', color);
                if (arrowHtml) {
                    const tip = arrowHtml.querySelector('.arrow');
                    if (tip) tip.style.borderLeftColor = color;
                }
            }

            function updateThemeColorsRight() {
                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                if (!svg2) return;
                const color2 = window.__shotType2IsPassante__ ? COLOR_PASSANTE : COLOR_PALLEGGIO;
                const l2 = svg2.querySelector('#leftLine2');
                const r2 = svg2.querySelector('#rightLine2');
                const b2 = svg2.querySelector('#bisectorLine2');
                if (l2) l2.setAttribute('stroke', color2);
                if (r2) r2.setAttribute('stroke', color2);
                if (b2) b2.setAttribute('stroke', color2);
            }

            function isMobileViewport() {
                return window.innerWidth <= MOBILE_BREAKPOINT;
            }

            // Flag per tracciare se l'alert è stato già mostrato
            let colpitoreAlertShown = false;

            function isColpitoreMovementLocked() {
                // In modalità dinamico, blocca il movimento se numero colpo > 1
                return window.__modalita__ === 'dinamico' && window.__numeroColpo__ > 1;
            }

            function updateColpitoreDragState() {
                if (!dot) return;
                // Mostra un cursore di avvertimento se il movimento è "bloccato" ma permette comunque il movimento
                if (isColpitoreMovementLocked()) {
                    dot.style.cursor = 'grab';
                } else if (draggingDot) {
                    dot.style.cursor = 'grabbing';
                } else {
                    dot.style.cursor = 'grab';
                }
            }

            // Funzioni per gestire l'alert del movimento colpitore
            function showColpitoreMovementAlert() {
                const alert = document.getElementById('colpitoreMovementAlert');
                if (alert && !colpitoreAlertShown) {
                    alert.classList.add('active');
                    colpitoreAlertShown = true;
                }
            }

            function hideColpitoreMovementAlert() {
                const alert = document.getElementById('colpitoreMovementAlert');
                if (alert) {
                    alert.classList.remove('active');
                }
            }

            function resetColpitoreAlertFlag() {
                colpitoreAlertShown = false;
                hideColpitoreMovementAlert();
            }

            function setMobileSecondaryVisible(visible) {
                isMobileSecondaryVisible = visible;
                if (bodyEl) {
                    bodyEl.classList.toggle('mobile-show-secondary', visible);
                }
                if (mobilePanelToggle) {
                    const buttonLabel = visible ? 'Torna al campo principale' : 'Mostra campo di destra';
                    mobilePanelToggle.setAttribute('data-direction', visible ? 'back' : 'forward');
                    mobilePanelToggle.setAttribute('aria-label', buttonLabel);
                    mobilePanelToggle.setAttribute('title', buttonLabel);
                    
                    // Gestisci le etichette "Primo Colpo" e "Secondo Colpo"
                    const labelFirst = mobilePanelToggle.querySelector('.mobile-shot-label-first');
                    const labelSecond = mobilePanelToggle.querySelector('.mobile-shot-label-second');
                    const isMobile2Colpi = isMobileViewport() && window.__modalita__ === '2colpi';
                    
                    if (labelFirst && labelSecond) {
                        if (isMobile2Colpi) {
                            // Mostra "Primo Colpo" quando il campo principale è visibile
                            // Mostra "Secondo Colpo" quando il campo secondario è visibile
                            labelFirst.classList.toggle('visible', !visible);
                            labelSecond.classList.toggle('visible', visible);
                        } else {
                            // Nascondi entrambe le etichette se non siamo in modalità 2 colpi mobile
                            labelFirst.classList.remove('visible');
                            labelSecond.classList.remove('visible');
                        }
                    }
                }
            }

            function updateMobilePanels() {
                if (!mobilePanelToggle) return;
                const shouldShow = isMobileViewport() && window.__modalita__ === '2colpi';
                mobilePanelToggle.classList.toggle('is-visible', shouldShow);
                if (!shouldShow) {
                    setMobileSecondaryVisible(false);
                } else {
                    // Aggiorna le etichette quando il pannello diventa visibile
                    setMobileSecondaryVisible(isMobileSecondaryVisible);
                }
            }

            function scheduleMobileCourtGapAdjustment() {
                if (mobileCourtGapRaf) {
                    cancelAnimationFrame(mobileCourtGapRaf);
                    mobileCourtGapRaf = null;
                }
                if (typeof requestAnimationFrame !== 'function') {
                    adjustMobileDinamicoCourtGap();
                    return;
                }
                mobileCourtGapRaf = requestAnimationFrame(() => {
                    mobileCourtGapRaf = null;
                    adjustMobileDinamicoCourtGap();
                });
            }

            function adjustMobileDinamicoCourtGap() {
                if (!rootEl) return;
                const shouldAdjust = bodyEl
                    && bodyEl.classList.contains('mobile-dinamico')
                    && isMobileViewport()
                    && dinamicoPanel
                    && primaryCourt;
                if (!shouldAdjust) {
                    rootEl.style.setProperty('--mobile-dinamico-court-shift', '0px');
                    return;
                }
                const panelRect = dinamicoPanel.getBoundingClientRect();
                const courtRect = primaryCourt.getBoundingClientRect();
                if (!panelRect || !panelRect.height || !courtRect) {
                    rootEl.style.setProperty('--mobile-dinamico-court-shift', '0px');
                    return;
                }
                const gap = courtRect.top - panelRect.bottom;
                if (gap > MOBILE_DINAMICO_DESIRED_GAP) {
                    const shift = MOBILE_DINAMICO_DESIRED_GAP - gap;
                    rootEl.style.setProperty('--mobile-dinamico-court-shift', `${shift}px`);
                } else {
                    rootEl.style.setProperty('--mobile-dinamico-court-shift', '0px');
                }
            }

            function updateMobileDinamicoBarHeight(rawHeight) {
                if (!rootEl || !dinamicoPanel) return;
                const normalized = Math.max(0, Math.ceil(rawHeight || 0));
                dinamicoPanel.dataset.collapsedHeight = String(normalized);
                rootEl.style.setProperty('--mobile-dinamico-bar-height', `${normalized}px`);
                scheduleMobileCourtGapAdjustment();
            }

            function initDinamicoPanelObserver() {
                if (!('ResizeObserver' in window) || !dinamicoPanel || dinamicoPanelResizeObserver) {
                    return;
                }
                dinamicoPanelResizeObserver = new ResizeObserver((entries) => {
                    if (!bodyEl || !bodyEl.classList.contains('mobile-dinamico')) return;
                    if (!dinamicoPanel.classList.contains('mobile-collapsed')) return;
                    for (const entry of entries) {
                        if (entry.target !== dinamicoPanel) continue;
                        const height = entry.contentRect ? entry.contentRect.height : 0;
                        if (height > 0) {
                            updateMobileDinamicoBarHeight(height);
                            scheduleMobileCourtGapAdjustment();
                        }
                    }
                });
                dinamicoPanelResizeObserver.observe(dinamicoPanel);
            }

            function cacheDinamicoCollapsedHeight() {
                if (!rootEl || !dinamicoPanel) return;
                if (!(bodyEl && bodyEl.classList.contains('mobile-dinamico'))) {
                    rootEl.style.setProperty('--mobile-dinamico-bar-height', '0px');
                    rootEl.style.setProperty('--mobile-dinamico-court-shift', '0px');
                    dinamicoPanel.dataset.collapsedHeight = '';
                    scheduleMobileCourtGapAdjustment();
                    return;
                }
                const rect = dinamicoPanel.getBoundingClientRect();
                if (rect && rect.height) {
                    updateMobileDinamicoBarHeight(rect.height);
                }
            }

            function applyStoredDinamicoCollapsedHeight() {
                if (!rootEl || !dinamicoPanel) return;
                const stored = dinamicoPanel.dataset ? dinamicoPanel.dataset.collapsedHeight : null;
                if (stored) {
                    rootEl.style.setProperty('--mobile-dinamico-bar-height', `${stored}px`);
                    scheduleMobileCourtGapAdjustment();
                }
            }

            function setMobileDinamicoPanelOpen(open) {
                if (!dinamicoPanel) return;
                const enable = bodyEl
                    && bodyEl.classList.contains('mobile-dinamico')
                    && isMobileViewport()
                    && window.__modalita__ === 'dinamico';

                if (!enable) {
                    isMobileDinamicoPanelOpen = false;
                    dinamicoPanel.classList.remove('mobile-expanded', 'mobile-collapsed');
                    if (dinamicoMobileToggle) {
                        dinamicoMobileToggle.setAttribute('aria-expanded', 'false');
                        dinamicoMobileToggle.removeAttribute('title');
                    }
                    if (rootEl) {
                        rootEl.style.setProperty('--mobile-dinamico-bar-height', '0px');
                        rootEl.style.setProperty('--mobile-dinamico-court-shift', '0px');
                    }
                    scheduleMobileCourtGapAdjustment();
                    return;
                }

                isMobileDinamicoPanelOpen = !!open;
                dinamicoPanel.classList.toggle('mobile-expanded', isMobileDinamicoPanelOpen);
                dinamicoPanel.classList.toggle('mobile-collapsed', !isMobileDinamicoPanelOpen);

                if (dinamicoMobileToggle) {
                    const label = isMobileDinamicoPanelOpen ? 'Chiudi pannello Dinamico' : 'Apri pannello Dinamico';
                    dinamicoMobileToggle.setAttribute('aria-expanded', isMobileDinamicoPanelOpen ? 'true' : 'false');
                    dinamicoMobileToggle.setAttribute('aria-label', label);
                    dinamicoMobileToggle.setAttribute('title', label);
                }

                if (isMobileDinamicoPanelOpen) {
                    applyStoredDinamicoCollapsedHeight();
                } else {
                    cacheDinamicoCollapsedHeight();
                }
                scheduleMobileCourtGapAdjustment();
            }

            function syncMobileDinamicoPanel(forceCollapse = false) {
                if (!bodyEl) return;
                const enable = isMobileViewport() && window.__modalita__ === 'dinamico';
                bodyEl.classList.toggle('mobile-dinamico', enable);
                if (!enable) {
                    setMobileDinamicoPanelOpen(false);
                    scheduleMobileCourtGapAdjustment();
                    return;
                }
                const desiredOpen = forceCollapse ? false : isMobileDinamicoPanelOpen;
                setMobileDinamicoPanelOpen(desiredOpen);
                if (!desiredOpen) {
                    requestAnimationFrame(cacheDinamicoCollapsedHeight);
                }
                scheduleMobileCourtGapAdjustment();
            }

            function updateTouchTargetSizes() {
                if (svg) {
                    svg.style.touchAction = isMobileViewport() ? 'none' : 'auto';
                }
            }

            let currentMobileSection = 'impostazioni';
            
            function setMobileSettingsState(open, section = null) {
                if (!controlsSidebar) return;
                mobileSettingsOpen = open;
                controlsSidebar.classList.toggle('mobile-open', open);
                controlsSidebar.classList.toggle('mobile-collapsed', !open);
                
                if (section) {
                    currentMobileSection = section;
                }
                
                // Update mobile nav pills
                const pills = document.querySelectorAll('.mobile-nav-pill');
                pills.forEach(pill => {
                    pill.classList.toggle('active', pill.dataset.section === currentMobileSection);
                });
                
                // Show/hide panel sections
                const panelModalita = document.getElementById('panelModalita');
                const panelImpostazioni = document.getElementById('panelImpostazioni');
                
                // Per la sezione 'menu', mostriamo le sezioni principali (Colpitore, Colpo, Visualizza, Disegna, Scarica)
                const isMenuSection = currentMobileSection === 'menu';
                
                if (panelModalita) {
                    panelModalita.classList.toggle('mobile-visible', currentMobileSection === 'modalita');
                }
                if (panelImpostazioni) {
                    // Impostazioni solo quando si seleziona impostazioni, NON nel menu
                    panelImpostazioni.classList.toggle('mobile-visible', currentMobileSection === 'impostazioni');
                }
                
                // Mostra solo le sezioni .compact (Colpitore, Colpo, Visualizza, Disegna, Scarica) quando è aperto il menu
                // Queste sono le sezioni dirette del sidebar, NON quelle dentro panelImpostazioni
                const mainControlSections = controlsSidebar.querySelectorAll(':scope > .control-section.compact');
                mainControlSections.forEach(section => {
                    if (isMenuSection && open) {
                        section.classList.add('mobile-visible');
                    } else if (!isMenuSection) {
                        section.classList.remove('mobile-visible');
                    }
                });
            }

            function applyMobileSettingsMode(forceCollapse = false) {
                if (!controlsSidebar) return;
                const mobile = isMobileViewport();
                if (mobile) {
                    controlsSidebar.classList.add('mobile-enabled');
                    if (forceCollapse || !mobileSettingsOpen) {
                        setMobileSettingsState(false);
                    }
                } else {
                    controlsSidebar.classList.remove('mobile-enabled', 'mobile-open', 'mobile-collapsed');
                    mobileSettingsOpen = false;
                    if (settingsTitleTrigger) {
                        settingsTitleTrigger.removeAttribute('aria-expanded');
                    }
                    setMobileSecondaryVisible(false);
                }
                isMobileLayout = mobile;
                updateMobilePanels();
                updateTouchTargetSizes();
                syncMobileDinamicoPanel(forceCollapse);
                scheduleMobileCourtGapAdjustment();
            }

            function handleMobileSettingsToggle(event) {
                if (!isMobileLayout) return;
                if (event) {
                    event.preventDefault();
                }
                setMobileSettingsState(!mobileSettingsOpen);
            }

            function updateCourtColors(courtType) {
                const colors = COURT_COLORS[courtType] || COURT_COLORS.cemento;
                if (svg) {
                    svg.style.background = colors.background;
                    const rects = svg.querySelectorAll('rect[fill]:not([fill="none"])');
                    rects.forEach(rect => {
                        rect.setAttribute('fill', colors.court);
                    });
                }
                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                if (svg2) {
                    svg2.style.background = colors.background;
                    const rects2 = svg2.querySelectorAll('rect[fill]:not([fill="none"])');
                    rects2.forEach(rect => {
                        rect.setAttribute('fill', colors.court);
                    });
                }
                window.__currentCourtType__ = courtType;
            }

            function computeServizioTargets(dotX, dotY) {
                if (isPlayer) {
                    // Tu mode: dot is in Campo A, targets are in Campo B
                    const fieldA = calculateFieldACoordinates(dotX, dotY);
                    const xA = fieldA.x;
                    
                    let leftTarget, rightTarget;
                    if (xA >= 0) { // X = 0 treated as positive in Tu mode
                        // X positive or zero in Campo A: left line passes through (-115, 220), right line through (0, 168)
                        leftTarget = { x: FIELD_B_ORIGIN_X - 115, y: FIELD_B_ORIGIN_Y + 220 };
                        rightTarget = { x: FIELD_B_ORIGIN_X, y: FIELD_B_ORIGIN_Y + 168 };
                    } else {
                        // X negative in Campo A: left line passes through (0, 168), right line through (115, 220)
                        leftTarget = { x: FIELD_B_ORIGIN_X, y: FIELD_B_ORIGIN_Y + 168 };
                        rightTarget = { x: FIELD_B_ORIGIN_X + 115, y: FIELD_B_ORIGIN_Y + 220 };
                    }
                    
                    // Extend lines to field boundaries
                    const leftEndY = END_Y_TOP; // Top of the field
                    const rightEndY = END_Y_TOP;
                    
                    // Calculate intersection with top boundary
                    const leftEndX = computeIntersectionX(dotX, dotY, leftTarget.x, leftTarget.y, leftEndY);
                    const rightEndX = computeIntersectionX(dotX, dotY, rightTarget.x, rightTarget.y, rightEndY);
                    
                    return {
                        left: { x: leftEndX, y: leftEndY },
                        right: { x: rightEndX, y: rightEndY }
                    };
                } else {
                    // Avversario mode: dot is in Campo B, targets are in Campo A
                    const fieldB = calculateFieldBCoordinates(dotX, dotY);
                    const xB = fieldB.x;
                    
                    let leftTarget, rightTarget;
                    if (xB < 0) {
                        // X negative in Campo B: left line passes through (115, 220), right line through (0, 168)
                        leftTarget = { x: FIELD_A_ORIGIN_X + 115, y: FIELD_A_ORIGIN_Y - 220 };
                        rightTarget = { x: FIELD_A_ORIGIN_X, y: FIELD_A_ORIGIN_Y - 168 };
                    } else {
                        // X positive in Campo B: left line passes through (0, 168), right line through (-115, 220)
                        leftTarget = { x: FIELD_A_ORIGIN_X, y: FIELD_A_ORIGIN_Y - 168 };
                        rightTarget = { x: FIELD_A_ORIGIN_X - 115, y: FIELD_A_ORIGIN_Y - 220 };
                    }
                    
                    // Extend lines to field boundaries
                    const leftEndY = END_Y_BOTTOM; // Bottom of the field
                    const rightEndY = END_Y_BOTTOM;
                    
                    // Calculate intersection with bottom boundary
                    const leftEndX = computeIntersectionX(dotX, dotY, leftTarget.x, leftTarget.y, leftEndY);
                    const rightEndX = computeIntersectionX(dotX, dotY, rightTarget.x, rightTarget.y, rightEndY);
                    
                    return {
                        left: { x: leftEndX, y: leftEndY },
                        right: { x: rightEndX, y: rightEndY }
                    };
                }
            }

            function computePassYTargetsBaseRight(dotX, dotY) {
                const xA = dotX - ORIGIN_X;
                const yA = ORIGIN_BOTTOM_Y - dotY;
                const isPassante = window.__shotType2IsPassante__;
                const baseOffset = isPassante ? 150 : 105;
                const baseCoeff = isPassante ? 0.15 : 0.4;
                const effectCoeff = isPassante ? 0.5 : 0.4;
                const base = baseOffset + baseCoeff * yA;
                const effect = effectCoeff * Math.abs(xA);
                const yA_min = ORIGIN_BOTTOM_Y - SVG_Y_MAX;
                const yA_max = ORIGIN_BOTTOM_Y - NET_Y;
                const denom = (yA_max - yA_min) || 1;
                let t = (yA - yA_min) / denom;
                if (t < 0) t = 0; else if (t > 1) t = 1;
                const negScale = isPassante ? 1.3 * t : 4 * t - 1.5;

                let leftB = base;
                let rightB = base;
                if (xA > 0) {
                    leftB = base + effect;
                    rightB = base - effect * negScale;
                } else if (xA < 0) {
                    leftB = base - effect * negScale;
                    rightB = base + effect;
                }
                return { left: ORIGIN_TOP_Y + leftB, right: ORIGIN_TOP_Y + rightB };
            }

            function computePassYTargetsFor(dotX, dotY, isPlayerLocal) {
                if (isPlayerLocal) {
                    return computePassYTargetsBaseRight(dotX, dotY);
                }
                const dotX_m = 2 * ORIGIN_X - dotX;
                const dotY_m = 2 * NET_Y - dotY;
                const tTop = computePassYTargetsBaseRight(dotX_m, dotY_m);
                return { left: 2 * NET_Y - tTop.right, right: 2 * NET_Y - tTop.left };
            }

            function updateSecondaryFromLeft() {
                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                if (!svg2) return;
                const dot2 = svg2.querySelector('#cursorDot2');
                const dot2b = svg2.querySelector('#cursorDotReplica2');
                const l2 = svg2.querySelector('#leftLine2');
                const r2 = svg2.querySelector('#rightLine2');
                const b2 = svg2.querySelector('#bisectorLine2');
                const w2 = svg2.querySelector('#wedgeFill2');
                if (!(dot2 && dot2b && l2 && r2 && b2 && w2)) return;

                const leftDotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const leftDotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                const isPlayerRight = !isPlayer;

                // Always use normal mode logic for secondary court
                const endYSvgR = isPlayerRight ? END_Y_TOP : END_Y_BOTTOM;

                const leftTargets = computePassYTargets(leftDotX, leftDotY);
                const primaryAnchors = getDirectionalAnchorPoints(leftDotX, leftDotY, leftTargets);
                const xLeftAtY = computeIntersectionX(leftDotX, leftDotY, primaryAnchors.leftX, primaryAnchors.leftY, currentMeasureY);
                const xRightAtY = computeIntersectionX(leftDotX, leftDotY, primaryAnchors.rightX, primaryAnchors.rightY, currentMeasureY);
                
                const minXAtY = Math.min(xLeftAtY, xRightAtY);
                const maxXAtY = Math.max(xLeftAtY, xRightAtY);
                let xIntersect;
                if (yellowEndX == null) {
                    const bisTargetLeft = window.__shotTypeIsServizio__
                        ? ((leftTargets.left.y + leftTargets.right.y) / 2)
                        : ((leftTargets.left + leftTargets.right) / 2);
                    xIntersect = computeBisectorXAtY(
                        leftDotX,
                        leftDotY,
                        bisTargetLeft,
                        currentMeasureY,
                        primaryAnchors.leftX,
                        primaryAnchors.leftY,
                        primaryAnchors.rightX,
                        primaryAnchors.rightY
                    );
                } else {
                    xIntersect = computeIntersectionX(leftDotX, leftDotY, yellowEndX, currentMeasureY, currentMeasureY);
                }
                const clampedX = Math.max(minXAtY, Math.min(maxXAtY, xIntersect));

                const mainY = currentMeasureY;
                dot2.setAttribute('cx', String(clampedX));
                dot2.setAttribute('cy', String(mainY));
                dot2b.setAttribute('cx', String(leftDotX));
                dot2b.setAttribute('cy', String(leftDotY));

                const targetsR = computePassYTargetsFor(clampedX, mainY, isPlayerRight);
                const anchorsRight = getDirectionalAnchorPoints(clampedX, mainY, targetsR, {
                    isServizio: false,
                    isPassante: window.__shotType2IsPassante__,
                    isPlayerContext: isPlayerRight
                });
                const leftEndX2 = setLineToYEnd(l2, clampedX, mainY, anchorsRight.leftX, anchorsRight.leftY, endYSvgR);
                const rightEndX2 = setLineToYEnd(r2, clampedX, mainY, anchorsRight.rightX, anchorsRight.rightY, endYSvgR);
                const bisTargetR = (targetsR.left + targetsR.right) / 2;
                setBisectorToYEnd(b2, clampedX, mainY, bisTargetR, endYSvgR);
                if (b2) b2.style.display = (window.__viewCenter__ === false) ? 'none' : '';
                w2.setAttribute('points', `${clampedX},${mainY} ${leftEndX2},${endYSvgR} ${rightEndX2},${endYSvgR}`);

                // Apply visibility toggles
                if (dot2) dot2.style.display = (window.__viewPlayer__ === false) ? 'none' : '';
                if (dot2b) dot2b.style.display = (window.__viewPlayer__ === false) ? 'none' : '';
                if (l2) l2.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (r2) r2.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (w2) w2.style.display = (window.__viewDirections__ === false || window.__viewShot__ === false) ? 'none' : '';

                updateThemeColorsRight();
            }

            function updateSecondaryCourtLock() {
                if (!courtLockOverlay) return;
                
                // Il lucchetto non viene più mostrato in modalità 2 colpi perché gli elementi sono obbligatori
                // Nascondi sempre il lucchetto (come in modalità dinamico)
                courtLockOverlay.style.display = 'none';
                courtLockOverlay.classList.remove('active');
            }

            function updateDinamicoPanel() {
                if (!dinamicoPanel) return;
                
                const secondaryCourt = document.querySelector('.svg-wrap.secondary');
                
                if (window.__modalita__ === 'dinamico') {
                    // Modalità Dinamico: mostra il pannello, nascondi il campo secondario
                    dinamicoPanel.classList.add('active');
                    if (secondaryCourt) secondaryCourt.style.display = 'none';
                    if (courtLockOverlay) courtLockOverlay.style.display = 'none';
                    
                    // BUG FIX 1 (complemento): Mostra il pallino rosso del colpo precedente se esiste
                    if (previousShotDot && previousShotDot.parentNode) {
                        previousShotDot.style.display = '';
                    }
                } else {
                    // Altre modalità: nascondi il pannello, mostra il campo secondario (se in modalità 2colpi)
                    dinamicoPanel.classList.remove('active');
                    if (secondaryCourt) {
                        secondaryCourt.style.display = (window.__modalita__ === '2colpi') ? 'block' : 'none';
                    }
                    // Non forzare la visibilità del courtLockOverlay qui - verrà gestita da updateSecondaryCourtLock()
                    
                    // BUG FIX 1: Nascondi il pallino rosso del colpo precedente quando si esce da modalità DINAMICO
                    if (previousShotDot && previousShotDot.parentNode) {
                        previousShotDot.style.display = 'none';
                    }
                }

                if (isMobileViewport()) {
                    syncMobileDinamicoPanel();
                }
            }

            function computePassYTargetsBase(dotX, dotY) {
                const xA = dotX - ORIGIN_X;
                const yA = ORIGIN_BOTTOM_Y - dotY;
                const baseOffset = window.__shotTypeIsPassante__ ? 150 : 105;
                const baseCoeff = window.__shotTypeIsPassante__ ? 0.15 : 0.4;
                const effectCoeff = window.__shotTypeIsPassante__ ? 0.5 : 0.4;
                const base = baseOffset + baseCoeff * yA;
                const effect = effectCoeff * Math.abs(xA);
                const yA_min = ORIGIN_BOTTOM_Y - SVG_Y_MAX;
                const yA_max = ORIGIN_BOTTOM_Y - NET_Y;
                const denom = (yA_max - yA_min) || 1;
                let t = (yA - yA_min) / denom;
                if (t < 0) t = 0; else if (t > 1) t = 1;
                const negScale = window.__shotTypeIsPassante__ ? 1.3 * t : 4 * t - 1.5;

                let leftB = base;
                let rightB = base;
                if (xA > 0) {
                    leftB = base + effect;
                    rightB = base - effect * negScale;
                } else if (xA < 0) {
                    leftB = base - effect * negScale;
                    rightB = base + effect;
                }
                return { left: ORIGIN_TOP_Y + leftB, right: ORIGIN_TOP_Y + rightB };
            }

            function computePassYTargets(dotX, dotY) {
                if (window.__shotTypeIsServizio__) {
                    return computeServizioTargets(dotX, dotY);
                }
                if (isPlayer) {
                    return computePassYTargetsBase(dotX, dotY);
                }
                const dotX_m = 2 * ORIGIN_X - dotX;
                const dotY_m = 2 * NET_Y - dotY;
                const tTop = computePassYTargetsBase(dotX_m, dotY_m);
                return { left: 2 * NET_Y - tTop.right, right: 2 * NET_Y - tTop.left };
            }

            function getDirectionalAnchorPoints(dotX, dotY, targets, options = {}) {
                const {
                    isServizio = window.__shotTypeIsServizio__,
                    isPassante = window.__shotTypeIsPassante__,
                    isPlayerContext = isPlayer
                } = options;

                if (isServizio) {
                    return {
                        leftX: targets.left.x,
                        leftY: targets.left.y,
                        rightX: targets.right.x,
                        rightY: targets.right.y
                    };
                }

                let leftX = LEFT_X_SVG;
                let leftY = targets.left;
                let rightX = RIGHT_X_SVG;
                let rightY = targets.right;

                if (isPassante) {
                    if (isPlayerContext) {
                        const fieldA = calculateFieldACoordinates(dotX, dotY);
                        const xA = fieldA.x;
                        if (xA >= 115) {
                            rightX = FIELD_B_ORIGIN_X + 115;
                            rightY = FIELD_B_ORIGIN_Y;
                        }
                        if (xA <= -115) {
                            leftX = FIELD_B_ORIGIN_X - 115;
                            leftY = FIELD_B_ORIGIN_Y;
                        }
                    } else {
                        const fieldB = calculateFieldBCoordinates(dotX, dotY);
                        const xB = fieldB.x;
                        if (xB >= 115) {
                            rightX = FIELD_A_ORIGIN_X + 115;
                            rightY = FIELD_A_ORIGIN_Y;
                        }
                        if (xB <= -115) {
                            leftX = FIELD_A_ORIGIN_X - 115;
                            leftY = FIELD_A_ORIGIN_Y;
                        }
                    }
                }

                return { leftX, leftY, rightX, rightY };
            }

            function updateLinesAndWedge(dotX, dotY) {
                const targets = computePassYTargets(dotX, dotY);
                
                if (window.__shotTypeIsServizio__) {
                    // Servizio mode: use specific target points
                    const leftEndX = targets.left.x;
                    const rightEndX = targets.right.x;
                    const leftEndY = targets.left.y;
                    const rightEndY = targets.right.y;
                    
                    // Set left line
                    if (leftLine) {
                        leftLine.setAttribute('x1', String(dotX));
                        leftLine.setAttribute('y1', String(dotY));
                        leftLine.setAttribute('x2', String(leftEndX));
                        leftLine.setAttribute('y2', String(leftEndY));
                    }
                    
                    // Set right line
                    if (rightLine) {
                        rightLine.setAttribute('x1', String(dotX));
                        rightLine.setAttribute('y1', String(dotY));
                        rightLine.setAttribute('x2', String(rightEndX));
                        rightLine.setAttribute('y2', String(rightEndY));
                    }
                    
                    // Set bisector line
                    const bisectorX = (leftEndX + rightEndX) / 2;
                    const bisectorY = (leftEndY + rightEndY) / 2;
                    if (bisectorLine) {
                        bisectorLine.setAttribute('x1', String(dotX));
                        bisectorLine.setAttribute('y1', String(dotY));
                        bisectorLine.setAttribute('x2', String(bisectorX));
                        bisectorLine.setAttribute('y2', String(bisectorY));
                        bisectorLine.style.display = (window.__viewCenter__ === false) ? 'none' : '';
                    }
                    
                    // Set wedge
                    if (wedge) {
                        wedge.setAttribute('points', `${dotX},${dotY} ${leftEndX},${leftEndY} ${rightEndX},${rightEndY}`);
                    }
                    
                    // Show horizontal measure and arrow in Servizio mode
                    updateHorizontalMeasure(dotX, dotY, targets, currentMeasureY);
                    updateArrowHtmlPosition();
                    
                    // Show yellow line in Servizio mode
                    if (yellowLine) {
                        yellowLine.style.display = (window.__viewShot__ === false) ? 'none' : '';
                        yellowLine.setAttribute('x1', String(dotX));
                        yellowLine.setAttribute('y1', String(dotY));
                        
                        // Calculate intersection points with the blue lines at the measure height
                        const xLeftAtH = computeIntersectionX(dotX, dotY, leftEndX, leftEndY, currentMeasureY);
                        const xRightAtH = computeIntersectionX(dotX, dotY, rightEndX, rightEndY, currentMeasureY);
                        const minXAtH = Math.min(xLeftAtH, xRightAtH);
                        const maxXAtH = Math.max(xLeftAtH, xRightAtH);
                        
                        if (yellowEndX == null) {
                            // Position yellow line at the bisector of the blue lines
                            const bisectorX = (leftEndX + rightEndX) / 2;
                            const bisectorY = (leftEndY + rightEndY) / 2;
                            const xOnBis = computeIntersectionX(dotX, dotY, bisectorX, bisectorY, currentMeasureY);
                            const clamped = Math.max(minXAtH, Math.min(maxXAtH, xOnBis));
                            yellowLine.setAttribute('x2', String(clamped));
                            yellowLine.setAttribute('y2', String(currentMeasureY));
                        } else {
                            // Clamp yellow line within the blue lines
                            const clamped = Math.max(minXAtH, Math.min(maxXAtH, yellowEndX));
                            yellowLine.setAttribute('x2', String(clamped));
                            yellowLine.setAttribute('y2', String(currentMeasureY));
                        }
                    }
                } else {
                    // Normal mode
                    const endYSvg = isPlayer ? END_Y_TOP : END_Y_BOTTOM;
                    const anchors = getDirectionalAnchorPoints(dotX, dotY, targets);
                    const { leftX, leftY, rightX, rightY } = anchors;
                    const leftEndX = setLineToYEnd(leftLine, dotX, dotY, leftX, leftY, endYSvg);
                    const rightEndX = setLineToYEnd(rightLine, dotX, dotY, rightX, rightY, endYSvg);
                    const bisectorTarget = (targets.left + targets.right) / 2;
                    setBisectorToYEnd(bisectorLine, dotX, dotY, bisectorTarget, endYSvg);
                    if (bisectorLine) bisectorLine.style.display = (window.__viewCenter__ === false) ? 'none' : '';
                    if (wedge) {
                        wedge.setAttribute('points', `${dotX},${dotY} ${leftEndX},${endYSvg} ${rightEndX},${endYSvg}`);
                    }
                    updateHorizontalMeasure(dotX, dotY, targets, currentMeasureY, leftX, leftY, rightX, rightY);
                    updateArrowHtmlPosition();

                    if (yellowLine) {
                        yellowLine.style.display = (window.__viewShot__ === false) ? 'none' : '';
                        yellowLine.setAttribute('x1', String(dotX));
                        yellowLine.setAttribute('y1', String(dotY));
                        const xLeftAtH = computeIntersectionX(dotX, dotY, leftX, leftY, currentMeasureY);
                        const xRightAtH = computeIntersectionX(dotX, dotY, rightX, rightY, currentMeasureY);
                        const minXAtH = Math.min(xLeftAtH, xRightAtH);
                        const maxXAtH = Math.max(xLeftAtH, xRightAtH);
                        if (yellowEndX == null) {
                            const xOnBis = computeBisectorXAtY(dotX, dotY, bisectorTarget, currentMeasureY, leftX, leftY, rightX, rightY);
                            const clamped = Math.max(minXAtH, Math.min(maxXAtH, xOnBis));
                            yellowLine.setAttribute('x2', String(clamped));
                            yellowLine.setAttribute('y2', String(currentMeasureY));
                        } else {
                            const clamped = Math.max(minXAtH, Math.min(maxXAtH, yellowEndX));
                            yellowLine.setAttribute('x2', String(clamped));
                            yellowLine.setAttribute('y2', String(currentMeasureY));
                        }
                    }
                }
                updateSecondaryCourtLock();
                updateSecondaryFromLeft();
                updateIntersectionDot();
                
                // Aggiorna l'highlight del tutorial se attivo (per l'area wedge)
                if (typeof window.updateTutorialHighlight === 'function') {
                    window.updateTutorialHighlight();
                }
            }

            function toSvgPoint(evt) {
                const pt = svg.createSVGPoint();
                pt.x = evt.clientX;
                pt.y = evt.clientY;
                const inv = svg.getScreenCTM().inverse();
                return pt.matrixTransform(inv);
            }

            function onMove(evt) {
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                updateLinesAndWedge(dotX, dotY);
                
                // Update tooltip with mouse cursor position
                const mousePos = toSvgPoint(evt);
                updateCoordinateTooltip(mousePos.x, mousePos.y, evt.clientX, evt.clientY);
            }

            function onLeave() {
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                updateLinesAndWedge(dotX, dotY);
                
                // Hide tooltip when mouse leaves the court
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            }

            function onDotPointerDown(evt) {
                // Mostra l'alert se il movimento è "bloccato" ma permette comunque il movimento
                if (isColpitoreMovementLocked()) {
                    showColpitoreMovementAlert();
                }
                draggingDot = true;
                svg.setPointerCapture && svg.setPointerCapture(evt.pointerId);
                updateColpitoreDragState();
                evt.preventDefault();
            }

            function onDotPointerMove(evt) {
                if (!draggingDot) return;
                const p = toSvgPoint(evt);
                let clampedX = Math.max(SVG_X_MIN, Math.min(SVG_X_MAX, p.x));
                let clampedY = p.y;
                
                // Servizio mode: restrict to horizontal line only
                if (window.__shotTypeIsServizio__) {
                    if (isPlayer) {
                        // Campo A: y = 0 (ORIGIN_BOTTOM_Y = 822), x between -115 and 115
                        clampedY = ORIGIN_BOTTOM_Y;
                        clampedX = Math.max(ORIGIN_X - 115, Math.min(ORIGIN_X + 115, p.x));
                    } else {
                        // Campo B: y = 0 (ORIGIN_TOP_Y = 150), x between -115 and 115
                        clampedY = ORIGIN_TOP_Y;
                        clampedX = Math.max(ORIGIN_X - 115, Math.min(ORIGIN_X + 115, p.x));
                    }
                } else {
                    // Normal mode constraints
                    if (isPlayer) {
                        clampedY = Math.max(NET_Y + 1, Math.min(SVG_Y_MAX, p.y));
                    } else {
                        clampedY = Math.max(SVG_Y_MIN, Math.min(NET_Y, p.y));
                    }
                }
                
                if (dot) {
                    dot.setAttribute('cx', String(clampedX));
                    dot.setAttribute('cy', String(clampedY));
                    const dotX = parseFloat(dot.getAttribute('cx'));
                    const dotY = parseFloat(dot.getAttribute('cy'));
                    updateLinesAndWedge(dotX, dotY);
                    // Aggiorna l'highlight del tutorial se attivo
                    if (typeof window.updateTutorialHighlight === 'function') {
                        window.updateTutorialHighlight();
                    }
                }
            }

            function onDotPointerUp(evt) {
                draggingDot = false;
                svg.releasePointerCapture && svg.releasePointerCapture(evt.pointerId);
                updateColpitoreDragState();
            }

            function updateZones() {
                const zonesVisible = window.__viewZones__ !== false;
                
                if (isPlayer) {
                    // Tu mode: mostra zone nel Campo B (sopra la rete, y da 150 a 486)
                    if (zoneLine1) zoneLine1.style.display = zonesVisible ? '' : 'none';
                    if (zoneLine2) zoneLine2.style.display = zonesVisible ? '' : 'none';
                    if (zoneLine3) zoneLine3.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleA) zoneCircleA.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelA) zoneLabelA.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleB) zoneCircleB.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelB) zoneLabelB.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleC) zoneCircleC.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelC) zoneLabelC.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleD) zoneCircleD.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelD) zoneLabelD.style.display = zonesVisible ? '' : 'none';
                    
                    // Nascondi zone del Campo A
                    if (zoneLineA1) zoneLineA1.style.display = 'none';
                    if (zoneLineA2) zoneLineA2.style.display = 'none';
                    if (zoneLineA3) zoneLineA3.style.display = 'none';
                    if (zoneCircleAFieldA) zoneCircleAFieldA.style.display = 'none';
                    if (zoneLabelAFieldA) zoneLabelAFieldA.style.display = 'none';
                    if (zoneCircleBFieldA) zoneCircleBFieldA.style.display = 'none';
                    if (zoneLabelBFieldA) zoneLabelBFieldA.style.display = 'none';
                    if (zoneCircleCFieldA) zoneCircleCFieldA.style.display = 'none';
                    if (zoneLabelCFieldA) zoneLabelCFieldA.style.display = 'none';
                    if (zoneCircleDFieldA) zoneCircleDFieldA.style.display = 'none';
                    if (zoneLabelDFieldA) zoneLabelDFieldA.style.display = 'none';
                } else {
                    // Avversario mode: mostra zone nel Campo A (sotto la rete, y da 486 a 822)
                    if (zoneLine1) zoneLine1.style.display = 'none';
                    if (zoneLine2) zoneLine2.style.display = 'none';
                    if (zoneLine3) zoneLine3.style.display = 'none';
                    if (zoneCircleA) zoneCircleA.style.display = 'none';
                    if (zoneLabelA) zoneLabelA.style.display = 'none';
                    if (zoneCircleB) zoneCircleB.style.display = 'none';
                    if (zoneLabelB) zoneLabelB.style.display = 'none';
                    if (zoneCircleC) zoneCircleC.style.display = 'none';
                    if (zoneLabelC) zoneLabelC.style.display = 'none';
                    if (zoneCircleD) zoneCircleD.style.display = 'none';
                    if (zoneLabelD) zoneLabelD.style.display = 'none';
                    
                    // Mostra zone del Campo A
                    if (zoneLineA1) zoneLineA1.style.display = zonesVisible ? '' : 'none';
                    if (zoneLineA2) zoneLineA2.style.display = zonesVisible ? '' : 'none';
                    if (zoneLineA3) zoneLineA3.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleAFieldA) zoneCircleAFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelAFieldA) zoneLabelAFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleBFieldA) zoneCircleBFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelBFieldA) zoneLabelBFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleCFieldA) zoneCircleCFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelCFieldA) zoneLabelCFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneCircleDFieldA) zoneCircleDFieldA.style.display = zonesVisible ? '' : 'none';
                    if (zoneLabelDFieldA) zoneLabelDFieldA.style.display = zonesVisible ? '' : 'none';
                }
            }

            function applyViewToggles() {
                if (leftLine) leftLine.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (rightLine) rightLine.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (wedge) wedge.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (dot) dot.style.display = (window.__viewPlayer__ === false || window.__gioco__ === 'doppio') ? 'none' : '';
                if (yellowLine) yellowLine.style.display = (window.__viewShot__ === false) ? 'none' : '';
                if (bisectorLine) bisectorLine.style.display = (window.__viewCenter__ === false) ? 'none' : '';
                // Durante l'animazione "Visualizza Punto", nascondi sempre il campo da coprire
                const shouldHideCover = window.__viewCover__ === false || animazioneInCorso;
                if (hMeasure) hMeasure.style.display = shouldHideCover ? 'none' : '';
                if (hMeasureLabel) hMeasureLabel.style.display = shouldHideCover ? 'none' : '';
                if (hMeasureBadge) hMeasureBadge.style.display = shouldHideCover ? 'none' : '';
                if (arrowHtml) arrowHtml.style.display = shouldHideCover ? 'none' : 'block';
                updateZones();
                updateSecondaryCourtLock();
                updateSecondaryFromLeft();
                updateIntersectionDot();
            }

            // Doubles mode helpers
            function getDoppioColpitoreInfo(value) {
                switch (value) {
                    case 'giocatore1': return { dot: doppioA1, isPlayer: true };
                    case 'giocatore2': return { dot: doppioA2, isPlayer: true };
                    case 'avversario1': return { dot: doppioB1, isPlayer: false };
                    case 'avversario2': return { dot: doppioB2, isPlayer: false };
                    default: return { dot: doppioA1, isPlayer: true };
                }
            }

            function getActiveDoppioInfo() {
                return getDoppioColpitoreInfo(window.__doppioColpitore__);
            }

            function syncDotWithActiveColpitore() {
                const info = getActiveDoppioInfo();
                isPlayer = info.isPlayer;
                if (info.dot && dot) {
                    const x = parseFloat(info.dot.getAttribute('cx'));
                    const y = parseFloat(info.dot.getAttribute('cy'));
                    dot.setAttribute('cx', x);
                    dot.setAttribute('cy', y);
                }
                if (isPlayer) {
                    currentMeasureY = Math.max(SVG_Y_MIN, Math.min(NET_Y, currentMeasureY));
                } else {
                    currentMeasureY = Math.max(NET_Y, Math.min(SVG_Y_MAX, currentMeasureY));
                }
                updateArrowHtmlPosition();
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                updateLinesAndWedge(dotX, dotY);
                updateZones();
            }

            function updateDoppioColpitoreUI(isDoppio) {
                document.querySelectorAll('.singolare-colpitore').forEach(el => {
                    el.style.display = isDoppio ? 'none' : '';
                });
                document.querySelectorAll('.doppio-colpitore').forEach(el => {
                    el.style.display = isDoppio ? '' : 'none';
                });
                if (isDoppio) {
                    const radio = document.getElementById('colpitore_g1');
                    if (radio) { radio.checked = true; }
                    window.__doppioColpitore__ = 'giocatore1';
                } else {
                    const radio = document.getElementById('colpitore_tuo');
                    if (radio) { radio.checked = true; }
                    isPlayer = true;
                }
            }

            function resetDoppioDots() {
                if (doppioA1) { doppioA1.setAttribute('cx', DOPPIO_A1_DEFAULT.x); doppioA1.setAttribute('cy', DOPPIO_A1_DEFAULT.y); }
                if (doppioA2) { doppioA2.setAttribute('cx', DOPPIO_A2_DEFAULT.x); doppioA2.setAttribute('cy', DOPPIO_A2_DEFAULT.y); }
                if (doppioB1) { doppioB1.setAttribute('cx', DOPPIO_B1_DEFAULT.x); doppioB1.setAttribute('cy', DOPPIO_B1_DEFAULT.y); }
                if (doppioB2) { doppioB2.setAttribute('cx', DOPPIO_B2_DEFAULT.x); doppioB2.setAttribute('cy', DOPPIO_B2_DEFAULT.y); }
            }

            function applyDoppioMode(isDoppio) {
                if (isDoppio) {
                    resetDoppioDots();
                    doppioDots.forEach(d => { if (d) d.style.display = ''; });
                    updateDoppioColpitoreUI(true);
                    syncDotWithActiveColpitore();
                    applyViewToggles();
                } else {
                    doppioDots.forEach(d => { if (d) d.style.display = 'none'; });
                    updateDoppioColpitoreUI(false);
                    const originY = isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y;
                    if (dot) {
                        dot.setAttribute('cx', String(ORIGIN_X));
                        dot.setAttribute('cy', String(originY));
                    }
                    applyViewToggles();
                    updateLinesAndWedge(ORIGIN_X, originY);
                }
            }

            // Doubles dot dragging — listeners attached directly on each circle
            let draggingDoppioDot = null;
            let _doppioPointerId = null;

            function onDoppioPointerMove(evt) {
                if (!draggingDoppioDot) return;
                const p = toSvgPoint(evt);
                const clampedX = Math.max(SVG_X_MIN, Math.min(SVG_X_MAX, p.x));
                const clampedY = Math.max(SVG_Y_MIN, Math.min(SVG_Y_MAX, p.y));
                draggingDoppioDot.setAttribute('cx', clampedX);
                draggingDoppioDot.setAttribute('cy', clampedY);
                const info = getActiveDoppioInfo();
                if (draggingDoppioDot === info.dot) {
                    if (dot) {
                        dot.setAttribute('cx', clampedX);
                        dot.setAttribute('cy', clampedY);
                    }
                    updateLinesAndWedge(clampedX, clampedY);
                }
            }

            function onDoppioPointerUp() {
                if (draggingDoppioDot) {
                    draggingDoppioDot.style.cursor = 'grab';
                    draggingDoppioDot = null;
                    _doppioPointerId = null;
                }
            }

            window.addEventListener('pointermove', onDoppioPointerMove);
            window.addEventListener('pointerup', onDoppioPointerUp);

            doppioDots.forEach(circleEl => {
                if (!circleEl) return;
                circleEl.addEventListener('pointerdown', (evt) => {
                    if (window.__gioco__ !== 'doppio') return;
                    if (window.drawingEnabled) return;
                    draggingDoppioDot = circleEl;
                    _doppioPointerId = evt.pointerId;
                    circleEl.style.cursor = 'grabbing';
                    circleEl.setPointerCapture(evt.pointerId);
                    evt.preventDefault();
                    evt.stopPropagation();
                });
            });

            // Listen for gioco changes
            window.addEventListener('giocoChanged', () => {
                applyDoppioMode(window.__gioco__ === 'doppio');
            });

            (function initGraphics() {
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                updateArrowHtmlPosition();
                updateThemeColors();
                updateLinesAndWedge(dotX, dotY);
                setupSecondaryCourt();
                updateDinamicoPanel();
                applyViewToggles();
                updateTipologiaAvailability();
                updateVisualizationCheckboxes();
                if (window.__gioco__ === 'doppio') applyDoppioMode(true);
            })();

            svg.addEventListener('mousemove', onMove, { passive: true });
            svg.addEventListener('mouseenter', (evt) => {
                if (tooltip && window.__viewCoordinates__) {
                    // Initial position
                    const mousePos = toSvgPoint(evt);
                    updateCoordinateTooltip(mousePos.x, mousePos.y, evt.clientX, evt.clientY);
                }
            });
            svg.addEventListener('mouseleave', onLeave);
            if (dot) {
                dot.addEventListener('pointerdown', onDotPointerDown);
                window.addEventListener('pointermove', onDotPointerMove);
                window.addEventListener('pointerup', onDotPointerUp);
            }

            // Yellow line drag
            function onYellowPointerDown(evt) {
                if (!yellowLine) return;
                draggingYellow = true;
                yellowLine.setPointerCapture && yellowLine.setPointerCapture(evt.pointerId);
                evt.preventDefault();
            }
            function onYellowPointerMove(evt) {
                if (!draggingYellow || !yellowLine) return;
                const p = toSvgPoint(evt);
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                const targets = computePassYTargets(dotX, dotY);
                
                let xLeftAtH, xRightAtH;
                if (window.__shotTypeIsServizio__) {
                    // Servizio mode: use the actual target points
                    xLeftAtH = computeIntersectionX(dotX, dotY, targets.left.x, targets.left.y, currentMeasureY);
                    xRightAtH = computeIntersectionX(dotX, dotY, targets.right.x, targets.right.y, currentMeasureY);
                } else {
                    // Normal mode: use anchor points (passante-aware)
                    const anchors = getDirectionalAnchorPoints(dotX, dotY, targets);
                    xLeftAtH = computeIntersectionX(dotX, dotY, anchors.leftX, anchors.leftY, currentMeasureY);
                    xRightAtH = computeIntersectionX(dotX, dotY, anchors.rightX, anchors.rightY, currentMeasureY);
                }
                
                const minXAtH = Math.min(xLeftAtH, xRightAtH);
                const maxXAtH = Math.max(xLeftAtH, xRightAtH);
                const clampedX = Math.max(minXAtH, Math.min(maxXAtH, p.x));
                yellowEndX = clampedX;
                yellowLine.setAttribute('x1', String(dotX));
                yellowLine.setAttribute('y1', String(dotY));
                yellowLine.setAttribute('x2', String(clampedX));
                yellowLine.setAttribute('y2', String(currentMeasureY));
                updateSecondaryCourtLock();
                updateSecondaryFromLeft();
                updateIntersectionDot();
                // Aggiorna l'highlight del tutorial se attivo
                if (typeof window.updateTutorialHighlight === 'function') {
                    window.updateTutorialHighlight();
                }
            }
            function onYellowPointerUp(evt) {
                if (!yellowLine) return;
                draggingYellow = false;
                yellowLine.releasePointerCapture && yellowLine.releasePointerCapture(evt.pointerId);
            }
            if (yellowLine) {
                yellowLine.addEventListener('pointerdown', onYellowPointerDown);
                window.addEventListener('pointermove', onYellowPointerMove);
                window.addEventListener('pointerup', onYellowPointerUp);
            }

            // Intersection dot drag (yellow line + horizontal line simultaneously)
            function onIntersectionPointerDown(evt) {
                if (!intersectionDot) return;
                draggingIntersection = true;
                intersectionDot.setPointerCapture && intersectionDot.setPointerCapture(evt.pointerId);
                evt.preventDefault();
                evt.stopPropagation();
            }
            function onIntersectionPointerMove(evt) {
                if (!draggingIntersection || !intersectionDot) return;
                const p = toSvgPoint(evt);
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                const targets = computePassYTargets(dotX, dotY);
                
                // Update Y position (horizontal line)
                let newY;
                if (isPlayer) {
                    newY = Math.max(SVG_Y_MIN, Math.min(NET_Y, p.y));
                } else {
                    newY = Math.max(NET_Y, Math.min(SVG_Y_MAX, p.y));
                }
                currentMeasureY = newY;
                
                // Update X position (yellow line end)
                let xLeftAtH, xRightAtH;
                if (window.__shotTypeIsServizio__) {
                    xLeftAtH = computeIntersectionX(dotX, dotY, targets.left.x, targets.left.y, currentMeasureY);
                    xRightAtH = computeIntersectionX(dotX, dotY, targets.right.x, targets.right.y, currentMeasureY);
                } else {
                    const anchors = getDirectionalAnchorPoints(dotX, dotY, targets);
                    xLeftAtH = computeIntersectionX(dotX, dotY, anchors.leftX, anchors.leftY, currentMeasureY);
                    xRightAtH = computeIntersectionX(dotX, dotY, anchors.rightX, anchors.rightY, currentMeasureY);
                }
                const minXAtH = Math.min(xLeftAtH, xRightAtH);
                const maxXAtH = Math.max(xLeftAtH, xRightAtH);
                const clampedX = Math.max(minXAtH, Math.min(maxXAtH, p.x));
                
                yellowEndX = clampedX;
                
                // Update yellow line
                yellowLine.setAttribute('x1', String(dotX));
                yellowLine.setAttribute('y1', String(dotY));
                yellowLine.setAttribute('x2', String(clampedX));
                yellowLine.setAttribute('y2', String(currentMeasureY));
                
                // Update arrow position
                updateArrowHtmlPosition();
                
                // Update all visualizations
                updateLinesAndWedge(dotX, dotY);
                
                // Aggiorna l'highlight del tutorial se attivo
                if (typeof window.updateTutorialHighlight === 'function') {
                    window.updateTutorialHighlight();
                }
            }
            function onIntersectionPointerUp(evt) {
                if (!intersectionDot) return;
                draggingIntersection = false;
                intersectionDot.releasePointerCapture && intersectionDot.releasePointerCapture(evt.pointerId);
            }
            if (intersectionDot) {
                intersectionDot.addEventListener('pointerdown', onIntersectionPointerDown);
                window.addEventListener('pointermove', onIntersectionPointerMove);
                window.addEventListener('pointerup', onIntersectionPointerUp);
            }

            function handleTouchFriendlyPointerDown(evt) {
                if (!isMobileViewport()) return;
                if (evt.pointerType === 'mouse') return;
                if (window.drawingEnabled) return;
                if (window.__gioco__ === 'doppio') return;
                const targetNode = evt.target;
                if (targetNode === dot || targetNode === intersectionDot || targetNode === yellowLine || targetNode === arrowHtml) {
                    return;
                }
                const point = toSvgPoint(evt);
                let handled = false;
                if (dot && window.__viewPlayer__ !== false) {
                    const dotX = parseFloat(dot.getAttribute('cx'));
                    const dotY = parseFloat(dot.getAttribute('cy'));
                    const dotDistance = Math.hypot(point.x - dotX, point.y - dotY);
                    if (dotDistance <= TOUCH_PICK_RADIUS) {
                        // Mostra l'alert se il movimento è "bloccato" ma permette comunque il movimento
                        if (isColpitoreMovementLocked()) {
                            showColpitoreMovementAlert();
                        }
                        onDotPointerDown(evt);
                        onDotPointerMove(evt);
                        handled = true;
                    }
                }
                if (!handled && intersectionDot && intersectionDot.style.display !== 'none') {
                    const intersectionX = parseFloat(intersectionDot.getAttribute('cx'));
                    const intersectionY = parseFloat(intersectionDot.getAttribute('cy'));
                    const interDistance = Math.hypot(point.x - intersectionX, point.y - intersectionY);
                    if (interDistance <= TOUCH_PICK_RADIUS) {
                        onIntersectionPointerDown(evt);
                        onIntersectionPointerMove(evt);
                        handled = true;
                    }
                }
                if (!handled && yellowLine && window.__viewShot__ !== false) {
                    const x1 = parseFloat(yellowLine.getAttribute('x1'));
                    const y1 = parseFloat(yellowLine.getAttribute('y1'));
                    const x2 = parseFloat(yellowLine.getAttribute('x2'));
                    const y2 = parseFloat(yellowLine.getAttribute('y2'));
                    const lineDistance = distancePointToSegment(point.x, point.y, x1, y1, x2, y2);
                    if (lineDistance <= TOUCH_LINE_THRESHOLD) {
                        onYellowPointerDown(evt);
                        onYellowPointerMove(evt);
                        handled = true;
                    }
                }
                if (handled) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            }

            if (svg) {
                svg.addEventListener('pointerdown', handleTouchFriendlyPointerDown);
            }

            // Arrow drag
            (function initArrowDrag() {
                if (!arrowHtml) return;
                const onPointerDown = (evt) => {
                    draggingArrow = true;
                    arrowHtml.setPointerCapture && arrowHtml.setPointerCapture(evt.pointerId);
                    evt.preventDefault();
                };
                const onPointerMove = (evt) => {
                    if (!draggingArrow) return;
                    const p = toSvgPoint(evt);
                    let newY;
                    if (isPlayer) {
                        newY = Math.max(SVG_Y_MIN, Math.min(NET_Y, p.y));
                    } else {
                        newY = Math.max(NET_Y, Math.min(SVG_Y_MAX, p.y));
                    }
                    currentMeasureY = newY;
                    updateArrowHtmlPosition();
                    const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                    const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                    updateLinesAndWedge(dotX, dotY);
                };
                const onPointerUp = (evt) => {
                    draggingArrow = false;
                    arrowHtml.releasePointerCapture && arrowHtml.releasePointerCapture(evt.pointerId);
                };
                arrowHtml.addEventListener('pointerdown', onPointerDown);
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                window.addEventListener('resize', updateArrowHtmlPosition);
                window.addEventListener('resize', updateCourtsArrowPosition);
                
                // Chiama updateCourtsArrowPosition quando la pagina è completamente caricata
                // Questo risolve il problema quando la modalità 2colpi è quella di default
                if (document.readyState === 'loading') {
                    window.addEventListener('load', () => {
                        if (window.__modalita__ === '2colpi' && window.innerWidth > 900) {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    updateCourtsArrowPosition();
                                    // Riprova dopo un breve delay per assicurarsi che tutto sia renderizzato
                                    setTimeout(updateCourtsArrowPosition, 300);
                                });
                            });
                        }
                    });
                } else {
                    // Se il documento è già caricato, chiama direttamente
                    if (window.__modalita__ === '2colpi' && window.innerWidth > 900) {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                updateCourtsArrowPosition();
                                setTimeout(updateCourtsArrowPosition, 300);
                            });
                        });
                    }
                }
            })();

            // Colpitore change
            const colpitoreInputs = document.querySelectorAll('input[name="colpitore"]');
            if (colpitoreInputs && colpitoreInputs.length) {
                colpitoreInputs.forEach((inp) => {
                    inp.addEventListener('change', (e) => {
                        const val = e.target && e.target.value ? e.target.value : 'tuo';

                        // Doppio mode: handle 4-player colpitore
                        if (window.__gioco__ === 'doppio') {
                            const prevIsPlayer = isPlayer;
                            window.__doppioColpitore__ = val;
                            const info = getDoppioColpitoreInfo(val);
                            isPlayer = info.isPlayer;
                            if (prevIsPlayer !== isPlayer) {
                                currentMeasureY = 2 * NET_Y - currentMeasureY;
                            }
                            if (isPlayer) {
                                currentMeasureY = Math.max(SVG_Y_MIN, Math.min(NET_Y, currentMeasureY));
                            } else {
                                currentMeasureY = Math.max(NET_Y, Math.min(SVG_Y_MAX, currentMeasureY));
                            }
                            updateArrowHtmlPosition();
                            syncDotWithActiveColpitore();
                            return;
                        }

                        // Singolare mode
                        isPlayer = (val === 'tuo');
                        
                        // Mirror measure Y
                        currentMeasureY = 2 * NET_Y - currentMeasureY;
                        if (isPlayer) {
                            currentMeasureY = Math.max(SVG_Y_MIN, Math.min(NET_Y, currentMeasureY));
                        } else {
                            currentMeasureY = Math.max(NET_Y, Math.min(SVG_Y_MAX, currentMeasureY));
                        }
                        updateArrowHtmlPosition();

                        // Reposition dot to origin
                        if (dot) {
                            const originY = isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y;
                            dot.setAttribute('cx', String(ORIGIN_X));
                            dot.setAttribute('cy', String(originY));
                        }
                        const dotX = ORIGIN_X;
                        const dotY = isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y;
                        updateLinesAndWedge(dotX, dotY);
                        updateZones();
                    });
                });
            }

            // Tipologia change
            const tipologiaInputs = document.querySelectorAll('input[name="tipologia"]');
            if (tipologiaInputs && tipologiaInputs.length) {
                tipologiaInputs.forEach((inp) => {
                    inp.addEventListener('change', (e) => {
                        const val = e.target && e.target.value ? e.target.value : 'palleggio';
                        window.__shotTypeIsPassante__ = (val === 'passante');
                        window.__shotType2IsPassante__ = (val === 'passante');
                        window.__shotTypeIsServizio__ = (val === 'servizio');
                        
                        // In modalità attacco: sinistra palleggio (logica blu), destra passante (logica rossa)
                        if (val === 'attacco') {
                            window.__shotTypeIsPassante__ = false; // sinistra con logica palleggio
                            window.__shotType2IsPassante__ = true;  // destra con logica passante
                            window.__leftForceRed__ = false; // sinistra rimane blu
                        } else {
                            window.__leftForceRed__ = false; // rimuovi override colore
                        }
                        
                        // Servizio mode: position dot on horizontal line
                        if (window.__shotTypeIsServizio__) {
                            if (dot) {
                                const originY = isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y;
                                // Posiziona il pallino a coordinate (20; 0) nel sistema di coordinate del campo
                                // Per Campo A (Tu): X = 20 significa 20 unità a destra del centro, Y = 0 sulla linea di fondo
                                // SVG: X = ORIGIN_X + 20 = 320, Y = ORIGIN_BOTTOM_Y (822) per Tu, ORIGIN_TOP_Y (150) per Avversario
                                const servizioOffsetX = 20; // Offset di 20 unità dal centro
                                const dotXServizio = isPlayer ? ORIGIN_X + servizioOffsetX : ORIGIN_X - servizioOffsetX;
                                dot.setAttribute('cx', String(dotXServizio));
                                dot.setAttribute('cy', String(originY));
                            }
                        }
                        
                        if (window.__shotTypeIsPassante__) {
                            const targetYCampoB = 380;
                            currentMeasureY = isPlayer ? targetYCampoB : (2 * NET_Y - targetYCampoB);
                            updateArrowHtmlPosition();
                        } else {
                            const defaultYCampoB = ORIGIN_TOP_Y - 50;
                            currentMeasureY = isPlayer ? defaultYCampoB : (2 * NET_Y - defaultYCampoB);
                            updateArrowHtmlPosition();
                        }
                        
                        updateThemeColors();
                        updateThemeColorsRight();
                        const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                        const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                        updateLinesAndWedge(dotX, dotY);
                        updateTipologiaAvailability();
                    });
                });
            }

            // Campo type change
            const campoTypeInputs = document.querySelectorAll('input[name="campoType"]');
            if (campoTypeInputs && campoTypeInputs.length) {
                campoTypeInputs.forEach((inp) => {
                    inp.addEventListener('change', (e) => {
                        const val = e.target && e.target.value ? e.target.value : 'cemento';
                        updateCourtColors(val);
                    });
                });
            }

            // Modalità change
            const modalitaInputs = document.querySelectorAll('input[name="modalita"]');
            if (modalitaInputs && modalitaInputs.length) {
                modalitaInputs.forEach((inp) => {
                    inp.addEventListener('change', (e) => {
                        const val = e.target && e.target.value ? e.target.value : '1colpo';
                        window.__modalita__ = val;
                        
                        // Reset flag alert quando si cambia modalità
                        resetColpitoreAlertFlag();
                        
                        // Handle different modes
                        if (val === '1colpo') {
                            // Single shot mode - show only primary court
                            document.querySelector('.court-container:last-of-type').style.display = 'none';
                            document.body.classList.add('mobile-1colpo');
                            document.body.classList.remove('mobile-2colpi', 'mobile-dinamico');
                        } else if (val === '2colpi') {
                            // Two shots mode - show both courts
                            document.querySelector('.court-container:last-of-type').style.display = 'flex';
                            document.body.classList.add('mobile-2colpi');
                            document.body.classList.remove('mobile-1colpo', 'mobile-dinamico');
                        } else if (val === 'dinamico') {
                            // Dynamic mode - show panel in right container
                            document.querySelector('.court-container:last-of-type').style.display = 'flex';
                            document.body.classList.add('mobile-dinamico');
                            document.body.classList.remove('mobile-1colpo', 'mobile-2colpi');
                        }
                        
                        // Update the display
                        updateDinamicoPanel();
                        updateSecondaryCourtLock();
                        
                        // Reset previousShotWasAttacco e previousShotWasPassante quando si cambia modalità
                        previousShotWasAttacco = false;
                        previousShotWasPassante = false;
                        
                        updateTipologiaAvailability();
                        updateVisualizationCheckboxes();
                        const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                        const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                        updateLinesAndWedge(dotX, dotY);
                        updateIntersectionDot();
                        if (isMobileViewport()) {
                            setMobileSecondaryVisible(false);
                        }
                        updateMobilePanels();
                        syncMobileDinamicoPanel(true);
                        updateColpitoreDragState();
                        
                        // Update mode indicator
                        updateModeIndicator(val);
                        updateDownloadButtonVisibility(val);
                        
                        // Aggiorna la posizione della freccia tra i campi
                        updateCourtsArrowPosition();
                        
                        // Aggiorna la modalità sidebar della guida se aperta
                        if (typeof window.updateDesktopTutorialSidebar === 'function') {
                            window.updateDesktopTutorialSidebar();
                        }
                    });
                });
                
                // Inizializza la classe basandosi sul valore iniziale
                const initialModalita = document.querySelector('input[name="modalita"]:checked');
                if (initialModalita) {
                    const initialVal = initialModalita.value;
                    window.__modalita__ = initialVal;
                    if (initialVal === '1colpo') {
                        document.body.classList.add('mobile-1colpo');
                        document.body.classList.remove('mobile-2colpi', 'mobile-dinamico');
                    } else if (initialVal === '2colpi') {
                        document.body.classList.add('mobile-2colpi');
                        document.body.classList.remove('mobile-1colpo', 'mobile-dinamico');
                    } else if (initialVal === 'dinamico') {
                        document.body.classList.add('mobile-dinamico');
                        document.body.classList.remove('mobile-1colpo', 'mobile-2colpi');
                    }
                    // Initialize download button visibility
                    updateDownloadButtonVisibility(initialVal);
                    
                    // Inizializza la posizione della freccia tra i campi
                    // Usa requestAnimationFrame per assicurarsi che il layout sia completo
                    if (initialVal === '2colpi') {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                updateCourtsArrowPosition();
                                // Riprova dopo un breve delay per assicurarsi che tutto sia renderizzato
                                setTimeout(updateCourtsArrowPosition, 200);
                            });
                        });
                    }
                }
            }
            
            // Funzione per aggiornare la posizione della freccia all'altezza della rete
            function updateCourtsArrowPosition() {
                const courtsArrow = document.getElementById('courtsArrow');
                if (!courtsArrow) return;
                
                // Solo su desktop e in modalità 2 colpi
                if (window.innerWidth <= 900 || window.__modalita__ !== '2colpi') {
                    return;
                }
                
                const primaryCourt = document.querySelector('.court-container.primary-court');
                if (!primaryCourt) return;
                
                // Ottieni il page-container come riferimento
                const pageContainer = document.querySelector('.page-container');
                if (!pageContainer) return;
                
                // Ottieni le posizioni e dimensioni
                const pageRect = pageContainer.getBoundingClientRect();
                const courtRect = primaryCourt.getBoundingClientRect();
                
                // Verifica che i campi abbiano dimensioni valide
                if (courtRect.height <= 0 || pageRect.height <= 0) {
                    // Se le dimensioni non sono ancora disponibili, riprova dopo un breve delay
                    requestAnimationFrame(() => {
                        setTimeout(updateCourtsArrowPosition, 50);
                    });
                    return;
                }
                
                // Nel viewBox SVG, la rete è a NET_Y = 486
                // Il campo visibile va da ORIGIN_TOP_Y (150) a ORIGIN_BOTTOM_Y (822)
                // Quindi la rete è a: 486 - 150 = 336 pixel dal top del campo visibile
                // Su un'altezza totale del campo visibile di: 822 - 150 = 672 pixel
                // Percentuale: 336 / 672 = 0.5 = 50% (centro del campo)
                
                const courtTop = courtRect.top - pageRect.top;
                const courtHeight = courtRect.height;
                
                // La rete è al 50% dell'altezza del campo visibile
                // Calcoliamo la posizione assoluta della rete nel campo
                const netPosition = courtTop + (courtHeight / 2);
                
                // Verifica che la posizione calcolata sia ragionevole
                // La freccia dovrebbe essere all'interno del page-container
                if (netPosition < pageRect.top || netPosition > pageRect.bottom) {
                    // Posizione non valida, riprova dopo un breve delay
                    requestAnimationFrame(() => {
                        setTimeout(updateCourtsArrowPosition, 50);
                    });
                    return;
                }
                
                // Posiziona la freccia all'altezza della rete, centrata orizzontalmente
                courtsArrow.style.position = 'absolute';
                courtsArrow.style.top = `${netPosition}px`;
                courtsArrow.style.left = '62%';
                courtsArrow.style.transform = 'translate(-50%, -50%)';
            }
            
            // Event listeners for download type selection (2 colpi mode)
            const downloadTypeInputs = document.querySelectorAll('input[name="downloadType"]');
            downloadTypeInputs.forEach(function(input) {
                input.addEventListener('change', function() {
                    updateSingleCourtOptions();
                });
            });
            
            // Download button event listener
            const downloadCourtButton = document.getElementById('downloadCourtImage');
            if (downloadCourtButton) {
                downloadCourtButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    downloadCourtImage();
                });
            }
            
            // Download court image function
            function downloadCourtImage() {
                const currentMode = window.__modalita__;
                
                // Modalità dinamico: scarica sempre immagine di un singolo colpo
                if (currentMode === 'dinamico') {
                    downloadDinamicoSingleShot();
                    return;
                }
                
                // Modalità 1 colpo: scarica direttamente il campo principale
                if (currentMode === '1colpo') {
                    const svgElement = document.getElementById('tennisCourt');
                    if (!svgElement) {
                        alert('Errore: elemento SVG non trovato');
                        return;
                    }
                    svgToCanvas(svgElement, 2).then(function(canvas) {
                        downloadCanvas(canvas, 'campo-tennis-' + new Date().getTime() + '.png');
                    }).catch(function(error) {
                        console.error('Errore durante il download:', error);
                        alert('Errore: ' + error.message);
                    });
                    return;
                }
                
                // Modalità 2 colpi
                const downloadTypeOption = document.querySelector('input[name="downloadType"]:checked');
                if (!downloadTypeOption) {
                    alert('Seleziona prima cosa vuoi scaricare');
                    return;
                }
                
                const downloadType = downloadTypeOption.value;
                
                try {
                    if (downloadType === 'both') {
                        // Download both courts side by side
                        downloadBothCourts();
                    } else {
                        // Download single court - get which court
                        const selectedCourt = document.querySelector('input[name="downloadCourt"]:checked');
                        const courtType = selectedCourt ? selectedCourt.value : 'primary';
                        
                        const svgSelector = courtType === 'secondary' 
                            ? '.svg-wrap.secondary svg' 
                            : '#tennisCourt';
                        
                        const svgElement = document.querySelector(svgSelector);
                        if (!svgElement) {
                            console.error('SVG element not found:', svgSelector);
                            alert('Errore: elemento SVG non trovato');
                            return;
                        }
                        
                        svgToCanvas(svgElement, 2).then(function(canvas) {
                            downloadCanvas(canvas, 'campo-tennis-' + courtType + '-' + new Date().getTime() + '.png');
                        }).catch(function(error) {
                            console.error('Errore durante il download:', error);
                            alert('Errore: ' + error.message);
                        });
                    }
                } catch (error) {
                    console.error('Errore durante il download dell\'immagine:', error);
                    alert('Errore: ' + error.message);
                }
            }
            
            // Download single shot image in dinamico mode
            function downloadDinamicoSingleShot() {
                const shotNumberInput = document.getElementById('download_shot_number');
                if (!shotNumberInput) {
                    alert('Errore: campo numero colpo non trovato');
                    return;
                }
                
                const shotNumber = parseInt(shotNumberInput.value, 10);
                if (isNaN(shotNumber) || shotNumber < 1) {
                    alert('Inserisci un numero di colpo valido');
                    return;
                }
                
                const executedShots = Array.isArray(shotHistory) ? shotHistory.length : 0;
                const maxShots = Math.max(executedShots + 1, 1);
                if (shotNumber > maxShots) {
                    alert('Il numero di colpo selezionato non è valido. Puoi scegliere da 1 a ' + maxShots + '.');
                    return;
                }
                
                // Salva lo stato corrente completo
                const currentState = saveCurrentState();
                
                // Determina lo stato del colpo richiesto
                let targetState = null;
                if (shotNumber <= executedShots) {
                    targetState = shotHistory[shotNumber - 1];
                } else {
                    // Colpo non ancora eseguito ma attualmente configurato (es. colpo successivo)
                    targetState = currentState;
                }
                
                if (!targetState) {
                    alert('Errore: stato del colpo non trovato');
                    return;
                }
                
                // Se il colpo richiesto è diverso dallo stato corrente, ripristina quello stato
                const needRestore = targetState !== currentState;
                if (needRestore) {
                    restoreState(targetState);
                }
                
                // Attendi un attimo che lo stato venga applicato, poi cattura l'immagine
                setTimeout(function() {
                    const svgElement = document.getElementById('tennisCourt');
                    if (!svgElement) {
                        alert('Errore: elemento SVG non trovato');
                        if (needRestore) {
                            restoreState(currentState);
                        }
                        return;
                    }
                    
                    svgToCanvas(svgElement, 2).then(function(canvas) {
                        downloadCanvas(canvas, 'campo-tennis-colpo-' + shotNumber + '-' + new Date().getTime() + '.png');
                        // Ripristina lo stato originale
                        if (needRestore) {
                            restoreState(currentState);
                        }
                    }).catch(function(error) {
                        console.error('Errore durante il download:', error);
                        alert('Errore: ' + error.message);
                        if (needRestore) {
                            restoreState(currentState);
                        }
                    });
                }, 100);
            }
            
            // Download both courts side by side
            function downloadBothCourts() {
                const primarySvg = document.getElementById('tennisCourt');
                const secondarySvg = document.querySelector('.svg-wrap.secondary svg');
                
                if (!primarySvg) {
                    alert('Errore: campo principale non trovato');
                    return;
                }
                
                if (!secondarySvg) {
                    alert('Errore: campo secondario non trovato');
                    return;
                }
                
                Promise.all([
                    svgToCanvas(primarySvg, 2),
                    svgToCanvas(secondarySvg, 2)
                ]).then(function(canvases) {
                    const primaryCanvas = canvases[0];
                    const secondaryCanvas = canvases[1];
                    
                    // Create a combined canvas
                    const combinedCanvas = document.createElement('canvas');
                    const ctx = combinedCanvas.getContext('2d');
                    const gap = 40; // Gap between courts
                    const width = primaryCanvas.width + secondaryCanvas.width + gap;
                    const height = Math.max(primaryCanvas.height, secondaryCanvas.height);
                    
                    combinedCanvas.width = width;
                    combinedCanvas.height = height;
                    
                    // Fill background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    
                    // Draw primary court
                    ctx.drawImage(primaryCanvas, 0, 0);
                    
                    // Draw secondary court
                    ctx.drawImage(secondaryCanvas, primaryCanvas.width + gap, 0);
                    
                    downloadCanvas(combinedCanvas, 'campo-tennis-entrambi-' + new Date().getTime() + '.png');
                }).catch(function(error) {
                    console.error('Errore durante il download di entrambi i campi:', error);
                    alert('Errore: ' + error.message);
                });
            }
            
            // Helper function to download canvas as PNG
            function downloadCanvas(canvas, filename) {
                canvas.toBlob(function(blob) {
                    if (blob) {
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        
                        // Trigger download
                        setTimeout(function() {
                            link.click();
                            
                            // Clean up after a delay
                            setTimeout(function() {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(downloadUrl);
                            }, 200);
                        }, 50);
                    } else {
                        console.error('Errore: blob non creato');
                        alert('Errore durante la creazione dell\'immagine. Il blob non è stato generato.');
                    }
                }, 'image/png', 1.0);
            }
            
            // Helper function to convert SVG to Canvas
            function svgToCanvas(svgElement, scale) {
                return new Promise(function(resolve, reject) {
                    try {
                        const svgData = new XMLSerializer().serializeToString(svgElement);
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);
                        
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width * scale;
                            canvas.height = img.height * scale;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            URL.revokeObjectURL(url);
                            resolve(canvas);
                        };
                        img.onerror = function(error) {
                            URL.revokeObjectURL(url);
                            reject(error);
                        };
                        img.src = url;
                    } catch (error) {
                        reject(error);
                    }
                });
            }
            
            // Update mode indicator (icon and text)
            function updateModeIndicator(mode) {
                const mobileIcon = document.getElementById('mobileNavModalitaIcon');
                const desktopIndicator = document.getElementById('currentModeIndicator');
                const topBarIcon = document.getElementById('topBarModalitaIcon');
                
                let iconText = '2';
                let labelText = '2 Colpi';
                
                if (mode === '1colpo') {
                    iconText = '1';
                    labelText = '1 Colpo';
                } else if (mode === '2colpi') {
                    iconText = '2';
                    labelText = '2 Colpi';
                } else if (mode === 'dinamico') {
                    iconText = 'D';
                    labelText = 'Dinamico';
                }
                
                if (mobileIcon) {
                    mobileIcon.textContent = iconText;
                }
                if (desktopIndicator) {
                    desktopIndicator.textContent = labelText;
                }
                if (topBarIcon) {
                    topBarIcon.textContent = iconText;
                }
                
                // Show/hide download button based on mode
                updateDownloadButtonVisibility(mode);
            }
            
            // Update download button visibility based on mode
            function updateDownloadButtonVisibility(mode) {
                const downloadButton = document.getElementById('downloadCourtImage');
                const downloadOptions = document.getElementById('downloadOptions');
                const downloadOptions2Colpi = document.getElementById('downloadOptions2Colpi');
                const downloadOptionsDinamico = document.getElementById('downloadOptionsDinamico');
                const singleCourtOptions = document.getElementById('singleCourtOptions');
                const singleShotOptions = document.getElementById('singleShotOptions');
                const secondaryLabel = document.getElementById('download_secondary_label');
                
                if (downloadButton) {
                    if (mode === '1colpo' || mode === '2colpi' || mode === 'dinamico') {
                        downloadButton.style.display = 'flex';
                        
                        if (mode === '1colpo') {
                            // In modalità 1 colpo, nascondi tutte le opzioni e mostra solo il pulsante
                            if (downloadOptions) downloadOptions.style.display = 'none';
                            if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                            if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                            if (singleCourtOptions) singleCourtOptions.style.display = 'none';
                            if (singleShotOptions) singleShotOptions.style.display = 'none';
                            // Seleziona automaticamente "Solo un campo" e "Primo Colpo" per uso interno
                            const singleRadio = document.getElementById('download_single');
                            const primaryRadio = document.getElementById('download_primary');
                            if (singleRadio) singleRadio.checked = true;
                            if (primaryRadio) primaryRadio.checked = true;
                        } else if (mode === '2colpi') {
                            // In modalità 2 colpi, mostra le opzioni per 2 colpi
                            if (downloadOptions) downloadOptions.style.display = 'block';
                            if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'block';
                            if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                            if (secondaryLabel) secondaryLabel.style.display = 'flex';
                            // Default: "Entrambi i Campi" selezionato
                            const bothRadio = document.getElementById('download_both');
                            const singleRadio = document.getElementById('download_single');
                            if (bothRadio) bothRadio.checked = true;
                            if (singleRadio) singleRadio.checked = false;
                            if (singleCourtOptions) singleCourtOptions.style.display = 'none';
                        } else if (mode === 'dinamico') {
                            // In modalità dinamico, mostra solo le opzioni per selezionare il numero del colpo
                            if (downloadOptions) downloadOptions.style.display = 'block';
                            if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                            if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'block';
                            if (singleShotOptions) singleShotOptions.style.display = 'block';
                            
                            // Aggiorna il massimo numero di colpi disponibile (colpi eseguiti + colpo corrente)
                            const shotNumberInput = document.getElementById('download_shot_number');
                            if (shotNumberInput) {
                                const executedShots = Array.isArray(shotHistory) ? shotHistory.length : 0;
                                const maxShots = Math.max(executedShots + 1, 1);
                                shotNumberInput.max = maxShots;
                                const currentValue = parseInt(shotNumberInput.value) || 1;
                                shotNumberInput.value = Math.min(Math.max(currentValue, 1), maxShots);
                            }
                        }
                    } else {
                        downloadButton.style.display = 'none';
                        if (downloadOptions) downloadOptions.style.display = 'none';
                        if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                        if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                        if (singleCourtOptions) singleCourtOptions.style.display = 'none';
                        if (singleShotOptions) singleShotOptions.style.display = 'none';
                    }
                }
            }
            
            // Update single court options visibility
            function updateSingleCourtOptions() {
                const downloadType = document.querySelector('input[name="downloadType"]:checked');
                const singleCourtOptions = document.getElementById('singleCourtOptions');
                
                if (downloadType && singleCourtOptions) {
                    if (downloadType.value === 'single') {
                        singleCourtOptions.style.display = 'block';
                    } else {
                        singleCourtOptions.style.display = 'none';
                    }
                }
            }
            
            // Update single shot options visibility and max value for dinamico mode
            function updateSingleShotOptions() {
                const shotNumberInput = document.getElementById('download_shot_number');
                if (shotNumberInput) {
                    const executedShots = Array.isArray(shotHistory) ? shotHistory.length : 0;
                    const maxShots = Math.max(executedShots + 1, 1);
                    shotNumberInput.max = maxShots;
                    const currentValue = parseInt(shotNumberInput.value) || 1;
                    shotNumberInput.value = Math.min(Math.max(currentValue, 1), maxShots);
                }
            }
            
            // Helper function to convert SVG to canvas
            function svgToCanvas(svgElement, scale = 2) {
                return new Promise(function(resolve, reject) {
                    try {
                        // Get viewBox or dimensions
                        const viewBox = svgElement.viewBox.baseVal;
                        const svgWidth = viewBox.width || parseFloat(svgElement.getAttribute('width')) || 600;
                        const svgHeight = viewBox.height || parseFloat(svgElement.getAttribute('height')) || 1006;
                        
                        // Clone the SVG to avoid modifying the original
                        const clonedSvg = svgElement.cloneNode(true);
                        
                        // Set explicit pixel dimensions on the clone
                        clonedSvg.setAttribute('width', svgWidth);
                        clonedSvg.setAttribute('height', svgHeight);
                        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                        
                        // Get computed background color
                        const computedStyle = window.getComputedStyle(svgElement);
                        const bgColor = computedStyle.backgroundColor || '#1565c0';
                        
                        // Serialize SVG to string
                        const serializer = new XMLSerializer();
                        let svgString = serializer.serializeToString(clonedSvg);
                        
                        // Encode SVG string for data URL
                        const encodedSvg = encodeURIComponent(svgString);
                        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodedSvg;
                        
                        // Create an image to convert SVG to canvas
                        const img = new Image();
                        
                        img.onload = function() {
                            try {
                                // Create a canvas with the same dimensions
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const width = img.width * scale;
                                const height = img.height * scale;
                                
                                canvas.width = width;
                                canvas.height = height;
                                
                                // Fill background
                                ctx.fillStyle = bgColor;
                                ctx.fillRect(0, 0, width, height);
                                
                                // Draw the SVG image on the canvas
                                ctx.drawImage(img, 0, 0, width, height);
                                
                                resolve(canvas);
                            } catch (error) {
                                reject(error);
                            }
                        };
                        
                        img.onerror = function(error) {
                            reject(new Error('Errore nel caricamento dell\'immagine SVG'));
                        };
                        
                        // Set timeout for image loading
                        const timeout = setTimeout(function() {
                            reject(new Error('Timeout nel caricamento dell\'immagine'));
                        }, 10000);
                        
                        const originalOnload = img.onload;
                        img.onload = function() {
                            clearTimeout(timeout);
                            if (originalOnload) originalOnload.call(this);
                        };
                        
                        // Load the SVG as data URL
                        img.src = dataUrl;
                    } catch (error) {
                        reject(error);
                    }
                });
            }
            
            // Download court image function
            function downloadCourtImage() {
                console.log('Inizio download immagine campo...');
                
                const currentMode = window.__modalita__;
                
                // Modalità dinamico: scarica sempre immagine di un singolo colpo
                if (currentMode === 'dinamico') {
                    downloadDinamicoSingleShot();
                    return;
                }
                
                // Modalità 1 colpo: scarica direttamente il campo principale
                if (currentMode === '1colpo') {
                    const svgElement = document.getElementById('tennisCourt');
                    if (!svgElement) {
                        alert('Errore: elemento SVG non trovato');
                        return;
                    }
                    svgToCanvas(svgElement, 2).then(function(canvas) {
                        downloadCanvas(canvas, 'campo-tennis-' + new Date().getTime() + '.png');
                    }).catch(function(error) {
                        console.error('Errore durante il download:', error);
                        alert('Errore: ' + error.message);
                    });
                    return;
                }
                
                // Modalità 2 colpi
                const downloadTypeOption = document.querySelector('input[name="downloadType"]:checked');
                if (!downloadTypeOption) {
                    alert('Seleziona prima cosa vuoi scaricare');
                    return;
                }
                
                const downloadType = downloadTypeOption.value;
                console.log('Tipo di download selezionato:', downloadType);
                
                try {
                    if (downloadType === 'both') {
                        // Download both courts side by side
                        downloadBothCourts();
                    } else {
                        // Download single court - get which court
                        const selectedCourt = document.querySelector('input[name="downloadCourt"]:checked');
                        const courtType = selectedCourt ? selectedCourt.value : 'primary';
                        
                        console.log('Campo selezionato:', courtType);
                        
                        const svgSelector = courtType === 'secondary' 
                            ? '.svg-wrap.secondary svg' 
                            : '#tennisCourt';
                        
                        const svgElement = document.querySelector(svgSelector);
                        if (!svgElement) {
                            console.error('SVG element not found:', svgSelector);
                            alert('Errore: elemento SVG non trovato');
                            return;
                        }
                        
                        svgToCanvas(svgElement, 2).then(function(canvas) {
                            downloadCanvas(canvas, 'campo-tennis-' + courtType + '-' + new Date().getTime() + '.png');
                        }).catch(function(error) {
                            console.error('Errore durante il download:', error);
                            alert('Errore: ' + error.message);
                        });
                    }
                } catch (error) {
                    console.error('Errore durante il download dell\'immagine:', error);
                    alert('Errore: ' + error.message);
                }
            }
            
            // Download single shot image in dinamico mode
            function downloadDinamicoSingleShot() {
                const shotNumberInput = document.getElementById('download_shot_number');
                if (!shotNumberInput) {
                    alert('Errore: campo numero colpo non trovato');
                    return;
                }
                
                const shotNumber = parseInt(shotNumberInput.value, 10);
                if (isNaN(shotNumber) || shotNumber < 1) {
                    alert('Inserisci un numero di colpo valido');
                    return;
                }
                
                const executedShots = Array.isArray(shotHistory) ? shotHistory.length : 0;
                const maxShots = Math.max(executedShots + 1, 1);
                if (shotNumber > maxShots) {
                    alert('Il numero di colpo selezionato non è valido. Puoi scegliere da 1 a ' + maxShots + '.');
                    return;
                }
                
                console.log('Download immagine colpo numero:', shotNumber);
                
                // Salva lo stato corrente completo
                const currentState = saveCurrentState();
                
                // Determina lo stato del colpo richiesto
                let targetState = null;
                if (shotNumber <= executedShots) {
                    targetState = shotHistory[shotNumber - 1];
                } else {
                    // Colpo non ancora eseguito ma attualmente configurato (es. colpo successivo)
                    targetState = currentState;
                }
                
                if (!targetState) {
                    alert('Errore: stato del colpo non trovato');
                    return;
                }
                
                // Se il colpo richiesto è diverso dallo stato corrente, ripristina quello stato
                const needRestore = targetState !== currentState;
                if (needRestore) {
                    restoreState(targetState);
                }
                
                // Attendi un attimo che lo stato venga applicato, poi cattura l'immagine
                setTimeout(function() {
                    const svgElement = document.getElementById('tennisCourt');
                    if (!svgElement) {
                        alert('Errore: elemento SVG non trovato');
                        if (needRestore) {
                            restoreState(currentState);
                        }
                        return;
                    }
                    
                    svgToCanvas(svgElement, 2).then(function(canvas) {
                        downloadCanvas(canvas, 'campo-tennis-colpo-' + shotNumber + '-' + new Date().getTime() + '.png');
                        // Ripristina lo stato originale
                        if (needRestore) {
                            restoreState(currentState);
                        }
                    }).catch(function(error) {
                        console.error('Errore durante il download:', error);
                        alert('Errore: ' + error.message);
                        if (needRestore) {
                            restoreState(currentState);
                        }
                    });
                }, 100);
            }
            
            // Download both courts side by side
            function downloadBothCourts() {
                const primarySvg = document.getElementById('tennisCourt');
                const secondarySvg = document.querySelector('.svg-wrap.secondary svg');
                
                if (!primarySvg) {
                    alert('Errore: campo principale non trovato');
                    return;
                }
                
                if (!secondarySvg) {
                    alert('Errore: campo secondario non trovato');
                    return;
                }
                
                Promise.all([
                    svgToCanvas(primarySvg, 2),
                    svgToCanvas(secondarySvg, 2)
                ]).then(function(canvases) {
                    const primaryCanvas = canvases[0];
                    const secondaryCanvas = canvases[1];
                    
                    // Create a combined canvas
                    const combinedCanvas = document.createElement('canvas');
                    const ctx = combinedCanvas.getContext('2d');
                    const gap = 40; // Gap between courts
                    const width = primaryCanvas.width + secondaryCanvas.width + gap;
                    const height = Math.max(primaryCanvas.height, secondaryCanvas.height);
                    
                    combinedCanvas.width = width;
                    combinedCanvas.height = height;
                    
                    // Fill background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    
                    // Draw primary court
                    ctx.drawImage(primaryCanvas, 0, 0);
                    
                    // Draw secondary court
                    ctx.drawImage(secondaryCanvas, primaryCanvas.width + gap, 0);
                    
                    downloadCanvas(combinedCanvas, 'campo-tennis-entrambi-' + new Date().getTime() + '.png');
                }).catch(function(error) {
                    console.error('Errore durante il download di entrambi i campi:', error);
                    alert('Errore: ' + error.message);
                });
            }
            
            // Helper function to download canvas as PNG
            function downloadCanvas(canvas, filename) {
                canvas.toBlob(function(blob) {
                    if (blob) {
                        console.log('Blob creato, dimensione:', blob.size, 'bytes');
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        
                        // Trigger download
                        setTimeout(function() {
                            link.click();
                            console.log('Click sul link di download eseguito');
                            
                            // Clean up after a delay
                            setTimeout(function() {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(downloadUrl);
                                console.log('Download completato!');
                            }, 200);
                        }, 50);
                    } else {
                        console.error('Errore: blob non creato');
                        alert('Errore durante la creazione dell\'immagine. Il blob non è stato generato.');
                    }
                }, 'image/png', 1.0);
            }
            
            // Update download button visibility based on mode
            function updateDownloadButtonVisibility(mode) {
                const downloadButton = document.getElementById('downloadCourtImage');
                const downloadOptions = document.getElementById('downloadOptions');
                const downloadOptions2Colpi = document.getElementById('downloadOptions2Colpi');
                const downloadOptionsDinamico = document.getElementById('downloadOptionsDinamico');
                const singleCourtOptions = document.getElementById('singleCourtOptions');
                
                if (downloadButton) {
                    if (mode === '1colpo') {
                        // Modalità 1 colpo: mostra solo il pulsante, nascondi le opzioni
                        downloadButton.style.display = 'flex';
                        if (downloadOptions) downloadOptions.style.display = 'none';
                        if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                        if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                    } else if (mode === '2colpi') {
                        // Modalità 2 colpi: mostra opzioni per scegliere entrambi o uno solo
                        downloadButton.style.display = 'flex';
                        if (downloadOptions) downloadOptions.style.display = 'block';
                        if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'block';
                        if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                        
                        // Imposta default: solo un campo, primo colpo
                        const singleRadio = document.getElementById('download_single');
                        const primaryRadio = document.getElementById('download_primary');
                        if (singleRadio && !document.querySelector('input[name="downloadType"]:checked')) {
                            singleRadio.checked = true;
                        }
                        if (primaryRadio && !document.querySelector('input[name="downloadCourt"]:checked')) {
                            primaryRadio.checked = true;
                        }
                        updateSingleCourtOptions();
                        bindDownloadTypeRadios();
                    } else if (mode === 'dinamico') {
                        // Modalità dinamico: mostra opzione per scegliere il colpo
                        downloadButton.style.display = 'flex';
                        if (downloadOptions) downloadOptions.style.display = 'block';
                        if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                        if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'block';
                        
                        // Imposta default: colpo 1
                        const shotNumberInput = document.getElementById('download_shot_number');
                        if (shotNumberInput && (!shotNumberInput.value || shotNumberInput.value < 1)) {
                            shotNumberInput.value = 1;
                        }
                    } else {
                        // Modalità sconosciuta: nascondi tutto
                        downloadButton.style.display = 'none';
                        if (downloadOptions) downloadOptions.style.display = 'none';
                        if (downloadOptions2Colpi) downloadOptions2Colpi.style.display = 'none';
                        if (downloadOptionsDinamico) downloadOptionsDinamico.style.display = 'none';
                    }
                }
            }
            
            // Update single court options visibility
            function updateSingleCourtOptions() {
                const downloadType = document.querySelector('input[name="downloadType"]:checked');
                const singleCourtOptions = document.getElementById('singleCourtOptions');
                
                if (downloadType && singleCourtOptions) {
                    if (downloadType.value === 'single') {
                        singleCourtOptions.style.display = 'block';
                    } else {
                        singleCourtOptions.style.display = 'none';
                    }
                }
            }
            
            // Bind download type radio buttons for sidebar
            function bindDownloadTypeRadios() {
                const downloadBoth = document.getElementById('download_both');
                const downloadSingle = document.getElementById('download_single');
                
                if (downloadBoth) {
                    downloadBoth.addEventListener('change', () => {
                        updateSingleCourtOptions();
                    });
                }
                
                if (downloadSingle) {
                    downloadSingle.addEventListener('change', () => {
                        updateSingleCourtOptions();
                    });
                }
            }

            // View toggles
            function bindViewCheckbox(el, key) {
                if (!el) return;
                el.addEventListener('change', () => {
                    window[key] = !!el.checked;
                    applyViewToggles();
                    const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                    const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                    updateLinesAndWedge(dotX, dotY);
                    
                    // Special handling for coordinates toggle
                    if (key === '__viewCoordinates__') {
                        if (!window.__viewCoordinates__) {
                            tooltip.style.display = 'none';
                        }
                    }
                });
            }
            bindViewCheckbox(chkDirections, '__viewDirections__');
            bindViewCheckbox(chkPlayer, '__viewPlayer__');
            bindViewCheckbox(chkShot, '__viewShot__');
            bindViewCheckbox(chkResponder, '__viewResponder__');
            bindViewCheckbox(chkCover, '__viewCover__');
            bindViewCheckbox(chkZones, '__viewZones__');
            bindViewCheckbox(chkCenter, '__viewCenter__');
            bindViewCheckbox(chkCoordinates, '__viewCoordinates__');
            
            // Event listeners for download type selection (dinamico mode)
            const downloadTypeDinamicoInputs = document.querySelectorAll('input[name="downloadTypeDinamico"]');
            downloadTypeDinamicoInputs.forEach(function(input) {
                input.addEventListener('change', function() {
                    updateSingleShotOptions();
                });
            });
            
            // Make shotHistory accessible globally for download function
            Object.defineProperty(window, 'shotHistory', {
                get: function() { return shotHistory; },
                configurable: true
            });
            
            // Initialize download button visibility
            if (window.__modalita__) {
                updateDownloadButtonVisibility(window.__modalita__);
            } else {
                // Try to get initial mode from radio button
                const initialModalita = document.querySelector('input[name="modalita"]:checked');
                if (initialModalita) {
                    updateDownloadButtonVisibility(initialModalita.value);
                }
            }
            
            // Collapsible sections
            function initCollapsibleSections() {
                const sectionTitles = document.querySelectorAll('.control-section-title');
                sectionTitles.forEach(title => {
                    title.addEventListener('click', () => {
                        const section = title.parentElement;
                        section.classList.toggle('collapsed');
                        
                        // Se la sezione disegna viene chiusa, disabilita il disegno
                        if (section.id === 'draw-section' && section.classList.contains('collapsed')) {
                            // Disabilita la modalità disegno
                            if (window.drawingEnabled) {
                                window.drawingEnabled = false;
                                // Rimuovi la classe active da tutti i pulsanti
                                const drawButtons = ['draw_pen_btn', 'draw_arrow_btn', 'draw_line_btn', 'draw_text_btn', 'draw_ruler_btn', 'draw_eraser_btn'];
                                drawButtons.forEach(btnId => {
                                    const btn = document.getElementById(btnId);
                                    if (btn) btn.classList.remove('active');
                                });
                                // Nascondi i container del testo
                                const fontSizeContainer = document.getElementById('draw_font_size_container');
                                const widthInput = document.getElementById('draw_width');
                                const widthContainer = widthInput ? widthInput.parentElement : null;
                                if (fontSizeContainer) fontSizeContainer.style.display = 'none';
                                if (widthContainer) widthContainer.style.display = 'flex';
                                // Rimuovi i cursori personalizzati
                                const svg1 = document.getElementById('tennisCourt');
                                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                                if (svg1) {
                                    svg1.classList.remove('drawing-cursor', 'erasing-cursor');
                                }
                                if (svg2) {
                                    svg2.classList.remove('drawing-cursor', 'erasing-cursor');
                                }
                            }
                        }
                    });
                });
            }
            
            // Initialize collapsible sections
            initCollapsibleSections();

            // Default settings functionality - Simplified approach
            function initDefaultSettings() {
                // Load and apply defaults on page load
                loadAndApplyDefaults();
                
                // Add event listeners for default settings changes
                addDefaultEventListeners();
            }
            
            function loadAndApplyDefaults() {
                // Load defaults from localStorage
                const savedDefaults = {
                    colpitore: localStorage.getItem('default_colpitore'),
                    modalita: localStorage.getItem('default_modalita'),
                    tipologia: localStorage.getItem('default_tipologia'),
                    campoType: localStorage.getItem('default_campoType'),
                    view_directions: localStorage.getItem('default_view_directions'),
                    view_player: localStorage.getItem('default_view_player'),
                    view_shot: localStorage.getItem('default_view_shot'),
                    view_responder: localStorage.getItem('default_view_responder'),
                    view_cover: localStorage.getItem('default_view_cover'),
                    view_zones: localStorage.getItem('default_view_zones'),
                    view_center: localStorage.getItem('default_view_center'),
                    view_coordinates: localStorage.getItem('default_view_coordinates')
                };
                
                // Apply to DEFAULT section
                applyToDefaultSection(savedDefaults);
                
                // Apply to actual controls
                applyToActualControls(savedDefaults);
            }
            
            function applyToDefaultSection(defaults) {
                // Apply to DEFAULT section controls
                Object.keys(defaults).forEach(key => {
                    if (defaults[key] !== null) {
                        if (key.startsWith('view_')) {
                            const checkbox = document.getElementById(`default_${key}`);
                            if (checkbox) {
                                checkbox.checked = defaults[key] === 'true';
                            }
                            // Aggiorna anche la versione topbar se esiste
                            const checkboxTop = document.getElementById(`default_${key}_top`);
                            if (checkboxTop) {
                                checkboxTop.checked = defaults[key] === 'true';
                            }
                        } else {
                            // Aggiorna il select nella sidebar
                            const select = document.getElementById(`default_${key}`);
                            if (select) {
                                select.value = defaults[key];
                            }
                            // Aggiorna anche il select nella topbar se esiste
                            const selectTop = document.getElementById(`default_${key}_top`);
                            if (selectTop) {
                                selectTop.value = defaults[key];
                            }
                        }
                    }
                });
                
                // Se la modalità è 2colpi, forza e disabilita i primi 4 elementi nella sezione Default
                // Usa il valore dalla localStorage se disponibile, altrimenti window.__modalita__
                const savedModalita = defaults.modalita || window.__modalita__;
                if (savedModalita === '2colpi') {
                    updateVisualizationCheckboxes();
                }
            }
            
            function applyToActualControls(defaults) {
                // Apply to actual control sections
                // Applica prima la modalità se presente, così window.__modalita__ viene aggiornato correttamente
                if (defaults.modalita !== null) {
                    const targetRadio = document.querySelector(`input[name="modalita"][value="${defaults.modalita}"]`);
                    if (targetRadio) {
                        targetRadio.checked = true;
                        window.__modalita__ = defaults.modalita;
                        
                        // Aggiorna anche i select nella sezione Default per assicurarsi che siano sincronizzati
                        const defaultModalitaSelect = document.getElementById('default_modalita');
                        const defaultModalitaSelectTop = document.getElementById('default_modalita_top');
                        if (defaultModalitaSelect) {
                            defaultModalitaSelect.value = defaults.modalita;
                        }
                        if (defaultModalitaSelectTop) {
                            defaultModalitaSelectTop.value = defaults.modalita;
                        }
                        
                        targetRadio.dispatchEvent(new Event('change'));
                    }
                }
                
                // Poi applica gli altri controlli
                Object.keys(defaults).forEach(key => {
                    if (defaults[key] !== null && key !== 'modalita') {
                        if (key.startsWith('view_')) {
                            const targetCheckbox = document.getElementById(key);
                            if (targetCheckbox) {
                                targetCheckbox.checked = defaults[key] === 'true';
                                targetCheckbox.dispatchEvent(new Event('change'));
                            }
                        } else {
                            const targetRadio = document.querySelector(`input[name="${key}"][value="${defaults[key]}"]`);
                            if (targetRadio) {
                                targetRadio.checked = true;
                                targetRadio.dispatchEvent(new Event('change'));
                            }
                        }
                    }
                });
                
                // Se la modalità è 2colpi, forza i primi 4 elementi dopo aver applicato i default
                if (window.__modalita__ === '2colpi') {
                    updateVisualizationCheckboxes();
                }
            }
            
            function addDefaultEventListeners() {
                // Listen for changes in DEFAULT section
                const defaultControls = document.querySelectorAll('#default_colpitore, #default_modalita, #default_tipologia, #default_campoType, #default_view_directions, #default_view_player, #default_view_shot, #default_view_responder, #default_view_cover, #default_view_zones, #default_view_center, #default_view_coordinates');
                
                defaultControls.forEach(control => {
                    control.addEventListener('change', function() {
                        const key = this.id.replace('default_', '');
                        const value = this.type === 'checkbox' ? this.checked : this.value;
                        
                        // Se si sta cambiando la modalità, aggiorna prima window.__modalita__ per i controlli successivi
                        let currentModalita = window.__modalita__;
                        if (key === 'modalita') {
                            currentModalita = value;
                            window.__modalita__ = value;
                        }
                        
                        // Se la modalità è 2colpi e si sta cercando di deselezionare uno dei primi 4 elementi, impediscilo
                        // Usa il valore corrente (che potrebbe essere stato appena aggiornato se abbiamo cambiato modalità)
                        if (currentModalita === '2colpi' && this.type === 'checkbox') {
                            const criticalElements = ['view_player', 'view_responder', 'view_directions', 'view_shot'];
                            if (criticalElements.includes(key) && !this.checked) {
                                // Ripristina il checkbox a checked
                                this.checked = true;
                                return; // Non salvare né applicare il cambio
                            }
                        }
                        
                        // Save the change
                        localStorage.setItem(`default_${key}`, value);
                        
                        // Se si sta cambiando la modalità, aggiorna i checkbox di visualizzazione
                        if (key === 'modalita') {
                            // Il cambio di modalità triggererà il listener della modalità che chiamerà updateVisualizationCheckboxes()
                            // Ma dobbiamo assicurarci che venga chiamato anche qui per aggiornare i default
                            // Usa setTimeout per assicurarsi che window.__modalita__ sia aggiornato
                            setTimeout(() => {
                                updateVisualizationCheckboxes();
                            }, 10);
                        }
                        
                        // Apply to actual control
                        if (key.startsWith('view_')) {
                            const targetCheckbox = document.getElementById(key);
                            if (targetCheckbox) {
                                targetCheckbox.checked = value;
                                targetCheckbox.dispatchEvent(new Event('change'));
                            }
                        } else {
                            const targetRadio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                            if (targetRadio) {
                                targetRadio.checked = true;
                                targetRadio.dispatchEvent(new Event('change'));
                            }
                        }
                    });
                });
            }
            
            // Initialize default settings
            initDefaultSettings();

            // Funzione per salvare lo stato completo prima di eseguire un colpo
            function saveCurrentState() {
                const currentTipologia = document.querySelector('input[name="tipologia"]:checked');
                return {
                    numeroColpo: window.__numeroColpo__,
                    dotX: parseFloat(dot.getAttribute('cx')),
                    dotY: parseFloat(dot.getAttribute('cy')),
                    intersectionX: parseFloat(intersectionDot.getAttribute('cx')),
                    intersectionY: parseFloat(intersectionDot.getAttribute('cy')),
                    isPlayer: isPlayer,
                    tipologia: currentTipologia ? currentTipologia.value : 'palleggio',
                    currentMeasureY: currentMeasureY,
                    yellowEndX: yellowEndX,
                    previousShotWasAttacco: previousShotWasAttacco,
                    previousShotWasPassante: previousShotWasPassante,
                    previousShotDotX: previousShotDot ? parseFloat(previousShotDot.getAttribute('cx')) : null,
                    previousShotDotY: previousShotDot ? parseFloat(previousShotDot.getAttribute('cy')) : null,
                    shotTypeIsServizio: window.__shotTypeIsServizio__ || false,
                    shotTypeIsPassante: window.__shotTypeIsPassante__ || false,
                    shotType2IsPassante: window.__shotType2IsPassante__ || false,
                    leftForceRed: window.__leftForceRed__ || false,
                    ultimoColpo: ultimoColpoCheckbox ? ultimoColpoCheckbox.checked : false
                };
            }
            
            // Funzione per ripristinare lo stato di un colpo specifico
            function restoreState(state) {
                // Ripristina il numero del colpo
                window.__numeroColpo__ = state.numeroColpo;
                updateNumeroColpoDisplay();
                
                // Ripristina la posizione del dot
                dot.setAttribute('cx', String(state.dotX));
                dot.setAttribute('cy', String(state.dotY));
                
                // Ripristina la posizione dell'intersection dot
                intersectionDot.setAttribute('cx', String(state.intersectionX));
                intersectionDot.setAttribute('cy', String(state.intersectionY));
                
                // Ripristina il colpitore
                isPlayer = state.isPlayer;
                const colpitoreValue = isPlayer ? 'tuo' : 'avversario';
                const colpitoreRadio = document.querySelector(`input[name="colpitore"][value="${colpitoreValue}"]`);
                if (colpitoreRadio) {
                    colpitoreRadio.checked = true;
                }
                
                // Ripristina la tipologia
                const tipologiaMap = {
                    'palleggio': 'tipo_pal',
                    'attacco': 'tipo_att',
                    'passante': 'tipo_pas',
                    'servizio': 'tipo_ser'
                };
                const tipologiaId = tipologiaMap[state.tipologia];
                if (tipologiaId) {
                    const tipologiaRadio = document.getElementById(tipologiaId);
                    if (tipologiaRadio) {
                        tipologiaRadio.checked = true;
                        
                        // Aggiorna gli stati globali in base alla tipologia
                        window.__shotTypeIsServizio__ = state.shotTypeIsServizio;
                        window.__shotTypeIsPassante__ = state.shotTypeIsPassante;
                        window.__shotType2IsPassante__ = state.shotType2IsPassante;
                        window.__leftForceRed__ = state.leftForceRed;
                        
                        // Aggiorna i colori del tema
                        updateThemeColors();
                        updateThemeColorsRight();
                    }
                }
                
                // Ripristina altre variabili
                currentMeasureY = state.currentMeasureY;
                yellowEndX = state.yellowEndX;
                previousShotWasAttacco = state.previousShotWasAttacco;
                previousShotWasPassante = state.previousShotWasPassante;
                
                // Ripristina il cerchietto del colpo precedente
                if (previousShotDot && previousShotDot.parentNode) {
                    previousShotDot.parentNode.removeChild(previousShotDot);
                    previousShotDot = null;
                }
                
                if (state.previousShotDotX !== null && state.previousShotDotY !== null) {
                    createPreviousShotDot(state.previousShotDotX, state.previousShotDotY);
                }
                
                // Ripristina lo stato del checkbox ultimo colpo
                if (ultimoColpoCheckbox) {
                    ultimoColpoCheckbox.checked = state.ultimoColpo || false;
                }
                
                // Se stiamo tornando indietro da un punto finito, ripristina gli elementi
                if (puntoFinito) {
                    ripristinaElementiDopoFinePunto();
                }
                
                // Aggiorna la disponibilità delle opzioni
                updateTipologiaAvailability();
                updateVisualizationCheckboxes();
                
                // Aggiorna la visualizzazione
                updateArrowHtmlPosition();
                updateLinesAndWedge(state.dotX, state.dotY);
                applyViewToggles();
            }
            
            // Funzione per nascondere tutti gli elementi (tranne Colpitore) alla fine del punto
            function nascondiElementiFinePunto() {
                // Salva lo stato corrente degli elementi visibili
                elementiVisibiliPrimaFinePunto = {
                    directions: window.__viewDirections__,
                    shot: window.__viewShot__,
                    responder: window.__viewResponder__,
                    cover: window.__viewCover__,
                    zones: window.__viewZones__,
                    center: window.__viewCenter__,
                    coordinates: window.__viewCoordinates__
                };
                
                // Nascondi tutti tranne Colpitore
                window.__viewDirections__ = false;
                window.__viewShot__ = false;
                window.__viewResponder__ = false;
                window.__viewCover__ = false;
                window.__viewZones__ = false;
                window.__viewCenter__ = false;
                window.__viewCoordinates__ = false;
                
                // Aggiorna i checkbox
                if (chkDirections) chkDirections.checked = false;
                if (chkShot) chkShot.checked = false;
                if (chkResponder) chkResponder.checked = false;
                if (chkCover) chkCover.checked = false;
                if (chkZones) chkZones.checked = false;
                if (chkCenter) chkCenter.checked = false;
                if (chkCoordinates) chkCoordinates.checked = false;
                
                // Disabilita i checkbox per impedire modifiche
                if (chkDirections) chkDirections.disabled = true;
                if (chkShot) chkShot.disabled = true;
                if (chkResponder) chkResponder.disabled = true;
                if (chkCover) chkCover.disabled = true;
                if (chkZones) chkZones.disabled = true;
                if (chkCenter) chkCenter.disabled = true;
                if (chkCoordinates) chkCoordinates.disabled = true;
                
                puntoFinito = true;
                applyViewToggles();
                
                // BUG FIX 2 (complemento): Aggiorna i pulsanti di navigazione per disabilitare la freccia avanti
                updateNavigationButtons();
            }
            
            // Funzione per ripristinare gli elementi dopo la fine del punto
            function ripristinaElementiDopoFinePunto() {
                if (!puntoFinito) return;
                
                // Ripristina lo stato degli elementi
                window.__viewDirections__ = elementiVisibiliPrimaFinePunto.directions || false;
                window.__viewShot__ = elementiVisibiliPrimaFinePunto.shot || false;
                window.__viewResponder__ = elementiVisibiliPrimaFinePunto.responder || false;
                window.__viewCover__ = elementiVisibiliPrimaFinePunto.cover || false;
                window.__viewZones__ = elementiVisibiliPrimaFinePunto.zones || false;
                window.__viewCenter__ = elementiVisibiliPrimaFinePunto.center || false;
                window.__viewCoordinates__ = elementiVisibiliPrimaFinePunto.coordinates || false;
                
                // Aggiorna i checkbox
                if (chkDirections) {
                    chkDirections.checked = window.__viewDirections__;
                    chkDirections.disabled = false;
                }
                if (chkShot) {
                    chkShot.checked = window.__viewShot__;
                    chkShot.disabled = false;
                }
                if (chkResponder) {
                    chkResponder.checked = window.__viewResponder__;
                    chkResponder.disabled = false;
                }
                if (chkCover) {
                    chkCover.checked = window.__viewCover__;
                    chkCover.disabled = false;
                }
                if (chkZones) {
                    chkZones.checked = window.__viewZones__;
                    chkZones.disabled = false;
                }
                if (chkCenter) {
                    chkCenter.checked = window.__viewCenter__;
                    chkCenter.disabled = false;
                }
                if (chkCoordinates) {
                    chkCoordinates.checked = window.__viewCoordinates__;
                    chkCoordinates.disabled = false;
                }
                
                puntoFinito = false;
                elementiVisibiliPrimaFinePunto = {};
                
                // Riabilita il pulsante COLPO se necessario
                if (colpoButton) colpoButton.disabled = false;
                
                // CORREZIONE BUG: Ricalcola le linee con la posizione corretta del dot
                // Questo assicura che le direzioni siano corrette dopo il cambio modalità
                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                
                applyViewToggles();
                updateLinesAndWedge(dotX, dotY);
                
                // BUG FIX 2 (complemento): Aggiorna i pulsanti di navigazione per riabilitare le frecce
                updateNavigationButtons();
            }
            
            // Funzione per aggiornare lo stato dei pulsanti di navigazione
            function updateNavigationButtons() {
                if (!prevColpoButton || !nextColpoButton) return;
                
                // Il pulsante "precedente" è abilitato solo se siamo oltre il colpo 1 e abbiamo storia
                prevColpoButton.disabled = (window.__numeroColpo__ <= 1 || shotHistory.length === 0);
                
                // BUG FIX 2: Il pulsante "successivo" è disabilitato se:
                // - Non ci sono colpi futuri nella storia, OPPURE
                // - Il punto è finito (ultimo colpo eseguito)
                nextColpoButton.disabled = (shotHistory.length < window.__numeroColpo__) || puntoFinito;
            }
            
            // Numero Colpo display - non modificabile dall'utente
            // Funzione helper per aggiornare il display del numero colpo
            function updateNumeroColpoDisplay() {
            if (numeroColpoInput) {
                    numeroColpoInput.textContent = window.__numeroColpo__;
                }
                updateNavigationButtons();
                updateColpitoreDragState();
            }
            
            // Funzione per gestire i checkbox di visualizzazione in modalità DINAMICO e 2 COLPI
            function updateVisualizationCheckboxes() {
                if (window.__modalita__ === 'dinamico' || window.__modalita__ === '2colpi') {
                    // In modalità DINAMICO e 2 COLPI, forza e disabilita i checkbox critici
                    if (chkDirections) {
                        chkDirections.checked = true;
                        chkDirections.disabled = true;
                        window.__viewDirections__ = true;
                    }
                    if (chkPlayer) {
                        chkPlayer.checked = true;
                        chkPlayer.disabled = true;
                        window.__viewPlayer__ = true;
                    }
                    if (chkShot) {
                        chkShot.checked = true;
                        chkShot.disabled = true;
                        window.__viewShot__ = true;
                    }
                    if (chkResponder) {
                        chkResponder.checked = true;
                        chkResponder.disabled = true;
                        window.__viewResponder__ = true;
                    }
                    
                    // In modalità 2colpi, forza anche i checkbox nella sezione Default e li disabilita
                    if (window.__modalita__ === '2colpi') {
                        const defaultViewPlayer = document.getElementById('default_view_player');
                        const defaultViewResponder = document.getElementById('default_view_responder');
                        const defaultViewDirections = document.getElementById('default_view_directions');
                        const defaultViewShot = document.getElementById('default_view_shot');
                        
                        if (defaultViewPlayer) {
                            defaultViewPlayer.checked = true;
                            defaultViewPlayer.disabled = true;
                            localStorage.setItem('default_view_player', 'true');
                        }
                        if (defaultViewResponder) {
                            defaultViewResponder.checked = true;
                            defaultViewResponder.disabled = true;
                            localStorage.setItem('default_view_responder', 'true');
                        }
                        if (defaultViewDirections) {
                            defaultViewDirections.checked = true;
                            defaultViewDirections.disabled = true;
                            localStorage.setItem('default_view_directions', 'true');
                        }
                        if (defaultViewShot) {
                            defaultViewShot.checked = true;
                            defaultViewShot.disabled = true;
                            localStorage.setItem('default_view_shot', 'true');
                        }
                    } else {
                        // In altre modalità, riabilita i checkbox nella sezione Default
                        const defaultViewPlayer = document.getElementById('default_view_player');
                        const defaultViewResponder = document.getElementById('default_view_responder');
                        const defaultViewDirections = document.getElementById('default_view_directions');
                        const defaultViewShot = document.getElementById('default_view_shot');
                        
                        if (defaultViewPlayer) defaultViewPlayer.disabled = false;
                        if (defaultViewResponder) defaultViewResponder.disabled = false;
                        if (defaultViewDirections) defaultViewDirections.disabled = false;
                        if (defaultViewShot) defaultViewShot.disabled = false;
                    }
                    
                    // Applica i cambiamenti
                    applyViewToggles();
                } else {
                    // In altre modalità, riabilita tutti i checkbox
                    if (chkDirections) chkDirections.disabled = false;
                    if (chkPlayer) chkPlayer.disabled = false;
                    if (chkShot) chkShot.disabled = false;
                    if (chkResponder) chkResponder.disabled = false;
                    
                    // In altre modalità, riabilita anche i checkbox nella sezione Default
                    const defaultViewPlayer = document.getElementById('default_view_player');
                    const defaultViewResponder = document.getElementById('default_view_responder');
                    const defaultViewDirections = document.getElementById('default_view_directions');
                    const defaultViewShot = document.getElementById('default_view_shot');
                    
                    if (defaultViewPlayer) defaultViewPlayer.disabled = false;
                    if (defaultViewResponder) defaultViewResponder.disabled = false;
                    if (defaultViewDirections) defaultViewDirections.disabled = false;
                    if (defaultViewShot) defaultViewShot.disabled = false;
                    
                    // Se il punto era finito, ripristina gli elementi
                    if (puntoFinito) {
                        ripristinaElementiDopoFinePunto();
                    }
                }
            }
            
            // Funzione per gestire l'abilitazione/disabilitazione delle opzioni di tipologia
            function updateTipologiaAvailability() {
                const servizioRadio = document.getElementById('tipo_ser');
                const servizioLabel = servizioRadio ? servizioRadio.closest('.control-option') : null;
                
                const palleggioRadio = document.getElementById('tipo_pal');
                const palleggioLabel = palleggioRadio ? palleggioRadio.closest('.control-option') : null;
                
                const passanteRadio = document.getElementById('tipo_pas');
                const passanteLabel = passanteRadio ? passanteRadio.closest('.control-option') : null;
                
                const attaccoRadio = document.getElementById('tipo_att');
                const attaccoLabel = attaccoRadio ? attaccoRadio.closest('.control-option') : null;
                const isDinamico = window.__modalita__ === 'dinamico';
                const isOneColpo = window.__modalita__ === '1colpo';

                const forceNonAttaccoSelection = () => {
                    const fallbackRadio = palleggioRadio || passanteRadio || servizioRadio;
                    if (fallbackRadio) {
                        if (!fallbackRadio.checked) {
                            fallbackRadio.checked = true;
                        }
                        fallbackRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                
                if (isDinamico) {
                    // In modalità dinamico
                    
                    // Servizio: solo per colpo 1
                    if (window.__numeroColpo__ > 1) {
                        if (servizioRadio) {
                            servizioRadio.disabled = true;
                            if (servizioLabel) servizioLabel.style.opacity = '0.5';
                        }
                    } else {
                        if (servizioRadio) {
                            servizioRadio.disabled = false;
                            if (servizioLabel) servizioLabel.style.opacity = '1';
                        }
                    }
                    
                    // Se il colpo precedente era attacco, forza passante e disabilita le altre
                    if (previousShotWasAttacco) {
                        // Disabilita palleggio, attacco, servizio
                        if (palleggioRadio) {
                            palleggioRadio.disabled = true;
                            if (palleggioLabel) palleggioLabel.style.opacity = '0.5';
                        }
                        if (attaccoRadio) {
                            attaccoRadio.disabled = true;
                            if (attaccoLabel) attaccoLabel.style.opacity = '0.5';
                        }
                        if (servizioRadio) {
                            servizioRadio.disabled = true;
                            if (servizioLabel) servizioLabel.style.opacity = '0.5';
                        }
                        // Passante rimane abilitato (è l'unica opzione)
                        if (passanteRadio) {
                            passanteRadio.disabled = false;
                            if (passanteLabel) passanteLabel.style.opacity = '1';
                        }
                    } else {
                        // Abilita tutte le opzioni (tranne servizio se colpo > 1)
                        if (palleggioRadio) {
                            palleggioRadio.disabled = false;
                            if (palleggioLabel) palleggioLabel.style.opacity = '1';
                        }
                        if (passanteRadio) {
                            passanteRadio.disabled = false;
                            if (passanteLabel) passanteLabel.style.opacity = '1';
                        }
                        if (attaccoRadio) {
                            attaccoRadio.disabled = false;
                            if (attaccoLabel) attaccoLabel.style.opacity = '1';
                        }
                    }
                } else {
                    // Non in modalità dinamico: abilita tutto
                    if (servizioRadio) {
                        servizioRadio.disabled = false;
                        if (servizioLabel) servizioLabel.style.opacity = '1';
                    }
                    if (palleggioRadio) {
                        palleggioRadio.disabled = false;
                        if (palleggioLabel) palleggioLabel.style.opacity = '1';
                    }
                    if (passanteRadio) {
                        passanteRadio.disabled = false;
                        if (passanteLabel) passanteLabel.style.opacity = '1';
                    }
                    if (attaccoRadio && attaccoLabel) {
                        if (isOneColpo) {
                            // Nascondi completamente l'opzione "Attacco" in modalità 1 colpo
                            attaccoLabel.style.display = 'none';
                            // Se è selezionato, seleziona un'altra opzione
                            if (attaccoRadio.checked) {
                                forceNonAttaccoSelection();
                            }
                        } else {
                            // Mostra l'opzione quando non è modalità 1 colpo
                            attaccoLabel.style.display = '';
                            attaccoRadio.disabled = false;
                            attaccoLabel.style.opacity = '1';
                        }
                    }
                }
            }
            
            // Mantieni la vecchia funzione per retrocompatibilità
            function updateServizioAvailability() {
                updateTipologiaAvailability();
            }
            
            // Funzione per creare un cerchietto rosso per il colpo precedente
            function createPreviousShotDot(x, y) {
                // Rimuovi il cerchietto precedente se esiste
                if (previousShotDot && previousShotDot.parentNode) {
                    previousShotDot.parentNode.removeChild(previousShotDot);
                }
                
                // Crea il nuovo cerchietto
                const newDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                newDot.setAttribute('class', 'previous-shot-dot');
                newDot.setAttribute('cx', String(x));
                newDot.setAttribute('cy', String(y));
                newDot.setAttribute('r', '12'); // Stesso raggio del cerchietto rosso grande
                newDot.setAttribute('fill', '#ff5252');
                newDot.setAttribute('stroke', '#fff');
                newDot.setAttribute('stroke-width', '2');
                newDot.setAttribute('opacity', '0.6'); // Leggermente trasparente per distinguerlo
                svg.appendChild(newDot);
                
                // Salva il riferimento
                previousShotDot = newDot;
                return newDot;
            }
            
            // Inizializza il display e i pulsanti di navigazione
            updateNumeroColpoDisplay();

            // Gestione pulsante CONTINUA dell'alert movimento colpitore
            if (colpitoreAlertContinue) {
                colpitoreAlertContinue.addEventListener('click', function() {
                    hideColpitoreMovementAlert();
                });
            }

            // Gestione pulsante NUOVO SCAMBIO
            if (nuovoScambioButton) {
                nuovoScambioButton.addEventListener('click', function() {
                    // 0. Se il punto era finito, ripristina gli elementi
                    if (puntoFinito) {
                        ripristinaElementiDopoFinePunto();
                    }
                    
                    // Reset flag alert quando si inizia un nuovo punto
                    resetColpitoreAlertFlag();
                    
                    // 1. Reset NUMERO COLPO a 1
                    window.__numeroColpo__ = 1;
                    updateNumeroColpoDisplay();
                    
                    // 2. Reset colpitore al default (o al valore di default salvato)
                    const defaultColpitore = localStorage.getItem('default_colpitore') || 'tuo';
                    isPlayer = (defaultColpitore === 'tuo');
                    
                    // Aggiorna il radio button del colpitore
                    const colpitoreRadio = document.querySelector(`input[name="colpitore"][value="${defaultColpitore}"]`);
                    if (colpitoreRadio) {
                        colpitoreRadio.checked = true;
                    }
                    
                    // 3. Reset posizione dot all'origine
                    const originY = isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y;
                    if (dot) {
                        dot.setAttribute('cx', String(ORIGIN_X));
                        dot.setAttribute('cy', String(originY));
                    }
                    
                    // 4. Reset currentMeasureY al valore di default
                    const defaultYCampoB = ORIGIN_TOP_Y - 50;
                    currentMeasureY = isPlayer ? defaultYCampoB : (2 * NET_Y - defaultYCampoB);
                    updateArrowHtmlPosition();
                    
                    // 5. Reset yellowEndX
                    yellowEndX = null;
                    
                    // 6. Rimuovi il cerchietto del colpo precedente
                    if (previousShotDot && previousShotDot.parentNode) {
                        previousShotDot.parentNode.removeChild(previousShotDot);
                        previousShotDot = null;
                    }
                    
                    // 7. Reset previousShotWasAttacco e previousShotWasPassante
                    previousShotWasAttacco = false;
                    previousShotWasPassante = false;
                    
                    // 8. Reset shotSequence e shotHistory
                    shotSequence = [];
                    shotHistory = [];
                    
                    // 8b. Reset checkbox ultimo colpo
                    if (ultimoColpoCheckbox) {
                        ultimoColpoCheckbox.checked = false;
                    }
                    
                    // 8c. Aggiorna il valore massimo dell'input per il download
                    updateSingleShotOptions();
                    
                    // 9. Riabilita le opzioni di tipologia (se in modalità dinamico)
                    updateTipologiaAvailability();
                    
                    // 10. Aggiorna i checkbox di visualizzazione
                    updateVisualizationCheckboxes();
                    
                    // 11. Ricalcola tutto
                    updateLinesAndWedge(ORIGIN_X, originY);
                    applyViewToggles();
                });
            }
            
            // Gestione pulsante VISUALIZZA SCAMBIO
            if (visualizzaScambioButton) {
                visualizzaScambioButton.addEventListener('click', function() {
                    // Se non ci sono colpi da visualizzare, non fare nulla
                    if (shotSequence.length === 0) return;
                    
                    // Salva lo stato del pannello dinamico mobile e chiudilo se aperto
                    const wasMobileDinamicoPanelOpen = isMobileViewport() 
                        && window.__modalita__ === 'dinamico' 
                        && isMobileDinamicoPanelOpen;
                    if (wasMobileDinamicoPanelOpen) {
                        setMobileDinamicoPanelOpen(false);
                    }
                    
                    // Reset variabili di pausa
                    animazionePausata = false;
                    animazioneInCorso = true;
                    
                    // Mostra il pulsante pause/resume
                    if (pauseResumeButton) {
                        pauseResumeButton.style.display = 'flex';
                        pauseResumeButton.querySelector('.pause-icon').textContent = '⏸️';
                    }
                    
                    // Disabilita tutti i pulsanti durante la visualizzazione
                    if (colpoButton) colpoButton.disabled = true;
                    if (visualizzaScambioButton) visualizzaScambioButton.disabled = true;
                    if (nuovoScambioButton) nuovoScambioButton.disabled = true;
                    
                    // Nascondi tutti gli elementi tranne i cerchietti rossi
                    const elementsToHide = [
                        leftLine, rightLine, bisectorLine, yellowLine, 
                        wedge, hMeasure, hMeasureLabel, hMeasureBadge, arrowHtml, dot, intersectionDot
                    ];
                    elementsToHide.forEach(el => {
                        if (el) el.style.display = 'none';
                    });
                    
                    // Nascondi il cerchietto del colpo precedente se esiste
                    if (previousShotDot) previousShotDot.style.display = 'none';
                    
                    // Array per memorizzare i cerchietti rossi creati durante la visualizzazione
                    const replayShotDots = [];
                    
                    // Funzione per animare un singolo colpo
                    function animateShot(index) {
                        if (index >= shotSequence.length) {
                            // Animazione completata
                            setTimeout(() => {
                                // Nascondi il pulsante pause/resume
                                if (pauseResumeButton) {
                                    pauseResumeButton.style.display = 'none';
                                }
                                
                                animazioneInCorso = false;
                                animazionePausata = false;
                                
                                // Rimuovi tutti i cerchietti rossi creati durante la visualizzazione
                                replayShotDots.forEach(dotEl => {
                                    if (dotEl && dotEl.parentNode) {
                                        dotEl.parentNode.removeChild(dotEl);
                                    }
                                });
                                
                                // Ripristina gli elementi nascosti
                                elementsToHide.forEach(el => {
                                    if (el) {
                                        // Gli elementi h-measure e arrowHtml vengono gestiti separatamente dopo
                                        if (el !== arrowHtml && el !== hMeasure && el !== hMeasureLabel && el !== hMeasureBadge) {
                                            el.style.display = '';
                                        }
                                    }
                                });
                                
                                // Ripristina il cerchietto del colpo precedente
                                if (previousShotDot) previousShotDot.style.display = '';
                                
                                // Riapplica i toggle di visibilità (questo ripristinerà correttamente h-measure e arrowHtml in base a viewCover)
                                applyViewToggles();
                                
                                // Ricalcola le linee
                                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                                updateLinesAndWedge(dotX, dotY);
                                
                                // Riabilita i pulsanti
                                if (colpoButton) colpoButton.disabled = false;
                                if (visualizzaScambioButton) visualizzaScambioButton.disabled = false;
                                if (nuovoScambioButton) nuovoScambioButton.disabled = false;
                                
                                // Riapri il pannello dinamico mobile se era aperto prima dell'animazione
                                if (wasMobileDinamicoPanelOpen) {
                                    setMobileDinamicoPanelOpen(true);
                                }
                            }, 500);
                            return;
                        }
                        
                        const shot = shotSequence[index];
                        
                        // Crea un cerchietto rosso nella posizione di partenza
                        const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        startDot.setAttribute('cx', String(shot.startX));
                        startDot.setAttribute('cy', String(shot.startY));
                        startDot.setAttribute('r', '12');
                        startDot.setAttribute('fill', '#ff5252');
                        startDot.setAttribute('stroke', '#fff');
                        startDot.setAttribute('stroke-width', '2');
                        svg.appendChild(startDot);
                        replayShotDots.push(startDot);
                        
                        // Crea la pallina gialla
                        const yellowDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        yellowDot.setAttribute('cx', String(shot.startX));
                        yellowDot.setAttribute('cy', String(shot.startY));
                        yellowDot.setAttribute('r', '8');
                        yellowDot.setAttribute('fill', '#ffd600');
                        yellowDot.setAttribute('stroke', '#fff');
                        yellowDot.setAttribute('stroke-width', '2');
                        svg.appendChild(yellowDot);
                        
                        // Animazione della pallina gialla con supporto pausa
                        const duration = 1200;
                        let startTime = performance.now();
                        let pausedTime = 0;
                        let animationId = null;
                        
                        function animate(currentTime) {
                            // Se in pausa, salva il callback per riprendere
                            if (animazionePausata) {
                                pausedTime = currentTime;
                                riprendiAnimazione = () => {
                                    startTime += (performance.now() - pausedTime);
                                    animationId = requestAnimationFrame(animate);
                                };
                                return;
                            }
                            
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            const currentX = shot.startX + (shot.endX - shot.startX) * progress;
                            const currentY = shot.startY + (shot.endY - shot.startY) * progress;
                            
                            yellowDot.setAttribute('cx', String(currentX));
                            yellowDot.setAttribute('cy', String(currentY));
                            
                            if (progress < 1) {
                                animationId = requestAnimationFrame(animate);
                            } else {
                                // Rimuovi la pallina gialla
                                if (yellowDot && yellowDot.parentNode) {
                                    yellowDot.parentNode.removeChild(yellowDot);
                                }
                                
                                // Funzione per passare al colpo successivo
                                function nextShot() {
                                    // Se in pausa, salva il callback
                                    if (animazionePausata) {
                                        riprendiAnimazione = () => nextShot();
                                        return;
                                    }
                                    animateShot(index + 1);
                                }
                                
                                // Passa al colpo successivo dopo una breve pausa
                                setTimeout(nextShot, 200);
                            }
                        }
                        
                        animationId = requestAnimationFrame(animate);
                    }
                    
                    // Inizia l'animazione dal primo colpo
                    animateShot(0);
                });
            }
            
            // Gestione pulsante PAUSE/RESUME
            if (pauseResumeButton) {
                pauseResumeButton.addEventListener('click', function() {
                    if (!animazioneInCorso) return;
                    
                    if (animazionePausata) {
                        // Riprendi l'animazione
                        animazionePausata = false;
                        pauseResumeButton.querySelector('.pause-icon').textContent = '⏸️';
                        
                        // Esegui il callback per riprendere
                        if (riprendiAnimazione) {
                            riprendiAnimazione();
                        }
                    } else {
                        // Metti in pausa
                        animazionePausata = true;
                        pauseResumeButton.querySelector('.pause-icon').textContent = '▶️';
                    }
                });
            }
            
            // Gestione pulsante COLPO
            if (colpoButton) {
                colpoButton.addEventListener('click', function() {
                    // Disabilita il pulsante durante l'animazione
                    colpoButton.disabled = true;
                    
                    // Salva lo stato corrente PRIMA di eseguire il colpo
                    const currentState = saveCurrentState();
                    
                    // Controlla se questo è l'ultimo colpo del punto
                    const isUltimoColpo = ultimoColpoCheckbox ? ultimoColpoCheckbox.checked : false;
                    
                    // Se stiamo eseguendo un colpo che sovrascrive la storia futura, rimuovi i colpi successivi
                    if (shotHistory.length >= window.__numeroColpo__) {
                        shotHistory = shotHistory.slice(0, window.__numeroColpo__ - 1);
                        shotSequence = shotSequence.slice(0, window.__numeroColpo__ - 1);
                    }
                    
                    // Salva lo stato corrente nella storia
                    shotHistory.push(currentState);
                    
                    // Aggiorna il valore massimo dell'input per il download
                    updateSingleShotOptions();
                    
                    // BUG FIX 3: Reset del checkbox SOLO se NON è l'ultimo colpo
                    // Se è l'ultimo colpo, il numero non avanza e rimaniamo sullo stesso colpo,
                    // quindi il checkbox deve rimanere flaggato
                    if (ultimoColpoCheckbox && !isUltimoColpo) {
                        ultimoColpoCheckbox.checked = false;
                    }
                    
                    // Ottieni le posizioni dei due cerchietti rossi
                    const startX = parseFloat(dot.getAttribute('cx'));
                    const startY = parseFloat(dot.getAttribute('cy'));
                    const endX = parseFloat(intersectionDot.getAttribute('cx'));
                    const endY = parseFloat(intersectionDot.getAttribute('cy'));
                    
                    // Salva lo stato corrente del colpitore e della tipologia
                    const currentIsPlayer = isPlayer;
                    const currentTipologia = document.querySelector('input[name="tipologia"]:checked');
                    const isCurrentAttacco = currentTipologia && currentTipologia.value === 'attacco';
                    const isCurrentPassante = currentTipologia && currentTipologia.value === 'passante';
                    
                    // Salva la sequenza del colpo per la visualizzazione
                    shotSequence.push({
                        startX: startX,
                        startY: startY,
                        endX: endX,
                        endY: endY
                    });
                    
                    // Nascondi tutti gli elementi tranne i cerchietti rossi (corrente + precedenti)
                    const elementsToHide = [
                        leftLine, rightLine, bisectorLine, yellowLine, 
                        wedge, hMeasure, arrowHtml
                    ];
                    elementsToHide.forEach(el => {
                        if (el) el.style.display = 'none';
                    });
                    
                    // I cerchietti dei colpi precedenti rimangono visibili durante l'animazione
                    
                    // Crea il cerchietto giallo
                    const yellowDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    yellowDot.setAttribute('id', 'yellowAnimatedDot');
                    yellowDot.setAttribute('cx', String(startX));
                    yellowDot.setAttribute('cy', String(startY));
                    yellowDot.setAttribute('r', '8'); // Stesso raggio del cerchietto rosso più piccolo
                    yellowDot.setAttribute('fill', '#ffd600');
                    yellowDot.setAttribute('stroke', '#fff');
                    yellowDot.setAttribute('stroke-width', '2');
                    svg.appendChild(yellowDot);
                    
                    // Animazione: muovi il cerchietto giallo in 1 secondo
                    const duration = 1200; // 1 secondo
                    const startTime = performance.now();
                    
                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Interpolazione lineare
                        const currentX = startX + (endX - startX) * progress;
                        const currentY = startY + (endY - startY) * progress;
                        
                        yellowDot.setAttribute('cx', String(currentX));
                        yellowDot.setAttribute('cy', String(currentY));
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            // Animazione completata
                            setTimeout(() => {
                                // Rimuovi il cerchietto giallo
                                if (yellowDot && yellowDot.parentNode) {
                                    yellowDot.parentNode.removeChild(yellowDot);
                                }
                                
                                // 1. Crea un cerchietto rosso nella posizione di partenza del colpo appena eseguito
                                // Questo rimuoverà automaticamente il cerchietto precedente
                                createPreviousShotDot(startX, startY);
                                
                                // 2. Incrementa il numero colpo SOLO se NON era l'ultimo colpo
                                if (!isUltimoColpo) {
                                    window.__numeroColpo__++;
                                }
                                updateNumeroColpoDisplay();
                                
                                // 2b. In modalità dinamico, gestisci cambio automatico di tipologia
                                if (window.__modalita__ === 'dinamico') {
                                    // Se era servizio e passiamo al colpo 2, cambia a palleggio
                                    if (window.__numeroColpo__ === 2 && window.__shotTypeIsServizio__) {
                                        window.__shotTypeIsServizio__ = false;
                                        window.__shotTypeIsPassante__ = false;
                                        window.__shotType2IsPassante__ = false;
                                        window.__leftForceRed__ = false;
                                        
                                        // Aggiorna il radio button
                                        const palleggioRadio = document.getElementById('tipo_pal');
                                        if (palleggioRadio) {
                                            palleggioRadio.checked = true;
                                        }
                                        
                                        // Aggiorna i colori
                                        updateThemeColors();
                                        updateThemeColorsRight();
                                    }
                                    
                                    // Se il colpo appena eseguito era attacco, forza passante per il prossimo
                                    if (isCurrentAttacco) {
                                        previousShotWasAttacco = true;
                                        previousShotWasPassante = false;
                                        
                                        // Forza passante
                                        window.__shotTypeIsPassante__ = true;
                                        window.__shotType2IsPassante__ = true;
                                        window.__shotTypeIsServizio__ = false;
                                        window.__leftForceRed__ = false;
                                        
                                        // Aggiorna il radio button
                                        const passanteRadio = document.getElementById('tipo_pas');
                                        if (passanteRadio) {
                                            passanteRadio.checked = true;
                                        }
                                        
                                        // Aggiorna i colori
                                        updateThemeColors();
                                        updateThemeColorsRight();
                                    } 
                                    // Se il colpo appena eseguito era passante, forza palleggio per il prossimo
                                    else if (isCurrentPassante) {
                                        previousShotWasPassante = true;
                                        previousShotWasAttacco = false;
                                        
                                        // Forza palleggio
                                        window.__shotTypeIsPassante__ = false;
                                        window.__shotType2IsPassante__ = false;
                                        window.__shotTypeIsServizio__ = false;
                                        window.__leftForceRed__ = false;
                                        
                                        // Aggiorna il radio button
                                        const palleggioRadio = document.getElementById('tipo_pal');
                                        if (palleggioRadio) {
                                            palleggioRadio.checked = true;
                                        }
                                        
                                        // Aggiorna i colori
                                        updateThemeColors();
                                        updateThemeColorsRight();
                                    }
                                    else {
                                        // Il colpo non era né attacco né passante, reset dei flag
                                        previousShotWasAttacco = false;
                                        previousShotWasPassante = false;
                                    }
                                }
                                
                                // 2c. Aggiorna la disponibilità delle opzioni di tipologia
                                updateTipologiaAvailability();
                                
                                // 2d. Assicurati che i checkbox rimangano forzati in modalità dinamico
                                if (window.__modalita__ === 'dinamico') {
                                    updateVisualizationCheckboxes();
                                }
                                
                                // 3. Cambia il colpitore (TUO <-> AVVERSARIO)
                                // Anche per l'ultimo colpo, il colpitore deve cambiare (diventa chi riceve la pallina)
                                isPlayer = !currentIsPlayer;
                                
                                // Aggiorna il radio button del colpitore
                                const newColpitoreValue = isPlayer ? 'tuo' : 'avversario';
                                const colpitoreRadio = document.querySelector(`input[name="colpitore"][value="${newColpitoreValue}"]`);
                                if (colpitoreRadio) {
                                    colpitoreRadio.checked = true;
                                }
                                
                                // 4. Posiziona il cerchietto rosso grande dove è arrivata la pallina gialla
                                dot.setAttribute('cx', String(endX));
                                dot.setAttribute('cy', String(endY));
                                
                                // 5. Posiziona la linea orizzontale blu al livello y di partenza della pallina
                                currentMeasureY = startY;
                                updateArrowHtmlPosition();
                                
                                // Ripristina gli elementi nascosti
                                elementsToHide.forEach(el => {
                                    if (el) {
                                        if (el === arrowHtml) {
                                            el.style.display = (window.__viewCover__ === false) ? 'none' : 'block';
                                        } else {
                                            el.style.display = '';
                                        }
                                    }
                                });
                                
                                // Riapplica i toggle di visibilità
                                applyViewToggles();
                                
                                // Ricalcola le linee con la nuova configurazione
                                updateLinesAndWedge(endX, endY);
                                
                                // Se era l'ultimo colpo, nascondi tutti gli elementi tranne Colpitore
                                if (isUltimoColpo) {
                                    nascondiElementiFinePunto();
                                    // NON riabilitare il pulsante COLPO
                                } else {
                                    // Riabilita il pulsante
                                    colpoButton.disabled = false;
                                }
                            }, 100);
                        }
                    }
                    
                    requestAnimationFrame(animate);
                });
            }
            
            // Gestione pulsante PRECEDENTE (freccia sinistra)
            if (prevColpoButton) {
                prevColpoButton.addEventListener('click', function() {
                    if (window.__numeroColpo__ <= 1 || shotHistory.length === 0) return;
                    
                    // Vai al colpo precedente
                    const previousIndex = window.__numeroColpo__ - 2; // -2 perché l'array è 0-based e vogliamo il colpo precedente
                    if (previousIndex >= 0 && previousIndex < shotHistory.length) {
                        restoreState(shotHistory[previousIndex]);
                    }
                });
            }
            
            // Gestione pulsante SUCCESSIVO (freccia destra)
            if (nextColpoButton) {
                nextColpoButton.addEventListener('click', function() {
                    if (shotHistory.length < window.__numeroColpo__) return;
                    
                    // Vai al colpo successivo
                    const nextIndex = window.__numeroColpo__; // L'indice del prossimo colpo
                    if (nextIndex < shotHistory.length) {
                        restoreState(shotHistory[nextIndex]);
                    }
                });
            }

            // ==================== FUNZIONALITÀ DI DISEGNO ====================
            
            // Variabili per il disegno (alcune esposte globalmente)
            let drawingMode = 'pen'; // 'pen', 'arrow', 'line', 'text', 'ruler' o 'eraser'
            let isDrawing = false;
            window.drawingEnabled = false; // Disattivo di default per non interferire (globale per controlli esterni)
            let currentPath = null;
            let currentElement = null; // Per linee, frecce e righelli
            let startPoint = null; // Punto iniziale per linee, frecce e righelli
            let drawColor = '#000000';
            let drawWidth = 3;
            let drawFontSize = 16;
            let drawText = '';
            
            // Gruppo SVG per contenere tutti i disegni (campo primario)
            let drawingGroup = document.getElementById('drawingGroup');
            if (!drawingGroup) {
                drawingGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                drawingGroup.id = 'drawingGroup';
                svg.appendChild(drawingGroup);
            }
            
            // Funzione per ottenere/creare il gruppo di disegno per il secondo SVG
            function getSecondaryDrawingGroup() {
                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                if (!svg2) return null;
                
                let drawingGroup2 = svg2.querySelector('#drawingGroup2');
                if (!drawingGroup2) {
                    drawingGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    drawingGroup2.id = 'drawingGroup2';
                    svg2.appendChild(drawingGroup2);
                }
                return drawingGroup2;
            }
            
            // Riferimenti agli elementi
            const penButton = document.getElementById('draw_pen_btn');
            const arrowButton = document.getElementById('draw_arrow_btn');
            const lineButton = document.getElementById('draw_line_btn');
            const textButton = document.getElementById('draw_text_btn');
            const rulerButton = document.getElementById('draw_ruler_btn');
            const eraserButton = document.getElementById('draw_eraser_btn');
            const clearButton = document.getElementById('draw_clear_btn');
            const colorInput = document.getElementById('draw_color');
            const widthInput = document.getElementById('draw_width');
            const widthValue = document.getElementById('draw_width_value');
            const widthContainer = widthInput.parentElement;
            const fontSizeValue = document.getElementById('draw_font_size_value');
            const fontSizeContainer = document.getElementById('draw_font_size_container');
            const eraserIndicator = document.getElementById('eraserIndicator');
            
            // Funzione per convertire coordinate del mouse in coordinate SVG
            function getSvgCoordinates(evt, targetSvg) {
                const svgElement = targetSvg || svg;
                const pt = svgElement.createSVGPoint();
                pt.x = evt.clientX;
                pt.y = evt.clientY;
                return pt.matrixTransform(svgElement.getScreenCTM().inverse());
            }
            
            // Funzione per controllare se la sezione disegna è aperta
            function isDrawSectionOpen() {
                const drawSection = document.getElementById('draw-section');
                return drawSection && !drawSection.classList.contains('collapsed');
            }
            
            // Gestione del pulsante matita
            if (penButton) {
                penButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return; // Non permettere se la sezione è chiusa
                    
                    if (drawingMode === 'pen' && window.drawingEnabled) {
                        // Disattiva la modalità disegno
                        window.drawingEnabled = false;
                        penButton.classList.remove('active');
                        svg.classList.remove('drawing-cursor');
                        fontSizeContainer.style.display = 'none';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('drawing-cursor');
                    } else {
                        // Attiva la modalità matita
                        drawingMode = 'pen';
                        window.drawingEnabled = true;
                        penButton.classList.add('active');
                        arrowButton.classList.remove('active');
                        lineButton.classList.remove('active');
                        textButton.classList.remove('active');
                        rulerButton.classList.remove('active');
                        eraserButton.classList.remove('active');
                        svg.classList.add('drawing-cursor');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('drawing-cursor');
                            svg2.classList.remove('erasing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante freccia
            if (arrowButton) {
                arrowButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return;
                    
                    if (drawingMode === 'arrow' && window.drawingEnabled) {
                        window.drawingEnabled = false;
                        arrowButton.classList.remove('active');
                        svg.classList.remove('drawing-cursor');
                        fontSizeContainer.style.display = 'none';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('drawing-cursor');
                    } else {
                        drawingMode = 'arrow';
                        window.drawingEnabled = true;
                        arrowButton.classList.add('active');
                        penButton.classList.remove('active');
                        lineButton.classList.remove('active');
                        textButton.classList.remove('active');
                        rulerButton.classList.remove('active');
                        eraserButton.classList.remove('active');
                        svg.classList.add('drawing-cursor');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('drawing-cursor');
                            svg2.classList.remove('erasing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante linea
            if (lineButton) {
                lineButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return;
                    
                    if (drawingMode === 'line' && window.drawingEnabled) {
                        window.drawingEnabled = false;
                        lineButton.classList.remove('active');
                        svg.classList.remove('drawing-cursor');
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('drawing-cursor');
                        textInputContainer.style.display = 'none';
                        fontSizeContainer.style.display = 'none';
                    } else {
                        drawingMode = 'line';
                        window.drawingEnabled = true;
                        lineButton.classList.add('active');
                        penButton.classList.remove('active');
                        arrowButton.classList.remove('active');
                        textButton.classList.remove('active');
                        rulerButton.classList.remove('active');
                        eraserButton.classList.remove('active');
                        svg.classList.add('drawing-cursor');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('drawing-cursor');
                            svg2.classList.remove('erasing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante testo
            if (textButton) {
                textButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return;
                    
                    if (drawingMode === 'text' && window.drawingEnabled) {
                        window.drawingEnabled = false;
                        textButton.classList.remove('active');
                        svg.classList.remove('drawing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('drawing-cursor');
                    } else {
                        drawingMode = 'text';
                        window.drawingEnabled = true;
                        textButton.classList.add('active');
                        penButton.classList.remove('active');
                        arrowButton.classList.remove('active');
                        lineButton.classList.remove('active');
                        rulerButton.classList.remove('active');
                        eraserButton.classList.remove('active');
                        svg.classList.add('drawing-cursor');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'flex';
                        widthContainer.style.display = 'none';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('drawing-cursor');
                            svg2.classList.remove('erasing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante righello
            if (rulerButton) {
                rulerButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return;
                    
                    if (drawingMode === 'ruler' && window.drawingEnabled) {
                        window.drawingEnabled = false;
                        rulerButton.classList.remove('active');
                        svg.classList.remove('drawing-cursor');
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('drawing-cursor');
                        textInputContainer.style.display = 'none';
                        fontSizeContainer.style.display = 'none';
                    } else {
                        drawingMode = 'ruler';
                        window.drawingEnabled = true;
                        rulerButton.classList.add('active');
                        penButton.classList.remove('active');
                        arrowButton.classList.remove('active');
                        lineButton.classList.remove('active');
                        textButton.classList.remove('active');
                        eraserButton.classList.remove('active');
                        svg.classList.add('drawing-cursor');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('drawing-cursor');
                            svg2.classList.remove('erasing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante gomma
            if (eraserButton) {
                eraserButton.addEventListener('click', () => {
                    if (!isDrawSectionOpen()) return;
                    
                    if (drawingMode === 'eraser' && window.drawingEnabled) {
                        window.drawingEnabled = false;
                        eraserButton.classList.remove('active');
                        svg.classList.remove('erasing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'flex';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) svg2.classList.remove('erasing-cursor');
                    } else {
                        drawingMode = 'eraser';
                        window.drawingEnabled = true;
                        eraserButton.classList.add('active');
                        penButton.classList.remove('active');
                        arrowButton.classList.remove('active');
                        lineButton.classList.remove('active');
                        textButton.classList.remove('active');
                        rulerButton.classList.remove('active');
                        svg.classList.add('erasing-cursor');
                        svg.classList.remove('drawing-cursor');
                        fontSizeContainer.style.display = 'none';
                        widthContainer.style.display = 'none';
                        const svg2 = document.querySelector('.svg-wrap.secondary svg');
                        if (svg2) {
                            svg2.classList.add('erasing-cursor');
                            svg2.classList.remove('drawing-cursor');
                        }
                    }
                });
            }
            
            // Gestione del pulsante cancella tutto
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    // Cancella disegni dal campo primario
                    if (drawingGroup && drawingGroup.children.length > 0) {
                        while (drawingGroup.firstChild) {
                            drawingGroup.removeChild(drawingGroup.firstChild);
                        }
                    }
                    // Cancella disegni dal campo secondario
                    const drawingGroup2 = getSecondaryDrawingGroup();
                    if (drawingGroup2 && drawingGroup2.children.length > 0) {
                        while (drawingGroup2.firstChild) {
                            drawingGroup2.removeChild(drawingGroup2.firstChild);
                        }
                    }
                });
            }
            
            // Gestione del cambio colore
            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    drawColor = e.target.value;
                });
            }
            
            // Gestione del cambio spessore
            if (widthInput && widthValue) {
                widthInput.addEventListener('input', (e) => {
                    drawWidth = parseInt(e.target.value);
                    widthValue.textContent = drawWidth;
                });
            }
            
            // Gestione della dimensione font
            const fontSizeInput = document.getElementById('draw_font_size');
            if (fontSizeInput && fontSizeValue) {
                fontSizeInput.addEventListener('input', (e) => {
                    drawFontSize = parseInt(e.target.value);
                    fontSizeValue.textContent = drawFontSize;
                });
            }
            
            // Funzione per aggiungere event listeners a un SVG specifico
            function addDrawingListeners(svgElement, targetDrawingGroup) {
                // Previeni l'aggiunta multipla di listener allo stesso elemento
                if (svgElement._drawingListenersAttached) {
                    return; // Listener già aggiunti, non fare nulla
                }
                svgElement._drawingListenersAttached = true;
                
                svgElement.addEventListener('mousedown', (evt) => {
                    if (!window.drawingEnabled) return;
                    
                    // Previeni l'interferenza con altre funzionalità
                    evt.preventDefault();
                    evt.stopPropagation();
                    
                    isDrawing = true;
                    const coords = getSvgCoordinates(evt, svgElement);
                
                if (drawingMode === 'pen') {
                    // Crea un nuovo path per il disegno
                    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    currentPath.setAttribute('fill', 'none');
                    currentPath.setAttribute('stroke', drawColor);
                    currentPath.setAttribute('stroke-width', drawWidth);
                    currentPath.setAttribute('stroke-linecap', 'round');
                    currentPath.setAttribute('stroke-linejoin', 'round');
                    currentPath.setAttribute('d', `M ${coords.x} ${coords.y}`);
                    currentPath.classList.add('user-drawing');
                    targetDrawingGroup.appendChild(currentPath);
                } else if (drawingMode === 'arrow') {
                    // Salva il punto iniziale per la freccia
                    startPoint = coords;
                    // Crea un gruppo per contenere linea e punta della freccia
                    currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    currentElement.classList.add('user-drawing');
                    
                    // Crea la linea della freccia
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', coords.x);
                    line.setAttribute('y1', coords.y);
                    line.setAttribute('x2', coords.x);
                    line.setAttribute('y2', coords.y);
                    line.setAttribute('stroke', drawColor);
                    line.setAttribute('stroke-width', drawWidth);
                    line.setAttribute('stroke-linecap', 'round');
                    line.classList.add('arrow-line');
                    currentElement.appendChild(line);
                    
                    // Crea la punta della freccia
                    const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    arrowhead.setAttribute('fill', drawColor);
                    arrowhead.setAttribute('stroke', 'none');
                    arrowhead.classList.add('arrow-head');
                    currentElement.appendChild(arrowhead);
                    
                    targetDrawingGroup.appendChild(currentElement);
                } else if (drawingMode === 'line') {
                    // Salva il punto iniziale per la linea
                    startPoint = coords;
                    // Crea una linea
                    currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    currentElement.setAttribute('x1', coords.x);
                    currentElement.setAttribute('y1', coords.y);
                    currentElement.setAttribute('x2', coords.x);
                    currentElement.setAttribute('y2', coords.y);
                    currentElement.setAttribute('stroke', drawColor);
                    currentElement.setAttribute('stroke-width', drawWidth);
                    currentElement.setAttribute('stroke-linecap', 'round');
                    currentElement.classList.add('user-drawing');
                    targetDrawingGroup.appendChild(currentElement);
                } else if (drawingMode === 'text') {
                    // Mostra prompt per inserire il testo
                    const userText = prompt('Inserisci il testo da visualizzare sul campo:', '');
                    if (userText && userText.trim() !== '') {
                        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        textElement.setAttribute('x', coords.x);
                        textElement.setAttribute('y', coords.y);
                        textElement.setAttribute('fill', drawColor);
                        textElement.setAttribute('font-size', drawFontSize);
                        textElement.setAttribute('font-family', 'Roboto, Arial, sans-serif');
                        textElement.setAttribute('font-weight', '600');
                        textElement.setAttribute('text-anchor', 'middle');
                        textElement.setAttribute('dominant-baseline', 'middle');
                        textElement.textContent = userText;
                        textElement.classList.add('user-drawing', 'draggable-text');
                        textElement.style.cursor = 'move';
                        
                        // Sistema ottimizzato di trascinamento (evita accumulo di event listener)
                        // I dati vengono salvati nell'elemento, mentre i listener mousemove/mouseup
                        // sono gestiti centralmente dall'SVG parent (uno solo per tutti i testi)
                        textElement._draggableData = {
                            isDragging: false,
                            hasMoved: false,
                            startX: 0,
                            startY: 0,
                            textStartX: 0,
                            textStartY: 0,
                            svgElement: svgElement
                        };
                        
                        // Mousedown sul testo per iniziare il trascinamento
                        textElement.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            const data = textElement._draggableData;
                            data.isDragging = true;
                            data.hasMoved = false;
                            const coords = getSvgCoordinates(e, data.svgElement);
                            data.startX = coords.x;
                            data.startY = coords.y;
                            data.textStartX = parseFloat(textElement.getAttribute('x'));
                            data.textStartY = parseFloat(textElement.getAttribute('y'));
                            
                            // Salva l'elemento corrente che sta venendo trascinato
                            data.svgElement._currentDraggingText = textElement;
                        });
                        
                        // Click per modificare il testo (solo se non è stato trascinato)
                        textElement.addEventListener('click', (e) => {
                            const data = textElement._draggableData;
                            if (!data.hasMoved) {
                                e.stopPropagation();
                                const newText = prompt('Modifica il testo:', textElement.textContent);
                                if (newText !== null && newText.trim() !== '') {
                                    textElement.textContent = newText;
                                }
                            }
                        });
                        
                        // Doppio click per modificare le dimensioni
                        textElement.addEventListener('dblclick', (e) => {
                            e.stopPropagation();
                            const currentSize = parseFloat(textElement.getAttribute('font-size'));
                            const newSize = prompt('Inserisci la nuova dimensione del testo (12-72):', currentSize);
                            if (newSize !== null) {
                                const size = parseInt(newSize);
                                if (!isNaN(size) && size >= 12 && size <= 72) {
                                    textElement.setAttribute('font-size', size);
                                }
                            }
                        });
                        
                        targetDrawingGroup.appendChild(textElement);
                    }
                    isDrawing = false; // Il testo non richiede drag
                } else if (drawingMode === 'ruler') {
                    // Salva il punto iniziale per il righello
                    startPoint = coords;
                    // Crea un gruppo per contenere linea e misura
                    currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    currentElement.classList.add('user-drawing');
                    
                    // Crea la linea del righello
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', coords.x);
                    line.setAttribute('y1', coords.y);
                    line.setAttribute('x2', coords.x);
                    line.setAttribute('y2', coords.y);
                    line.setAttribute('stroke', drawColor);
                    line.setAttribute('stroke-width', drawWidth);
                    line.setAttribute('stroke-linecap', 'round');
                    line.classList.add('ruler-line');
                    currentElement.appendChild(line);
                    
                    // Crea i segmentini perpendicolari alle estremità
                    const tick1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    tick1.setAttribute('stroke', drawColor);
                    tick1.setAttribute('stroke-width', drawWidth);
                    tick1.setAttribute('stroke-linecap', 'round');
                    tick1.classList.add('ruler-tick-1');
                    currentElement.appendChild(tick1);
                    
                    const tick2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    tick2.setAttribute('stroke', drawColor);
                    tick2.setAttribute('stroke-width', drawWidth);
                    tick2.setAttribute('stroke-linecap', 'round');
                    tick2.classList.add('ruler-tick-2');
                    currentElement.appendChild(tick2);
                    
                    // Crea il rettangolo di sfondo per la misura
                    const measureBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    measureBg.setAttribute('fill', '#fff');
                    measureBg.setAttribute('stroke', drawColor);
                    measureBg.setAttribute('stroke-width', '1');
                    measureBg.setAttribute('rx', '4');
                    measureBg.classList.add('ruler-measure-bg');
                    currentElement.appendChild(measureBg);
                    
                    // Crea il testo della misura
                    const measureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    measureText.setAttribute('fill', drawColor);
                    measureText.setAttribute('font-size', '18');
                    measureText.setAttribute('font-family', 'Roboto, Arial, monospace');
                    measureText.setAttribute('font-weight', '700');
                    measureText.setAttribute('text-anchor', 'middle');
                    measureText.setAttribute('dominant-baseline', 'middle');
                    measureText.textContent = '0.0m';
                    measureText.classList.add('ruler-measure');
                    currentElement.appendChild(measureText);
                    
                    targetDrawingGroup.appendChild(currentElement);
                } else if (drawingMode === 'eraser') {
                    // Trova e rimuovi elementi vicini al cursore con un raggio più ampio
                    const eraserRadius = 15; // Raggio di cancellazione
                    const drawings = targetDrawingGroup.querySelectorAll('.user-drawing');
                    
                    for (let drawing of drawings) {
                        let shouldRemove = false;
                        
                        // Controlla diversi punti intorno al cursore
                        for (let offsetX = -eraserRadius; offsetX <= eraserRadius; offsetX += 5) {
                            for (let offsetY = -eraserRadius; offsetY <= eraserRadius; offsetY += 5) {
                                const testX = evt.clientX + offsetX;
                                const testY = evt.clientY + offsetY;
                                const elementsAtPoint = document.elementsFromPoint(testX, testY);
                                
                                for (let elem of elementsAtPoint) {
                                    if (elem === drawing || elem.parentElement === drawing || 
                                        elem.classList.contains('arrow-line') || 
                                        elem.classList.contains('arrow-head')) {
                                        shouldRemove = true;
                                        break;
                                    }
                                }
                                if (shouldRemove) break;
                            }
                            if (shouldRemove) break;
                        }
                        
                        if (shouldRemove) {
                            drawing.remove();
                            break; // Rimuovi un elemento alla volta per un controllo migliore
                        }
                    }
                }
            });
            
            svgElement.addEventListener('mousemove', (evt) => {
                // Gestione centralizzata del trascinamento testo (ottimizzato per performance)
                // Invece di aggiungere listener per ogni testo, usiamo UN SOLO listener globale
                // che controlla quale testo sta venendo trascinato
                if (svgElement._currentDraggingText) {
                    const textElement = svgElement._currentDraggingText;
                    const data = textElement._draggableData;
                    if (data && data.isDragging) {
                        data.hasMoved = true;
                        const coords = getSvgCoordinates(evt, svgElement);
                        const dx = coords.x - data.startX;
                        const dy = coords.y - data.startY;
                        textElement.setAttribute('x', data.textStartX + dx);
                        textElement.setAttribute('y', data.textStartY + dy);
                        return;
                    }
                }
                
                if (!isDrawing || !window.drawingEnabled) return;
                
                evt.preventDefault();
                evt.stopPropagation();
                
                const coords = getSvgCoordinates(evt, svgElement);
                
                if (drawingMode === 'pen' && currentPath) {
                    // Continua il path
                    const currentD = currentPath.getAttribute('d');
                    currentPath.setAttribute('d', `${currentD} L ${coords.x} ${coords.y}`);
                } else if (drawingMode === 'arrow' && currentElement && startPoint) {
                    // Aggiorna la linea della freccia
                    const line = currentElement.querySelector('.arrow-line');
                    if (line) {
                        line.setAttribute('x2', coords.x);
                        line.setAttribute('y2', coords.y);
                    }
                    
                    // Calcola e aggiorna la punta della freccia (più grande e più evidente)
                    const arrowhead = currentElement.querySelector('.arrow-head');
                    if (arrowhead) {
                        const dx = coords.x - startPoint.x;
                        const dy = coords.y - startPoint.y;
                        const angle = Math.atan2(dy, dx);
                        
                        // Freccia molto più grande e più larga (angolo più ampio)
                        const arrowSize = Math.max(20, drawWidth * 5); // Dimensione aumentata
                        const arrowAngle = Math.PI / 4.5; // Angolo più ampio per rendere la freccia più evidente
                        
                        // Calcola i punti della punta della freccia (triangolo più grande)
                        const x1 = coords.x - arrowSize * Math.cos(angle - arrowAngle);
                        const y1 = coords.y - arrowSize * Math.sin(angle - arrowAngle);
                        const x2 = coords.x - arrowSize * Math.cos(angle + arrowAngle);
                        const y2 = coords.y - arrowSize * Math.sin(angle + arrowAngle);
                        
                        arrowhead.setAttribute('d', `M ${coords.x} ${coords.y} L ${x1} ${y1} L ${x2} ${y2} Z`);
                        arrowhead.setAttribute('stroke', drawColor);
                        arrowhead.setAttribute('stroke-width', '1');
                        arrowhead.setAttribute('stroke-linejoin', 'miter');
                    }
                } else if (drawingMode === 'line' && currentElement) {
                    // Aggiorna la linea
                    currentElement.setAttribute('x2', coords.x);
                    currentElement.setAttribute('y2', coords.y);
                } else if (drawingMode === 'ruler' && currentElement && startPoint) {
                    // Ottimizzazione: usa riferimenti cached invece di querySelector ripetuti
                    if (!currentElement._cachedElements) {
                        currentElement._cachedElements = {
                            line: currentElement.querySelector('.ruler-line'),
                            measureText: currentElement.querySelector('.ruler-measure'),
                            measureBg: currentElement.querySelector('.ruler-measure-bg'),
                            tick1: currentElement.querySelector('.ruler-tick-1'),
                            tick2: currentElement.querySelector('.ruler-tick-2')
                        };
                    }
                    
                    const { line, measureText, measureBg, tick1, tick2 } = currentElement._cachedElements;
                    
                    // Aggiorna la linea del righello
                    if (line) {
                        line.setAttribute('x2', coords.x);
                        line.setAttribute('y2', coords.y);
                    }
                    
                    // Calcola la lunghezza
                    const dx = coords.x - startPoint.x;
                    const dy = coords.y - startPoint.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    // Calcola l'angolo della linea
                    const angle = Math.atan2(dy, dx);
                    
                    // Aggiorna i segmentini perpendicolari alle estremità
                    const tickLength = 10; // Lunghezza del segmentino
                    if (tick1) {
                        // Segmentino all'inizio
                        const perpAngle = angle + Math.PI / 2; // Perpendicolare
                        const tick1x1 = startPoint.x - Math.cos(perpAngle) * tickLength;
                        const tick1y1 = startPoint.y - Math.sin(perpAngle) * tickLength;
                        const tick1x2 = startPoint.x + Math.cos(perpAngle) * tickLength;
                        const tick1y2 = startPoint.y + Math.sin(perpAngle) * tickLength;
                        tick1.setAttribute('x1', tick1x1);
                        tick1.setAttribute('y1', tick1y1);
                        tick1.setAttribute('x2', tick1x2);
                        tick1.setAttribute('y2', tick1y2);
                    }
                    if (tick2) {
                        // Segmentino alla fine
                        const perpAngle = angle + Math.PI / 2; // Perpendicolare
                        const tick2x1 = coords.x - Math.cos(perpAngle) * tickLength;
                        const tick2y1 = coords.y - Math.sin(perpAngle) * tickLength;
                        const tick2x2 = coords.x + Math.cos(perpAngle) * tickLength;
                        const tick2y2 = coords.y + Math.sin(perpAngle) * tickLength;
                        tick2.setAttribute('x1', tick2x1);
                        tick2.setAttribute('y1', tick2y1);
                        tick2.setAttribute('x2', tick2x2);
                        tick2.setAttribute('y2', tick2y2);
                    }
                    
                    // Aggiorna il testo della misura (converti in metri)
                    if (measureText && measureBg) {
                        const lengthInMeters = length / 28.20;
                        const lengthText = lengthInMeters.toFixed(1) + 'm';
                        measureText.textContent = lengthText;
                        
                        // Posiziona il testo al centro della linea
                        const midX = (startPoint.x + coords.x) / 2;
                        const midY = (startPoint.y + coords.y) / 2;
                        
                        // Calcola l'angolo della linea per posizionare il testo perpendicolarmente
                        const offset = 15; // Distanza dalla linea
                        const textX = midX - Math.sin(angle) * offset;
                        const textY = midY + Math.cos(angle) * offset;
                        
                        measureText.setAttribute('x', textX);
                        measureText.setAttribute('y', textY);
                        
                        // Dimensiona il rettangolo di sfondo basandosi sulla lunghezza del testo
                        // Stima approssimativa per evitare getBBox() che è costoso in performance
                        const textWidth = lengthText.length * 11; // Approssimazione basata su font-size 18
                        const textHeight = 22;
                        measureBg.setAttribute('x', textX - textWidth / 2 - 4);
                        measureBg.setAttribute('y', textY - textHeight / 2 - 2);
                        measureBg.setAttribute('width', textWidth + 8);
                        measureBg.setAttribute('height', textHeight + 4);
                    }
                } else if (drawingMode === 'eraser') {
                    // Continua a cancellare mentre si muove con il mouse premuto
                    const eraserRadius = 15; // Raggio di cancellazione
                    const drawings = targetDrawingGroup.querySelectorAll('.user-drawing');
                    
                    for (let drawing of drawings) {
                        let shouldRemove = false;
                        
                        // Controlla diversi punti intorno al cursore
                        for (let offsetX = -eraserRadius; offsetX <= eraserRadius; offsetX += 5) {
                            for (let offsetY = -eraserRadius; offsetY <= eraserRadius; offsetY += 5) {
                                const testX = evt.clientX + offsetX;
                                const testY = evt.clientY + offsetY;
                                const elementsAtPoint = document.elementsFromPoint(testX, testY);
                                
                                for (let elem of elementsAtPoint) {
                                    if (elem === drawing || elem.parentElement === drawing || 
                                        elem.classList.contains('arrow-line') || 
                                        elem.classList.contains('arrow-head')) {
                                        shouldRemove = true;
                                        break;
                                    }
                                }
                                if (shouldRemove) break;
                            }
                            if (shouldRemove) break;
                        }
                        
                        if (shouldRemove) {
                            drawing.remove();
                            break; // Rimuovi un elemento alla volta per un controllo migliore
                        }
                    }
                }
            });
            
            svgElement.addEventListener('mouseup', () => {
                // Gestione fine trascinamento testo
                if (svgElement._currentDraggingText) {
                    const textElement = svgElement._currentDraggingText;
                    const data = textElement._draggableData;
                    if (data) {
                        data.isDragging = false;
                    }
                    svgElement._currentDraggingText = null;
                }
                
                if (!window.drawingEnabled) return;
                isDrawing = false;
                currentPath = null;
                currentElement = null;
                startPoint = null;
            });
            
            svgElement.addEventListener('mouseleave', () => {
                // Gestione fine trascinamento testo se si esce dall'SVG
                if (svgElement._currentDraggingText) {
                    const textElement = svgElement._currentDraggingText;
                    const data = textElement._draggableData;
                    if (data) {
                        data.isDragging = false;
                    }
                    svgElement._currentDraggingText = null;
                }
                
                if (!window.drawingEnabled) return;
                isDrawing = false;
                currentPath = null;
                currentElement = null;
                startPoint = null;
            });
            
            // Supporto touch per dispositivi mobili
            svgElement.addEventListener('touchstart', (evt) => {
                if (!window.drawingEnabled) return;
                evt.preventDefault();
                
                const touch = evt.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                svgElement.dispatchEvent(mouseEvent);
            }, { passive: false });
            
            svgElement.addEventListener('touchmove', (evt) => {
                if (!window.drawingEnabled) return;
                evt.preventDefault();
                
                const touch = evt.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                svgElement.dispatchEvent(mouseEvent);
            }, { passive: false });
            
            svgElement.addEventListener('touchend', (evt) => {
                if (!window.drawingEnabled) return;
                evt.preventDefault();
                
                const mouseEvent = new MouseEvent('mouseup', {});
                svgElement.dispatchEvent(mouseEvent);
            }, { passive: false });
        }
            
            // Applica i listener al campo primario
            addDrawingListeners(svg, drawingGroup);
            
            // Applica i listener al campo secondario (se esiste e viene creato in modalità 2 colpi)
            function setupSecondaryDrawing() {
                const svg2 = document.querySelector('.svg-wrap.secondary svg');
                if (svg2) {
                    const drawingGroup2 = getSecondaryDrawingGroup();
                    if (drawingGroup2) {
                        addDrawingListeners(svg2, drawingGroup2);
                    }
                }
            }
            
            // Configura il disegno sul secondo campo quando viene creato
            setupSecondaryDrawing();
            
            // Observer per rilevare quando il secondo SVG viene aggiunto
            const secondaryWrap = document.querySelector('.svg-wrap.secondary');
            if (secondaryWrap) {
                const observer = new MutationObserver((mutations) => {
                    // Controlla solo se è stato aggiunto un nuovo elemento SVG (non per ogni disegno)
                    for (const mutation of mutations) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            for (const node of mutation.addedNodes) {
                                // Rileva solo l'aggiunta dell'elemento SVG principale, non i disegni
                                if (node.tagName === 'svg' || (node.tagName === 'DIV' && node.querySelector('svg'))) {
                                    setupSecondaryDrawing();
                                    return; // Setup fatto, esci
                                }
                            }
                        }
                    }
                });
                observer.observe(secondaryWrap, { childList: true, subtree: false });
            }
            
            // Gestione dell'indicatore visivo della gomma
            document.addEventListener('mousemove', (evt) => {
                if (drawingMode === 'eraser' && window.drawingEnabled && eraserIndicator) {
                    eraserIndicator.style.display = 'block';
                    eraserIndicator.style.left = evt.clientX + 'px';
                    eraserIndicator.style.top = evt.clientY + 'px';
                } else if (eraserIndicator) {
                    eraserIndicator.style.display = 'none';
                }
            });

            if (settingsTitleTrigger) {
                settingsTitleTrigger.addEventListener('click', handleMobileSettingsToggle);
                settingsTitleTrigger.addEventListener('keydown', (event) => {
                    const isActivationKey = event.key === 'Enter' || event.key === ' ' || event.key === 'Space' || event.key === 'Spacebar';
                    if (isActivationKey) {
                        handleMobileSettingsToggle(event);
                    }
                });
            }

            if (mobilePanelToggle) {
                mobilePanelToggle.addEventListener('click', () => {
                    if (!isMobileLayout) return;
                    setMobileSecondaryVisible(!isMobileSecondaryVisible);
                });
            }

            if (dinamicoMobileToggle) {
                dinamicoMobileToggle.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (!bodyEl.classList.contains('mobile-dinamico')) return;
                    setMobileDinamicoPanelOpen(!isMobileDinamicoPanelOpen);
                });
            }

            // ==========================================
            // MOBILE NAV PILLS & PANEL SECTIONS
            // ==========================================
            const mobileNavModalita = document.getElementById('mobileNavModalita');
            const mobileNavMenu = document.getElementById('mobileNavMenu');
            const mobileNavDots = document.getElementById('mobileNavDots');
            const panelModalita = document.getElementById('panelModalita');
            const panelImpostazioni = document.getElementById('panelImpostazioni');
            
            // Mobile side drawer elements
            const mobileSideDrawer = document.getElementById('mobileSideDrawer');
            const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
            const mobileDrawerClose = document.getElementById('mobileDrawerClose');
            const mobileDrawerGuida = document.getElementById('mobileDrawerGuida');
            
            // Mobile drawer functions
            function openMobileDrawer() {
                if (mobileSideDrawer) {
                    mobileSideDrawer.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            }
            
            function closeMobileDrawer() {
                if (mobileSideDrawer) {
                    mobileSideDrawer.classList.remove('open');
                    document.body.style.overflow = '';
                }
            }
            
            // Mobile drawer event listeners
            if (mobileNavDots) {
                mobileNavDots.addEventListener('click', () => {
                    openMobileDrawer();
                });
            }
            
            if (mobileDrawerOverlay) {
                mobileDrawerOverlay.addEventListener('click', () => {
                    closeMobileDrawer();
                });
            }
            
            if (mobileDrawerClose) {
                mobileDrawerClose.addEventListener('click', () => {
                    closeMobileDrawer();
                });
            }
            
            if (mobileDrawerGuida) {
                mobileDrawerGuida.addEventListener('click', () => {
                    closeMobileDrawer();
                    if (typeof window.openTutorial === 'function') {
                        window.openTutorial();
                    }
                });
            }
            
            // Sincronizzazione superficie drawer con controlli principali
            const drawerSuperficieRadios = document.querySelectorAll('input[name="campoType_drawer"]');
            const mainSuperficieRadios = document.querySelectorAll('input[name="campoType"]');
            
            drawerSuperficieRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    // Sincronizza con i radio principali
                    mainSuperficieRadios.forEach(mainRadio => {
                        if (mainRadio.value === e.target.value) {
                            mainRadio.checked = true;
                            mainRadio.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                });
            });
            
            // Sincronizzazione default drawer con controlli principali
            const drawerDefaultSelects = {
                colpitore: document.getElementById('default_colpitore_drawer'),
                modalita: document.getElementById('default_modalita_drawer'),
                tipologia: document.getElementById('default_tipologia_drawer'),
                campoType: document.getElementById('default_campoType_drawer')
            };
            
            const mainDefaultSelects = {
                colpitore: document.getElementById('default_colpitore'),
                modalita: document.getElementById('default_modalita'),
                tipologia: document.getElementById('default_tipologia'),
                campoType: document.getElementById('default_campoType')
            };
            
            Object.keys(drawerDefaultSelects).forEach(key => {
                const drawerSelect = drawerDefaultSelects[key];
                const mainSelect = mainDefaultSelects[key];
                if (drawerSelect && mainSelect) {
                    drawerSelect.addEventListener('change', () => {
                        mainSelect.value = drawerSelect.value;
                        mainSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                }
            });
            
            // Sincronizzazione checkbox visualizza drawer con controlli principali
            const drawerViewCheckboxes = {
                player: document.getElementById('default_view_player_drawer'),
                responder: document.getElementById('default_view_responder_drawer'),
                directions: document.getElementById('default_view_directions_drawer'),
                shot: document.getElementById('default_view_shot_drawer'),
                center: document.getElementById('default_view_center_drawer'),
                cover: document.getElementById('default_view_cover_drawer'),
                zones: document.getElementById('default_view_zones_drawer'),
                coordinates: document.getElementById('default_view_coordinates_drawer')
            };
            
            const mainViewCheckboxes = {
                player: document.getElementById('default_view_player'),
                responder: document.getElementById('default_view_responder'),
                directions: document.getElementById('default_view_directions'),
                shot: document.getElementById('default_view_shot'),
                center: document.getElementById('default_view_center'),
                cover: document.getElementById('default_view_cover'),
                zones: document.getElementById('default_view_zones'),
                coordinates: document.getElementById('default_view_coordinates')
            };
            
            Object.keys(drawerViewCheckboxes).forEach(key => {
                const drawerCheckbox = drawerViewCheckboxes[key];
                const mainCheckbox = mainViewCheckboxes[key];
                if (drawerCheckbox && mainCheckbox) {
                    drawerCheckbox.addEventListener('change', () => {
                        mainCheckbox.checked = drawerCheckbox.checked;
                        mainCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                }
            });
            
            // Desktop guida button (ora è un header come gli altri)
            const desktopGuidaButton = document.getElementById('desktopGuidaButton');
            if (desktopGuidaButton) {
                desktopGuidaButton.addEventListener('click', () => {
                    if (typeof window.openTutorial === 'function') {
                        window.openTutorial();
                    }
                });
                desktopGuidaButton.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (typeof window.openTutorial === 'function') {
                            window.openTutorial();
                        }
                    }
                });
            }
            
            // Mobile nav pill clicks - Modalità
            if (mobileNavModalita) {
                mobileNavModalita.addEventListener('click', () => {
                    if (currentMobileSection === 'modalita' && mobileSettingsOpen) {
                        setMobileSettingsState(false, 'modalita');
                    } else {
                        setMobileSettingsState(true, 'modalita');
                    }
                });
            }
            
            // Mobile nav Menu button - opens menu with all options + download at bottom
            if (mobileNavMenu) {
                mobileNavMenu.addEventListener('click', () => {
                    if (currentMobileSection === 'menu' && mobileSettingsOpen) {
                        setMobileSettingsState(false, 'menu');
                    } else {
                        setMobileSettingsState(true, 'menu');
                        // Aggiorna visibilità opzioni download per la modalità corrente
                        if (typeof updateDownloadButtonVisibility === 'function') {
                            updateDownloadButtonVisibility(window.__modalita__ || '2colpi');
                        }
                    }
                });
            }
            
            // Desktop panel section headers (collapsible)
            const panelHeaders = document.querySelectorAll('.panel-section-header');
            panelHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    if (isMobileViewport()) return; // Skip on mobile
                    
                    const section = header.closest('.panel-section');
                    const content = section?.querySelector('.panel-section-content');
                    if (!content) return;
                    
                    const isExpanded = content.classList.contains('expanded');
                    content.classList.toggle('expanded', !isExpanded);
                    header.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
                });
                
                header.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        header.click();
                    }
                });
            });
            
            // Initialize panel sections visibility on mobile
            function initMobilePanelSections() {
                if (isMobileViewport()) {
                    // Default to impostazioni on mobile
                    setMobileSettingsState(false, 'impostazioni');
                }
            }

            window.addEventListener('resize', () => {
                applyMobileSettingsMode();
                updateMobilePanels();
                scheduleMobileCourtGapAdjustment();
            });

            setMobileSecondaryVisible(false);
            initDinamicoPanelObserver();
            applyMobileSettingsMode(true);
            updateMobilePanels();
            scheduleMobileCourtGapAdjustment();
            initMobilePanelSections();

            // ==========================================
            // TUTORIAL / GUIDA INTERATTIVA
            // ==========================================
            (function initTutorial() {
                const tutorialOverlay = document.getElementById('tutorialOverlay');
                const tutorialClose = document.getElementById('tutorialClose');
                const tutorialPrev = document.getElementById('tutorialPrev');
                const tutorialNext = document.getElementById('tutorialNext');
                const tutorialProgressFill = document.getElementById('tutorialProgressFill');
                const tutorialProgressText = document.getElementById('tutorialProgressText');
                const tutorialDotsContainer = document.getElementById('tutorialDots');
                
                if (!tutorialOverlay) return;
                
                const tutorialSteps = tutorialOverlay.querySelectorAll('.tutorial-step');
                const totalSteps = tutorialSteps.length;
                let currentStep = 0;
                let currentHighlightOverlay = null;
                
                // Variabile per salvare la modalità originale
                let savedModalita = null;
                
                // Crea i dots di navigazione
                function createDots() {
                    if (!tutorialDotsContainer) return;
                    tutorialDotsContainer.innerHTML = '';
                    for (let i = 0; i < totalSteps; i++) {
                        const dot = document.createElement('button');
                        dot.className = 'tutorial-dot' + (i === 0 ? ' active' : '');
                        dot.setAttribute('aria-label', `Vai allo step ${i + 1}`);
                        dot.addEventListener('click', () => goToStep(i));
                        tutorialDotsContainer.appendChild(dot);
                    }
                }
                
                // Rimuove l'overlay di evidenziazione esistente
                function removeHighlight() {
                    if (currentHighlightOverlay) {
                        // Rimuovi i listener se esistono
                        if (currentHighlightOverlay._scrollListener) {
                            window.removeEventListener('scroll', currentHighlightOverlay._scrollListener, true);
                        }
                        if (currentHighlightOverlay._resizeListener) {
                            window.removeEventListener('resize', currentHighlightOverlay._resizeListener);
                        }
                        currentHighlightOverlay.remove();
                        currentHighlightOverlay = null;
                    }
                }
                
                // Calcola il bounding box combinato per più elementi
                function getCombinedBoundingBox(elements) {
                    if (!elements || elements.length === 0) return null;
                    
                    let minLeft = Infinity;
                    let minTop = Infinity;
                    let maxRight = -Infinity;
                    let maxBottom = -Infinity;
                    
                    for (let el of elements) {
                        if (!el) continue;
                        const rect = el.getBoundingClientRect();
                        if (rect.width === 0 && rect.height === 0) continue; // Skip invisible elements
                        minLeft = Math.min(minLeft, rect.left);
                        minTop = Math.min(minTop, rect.top);
                        maxRight = Math.max(maxRight, rect.right);
                        maxBottom = Math.max(maxBottom, rect.bottom);
                    }
                    
                    if (minLeft === Infinity) return null;
                    
                    return {
                        left: minLeft,
                        top: minTop,
                        width: maxRight - minLeft,
                        height: maxBottom - minTop
                    };
                }
                
                function findCompactSectionByTitle(titleMatch) {
                    const sections = document.querySelectorAll('.control-section.compact');
                    const match = titleMatch.toLowerCase();
                    
                    for (let section of sections) {
                        const title = section.querySelector('.control-section-title');
                        if (!title) continue;
                        const titleText = title.textContent.trim().toLowerCase();
                        if (!titleText.includes(match)) continue;
                        
                        const rect = section.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            return section;
                        }
                    }
                    
                    return null;
                }
                
                // Mappa i valori di data-highlight agli elementi reali dell'interfaccia
                function getHighlightElement(highlightValue) {
                    switch (highlightValue) {
                        case 'primary-court':
                            return document.querySelector('.court-container.primary-court');
                        case 'modalita-section':
                            return document.getElementById('panelModalita');
                        case 'colpitore-section':
                            // Prima cerca la scheda compatta (scelta colpitore)
                            const compactColpitore = findCompactSectionByTitle('colpitore');
                            if (compactColpitore) {
                                return compactColpitore;
                            }
                            // Trova la sezione Colpitore dentro panelImpostazioni
                            const impostazioniPanel = document.getElementById('panelImpostazioni');
                            if (impostazioniPanel) {
                                const sections = impostazioniPanel.querySelectorAll('.control-section');
                                for (let section of sections) {
                                    const title = section.querySelector('.control-section-title');
                                    if (title && title.textContent.trim().toLowerCase() === 'colpitore') {
                                        return section;
                                    }
                                }
                            }
                            return null;
                        case 'player-dot':
                            return document.getElementById('cursorDot');
                        case 'wedge-area':
                            return document.getElementById('wedgeFill');
                        case 'shot-and-responder':
                            // Ritorna un oggetto speciale per indicare elementi multipli
                            const yellowLineEl = document.getElementById('yellowLine');
                            const intersectionDotEl = document.getElementById('intersectionDot');
                            return {
                                _multiElement: true,
                                elements: [yellowLineEl, intersectionDotEl].filter(el => el !== null)
                            };
                        case 'h-measure':
                            // Ritorna un oggetto speciale per indicare elementi multipli
                            const hMeasureEl = document.getElementById('h-measure');
                            const hMeasureLabelEl = document.getElementById('h-measure-label');
                            const hMeasureBadgeEl = document.getElementById('h-measure-badge');
                            const arrowHtmlEl = document.getElementById('measureArrowHtml');
                            return {
                                _multiElement: true,
                                elements: [hMeasureEl, hMeasureLabelEl, hMeasureBadgeEl, arrowHtmlEl].filter(el => el !== null)
                            };
                        case 'tipologia-section':
                            // Prima cerca la scheda compatta (scelta colpo)
                            const compactColpo = findCompactSectionByTitle('colpo');
                            if (compactColpo) {
                                return compactColpo;
                            }
                            // Trova la sezione Colpo (precedentemente chiamata Tipologia) dentro panelImpostazioni
                            const tipologiaPanel = document.getElementById('panelImpostazioni');
                            if (tipologiaPanel) {
                                const sections = tipologiaPanel.querySelectorAll('.control-section');
                                for (let section of sections) {
                                    const title = section.querySelector('.control-section-title');
                                    // Cerca sia "Colpo" che "Tipologia" per compatibilità
                                    const titleText = title.textContent.trim().toLowerCase();
                                    if (titleText === 'colpo' || titleText === 'tipologia') {
                                        return section;
                                    }
                                }
                            }
                            return null;
                        case 'secondary-court':
                            return document.querySelector('.court-container.secondary-court');
                        case 'dinamico-panel':
                            return document.getElementById('dinamicoPanel');
                        case 'visualizza-disegna-section': {
                            const visualizzaSection = findCompactSectionByTitle('visualizza');
                            const disegnaSection = document.getElementById('draw-section');
                            const els = [visualizzaSection, disegnaSection].filter(el => el !== null);
                            if (els.length === 0) return null;
                            if (els.length === 1) return els[0];
                            return { _multiElement: true, elements: els };
                        }
                        default:
                            return null;
                    }
                }
                
                // Crea e posiziona l'overlay di evidenziazione sopra un elemento o più elementi
                function highlightElement(targetElement) {
                    if (!targetElement) return;
                    
                    // Rimuovi l'overlay esistente
                    removeHighlight();
                    
                    let rect;
                    let elements = [];
                    
                    // Gestisci elementi multipli
                    if (targetElement._multiElement && targetElement.elements) {
                        elements = targetElement.elements;
                        const combinedRect = getCombinedBoundingBox(elements);
                        if (!combinedRect) return; // Nessun elemento visibile
                        rect = combinedRect;
                    } else {
                        // Elemento singolo
                        elements = [targetElement];
                        rect = targetElement.getBoundingClientRect();
                        // Skip se l'elemento non è visibile
                        if (rect.width === 0 && rect.height === 0) return;
                    }
                    
                    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
                    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                    
                    // Crea l'overlay
                    const overlay = document.createElement('div');
                    overlay.className = 'tutorial-element-highlight';
                    
                    // Aggiungi un piccolo padding per rendere l'evidenziazione più visibile
                    const padding = 4;
                    overlay.style.position = 'fixed';
                    overlay.style.left = (rect.left + scrollX - padding) + 'px';
                    overlay.style.top = (rect.top + scrollY - padding) + 'px';
                    overlay.style.width = (rect.width + padding * 2) + 'px';
                    overlay.style.height = (rect.height + padding * 2) + 'px';
                    
                    document.body.appendChild(overlay);
                    currentHighlightOverlay = overlay;
                    
                    // Aggiorna la posizione quando si scrolla o ridimensiona
                    const updatePosition = () => {
                        if (!overlay.parentNode) return;
                        
                        let newRect;
                        if (targetElement._multiElement && targetElement.elements) {
                            const combinedRect = getCombinedBoundingBox(elements);
                            if (!combinedRect) return;
                            newRect = combinedRect;
                        } else {
                            if (!targetElement || !targetElement.getBoundingClientRect) return;
                            newRect = targetElement.getBoundingClientRect();
                            if (newRect.width === 0 && newRect.height === 0) return;
                        }
                        
                        const newScrollX = window.pageXOffset || document.documentElement.scrollLeft;
                        const newScrollY = window.pageYOffset || document.documentElement.scrollTop;
                        
                        overlay.style.left = (newRect.left + newScrollX - padding) + 'px';
                        overlay.style.top = (newRect.top + newScrollY - padding) + 'px';
                        overlay.style.width = (newRect.width + padding * 2) + 'px';
                        overlay.style.height = (newRect.height + padding * 2) + 'px';
                    };
                    
                    // Listener per scroll e resize (con debounce)
                    let updateTimeout;
                    const scheduleUpdate = () => {
                        clearTimeout(updateTimeout);
                        updateTimeout = setTimeout(updatePosition, 10);
                    };
                    
                    // Crea i listener come funzioni con nome per poterli rimuovere
                    const scrollListener = () => scheduleUpdate();
                    const resizeListener = () => scheduleUpdate();
                    
                    window.addEventListener('scroll', scrollListener, true);
                    window.addEventListener('resize', resizeListener);
                    
                    // Salva i listener e gli elementi per poterli rimuovere dopo
                    overlay._scrollListener = scrollListener;
                    overlay._resizeListener = resizeListener;
                    overlay._targetElement = targetElement;
                    overlay._elements = elements;
                    overlay._updatePosition = updatePosition;
                }
                
                // Funzione esposta globalmente per aggiornare la posizione dell'highlight
                // Può essere chiamata dai movement handlers
                function updateHighlightPosition() {
                    if (!currentHighlightOverlay || !currentHighlightOverlay._updatePosition) return;
                    currentHighlightOverlay._updatePosition();
                }
                
                // Esponi la funzione globalmente
                window.updateTutorialHighlight = updateHighlightPosition;
                
                // Aggiorna l'evidenziazione basandosi sullo step corrente
                function updateHighlight() {
                    // Rimuovi evidenziazione esistente
                    removeHighlight();
                    
                    // Se il tutorial non è aperto, non evidenziare nulla
                    if (!tutorialOverlay.classList.contains('active')) {
                        return;
                    }
                    
                    // Trova lo step corrente
                    const activeStep = tutorialSteps[currentStep];
                    if (!activeStep) return;
                    
                    // Cerca un elemento con data-highlight nello step corrente
                    const highlightInfo = activeStep.querySelector('[data-highlight]');
                    if (!highlightInfo) return;
                    
                    const highlightValue = highlightInfo.getAttribute('data-highlight');
                    if (!highlightValue) return;
                    
                    // Trova l'elemento da evidenziare
                    let targetElement = getHighlightElement(highlightValue);
                    if (!targetElement) return;
                    
                    // Espandi automaticamente le sezioni collassate se necessario
                    if (highlightValue === 'colpitore-section' || highlightValue === 'modalita-section' || highlightValue === 'tipologia-section') {
                        // Se è una sezione collassata, espandila
                        const panelSection = targetElement.closest('.panel-section');
                        if (panelSection) {
                            const content = panelSection.querySelector('.panel-section-content');
                            if (content && !content.classList.contains('expanded')) {
                                // Espandi la sezione
                                content.classList.add('expanded');
                                const header = panelSection.querySelector('.panel-section-header');
                                if (header) {
                                    header.setAttribute('aria-expanded', 'true');
                                }
                            }
                        }
                        
                        // Se è una control-section collassata, espandila
                        if (targetElement && targetElement.classList && targetElement.classList.contains('control-section')) {
                            if (targetElement.classList.contains('collapsed')) {
                                targetElement.classList.remove('collapsed');
                            }
                        }
                    }
                    
                    // Aspetta un momento per assicurarsi che il layout sia stabile dopo l'espansione
                    setTimeout(() => {
                        // Ricarica l'elemento per ottenere le dimensioni aggiornate
                        targetElement = getHighlightElement(highlightValue);
                        if (targetElement) {
                            highlightElement(targetElement);
                        }
                    }, 150);
                }
                
                // Aggiorna l'interfaccia per lo step corrente
                function updateUI() {
                    // Nascondi tutti gli step e mostra quello corrente
                    tutorialSteps.forEach((step, index) => {
                        step.classList.remove('active');
                        if (index === currentStep) {
                            step.classList.add('active');
                        }
                    });
                    
                    // Aggiorna i pulsanti di navigazione
                    if (tutorialPrev) {
                        tutorialPrev.disabled = currentStep === 0;
                    }
                    if (tutorialNext) {
                        if (currentStep === totalSteps - 1) {
                            tutorialNext.innerHTML = 'Chiudi <span>✓</span>';
                        } else {
                            tutorialNext.innerHTML = 'Avanti <span>→</span>';
                        }
                    }
                    
                    // Aggiorna la barra di progresso
                    if (tutorialProgressFill) {
                        const progress = ((currentStep + 1) / totalSteps) * 100;
                        tutorialProgressFill.style.width = progress + '%';
                    }
                    if (tutorialProgressText) {
                        tutorialProgressText.textContent = `${currentStep + 1} / ${totalSteps}`;
                    }
                    
                    // Aggiorna i dots
                    const dots = tutorialDotsContainer?.querySelectorAll('.tutorial-dot');
                    dots?.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentStep);
                    });
                    
                    // Cambia modalità in base allo step
                    if (tutorialOverlay.classList.contains('active')) {
                        const newModalita = getModalitaForStep(currentStep);
                        setModalitaSilently(newModalita);
                    }
                    
                    // Chiudi la sezione modalità quando si arriva alle schede 8 e 9
                    if (tutorialOverlay.classList.contains('active') && (currentStep === 8 || currentStep === 9)) {
                        const panelModalita = document.getElementById('panelModalita');
                        if (panelModalita) {
                            const content = panelModalita.querySelector('.panel-section-content');
                            const header = panelModalita.querySelector('.panel-section-header');
                            if (content && content.classList.contains('expanded')) {
                                content.classList.remove('expanded');
                                if (header) {
                                    header.setAttribute('aria-expanded', 'false');
                                }
                            }
                        }
                    }
                    
                    // Aggiorna il layout della guida (sidebar vs overlay)
                    updateDesktopTutorialSidebar();
                    
                    // Gestisci la visibilità della freccia tra i campi
                    updateCourtsArrowVisibility();
                    
                    // Aggiorna le etichette TU / AVVERSARIO nel campo
                    updateTutorialFieldLabels();
                    
                    // Aggiorna l'evidenziazione
                    updateHighlight();
                }
                
                function updateTutorialFieldLabels() {
                    const labelTu = document.getElementById('tutorialFieldLabelTu');
                    const labelAvversario = document.getElementById('tutorialFieldLabelAvversario');
                    const show = tutorialOverlay.classList.contains('active') && (currentStep === 1 || currentStep === 8);
                    if (labelTu) labelTu.style.display = show ? '' : 'none';
                    if (labelAvversario) labelAvversario.style.display = show ? '' : 'none';
                }
                
                // Vai a uno step specifico
                function goToStep(stepIndex) {
                    if (stepIndex >= 0 && stepIndex < totalSteps) {
                        currentStep = stepIndex;
                        updateUI();
                    }
                }
                
                // Variabili per tracciare la posizione originale dell'overlay
                let tutorialOverlayOriginalParent = null;
                let tutorialOverlayOriginalNextSibling = null;
                
                // Variabili per salvare lo stato delle opzioni di visualizzazione
                let savedViewState = null;
                
                // Funzione per determinare la modalità in base allo step
                function getModalitaForStep(step) {
                    if (step >= 0 && step <= 5) {
                        // Pagine 1-6: modalità 1 colpo
                        return '1colpo';
                    } else if (step === 6) {
                        // Pagina 7: modalità 2 colpi
                        return '2colpi';
                    } else if (step === 7) {
                        // Pagina 8: modalità dinamico
                        return 'dinamico';
                    } else {
                        // Pagine 9-13: modalità 1 colpo
                        return '1colpo';
                    }
                }
                
                // Funzione per determinare se la guida deve essere sidebar o sostituire il campo principale
                function shouldShowSidebar(step) {
                    // Pagine in overlay: 1 (step 0), 12 (step 11), 13 (step 12), 14 (step 13)
                    if (step === 0 || step === 11 || step === 12 || step === 13) {
                        return false; // Overlay per queste pagine
                    }
                    // Sidebar per step 1-5, 6-7 (sopra la sidebar), e 8-10
                    return (step >= 1 && step <= 10);
                }
                
                // Funzione per determinare se la guida deve sostituire il campo principale
                function shouldReplacePrimaryCourt(step) {
                    // Non sostituisce più il campo principale per step 7-8
                    return false;
                }
                
                // Funzione per determinare se la guida deve essere sopra la sidebar (step 6-7)
                function shouldShowOverSidebar(step) {
                    return step === 6 || step === 7;
                }
                
                // Funzione per cambiare modalità programmaticamente (senza triggerare eventi)
                function setModalitaSilently(newModalita) {
                    const modalitaInputs = document.querySelectorAll('input[name="modalita"]');
                    if (modalitaInputs && modalitaInputs.length) {
                        modalitaInputs.forEach((inp) => {
                            if (inp.value === newModalita) {
                                inp.checked = true;
                            }
                        });
                    }
                    window.__modalita__ = newModalita;
                    
                    // Handle different modes
                    const secondaryCourt = document.querySelector('.court-container.secondary-court');
                    if (secondaryCourt) {
                        if (newModalita === '1colpo') {
                            secondaryCourt.style.display = 'none';
                        } else if (newModalita === '2colpi' || newModalita === 'dinamico') {
                            secondaryCourt.style.display = 'flex';
                        }
                    }
                    
                    // Update the display
                    if (typeof updateDinamicoPanel === 'function') {
                        updateDinamicoPanel();
                    }
                    if (typeof updateSecondaryCourtLock === 'function') {
                        updateSecondaryCourtLock();
                    }
                    
                    // Update mode indicator
                    if (typeof updateModeIndicator === 'function') {
                        updateModeIndicator(newModalita);
                    }
                    
                    // Update mobile panels
                    if (typeof updateMobilePanels === 'function') {
                        updateMobilePanels();
                    }
                    
                    // Sync mobile dinamico panel
                    if (typeof syncMobileDinamicoPanel === 'function') {
                        syncMobileDinamicoPanel(true);
                    }
                    
                    // Update colpitore drag state
                    if (typeof updateColpitoreDragState === 'function') {
                        updateColpitoreDragState();
                    }
                    
                    // Update visualization
                    const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                    const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                    if (typeof updateLinesAndWedge === 'function') {
                        updateLinesAndWedge(dotX, dotY);
                    }
                    if (typeof updateIntersectionDot === 'function') {
                        updateIntersectionDot();
                    }
                }
                
                // Funzione per abilitare/disabilitare i radio button della modalità
                function setModalitaInputsEnabled(enabled) {
                    const modalitaInputs = document.querySelectorAll('input[name="modalita"]');
                    if (modalitaInputs && modalitaInputs.length) {
                        modalitaInputs.forEach((inp) => {
                            inp.disabled = !enabled;
                        });
                    }
                }
                
                // Salva lo stato corrente delle opzioni di visualizzazione
                function saveViewState() {
                    return {
                        viewDirections: window.__viewDirections__,
                        viewPlayer: window.__viewPlayer__,
                        viewShot: window.__viewShot__,
                        viewResponder: window.__viewResponder__,
                        viewCenter: window.__viewCenter__,
                        viewCover: window.__viewCover__,
                        viewZones: window.__viewZones__,
                        viewCoordinates: window.__viewCoordinates__
                    };
                }
                
                // Ripristina lo stato salvato delle opzioni di visualizzazione
                function restoreViewState() {
                    if (!savedViewState) return;
                    
                    window.__viewDirections__ = savedViewState.viewDirections;
                    window.__viewPlayer__ = savedViewState.viewPlayer;
                    window.__viewShot__ = savedViewState.viewShot;
                    window.__viewResponder__ = savedViewState.viewResponder;
                    window.__viewCenter__ = savedViewState.viewCenter;
                    window.__viewCover__ = savedViewState.viewCover;
                    window.__viewZones__ = savedViewState.viewZones;
                    window.__viewCoordinates__ = savedViewState.viewCoordinates;
                    
                    // Aggiorna i checkbox
                    if (chkDirections) chkDirections.checked = window.__viewDirections__;
                    if (chkPlayer) chkPlayer.checked = window.__viewPlayer__;
                    if (chkShot) chkShot.checked = window.__viewShot__;
                    if (chkResponder) chkResponder.checked = window.__viewResponder__;
                    if (chkCenter) chkCenter.checked = window.__viewCenter__;
                    if (chkCover) chkCover.checked = window.__viewCover__;
                    if (chkZones) chkZones.checked = window.__viewZones__;
                    if (chkCoordinates) chkCoordinates.checked = window.__viewCoordinates__;
                    
                    // Applica i cambiamenti
                    if (typeof applyViewToggles === 'function') {
                        applyViewToggles();
                    }
                    
                    savedViewState = null;
                }
                
                // Imposta tutte le opzioni di visualizzazione tranne le coordinate
                function setTutorialViewState() {
                    window.__viewDirections__ = true;
                    window.__viewPlayer__ = true;
                    window.__viewShot__ = true;
                    window.__viewResponder__ = true;
                    window.__viewCenter__ = true;
                    window.__viewCover__ = false;
                    window.__viewZones__ = false; // Zone disabilitate nel tutorial
                    window.__viewCoordinates__ = false; // Coordinate disabilitate
                    
                    // Aggiorna i checkbox
                    if (chkDirections) chkDirections.checked = true;
                    if (chkPlayer) chkPlayer.checked = true;
                    if (chkShot) chkShot.checked = true;
                    if (chkResponder) chkResponder.checked = true;
                    if (chkCenter) chkCenter.checked = true;
                    if (chkCover) chkCover.checked = false;
                    if (chkZones) chkZones.checked = false;
                    if (chkCoordinates) chkCoordinates.checked = false;
                    
                    // Applica i cambiamenti
                    if (typeof applyViewToggles === 'function') {
                        applyViewToggles();
                    }
                }
                
                // Funzione per aggiornare la visibilità della freccia tra i campi
                function updateCourtsArrowVisibility() {
                    const courtsArrow = document.getElementById('courtsArrow');
                    if (!courtsArrow) return;
                    
                    const isTutorialOpen = tutorialOverlay && tutorialOverlay.classList.contains('active');
                    const isDesktop = window.innerWidth > 900;
                    
                    // Se la guida è aperta su desktop
                    if (isTutorialOpen && isDesktop) {
                        // Mostra la freccia solo se siamo nello step 7 (Modalità 2 Colpi)
                        if (currentStep === 6) {
                            // Aggiungi classe CSS per mostrare la freccia nello step 6
                            document.body.classList.add('tutorial-step-7');
                        } else {
                            // Rimuovi la classe per nascondere la freccia
                            document.body.classList.remove('tutorial-step-7');
                        }
                    } else {
                        // Rimuovi la classe quando il tutorial è chiuso
                        document.body.classList.remove('tutorial-step-7');
                    }
                }
                
                // Funzione helper per aggiornare la classe desktop-tutorial-sidebar
                function updateDesktopTutorialSidebar() {
                    if (!tutorialOverlay) return;
                    
                    const isDesktop = window.innerWidth > 900; // Desktop = maggiore di breakpoint mobile
                    const isTutorialOpen = tutorialOverlay.classList.contains('active');
                    const pageContainer = document.querySelector('.page-container');
                    const primaryCourt = document.querySelector('.court-container.primary-court');
                    
                    // Determina se mostrare sidebar o sostituire il campo principale in base allo step
                    const showSidebar = shouldShowSidebar(currentStep);
                    const replacePrimaryCourt = shouldReplacePrimaryCourt(currentStep);
                    const showOverSidebar = shouldShowOverSidebar(currentStep);
                    
                    // Su desktop, mostra sidebar o sostituisce campo principale in base allo step
                    if (isDesktop && isTutorialOpen && pageContainer) {
                        if (showSidebar) {
                            if (showOverSidebar) {
                                // Modalità sopra la sidebar: step 7-8, posiziona sopra la sidebar
                                document.body.classList.add('desktop-tutorial-sidebar', 'desktop-tutorial-over-sidebar');
                                document.body.classList.remove('desktop-tutorial-replace-primary');
                                document.body.style.overflow = ''; // Non bloccare lo scroll su desktop
                                
                                // Mostra il campo principale
                                if (primaryCourt) {
                                    primaryCourt.style.display = '';
                                }
                                
                                // Salva la posizione originale se non l'abbiamo già fatto
                                if (!tutorialOverlayOriginalParent) {
                                    tutorialOverlayOriginalParent = tutorialOverlay.parentNode;
                                    tutorialOverlayOriginalNextSibling = tutorialOverlay.nextSibling;
                                }
                                
                                // Sposta l'overlay dentro il page-container (per posizionamento assoluto sopra la sidebar)
                                if (tutorialOverlay.parentNode !== pageContainer) {
                                    pageContainer.appendChild(tutorialOverlay);
                                }
                            } else {
                                // Modalità sidebar normale: sposta l'overlay dentro il page-container (colonna 3)
                                document.body.classList.add('desktop-tutorial-sidebar');
                                document.body.classList.remove('desktop-tutorial-replace-primary', 'desktop-tutorial-over-sidebar');
                                document.body.style.overflow = ''; // Non bloccare lo scroll su desktop
                                
                                // Mostra il campo principale
                                if (primaryCourt) {
                                    primaryCourt.style.display = '';
                                }
                                
                                // Salva la posizione originale se non l'abbiamo già fatto
                                if (!tutorialOverlayOriginalParent) {
                                    tutorialOverlayOriginalParent = tutorialOverlay.parentNode;
                                    tutorialOverlayOriginalNextSibling = tutorialOverlay.nextSibling;
                                }
                                
                                // Sposta l'overlay dentro il page-container (come terza colonna)
                                if (tutorialOverlay.parentNode !== pageContainer) {
                                    pageContainer.appendChild(tutorialOverlay);
                                }
                            }
                        } else if (replacePrimaryCourt) {
                            // Modalità sostituisce campo principale: sposta l'overlay nella colonna del campo principale
                            document.body.classList.remove('desktop-tutorial-sidebar');
                            document.body.classList.add('desktop-tutorial-replace-primary');
                            document.body.style.overflow = ''; // Non bloccare lo scroll su desktop
                            
                            // Nascondi il campo principale
                            if (primaryCourt) {
                                primaryCourt.style.display = 'none';
                            }
                            
                            // Salva la posizione originale se non l'abbiamo già fatto
                            if (!tutorialOverlayOriginalParent) {
                                tutorialOverlayOriginalParent = tutorialOverlay.parentNode;
                                tutorialOverlayOriginalNextSibling = tutorialOverlay.nextSibling;
                            }
                            
                            // Sposta l'overlay dentro il page-container (nella colonna del campo principale)
                            if (tutorialOverlay.parentNode !== pageContainer) {
                                // Inserisci prima del campo secondario (se esiste) o alla fine
                                const secondaryCourt = document.querySelector('.court-container.secondary-court');
                                if (secondaryCourt && secondaryCourt.parentNode === pageContainer) {
                                    pageContainer.insertBefore(tutorialOverlay, secondaryCourt);
                                } else {
                                    pageContainer.appendChild(tutorialOverlay);
                                }
                            } else {
                                // Se è già dentro pageContainer, riposizionalo
                                const secondaryCourt = document.querySelector('.court-container.secondary-court');
                                if (secondaryCourt && secondaryCourt.parentNode === pageContainer) {
                                    pageContainer.insertBefore(tutorialOverlay, secondaryCourt);
                                }
                            }
                        } else {
                            // Modalità overlay: per pagine 1, 13, 14, 15
                            document.body.classList.remove('desktop-tutorial-sidebar', 'desktop-tutorial-replace-primary', 'desktop-tutorial-over-sidebar');
                            document.body.style.overflow = 'hidden';
                            
                            // Mostra il campo principale
                            if (primaryCourt) {
                                primaryCourt.style.display = '';
                            }
                            
                            // Ripristina la posizione originale se era stata cambiata
                            if (tutorialOverlayOriginalParent && tutorialOverlay.parentNode !== tutorialOverlayOriginalParent) {
                                if (tutorialOverlayOriginalNextSibling) {
                                    tutorialOverlayOriginalParent.insertBefore(tutorialOverlay, tutorialOverlayOriginalNextSibling);
                                } else {
                                    tutorialOverlayOriginalParent.appendChild(tutorialOverlay);
                                }
                            }
                        }
                    } else {
                        // Modalità normale: ripristina la posizione originale
                        document.body.classList.remove('desktop-tutorial-sidebar', 'desktop-tutorial-replace-primary', 'desktop-tutorial-over-sidebar');
                        
                        // Mostra il campo principale
                        if (primaryCourt) {
                            primaryCourt.style.display = '';
                        }
                        
                        if (isTutorialOpen && !isDesktop) {
                            document.body.style.overflow = 'hidden'; // Blocca scroll solo su mobile
                        }
                        
                        // Ripristina la posizione originale se era stata cambiata
                        if (tutorialOverlayOriginalParent && tutorialOverlay.parentNode !== tutorialOverlayOriginalParent) {
                            if (tutorialOverlayOriginalNextSibling) {
                                tutorialOverlayOriginalParent.insertBefore(tutorialOverlay, tutorialOverlayOriginalNextSibling);
                            } else {
                                tutorialOverlayOriginalParent.appendChild(tutorialOverlay);
                            }
                            // Reset delle variabili dopo il ripristino
                            tutorialOverlayOriginalParent = null;
                            tutorialOverlayOriginalNextSibling = null;
                        }
                    }
                    
                    // Aggiorna l'evidenziazione dopo il cambio modalità
                    if (isTutorialOpen) {
                        setTimeout(() => {
                            updateHighlight();
                        }, 100);
                    }
                }
                
                // Esponi la funzione globalmente per poterla chiamare da altri punti del codice
                window.updateDesktopTutorialSidebar = updateDesktopTutorialSidebar;
                
                // Apri il tutorial (esposta globalmente per il pallino mobile)
                window.openTutorial = function() {
                    // Salva lo stato corrente delle opzioni di visualizzazione PRIMA di aprire la guida
                    savedViewState = saveViewState();
                    
                    // Salva la modalità corrente
                    savedModalita = window.__modalita__;
                    
                    // Disabilita i radio button della modalità
                    setModalitaInputsEnabled(false);
                    
                    currentStep = 0;
                    tutorialOverlay.classList.add('active', 'fade-in');
                    tutorialOverlay.classList.remove('fade-out');
                    
                    // Imposta tutte le opzioni tranne le coordinate
                    setTutorialViewState();
                    
                    // Aggiorna l'UI (include cambio modalità, layout e evidenziazione)
                    updateUI();
                    
                    // Salva che l'utente ha già visto il tutorial
                    try {
                        localStorage.setItem('geometryOfTennis_tutorialSeen', 'true');
                    } catch (e) {
                        // localStorage non disponibile
                    }
                };
                
                // Chiudi il tutorial
                function closeTutorial() {
                    tutorialOverlay.classList.add('fade-out');
                    tutorialOverlay.classList.remove('fade-in');
                    
                    // Nascondi le etichette del campo
                    updateTutorialFieldLabels();
                    
                    // Rimuovi l'evidenziazione
                    removeHighlight();
                    
                    // Ripristina lo stato delle opzioni di visualizzazione
                    restoreViewState();
                    
                    // Ripristina la modalità originale
                    if (savedModalita) {
                        setModalitaSilently(savedModalita);
                        savedModalita = null;
                    }
                    
                    // Riabilita i radio button della modalità
                    setModalitaInputsEnabled(true);
                    
                    // Rimuovi le classi e ripristina la posizione originale
                    document.body.classList.remove('desktop-tutorial-sidebar', 'desktop-tutorial-replace-primary', 'desktop-tutorial-over-sidebar', 'tutorial-step-7');
                    
                    // Ripristina la visibilità della freccia tra i campi (non più necessario con il nuovo sistema basato su classi CSS)
                    // const courtsArrow = document.getElementById('courtsArrow');
                    // if (courtsArrow) {
                    //     courtsArrow.style.display = '';
                    // }
                    
                    // Mostra il campo principale
                    const primaryCourt = document.querySelector('.court-container.primary-court');
                    if (primaryCourt) {
                        primaryCourt.style.display = '';
                    }
                    
                    // Ripristina la posizione originale se era stata cambiata
                    if (tutorialOverlayOriginalParent && tutorialOverlay.parentNode !== tutorialOverlayOriginalParent) {
                        if (tutorialOverlayOriginalNextSibling) {
                            tutorialOverlayOriginalParent.insertBefore(tutorialOverlay, tutorialOverlayOriginalNextSibling);
                        } else {
                            tutorialOverlayOriginalParent.appendChild(tutorialOverlay);
                        }
                    }
                    
                    // Reset delle variabili per la prossima apertura
                    tutorialOverlayOriginalParent = null;
                    tutorialOverlayOriginalNextSibling = null;
                    
                    setTimeout(() => {
                        tutorialOverlay.classList.remove('active', 'fade-out');
                        document.body.style.overflow = '';
                    }, 300);
                }
                
                // Step successivo
                function nextStep() {
                    if (currentStep < totalSteps - 1) {
                        currentStep++;
                        updateUI();
                    } else {
                        closeTutorial();
                    }
                }
                
                // Step precedente
                function prevStep() {
                    if (currentStep > 0) {
                        currentStep--;
                        updateUI();
                    }
                }
                
                // Event listeners
                
                if (tutorialClose) {
                    tutorialClose.addEventListener('click', closeTutorial);
                }
                
                if (tutorialPrev) {
                    tutorialPrev.addEventListener('click', prevStep);
                }
                
                if (tutorialNext) {
                    tutorialNext.addEventListener('click', nextStep);
                }
                
                // Chiudi con ESC
                document.addEventListener('keydown', (e) => {
                    if (!tutorialOverlay.classList.contains('active')) return;
                    
                    if (e.key === 'Escape') {
                        closeTutorial();
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        nextStep();
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        prevStep();
                    }
                });
                
                // Chiudi cliccando fuori dal modal (solo se non siamo in modalità sidebar o replace-primary desktop)
                tutorialOverlay.addEventListener('click', (e) => {
                    if (e.target === tutorialOverlay) {
                        // Non chiudere se siamo in modalità sidebar o replace-primary desktop
                        const isDesktop = window.innerWidth > 900;
                        const showSidebar = shouldShowSidebar(currentStep);
                        const replacePrimaryCourt = shouldReplacePrimaryCourt(currentStep);
                        if (isDesktop && (showSidebar || replacePrimaryCourt)) {
                            return; // Non chiudere in modalità sidebar o replace-primary
                        }
                        closeTutorial();
                    }
                });
                
                // Listener per il resize della finestra
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        updateDesktopTutorialSidebar();
                    }, 250); // Debounce per performance
                });
                
                // Inizializza
                createDots();
                updateUI();
                
                // Mostra automaticamente il tutorial alla prima visita
                try {
                    const tutorialSeen = localStorage.getItem('geometryOfTennis_tutorialSeen');
                    if (!tutorialSeen) {
                        // Aspetta un momento per permettere all'app di caricarsi
                        setTimeout(() => {
                            openTutorial();
                        }, 800);
                    }
                } catch (e) {
                    // localStorage non disponibile, non mostrare automaticamente
                }
            })();

        })();

        // ==========================================
        // TOP BAR FUNCTIONALITY (Desktop Only)
        // ==========================================
        (function() {
            const topBarGioco = document.getElementById('topBarGioco');
            const topBarModalita = document.getElementById('topBarModalita');
            const topBarGuida = document.getElementById('topBarGuida');
            const topBarImpostazioni = document.getElementById('topBarImpostazioni');
            const topBarDownload = document.getElementById('topBarDownload');
            
            const giocoOverlay = document.getElementById('topBarGiocoOverlay');
            const modalitaOverlay = document.getElementById('topBarModalitaOverlay');
            const impostazioniOverlay = document.getElementById('topBarImpostazioniOverlay');
            const downloadOverlay = document.getElementById('topBarDownloadOverlay');
            
            // Function to close all modals
            function closeAllModals() {
                [giocoOverlay, modalitaOverlay, impostazioniOverlay, downloadOverlay].forEach(overlay => {
                    if (overlay) {
                        overlay.classList.remove('active');
                    }
                });
                
                // Remove active class from all top bar items
                document.querySelectorAll('.top-bar-item').forEach(item => {
                    item.classList.remove('active');
                });
            }
            
            // Function to open a modal
            function openModal(overlay, button) {
                closeAllModals();
                if (overlay) {
                    overlay.classList.add('active');
                }
                if (button) {
                    button.classList.add('active');
                }
            }
            
            // Gioco button
            if (topBarGioco && giocoOverlay) {
                topBarGioco.addEventListener('click', () => {
                    if (giocoOverlay.classList.contains('active')) {
                        closeAllModals();
                    } else {
                        const currentGioco = window.__gioco__ || 'singolare';
                        const topRadio = document.querySelector(`input[name="gioco_top"][value="${currentGioco}"]`);
                        if (topRadio) {
                            topRadio.checked = true;
                        }
                        openModal(giocoOverlay, topBarGioco);
                    }
                });
            }
            
            // Modalità button
            if (topBarModalita && modalitaOverlay) {
                topBarModalita.addEventListener('click', () => {
                    if (modalitaOverlay.classList.contains('active')) {
                        closeAllModals();
                    } else {
                        // Sincronizza i radio button della topbar con la modalità corrente
                        const currentModalita = window.__modalita__ || '2colpi';
                        const topRadio = document.querySelector(`input[name="modalita_top"][value="${currentModalita}"]`);
                        if (topRadio) {
                            topRadio.checked = true;
                        }
                        openModal(modalitaOverlay, topBarModalita);
                    }
                });
            }
            
            // Guida button - opens tutorial
            if (topBarGuida) {
                topBarGuida.addEventListener('click', () => {
                    closeAllModals();
                    // Trigger the tutorial
                    const desktopGuidaButton = document.getElementById('desktopGuidaButton');
                    if (desktopGuidaButton) {
                        desktopGuidaButton.click();
                    }
                });
            }
            
            // Impostazioni button
            if (topBarImpostazioni && impostazioniOverlay) {
                topBarImpostazioni.addEventListener('click', () => {
                    if (impostazioniOverlay.classList.contains('active')) {
                        closeAllModals();
                    } else {
                        openModal(impostazioniOverlay, topBarImpostazioni);
                    }
                });
            }
            
            // Download button
            if (topBarDownload && downloadOverlay) {
                topBarDownload.addEventListener('click', () => {
                    if (downloadOverlay.classList.contains('active')) {
                        closeAllModals();
                    } else {
                        openModal(downloadOverlay, topBarDownload);
                        // Trigger download options update
                        updateDownloadOptionsTop();
                    }
                });
            }
            
            // Close buttons
            document.querySelectorAll('.top-bar-modal-close').forEach(closeBtn => {
                closeBtn.addEventListener('click', closeAllModals);
            });
            
            // Close on overlay click
            [giocoOverlay, modalitaOverlay, impostazioniOverlay, downloadOverlay].forEach(overlay => {
                if (overlay) {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            closeAllModals();
                        }
                    });
                }
            });
            
            // Close on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeAllModals();
                }
            });
            
            // Gioco icon update helper
            function updateGiocoIcon(value) {
                const icon = document.getElementById('topBarGiocoIcon');
                if (icon) {
                    icon.textContent = value === 'doppio' ? 'D' : 'S';
                }
            }

            // Sync gioco changes between top bar and drawer
            const giocoRadiosTop = document.querySelectorAll('input[name="gioco_top"]');
            const giocoRadiosDrawer = document.querySelectorAll('input[name="gioco_drawer"]');

            giocoRadiosTop.forEach(radio => {
                radio.addEventListener('change', () => {
                    window.__gioco__ = radio.value;
                    updateGiocoIcon(radio.value);
                    giocoRadiosDrawer.forEach(dr => {
                        if (dr.value === radio.value) dr.checked = true;
                    });
                    window.dispatchEvent(new Event('giocoChanged'));
                    closeAllModals();
                });
            });

            giocoRadiosDrawer.forEach(radio => {
                radio.addEventListener('change', () => {
                    window.__gioco__ = radio.value;
                    updateGiocoIcon(radio.value);
                    giocoRadiosTop.forEach(tr => {
                        if (tr.value === radio.value) tr.checked = true;
                    });
                    window.dispatchEvent(new Event('giocoChanged'));
                });
            });
            
            // Sync modalità changes between top bar and sidebar
            const modalitaRadiosTop = document.querySelectorAll('input[name="modalita_top"]');
            const modalitaRadiosSidebar = document.querySelectorAll('input[name="modalita"]');
            
            modalitaRadiosTop.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Sync to sidebar
                    const correspondingSidebar = document.querySelector(`input[name="modalita"][value="${radio.value}"]`);
                    if (correspondingSidebar) {
                        correspondingSidebar.checked = true;
                        correspondingSidebar.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    closeAllModals();
                });
            });
            
            // Sync superficie changes
            const superficieRadiosTop = document.querySelectorAll('input[name="campoType_top"]');
            const superficieRadiosSidebar = document.querySelectorAll('input[name="campoType"]');
            
            superficieRadiosTop.forEach(radio => {
                radio.addEventListener('change', () => {
                    const correspondingSidebar = document.querySelector(`input[name="campoType"][value="${radio.value}"]`);
                    if (correspondingSidebar) {
                        correspondingSidebar.checked = true;
                        correspondingSidebar.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
            
            // Sync default settings
            const defaultSelects = ['default_colpitore', 'default_modalita', 'default_tipologia', 'default_campoType'];
            defaultSelects.forEach(selectName => {
                const topSelect = document.getElementById(`${selectName}_top`);
                const sidebarSelect = document.getElementById(selectName);
                
                if (topSelect && sidebarSelect) {
                    topSelect.addEventListener('change', () => {
                        sidebarSelect.value = topSelect.value;
                        sidebarSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    
                    sidebarSelect.addEventListener('change', () => {
                        topSelect.value = sidebarSelect.value;
                    });
                }
            });
            
            // Sync default checkboxes
            const defaultCheckboxes = ['default_view_player', 'default_view_responder', 'default_view_directions', 
                                      'default_view_shot', 'default_view_center', 'default_view_cover', 
                                      'default_view_zones', 'default_view_coordinates'];
            defaultCheckboxes.forEach(checkboxName => {
                const topCheckbox = document.getElementById(`${checkboxName}_top`);
                const sidebarCheckbox = document.getElementById(checkboxName);
                
                if (topCheckbox && sidebarCheckbox) {
                    topCheckbox.addEventListener('change', () => {
                        sidebarCheckbox.checked = topCheckbox.checked;
                        sidebarCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    
                    sidebarCheckbox.addEventListener('change', () => {
                        topCheckbox.checked = sidebarCheckbox.checked;
                    });
                }
            });
            
            // Download functionality for top bar
            function updateDownloadOptionsTop() {
                const downloadOptionsTop = document.getElementById('downloadOptionsTop');
                const downloadOptions2ColpiTop = document.getElementById('downloadOptions2ColpiTop');
                const downloadOptionsDinamicoTop = document.getElementById('downloadOptionsDinamicoTop');
                const downloadButtonTop = document.getElementById('downloadCourtImageTop');
                const singleCourtOptionsTop = document.getElementById('singleCourtOptionsTop');
                
                if (!downloadOptionsTop) return;
                
                // Get current mode
                const currentMode = document.querySelector('input[name="modalita"]:checked')?.value || '2colpi';
                
                // Show/hide options based on mode
                if (currentMode === '2colpi') {
                    downloadOptionsTop.style.display = 'block';
                    downloadOptions2ColpiTop.style.display = 'block';
                    downloadOptionsDinamicoTop.style.display = 'none';
                    downloadButtonTop.style.display = 'flex';
                } else if (currentMode === 'dinamico') {
                    downloadOptionsTop.style.display = 'block';
                    downloadOptions2ColpiTop.style.display = 'none';
                    downloadOptionsDinamicoTop.style.display = 'block';
                    downloadButtonTop.style.display = 'flex';
                } else {
                    downloadOptionsTop.style.display = 'none';
                    downloadButtonTop.style.display = 'flex';
                }
                
                // Handle single court options visibility
                // Usa una funzione helper per aggiornare la visibilità
                const updateSingleCourtOptionsTopVisibility = () => {
                    const selectedType = document.querySelector('input[name="downloadType_top"]:checked');
                    if (singleCourtOptionsTop && currentMode === '2colpi') {
                        if (selectedType && selectedType.value === 'single') {
                            singleCourtOptionsTop.style.display = 'block';
                        } else {
                            singleCourtOptionsTop.style.display = 'none';
                        }
                    }
                };
                
                const downloadSingleTop = document.getElementById('download_single_top');
                const downloadBothTop = document.getElementById('download_both_top');
                
                // Rimuovi eventuali listener precedenti usando un flag
                if (downloadSingleTop && !downloadSingleTop.dataset.listenerAdded) {
                    downloadSingleTop.addEventListener('change', () => {
                        updateSingleCourtOptionsTopVisibility();
                    });
                    downloadSingleTop.dataset.listenerAdded = 'true';
                }
                
                if (downloadBothTop && !downloadBothTop.dataset.listenerAdded) {
                    downloadBothTop.addEventListener('change', () => {
                        updateSingleCourtOptionsTopVisibility();
                    });
                    downloadBothTop.dataset.listenerAdded = 'true';
                }
                
                // Aggiorna la visibilità iniziale
                updateSingleCourtOptionsTopVisibility();
            }
            
            // Download button click handler
            const downloadButtonTop = document.getElementById('downloadCourtImageTop');
            if (downloadButtonTop) {
                downloadButtonTop.addEventListener('click', () => {
                    // Trigger the main download button
                    const mainDownloadButton = document.getElementById('downloadCourtImage');
                    if (mainDownloadButton) {
                        // Sync download options first
                        const currentMode = document.querySelector('input[name="modalita"]:checked')?.value || '2colpi';
                        
                        if (currentMode === '2colpi') {
                            const downloadTypeTop = document.querySelector('input[name="downloadType_top"]:checked')?.value;
                            if (downloadTypeTop) {
                                const correspondingMain = document.querySelector(`input[name="downloadType"][value="${downloadTypeTop}"]`);
                                if (correspondingMain) {
                                    correspondingMain.checked = true;
                                    correspondingMain.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                            
                            const downloadCourtTop = document.querySelector('input[name="downloadCourt_top"]:checked')?.value;
                            if (downloadCourtTop) {
                                const correspondingMain = document.querySelector(`input[name="downloadCourt"][value="${downloadCourtTop}"]`);
                                if (correspondingMain) {
                                    correspondingMain.checked = true;
                                }
                            }
                        } else if (currentMode === 'dinamico') {
                            const shotNumberTop = document.getElementById('download_shot_number_top');
                            const shotNumberMain = document.getElementById('download_shot_number');
                            if (shotNumberTop && shotNumberMain) {
                                shotNumberMain.value = shotNumberTop.value;
                            }
                        }
                        
                        mainDownloadButton.click();
                    }
                    closeAllModals();
                });
            }
        })();

        // ==========================================
        // DRAW CONTROLS HOVER FUNCTIONALITY
        // ==========================================
        (function() {
            const drawControlsHover = document.getElementById('draw_controls_hover');
            const drawFontSizeHover = document.getElementById('draw_font_size_hover');
            const drawSection = document.getElementById('draw-section');
            
            if (!drawSection || !drawControlsHover) return;
            
            // Tools that need color and width controls
            const toolsWithControls = ['pen', 'arrow', 'line', 'ruler'];
            // Tools that need font size controls
            const toolsWithFontSize = ['text'];
            // Tools that don't need controls
            const toolsWithoutControls = ['eraser', 'clear'];
            
            // Get all draw tool buttons
            const drawToolButtons = drawSection.querySelectorAll('.draw-tool-button[data-tool]');
            
            let hoverTimeout;
            
            function showControls(tool) {
                // Clear any existing timeout
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                
                // Hide all controls first
                drawControlsHover.classList.remove('show');
                if (drawFontSizeHover) {
                    drawFontSizeHover.classList.remove('show');
                }
                
                // Show appropriate controls based on tool
                if (toolsWithControls.includes(tool)) {
                    // Show color and width controls
                    drawControlsHover.classList.add('show');
                    if (drawFontSizeHover) {
                        drawFontSizeHover.classList.remove('show');
                    }
                } else if (toolsWithFontSize.includes(tool)) {
                    // Show color, width, and font size controls for text
                    drawControlsHover.classList.add('show');
                    if (drawFontSizeHover) {
                        drawFontSizeHover.classList.add('show');
                    }
                }
            }
            
            function hideControls() {
                hoverTimeout = setTimeout(() => {
                    drawControlsHover.classList.remove('show');
                    if (drawFontSizeHover) {
                        drawFontSizeHover.classList.remove('show');
                    }
                }, 200); // Small delay to allow moving between button and controls
            }
            
            // Add hover listeners to each tool button
            drawToolButtons.forEach(button => {
                const tool = button.getAttribute('data-tool');
                
                if (tool && !toolsWithoutControls.includes(tool)) {
                    button.addEventListener('mouseenter', () => {
                        showControls(tool);
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        hideControls();
                    });
                }
            });
            
            // Keep controls visible when hovering over them
            if (drawControlsHover) {
                drawControlsHover.addEventListener('mouseenter', () => {
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = null;
                    }
                });
                
                drawControlsHover.addEventListener('mouseleave', () => {
                    hideControls();
                });
            }
            
            if (drawFontSizeHover) {
                drawFontSizeHover.addEventListener('mouseenter', () => {
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = null;
                    }
                });
                
                drawFontSizeHover.addEventListener('mouseleave', () => {
                    hideControls();
                });
            }
            
            // Hide controls when clicking on clear or eraser (they don't need controls)
            const clearButton = document.getElementById('draw_clear_btn');
            const eraserButton = document.getElementById('draw_eraser_btn');
            
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    hideControls();
                });
            }
            
            if (eraserButton) {
                eraserButton.addEventListener('click', () => {
                    hideControls();
                });
            }
        })();

