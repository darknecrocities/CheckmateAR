import { Chess } from 'chess.js';
import { SquareCoord, PieceType } from '../../types/chess';

const PIECE_NAME_MAP: Record<string, string> = {
  p: 'PAWN',
  n: 'KNIGHT',
  b: 'BISHOP',
  r: 'ROOK',
  q: 'QUEEN',
  k: 'KING',
};

/**
 * Resolves the full human-readable piece name from a FEN position and square coordinate.
 */
export function getPieceNameFromFen(fen: string, coord: SquareCoord): string {
  try {
    const chess = new Chess(fen);
    const piece = chess.get(coord as any);
    if (!piece) return 'PIECE';
    return PIECE_NAME_MAP[piece.type.toLowerCase()] || 'PIECE';
  } catch {
    return 'PIECE';
  }
}

export interface TacticalMoveDetails {
  pieceName: string;
  from: SquareCoord;
  to: SquareCoord;
  promotion?: string;
  displayText: string;
}

/**
 * Formats a UCI move (e.g. "d8g5") into a tactical AR display model (e.g. "QUEEN d8 ➔ g5").
 */
export function formatTacticalMoveAction(fen: string, uciMove?: string): TacticalMoveDetails {
  if (!uciMove || uciMove.length < 4) {
    return {
      pieceName: 'PIECE',
      from: 'e2' as SquareCoord,
      to: 'e4' as SquareCoord,
      displayText: 'CALCULATING BEST MOVE',
    };
  }

  const from = uciMove.slice(0, 2) as SquareCoord;
  const to = uciMove.slice(2, 4) as SquareCoord;
  const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
  const pieceName = getPieceNameFromFen(fen, from);

  return {
    pieceName,
    from,
    to,
    promotion,
    displayText: `${pieceName} ${from} ➔ ${to}`,
  };
}

/**
 * Multimodal AI Vision frame analyzer for physical chessboards.
 * Calls Gemini Vision API when an API key is provided, returning validated legal FEN.
 */
export async function parseBoardFenWithVisionAi(
  base64Image: string,
  apiKey?: string
): Promise<{ fen: string; isLegal: boolean; source: 'gemini-vision' | 'local' }> {
  if (!apiKey) {
    return { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', isLegal: true, source: 'local' };
  }

  try {
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a high-precision chess computer vision system.
Analyze this physical chessboard image. Identify the exact square of every piece (White and Black).
Output ONLY the valid FEN string representing the board state.
Do not output markdown, formatting, or commentary. Output ONLY the FEN string.`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', isLegal: true, source: 'local' };
    }

    const json = await res.json();
    const candidateFen = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Validate legality with chess.js
    new Chess(candidateFen);
    return { fen: candidateFen, isLegal: true, source: 'gemini-vision' };
  } catch {
    return { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', isLegal: true, source: 'local' };
  }
}
