import styled from 'styled-components';

import uniqolor from 'uniqolor';

import { Chip, Colors, Flex, Icon } from '@cognite/cogs.js';

const getColor = (key: string) => uniqolor(key);

export const NodeWrapper = styled.div<{ __typename: string }>`
  padding: 8px;
  border-radius: 4px;
  background: #fff;
  width: 160px;
  transform: translate(-50%, -50%);
  border: ${(props) => `1px solid ${getColor(props.__typename).color}`};

  #title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
export const NodeChip = styled(Chip)<{ __typename: string }>`
  &&&& {
    position: absolute;
    bottom: 100%;
    font-size: 12px;
    left: 0px;
    min-height: auto;
    background-color: ${(props) => `${getColor(props.__typename).color}`};
  }
`;

export const NodeVisibleIcon = (
  <Flex
    alignItems="center"
    style={{
      color: Colors['surface--status-success--strong--default'],
    }}
  >
    <Icon type="EyeShow" />
  </Flex>
);
