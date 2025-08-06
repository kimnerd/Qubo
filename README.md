# Qubo

Qubo is a quantum-inspired logic puzzle. Choose a board size (6×6 or 12×12) and difficulty, then fill the grid with `0`, `1`, and `ψ` while satisfying quantum-style rules:

- Each row and column must contain an equal number of `0`, `1`, and `ψ` values.
- No three identical symbols may appear consecutively.
- Rows and columns must be unique.
- Sequences of three different symbols (like `0-1-ψ`) are not allowed.

Use the controls to pick the board size and difficulty (easy/medium/hard) and click **New Game** for a fresh, randomly generated puzzle. The generator backtracks to ensure every puzzle has a unique solution. The layout automatically scales to fit the browser window.

Open `index.html` in a browser or enable GitHub Pages to play at `https://kimnerd.github.io/Qubo/`.
