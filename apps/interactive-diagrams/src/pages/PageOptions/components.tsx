import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { Flex } from 'components/Common';

export const Card = styled.div`
  padding: 8px;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  border-radius: 8px;
  margin: 8px;
`;

export const OptionWrapper = styled(Flex)`
  padding: 0 24px 24px 24px;
  flex-direction: column;
`;

export const SkipSettings = styled.div`
  border-radius: 8px;
  align-items: flex-start;
  background-color: #f6f7ff;
  padding: 16px;
  margin-left: 16px;
  width: 100%;
  max-width: 400px;
  align-self: flex-start;
`;
