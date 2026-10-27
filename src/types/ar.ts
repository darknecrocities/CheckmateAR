import { Point2D } from './vision';
import { SquareCoord } from './chess';

export type MoveCategory = 'best' | 'alternative' | 'threat' | 'tactical' | 'user';

export interface ARPathSegment {
  points: Point2D[];
  arrowHeadAngle: number;
}

export interface ARMoveAnnotation {
  id: string;
  category: MoveCategory;
  fromSquare: SquareCoord;
  toSquare: SquareCoord;
  fromPolygon: [Point2D, Point2D, Point2D, Point2D];
  toPolygon: [Point2D, Point2D, Point2D, Point2D];
  arrowPath: ARPathSegment;
  isKnightLPath: boolean;
  pillPosition: Point2D;
  pillLabel: string; // e.g. "Nf6 +0.26"
  scoreText: string;
  color: string;
  opacity: number;
}

export interface ARHudState {
  title: string;
  subtitle: string;
  depthText: string;
  evalText: string;
  isCheckmateWarning: boolean;
  statusMessage?: string;
}
