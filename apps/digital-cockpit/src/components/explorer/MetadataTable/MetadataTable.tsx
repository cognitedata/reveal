import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import startCase from 'lodash/startCase';
import { CSSProperties } from 'react';

import { ListWraper, TableWrapper } from './elements';

export type MetadataTableProps = {
  assetId: number;
  asTable?: boolean;
  style?: CSSProperties;
  filter?: string;
};

const MetadataTable = ({
  assetId,
  asTable,
  style,
  filter,
}: MetadataTableProps) => {
  const { data: asset } = useAssetRetrieveQuery([{ id: assetId }]);
  const currentAsset = asset?.[0];

  if (!asset) {
    return null;
  }

  const fields = Object.keys(currentAsset?.metadata || {}).filter((key) => {
    if (!filter) {
      return true;
    }
    return key.includes(filter);
  });
  if (asTable) {
    return (
      <TableWrapper style={style}>
        {fields.map((field) => (
          <tr className="row" key={field}>
            <td className="field">{startCase(field)}</td>
            <td className="value">{currentAsset?.metadata?.[field]}</td>
          </tr>
        ))}
      </TableWrapper>
    );
  }
  return (
    <ListWraper style={style}>
      {fields.map((field) => (
        <div className="row" key={field}>
          <span className="field">{startCase(field)}</span>
          <span className="value">{currentAsset?.metadata?.[field]}</span>
        </div>
      ))}
    </ListWraper>
  );
};

export default MetadataTable;
