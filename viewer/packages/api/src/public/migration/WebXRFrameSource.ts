/*!
 * Copyright 2026 Cognite AS
 */

import type { Box3, Matrix4, PerspectiveCamera, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three';
import type { RenderView } from '@reveal/rendering';
import { Log } from '@reveal/logger';
import { WebXRViews } from './WebXRViews';

/**
 * What to render in one XR frame.
 */
export type WebXRFrame = {
  /** Head camera: the pose and combined frustum of all views. */
  camera: PerspectiveCamera;
  /** The XR session's framebuffer, wrapped in a render target by three.js. */
  output: WebGLRenderTarget;
  /** One view (eye) per XR view, each with a camera and a viewport in `output`. */
  views: readonly RenderView[];
  /** Size of each view, in pixels. */
  viewSize: Vector2;
  /** Camera to load geometry for. Covers more than the views, so turning the head doesn't reveal missing geometry. */
  loadingCamera: PerspectiveCamera;
  loadingCameraInMotion: boolean;
};

export type WebXRFrameSourceCallbacks = {
  /** Called when a session starts, before its first frame. */
  onSessionStart: () => void;
  /** Called after a session ended. */
  onSessionEnd: () => void;
  /** Called for every frame of the session. */
  onFrame: (time: number, xrFrame: XRFrame) => void;
};

/**
 * Connects a viewer to WebXR sessions started on its renderer with `renderer.xr.setSession()`.
 *
 * While a session is presenting, frames are driven by the session's requestAnimationFrame (via
 * `renderer.xr.setAnimationLoop`), and {@link beginFrame} provides the cameras and views to render.
 * Three.js' own XR rendering (`renderer.xr.enabled`) is turned off for the session, since Reveal renders
 * the views itself.
 */
export class WebXRFrameSource {
  private readonly _renderer: WebGLRenderer;
  private readonly _callbacks: WebXRFrameSourceCallbacks;
  private readonly _ownsRenderer: boolean;
  private readonly _views: WebXRViews;
  private _xrEnabledBeforeSession = false;
  private _isActive = false;

  /**
   * Starts listening for sessions on the renderer, and takes over immediately if one is already presenting.
   * @param renderer The viewer's renderer.
   * @param callbacks Session and frame callbacks.
   * @param ownsRenderer Whether the viewer created the renderer. If so, disposing ends an active session.
   */
  constructor(renderer: WebGLRenderer, callbacks: WebXRFrameSourceCallbacks, ownsRenderer: boolean) {
    this._renderer = renderer;
    this._callbacks = callbacks;
    this._ownsRenderer = ownsRenderer;
    this._views = new WebXRViews(renderer);

    renderer.xr.addEventListener('sessionstart', this.onSessionStart);
    renderer.xr.addEventListener('sessionend', this.onSessionEnd);
    if (renderer.xr.isPresenting) {
      // The session started before the viewer was created, so 'sessionstart' won't fire.
      this.onSessionStart();
    }
  }

  /** Whether a session is presenting, i.e. frames come from the session rather than the window. */
  get isPresenting(): boolean {
    return this._isActive && this._renderer.xr.isPresenting;
  }

  /**
   * Prepares the cameras and views for an XR frame.
   * @param xrFrame The frame passed to the session's frame callback.
   * @param sceneBoundingBox Bounding box of everything rendered, used to fit the near and far planes.
   * @param modelTransformations Current model transformations, to detect when models move relative to the viewer.
   * @returns What to render, or undefined if this frame can't be rendered (e.g. tracking is lost).
   */
  beginFrame(
    xrFrame: XRFrame,
    sceneBoundingBox: Box3,
    modelTransformations: readonly Matrix4[]
  ): WebXRFrame | undefined {
    const referenceSpace = this._renderer.xr.getReferenceSpace();
    // Without a viewer pose, three.js neither binds the XR framebuffer nor updates the view cameras.
    if (referenceSpace === null || !xrFrame.getViewerPose(referenceSpace)) {
      return undefined;
    }
    // three.js binds the session's framebuffer (wrapped in a render target) right before each XR frame.
    const output = this._renderer.getRenderTarget();
    if (output === null) {
      return undefined;
    }

    this._views.update(sceneBoundingBox);
    const loading = this._views.getLoadingCamera(modelTransformations);
    return {
      camera: this._views.headCamera,
      output,
      views: this._views.views,
      viewSize: this._views.viewSize,
      loadingCamera: loading.camera,
      loadingCameraInMotion: loading.inMotion
    };
  }

  /**
   * Stops listening for sessions. If a session is presenting, releases its frame loop, and ends it if the viewer
   * owns the renderer.
   */
  dispose(): void {
    const xr = this._renderer.xr;
    xr.removeEventListener('sessionstart', this.onSessionStart);
    xr.removeEventListener('sessionend', this.onSessionEnd);
    if (this._isActive) {
      this.deactivate();
      if (this._ownsRenderer) {
        // Nothing would render the session anymore. With an app-provided renderer, the app owns the session.
        void xr.getSession()?.end();
      }
    }
  }

  private readonly onSessionStart = (): void => {
    const xr = this._renderer.xr;
    this._isActive = true;
    this._views.reset();
    // With xr.enabled, three.js would replace the camera in every renderer.render() call, including
    // picking and other offscreen renders.
    this._xrEnabledBeforeSession = xr.enabled;
    xr.enabled = false;
    this._callbacks.onSessionStart();
    // Only sets the session's frame callback. renderer.setAnimationLoop() would also start a window loop.
    xr.setAnimationLoop(this.onXRFrame);
  };

  private readonly onSessionEnd = (): void => {
    if (!this._isActive) {
      return;
    }
    this.deactivate();
    this._callbacks.onSessionEnd();
  };

  private readonly onXRFrame = (time: number, xrFrame?: XRFrame): void => {
    if (xrFrame === undefined) {
      return;
    }
    // three.js requests the next XR frame only after this returns, so an exception would freeze the display.
    try {
      this._callbacks.onFrame(time, xrFrame);
    } catch (error) {
      Log.error('Failed to render WebXR frame', error);
    }
  };

  private deactivate(): void {
    this._isActive = false;
    this._renderer.xr.setAnimationLoop(null);
    this._renderer.xr.enabled = this._xrEnabledBeforeSession;
  }
}
