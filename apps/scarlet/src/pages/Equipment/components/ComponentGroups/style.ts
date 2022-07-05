import styled from 'styled-components';
import { SegmentedControl } from '@cognite/cogs.js';

export const SegmentedControlButton = styled(SegmentedControl.Button)`
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
