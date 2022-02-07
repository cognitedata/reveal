import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import startCase from 'lodash/startCase';

import { WrapperTable } from './elements';

export type MetadataTableProps = {
  assetId: number;
};

const MetadataTable = ({ assetId }: MetadataTableProps) => {
  const { data: asset } = useAssetRetrieveQuery([{ id: assetId }]);
  const currentAsset = asset?.[0];

  if (!asset) {
    return null;
  }

  const fields = Object.keys(currentAsset?.metadata || {});
  return (
    <WrapperTable>
      {fields.map((field) => (
        <div className="row" key={field}>
          <span className="field">{startCase(field)}</span>
          <span className="value">{currentAsset?.metadata?.[field]}</span>
        </div>
      ))}
    </WrapperTable>
  );
};

export default MetadataTable;
