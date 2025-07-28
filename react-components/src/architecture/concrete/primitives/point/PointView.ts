import { Mesh, MeshPhongMaterial, Sphere, SphereGeometry, Vector3 } from 'three';
import { type PointDomainObject } from './PointDomainObject';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { GroupThreeView } from '../../../base/views/GroupThreeView';
import { WHITE_COLOR } from '../../../base/utilities/colors/colorUtils';
import { type PointRenderStyle } from './PointRenderStyle';
import { type DomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';

export class PointView extends GroupThreeView<PointDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): PointRenderStyle {
    return super.style as PointRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected, Changes.renderStyle, Changes.color, Changes.clipping)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get useDepthTest(): boolean {
    return this.style.depthTest;
  }

  protected override addChildren(): void {
    const { domainObject, style, renderTarget } = this;

    const geometry = new SphereGeometry(domainObject.radius, 32, 16);
    const material = new MeshPhongMaterial({
      color: domainObject.color,
      emissive: WHITE_COLOR,
      emissiveIntensity: domainObject.isSelected ? 0.4 : 0.0,
      shininess: 5,
      opacity: style.opacity,
      transparent: true,
      depthTest: style.depthTest
    });
    material.clippingPlanes = renderTarget.getGlobalClippingPlanes();
    const sphere = new Mesh(geometry, material);
    const center = domainObject.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    sphere.position.copy(center);
    this.addChild(sphere);
  }

  // Do actually not need this because the base class takes care of this
  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;

    const ray = intersectInput.raycaster.ray;
    const center = domainObject.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const sphere = new Sphere(center, domainObject.radius);
    const point = ray.intersectSphere(sphere, new Vector3());
    if (point === null) {
      return undefined;
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      customObject: this,
      domainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }
}
