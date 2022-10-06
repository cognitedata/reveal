import { Camera, Ray, Vector2, Vector3, WebGLRenderer, MathUtils } from 'three';
import { DEFAULT_PICK_WINDOW_SIZE } from '@reveal/rendering';
import { PointCloudOctree } from './PointCloudOctree';
import { PickPoint } from '../types/types';
import { IPickState, PickParams, PointCloudOctreePickerHelper } from './PointCloudOctreePickerHelper';

export { PickParams };

export class PointCloudOctreePicker {
  private static readonly helperVec3 = new Vector3();
  private pickState: IPickState | undefined;
  private readonly _renderer: WebGLRenderer;
  private readonly _pickerHelper: PointCloudOctreePickerHelper;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
    this._pickerHelper = new PointCloudOctreePickerHelper(renderer);
  }

  dispose(): void {
    if (this.pickState) {
      this.pickState.material.dispose();
      this.pickState.renderTarget.dispose();
    }
  }

  pick(camera: Camera, ray: Ray, octrees: PointCloudOctree[], params: Partial<PickParams> = {}): PickPoint | null {
    if (octrees.length === 0) {
      return null;
    }
    const pickState = this.pickState ? this.pickState : (this.pickState = PointCloudOctreePickerHelper.getPickState());
    const pickMaterial = pickState.material;

    try {
      const renderSize = this._renderer.getDrawingBufferSize(new Vector2());
      PointCloudOctreePickerHelper.updatePickRenderTarget(this.pickState, renderSize.x, renderSize.y);

      const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.

      if (params.pixelPosition) {
        pixelPosition.copy(params.pixelPosition);
      } else {
        pixelPosition.addVectors(camera.position, ray.direction).project(camera);
        pixelPosition.x = (pixelPosition.x + 1) * renderSize.x * 0.5;
        pixelPosition.y = (pixelPosition.y + 1) * renderSize.y * 0.5;
      }

      const pickWndSize = params.pickWindowSize ?? DEFAULT_PICK_WINDOW_SIZE;
      const halfPickWndSize = (pickWndSize - 1) / 2;
      const x = Math.floor(MathUtils.clamp(pixelPosition.x - halfPickWndSize, 0, renderSize.x));
      const y = Math.floor(MathUtils.clamp(pixelPosition.y - halfPickWndSize, 0, renderSize.y));

      this._pickerHelper.prepareRender(x, y, pickWndSize, pickMaterial, pickState);
      const renderedNodes = this._pickerHelper.render(camera, pickMaterial, octrees, ray, pickState, params);

      // Read back image and decode hit point
      const pixels = this._pickerHelper.readPixels(x, y, pickWndSize);
      const hit = PointCloudOctreePickerHelper.findHit(pixels, pickWndSize, renderedNodes, camera);

      return PointCloudOctreePickerHelper.getPickPoint(hit, renderedNodes);
    } finally {
      // Cleanup
      pickMaterial.clearVisibleNodeTextureOffsets();
      this._pickerHelper.resetState();
    }
  }
}
