import styled from 'styled-components/macro';

import { Flex, sizes } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';

export const ColumnNotificationText = styled(Flex)`
  font-size: 10px;
  font-weight: 500;
  line-height: 14px;
  height: ${SCALE_BLOCK_HEIGHT}px;
  width: 100%;
  overflow: break-word;
  white-space: break-spaces;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: ${sizes.small};
  letter-spacing: 0.01em;
  font-feature-settings: 'ss04' on;
`;
