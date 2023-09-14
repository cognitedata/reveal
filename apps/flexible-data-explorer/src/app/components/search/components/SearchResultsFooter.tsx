import { PropsWithChildren } from 'react';

import styled from 'styled-components';

interface Props {
  empty?: boolean;
}

export const SearchResultsFooter: React.FC<PropsWithChildren<Props>> = ({
  children,
}) => {
  return <Container>{children}</Container>;
};

const Container = styled.div`
  display: flex;
  padding: 16px;
  gap: 16px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
