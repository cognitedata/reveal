import React from 'react';
import {
  Button,
  Colors,
  Detail,
  Flex,
  Icon,
  Menu,
  Overline,
} from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';

import styled from 'styled-components';
import {
  ResourceType,
  useRelatedResourceCounts,
} from '@cognite/data-exploration';

export type ResourceTabType = 'details' | ResourceType;

type Details = {
  detailTypeKey: ResourceTabType;
  detailType: string;
  count: string | undefined;
};

type Props = {
  assetId: number;
  closePreview: () => void;
  openDetails: (tab?: ResourceTabType) => void;
};

const DetailsMenuItem = ({
  details,
  openDetails,
}: {
  details: Details;
  openDetails: (tab?: ResourceTabType) => void;
}) => (
  <StyledDetailElement
    type="ghost"
    key={details.detailTypeKey}
    onClick={() => {
      openDetails(details.detailTypeKey);
    }}
  >
    <Flex
      justifyContent="space-between"
      alignItems="center"
      style={{ width: '100%' }}
    >
      <StyledDetail>{details.detailType}</StyledDetail>
      <Flex alignItems="center">
        <StyledCount>
          <StyledDiv>{details.count}</StyledDiv>
        </StyledCount>
        <Icon type="ChevronRight" />
      </Flex>
    </Flex>
  </StyledDetailElement>
);

export default function NodePreview({
  assetId,
  closePreview,
  openDetails,
}: Props) {
  const { data: assetInfo, isFetching } = useCdfItem<Asset>('assets', {
    id: assetId,
  });

  const parentResource = {
    type: 'asset',
    id: assetId,
    externalId: assetInfo?.externalId,
  };

  const { counts } = useRelatedResourceCounts(parentResource);

  let assetCount = counts.asset || '0';
  const assetCountWithoutSeparator = assetCount.split(',').join('');
  let parsedAssetCount = parseInt(assetCountWithoutSeparator, 10);
  parsedAssetCount = Number.isNaN(parsedAssetCount) ? 0 : parsedAssetCount;
  parsedAssetCount = Math.max(parsedAssetCount - 1, 0);
  assetCount = parsedAssetCount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const details: Array<Details> = [
    {
      detailTypeKey: 'asset',
      detailType: 'Assets',
      count: assetCount,
    },
    {
      detailTypeKey: 'timeSeries',
      detailType: 'Timeseries',
      count: counts.timeSeries,
    },
    {
      detailTypeKey: 'file',
      detailType: 'Files',
      count: counts.file,
    },
    {
      detailTypeKey: 'event',
      detailType: 'Events',
      count: counts.event,
    },
  ];

  return (
    <Wrapper>
      <Flex gap={10} alignItems="center">
        <div style={{ flexGrow: 1, fontWeight: 500 }}>
          {isFetching ? <Icon type="Loader" /> : assetInfo?.name}
        </div>
        <Button icon="Close" type="ghost" onClick={() => closePreview()} />
      </Flex>
      <div>
        <StyledOverline>
          {assetInfo?.description || 'No description'}
        </StyledOverline>
      </div>
      <Menu.Divider />
      <Flex alignItems="center" direction="column">
        {details.map(detail => (
          <DetailsMenuItem
            key={detail.detailTypeKey}
            details={detail}
            openDetails={() => openDetails(detail.detailTypeKey)}
          />
        ))}
      </Flex>
      <Menu.Divider />
      <Flex
        gap={10}
        justifyContent="flex-end"
        style={{ marginTop: 'auto', padding: '1rem 0 0.5rem 0' }}
      >
        <StyledButton
          type="ghost"
          onClick={() => {
            closePreview();
          }}
        >
          Cancel
        </StyledButton>
        <StyledButton type="tertiary" onClick={() => openDetails()}>
          Details
        </StyledButton>
      </Flex>
    </Wrapper>
  );
}

const StyledButton = styled(Button)`
  padding: 7px;
  height: 27px;
`;

const StyledDiv = styled.div`
  align-items: center;
`;

const StyledDetail = styled(Detail)`
  font-weight: 500;
`;

const StyledCount = styled.div`
  margin-right: 0.5rem;
  border-radius: 3px;
  height: 21px;
  min-width: 25px;
  padding: 0 0.3rem 0 0.3rem;
  background-color: ${Colors['border--interactive--disabled']};
`;

const StyledOverline = styled(Overline)`
  margin-bottom: 1.2rem;
  color: ${Colors['text-icon--medium']};
  font-weight: 400;
`;

const StyledDetailElement = styled(Menu.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 0px;
  padding-left: 0rem;
  padding-right: 0rem;
  :hover {
    cursor: pointer;
  }
`;

const Wrapper = styled(Menu)`
  background-color: white;
  height: auto;
  width: 300px;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 10px;
`;
