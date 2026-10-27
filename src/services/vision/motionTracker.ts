import { Accelerometer } from 'expo-sensors';
import { QuadPoints, Point2D } from '../../types/vision';

export type MotionCallback = (offset: Point2D) => void;

export class CameraMotionTracker {
  private subscription: { remove: () => void } | null = null;
  private prevAccel = { x: 0, y: 0, z: 0 };
  private offset: Point2D = { x: 0, y: 0 };
  private callback: MotionCallback | null = null;

  /**
   * Starts tracking phone camera motion at 60Hz.
   */
  public start(callback: MotionCallback): void {
    this.callback = callback;
    Accelerometer.setUpdateInterval(16); // 16ms ~ 60 FPS

    this.subscription = Accelerometer.addListener((data) => {
      // High-pass filter to isolate camera pan/tilt delta
      const dx = (data.x - this.prevAccel.x) * 45;
      const dy = (data.y - this.prevAccel.y) * 45;

      this.prevAccel = data;

      // Decay offset back to zero to prevent drift
      this.offset.x = this.offset.x * 0.92 - dx;
      this.offset.y = this.offset.y * 0.92 + dy;

      if (this.callback) {
        this.callback(this.offset);
      }
    });
  }

  /**
   * Stops sensor updates and frees resources.
   */
  public stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * Applies motion offset to a set of 4 board corners.
   */
  public static applyOffsetToCorners(corners: QuadPoints, offset: Point2D): QuadPoints {
    return {
      topLeft: { x: corners.topLeft.x + offset.x, y: corners.topLeft.y + offset.y },
      topRight: { x: corners.topRight.x + offset.x, y: corners.topRight.y + offset.y },
      bottomRight: { x: corners.bottomRight.x + offset.x, y: corners.bottomRight.y + offset.y },
      bottomLeft: { x: corners.bottomLeft.x + offset.x, y: corners.bottomLeft.y + offset.y },
    };
  }
}
