import { Accelerometer } from 'expo-sensors';
import { QuadPoints, Point2D } from '../../types/vision';

export interface MotionData {
  offset: Point2D;
  velocity: number;
  isStable: boolean;
}

export type MotionCallback = (data: MotionData) => void;

/**
 * Continuous high-frequency motion tracker for YOLO-style locked AR board tracking.
 * Uses high-pass acceleration filtering with rapid decay to prevent drift,
 * and provides stability detection for settling.
 */
export class CameraMotionTracker {
  private subscription: { remove: () => void } | null = null;
  private prevAccel = { x: 0, y: 0, z: 0 };
  private offset: Point2D = { x: 0, y: 0 };
  private velocity = 0;
  private stableFrameCount = 0;
  private callback: MotionCallback | null = null;
  private initialized = false;

  public start(callback: MotionCallback): void {
    this.callback = callback;
    Accelerometer.setUpdateInterval(32); // ~30 FPS

    this.subscription = Accelerometer.addListener((data) => {
      if (!this.initialized) {
        this.prevAccel = data;
        this.initialized = true;
        return;
      }

      // Delta acceleration
      const deltaX = (data.x - this.prevAccel.x) * 24;
      const deltaY = (data.y - this.prevAccel.y) * 24;
      this.prevAccel = data;

      // Current instant motion velocity
      this.velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (this.velocity < 1.2) {
        this.stableFrameCount++;
      } else {
        this.stableFrameCount = 0;
      }

      // Fast decay back to anchor center (0.78) to keep reticle locked without cumulative drift
      this.offset.x = this.offset.x * 0.78 - deltaX;
      this.offset.y = this.offset.y * 0.78 + deltaY;

      // Clamp max displacement
      const maxDisplacement = 45;
      this.offset.x = Math.max(-maxDisplacement, Math.min(maxDisplacement, this.offset.x));
      this.offset.y = Math.max(-maxDisplacement, Math.min(maxDisplacement, this.offset.y));

      const isStable = this.stableFrameCount >= 8; // Stable for ~250ms

      if (this.callback) {
        this.callback({
          offset: { x: this.offset.x, y: this.offset.y },
          velocity: this.velocity,
          isStable,
        });
      }
    });
  }

  public stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.initialized = false;
    this.offset = { x: 0, y: 0 };
    this.stableFrameCount = 0;
  }

  /**
   * Applies momentary motion offset to anchor corners.
   */
  public static applyOffsetToCorners(anchor: QuadPoints, offset: Point2D): QuadPoints {
    return {
      topLeft: { x: anchor.topLeft.x + offset.x, y: anchor.topLeft.y + offset.y },
      topRight: { x: anchor.topRight.x + offset.x, y: anchor.topRight.y + offset.y },
      bottomRight: { x: anchor.bottomRight.x + offset.x, y: anchor.bottomRight.y + offset.y },
      bottomLeft: { x: anchor.bottomLeft.x + offset.x, y: anchor.bottomLeft.y + offset.y },
    };
  }
}
