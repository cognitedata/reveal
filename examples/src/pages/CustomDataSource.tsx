/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import { CogniteClient, HttpHeaders } from '@cognite/sdk';
import {
  Cognite3DViewer,
  Cognite3DViewerOptions,
} from '@cognite/reveal';
import * as reveal from '@cognite/reveal';

import { 
  CameraConfiguration, 
  DataSource, 
  ModelDataProvider, 
  ModelIdentifier, 
  ModelMetadataProvider, 
  NodesApiClient
} from '@cognite/reveal/extensions/datasource';

class MyDataSource implements DataSource {
  getNodesApiClient(): NodesApiClient {
    return new MyNodesApiClient();
  }
  getModelMetadataProvider(): ModelMetadataProvider {
    return new MyModelMetadataProvider();
  }
  getModelDataClient(): ModelDataProvider {
    return new MyModelDataProvider();
  }
}

class MyModelMetadataProvider implements ModelMetadataProvider {
  getModelUrl(identifier: ModelIdentifier): Promise<string> {
    // Note! identifier will always be a CdfModelIdentifier
    return Promise.resolve('/primitives');
  }
  getModelCamera(identifier: ModelIdentifier): Promise<CameraConfiguration | undefined> {
    // Note! identifier will always be a CdfModelIdentifier
    return Promise.resolve(undefined);
  }
  getModelMatrix(identifier: ModelIdentifier): Promise<THREE.Matrix4> {
    // Note! identifier will always be a CdfModelIdentifier

    // CAD models are usually stored in Z-up, while Reveal uses Y-up, so
    // we need to account for this
    const cadModelToReveal = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    
    return Promise.resolve(cadModelToReveal);
  }

}

class MyModelDataProvider implements ModelDataProvider {
  public readonly headers: HttpHeaders = {};

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const url = `${baseUrl}/${fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not fetch '${url}'`);
    }
    return response.json();
  }

  async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not fetch '${url}'`);
    }
    return response.arrayBuffer();
  }

  getApplicationIdentifier(): string {
    return 'MyAppId';
  }
}

class MyNodesApiClient implements NodesApiClient {
  mapTreeIndicesToNodeIds(modelId: number, revisionId: number, treeIndices: number[]): Promise<number[]> {
    // Map 1:1 - pretend treeIndices == nodeIds
    return Promise.resolve(treeIndices);
  }
  mapNodeIdsToTreeIndices(modelId: number, revisionId: number, nodeIds: number[]): Promise<number[]> {
    // Map 1:1 - pretend treeIndices == nodeIds
    return Promise.resolve(nodeIds);
  }
  determineTreeIndexAndSubtreeSizesByNodeIds(modelId: number, revisionId: number, nodeIds: number[]): Promise<{treeIndex: number; subtreeSize: number }[]> {
    throw new Error('Not supported.');
  }
  determineNodeAncestorsByNodeId(modelId: number, revisionId: number, nodeId: number, generation: number): Promise<{treeIndex: number; subtreeSize: number }> {
    throw new Error('Not supported.');
  }
  getBoundingBoxByNodeId(modelId: number, revisionId: number, nodeId: number, box?: THREE.Box3): Promise<THREE.Box3> {
    throw new Error('Not supported.');
  }
}

window.THREE = THREE;
(window as any).reveal = reveal;

export function CustomDataSource() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let viewer: Cognite3DViewer;

    async function main() {
      let viewerOptions: Cognite3DViewerOptions = {
        sdk: undefined as unknown as CogniteClient,
        customDataSource: new MyDataSource(),
        domElement: canvasWrapperRef.current!,
        logMetrics: false
      };
      
      // Prepare viewer
      viewer = new Cognite3DViewer(viewerOptions);
      // ModelID + revisionID doesn't really matter here as we've
      // hardcoded the behavior in MyDataSource
      const model = await viewer.addCadModel({modelId: 42, revisionId: 78});
      viewer.fitCameraToModel(model);

      (window as any).viewer = viewer;
    }


    main();

    return () => {
      viewer?.dispose();
    };
  });
  return <CanvasWrapper ref={canvasWrapperRef} />;
}
