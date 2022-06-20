import { Camera, Ray, Vector3, WebGLRenderer } from 'three';
import { DEFAULT_PICK_WINDOW_SIZE } from '../rendering/constants';
import { PointCloudOctree } from './PointCloudOctree';
import { PickPoint, PointCloudHit } from '../types/types';
import { clamp } from '../utils/math';
import { IPickState, PickParams, PointCloudOctreePickerHelper, RenderedNode } from './PointCloudOctreePickerHelper';
import { WebGLRendererStateHelper } from '@reveal/utilities';

export { PickParams };

export class PointCloudOctreePicker {
  private static readonly helperVec3 = new Vector3();
  private pickState: IPickState | undefined;

  dispose(): void {
    if (this.pickState) {
      this.pickState.material.dispose();
      this.pickState.renderTarget.dispose();
    }
  }

  pick(
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    octrees: PointCloudOctree[],
    params: Partial<PickParams> = {}
  ): PickPoint | null {
    if (octrees.length === 0) {
      return null;
    }

    const stateHelper = new WebGLRendererStateHelper(renderer);
    
    const pickState = this.pickState ? this.pickState : (this.pickState = PointCloudOctreePickerHelper.getPickState());

    const pickMaterial = pickState.material;

    const pixelRatio = renderer.getPixelRatio();
    const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio);
    const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio);
    PointCloudOctreePickerHelper.updatePickRenderTarget(this.pickState, width, height);

    const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.

    if (params.pixelPosition) {
      pixelPosition.copy(params.pixelPosition);
    } else {
      pixelPosition.addVectors(camera.position, ray.direction).project(camera);
      pixelPosition.x = (pixelPosition.x + 1) * width * 0.5;
      pixelPosition.y = (pixelPosition.y + 1) * height * 0.5;
    }

    const pickWndSize = Math.floor((params.pickWindowSize || DEFAULT_PICK_WINDOW_SIZE) * pixelRatio);
    const halfPickWndSize = (pickWndSize - 1) / 2;
    const x = Math.floor(clamp(pixelPosition.x - halfPickWndSize, 0, width));
    const y = Math.floor(clamp(pixelPosition.y - halfPickWndSize, 0, height));

    let renderedNodes: RenderedNode[];
    let hit: PointCloudHit | null;

    try {
      PointCloudOctreePickerHelper.prepareRender(renderer, stateHelper, x, y, pickWndSize, pickMaterial, pickState);

      renderedNodes = PointCloudOctreePickerHelper.render(
        renderer,
        camera,
        pickMaterial,
        octrees,
        ray,
        pickState,
        params
      );

      // Read back image and decode hit point
      const pixels = PointCloudOctreePickerHelper.readPixels(renderer, x, y, pickWndSize);
      hit = PointCloudOctreePickerHelper.findHit(pixels, pickWndSize, renderedNodes, camera);

    } finally {
      // Cleanup
      pickMaterial.clearVisibleNodeTextureOffsets();
      renderer.state.reset();
      stateHelper.resetState();
    }

    return PointCloudOctreePickerHelper.getPickPoint(hit, renderedNodes);
  }
}
