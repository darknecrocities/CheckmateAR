import { Point2D, Matrix3x3 } from '../../types/vision';

/**
 * Computes the determinant of a 3x3 matrix.
 */
export function determinant3x3(m: Matrix3x3): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

/**
 * Computes the inverse of a 3x3 matrix.
 */
export function invert3x3(m: Matrix3x3): Matrix3x3 {
  const det = determinant3x3(m);
  if (Math.abs(det) < 1e-9) {
    throw new Error('Singular matrix cannot be inverted.');
  }
  const invDet = 1.0 / det;

  return [
    [
      (m[1][1] * m[2][2] - m[1][2] * m[2][1]) * invDet,
      (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet,
      (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet,
    ],
    [
      (m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet,
      (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet,
      (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invDet,
    ],
    [
      (m[1][0] * m[2][1] - m[1][1] * m[2][0]) * invDet,
      (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invDet,
      (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invDet,
    ],
  ];
}

/**
 * Applies a 3x3 projective homography transformation to a 2D point.
 */
export function transformPoint(m: Matrix3x3, p: Point2D): Point2D {
  const x = m[0][0] * p.x + m[0][1] * p.y + m[0][2];
  const y = m[1][0] * p.x + m[1][1] * p.y + m[1][2];
  const w = m[2][0] * p.x + m[2][1] * p.y + m[2][2];

  if (Math.abs(w) < 1e-9) {
    return { x, y };
  }
  return { x: x / w, y: y / w };
}

/**
 * Computes 3x3 homography matrix mapping 4 unit-square or canonical points to 4 target points.
 * Uses Direct Linear Transformation (DLT) with normalized equations.
 */
export function computeHomography(src: [Point2D, Point2D, Point2D, Point2D], dst: [Point2D, Point2D, Point2D, Point2D]): Matrix3x3 {
  // Set up 8 linear equations for 8 unknown parameters of H (with H[2][2] = 1)
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const s = src[i];
    const d = dst[i];
    // x equation: h00*sx + h01*sy + h02 - h20*sx*dx - h21*sy*dx = dx
    A.push([s.x, s.y, 1, 0, 0, 0, -s.x * d.x, -s.y * d.x]);
    b.push(d.x);
    // y equation: h10*sx + h11*sy + h12 - h20*sx*dy - h21*sy*dy = dy
    A.push([0, 0, 0, s.x, s.y, 1, -s.x * d.y, -s.y * d.y]);
    b.push(d.y);
  }

  // Solve 8x8 linear system using Gaussian elimination with partial pivoting
  const h = solveLinearSystem8x8(A, b);

  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1.0],
  ];
}

/**
 * Solves an 8x8 system of linear equations A * x = b.
 */
function solveLinearSystem8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) {
      continue;
    }

    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Canonical board size constant: 800 x 800 units (100 units per square)
 */
export const CANONICAL_BOARD_SIZE = 800;
export const CANONICAL_SQUARE_SIZE = 100;

/**
 * Returns canonical corners for a 800x800 board.
 */
export function getCanonicalBoardCorners(): [Point2D, Point2D, Point2D, Point2D] {
  return [
    { x: 0, y: 0 },
    { x: CANONICAL_BOARD_SIZE, y: 0 },
    { x: CANONICAL_BOARD_SIZE, y: CANONICAL_BOARD_SIZE },
    { x: 0, y: CANONICAL_BOARD_SIZE },
  ];
}
