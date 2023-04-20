import styled from 'styled-components';
import { Flex, Icon, Chip } from '@cognite/cogs.js';
import { Asset, CogniteClient } from '@cognite/sdk';
import {
  ContainerType,
  TableItem,
  TableContainerProps,
} from '@cognite/unified-file-viewer';
import { TimeDisplay } from '@data-exploration/components';

const getAsset = async (
  client: CogniteClient,
  assetId: number
): Promise<Asset> => {
  const assets = await client.assets.retrieve([{ id: assetId }]);
  if (assets.length !== 1) {
    throw Error('There must be exactly one unique asset for an asset id');
  }
  return assets[0];
};

const getAssetTableItems = (asset: Asset): TableItem[] => {
  return [
    { label: 'Name', value: asset.name },
    { label: 'Description', value: asset.description },
    { label: 'ID', value: asset.id },
    { label: 'External ID', value: asset.externalId },
    {
      label: 'Created at',
      value: <TimeDisplay value={asset.createdTime.getTime()} />,
    },
    {
      label: 'Updated at',
      value: <TimeDisplay value={asset.lastUpdatedTime.getTime()} />,
    },
    {
      label: 'Labels',
      value: asset.labels?.map(({ externalId }) => (
        <LabelWrapper wrap="wrap" gap={8} justifyContent="flex-end">
          <Chip
            type="default"
            label={externalId}
            key={externalId}
            size="small"
          />
        </LabelWrapper>
      )),
    },
    { label: 'Source', value: asset.source },
  ];
};

const getAssetTableContainerConfig = async (
  client: CogniteClient,
  props: Omit<TableContainerProps, 'type' | 'items'>,
  { assetId }: { assetId: number }
): Promise<TableContainerProps> => {
  try {
    const asset = await getAsset(client, assetId);
    return {
      ...props,
      title: (
        <TitleWrapper>
          <ColoredIcon type="Assets" /> {}
          {asset.name}
        </TitleWrapper>
      ),
      type: ContainerType.TABLE,
      items: getAssetTableItems(asset),
      isLoading: false,
    };
  } catch (error) {
    return {
      ...props,
      type: ContainerType.TABLE,
      items: [],
      isLoading: false,
      isError: true,
    };
  }
};

const ColoredIcon = styled(Icon)`
  color: #4a67fb;
  position: relative;
  margin-right: 8px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LabelWrapper = styled(Flex)`
  margin-bottom: 8px;
`;

export default getAssetTableContainerConfig;
