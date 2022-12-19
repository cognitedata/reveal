import { Label } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

const DEFAULT_MAX_WIDTH = 80;

export const RootAssetLabel = styled.div`
  max-width: ${(props: { maxwidth?: number }) =>
    props.maxwidth || DEFAULT_MAX_WIDTH}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadingLabel = styled(Label)`
  background: none !important;
`;
