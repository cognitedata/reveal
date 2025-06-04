import { type DomainObject } from '../../base/domainObjects/DomainObject';
import {
  type AddModelOptions,
  CogniteCadModel,
  CognitePointCloudModel,
  type DataSourceType,
  type Image360Collection
} from '@cognite/reveal';
import { CadDomainObject } from './cad/CadDomainObject';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';
import { type RevealModel } from './RevealTypes';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type AddImage360CollectionOptions } from '../../..';

export class RevealModelsUtils {
  public static getByRevealModel(
    root: RootDomainObject,
    model: RevealModel
  ): DomainObject | undefined {
    if (model instanceof CogniteCadModel) {
      for (const child of root.getChildrenByType(CadDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else if (model instanceof CognitePointCloudModel) {
      for (const child of root.getChildrenByType(PointCloudDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else {
      for (const child of root.getChildrenByType(Image360CollectionDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    }
    return undefined;
  }

  public static async addModel(
    renderTarget: RevealRenderTarget,
    options: AddModelOptions
  ): Promise<CogniteCadModel> {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    return await renderTarget.viewer.addCadModel(options).then((model) => {
      const domainObject = new CadDomainObject(model);
      root.addChildInteractive(domainObject);
      if (model.visible) {
        domainObject.setVisibleInteractive(true);
      }
      return model;
    });
  }

  public static async addPointCloud(
    renderTarget: RevealRenderTarget,
    options: AddModelOptions<DataSourceType>
  ): Promise<CognitePointCloudModel<DataSourceType>> {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    return await renderTarget.viewer.addPointCloudModel(options).then((model) => {
      const domainObject = new PointCloudDomainObject(model);
      root.addChildInteractive(domainObject);
      if (model.visible) {
        domainObject.setVisibleInteractive(true);
      }
      return model;
    });
  }

  public static async addImage360Collection(
    renderTarget: RevealRenderTarget,
    options: AddImage360CollectionOptions
  ): Promise<Image360Collection<DataSourceType>> {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }

    if (options.source === 'events') {
      return await renderTarget.viewer
        .add360ImageSet('events', { site_id: options.siteId }, { preMultipliedRotation: false })
        .then((model) => {
          const domainObject = new Image360CollectionDomainObject(model);
          root.addChildInteractive(domainObject);
          if (model.getIconsVisibility()) {
            domainObject.setVisibleInteractive(true);
          }
          return model;
        });
    } else {
      return await renderTarget.viewer
        .add360ImageSet('datamodels', {
          source: options.source,
          image360CollectionExternalId: options.externalId,
          space: options.space
        })
        .then((model) => {
          const domainObject = new Image360CollectionDomainObject(model);
          root.addChildInteractive(domainObject);
          if (model.getIconsVisibility()) {
            domainObject.setVisibleInteractive(true);
          }
          return model;
        });
    }
  }

  public static remove(renderTarget: RevealRenderTarget, model: RevealModel): void {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    const domainObject = RevealModelsUtils.getByRevealModel(root, model);
    if (domainObject !== undefined) {
      domainObject.removeInteractive();
    }
  }
}
