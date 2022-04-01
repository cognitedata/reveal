import React, { useContext } from 'react';
import { Icon, Avatar } from '@cognite/cogs.js';
import styled from 'styled-components';

import LoginContext from '../../context';
import { Box, Flex, Text } from '../common/index';

interface ConnectedHeaderProps {
  user?: {
    displayName: string;
    mail: string;
  };
}

const ConnectedHeader: React.FC<ConnectedHeaderProps> = ({
  user,
}: ConnectedHeaderProps) => {
  const { cluster, clusters } = useContext(LoginContext);

  const clusterLabel = clusters
    .reduce<any[]>((acc, v) => [...acc, ...v.options], [])
    .find((c) => c.value === cluster)?.label;

  return (
    <Wrapper p={32}>
      <Flex direction="column">
        <Box mb={5}>
          <Flex direction="row">
            <Box flex={1}>Welcome</Box>
            <Box>{clusterLabel}</Box>
          </Flex>
        </Box>
        <Flex direction="row" items="center">
          <Box flex={1}>
            <Flex direction="row" items="center">
              <Box mr={10}>
                <Avatar maxLength={2} text={user?.displayName ?? 'Unknown'} />
              </Box>
              <Flex direction="column">
                <Box>
                  <Text color="white">{user?.displayName}</Text>
                </Box>
                <Box>
                  <Text color="#d3d3d3">{user?.mail}</Text>
                </Box>
              </Flex>
            </Flex>
          </Box>
          {false && (
            <Box cursor="pointer">
              <Icon type="EllipsisHorizontal" />
            </Box>
          )}
        </Flex>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  color: white;
  background: rgb(20, 20, 20);
  background: linear-gradient(
    0deg,
    rgba(20, 20, 20, 1) 0%,
    rgba(31, 31, 31, 1) 50%,
    rgba(31, 31, 31, 1) 100%
  );
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

export default ConnectedHeader;
