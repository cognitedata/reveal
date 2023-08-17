import { QueryClient } from '@tanstack/react-query';
import * as THREE from 'three';

import {
  AnnotationIdPointCloudObjectCollection,
  Cognite3DViewer,
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  DefaultNodeAppearance,
  DefaultPointCloudAppearance,
  Image360Annotation,
  Image360Collection,
  InvertedNodeCollection,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

import { SmartOverlayTool } from './tools/SmartOverlayTool';
import {
  is360ImageCollection,
  getAnnotationByAssetId,
  fetchAssetNodeCollection,
} from './utils';

export class StylingState {
  private _lastStyledImageAnnotations: Image360Annotation[] = [];

  constructor(
    private _model: CogniteModel | Image360Collection,
    private _sdk: CogniteClient,
    private _viewer: Cognite3DViewer,
    private _queryClient: QueryClient,
    private _overlayTool: SmartOverlayTool
  ) {}

  resetStyles() {
    this._viewer.models.forEach((modelObject) => {
      this.removeAllStyles(modelObject);
    });
    this._viewer.get360ImageCollections().forEach((collection) =>
      collection.setDefaultAnnotationStyle({
        color: undefined,
        visible: undefined,
      })
    );

    this._lastStyledImageAnnotations.forEach((a) => a.setColor(undefined));

    this._lastStyledImageAnnotations = [];
  }

  updateState(
    selectedAssetId: number | undefined,
    assetDetailsExpanded: boolean,
    labelsVisibility: boolean,
    assetHighlightMode: boolean,
    secondaryModels: (CogniteCadModel | CognitePointCloudModel)[]
  ) {
    const model = this._model;
    if (this._viewer === undefined || model === undefined) {
      return;
    }

    const isModelAdded =
      is360ImageCollection(model) ||
      this._viewer.models.some(
        ({ modelId: tmId, revisionId: trId }) =>
          model.modelId === tmId && model.revisionId === trId
      );
    if (!isModelAdded) {
      return;
    }

    this.resetStyles();

    if (selectedAssetId) {
      if (assetDetailsExpanded) {
        this.ghostAsset(model, selectedAssetId, secondaryModels);
        this._overlayTool.visible = false;
      } else {
        this._overlayTool.visible = labelsVisibility;
        if (assetHighlightMode) {
          this.highlightAssetMappedNodes(model);
        }
        this.highlightAsset(model, selectedAssetId);
      }
    } else {
      if (assetHighlightMode) {
        this.highlightAssetMappedNodes(model);
      }
      this._overlayTool.visible = labelsVisibility;
    }
  }

  private async ghostAsset(
    threeDModel: CogniteModel | Image360Collection,
    assetId: number,
    secondaryModels?: (CogniteCadModel | CognitePointCloudModel)[]
  ) {
    if (threeDModel instanceof CogniteCadModel) {
      const assetNodes = await fetchAssetNodeCollection(
        this._sdk,
        this._queryClient,
        threeDModel,
        assetId
      );

      threeDModel.removeAllStyledNodeCollections();
      threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      threeDModel.assignStyledNodeCollection(
        assetNodes,
        DefaultNodeAppearance.Default
      );
    }

    if (threeDModel instanceof CognitePointCloudModel) {
      threeDModel.setDefaultPointCloudAppearance({
        color: new THREE.Color(0.067, 0.067, 0.067),
      });

      if (assetId !== undefined) {
        const annotation = await getAnnotationByAssetId(
          this._sdk,
          threeDModel,
          assetId
        );
        if (annotation === undefined) {
          return;
        }
        const annotationId = annotation.id;

        const colorBoundingBoxObject =
          new AnnotationIdPointCloudObjectCollection([annotationId]);
        const colorAppearance = { color: new THREE.Color('rgb(0, 0, 0)') };
        threeDModel.assignStyledObjectCollection(
          colorBoundingBoxObject,
          colorAppearance
        );
      }
    }

    if (is360ImageCollection(threeDModel)) {
      await this.highlight360Asset(assetId, threeDModel);
    }

    secondaryModels?.forEach((model) => {
      if (model instanceof CogniteCadModel) {
        model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      } else if (model instanceof CognitePointCloudModel) {
        model.setDefaultPointCloudAppearance({
          color: new THREE.Color('#111111'),
        });
      }
    });
  }

  private removeAllStyles(threeDModel: CogniteModel) {
    if (threeDModel instanceof CogniteCadModel) {
      threeDModel.removeAllStyledNodeCollections();
      threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    }

    if (threeDModel instanceof CognitePointCloudModel) {
      threeDModel.removeAllStyledObjectCollections();
      threeDModel.setDefaultPointCloudAppearance(DefaultPointCloudAppearance);
    }
  }

  private async highlightAsset(
    threeDModel: CogniteModel | Image360Collection,
    assetId: number
  ) {
    if (threeDModel instanceof CogniteCadModel) {
      const assetNodes = await fetchAssetNodeCollection(
        this._sdk,
        this._queryClient,
        threeDModel,
        assetId
      );

      threeDModel.assignStyledNodeCollection(
        assetNodes,
        DefaultNodeAppearance.Highlighted
      );
    }

    if (threeDModel instanceof CognitePointCloudModel) {
      const annotation = await getAnnotationByAssetId(
        this._sdk,
        threeDModel,
        assetId
      );
      if (annotation === undefined) {
        return;
      }
      const annotationId = annotation.id;

      const colorBoundingBoxObject = new AnnotationIdPointCloudObjectCollection(
        [annotationId]
      );

      const colorAppearance = { color: new THREE.Color(0.3, 0.42, 0.95) };
      threeDModel.assignStyledObjectCollection(
        colorBoundingBoxObject,
        colorAppearance
      );
    }

    if (is360ImageCollection(threeDModel)) {
      await this.highlight360Asset(assetId, threeDModel);
    }
  }

  private async highlightAssetMappedNodes(
    threeDModel: CogniteModel | Image360Collection
  ) {
    if (threeDModel instanceof CogniteCadModel) {
      const assetNodeCollection = await fetchAssetNodeCollection(
        this._sdk,
        this._queryClient,
        threeDModel
      );
      const nonMappedNodeCollection = new InvertedNodeCollection(
        threeDModel,
        assetNodeCollection
      );

      threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
      threeDModel.assignStyledNodeCollection(nonMappedNodeCollection, {
        color: new THREE.Color(30, 30, 30),
      });
    }

    if (threeDModel instanceof CognitePointCloudModel) {
      // TODO: functionality to be added here in a separate PR
      return;
    }

    if (is360ImageCollection(threeDModel)) {
      // TODO: same as above
      return;
    }
  }

  private async highlight360Asset(
    assetId: number,
    threeDModel: Image360Collection
  ): Promise<void> {
    const annotationInfo = await threeDModel.findImageAnnotations({
      assetRef: { id: assetId },
    });

    if (annotationInfo.length === 0) {
      return;
    }

    annotationInfo.forEach((info) =>
      info.annotation.setColor(new THREE.Color('rgb(150, 150, 242)'))
    );

    this._lastStyledImageAnnotations = annotationInfo.map((i) => i.annotation);
  }
}
