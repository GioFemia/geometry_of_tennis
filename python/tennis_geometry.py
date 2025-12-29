"""
Tennis Geometry Visualization
Replica della logica dell'applicazione web per visualizzare:
- Campo da tennis con vista dall'alto
- Posizione del colpitore (pallino rosso)
- Range delle traiettorie possibili in modalità palleggio (linee blu e area)
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np


class TennisCourtGeometry:
    """Classe per gestire la geometria del campo da tennis e i calcoli delle traiettorie"""

    # Costanti del campo (coordinate SVG dall'applicazione web)
    COURT_X_MIN = 146
    COURT_X_MAX = 454
    COURT_Y_MIN = 150
    COURT_Y_MAX = 822
    NET_Y = 486
    ORIGIN_X = 300
    ORIGIN_TOP_Y = 150
    ORIGIN_BOTTOM_Y = 822
    SVG_X_MIN = 0
    SVG_X_MAX = 600
    SVG_Y_MIN = 0
    SVG_Y_MAX = 1006
    LEFT_X_SVG = ORIGIN_X - 115
    RIGHT_X_SVG = ORIGIN_X + 115
    END_Y_TOP = 0
    END_Y_BOTTOM = SVG_Y_MAX

    # Parametri per modalità palleggio (rally)
    BASE_OFFSET_RALLY = 105
    BASE_COEFF_RALLY = 0.4
    EFFECT_COEFF_RALLY = 0.4

    # Origini dei sistemi di coordinate
    FIELD_B_ORIGIN_X = 300  # Centro della linea superiore orizzontale
    FIELD_B_ORIGIN_Y = 150  # Linea superiore orizzontale
    FIELD_A_ORIGIN_X = 300  # Centro della linea inferiore orizzontale
    FIELD_A_ORIGIN_Y = 822  # Linea inferiore orizzontale

    def __init__(self):
        """Inizializza il campo da tennis"""
        self.fig, self.ax = plt.subplots(figsize=(10, 16))
        self.setup_court()

    def field_a_to_svg(self, x_a, y_a):
        """
        Converte coordinate dal sistema Campo A (giocatore) a coordinate SVG

        Campo A: origine al centro della linea di fondo inferiore (300, 822)
        - X: positivo a destra, negativo a sinistra
        - Y: positivo verso l'alto, negativo verso il basso

        Args:
            x_a: coordinata X relativa al Campo A
            y_a: coordinata Y relativa al Campo A

        Returns:
            tuple (svg_x, svg_y): coordinate SVG assolute
        """
        svg_x = self.FIELD_A_ORIGIN_X + x_a
        svg_y = self.FIELD_A_ORIGIN_Y - y_a  # Y invertito
        return svg_x, svg_y

    def field_b_to_svg(self, x_b, y_b):
        """
        Converte coordinate dal sistema Campo B (avversario) a coordinate SVG

        Campo B: origine al centro della linea superiore orizzontale (300, 150)
        - X: positivo a destra, negativo a sinistra
        - Y: positivo verso il basso, negativo verso l'alto

        Args:
            x_b: coordinata X relativa al Campo B
            y_b: coordinata Y relativa al Campo B

        Returns:
            tuple (svg_x, svg_y): coordinate SVG assolute
        """
        svg_x = self.FIELD_B_ORIGIN_X + x_b
        svg_y = self.FIELD_B_ORIGIN_Y + y_b
        return svg_x, svg_y

    def svg_to_field_a(self, svg_x, svg_y):
        """
        Converte coordinate SVG a coordinate del sistema Campo A

        Args:
            svg_x: coordinata X SVG
            svg_y: coordinata Y SVG

        Returns:
            tuple (x_a, y_a): coordinate relative al Campo A
        """
        x_a = svg_x - self.FIELD_A_ORIGIN_X
        y_a = self.FIELD_A_ORIGIN_Y - svg_y  # Y invertito
        return x_a, y_a

    def svg_to_field_b(self, svg_x, svg_y):
        """
        Converte coordinate SVG a coordinate del sistema Campo B

        Args:
            svg_x: coordinata X SVG
            svg_y: coordinata Y SVG

        Returns:
            tuple (x_b, y_b): coordinate relative al Campo B
        """
        x_b = svg_x - self.FIELD_B_ORIGIN_X
        y_b = svg_y - self.FIELD_B_ORIGIN_Y
        return x_b, y_b

    def setup_court(self):
        """Disegna il campo da tennis con tutte le linee"""
        # Imposta i limiti del grafico
        self.ax.set_xlim(self.SVG_X_MIN, self.SVG_X_MAX)
        self.ax.set_ylim(
            self.SVG_Y_MAX, self.SVG_Y_MIN
        )  # Invertito per avere Y=0 in alto
        self.ax.set_aspect("equal")

        # Sfondo del campo (blu)
        background = patches.Rectangle(
            (0, 0),
            self.SVG_X_MAX,
            self.SVG_Y_MAX,
            linewidth=0,
            facecolor="#1565c0",
            zorder=0,
        )
        self.ax.add_patch(background)

        # Campo interno principale (blu chiaro)
        main_court = patches.Rectangle(
            (184, 150),
            232,
            672,
            linewidth=3,
            edgecolor="white",
            facecolor="#42a5f5",
            zorder=1,
        )
        self.ax.add_patch(main_court)

        # Corridoi laterali sinistro
        left_corridor = patches.Rectangle(
            (146, 150),
            38,
            672,
            linewidth=3,
            edgecolor="white",
            facecolor="#42a5f5",
            zorder=1,
        )
        self.ax.add_patch(left_corridor)

        # Corridoi laterali destro
        right_corridor = patches.Rectangle(
            (416, 150),
            38,
            672,
            linewidth=3,
            edgecolor="white",
            facecolor="#42a5f5",
            zorder=1,
        )
        self.ax.add_patch(right_corridor)

        # Perimetro esterno del campo
        outer_perimeter = patches.Rectangle(
            (146, 150),
            308,
            672,
            linewidth=3,
            edgecolor="white",
            facecolor="none",
            zorder=2,
        )
        self.ax.add_patch(outer_perimeter)

        # Linea centrale verticale
        self.ax.plot([300, 300], [318, 654], "w-", linewidth=3, zorder=2)

        # Linee del campo da servizio
        self.ax.plot(
            [184, 416], [318, 318], "w-", linewidth=3, zorder=2
        )  # Linea servizio superiore
        self.ax.plot(
            [184, 416], [654, 654], "w-", linewidth=3, zorder=2
        )  # Linea servizio inferiore

        # Linee di fondo campo
        self.ax.plot(
            [146, 454], [150, 150], "w-", linewidth=3, zorder=2
        )  # Linea fondo superiore
        self.ax.plot(
            [146, 454], [822, 822], "w-", linewidth=3, zorder=2
        )  # Linea fondo inferiore

        # Rete (linea bianca spessa orizzontale)
        self.ax.plot([106, 494], [486, 486], "w-", linewidth=8, zorder=3)

        # Indicatori origine coordinate
        self.ax.plot(
            [300, 300], [150, 160], "w-", linewidth=3, zorder=2
        )  # Origine Campo B
        self.ax.plot(
            [300, 300], [822, 812], "w-", linewidth=3, zorder=2
        )  # Origine Campo A

        # Rimuovi assi
        self.ax.axis("off")

    def compute_rally_targets(self, dot_x, dot_y, is_player=True):
        """
        Calcola i punti target per la modalità palleggio (rally)

        Args:
            dot_x: coordinata X del colpitore
            dot_y: coordinata Y del colpitore
            is_player: True se il colpitore è il giocatore in basso (Tu), False se è l'avversario

        Returns:
            dict con le chiavi 'left' e 'right' contenenti le coordinate Y dei target
        """
        # Calcolo delle coordinate relative
        xA = dot_x - self.ORIGIN_X
        yA = self.ORIGIN_BOTTOM_Y - dot_y

        # Parametri per modalità palleggio
        base_offset = self.BASE_OFFSET_RALLY
        base_coeff = self.BASE_COEFF_RALLY
        effect_coeff = self.EFFECT_COEFF_RALLY

        # Calcolo base e effetto
        base = base_offset + base_coeff * yA
        effect = effect_coeff * abs(xA)

        # Calcolo del parametro t (normalizzazione della posizione verticale)
        yA_min = self.ORIGIN_BOTTOM_Y - self.SVG_Y_MAX
        yA_max = self.ORIGIN_BOTTOM_Y - self.NET_Y
        denom = yA_max - yA_min if (yA_max - yA_min) != 0 else 1
        t = (yA - yA_min) / denom
        t = max(0, min(1, t))  # Clamp tra 0 e 1

        # Scala negativa per modalità palleggio
        neg_scale = 4 * t - 1.5

        # Calcolo dei target sinistro e destro
        left_b = base
        right_b = base

        if xA > 0:
            left_b = base + effect
            right_b = base - effect * neg_scale
        elif xA < 0:
            left_b = base - effect * neg_scale
            right_b = base + effect

        # Se il colpitore è il giocatore (in basso), i target sono in alto
        if is_player:
            return {
                "left": self.ORIGIN_TOP_Y + left_b,
                "right": self.ORIGIN_TOP_Y + right_b,
            }
        else:
            # Se il colpitore è l'avversario (in alto), applica trasformazione speculare
            # Specchia rispetto alla rete
            dot_x_m = 2 * self.ORIGIN_X - dot_x
            dot_y_m = 2 * self.NET_Y - dot_y

            # Ricalcola per la posizione speculare
            targets_top = self.compute_rally_targets(dot_x_m, dot_y_m, is_player=True)

            # Specchia i risultati rispetto alla rete
            return {
                "left": 2 * self.NET_Y - targets_top["right"],
                "right": 2 * self.NET_Y - targets_top["left"],
            }

    def get_directional_anchor_points(self, dot_x, dot_y, targets):
        """
        Calcola i punti di ancoraggio per le linee direzionali in modalità palleggio

        Args:
            dot_x: coordinata X del colpitore
            dot_y: coordinata Y del colpitore
            targets: dizionario con 'left' e 'right' (coordinate Y dei target)

        Returns:
            dict con leftX, leftY, rightX, rightY
        """
        return {
            "leftX": self.LEFT_X_SVG,
            "leftY": targets["left"],
            "rightX": self.RIGHT_X_SVG,
            "rightY": targets["right"],
        }

    def compute_intersection_x(self, x1, y1, x2, y2, y_target):
        """
        Calcola la coordinata X dove una linea da (x1,y1) a (x2,y2) interseca y=y_target

        Args:
            x1, y1: punto iniziale
            x2, y2: punto finale
            y_target: coordinata Y dove trovare l'intersezione

        Returns:
            coordinata X dell'intersezione
        """
        if abs(y2 - y1) < 1e-6:
            return x1
        t = (y_target - y1) / (y2 - y1)
        return x1 + t * (x2 - x1)

    def draw_player_and_trajectories(self, x, y, field="A"):
        """
        Disegna il colpitore e le sue traiettorie possibili

        Args:
            x: coordinata X relativa al sistema di coordinate del campo
            y: coordinata Y relativa al sistema di coordinate del campo
            field: 'A' per Campo A (giocatore in basso), 'B' per Campo B (avversario in alto)
        """
        # Converti le coordinate relative in coordinate SVG
        if field == "A":
            dot_x, dot_y = self.field_a_to_svg(x, y)
            is_player = True
        elif field == "B":
            dot_x, dot_y = self.field_b_to_svg(x, y)
            is_player = False
        else:
            raise ValueError("field deve essere 'A' o 'B'")

        # Calcola i target per la modalità palleggio
        targets = self.compute_rally_targets(dot_x, dot_y, is_player)

        # Ottieni i punti di ancoraggio
        anchors = self.get_directional_anchor_points(dot_x, dot_y, targets)

        # Determina l'estremo Y delle linee in base alla posizione del colpitore
        end_y_svg = self.END_Y_TOP if is_player else self.END_Y_BOTTOM

        # Calcola le intersezioni delle linee con il bordo del campo
        left_end_x = self.compute_intersection_x(
            dot_x, dot_y, anchors["leftX"], anchors["leftY"], end_y_svg
        )
        right_end_x = self.compute_intersection_x(
            dot_x, dot_y, anchors["rightX"], anchors["rightY"], end_y_svg
        )

        # Disegna l'area ombreggiata (wedge) - range delle traiettorie
        wedge_points = [
            (dot_x, dot_y),
            (left_end_x, end_y_svg),
            (right_end_x, end_y_svg),
        ]
        wedge = patches.Polygon(
            wedge_points, facecolor="black", alpha=0.15, edgecolor="none", zorder=4
        )
        self.ax.add_patch(wedge)

        # Disegna la linea sinistra (blu)
        self.ax.plot(
            [dot_x, left_end_x],
            [dot_y, end_y_svg],
            color="#1976d2",
            linewidth=3,
            linestyle="-",
            solid_capstyle="round",
            zorder=5,
            label="Direzione sinistra",
        )

        # Disegna la linea destra (blu)
        self.ax.plot(
            [dot_x, right_end_x],
            [dot_y, end_y_svg],
            color="#1976d2",
            linewidth=3,
            linestyle="-",
            solid_capstyle="round",
            zorder=5,
            label="Direzione destra",
        )

        # Disegna la linea bisetrice (tratteggiata)
        bisector_target_y = (targets["left"] + targets["right"]) / 2
        bisector_x = (
            self.LEFT_X_SVG if anchors["leftX"] == self.LEFT_X_SVG else self.RIGHT_X_SVG
        )
        bisector_end_x = self.compute_intersection_x(
            dot_x, dot_y, self.ORIGIN_X, bisector_target_y, end_y_svg
        )

        self.ax.plot(
            [dot_x, bisector_end_x],
            [dot_y, end_y_svg],
            color="#1976d2",
            linewidth=2,
            linestyle="--",
            dashes=(6, 6),
            solid_capstyle="round",
            zorder=5,
            label="Centro",
        )

        # Disegna il colpitore (pallino rosso)
        circle = plt.Circle(
            (dot_x, dot_y),
            12,
            facecolor="#ff5252",
            edgecolor="white",
            linewidth=2,
            zorder=6,
        )
        self.ax.add_patch(circle)

    def add_title(self, title="Geometry of Tennis - Modalità Palleggio"):
        """Aggiunge un titolo alla visualizzazione"""
        plt.title(title, fontsize=16, fontweight="bold", pad=20)

    def show(self):
        """Mostra il grafico"""
        plt.tight_layout()
        plt.show()

    def save(self, filename="tennis_geometry.png", dpi=150):
        """Salva il grafico come immagine"""
        plt.tight_layout()
        plt.savefig(filename, dpi=dpi, bbox_inches="tight", facecolor="white")
        print(f"Immagine salvata come: {filename}")


def main():
    """Funzione principale per dimostrare l'utilizzo della classe"""

    # Crea il campo da tennis
    court = TennisCourtGeometry()

    # Esempio: Colpitore al centro del fondo campo (giocatore in basso)
    # Sistema di coordinate Campo A:
    # - Origine: centro linea di fondo (0, 0)
    # - X positivo a destra, negativo a sinistra
    # - Y positivo verso la rete (alto), negativo verso il fondo

    x_a = 0  # Centro orizzontale
    y_a = 72  # Circa 72 unità dalla linea di fondo verso la rete

    # Disegna il colpitore e le traiettorie usando coordinate Campo A
    court.draw_player_and_trajectories(x_a, y_a, field="A")

    # Aggiungi titolo
    court.add_title(f"Geometry of Tennis - Palleggio\nCampo A: X={x_a}, Y={y_a}")

    # Salva l'immagine
    court.save("tennis_geometry_palleggio.png")

    # Mostra il grafico
    court.show()

    print("\n" + "=" * 60)
    print("INFORMAZIONI SULLA GEOMETRIA DEL CAMPO")
    print("=" * 60)
    print(f"Sistema di Coordinate Campo A (Giocatore):")
    print(f"  - Origine: centro linea di fondo (0, 0)")
    print(f"  - X: positivo a destra, negativo a sinistra")
    print(f"  - Y: positivo verso la rete, negativo verso il fondo")
    print(f"\nSistema di Coordinate Campo B (Avversario):")
    print(f"  - Origine: centro linea superiore (0, 0)")
    print(f"  - X: positivo a destra, negativo a sinistra")
    print(f"  - Y: positivo verso il basso, negativo verso l'alto")
    print(f"\nPosizione colpitore Campo A: X={x_a}, Y={y_a}")
    print("=" * 60)
    print("\nEsempi di posizioni interessanti (Campo A):")
    print("  - Centro fondo campo: (0, 70)")
    print("  - Angolo sinistro: (-100, 70)")
    print("  - Angolo destro: (100, 70)")
    print("  - Metà campo: (0, 300)")
    print("\nEsempi per Campo B (avversario):")
    print("  - Centro: (0, 100) con field='B'")
    print("  - Angolo sinistro: (-100, 100) con field='B'")


if __name__ == "__main__":
    main()
