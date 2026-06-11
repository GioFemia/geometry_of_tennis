# Geometry of Tennis — Web App

Una pagina interattiva che visualizza e spiega in modo intuitivo la geometria dei colpi nel tennis. L’interfaccia mostra un campo da tennis in SVG e, a partire da una posizione di impatto impostabile, traccia un ventaglio di traiettorie possibili, la loro bisettrice e una misura orizzontale a una quota selezionabile.

## Come si usa

1. Apri il file `geometry_of_tennis.html` con un browser moderno (Chrome, Edge, Firefox, Safari).
2. Trascina il pallino rosso sul lato di campo attivo per impostare il punto d’impatto.
3. Usa la freccia arancione sul bordo per muovere verticalmente la quota della misura orizzontale (linea e badge in alto/basso).
4. Se attivo il modo 2 colpi, trascina la linea gialla per scegliere un punto specifico all’interno del corridoio utile alla quota selezionata.
5. Cambia i controlli nella colonna laterale per vedere come varia la geometria.

## Cosa mostra

- Ventaglio di traiettorie: due linee blu (limite sinistro e destro) dal punto d’impatto fino al bordo alto/basso del campo attivo.
- Bisettrice: linea blu tratteggiata che indica la direzione “mediana” del ventaglio.
- Cuneo dell’area utile: poligono ombreggiato compreso tra i due limiti delle traiettorie.
- Misura orizzontale: una linea arancione alla quota selezionata che mostra l’ampiezza del corridoio utile; il badge visualizza il valore in unità “Standard” o in “Metri”.
- Linea gialla interattiva (in modalità 2 colpi): permette di fissare un punto orizzontale specifico alla quota selezionata entro i limiti consentiti.

## Controlli

- Misura: Standard / Metri
  - Standard: valore scalato interno all’app per confronti rapidi.
  - Metri: conversione indicativa in metri (mostra “25+” oltre la soglia massima).
- Colpo: Tuo / Avversario
  - Inverte il lato di campo attivo con mirroring automatico (origine, quota e traiettorie si specchiano rispetto alla rete).
- Tipo: Palleggio / Passante
  - Cambia sia il colore tema (blu per Palleggio, rosso per Passante) sia i parametri che determinano l’apertura del ventaglio.
- Numero campi: 1 colpo / 2 colpi
  - 1 colpo: singolo campo interattivo con tutti i controlli di base.
  - 2 colpi: appare un secondo campo a destra. Il pallino di destra si posiziona alla quota della freccia; è mostrato anche un pallino “replica” della posizione del primo colpo per riferimento.
  - Tipo colpo (2 colpi): Palleggio / Attacco
    - Palleggio: sinistra Palleggio, destra Palleggio.
    - Attacco: sinistra Palleggio, destra Passante (cambia la geometria e il colore del secondo campo).

## Interazioni principali

- Trascinamento pallino rosso: sposta il punto d’impatto sul lato di campo attivo, aggiornando in tempo reale ventaglio, bisettrice e misura.
- Freccia arancione laterale: regola la quota della misura orizzontale (sopra la rete se il colpo è “Tuo”, sotto se “Avversario”).
- Linea gialla (2 colpi): trascina orizzontalmente per selezionare un punto entro i limiti consentiti dal ventaglio alla quota corrente; influenza il posizionamento e le traiettorie del secondo campo.

## Avvio rapido

- Non è richiesto alcun setup: doppio clic su `geometry_of_tennis.html` oppure trascina il file nel browser.
- Funziona offline. È utilizzato solo Google Fonts per i caratteri.

## Note tecniche

- Grafica basata su SVG responsive: si adatta alla finestra mantenendo le proporzioni del campo.
- Logica tutta in JavaScript vanilla, nessuna dipendenza o build tool.
- Il calcolo dei limiti del ventaglio e della bisettrice dipende dalla posizione del pallino e dal tipo di colpo selezionato, con un mirroring coerente tra i lati del campo.
- La misura “Metri” è indicativa e pensata per confronti qualitativi.

## Struttura del progetto

- `geometryoftennis.netlify.app`: pagina web completa con stile, SVG del campo e logica interattiva.
- `README.md`: questo documento.

## Branding sui campi

- Ogni campo da tennis mostra due loghi "Geometry of Tennis" (glifo + testo) posizionati nel margine in alto a sinistra e in basso a destra del campo.
- I loghi sono inseriti nell'SVG del campo primario (`index.html`) e in quello secondario generato via JS (`app.js`, funzione `courtLogoGroupMarkup`/`setupSecondaryCourt`); i loghi compaiono automaticamente anche nelle immagini scaricate.

## Compatibilità

- Testato su browser moderni desktop e su mobile.

## Changelog

- Aggiunti due loghi "Geometry of Tennis" in tutti i campi da tennis, nei punti indicati (alto-sinistra e basso-destra), riutilizzando il logo-mark dell'header.
- Rimosso il testo dai loghi sui campi e raddoppiata la dimensione del glifo (scala 2.5): ora compare solo il simbolo, più grande.
- Loghi sui campi rivisti: glifo nuovamente raddoppiato (scala 5), racchiuso in un quadrato arrotondato in stile topbar, posizionati all'altezza delle linee del servizio (y=318 e y=654) e centrati orizzontalmente tra la linea verticale esterna e il bordo del campo (x=73 e x=527).
- Ridotta la dimensione dei loghi da scala 5 a scala 3, con contenitore quadrato adattato (da 134 a 80, rx da 28 a 17).
- Allineata la posizione dei loghi del campo secondario a quella del campo principale: in `app.js` (`setupSecondaryCourt`) le coordinate di traslazione sono passate da `(73, 318)`/`(527, 654)` a `(60, 318)`/`(540, 654)`, così i loghi non risultano più spostati verso il centro rispetto al campo principale.
- Topbar mobile: rimosso il glifo/logo dalla nav bar mobile mantenendo solo la scritta "Geometry of Tennis" (`index.html`, `.app-logo-mobile`). In `styles.css` il contenitore del titolo non si comprime (`flex: 0 0 auto; overflow: visible`) per non tagliare la "y" di "Geometry", i pulsanti centrali sono a larghezza fissa (`flex: 0 0 auto`) e il gap della nav bar è ridotto a 12px: così il pulsante Modalità non può sovrapporsi alla scritta e il testo non viene ritagliato.
- Tema dinamico per superficie: la scelta della superficie (Cemento/Terra/Erba) ora tematizza l'intera pagina, non solo il colore del campo.
  - `styles.css`: introdotto un sistema di variabili CSS (`--c-darker/--c-dark/--c-primary/--c-light/--c-court/--c-300/--c-200/--c-100/--c-50/--c-bg-1/--c-bg-2` + relativi `*-rgb`). Tutti i blu hardcoded (≈204 hex e 94 `rgba`) sono stati convertiti in queste variabili. Definite tre palette su `:root[data-surface="..."]`: cemento=blu (default storico), terra=rosso, erba=verde, derivate dai colori dei campi. Tematizzati così topbar, pulsanti (inclusi quelli sui due campi), pannelli, bordi, accenti e sfondo pagina.
  - `app.js`: `updateCourtColors()` imposta `data-surface` su `<html>`; all'avvio viene applicato tramite il dispatch dell'evento `change` del default. Le palette dei campi SVG (`COURT_COLORS`) restano invariate.
  - Scelta progettuale: le linee/ventaglio funzionali disegnate sul campo (Direzioni, righello, linea gialla) restano nei colori attuali per garantire leggibilità sui campi colorati.
- Fix sezione "Default" su mobile: dopo una modifica, a volte la sezione Default del drawer mobile tornava a mostrare i valori iniziali (mentre su desktop funzionava). Causa: la sincronizzazione era solo nel senso drawer → controlli principali e la funzione di popolamento dei default leggeva da `localStorage` aggiornando solo sidebar e topbar, non il drawer.
  - `app.js` (`applyToDefaultSection`): ora popola anche i controlli del drawer (`default_*_drawer`, sia select che checkbox) al caricamento/applicazione dei default salvati.
  - `app.js` (`addDefaultEventListeners`): aggiunto il sync inverso main → drawer (senza ridisparare `change`, per evitare loop con il sync drawer → main).
  - `app.js` (`updateVisualizationCheckboxes`): in modalità 2 Colpi i checkbox "Visualizza" forzati/disabilitati vengono ora allineati anche nel drawer (e nella topbar), e riabilitati coerentemente nelle altre modalità.
- Rimossa completamente la sezione "Lezioni" dall'app:
  - `index.html`: eliminati il pulsante "Lezioni" nella top bar, i due segmenti di navigazione delle lezioni (`topBarSegmentLezioni`, `topBarSegmentLezioneRead`), la voce "Lezioni" nel drawer mobile e l'intera schermata a piena pagina `#lezioniScreen` (elenco lezioni + 4 articoli).
  - Guida interattiva: rimossa la pagina "Le Lezioni" (ex step 13) e rinumerati gli step in modo sequenziale (0–14, ora 15 pagine totali).
  - `app.js`: rimossi il blocco di logica delle lezioni (snapshot/clone dei campi, funzioni `captureLesson*`), i controller `setLezioniView`/`setLezionePericoloReadView`, i relativi listener, i riferimenti nel drawer mobile, nell'highlight della guida e nei rami ESC; aggiornata la logica `shouldShowSidebar` ai nuovi indici.
  - `styles.css`: rimosse tutte le regole `lezioni`/`lezione`/`app-view-lezion*` e i selettori orfani collegati.
- Rimossa l'interfaccia della modalità "Dinamico" dall'app (restano ora solo "1 Colpo" e "2 Colpi"). Scope: rimozione UI/CSS, lasciando intatto in `app.js` il codice del motore di simulazione (ora non più raggiungibile).
  - `index.html`: eliminati i radio "Dinamico" nei tre selettori di modalità (top bar `modalita_top`, sidebar `modalita`, drawer mobile `modalita_drawer`), le `option` "Dinamico" nei tre select "Default → Modalità", il pannello `#dinamicoPanel` (con `COLPO`, NUMERO COLPO, ULTIMO COLPO, VISUALIZZA PUNTO, PAUSA, NUOVO PUNTO) e i blocchi di opzioni download dedicati (`downloadOptionsDinamico`, `downloadOptionsDinamicoTop`, `drawer_downloadOptionsDinamico`). Aggiornata la `meta description` e la pagina "Le Modalità" della guida (da "tre" a "due" modalità).
  - Guida interattiva: rimossa la pagina "Modalità Dinamico" (ex step 8) e rinumerati gli step successivi in sequenza (ora 0–13, 14 pagine totali).
  - `app.js`: aggiornata la logica del tutorial ai nuovi indici (`getModalitaForStep`, `shouldShowSidebar`, `shouldShowOverSidebar`, etichette campo TU/AVVERSARIO, chiusura sezione Modalità) e rimosso il case `dinamico-panel` dall'highlight della guida. Aggiunta una guardia in `updateDownloadOptionsTop` per evitare errori sull'elemento dinamico rimosso. Il motore dello scambio (gestori `colpoButton`, `visualizzaScambioButton`, `nuovoScambioButton`, `pauseResumeButton`, funzioni `syncMobileDinamicoPanel`/`updateDinamicoPanel`, ecc.) è stato lasciato in place ma è inattivo perché gli elementi HTML non esistono più.
  - `styles.css`: rimosse tutte le regole `.dinamico-*` e `body.mobile-dinamico`, le variabili `--mobile-dinamico-bar-height`/`--mobile-dinamico-court-shift` e gli stili esclusivi del pannello (`.colpo-button`, `.visualizza-scambio-button`, `.nuovo-scambio-button`, `.pause-resume-button`, `.pause-icon`, `.control-field`, `.numero-display`, `.numero-navigation`, `.nav-arrow`, `.ultimo-colpo-*`, `.panel-title`, keyframe `bounce`). Mantenuti l'overlay `#colpitoreMovementAlert` e i relativi stili in quanto legati al codice del motore lasciato intatto.

