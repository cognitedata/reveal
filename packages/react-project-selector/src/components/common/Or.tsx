import React from 'react';
import styled from 'styled-components';

import { Flex, Text } from './index';

const Or: React.FC = () => {
  return (
    <Flex direction="row" items="center" gap={10}>
      <Line />
      <div>
        <Text color="dfdfdf">OR</Text>
      </div>
      <Line />
    </Flex>
  );
};

const Line = styled.div`
  border-bottom: 1px solid #c5c5c5;
  flex: 1;
`;

export default Or;
