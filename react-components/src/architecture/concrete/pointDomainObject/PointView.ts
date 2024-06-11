/*!
 * Copyright 2024 Cognite AS
 */
import { Mesh, MeshPhongMaterial, SphereGeometry } from 'three';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type PointDomainObject } from './PointDomainObject';
import { type PointRenderStyle } from './PointRenderStyle';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export class PointView extends GroupThreeView {
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

  public override get domainObject(): PointDomainObject {
    return super.domainObject as PointDomainObject;
  }

  protected override get style(): PointRenderStyle {
    return super.style as PointRenderStyle;
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected, Changes.color, Changes.geometry, Changes.renderStyle)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
  }
}
