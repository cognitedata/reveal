import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

export interface LoaderProps {
  isLoading?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <Wrapper>
      <Icon type="Loader" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  top: calc(50% - 8px);
  right: 8px;
`;
