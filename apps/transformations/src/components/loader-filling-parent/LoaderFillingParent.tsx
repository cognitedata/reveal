import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

type LoaderFillingParentProps = {
  backgroundColor?: string;
};

const LoaderFillingParent = ({
  backgroundColor,
}: LoaderFillingParentProps): JSX.Element => {
  return (
    <StyledContainer $backgroundColor={backgroundColor}>
      <Icon type="Loader" />
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ $backgroundColor?: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor ?? Colors['surface--muted']};
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export default LoaderFillingParent;
