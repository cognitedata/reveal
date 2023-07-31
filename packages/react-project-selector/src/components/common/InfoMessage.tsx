import React, { ReactNode } from 'react';
import { useLocalStorageState } from 'use-local-storage-state';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Flex, Text, Box } from './index';

interface InfoMessageProps {
  id: string;
  title?: string;
  details: string | ReactNode;
}

const InfoMessage = ({ id, title, details }: InfoMessageProps) => {
  const [closed, setClosed] = useLocalStorageState(
    `infoMessage:closed/${id}`,
    'no'
  );

  const closeInfoMessage = () => setClosed('yes');

  if (closed === 'yes') return null;

  return (
    <Wrapper p={15}>
      <Flex direction="row">
        <Box pr={10} pt={3}>
          <Icon type="InfoFilled" />
        </Box>
        <Flex direction="column">
          {title && (
            <Box mb={5}>
              <Text weight={500} size={15}>
                {title}
              </Text>
            </Box>
          )}
          <Text color="#595959">{details}</Text>
        </Flex>
        <Box pl={10} pt={3} cursor="pointer" onClick={closeInfoMessage}>
          <Icon type="Close" />
        </Box>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  background-color: #f6f9ff;
`;

export default InfoMessage;
