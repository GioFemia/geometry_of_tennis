# Algoritmo di Valutazione del Rischio nel Tennis

## Panoramica

Questo algoritmo valuta il rischio associato a un colpo nel tennis, analizzando sia aspetti **tecnici** che **tattici**. Il risultato finale è un valore normalizzato tra 0 e 1 che rappresenta il **Rischio Colpo Totale**.

## Sistema di Coordinate

L'algoritmo utilizza due sistemi di coordinate:

- **SVG**: Coordinate native del canvas SVG (origine in alto a sinistra)
- **Campo A**: Sistema del campo in basso (colpitore), origine al centro della baseline
- **Campo B**: Sistema del campo in alto (ricevitore), origine al centro della baseline

### Costanti Fondamentali

- `FIELD_A_ORIGIN_X = 300`, `FIELD_A_ORIGIN_Y = 822`
- `FIELD_B_ORIGIN_X = 300`, `FIELD_B_ORIGIN_Y = 150`
- `NET_Y = 486` (posizione della rete in coordinate SVG)
- Larghezza campo: -117 a +117 (234 cm totale)
- Lunghezza campo: 0 a 250 (Campo B), 0 a 336 (fino alla rete)

## Variabili Tecniche

### 1. Posizione Colpitore

**Descrizione**: Posizione orizzontale (X) del colpitore nel Campo A quando effettua il colpo.

**Calcolo**:
```javascript
posizioneColpitore = dotX_svg - FIELD_A_ORIGIN_X
```

**Range**:
- Min: **-180**
- Max: **200**
- Se > 200: mostra "200+" e normalizzazione = 1

**Interpretazione**: 
- Valori vicini a 0 indicano posizione centrale (migliore)
- Valori estremi indicano posizione laterale (peggiore)

**Nota**: Questa variabile utilizza una **normalizzazione concava** (potenza con esponente 0.5) invece della sigmoidea. Questo significa che le variazioni vicino ai valori minimi (posizioni estreme) hanno un effetto maggiore sul rischio rispetto alle variazioni vicino ai massimi (posizione centrale). In pratica: essere molto fuori posizione è già molto rischioso, e piccoli miglioramenti verso il centro hanno grande effetto (vedi sezione "Normalizzazione Concava per Posizione Colpitore").

### 2. Spazio Colpo

**Descrizione**: Lunghezza della traiettoria valida del colpo all'interno del Campo B, limitata dalla zona di gioco (Y da 0 a 250).

**Calcolo**:
1. Si utilizza l'algoritmo **Cohen-Sutherland** per clippare la linea gialla (traiettoria del colpo) all'interno del rettangolo:
   - X: da -117 a +117 (Campo B)
   - Y: da 0 a 250 (Campo B)
2. Si calcola la distanza euclidea tra i due punti clippati

```javascript
dx = end_fieldB.x - start_fieldB.x
dy = end_fieldB.y - start_fieldB.y
spazioColpo = sqrt(dx² + dy²)
```

**Range**: 
- Min/Max: **Calcolati dinamicamente** campionando 100 direzioni possibili tra le linee estreme sinistra e destra

**Interpretazione**: 
- Spazio maggiore = più margine di errore = minore rischio

**Nota**: Questa variabile utilizza una **normalizzazione convessa** (potenza con esponente 3) invece della sigmoidea standard. Questo significa che le variazioni vicino ai valori massimi di spazio hanno un effetto **estremamente maggiore** sul rischio rispetto alle variazioni vicino ai minimi. In pratica: avere molto spazio riduce il rischio in modo **fortemente accelerato** (vedi sezione "Normalizzazione Convessa").

### 3. Rischio Errore Laterale

**Descrizione**: Posizione orizzontale (X) del colpo alla Y media della porzione valida della traiettoria nel Campo B.

**Calcolo**:
1. Si utilizza la porzione clippata della linea gialla (traiettoria del colpo) già calcolata per Spazio Colpo (zona 0 < Y < 250 e -117 < X < 117 nel Campo B)
2. Si identificano Y_min e Y_max della porzione clippata
3. Si calcola Y_media = (Y_min + Y_max) / 2
4. Si trova la coordinata X corrispondente a questa Y_media
5. Questa X rappresenta il rischio di errore laterale

```javascript
// Clippa la linea nel rettangolo di Spazio Colpo
const clipped250 = clipLine(x1_svg, y1_svg, x2_svg, y2_svg, X_MIN_SVG, X_MAX_SVG, Y_MIN_SVG, Y_MAX_SVG_250);

// Trova Y_min e Y_max
const y_min_svg = min(clipped250.y1, clipped250.y2);
const y_max_svg = max(clipped250.y1, clipped250.y2);

// Calcola Y media
const y_media_svg = (y_min_svg + y_max_svg) / 2;

// Trova X a Y media
const t = (y_media_svg - clipped250.y1) / (clipped250.y2 - clipped250.y1);
yellowX_atYMedia = clipped250.x1 + t * (clipped250.x2 - clipped250.x1);

// Converti in coordinate Campo B
rischioErroreLaterale = yellowX_atYMedia - FIELD_B_ORIGIN_X;
```

**Range**:
- Valore grezzo: da **-117** (bordo sinistro) a **+117** (bordo destro)
- **Visualizzazione nella UI**: valore assoluto da **0** (centro) a **117** (bordo)

**Interpretazione del valore grezzo**: 
- Valore **negativo** = colpo verso **sinistra** (verso X negativo)
- Valore **positivo** = colpo verso **destra** (verso X positivo)
- Valore vicino a **0** = colpo al **centro** (minore rischio laterale)
- Valore **estremo** (vicino a ±117) = colpo vicino ai **bordi laterali** (maggiore rischio di uscita laterale)

**Visualizzazione e Normalizzazione**: 
- Nella **UI viene mostrato il valore assoluto** |X| per facilitare l'interpretazione: 0 = centro campo (rischio minimo), 117 = bordo (rischio massimo)
- Per la **normalizzazione** (0-1) si utilizza lo stesso valore assoluto:
```javascript
rischioErroreLateraleNorm = normalizeValue(abs(rischioErroreLaterale), 0, 115)
```
Questo riflette il fatto che il rischio è simmetrico: sia X = -117 che X = +117 rappresentano lo stesso livello di rischio (massimo), mentre X = 0 rappresenta il rischio minimo.

### 4. Altezza Rete

**Descrizione**: Valore assoluto della coordinata X in cui la linea gialla del colpo si interseca con la rete (linea orizzontale spessa a Y = 486 in coordinate SVG).

**Calcolo**:
1. Si identifica la linea gialla (yellowLine) nel campo principale
2. Si calcola il punto di intersezione con la rete (NET_Y = 486)
3. Si converte la coordinata X in coordinate Campo B
4. Si prende il valore assoluto

```javascript
// Trova X della linea gialla alla Y della rete
const t = (NET_Y - y1_svg) / (y2_svg - y1_svg);
const yellowX_atNet = x1_svg + t * (x2_svg - x1_svg);

// Converti in coordinate Campo B e prendi valore assoluto
const yellowX_fieldB_atNet = yellowX_atNet - FIELD_B_ORIGIN_X;
altezzaRete = Math.abs(yellowX_fieldB_atNet);
```

**Range**:
- Min: **0** (colpo al centro della rete)
- Max: **100** (colpo molto laterale alla rete)
- Se > 100: mostra "100+" e normalizzazione = 1

**Interpretazione**: 
- Valore vicino a 0 = colpo passa al centro della rete (minore rischio)
- Valore elevato = colpo passa lateralmente alla rete (maggiore rischio di errore)

**Nota**: Questa variabile utilizza una **normalizzazione lineare** invece della sigmoidea, per una relazione diretta e proporzionale tra distanza laterale dalla rete e rischio.

## Variabili Tattiche

### 5. Spostamento Avversario

**Descrizione**: Distanza orizzontale che l'avversario deve percorrere per raggiungere il colpo, rispetto alla posizione centrale (bisetrice).

**Calcolo**:
1. Si identifica la posizione del ricevitore (intersectionDot) nel Campo B
2. Si calcola la posizione X della linea tratteggiata (bisectorLine) alla stessa Y del ricevitore
3. Si calcola la distanza orizzontale assoluta

```javascript
bisectorX_svg = bisX1 + t * (bisX2 - bisX1)  // dove t = (ricevitoreY - bisY1) / (bisY2 - bisY1)
spostamentoAvversario = abs(ricevitoreX_fieldB - bisX_fieldB)
```

**Range**:
- Min/Max: **Calcolati dinamicamente** campionando 100 direzioni possibili

**Interpretazione**: 
- Spostamento maggiore = avversario più lontano = vantaggio tattico

**Nota**: Questa variabile utilizza una **normalizzazione lineare** invece della sigmoidea, per una relazione diretta e proporzionale tra spostamento e vantaggio tattico.

### 6. Distanza Mid Point

**Descrizione**: Nel campo secondario, distanza orizzontale tra il colpitore (dopo il colpo) e la posizione centrale ideale (bisetrice).

**Calcolo**:
1. Nel SVG secondario, si trova il pallino rosso (cursorDotReplica2) nel Campo A
2. Si calcola la X della bisetrice (bisectorLine2) alla stessa Y del pallino
3. Si calcola la distanza orizzontale

```javascript
bisX_fieldA = bisX1 + t * (bisX2 - bisX1)
distanzaMidPoint = abs(dotX_fieldA - bisX_fieldA)
```

**Range**:
- Min: **0**
- Max: **200**
- Se > 200: mostra "200+" e normalizzazione = 1

**Interpretazione**: 
- Distanza maggiore = posizione peggiore dopo il colpo = maggiore rischio tattico

### 7. Campo da Coprire

**Descrizione**: Ampiezza orizzontale tra le due direzioni estreme che il colpitore deve coprire dopo aver effettuato il colpo.

**Calcolo**:
1. Nel SVG secondario, si identificano le due linee blu (leftLine2 e rightLine2)
2. Si calcola la posizione X di ciascuna linea alla Y del colpitore
3. Si calcola la distanza orizzontale tra le due posizioni

```javascript
leftX_atDotY = leftX1 + t * (leftX2 - leftX1)
rightX_atDotY = rightX1 + t * (rightX2 - rightX1)
campoDaCoprire = abs(rightX_fieldA - leftX_fieldA)
```

**Range**:
- Min: **250**
- Max: **400**
- Se > 400: mostra "400+" e normalizzazione = 1

**Interpretazione**: 
- Campo maggiore da coprire = posizione più vulnerabile = maggiore rischio tattico

**Nota**: Questa variabile utilizza una **funzione di normalizzazione speciale** (potenza con esponente 0.5) invece della sigmoidea standard, per riflettere la crescita rapida del rischio anche per piccoli incrementi del campo da coprire (vedi sezione "Normalizzazione Concava con Funzione Potenza (Campo da Coprire)").

## Calcolo Min/Max Dinamici

Per le variabili **Spazio Colpo**, **Spostamento Avversario**, **Distanza Mid Point** e **Campo da Coprire**, i valori min/max vengono calcolati dinamicamente:

1. Si identificano le linee estreme sinistra (leftLine) e destra (rightLine)
2. Si campionano **100 direzioni** interpolando tra queste due linee
3. Per ogni direzione:
   - Si ricalcola la variabile specifica usando quella direzione
   - Si aggiorna il min/max osservato
4. I valori min/max finali vengono utilizzati per la normalizzazione

```javascript
for (let i = 0; i < 100; i++) {
    const t = i / 99;
    targetX = leftEndX + t * (rightEndX - leftEndX);
    targetY = leftEndY + t * (rightEndY - leftEndY);
    
    // Ricalcola la metrica per questa direzione
    const value = calcMetricForDirection(targetX, targetY);
    
    // Aggiorna min/max
    min = Math.min(min, value);
    max = Math.max(max, value);
}
```

## Funzioni di Normalizzazione

Le variabili vengono normalizzate tra 0 e 1 usando **tre diverse funzioni** a seconda delle caratteristiche specifiche:

| Variabile                | Funzione di Normalizzazione | Motivazione |
|--------------------------|----------------------------|-------------|
| **Posizione Colpitore**  | Potenza Concava (exp 0.5)  | Crescita rapida all'inizio |
| **Spazio Colpo**         | **Potenza Convessa (exp 3)** | Variazioni massime → effetto molto maggiore |
| **Rischio Errore Laterale** | **Lineare su \|X\|**  | Rischio simmetrico proporzionale |
| **Altezza Rete**         | **Lineare**                  | Relazione diretta e proporzionale |
| **Spostamento Avversario** | **Lineare**                  | Relazione diretta e proporzionale |
| Distanza Mid Point       | Sigmoidea                  | Percezione non-lineare del rischio |
| **Campo da Coprire**     | Potenza Concava (exp 0.5)  | Crescita rapida all'inizio |

### 1. Normalizzazione Lineare

Utilizzata per **Rischio Errore Laterale** e **Spostamento Avversario**, fornisce una relazione diretta e proporzionale tra valore e rischio/vantaggio.

#### Formula

```javascript
function normalizeLinear(value, min, max) {
    const normalized = (value - min) / (max - min);
    return clamp(normalized, 0, 1); // Limita tra 0 e 1
}
```

#### Comportamento

- Crescita costante e proporzionale
- Valore al centro = 0.5 esattamente
- Facile da interpretare: ogni unità contribuisce allo stesso modo

### 1b. Normalizzazione Concava per Posizione Colpitore

Utilizzata per **Posizione Colpitore**, implementa una funzione con **derivata seconda sempre negativa** (funzione concava), dove le variazioni vicino ai valori minimi hanno effetti maggiori rispetto alle variazioni ai valori massimi.

#### Formula

```javascript
function normalizePosizioneColpitore(value, min, max) {
    // Normalizzazione lineare [0, 1]
    const linear = (value - min) / (max - min);
    
    // Applica funzione potenza con esponente < 1 (concava)
    // Esponente 0.5 = radice quadrata
    const result = Math.pow(linear, 0.5);
    
    return result;
}
```

#### Caratteristiche della Funzione Concava

- **Esponente 0.5**: Crea una curva concava (radice quadrata)
- **Derivata prima**: sempre crescente ma decrescente
- **Derivata seconda**: sempre negativa → concavità
- **Effetto**: Piccole variazioni vicino al minimo hanno impatto maggiore rispetto a piccole variazioni vicino al massimo

#### Comportamento Dettagliato

| Valore Lineare | Concavo (x^0.5) | Delta da step precedente |
|----------------|-----------------|--------------------------|
| 0.0            | 0.000           | -                        |
| 0.2            | 0.447           | +0.447                   |
| 0.4            | 0.632           | +0.185 (0.41x)           |
| 0.6            | 0.775           | +0.143 (0.31x)           |
| 0.8            | 0.894           | +0.119 (0.27x)           |
| 1.0            | 1.000           | +0.106 (0.24x)           |

**Confronto incrementi**: Un incremento lineare di 0.2 produce effetti **decrescenti** man mano che ci si avvicina al massimo (0.447 → 0.185 → 0.143 → 0.119 → 0.106).

#### Interpretazione per Posizione Colpitore

- **Posizioni vicine al minimo** (estremi laterali): variazioni hanno **impatto maggiore** sul rischio
- **Posizioni vicine al massimo** (centro campo): variazioni hanno **impatto minore** sul rischio
- Riflette il fatto che **essere molto fuori posizione** è già molto rischioso, e piccoli miglioramenti hanno grande effetto

### 2. Normalizzazione Convessa (Spazio Colpo)

Utilizzata per **Spazio Colpo**, implementa una funzione con **derivata seconda sempre positiva** (funzione convessa), dove le variazioni vicino ai valori massimi hanno effetti maggiori rispetto alle variazioni ai valori minimi.

#### Formula

```javascript
function normalizeSpazioColpo(value, min, max) {
    // Normalizzazione lineare [0, 1]
    const linear = (value - min) / (max - min);
    
    // Applica funzione potenza con esponente > 1 (convessa)
    // Esponente 3 dà crescita molto lenta all'inizio, forte accelerazione verso il massimo
    const result = Math.pow(linear, 3);
    
    return result;
}
```

#### Caratteristiche della Funzione Convessa

- **Esponente 3**: Crea una funzione cubica con forte convessità
- **Derivata prima**: sempre crescente → accelerazione crescente
- **Derivata seconda**: sempre positiva e crescente → convessità accentuata
- **Effetto**: Piccole variazioni vicino al massimo hanno impatto **estremamente maggiore** rispetto a piccole variazioni vicino al minimo

#### Comportamento Dettagliato

| Valore Lineare | Convesso (x³) | Delta da step precedente |
|----------------|---------------|--------------------------|
| 0.0            | 0.000         | -                        |
| 0.2            | 0.008         | +0.008                   |
| 0.4            | 0.064         | +0.056 (7x più grande)   |
| 0.6            | 0.216         | +0.152 (19x più grande)  |
| 0.8            | 0.512         | +0.296 (37x più grande)  |
| 1.0            | 1.000         | +0.488 (61x più grande)  |

**Confronto incrementi**: Un incremento lineare di 0.2 produce effetti **estremamente crescenti** man mano che ci si avvicina al massimo (0.008 → 0.056 → 0.152 → 0.296 → 0.488).

**Confronto con esponente 2**: Con x³ rispetto a x², l'accelerazione è molto più marcata. Ad esempio, a 0.8 lineare: x² = 0.64, x³ = 0.512 (più conservativo all'inizio), ma a 0.9: x² = 0.81, x³ = 0.729 (accelera di più verso il massimo).

#### Interpretazione per Spazio Colpo

- **Spazi piccoli** (vicini al minimo): variazioni hanno **impatto molto limitato** sul rischio
- **Spazi medi**: l'impatto inizia a crescere in modo significativo
- **Spazi grandi** (vicini al massimo): variazioni hanno **impatto estremamente elevato** sul rischio
- Riflette il fatto che **maggiore spazio = maggiore margine di errore**, e questo vantaggio cresce in modo **fortemente accelerato** con esponente cubico (x³)

### 3. Normalizzazione Sigmoidea

La maggior parte delle variabili utilizza una **funzione sigmoidea** per una rappresentazione più realistica della percezione del rischio.

#### Formula

```javascript
function normalizeValue(value, min, max) {
    // Normalizzazione lineare [0, 1]
    const linear = (value - min) / (max - min);
    const clamped = clamp(linear, 0, 1);
    
    // Mappa su [-6, 6] per la sigmoidea
    const x = (clamped - 0.5) * 12;
    
    // Sigmoidea: σ(x) = 1 / (1 + e^(-x))
    const sigmoid = 1 / (1 + exp(-x));
    
    return sigmoid;
}
```

### Vantaggi della Sigmoidea

- **Transizione graduale** agli estremi (vicino a 0 e 1)
- **Cambiamento rapido** nella zona centrale (intorno a 0.5)
- Curva a forma di "S" che rende il sistema più tollerante ai valori estremi
- Migliore rappresentazione della percezione umana del rischio

### Comportamento

| Valore lineare | Valore sigmoidale |
|----------------|-------------------|
| 0.0            | ≈ 0.0025         |
| 0.5            | 0.5000           |
| 1.0            | ≈ 0.9975         |

### 4. Normalizzazione Lineare per Rischio Errore Laterale

La variabile **Rischio Errore Laterale** utilizza una **normalizzazione lineare** sul valore assoluto, che tiene conto della **simmetria** del rischio rispetto al centro del campo.

#### Caratteristiche

Il valore grezzo di Rischio Errore Laterale è una coordinata X che va da **-117** (bordo sinistro) a **+117** (bordo destro), con **0** al centro. Il rischio è:
- **Minimo** al centro (X = 0)
- **Massimo** ai bordi (X = ±117)
- **Simmetrico**: X = -100 e X = +100 hanno lo stesso rischio

Per la **visualizzazione nella UI**, viene mostrato il **valore assoluto** |X| (da 0 a 115) per facilitare l'interpretazione.

#### Formula

```javascript
function normalizeRischioErroreLaterale(value, min, max) {
    // Usa il valore assoluto per la normalizzazione lineare
    const absValue = Math.abs(value);
    return normalizeLinear(absValue, 0, 117);
}
```

#### Comportamento

| X (Campo B) | \|X\| (visualizzato) | Normalizzato (Lineare) | Interpretazione |
|-------------|----------------------|------------------------|-----------------|
| -117        | 117                  | 1.00                   | Massimo rischio (bordo sinistro) |
| -80         | 80                   | 0.68                   | Alto rischio |
| -50         | 50                   | 0.43                   | Rischio moderato |
| 0           | 0                    | 0.00                   | Minimo rischio (centro) |
| +50         | 50                   | 0.43                   | Rischio moderato |
| +80         | 80                   | 0.68                   | Alto rischio |
| +117        | 117                  | 1.00                   | Massimo rischio (bordo destro) |

**Nota**: La colonna "|X| (visualizzato)" rappresenta il valore mostrato nell'interfaccia utente.

**Caratteristiche della Normalizzazione Lineare**:
- **Crescita proporzionale**: Ogni cm di distanza dal centro contribuisce allo stesso modo
- **Facile interpretazione**: 50 cm dal centro = 43% di rischio (50/117)
- **Simmetria perfetta**: -X e +X producono lo stesso risultato
- **Differenza con sigmoidea**: La sigmoidea comprimerebbe i valori agli estremi; la lineare mantiene una progressione costante

### 5. Normalizzazione Concava con Funzione Potenza (Campo da Coprire)

La variabile **Campo da Coprire** richiede una funzione di normalizzazione diversa dalla sigmoidea standard, poiché deve:
- **Crescere rapidamente** per valori bassi (appena sopra il minimo di 250)
- **Essere moderatamente alto** per valori sopra 300-310 (circa 58-63% di rischio)
- **Essere molto alto** per valori sopra 350 (circa 82% di rischio)
- Riflettere il fatto che anche un piccolo aumento nel campo da coprire aumenta significativamente il rischio tattico

#### Formula

```javascript
function normalizeCampoDaCoprire(value, min, max) {
    if (value >= max) return 1;
    if (value <= min) return 0;
    
    // Normalizzazione lineare [0, 1]
    const linear = (value - min) / (max - min);
    
    // Applica funzione potenza con esponente < 1
    // Esponente 0.5 (radice quadrata) produce crescita rapida all'inizio
    const result = Math.pow(linear, 0.5);
    
    return result;
}
```

#### Caratteristiche della Funzione Potenza Concava

- **Esponente 0.5** (< 1): Crea una curva concava (radice quadrata) che cresce rapidamente all'inizio
- **Non-lineare**: La crescita è più veloce della normalizzazione lineare ma meno estrema di exp 0.2
- **Crescita moderata**: A 300-310 il valore è già al 58-63%, più graduale rispetto a exp 0.2

#### Comportamento Dettagliato

Con range min=250, max=400:

| Campo da Coprire | Lineare | Potenza (exp 0.5) | Differenza |
|------------------|---------|-------------------|------------|
| 250              | 0.00    | 0.00              | -          |
| 260              | 0.07    | **0.26**          | +0.19      |
| 280              | 0.20    | **0.45**          | +0.25      |
| 300              | 0.33    | **0.58**          | +0.25      |
| 310              | 0.40    | **0.63**          | +0.23      |
| 350              | 0.67    | **0.82**          | +0.15      |
| 400              | 1.00    | 1.00              | -          |

#### Interpretazione

- **260 cm** (appena 10 cm sopra il minimo): già **26%** di rischio
- **300 cm**: **58%** di rischio - moderato-alto
- **310 cm**: **63%** di rischio - alto
- **350 cm**: **82%** di rischio - molto alto
- Questo riflette la realtà tattica: coprire anche 260 cm è già difficile, e oltre 300 cm diventa molto difficile gestire efficacemente. Con esponente 0.5 la crescita è più graduale rispetto a 0.2, ma comunque più rapida della lineare.

## Rischi Aggregati

### Rischio Tecnico Totale

Media pesata delle componenti tecniche normalizzate:

```javascript
rischioTecnico = (
    0.3 * (1 - posizione_colpitore_norm) + 
    0.3 * (1 - spazio_colpo_norm) + 
    0.3 * rischio_errore_laterale_norm +
    0.1 * altezza_rete_norm
)
```

**Pesi**:
- **Posizione Colpitore**: 0.25 (25%)
- **Spazio Colpo**: 0.25 (25%)
- **Rischio Errore Laterale**: 0.25 (25%)
- **Altezza Rete**: 0.25 (25%)

**Nota**: 
- Per Posizione Colpitore e Spazio Colpo si usa `(1 - valore)` perché valori alti indicano situazioni migliori.
- Tutte e 4 le variabili tecniche hanno lo stesso peso (0.25 ciascuna) per un contributo equo al rischio tecnico totale.

### Rischio Tattico Totale

Media delle componenti tattiche normalizzate:

```javascript
rischioTattico = (
    (1 - spostamento_avversario_norm) + 
    distanza_mid_point_norm + 
    campo_da_coprire_norm
) / 3
```

**Nota**: Per Spostamento Avversario si usa `(1 - valore)` perché un alto spostamento dell'avversario è vantaggioso.

### Rischio Colpo Totale

Media tra Rischio Tecnico e Rischio Tattico:

```javascript
rischioColpo = (rischioTecnico + rischioTattico) / 2
```

**Interpretazione**: 
- 0.0 = Colpo a bassissimo rischio
- 0.5 = Rischio medio
- 1.0 = Colpo ad altissimo rischio

## Visualizzazione

Ogni variabile viene visualizzata con:
- **Valore corrente**: con 2 decimali
- **Range**: Min e Max
- **Valore normalizzato**: tra 0.00 e 1.00
- **Barra di progresso**: rappresentazione visiva della normalizzazione

I rischi aggregati (Tecnico, Tattico, Colpo) sono:
- **Collassabili**: per ridurre il clutter visivo
- **Evidenziati**: con colori e dimensioni appropriate
- **Prioritizzati**: il Rischio Colpo è mostrato prominentemente in alto

## Algoritmi Utilizzati

### Cohen-Sutherland Line Clipping

Utilizzato per determinare la porzione valida della traiettoria del colpo all'interno della zona di gioco.

```javascript
function clipLine(x1, y1, x2, y2, xMin, xMax, yMin, yMax) {
    // Codici binari per identificare la posizione rispetto al rettangolo
    const INSIDE = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
    
    // Iterazione fino a trovare il segmento clippato o determinare che è fuori
    // ...
    
    return { x1, y1, x2, y2, valid: true/false };
}
```

### Interpolazione Lineare

Utilizzata per trovare intersezioni e calcolare valori a coordinate specifiche:

```javascript
// Trova il parametro t per interpolare tra due punti
t = (target_y - y1) / (y2 - y1);
target_x = x1 + t * (x2 - x1);
```

## Riferimenti Teorici

- **Geometria del Tennis**: Studio delle traiettorie e angoli ottimali
- **Analisi Tattica**: Valutazione della posizione e dello spostamento
- **Teoria della Decisione**: Normalizzazione sigmoidea per rappresentare la percezione del rischio
- **Computer Graphics**: Algoritmi di clipping per determinare zone valide

---

**Versione**: 1.0  
**Data**: Dicembre 2025  
**Autore**: Algoritmo Geometry of Tennis

