import styled from 'styled-components';

import { Colors, Detail, Flex, Icon } from '@cognite/cogs.js';

type Props = {
  errorMessage: string;
};

export const ErrorMessage = (props: Props): JSX.Element => {
  const { errorMessage } = props;
  return (
    <Wrapper direction="row" alignItems="center">
      <WarningIcon />
      <StyledDetail>{errorMessage}</StyledDetail>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  margin-top: 4px;
  *:not(:last-child) {
    margin-right: 6px;
  }
`;

const StyledDetail = styled(Detail)`
  color: ${Colors['text-icon--status-critical']};
`;

const WarningIcon = styled(Icon).attrs({ type: 'WarningTriangle', size: 12 })`
  color: ${Colors['text-icon--status-critical']};
`;
