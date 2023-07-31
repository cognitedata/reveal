import styled from 'styled-components/macro';

import { Center, Flex, sizes } from 'styles/layout';

import { BodyColumnBody } from '../../../common/Events/elements';

export const ColumnActionWrapper = styled(BodyColumnBody)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ChartColumBodyFlex = styled(Flex)`
  width: 100%;
  height: 100%;
`;

export const ChartActionMessage = styled(Center)`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  padding: ${sizes.extraSmall};
  margin: auto;
  margin-bottom: 0;
  overflow: break-word;
  white-space: break-spaces;
`;

export const ChartActionButtonWrapper = styled.div`
  margin: auto;
  margin-top: ${sizes.extraSmall};
  button {
    width: fit-content;
    font-size: 12px;
  }
`;
