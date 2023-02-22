/*!
 * Copyright 2023 Cognite AS
 */
import { MetricsLogger } from './MetricsLogger';
export class SessionLogger {
  private _wasPreviousAnimationFrameRendered = false;
  private _renderedFramesPerCameraMovement = 0;
  private _renderedFramesStartTime = 0;
  private _averageFpsPerMovementSum = 0;
  private _movementsCount = 0;
  private _canvasVisibility = true;
  private _sessionStartTime: number;

  private _isDisposed = false;

  constructor() {
    document.addEventListener('visibilitychange', this.onRevealPageVisibilityChange);
    this._sessionStartTime = Date.now();
  }

  updateCanvasVisibility(isCanvasVisible: boolean): void {
    if (this._canvasVisibility && !isCanvasVisible && !this._isDisposed) {
      this.trackSessionEnded();
    }

    if (!this._canvasVisibility && isCanvasVisible) {
      this._sessionStartTime = Date.now();
    }

    this._canvasVisibility = isCanvasVisible;
  }

  tickCurrentAnimationFrame(isRendered: boolean): void {
    if (!isRendered) {
      const movementFps = this.calculateAverageFpsForCurrentMovement();

      if (movementFps) {
        this.countCurrentCameraMovement(movementFps);
      }

      this.resetCurrentCameraMovement();
    }

    this.countCurrentRenderedFrame();
  }

  dispose(): void {
    document.removeEventListener('visibilitychange', this.onRevealPageVisibilityChange);
    this.trackSessionEnded();

    this._isDisposed = true;
  }

  private countCurrentCameraMovement(movementFps: number) {
    this._averageFpsPerMovementSum += movementFps;
    this._movementsCount++;
  }

  private countCurrentRenderedFrame() {
    if (this._wasPreviousAnimationFrameRendered) {
      this._renderedFramesPerCameraMovement++;
    } else {
      this._renderedFramesStartTime = Date.now();
      this._wasPreviousAnimationFrameRendered = true;
    }
  }

  private resetCurrentCameraMovement() {
    this._renderedFramesPerCameraMovement = 0;
    this._wasPreviousAnimationFrameRendered = false;
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

  private trackSessionEnded(): void {
    if (this._isDisposed) return;

    const eventMetadata: { averageFramerate?: number; sessionTime: number } = {
      sessionTime: Date.now() - this._sessionStartTime
    };
    const fps = this.calculateAverageSessionFps();

    if (fps) {
      eventMetadata.averageFramerate = fps;
    }

    MetricsLogger.trackEvent('sessionEnded', eventMetadata);
  }

  private readonly onRevealPageVisibilityChange = () => {
    if (!this._canvasVisibility) return;

    if (document.visibilityState === 'hidden') {
      this.trackSessionEnded();
    }

    if (document.visibilityState === 'visible') {
      this._sessionStartTime = Date.now();
    }
  };
}
