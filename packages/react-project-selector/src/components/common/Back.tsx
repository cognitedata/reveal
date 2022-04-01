import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import { Box, Flex } from './index';

interface BackProps {
  to: string;
}

const Back = ({ to }: BackProps) => {
  const history = useHistory();

  return (
    <Wrapper pl={32} pb={10}>
      <div
        onClick={() => history.push(to)}
        onKeyPress={() => history.push(to)}
        role="button"
        tabIndex={0}
      >
        <Flex direction="row" items="center">
          <Icon type="ArrowLeft" />
          <Box ml={20}>Back</Box>
        </Flex>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  border-bottom: 1px solid #d9d9d9;
  cursor: pointer;
  :hover {
    color: #6e85fc;
  }
`;

export default Back;
