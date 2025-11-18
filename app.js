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
            const chkCenter = document.getElementById('view_center');
            const chkCoordinates = document.getElementById('view_coordinates');
            const tooltip = document.getElementById('coordinateTooltip');
            const fieldBCoords = document.getElementById('fieldB-coords');
            const fieldACoords = document.getElementById('fieldA-coords');
            const courtLockOverlay = document.getElementById('courtLockOverlay');
            const dinamicoPanel = document.getElementById('dinamicoPanel');
            const numeroColpoInput = document.getElementById('numeroColpo');
            const colpoButton = document.getElementById('colpoButton');
            const prevColpoButton = document.getElementById('prevColpoButton');
            const nextColpoButton = document.getElementById('nextColpoButton');
            const ultimoColpoCheckbox = document.getElementById('ultimoColpoCheckbox');
            const visualizzaScambioButton = document.getElementById('visualizzaScambioButton');
            const pauseResumeButton = document.getElementById('pauseResumeButton');
            const nuovoScambioButton = document.getElementById('nuovoScambioButton');
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
            window.__viewCenter__ = true;
            window.__viewCoordinates__ = false;
            window.__prevViewCover__ = false;
            window.__modalita__ = '2colpi';
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
                if (!tooltip || !fieldBCoords || !fieldACoords) return;
                
                // Check if coordinates should be shown
                if (!window.__viewCoordinates__) {
                    tooltip.style.display = 'none';
                    return;
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
                
                // Determine which field the cursor is in based on position relative to net
                const isAboveNet = y < NET_Y;
                
                if (isAboveNet) {
                    // Cursor is in Campo B (above net)
                    const fieldB = calculateFieldBCoordinates(x, y);
                    fieldBCoords.textContent = `X: ${Math.round(fieldB.x)}, Y: ${Math.round(fieldB.y)}`;
                    fieldACoords.textContent = `--`;
                } else {
                    // Cursor is in Campo A (below net)
                    const fieldA = calculateFieldACoordinates(x, y);
                    fieldBCoords.textContent = `--`;
                    fieldACoords.textContent = `X: ${Math.round(fieldA.x)}, Y: ${Math.round(fieldA.y)}`;
                }
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
                
                const coverVisible = window.__viewCover__ !== false;
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
                if (hMeasureLabel) hMeasureLabel.setAttribute('fill', color);
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

            function isColpitoreMovementLocked() {
                return window.__modalita__ === 'dinamico' && window.__numeroColpo__ >= 2;
            }

            function updateColpitoreDragState() {
                if (!dot) return;
                if (isColpitoreMovementLocked()) {
                    dot.style.cursor = 'not-allowed';
                } else if (draggingDot) {
                    dot.style.cursor = 'grabbing';
                } else {
                    dot.style.cursor = 'grab';
                }
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
                }
            }

            function updateMobilePanels() {
                if (!mobilePanelToggle) return;
                const shouldShow = isMobileViewport() && window.__modalita__ === '2colpi';
                mobilePanelToggle.classList.toggle('is-visible', shouldShow);
                if (!shouldShow) {
                    setMobileSecondaryVisible(false);
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

            function setMobileSettingsState(open) {
                if (!controlsSidebar) return;
                mobileSettingsOpen = open;
                controlsSidebar.classList.toggle('mobile-open', open);
                controlsSidebar.classList.toggle('mobile-collapsed', !open);
                if (settingsTitleTrigger) {
                    settingsTitleTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
                }
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
                
                // Il lucchetto viene gestito solo nella modalità 2 colpi
                if (window.__modalita__ !== '2colpi') {
                    courtLockOverlay.style.display = 'none';
                    courtLockOverlay.classList.remove('active');
                    return;
                }
                
                // Blocca il campo destro se uno dei 3 elementi critici è deselezionato (Colpitore, Colpo, Ricevitore)
                const allUnlocked = window.__viewPlayer__ && window.__viewShot__ && window.__viewResponder__;
                
                if (allUnlocked) {
                    // Tutti gli elementi sono presenti: nascondi completamente il lucchetto
                    courtLockOverlay.classList.remove('active');
                    courtLockOverlay.style.display = 'none';
                } else {
                    // Manca almeno un elemento: mostra il lucchetto attivo
                    courtLockOverlay.classList.add('active');
                    courtLockOverlay.style.display = 'flex';
                }
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
                if (isColpitoreMovementLocked()) {
                    evt.preventDefault();
                    updateColpitoreDragState();
                    return;
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
                }
            }

            function onDotPointerUp(evt) {
                draggingDot = false;
                svg.releasePointerCapture && svg.releasePointerCapture(evt.pointerId);
                updateColpitoreDragState();
            }

            function applyViewToggles() {
                if (leftLine) leftLine.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (rightLine) rightLine.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (wedge) wedge.style.display = (window.__viewDirections__ === false) ? 'none' : '';
                if (dot) dot.style.display = (window.__viewPlayer__ === false) ? 'none' : '';
                if (yellowLine) yellowLine.style.display = (window.__viewShot__ === false) ? 'none' : '';
                if (bisectorLine) bisectorLine.style.display = (window.__viewCenter__ === false) ? 'none' : '';
                if (hMeasure) hMeasure.style.display = (window.__viewCover__ === false) ? 'none' : '';
                if (hMeasureLabel) hMeasureLabel.style.display = (window.__viewCover__ === false) ? 'none' : '';
                if (hMeasureBadge) hMeasureBadge.style.display = (window.__viewCover__ === false) ? 'none' : '';
                if (arrowHtml) arrowHtml.style.display = (window.__viewCover__ === false) ? 'none' : 'block';
                updateSecondaryCourtLock();
                updateSecondaryFromLeft();
                updateIntersectionDot();
            }

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
                const targetNode = evt.target;
                if (targetNode === dot || targetNode === intersectionDot || targetNode === yellowLine || targetNode === arrowHtml) {
                    return;
                }
                const point = toSvgPoint(evt);
                let handled = false;
                if (dot && window.__viewPlayer__ !== false && !isColpitoreMovementLocked()) {
                    const dotX = parseFloat(dot.getAttribute('cx'));
                    const dotY = parseFloat(dot.getAttribute('cy'));
                    const dotDistance = Math.hypot(point.x - dotX, point.y - dotY);
                    if (dotDistance <= TOUCH_PICK_RADIUS) {
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
            })();

            // Colpitore change
            const colpitoreInputs = document.querySelectorAll('input[name="colpitore"]');
            if (colpitoreInputs && colpitoreInputs.length) {
                colpitoreInputs.forEach((inp) => {
                    inp.addEventListener('change', (e) => {
                        const val = e.target && e.target.value ? e.target.value : 'tuo';
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
                                dot.setAttribute('cx', String(ORIGIN_X));
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
                        
                        // Handle different modes
                        if (val === '1colpo') {
                            // Single shot mode - show only primary court
                            document.querySelector('.court-container:last-of-type').style.display = 'none';
                        } else if (val === '2colpi') {
                            // Two shots mode - show both courts
                            document.querySelector('.court-container:last-of-type').style.display = 'flex';
                        } else if (val === 'dinamico') {
                            // Dynamic mode - show panel in right container
                            document.querySelector('.court-container:last-of-type').style.display = 'flex';
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
                    });
                });
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
            bindViewCheckbox(chkCenter, '__viewCenter__');
            bindViewCheckbox(chkCoordinates, '__viewCoordinates__');
            
            // Vincolo: se "Ricevitore" è OFF, forza OFF e disabilita "Campo da Coprire"
            if (chkResponder && chkCover) {
                const syncCoverWithResponder = () => {
                    if (!chkResponder.checked) {
                        window.__prevViewCover__ = window.__viewCover__;
                        window.__viewCover__ = false;
                        chkCover.checked = false;
                        chkCover.disabled = true;
                        applyViewToggles();
                        const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                        const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                        updateLinesAndWedge(dotX, dotY);
                    } else {
                        chkCover.disabled = false;
                        window.__viewCover__ = (window.__prevViewCover__ !== undefined) ? window.__prevViewCover__ : false;
                        chkCover.checked = !!window.__viewCover__;
                        applyViewToggles();
                        const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                        const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                        updateLinesAndWedge(dotX, dotY);
                    }
                };
                chkResponder.addEventListener('change', syncCoverWithResponder);
                // Inizializza stato coerente
                syncCoverWithResponder();
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
                        } else {
                            const select = document.getElementById(`default_${key}`);
                            if (select) {
                                select.value = defaults[key];
                            }
                        }
                    }
                });
            }
            
            function applyToActualControls(defaults) {
                // Apply to actual control sections
                Object.keys(defaults).forEach(key => {
                    if (defaults[key] !== null) {
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
            }
            
            function addDefaultEventListeners() {
                // Listen for changes in DEFAULT section
                const defaultControls = document.querySelectorAll('#default_colpitore, #default_modalita, #default_tipologia, #default_campoType, #default_view_directions, #default_view_player, #default_view_shot, #default_view_responder, #default_view_cover, #default_view_center, #default_view_coordinates');
                
                defaultControls.forEach(control => {
                    control.addEventListener('change', function() {
                        // Save the change
                        const key = this.id.replace('default_', '');
                        const value = this.type === 'checkbox' ? this.checked : this.value;
                        localStorage.setItem(`default_${key}`, value);
                        
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
                    center: window.__viewCenter__,
                    coordinates: window.__viewCoordinates__
                };
                
                // Nascondi tutti tranne Colpitore
                window.__viewDirections__ = false;
                window.__viewShot__ = false;
                window.__viewResponder__ = false;
                window.__viewCover__ = false;
                window.__viewCenter__ = false;
                window.__viewCoordinates__ = false;
                
                // Aggiorna i checkbox
                if (chkDirections) chkDirections.checked = false;
                if (chkShot) chkShot.checked = false;
                if (chkResponder) chkResponder.checked = false;
                if (chkCover) chkCover.checked = false;
                if (chkCenter) chkCenter.checked = false;
                if (chkCoordinates) chkCoordinates.checked = false;
                
                // Disabilita i checkbox per impedire modifiche
                if (chkDirections) chkDirections.disabled = true;
                if (chkShot) chkShot.disabled = true;
                if (chkResponder) chkResponder.disabled = true;
                if (chkCover) chkCover.disabled = true;
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
            
            // Funzione per gestire i checkbox di visualizzazione in modalità DINAMICO
            function updateVisualizationCheckboxes() {
                if (window.__modalita__ === 'dinamico') {
                    // In modalità DINAMICO, forza e disabilita i checkbox critici
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
                    
                    // Applica i cambiamenti
                    applyViewToggles();
                } else {
                    // In altre modalità, riabilita tutti i checkbox
                    if (chkDirections) chkDirections.disabled = false;
                    if (chkPlayer) chkPlayer.disabled = false;
                    if (chkShot) chkShot.disabled = false;
                    if (chkResponder) chkResponder.disabled = false;
                    
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
                    if (attaccoRadio) {
                        const attaccoEnabled = !isOneColpo;
                        attaccoRadio.disabled = !attaccoEnabled;
                        if (attaccoLabel) attaccoLabel.style.opacity = attaccoEnabled ? '1' : '0.5';
                        if (!attaccoEnabled && attaccoRadio.checked) {
                            forceNonAttaccoSelection();
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

            // Gestione pulsante NUOVO SCAMBIO
            if (nuovoScambioButton) {
                nuovoScambioButton.addEventListener('click', function() {
                    // 0. Se il punto era finito, ripristina gli elementi
                    if (puntoFinito) {
                        ripristinaElementiDopoFinePunto();
                    }
                    
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
                        wedge, hMeasure, arrowHtml, dot, intersectionDot
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
                                        if (el === arrowHtml) {
                                            el.style.display = (window.__viewCover__ === false) ? 'none' : 'block';
                                        } else {
                                            el.style.display = '';
                                        }
                                    }
                                });
                                
                                // Ripristina il cerchietto del colpo precedente
                                if (previousShotDot) previousShotDot.style.display = '';
                                
                                // Riapplica i toggle di visibilità
                                applyViewToggles();
                                
                                // Ricalcola le linee
                                const dotX = dot ? parseFloat(dot.getAttribute('cx')) : ORIGIN_X;
                                const dotY = dot ? parseFloat(dot.getAttribute('cy')) : (isPlayer ? ORIGIN_BOTTOM_Y : ORIGIN_TOP_Y);
                                updateLinesAndWedge(dotX, dotY);
                                
                                // Riabilita i pulsanti
                                if (colpoButton) colpoButton.disabled = false;
                                if (visualizzaScambioButton) visualizzaScambioButton.disabled = false;
                                if (nuovoScambioButton) nuovoScambioButton.disabled = false;
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

            window.addEventListener('resize', () => {
                applyMobileSettingsMode();
                scheduleMobileCourtGapAdjustment();
            });

            setMobileSecondaryVisible(false);
            initDinamicoPanelObserver();
            applyMobileSettingsMode(true);
            scheduleMobileCourtGapAdjustment();

        })();
