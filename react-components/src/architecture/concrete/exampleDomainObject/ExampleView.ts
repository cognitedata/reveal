/*!
 * Copyright 2024 Cognite AS
 */

import { Mesh, MeshPhongMaterial, Sphere, SphereGeometry, Vector3 } from 'three';
import { type ExampleDomainObject } from './ExampleDomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type ExampleRenderStyle } from './ExampleRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';

export class ExampleView extends GroupThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get domainObject(): ExampleDomainObject {
    return super.domainObject as ExampleDomainObject;
  }

  protected override get style(): ExampleRenderStyle {
    return super.style as ExampleRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected, Changes.renderStyle, Changes.color)) {
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
    const { domainObject, style } = this;

    const geometry = new SphereGeometry(style.radius, 32, 16);
    const material = new MeshPhongMaterial({
      color: domainObject.color,
      emissive: WHITE_COLOR,
      emissiveIntensity: domainObject.isSelected ? 0.4 : 0.0,
      shininess: 5,
      opacity: style.opacity,
      transparent: true,
      depthTest: style.depthTest
    });
    const sphere = new Mesh(geometry, material);
    const center = domainObject.center.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    sphere.position.copy(center);
    this.addChild(sphere);
  }

  // Do actually not need this because the base class takes care of this
  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject, style } = this;

    const ray = intersectInput.raycaster.ray;
    const center = domainObject.center.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const sphere = new Sphere(center, style.radius);
    const point = ray.intersectSphere(sphere, new Vector3());
    if (point === null) {
      return undefined;
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (!intersectInput.isVisible(point)) {
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
