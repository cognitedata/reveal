import { CogniteClient } from '@cognite/sdk-v5';
import useThreeDMappingsQuery from 'hooks/useQuery/useThreeDMappingsQuery';
import { useEffect, useRef, useState } from 'react';
import {
  AddModelOptions,
  AssetNodeCollection,
  Cognite3DModel,
  Cognite3DViewer,
  CadIntersection,
  NodeOutlineColor,
  THREE,
} from '@cognite/reveal';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import styled from 'styled-components';
import StatusMessage from 'components/utils/StatusMessage';
import uniqueId from 'lodash/uniqueId';

import { usePossibleTenant } from '../../../hooks';
import sidecar from '../../../utils/sidecar';

export type ThreeDPreviewProps = {
  assetId: number;
  applyGeometryFilter?: boolean;
  onNodeClick?: (intersect: CadIntersection) => Promise<number | null>;
};

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  .reveal-viewer-spinner {
    display: none;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--cogs-text-color);
    background: var(--cogs-white);
  }
`;

const ThreeDPreview = ({
  assetId,
  applyGeometryFilter,
  onNodeClick,
}: ThreeDPreviewProps) => {
  const tenant = usePossibleTenant();
  const containerId = `reveal-container-${uniqueId()}`;
  const { client, authState } = useCDFExplorerContext();
  const { data: mappings, isLoading } = useThreeDMappingsQuery([assetId]);
  const revealViewer = useRef<Cognite3DViewer>();
  const [isRevealReady, setRevealReady] = useState(false);
  const [sdkClient, setSdkClient] = useState<CogniteClient>();

  useEffect(() => {
    const domElement = document.getElementById(containerId);
    if (!domElement) {
      return;
    }
    if (revealViewer.current) return;

    // The 3D viewer uses the sdk v5 that's why we need this.
    // the package should be updated to use sdk v7
    const sdkClient = new CogniteClient({
      appId: sidecar.applicationId,
      baseUrl: sidecar.digitalCockpitApiBaseUrl,
    });

    sdkClient.loginWithOAuth({
      type: 'CDF_OAUTH',
      options: {
        project: tenant,
        accessToken: authState?.token,
        onAuthenticate: (login) => {
          login.skip();
        },
      },
    });

    setSdkClient(sdkClient);
    revealViewer.current = new Cognite3DViewer({
      sdk: sdkClient,
      domElement,
    });

    setRevealReady(true);
  }, []);

  useEffect(() => {
    if (!isRevealReady) return;
    if (isLoading) {
      return;
    }
    loadModel();
  });

  const loadModel = async () => {
    if (!sdkClient) {
      return;
    }
    if (!revealViewer.current) {
      return;
    }
    if (!mappings || mappings.length === 0) {
      return;
    }
    const mapping = mappings[0];
    const options: AddModelOptions = {
      modelId: mapping.modelId,
      revisionId: mapping.revisionId,
    };
    if (applyGeometryFilter) {
      const node = await client.revisions3D
        .list3DNodes(mapping.modelId, mapping.revisionId, {
          nodeId: mapping.nodeId,
        })
        .then((res) => res.items[0]);
      if (node.boundingBox) {
        options.geometryFilter = {
          boundingBox: new THREE.Box3(
            new THREE.Vector3(...node.boundingBox.min),
            new THREE.Vector3(...node.boundingBox.max)
          ).expandByScalar(8),
        };
      }
    }
    const model = (await revealViewer.current.addModel(
      options
    )) as Cognite3DModel;
    revealViewer.current.setBackgroundColor(new THREE.Color(0xffffff));

    const selectedAssetNode = new AssetNodeCollection(sdkClient, model);
    selectedAssetNode.executeFilter({ assetId });
    model.setDefaultNodeAppearance({
      color: [10, 10, 10],
    });
    model.assignStyledNodeCollection(selectedAssetNode, {
      color: [255, 255, 255],
      renderInFront: true,
      outlineColor: NodeOutlineColor.Cyan,
    });

    const box = await model.getBoundingBoxByNodeId(mapping.nodeId);

    revealViewer.current!.fitCameraToBoundingBox(box, 500, 16);
    if (onNodeClick) {
      revealViewer.current.on('click', async (e) => {
        const intersection =
          await revealViewer.current!.getIntersectionFromPixel(
            e.offsetX,
            e.offsetY
          );

        if (intersection) {
          const nextAssetId = await onNodeClick(
            intersection as CadIntersection
          );
          if (nextAssetId) {
            selectedAssetNode.clear();
            selectedAssetNode.executeFilter({ assetId: nextAssetId });
          }
        }
      });
    }
  };

  const renderOverlay = () => {
    if (!mappings || mappings?.length === 0) {
      return (
        <div className="overlay">
          <StatusMessage
            type="Missing.3D"
            message="We could not find a 3D model link to this asset"
          />
        </div>
      );
    }
    return null;
  };
  return (
    <Wrapper>
      <div id={containerId} style={{ height: '100%', width: '100%' }} />
      {renderOverlay()}
    </Wrapper>
  );
};

export default ThreeDPreview;
