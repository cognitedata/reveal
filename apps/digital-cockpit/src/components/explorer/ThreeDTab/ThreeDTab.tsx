import { CadIntersection } from '@cognite/reveal-v2';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

import ThreeDPreview from '../ThreeDPreview';

export type ThreeDCardProps = {
  assetId: number;
};

const ThreeDCard = ({ assetId }: ThreeDCardProps) => {
  const { client } = useCDFExplorerContext();
  const onNodeClick = async (intersect: CadIntersection) => {
    const { modelId, revisionId } = intersect.model;

    const mapping = await client.assetMappings3D
      .filter(modelId, revisionId, {
        filter: {
          treeIndexes: [intersect.treeIndex],
        },
      })
      .then((res) => res.items[0]);
    if (!mapping) {
      return null;
    }
    const asset = await client.assets
      .retrieve([{ id: mapping.assetId }])
      .then((res) => res[0]);
    return asset.id;
  };

  return <ThreeDPreview assetId={assetId} onNodeClick={onNodeClick} />;
};

export default ThreeDCard;
