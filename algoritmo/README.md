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
- Larghezza campo: -115 a +115 (230 cm totale)
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

### 2. Spazio Colpo

**Descrizione**: Lunghezza della traiettoria valida del colpo all'interno del Campo B, limitata dalla zona di gioco (Y da 0 a 250).

**Calcolo**:
1. Si utilizza l'algoritmo **Cohen-Sutherland** per clippare la linea gialla (traiettoria del colpo) all'interno del rettangolo:
   - X: da -115 a +115 (Campo B)
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

### 3. Rischio Errore Laterale

**Descrizione**: Distanza minima dai bordi laterali del campo alla Y media della zona di gioco.

**Calcolo**:
1. Si trova l'intersezione della linea gialla con Y = 125 (media tra 0 e 250) nel Campo B
2. Si calcola: `115 - |X|` dove X è la coordinata orizzontale in quella posizione
3. Si inverte il risultato: `rischioErroreLaterale = 115 - valore_calcolato`

```javascript
yellowX_fieldB = yellowX_atYMedia - FIELD_B_ORIGIN_X
rischioErroreLaterale = 115 - abs(yellowX_fieldB)
rischioErroreLaterale = 115 - rischioErroreLaterale  // Inversione
```

**Range**:
- Min: **0**
- Max: **115**

**Interpretazione**: 
- Valore alto = colpo più vicino al bordo = maggiore rischio di errore laterale

## Variabili Tattiche

### 4. Spostamento Avversario

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

### 5. Distanza Mid Point

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

### 6. Campo da Coprire

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
- Max: **500**
- Se > 500: mostra "500+" e normalizzazione = 1

**Interpretazione**: 
- Campo maggiore da coprire = posizione più vulnerabile = maggiore rischio tattico

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

## Normalizzazione con Funzione Sigmoidea

Ogni variabile viene normalizzata tra 0 e 1 usando una **funzione sigmoidea** invece di una semplice normalizzazione lineare.

### Formula

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

## Rischi Aggregati

### Rischio Tecnico Totale

Media delle componenti tecniche normalizzate:

```javascript
rischioTecnico = (
    (1 - posizione_colpitore_norm) + 
    (1 - spazio_colpo_norm) + 
    rischio_errore_laterale_norm
) / 3
```

**Nota**: Per Posizione Colpitore e Spazio Colpo si usa `(1 - valore)` perché valori alti indicano situazioni migliori.

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

