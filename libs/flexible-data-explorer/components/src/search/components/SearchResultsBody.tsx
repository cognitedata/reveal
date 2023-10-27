import { PropsWithChildren } from 'react';

import styled from 'styled-components';

interface Props {
  noShadow?: boolean;
}
export const SearchResultsBody: React.FC<PropsWithChildren<Props>> = ({
  children,
  noShadow,
}) => {
  return <Container noShadow={noShadow}>{children}</Container>;
};

const Container = styled.div<{ noShadow?: boolean }>`
  border-radius: 10px;
  background-color: white;
  padding: 8px 0;

  box-shadow: ${(props) =>
    props.noShadow
      ? 'none'
      : ' 0px 1px 8px rgba(79, 82, 104, 0.06), 0px 1px 1px rgba(79, 82, 104, 0.1)'};

  & > * {
    border-bottom: 1px solid #ebeef7;

    &:last-child {
      border-bottom: none;
    }
  }
`;
