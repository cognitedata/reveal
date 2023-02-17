/*!
 * Copyright 2023 Cognite AS
 */
import { MetricsLogger } from './MetricsLogger';
export class FpsLogger {
  private _wasPreviousAnimationFrameRendered = false;
  private _renderedFramesPerCameraMovement = 0;
  private _renderedFramesStartTime = 0;
  private _averageFpsPerMovementSum = 0;
  private _movementsCount = 0;
  private _canvasVisibility = true;

  private _isDisposed = false;

  constructor() {
    document.addEventListener('visibilitychange', this.onRevealSessionEnd);
  }

  updateCanvasVisibility(isCanvasVisible: boolean): void {
    if (this._canvasVisibility && !isCanvasVisible && !this._isDisposed) {
      this.trackAverageSessionFps();
    }

    this._canvasVisibility = isCanvasVisible;
  }

  tickCurrentAnimationFrame(isRendered: boolean): void {
    if (!isRendered) {
      const movementFps = this.calculateAverageFpsForCurrentMovement();

      if (movementFps) {
        this._averageFpsPerMovementSum += movementFps;
        this._movementsCount++;
      }

      this._renderedFramesPerCameraMovement = 0;
      this._wasPreviousAnimationFrameRendered = false;
    }

    if (this._wasPreviousAnimationFrameRendered) {
      this._renderedFramesPerCameraMovement++;
    } else {
      this._renderedFramesStartTime = Date.now();
      this._wasPreviousAnimationFrameRendered = true;
    }
  }

  dispose(): void {
    this._isDisposed = true;
    document.removeEventListener('visibilitychange', this.onRevealSessionEnd);

    this.trackAverageSessionFps();
  }

  private calculateAverageFpsForCurrentMovement(): number | undefined {
    if (this._wasPreviousAnimationFrameRendered && this._renderedFramesPerCameraMovement > 30) {
      const currentSegmentTime = Date.now() - this._renderedFramesStartTime;
      const currentSegmentFPS = this._renderedFramesPerCameraMovement * (1 / currentSegmentTime) * 1000;

      return currentSegmentFPS;
    }

    return undefined;
  }

  private calculateAverageSessionFps(): number | undefined {
    const fps = this._averageFpsPerMovementSum / this._movementsCount;
    return Number.isFinite(fps) ? fps : undefined;
  }

  private trackAverageSessionFps(): void {
    const fps = this.calculateAverageSessionFps();

    if (fps) {
      MetricsLogger.trackEvent('averageFramerate', { averageSessionFramerate: fps });
    }
  }

  private readonly onRevealSessionEnd = () => {
    if (document.visibilityState === 'hidden' && this._canvasVisibility) {
      this.trackAverageSessionFps();
    }
  };
}
