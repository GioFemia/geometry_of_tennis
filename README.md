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
- Rimossa completamente la sezione "Lezioni" dall'app:
  - `index.html`: eliminati il pulsante "Lezioni" nella top bar, i due segmenti di navigazione delle lezioni (`topBarSegmentLezioni`, `topBarSegmentLezioneRead`), la voce "Lezioni" nel drawer mobile e l'intera schermata a piena pagina `#lezioniScreen` (elenco lezioni + 4 articoli).
  - Guida interattiva: rimossa la pagina "Le Lezioni" (ex step 13) e rinumerati gli step in modo sequenziale (0–14, ora 15 pagine totali).
  - `app.js`: rimossi il blocco di logica delle lezioni (snapshot/clone dei campi, funzioni `captureLesson*`), i controller `setLezioniView`/`setLezionePericoloReadView`, i relativi listener, i riferimenti nel drawer mobile, nell'highlight della guida e nei rami ESC; aggiornata la logica `shouldShowSidebar` ai nuovi indici.
  - `styles.css`: rimosse tutte le regole `lezioni`/`lezione`/`app-view-lezion*` e i selettori orfani collegati.

