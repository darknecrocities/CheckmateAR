import { SquareCoord } from '../../types/chess';
import { DetectedSquare } from '../../types/vision';

export interface PhysicalMoveCandidate {
  from: SquareCoord;
  to: SquareCoord;
  confidence: number;
  timestamp: number;
}

export class MoveDifferenceTracker {
  private previousSquares: Record<SquareCoord, DetectedSquare> | null = null;
  private candidateMove: PhysicalMoveCandidate | null = null;
  private candidateCount: number = 0;
  private readonly requiredStableFrames: number = 3;

  /**
   * Resets internal tracking state.
   */
  public reset(): void {
    this.previousSquares = null;
    this.candidateMove = null;
    this.candidateCount = 0;
  }

  /**
   * Compares the latest frame's squares against the previous stable state.
   * Returns a confirmed physical move if the delta is consistent across stable frames.
   */
  public processFrame(
    currentSquares: Record<SquareCoord, DetectedSquare>
  ): PhysicalMoveCandidate | null {
    if (!this.previousSquares) {
      this.previousSquares = currentSquares;
      return null;
    }

    const vacatedSquares: SquareCoord[] = [];
    const populatedSquares: SquareCoord[] = [];

    const coords = Object.keys(currentSquares) as SquareCoord[];
    for (const coord of coords) {
      const prev = this.previousSquares[coord];
      const curr = currentSquares[coord];

      if (!prev || !curr) continue;

      // Check transition: Occupied -> Empty
      if (prev.isOccupied && !curr.isOccupied && curr.occupancyConfidence > 0.8) {
        vacatedSquares.push(coord);
      }
      // Check transition: Empty -> Occupied OR change in piece color (capture)
      else if (!prev.isOccupied && curr.isOccupied && curr.occupancyConfidence > 0.8) {
        populatedSquares.push(coord);
      } else if (
        prev.isOccupied &&
        curr.isOccupied &&
        prev.detectedColor &&
        curr.detectedColor &&
        prev.detectedColor !== curr.detectedColor
      ) {
        // Capture: replaced opponent piece
        populatedSquares.push(coord);
      }
    }

    // A standard physical move vacates exactly one square and occupies another
    if (vacatedSquares.length === 1 && populatedSquares.length === 1) {
      const from = vacatedSquares[0];
      const to = populatedSquares[0];

      if (
        this.candidateMove &&
        this.candidateMove.from === from &&
        this.candidateMove.to === to
      ) {
        this.candidateCount++;
        if (this.candidateCount >= this.requiredStableFrames) {
          // Confirmed stable move
          const confirmed: PhysicalMoveCandidate = {
            from,
            to,
            confidence: 0.95,
            timestamp: Date.now(),
          };
          this.previousSquares = currentSquares;
          this.candidateMove = null;
          this.candidateCount = 0;
          return confirmed;
        }
      } else {
        this.candidateMove = {
          from,
          to,
          confidence: 0.8,
          timestamp: Date.now(),
        };
        this.candidateCount = 1;
      }
    } else {
      // Possible hand in frame or no move
      this.candidateCount = 0;
      this.candidateMove = null;
    }

    return null;
  }
}
