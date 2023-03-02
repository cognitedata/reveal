import React from 'react';
import {
  Button,
  Colors,
  Detail,
  Divider,
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
  count: number | undefined;
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
    css={{}}
    key={details.detailTypeKey}
    type="ghost"
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

  const { counts } = useRelatedResourceCounts(parentResource as any);

  const details: Array<Details> = [
    {
      detailTypeKey: 'asset',
      detailType: 'Assets',
      count: counts.asset,
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
      <StyledAssetInfo>
        <StyledAssetName>
          {isFetching ? <Icon type="Loader" /> : assetInfo?.name}
        </StyledAssetName>
        <StyledOverline>
          {assetInfo?.description || 'No description'}
        </StyledOverline>
      </StyledAssetInfo>
      <Divider />
      <Flex alignItems="center" direction="column">
        {details.map((detail) => (
          <DetailsMenuItem
            key={detail.detailTypeKey}
            details={detail}
            openDetails={() => openDetails(detail.detailTypeKey)}
          />
        ))}
      </Flex>
      <Divider />
      <Flex
        gap={10}
        justifyContent="flex-end"
        style={{ marginTop: 'auto', padding: '4px 0 0 0' }}
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
const StyledAssetName = styled.div`
  font-weight: 500;
`;

const StyledAssetInfo = styled.div`
  padding: 6px 8px 12px 8px;
`;

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
  color: ${Colors['text-icon--medium']};
  font-weight: 400;
  font-size: 13px;
`;

const StyledDetailElement = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 0px;
  padding-left: 8px;
  padding-right: 8px;
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
