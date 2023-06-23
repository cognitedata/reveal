import { PropsWithChildren } from 'react';

import styled from 'styled-components';

interface Props {
  empty?: boolean;
}
export const SearchResultsBody: React.FC<PropsWithChildren<Props>> = ({
  children,
  empty,
}) => {
  if (empty) {
    return null;
  }

  return <Container>{children}</Container>;
};

const Container = styled.div`
  border-radius: 10px;
  background-color: white;
  padding: 8px 0;
  box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
    0px 1px 1px rgba(79, 82, 104, 0.1);

  & > * {
    border-bottom: 1px solid #ebeef7;

    &:last-child {
      border-bottom: none;
    }
  }
`;
