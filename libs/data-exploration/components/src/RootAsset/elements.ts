import styled from 'styled-components/macro';

import { Chip } from '@cognite/cogs.js';

export const RootAssetLabel = styled.div`
  max-width: 100%;
  overflow: hidden;

  text-align: left;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadingLabel = styled(Chip)`
  background: none !important;
`;

export const RootAssetButtonWrapper = styled.div`
  max-width: 100%;
  padding: 8px 12px 8px 12px;
  gap: 4px;
  align-items: center;

  && {
    justify-content: unset;
  }
`;
