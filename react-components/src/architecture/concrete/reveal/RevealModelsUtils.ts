import {
  type AddModelOptions,
  CogniteCadModel,
  CognitePointCloudModel,
  type DataSourceType,
  type Image360Collection,
  isClassicPointCloudModel,
  isDMPointCloudModel
} from '@cognite/reveal';
import { CadDomainObject } from './cad/CadDomainObject';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';
import { type PointCloud, type RevealModel } from './RevealTypes';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type AddImage360CollectionOptions } from '../../..';
import { type RevealDomainObject } from './RevealDomainObject';
import { type CogniteClient } from '@cognite/sdk';

export class RevealModelsUtils {
  public static getByRevealModel(
    root: RootDomainObject,
    model: RevealModel
  ): RevealDomainObject | undefined {
    if (model instanceof CogniteCadModel) {
      for (const child of root.getDescendantsByType(CadDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else if (model instanceof CognitePointCloudModel) {
      for (const child of root.getDescendantsByType(PointCloudDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else {
      for (const child of root.getDescendantsByType(Image360CollectionDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    }
    return undefined;
  }

  static async getName(sdk: CogniteClient, model: CogniteCadModel | PointCloud): Promise<string> {
    if (model instanceof CogniteCadModel) {
      const model3D = await sdk.models3D.retrieve(model.modelId);
      return model3D.name;
    }
    if (model instanceof CognitePointCloudModel) {
      if (isDMPointCloudModel(model)) {
        return model.modelIdentifier.revisionExternalId;
      } else if (isClassicPointCloudModel(model)) {
        const model3D = await sdk.models3D.retrieve(model.modelIdentifier.modelId);
        return model3D.name;
      }
    }
    throw new Error('Unsupported model in getName');
  }

  public static async addCadModel(
    renderTarget: RevealRenderTarget,
    options: AddModelOptions
  ): Promise<CogniteCadModel> {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    const model = await renderTarget.viewer.addCadModel(options);
    const domainObject = new CadDomainObject(model);
    root.addChildInteractive(domainObject);
    if (model.visible) {
      domainObject.setVisibleInteractive(true);
    }

    try {
      domainObject.name = await RevealModelsUtils.getName(renderTarget.rootDomainObject.sdk, model);
    } catch (error) {
      console.error('Can not get Cad model name', error);
    }
    return model;
  }

  public static async addPointCloud(
    renderTarget: RevealRenderTarget,
    options: AddModelOptions<DataSourceType>
  ): Promise<PointCloud> {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    const model = await renderTarget.viewer.addPointCloudModel(options);
    const domainObject = new PointCloudDomainObject(model);
    root.addChildInteractive(domainObject);
    if (model.visible) {
      domainObject.setVisibleInteractive(true);
    }

    try {
      domainObject.name = await RevealModelsUtils.getName(renderTarget.rootDomainObject.sdk, model);
    } catch (error) {
      console.error('Can not get model name', error);
    }
    return model;
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
