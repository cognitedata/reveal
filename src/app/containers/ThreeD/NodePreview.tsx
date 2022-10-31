import React from 'react';
import { Button, Flex, Icon } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';

import styled from 'styled-components';

type Props = {
  assetId: number;
  closePreview: () => void;
  openDetails: () => void;
};
export default function NodePreview({
  assetId,
  closePreview,
  openDetails,
}: Props) {
  const { data: assetInfo, isFetching } = useCdfItem<Asset>('assets', {
    id: assetId,
  });
  return (
    <Wrapper direction="column">
      <Flex gap={10} alignItems="center">
        <div style={{ flexGrow: 1, fontWeight: 500 }}>
          {isFetching ? <Icon type="Loader" /> : assetInfo?.name}
        </div>
        <Button icon="Close" onClick={() => closePreview()} />
        <Button icon="Expand" onClick={() => openDetails()} />
      </Flex>

      <Flex>
        <ul>
          {assetInfo &&
            Object.entries(assetInfo).map(([key, value], i) => (
              <li key={i}>{`${key} - ${value}`}</li>
            ))}
        </ul>
      </Flex>
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  padding: 10px;
  background-color: white;
  height: 100%;
  overflow: hidden;
`;
