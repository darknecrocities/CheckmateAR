# Local AI Chess Coach Integration & Setup

CheckmateAR includes a grounded, offline AI Chess Coach that explains engine evaluations in natural language without hallucinations.

## 1. Grounding Protocol
To guarantee factual chess advice, the coach does not invent moves. All responses are derived strictly from:
1. Validated FEN board state.
2. Stockfish best move (SAN and UCI coordinates).
3. Evaluation score (centipawns or mate distance).
4. Detected tactical motifs (Knight Fork, Pin, Skewer, Center Control, King Safety).

## 2. Coaching Levels
- **Beginner**: Translates engine metrics into plain English strategic goals (piece activity, king safety, center control).
- **Intermediate**: Explains candidate move trade-offs, immediate threats, and tactical motifs.
- **Advanced**: Explores deep principal variation lines, pawn structure dynamics, and initiative.

## 3. Local LLM Runtime Setup (Optional GGUF / Llama.cpp)
For developers wishing to run quantized GGUF models (such as Llama-3-8B-Instruct or SmolLM-1.7B-Instruct) via `llama.cpp`:
1. Place the quantized `.gguf` file (Q4_K_M recommended) in the app documents directory:
   ```
   assets/models/smollm-1.7b-instruct-q4_k_m.gguf
   ```
2. In Settings, select "Local GGUF Backend".
3. CheckmateAR injects the structured engine context:
   ```json
   {
     "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
     "best_move": "Nf6",
     "eval_cp": 26,
     "motif": "Active Piece Development",
     "coaching_level": "intermediate"
   }
   ```
4. Output is verified with `chess.js` before display to ensure zero illegal moves are shown.
