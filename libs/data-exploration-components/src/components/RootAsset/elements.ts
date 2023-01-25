import { Label } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const RootAssetLabel = styled.div`
  max-width: 100%;
  overflow: hidden;

  text-align: left;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadingLabel = styled(Label)`
  background: none !important;
`;

export const RootAssetButtonWrapper = styled.div`
  max-width: 100%;
  padding: 8px 12px 8px 12px;
  gap: 4px;

  && {
    justify-content: unset;
  }
`;
