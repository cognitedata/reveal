import { Collapse, Title } from '@cognite/cogs.js';

import { useAssetsByIdQuery } from '@data-exploration-lib/domain-layer';
import { ResourceDetailsTemplate } from '@data-exploration/components';
import React, { FC, useMemo } from 'react';
import { AssetInfo } from '../../Info';

interface Props {
  assetId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const AssetDetails: FC<Props> = ({
  assetId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  return (
    <ResourceDetailsTemplate
      title={asset ? asset.name : ''}
      icon="Assets"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <Collapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="details" header={<h4>Details</h4>}>
          {asset ? (
            <AssetInfo asset={asset} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Assets</h4>}>test 2</Collapse.Panel>
      </Collapse>
    </ResourceDetailsTemplate>
  );
};
