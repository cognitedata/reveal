import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { colorToHex } from '../../base/utilities/colors/colorToHex';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { Sprite, CanvasTexture, SpriteMaterial, type PerspectiveCamera } from 'three';
import { type CircleMarkerDomainObject } from './CircleMarkerDomainObject';
import { type CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { type CustomObjectIntersectInput, type CustomObjectIntersection } from '@cognite/reveal';

const TEXTURE_SIZE = 200;
const CANVAS_PADDING = 1; // To avoid artifacts on the edge when drawing

export class CircleMarkerView extends GroupThreeView<CircleMarkerDomainObject> {
  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry)) {
      this.updateGeometry();
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.renderStyle, Changes.color)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
  }

  public override beforeRender(camera: PerspectiveCamera): void {
    super.beforeRender(camera);

    const { domainObject, object, style } = this;

    let size = 2 * domainObject.radius;
    const maxDistance = style.maxDistanceForSizeAdjustments;
    if (maxDistance !== undefined && maxDistance > 0) {
      // This will make the size smaller when it is close to the camera,
      // in order to not blow up the size when it come very close to the camera
      const distanceToCamera = camera.position.distanceTo(domainObject.position);
      if (distanceToCamera < maxDistance) {
        const fraction = distanceToCamera / maxDistance;
        size *= fraction;
      }
    }
    if (object.scale.x !== size) {
      object.scale.setScalar(size);
      object.updateMatrixWorld();
    }
  }

  protected override get style(): CircleMarkerRenderStyle {
    return super.style as CircleMarkerRenderStyle;
  }

  protected override addChildren(): void {
    const { domainObject, style } = this;
    const solidColor = colorToHex(domainObject.color, style.solidOpacity);
    const lineColor = colorToHex(style.lineColor);

    const texture = createTexture(TEXTURE_SIZE, solidColor, lineColor, style.lineWidth);
    const material = new SpriteMaterial({ map: texture, depthTest: style.depthTest });
    const sprite = new Sprite(material);
    sprite.updateMatrixWorld();
    this.addChild(sprite);
    this.updateGeometry();
  }

  public override intersectIfCloser(
    _intersectInput: CustomObjectIntersectInput,
    _closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    return undefined; // CircleMarker is not pick-able
  }

  private updateGeometry(): void {
    const { domainObject, object } = this;
    if (object === undefined || this.isEmpty) {
      return;
    }
    object.position.copy(domainObject.position);
    object.scale.setScalar(domainObject.radius * 2);
    object.updateMatrixWorld();
  }
}

function createTexture(
  textureSize: number,
  solidColor: string,
  lineColor: string,
  lineWidth: number
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;

  const center = textureSize / 2;
  const radius = textureSize / 2 - lineWidth - CANVAS_PADDING;
  const context = canvas.getContext('2d');

  if (context !== null) {
    // If context is null, we cannot draw anything
    // This will happen when having unit test in the Views, since the views doesn't assume
    // there is a browser. It will make the unit test more realistic.

    context.beginPath();
    context.fillStyle = solidColor;
    context.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI);
    context.fill();

    if (lineWidth > 0) {
      context.beginPath();
      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;
      context.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI);
      context.stroke();
    }
  }
  return new CanvasTexture(canvas);
}
