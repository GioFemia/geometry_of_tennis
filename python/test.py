from tennis_geometry import TennisCourtGeometry

# Crea il campo
court = TennisCourtGeometry()

# Esempio: colpitore leggermente a destra e vicino al fondo
field = "B"  # Campo da utilizzare: 'A' per giocatore, 'B' per avversario
x = 50  # unità a destra del centro
y = -28  # unità dalla linea di fondo verso la rete

court.draw_player_and_trajectories(x, y, field)

# Aggiungi titolo con le coordinate
court.add_title(f"Campo {field}\nX={x}, Y={y}")

# Salva e mostra
# court.save("python/mia_analisi.png")
court.show()
