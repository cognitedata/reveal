import * as THREE from 'three';
import { Cognite3DViewer } from "@cognite/reveal";
import dat from 'dat.gui';

export class CameraUI {
  private readonly _viewer: Cognite3DViewer;

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    const actions = {
      saveCameraToUrl: () => this.saveCameraToUrl(),
      restoreCameraFromUrl: () => this.restoreCameraFromUrl()
    };

    ui.add(actions, 'saveCameraToUrl').name('Save camera to URL');
    ui.add(actions, 'restoreCameraFromUrl').name('Restore camera from URL');

    if (this.hasCameraInUrl()) {
      // Hack - since adding a model will load a camera in our examples
      // we just wait a second before applying it.
      setTimeout(() => this.restoreCameraFromUrl(), 1000);
    }
  }

  private saveCameraToUrl(): void {
    const position = this._viewer.cameraManager.getCameraPosition();
    const target = this._viewer.cameraManager.getCameraTarget();

    const url = new URL(window.location.href);
    url.searchParams.set('camPos', vector3ToString(position));
    url.searchParams.set('camTarget', vector3ToString(target));
    // Update URL without reloading
    window.history.replaceState(null, document.title, url.toString());
  }

  private hasCameraInUrl(): boolean {
    const url = new URL(window.location.href);
    return url.searchParams.get('camPos') !== null && url.searchParams.get('camTarget') !== null;
  }

  private restoreCameraFromUrl(): void {
    try {
      if (!this.hasCameraInUrl()) {
        throw new Error('Must provide URL parameters "camPos" and "camTarget"');
      }

      const url = new URL(window.location.href);
      const camPosParam = url.searchParams.get('camPos')!;
      const camTargetParam = url.searchParams.get('camTarget')!;
      const camPos = stringToVector3(camPosParam);
      const camTarget = stringToVector3(camTargetParam);

      this._viewer.cameraManager.setCameraPosition(camPos);
      this._viewer.cameraManager.setCameraTarget(camTarget);
    }
    catch (error) {
      alert('Could not restore camera from URL: ' + error);
    }
  }
}

function vector3ToString(v: THREE.Vector3): string {
  return `${v.x},${v.y},${v.z}`;
}

function stringToVector3(s: string): THREE.Vector3 {
  const tokens = s.split(',');
  if (tokens.length !== 3) {
    throw new Error(`Invalid vector3 string: "${s}"`);
  }
  const components = tokens.map(Number.parseFloat);
  return new THREE.Vector3(components[0], components[1], components[2]);
}