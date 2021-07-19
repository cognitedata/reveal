import React, { useState } from 'react';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { Asset } from '@cognite/sdk';
import AssetSearchHit from './AssetSearchHit';

type Props = {
  viewType: 'assets' | 'timeseries';
};

const RecentlyViewed = ({ viewType }: Props) => {
  const [rvAssets, setRvAssets] = useState<Asset[]>([]);
  const FIFO = () => {};
  return (
    <TopTextWrapper>
      <Icon type="History" size={20} />
      {viewType === 'assets' && (
        <>
          <Title level={4}>Recently viewed tags / assets</Title>
          {rvAssets.map((asset) => (
            <li key={asset.id}>
              <AssetSearchHit asset={asset} />
            </li>
          ))}
        </>
      )}
      {viewType === 'timeseries' && (
        <Title level={4}>Recently viewed time series</Title>
      )}
    </TopTextWrapper>
  );
};

const TopTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1em;
  margin: 15px 28px 20px 28px;
`;

export default RecentlyViewed;
