import { THREE } from '@cognite/reveal';
import { Cognite3DViewer } from "@cognite/reveal";
import dat from 'dat.gui';

export class CameraUI {
  private readonly _viewer: Cognite3DViewer;

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    const params = {
      flyDuration: 5000
    };
    const actions = {
      saveCameraToUrl: () => this.saveCameraToUrl(),
      restoreCameraFromUrl: () => this.restoreCameraFromUrl(),
      flyToSavedPositionFromUrl: () => this.flyToSavedPositionFromUrl(params.flyDuration),
    };

    ui.add(actions, 'saveCameraToUrl').name('Save camera to URL');
    ui.add(actions, 'restoreCameraFromUrl').name('Restore camera from URL');
    ui.add(params, 'flyDuration', 0, 20000, 250).name('Fly duration');
    ui.add(actions, 'flyToSavedPositionFromUrl').name('Fly to saved position');

    if (this.hasCameraInUrl()) {
      // Hack - since adding a model will load a camera in our examples
      // we just wait a second before applying it.
      setTimeout(() => this.restoreCameraFromUrl(), 1000);
    }
  }

  private saveCameraToUrl(): void {
    const { position, target } = this._viewer.cameraManager.getCameraState();

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
      const { target, position } = this.getCameraStateFromUrl();
      this._viewer.cameraManager.setCameraState({ position, target });
    }
    catch (error) {
      alert('Could not restore camera from URL: ' + error);
    }
  }

  private flyToSavedPositionFromUrl(durationInMs: number, stopDistance: number = .010): void {
    try {
      const { position } = this.getCameraStateFromUrl();
      // Fake a bbox
      const bbox = new THREE.Box3().setFromCenterAndSize(position, new THREE.Vector3(0.1,0.1,0.1));
      this._viewer.cameraManager.fitCameraToBoundingBox(bbox, durationInMs, stopDistance);
    }
    catch (error) {
      alert('Could not fly to camera stored in URL: ' + error);
    }

  }

  private getCameraStateFromUrl(): { position: THREE.Vector3, target: THREE.Vector3 } {
    if (!this.hasCameraInUrl()) {
      throw new Error('Must provide URL parameters "camPos" and "camTarget"');
    }
    const url = new URL(window.location.href);
    const camPosParam = url.searchParams.get('camPos')!;
    const camTargetParam = url.searchParams.get('camTarget')!;
    const position = stringToVector3(camPosParam);
    const target = stringToVector3(camTargetParam);

    return { position, target };
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