/*
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export class AnimationLoopHandler {
  private _animationFrameHandle?: number;
  private _animationFrameDelegate?: (deltaTime: number) => void;

  setOnAnimationFrameListener(callback: (deltaTime: number) => void) {
    this._animationFrameDelegate = callback;
  }

  public start(): boolean {
    if(this._animationFrameHandle === undefined) {
      const clock = new THREE.Clock();
      const animationLoop = () => {
        this._animationFrameHandle = requestAnimationFrame(animationLoop);
        if (this._animationFrameDelegate) {
          this._animationFrameDelegate(clock.getDelta());
        }
      }
      this._animationFrameHandle = requestAnimationFrame(animationLoop);
      return true;
    }
    return false;
  }

  public dispose() {
    if(this._animationFrameHandle !== undefined) {
      cancelAnimationFrame(this._animationFrameHandle);
    }
  }
}
